const pool = require('../config/db');

const Message = {
    // Create a new message
    create: async (content, channel_id, author_id) => {
        const query = `
            INSERT INTO messages (content, channel_id, author_id)
            VALUES ($1, $2, $3)
            RETURNING message_id, content, channel_id, author_id, created_at, updated_at;
        `;
        const values = [content, channel_id, author_id];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return the newly created message
    },

    // Find all messages in a specific channel
    findByChannelId: async (channel_id) => {
        const query = `
            SELECT message_id, content, channel_id, author_id, created_at, updated_at
            FROM messages
            WHERE channel_id = $1
            ORDER BY created_at ASC;
        `;
        const result = await pool.query(query, [channel_id]);
        return result.rows;
    },

    // Find a message by its ID
    findById: async (message_id) => {
        const query = `
            SELECT message_id, content, channel_id, author_id, created_at, updated_at
            FROM messages
            WHERE message_id = $1;
        `;
        const result = await pool.query(query, [message_id]);
        return result.rows[0];
    },

    // Update a message by its ID
    updateById: async (message_id, content) => {
        const query = `
            UPDATE messages
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE message_id = $2
            RETURNING message_id, content, channel_id, author_id, created_at, updated_at;
        `;
        const values = [content, message_id];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Delete a message by its ID
    deleteById: async (message_id) => {
        const query = `
            DELETE FROM messages
            WHERE message_id = $1
            RETURNING message_id;
        `;
        const result = await pool.query(query, [message_id]);
        return result.rows[0];
    },
};

module.exports = Message;
