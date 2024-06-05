const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Resumes route');
});

module.exports = router;