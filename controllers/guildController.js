const Guild = require('../models/guildModel');

exports.createGuild = async (req, res) => {
    const { name } = req.body;
    const owner_id = req.user.id; // Assumes req.user is set by authentication middleware

    try {
        // Validate guild name
        if (!name || name.length > 100) {
            return res.status(400).json({ msg: 'invalid_guild_name' });
        }

        // Create the guild
        const guild = await Guild.create(name, owner_id);

        // Respond with the created guild data
        res.status(201).json({
            msg: 'success',
            guild: {
                id: guild.guild_id,
                name: guild.name,
                owner_id: guild.owner_id,
                created_at: guild.created_at,
            },
        });
    } catch (error) {
        console.error('Create Guild Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.getGuildsByOwner = async (req, res) => {
    const owner_id = req.user.id;

    try {
        // Retrieve guilds owned by the user
        const guilds = await Guild.findByOwnerId(owner_id);

        // Respond with the list of guilds
        res.json({
            guilds: guilds.map((guild) => ({
                id: guild.guild_id,
                name: guild.name,
                owner_id: guild.owner_id,
                created_at: guild.created_at,
            })),
        });
    } catch (error) {
        console.error('Get Guilds Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.getGuildById = async (req, res) => {
    const { guild_id } = req.params;

    try {
        // Retrieve the guild by ID
        const guild = await Guild.findById(guild_id);

        if (!guild) {
            return res.status(404).json({ msg: 'guild_not_found' });
        }

        // Respond with the guild data
        res.json({
            guild: {
                id: guild.guild_id,
                name: guild.name,
                owner_id: guild.owner_id,
                created_at: guild.created_at,
            },
        });
    } catch (error) {
        console.error('Get Guild Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};
