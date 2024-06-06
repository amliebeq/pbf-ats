const express = require('express');
const router = express.Router();
require('dotenv').config();
const supabase = require('../config/db');
const authMiddleware = require('../config/auth');

router.get('/', authMiddleware, async (req, res) => {
    console.log(req.user)
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', req.user.user_id)
            .maybeSingle();

        if (userError) {
            console.log(userError);
            res.status(500).send(userError);
            return;
        }

        const { data, error } = await supabase
            .from('jobs')
            .select()
            .eq('user_id', user.id);

        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            res.send(data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    };
});

router.post('/', authMiddleware, async (req, res) => {
    const { user_id, title, pay_rate, description, location, remote } = req.body;
    try{
        const { data, error } = await supabase
            .from('jobs')
            .insert({ user_id, title, pay_rate, description, location, remote })
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
    };
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try{
        const { data: deletedJob, error: deleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .select();
        
        if (deleteError) {
            console.error(deleteError);
            return res.status(500).json({ error: deleteError.message });
        }
        
        if (!deletedJob || deletedJob.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        return res.status(200).json({ message: `Job deleted successfully` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    };
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, pay_rate, description, location, remote } = req.body;
    try{
        const { data: updatedJob, error: updateError } = await supabase
            .from('jobs')
            .update({ title, pay_rate, description, location, remote })
            .eq('id', id)
            .select();
        
        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: updateError.message });
        }
        
        if (!updatedJob || updatedJob.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        return res.status(200).json({ updatedJob });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    };
});

module.exports = router;

