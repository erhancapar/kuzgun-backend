const express = require('express');
const {
    createMessage,
    getMessagesByChannel,
    updateMessage,
    deleteMessage,
} = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new message
router.post('/', authMiddleware, createMessage);

// Get all messages in a channel
router.get('/channel/:channel_id', authMiddleware, getMessagesByChannel);

// Update a message
router.put('/:message_id', authMiddleware, updateMessage);

// Delete a message
router.delete('/:message_id', authMiddleware, deleteMessage);

module.exports = router;
