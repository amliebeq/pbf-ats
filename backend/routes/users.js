const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  { check, validationResult } = require('express-validator');
const authMiddleware = require('../config/auth');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const supabase = require('../config/db');

router.get('/', (req, res) => {
  res.send('Users route');
});

router.post('/register',[
    check ('email', 'Please include a valid email').isEmail(),
    check ('password', 'Please enter a password with 6 or more characters').isLength({min: 6}),
    ], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { first_name, last_name, email, password, company, job_title } = req.body;

    try {
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle();
        
        if (findError) {
            console.log(findError);
            return res.status(500).json({ error: findError.message });
        }
        
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ first_name, last_name, email, password_hash: hashedPassword, company, job_title })
            .select();
        
        if (insertError) {
            console.error(insertError);
            return res.status(500).json({ error: insertError.message });
        }
        
        if (!newUser || newUser.length === 0) {
            return res.status(500).json({ error: 'User registration failed' });
        }
        
        const newUserId = newUser[0].id;
        if (!newUserId) {
            return res.status(500).json({ error: 'User ID not found in response' });
        }

        const token = jwt.sign(
            { user_id: newUserId, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;