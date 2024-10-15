const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function for email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 64;
};

// Helper function for username validation
const validateUsername = (username) => {
    const usernameRegex = /^[a-z0-9]+$/; // Only lowercase letters and numbers
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 16;
};

// Helper function for password validation
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*\W).{8,}$/;
    return passwordRegex.test(password);
};

exports.register = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Validate email
        if (!validateEmail(email)) {
            return res.status(400).json({ msg: 'email_invalid' });
        }

        // Validate username
        if (!validateUsername(username)) {
            return res.status(400).json({
                msg: 'username_invalid',
            });
        }

        // Validate password
        if (!validatePassword(password)) {
            return res.status(400).json({
                msg: 'password_invalid',
            });
        }

        // Check if the email is already in use
        let existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ msg: 'email_taken' });
        }

        // Check if the username is already taken
        existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ msg: 'username_taken' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create new user and return only relevant non-sensitive data
        const user = await User.create(email, username.toLowerCase(), passwordHash);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return only non-sensitive data (omit passwordHash, etc.)
        res.status(201).json({
            msg: 'success',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) return res.status(400).json({ msg: 'credentials_wrong' });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ msg: 'credentials_wrong' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'internal_server_error' });
    }
};
