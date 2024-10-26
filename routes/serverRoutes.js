// routes/serverRoutes.js
const express = require('express');
const {
    createServer,
    getServersByOwner,
    getServerById,
    editServer,
    removeServer,
} = require('../controllers/serverController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new server
router.post('/', authMiddleware, createServer);

// Get all servers owned by the authenticated user
router.get('/', authMiddleware, getServersByOwner);

// Get a specific server by ID
router.get('/:server_id', authMiddleware, getServerById);

// Edit a server
router.put('/:server_id', authMiddleware, editServer);

// Remove a server
router.delete('/:server_id', authMiddleware, removeServer);

module.exports = router;
