const express = require('express');
const { createGuild, getGuildsByOwner, getGuildById } = require('../controllers/guildController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new guild
router.post('/', authMiddleware, createGuild);

// Get all guilds owned by the authenticated user
router.get('/', authMiddleware, getGuildsByOwner);

// Get a specific guild by ID
router.get('/:guild_id', authMiddleware, getGuildById);

module.exports = router;
