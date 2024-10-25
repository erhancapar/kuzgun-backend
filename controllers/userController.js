const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Validate email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
};

// Validate username
const validateUsername = (username) => {
    const usernameRegex = /^[a-z0-9]+$/; // Only lowercase letters and numbers
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 32;
};

// Validate password
const validatePassword = (password) => {
    // Minimum 8 characters, at least one letter, one number and one special character
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*\W).{8,}$/;
    return passwordRegex.test(password);
};

const validateDisplayName = (display_name) => {
    const displayNameRegex = /^[a-zA-Z0-9\s]{0,32}$/;
    return displayNameRegex.test(display_name);
};

exports.register = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Validate input
        if (!validateEmail(email)) {
            return res.status(400).json({ msg: 'email_invalid' });
        }
        if (!validateUsername(username)) {
            return res.status(400).json({ msg: 'username_invalid' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ msg: 'password_invalid' });
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
        const saltRounds = 12; // Adjust as needed; 10-12 is common
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = await User.create(email, username.toLowerCase(), passwordHash);

        // Generate JWT token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Return response with token and user data
        res.status(201).json({
            msg: 'success',
            token,
            user: {
                id: user.user_id,
                email: user.email,
                username: user.username,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email including password
        const userWithPassword = await User.findByEmailWithPassword(email);
        if (!userWithPassword) {
            return res.status(400).json({ msg: 'credentials_wrong' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, userWithPassword.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'credentials_wrong' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: userWithPassword.user_id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // Prepare user data without sensitive information
        const user = {
            id: userWithPassword.user_id,
            email: userWithPassword.email,
            username: userWithPassword.username,
            created_at: userWithPassword.created_at,
        };

        res.json({
            msg: 'success',
            token,
            user,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.edit = async (req, res) => {
    const userId = req.user.id;
    const {
        email,
        username,
        password,
        display_name,
        about_me,
        banner_url,
        avatar_url,
        banner_hex,
        online_status,
        status_emoji,
        status_text,
        status_timeout,
        is_2fa_enabled,
        accept_messages_from,
    } = req.body;

    try {
        // Build an object of fields to update
        let updates = {};

        // Check if such user exists
        if (!(await User.findById(req.user.id))) {
            console.log(await User.findById(req.user.id));
            return res.status(400).json({ msg: 'no_such_user' });
        }

        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({ msg: 'email_invalid' });
            }
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.user_id !== userId) {
                return res.status(400).json({ msg: 'email_taken' });
            }
            updates.email = email;
        }

        if (username) {
            if (!validateUsername(username)) {
                return res.status(400).json({ msg: 'username_invalid' });
            }
            const existingUser = await User.findByUsername(username);
            if (existingUser && existingUser.user_id !== userId) {
                return res.status(400).json({ msg: 'username_taken' });
            }
            updates.username = username.toLowerCase();
        }

        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ msg: 'password_invalid' });
            }
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            updates.password = passwordHash;
        }

        if (display_name !== undefined) {
            if (!validateDisplayName(display_name)) {
                return res.status(400).json({ msg: 'display_name_invalid' });
            }
            updates.display_name = display_name;
        }

        if (about_me !== undefined) {
            if (about_me.length > 256) {
                return res.status(400).json({ msg: 'about_me_too_long' });
            }
            updates.about_me = about_me;
        }

        if (banner_url !== undefined) {
            updates.banner_url = banner_url;
        }

        if (avatar_url !== undefined) {
            updates.avatar_url = avatar_url;
        }

        if (banner_hex !== undefined) {
            if (!/^#[0-9A-Fa-f]{6}$/.test(banner_hex)) {
                return res.status(400).json({ msg: 'banner_hex_invalid' });
            }
            updates.banner_hex = banner_hex;
        }

        if (online_status !== undefined) {
            if (![0, 1, 2, 3].includes(online_status)) {
                return res.status(400).json({ msg: 'online_status_invalid' });
            }
            updates.online_status = online_status;
        }

        if (status_emoji !== undefined) {
            if (status_emoji.length > 100) {
                return res.status(400).json({ msg: 'status_emoji_too_long' });
            }
            updates.status_emoji = status_emoji;
        }

        if (status_text !== undefined) {
            if (status_text.length > 128) {
                return res.status(400).json({ msg: 'status_text_too_long' });
            }
            updates.status_text = status_text;
        }

        if (status_timeout !== undefined) {
            updates.status_timeout = status_timeout;
        }

        if (is_2fa_enabled !== undefined) {
            updates.is_2fa_enabled = is_2fa_enabled;
        }

        if (accept_messages_from !== undefined) {
            if (![0, 1, 2, 3].includes(accept_messages_from)) {
                return res.status(400).json({ msg: 'accept_messages_from_invalid' });
            }
            updates.accept_messages_from = accept_messages_from;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ msg: 'no_fields_to_update' });
        }

        // Update the user
        const updatedUser = await User.updateById(userId, updates);

        // Return the updated user data
        res.json({
            msg: 'success',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Edit User Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.remove = async (req, res) => {
    const userId = req.user.id;

    try {
        // Check if such user exists
        if (!(await User.findById(req.user.id))) {
            console.log(await User.findById(req.user.id));
            return res.status(400).json({ msg: 'no_such_user' });
        }

        // Delete the user
        await User.deleteById(userId);

        res.json({
            msg: 'success',
            user_id: userId,
        });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};
