const express = require('express');
const router = express.Router();
require('dotenv').config();
const supabase = require('../config/db');
const authMiddleware = require('../config/auth');

router.get('/', authMiddleware, async (req, res) => {
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
            .from('lists')
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
    const { user_id, name } = req.body;
    try{
        const { data, error } = await supabase
            .from('lists')
            .insert({ user_id, name })
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
        const { data: deletedList, error: deleteError } = await supabase
            .from('lists')
            .delete()
            .eq('id', id)
            .select();
        
        if (deleteError) {
            console.error(deleteError);
            return res.status(500).json({ error: deleteError.message });
        }
        
        if (!deletedList || deletedList.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }
        
        return res.status(200).json({ message: `List deleted successfully` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    };
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try{
        const { data: updatedList, error: updateError } = await supabase
            .from('lists')
            .update({ name })
            .eq('id', id)
            .select();
        
        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: updateError.message });
        }
        
        if (!updatedList || updatedList.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }
        
        return res.status(200).json({ updatedList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    };
});

module.exports = router; 
