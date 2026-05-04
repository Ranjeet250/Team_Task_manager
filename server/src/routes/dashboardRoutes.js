const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboard } = require('../controllers/taskController');

const router = express.Router();

router.get('/', protect, getDashboard);

module.exports = router;
