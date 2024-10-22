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

    // Find all guilds
    findAll: async () => {
        const query = `
            SELECT guild_id, name, owner_id, created_at
            FROM guilds;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // Update guild details
    updateById: async (guild_id, name) => {
        const query = `
            UPDATE guilds
            SET name = $1
            WHERE guild_id = $2
            RETURNING guild_id, name, owner_id, created_at;
        `;
        const values = [name, guild_id];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return the updated guild
    },

    // Delete a guild by ID
    deleteById: async (guild_id) => {
        const query = `
            DELETE FROM guilds
            WHERE guild_id = $1
            RETURNING guild_id;
        `;
        const result = await pool.query(query, [guild_id]);
        return result.rows[0]; // Return the ID of the deleted guild, if found
    },
};

module.exports = Guild;
