const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: async (email, username, passwordHash) => {
        const query = `
            INSERT INTO users (email, username, password_hash)
            VALUES ($1, $2, $3) RETURNING id, email, username, created_at;
        `;
        const values = [email, username, passwordHash];
        const result = await pool.query(query, values);
        return result.rows[0]; // Only return non-sensitive data
    },

    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    findByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },
};

module.exports = User;
