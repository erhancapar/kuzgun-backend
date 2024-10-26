// models/serverModel.js
const pool = require('../config/db');

const Server = {
    // Create a new server
    create: async (name, owner_id) => {
        const query = `
            INSERT INTO servers (name, owner_id)
            VALUES ($1, $2)
            RETURNING server_id, name, owner_id, created_at;
        `;
        const values = [name, owner_id];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return the newly created server
    },

    // Find a server by server_id
    findById: async (server_id) => {
        const query = `
            SELECT *
            FROM servers
            WHERE server_id = $1;
        `;
        const result = await pool.query(query, [server_id]);
        return result.rows[0]; // Return the server if found
    },

    // Find servers by owner_id
    findByOwnerId: async (owner_id) => {
        const query = `
            SELECT server_id, name, owner_id, created_at
            FROM servers
            WHERE owner_id = $1;
        `;
        const result = await pool.query(query, [owner_id]);
        return result.rows;
    },

    // Update server details
    updateById: async (server_id, updates) => {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        // Add updated_at field
        fields.push(`updated_at = NOW()`);

        const query = `
            UPDATE servers
            SET ${fields.join(', ')}
            WHERE server_id = $${index}
            RETURNING *;
        `;
        values.push(server_id);

        const result = await pool.query(query, values);
        return result.rows[0]; // Return the updated server
    },

    // Delete a server by ID
    deleteById: async (server_id) => {
        const query = `
            DELETE FROM servers
            WHERE server_id = $1
            RETURNING server_id;
        `;
        const result = await pool.query(query, [server_id]);
        return result.rows[0]; // Return the ID of the deleted server, if found
    },
};

module.exports = Server;
