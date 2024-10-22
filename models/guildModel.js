const pool = require('../config/db');

const Guild = {
    // Create a new guild
    create: async (name, owner_id) => {
        const query = `
            INSERT INTO guilds (name, owner_id)
            VALUES ($1, $2)
            RETURNING guild_id, name, owner_id, created_at;
        `;
        const values = [name, owner_id];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return the newly created guild
    },

    // Find guilds by owner_id
    findByOwnerId: async (owner_id) => {
        const query = `
            SELECT guild_id, name, owner_id, created_at
            FROM guilds
            WHERE owner_id = $1;
        `;
        const result = await pool.query(query, [owner_id]);
        return result.rows; // Return an array of guilds
    },

    // Find a guild by guild_id
    findById: async (guild_id) => {
        const query = `
            SELECT guild_id, name, owner_id, created_at
            FROM guilds
            WHERE guild_id = $1;
        `;
        const result = await pool.query(query, [guild_id]);
        return result.rows[0]; // Return the guild if found
    },
};

module.exports = Guild;
