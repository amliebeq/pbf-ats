const express = require('express');
const router = express.Router();
require('dotenv').config();
const supabase = require('../db');

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('applicants')
            .select();
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            res.send(data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }  
});

module.exports = router;