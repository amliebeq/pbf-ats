const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  { check, validationResult } = require('express-validator');
const authMiddleware = require('../config/auth');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const supabase = require('../config/db');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select();
        if (error) {
            throw error;
        }
        res.send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
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

router.post('/login', [
    check ('email', 'Please include a valid email').isEmail(), 
    check ('password', 'Please enter a password with 6 or more characters').isLength({min: 6}),],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const { data: user, error: findError } = await supabase
            .from('users')
            .select()
            .eq('email', email)
            .maybeSingle();

        if (findError) {
            console.log(findError);
            return res.status(500).json({ error: findError.message });
        }
        
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { user_id: user.id, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );
        
        return res.status(200).json({ token, user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/:user', authMiddleware, async (req, res) => {
    const { user } = req.params;
    try {
        const { data: deletedUser, error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', user)
            .select();
        
        if (deleteError) {
            console.error(deleteError);
            return res.status(500).json({ error: deleteError.message });
        }
        
        if (!deletedUser || deletedUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

router.put('/:user', authMiddleware, async (req, res) => {
    const { user } = req.params;
    const { first_name, last_name, email, company, job_title } = req.body;
    try {
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ first_name, last_name, email, company, job_title })
            .eq('id', user)
            .select();
        
        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: updateError.message });
        }
        
        if (!updatedUser || updatedUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ updatedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;