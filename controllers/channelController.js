const Channel = require('../models/channelModel');

exports.createChannel = async (req, res) => {
    const { name, guild_id } = req.body;

    try {
        // Validate channel name and guild_id
        if (!name || name.length > 100) {
            return res.status(400).json({ msg: 'invalid_channel_name' });
        }

        // Create the channel
        const channel = await Channel.create(name, guild_id);

        // Respond with the created channel data
        res.status(201).json({
            msg: 'success',
            channel: {
                id: channel.channel_id,
                name: channel.name,
                guild_id: channel.guild_id,
                created_at: channel.created_at,
            },
        });
    } catch (error) {
        console.error('Create Channel Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.getChannelsByGuild = async (req, res) => {
    const { guild_id } = req.params;

    try {
        // Retrieve all channels within the specified guild
        const channels = await Channel.findByGuildId(guild_id);

        // Respond with the list of channels
        res.json({
            channels: channels.map((channel) => ({
                id: channel.channel_id,
                name: channel.name,
                guild_id: channel.guild_id,
                created_at: channel.created_at,
            })),
        });
    } catch (error) {
        console.error('Get Channels Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};

exports.getChannelById = async (req, res) => {
    const { channel_id } = req.params;

    try {
        // Retrieve the channel by ID
        const channel = await Channel.findById(channel_id);

        if (!channel) {
            return res.status(404).json({ msg: 'channel_not_found' });
        }

        // Respond with the channel data
        res.json({
            channel: {
                id: channel.channel_id,
                name: channel.name,
                guild_id: channel.guild_id,
                created_at: channel.created_at,
            },
        });
    } catch (error) {
        console.error('Get Channel Error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
};
