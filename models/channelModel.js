const pool = require('../config/db');

const Channel = {
    // Create a new channel
    create: async (name, guild_id) => {
        const query = `
            INSERT INTO channels (name, guild_id)
            VALUES ($1, $2)
            RETURNING channel_id, name, guild_id, created_at;
        `;
        const values = [name, guild_id];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return the newly created channel
    },

    // Find all channels in a specific guild
    findByGuildId: async (guild_id) => {
        const query = `
            SELECT channel_id, name, guild_id, created_at
            FROM channels
            WHERE guild_id = $1;
        `;
        const result = await pool.query(query, [guild_id]);
        return result.rows; // Return an array of channels
    },

    // Find a channel by its ID
    findById: async (channel_id) => {
        const query = `
            SELECT channel_id, name, guild_id, created_at
            FROM channels
            WHERE channel_id = $1;
        `;
        const result = await pool.query(query, [channel_id]);
        return result.rows[0]; // Return the channel if found
    },
};

module.exports = Channel;
