const Message = require('../models/messageModel');

exports.createMessage = async (req, res) => {
    const { content, channel_id } = req.body;
    const author_id = req.user.id; // Assuming req.user is set by auth middleware

    try {
        if (!content || !channel_id) {
            return res.status(400).json({ msg: 'invalid_data' });
        }

        // Create the message
        const message = await Message.create(content, channel_id, author_id);

        res.status(201).json({
            msg: 'success',
            message,
        });
    } catch (error) {
        console.error('Create Message Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.getMessagesByChannel = async (req, res) => {
    const { channel_id } = req.params;

    try {
        // Retrieve messages in the channel
        const messages = await Message.findByChannelId(channel_id);

        res.json({
            messages,
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.updateMessage = async (req, res) => {
    const { message_id } = req.params;
    const { content } = req.body;
    const author_id = req.user.id;

    try {
        // Check if the message exists and belongs to the user
        const existingMessage = await Message.findById(message_id);
        if (!existingMessage) {
            return res.status(404).json({ msg: 'message_not_found' });
        }
        if (existingMessage.author_id !== author_id) {
            return res.status(403).json({ msg: 'forbidden' });
        }

        // Update the message
        const updatedMessage = await Message.updateById(message_id, content);

        res.json({
            msg: 'success',
            message: updatedMessage,
        });
    } catch (error) {
        console.error('Update Message Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.deleteMessage = async (req, res) => {
    const { message_id } = req.params;
    const author_id = req.user.id;

    try {
        // Check if the message exists and belongs to the user
        const existingMessage = await Message.findById(message_id);
        if (!existingMessage) {
            return res.status(404).json({ msg: 'message_not_found' });
        }
        if (existingMessage.author_id !== author_id) {
            return res.status(403).json({ msg: 'forbidden' });
        }

        // Delete the message
        const deletedMessage = await Message.deleteById(message_id);

        res.json({
            msg: 'success',
            message_id: deletedMessage.message_id,
        });
    } catch (error) {
        console.error('Delete Message Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};
