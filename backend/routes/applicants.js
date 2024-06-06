const express = require('express');
const router = express.Router();
require('dotenv').config();
const supabase = require('../config/db');
const authMiddleware = require('../config/auth');

router.get('/', authMiddleware, async (req, res) => {
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
    };
});

router.post('/', authMiddleware, async (req, res) => {
    const { user_id, first_name, last_name, phone_number, recent_job, email, job_id, list_id } = req.body;
    try{
        const { data, error } = await supabase
            .from('applicants')
            .insert({ user_id, first_name, last_name, phone_number, recent_job, email, job_id, list_id })
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
        const { data: deletedApplicant, error: deleteError } = await supabase
            .from('applicants')
            .delete()
            .eq('id', id)
            .select();
        
        if (deleteError) {
            console.error(deleteError);
            return res.status(500).json({ error: deleteError.message });
        }
        
        if (!deletedApplicant || deletedApplicant.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }
        
        return res.status(200).json({ message: `Applicant deleted successfully` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    };
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, recent_job, email, job_id, list_id } = req.body;
    try{
        const { data: updatedApplicant, error: updateError } = await supabase
            .from('applicants')
            .update({ first_name, last_name, phone_number, recent_job, email, job_id, list_id })
            .eq('id', id)
            .select();
        
        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: updateError.message });
        }
        
        if (!updatedApplicant || updatedApplicant.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }
        
        return res.status(200).json({ updatedApplicant });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    };
});

module.exports = router;