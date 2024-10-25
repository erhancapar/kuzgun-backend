// models/userModel.js
const pool = require('../config/db');

const User = {
    // Create a new user
    create: async (email, username, passwordHash) => {
        const query = `
            INSERT INTO users (email, username, password)
            VALUES ($1, $2, $3)
            RETURNING user_id, email, username, created_at;
        `;
        const values = [email, username, passwordHash];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return non-sensitive data
    },

    // Find a user by email without password
    findByEmail: async (email) => {
        const query = `
            SELECT user_id, email, username, created_at
            FROM users
            WHERE email = $1;
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // Find a user by username without password
    findByUsername: async (username) => {
        const query = `
            SELECT user_id, email, username, created_at
            FROM users
            WHERE username = $1;
        `;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },

    // Find a user by email including password
    findByEmailWithPassword: async (email) => {
        const query = `
            SELECT user_id, email, username, password, created_at
            FROM users
            WHERE email = $1;
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // Update user by ID
    updateById: async (user_id, updates) => {
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

        const query = `
            UPDATE users
            SET ${fields.join(', ')}
            WHERE user_id = $${index}
            RETURNING user_id, email, username, display_name, about_me, banner_url, avatar_url, banner_hex, online_status, status_emoji, status_text, status_timeout, is_2fa_enabled, accept_messages_from, created_at;
        `;
        values.push(user_id);

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Delete user by ID
    deleteById: async (user_id) => {
        const query = `
            DELETE FROM users
            WHERE user_id = $1;
        `;
        await pool.query(query, [user_id]);
    },
};

module.exports = User;
