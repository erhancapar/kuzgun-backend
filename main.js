// main.js
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const guildRoutes = require('./routes/guildRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
