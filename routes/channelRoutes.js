// routes/channelRoutes.js
const express = require('express');
const {
    createChannel,
    getChannelsByGuild,
    getChannelById,
} = require('../controllers/channelController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new channel
router.post('/', authMiddleware, createChannel);

// Get all channels in a guild
router.get('/guild/:guild_id', authMiddleware, getChannelsByGuild);

// Get a specific channel by ID
router.get('/:channel_id', authMiddleware, getChannelById);

module.exports = router;
