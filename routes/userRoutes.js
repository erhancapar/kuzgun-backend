// routes/userRoutes.js
const express = require('express');
const { register, login, edit, remove } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Register new user
router.post('/register', register);

// Login existing user
router.post('/login', login);

// Edit existing user
router.post('/edit', authMiddleware, edit);

// Delete existing user
router.post('/remove', authMiddleware, remove);

module.exports = router;
