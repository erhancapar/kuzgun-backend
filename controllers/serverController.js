// controllers/serverController.js
const Server = require('../models/serverModel');

// Create a new server
exports.createServer = async (req, res) => {
    const { name } = req.body;
    const owner_id = req.user.id; // Assumes req.user is set by authentication middleware

    try {
        // Validate server name
        if (!name || name.length > 100) {
            return res.status(400).json({ msg: 'invalid_server_name' });
        }

        // Create the server
        const server = await Server.create(name, owner_id);

        // Respond with the created server data
        res.status(201).json({
            msg: 'success',
            server: {
                id: server.server_id,
                name: server.name,
                owner_id: server.owner_id,
                created_at: server.created_at,
            },
        });
    } catch (error) {
        console.error('Create Server Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

// Get servers owned by the user
exports.getServersByOwner = async (req, res) => {
    const owner_id = req.user.id;

    try {
        // Retrieve servers owned by the user
        const servers = await Server.findByOwnerId(owner_id);

        // Respond with the list of servers
        res.json({
            servers: servers.map((server) => ({
                id: server.server_id,
                name: server.name,
                owner_id: server.owner_id,
                created_at: server.created_at,
            })),
        });
    } catch (error) {
        console.error('Get Servers Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

// Get server by ID
exports.getServerById = async (req, res) => {
    const { server_id } = req.params;

    try {
        // Retrieve the server by ID
        const server = await Server.findById(server_id);

        if (!server) {
            return res.status(404).json({ msg: 'server_not_found' });
        }

        // Respond with the server data
        res.json({
            server: {
                id: server.server_id,
                name: server.name,
                owner_id: server.owner_id,
                created_at: server.created_at,
            },
        });
    } catch (error) {
        console.error('Get Server Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

// Edit server information
exports.editServer = async (req, res) => {
    const { server_id } = req.params;
    const owner_id = req.user.id;
    const {
        name,
        description,
        icon_url,
        banner_url,
        splash_url,
        afk_timeout,
        afk_channel_id,
        system_channel_id,
        is_system_welcome_notification_enabled,
        is_system_boost_notification_enabled,
        boost_level,
    } = req.body;

    try {
        // Retrieve the server
        const server = await Server.findById(server_id);

        if (!server) {
            return res.status(404).json({ msg: 'server_not_found' });
        }

        // Check if the requesting user is the owner
        if (server.owner_id !== owner_id) {
            return res.status(403).json({ msg: 'not_authorized' });
        }

        // Build an object of fields to update
        let updates = {};

        if (name !== undefined) {
            if (!name || name.length > 100) {
                return res.status(400).json({ msg: 'invalid_server_name' });
            }
            updates.name = name;
        }

        if (description !== undefined) {
            if (description.length > 256) {
                return res.status(400).json({ msg: 'description_too_long' });
            }
            updates.description = description;
        }

        if (icon_url !== undefined) {
            updates.icon_url = icon_url;
        }

        if (banner_url !== undefined) {
            updates.banner_url = banner_url;
        }

        if (splash_url !== undefined) {
            updates.splash_url = splash_url;
        }

        if (afk_timeout !== undefined) {
            if (!Number.isInteger(afk_timeout) || afk_timeout < 60 || afk_timeout > 3600) {
                return res.status(400).json({ msg: 'invalid_afk_timeout' });
            }
            updates.afk_timeout = afk_timeout;
        }

        if (afk_channel_id !== undefined) {
            updates.afk_channel_id = afk_channel_id;
        }

        if (system_channel_id !== undefined) {
            updates.system_channel_id = system_channel_id;
        }

        if (is_system_welcome_notification_enabled !== undefined) {
            updates.is_system_welcome_notification_enabled = is_system_welcome_notification_enabled;
        }

        if (is_system_boost_notification_enabled !== undefined) {
            updates.is_system_boost_notification_enabled = is_system_boost_notification_enabled;
        }

        if (boost_level !== undefined) {
            if (![0, 1, 2, 3].includes(boost_level)) {
                return res.status(400).json({ msg: 'invalid_boost_level' });
            }
            updates.boost_level = boost_level;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ msg: 'no_fields_to_update' });
        }

        // Update the server
        const updatedServer = await Server.updateById(server_id, updates);

        // Respond with the updated server data
        res.json({
            msg: 'success',
            server: updatedServer,
        });
    } catch (error) {
        console.error('Edit Server Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

// Remove a server
exports.removeServer = async (req, res) => {
    const { server_id } = req.params;
    const owner_id = req.user.id;

    try {
        // Retrieve the server
        const server = await Server.findById(server_id);

        if (!server) {
            return res.status(404).json({ msg: 'server_not_found' });
        }

        // Check if the requesting user is the owner
        if (server.owner_id !== owner_id) {
            return res.status(403).json({ msg: 'not_authorized' });
        }

        // Delete the server
        await Server.deleteById(server_id);

        res.json({
            msg: 'success',
            server_id: server_id,
        });
    } catch (error) {
        console.error('Remove Server Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};
