const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    // Create a new user
    create: async (email, username, passwordHash) => {
        const query = `
            INSERT INTO users (email, username, password_hash)
            VALUES ($1, $2, $3)
            RETURNING user_id, email, username, created_at;
        `;
        const values = [email, username, passwordHash];
        const result = await pool.query(query, values);
        return result.rows[0]; // Return only non-sensitive data
    },

    // Find a user by email without password hash
    findByEmail: async (email) => {
        const query = `
            SELECT user_id, email, username, display_name, is_email_verified, online_status, 
                   status_emoji, status_text, description, avatar_url, banner_url, banner_color, 
                   is_2fa_enabled, accept_messages_from, created_at
            FROM users
            WHERE email = $1;
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // Find a user by username without password hash
    findByUsername: async (username) => {
        const query = `
            SELECT user_id, email, username, display_name, is_email_verified, online_status, 
                   status_emoji, status_text, description, avatar_url, banner_url, banner_color, 
                   is_2fa_enabled, accept_messages_from, created_at
            FROM users
            WHERE username = $1;
        `;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },

    // Add this method to include password_hash when finding by email
    findByEmailWithPassword: async (email) => {
        const query = `
            SELECT user_id, email, username, password_hash, created_at
            FROM users
            WHERE email = $1;
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },
};

module.exports = User;
