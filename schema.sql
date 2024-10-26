-- 1. Create the users table (no dependencies)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    username VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(32),
    about_me VARCHAR(256),
    banner_url TEXT,
    avatar_url TEXT,
    banner_hex VARCHAR(7),
    /* 0: offline, 1: online, 2: idle, 3: dnd */
    online_status SMALLINT NOT NULL CHECK (online_status BETWEEN 0 AND 3) DEFAULT 0,
    status_emoji VARCHAR(100),
    status_text VARCHAR(128),
    status_timeout TIMESTAMP WITH TIME ZONE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    /* 0: everyone, 1: common servers, 2: friends, 3: nobody */
    accept_messages_from SMALLINT NOT NULL CHECK (accept_messages_from BETWEEN 0 AND 3) DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the servers table (depends on users)
-- Omitting foreign key constraints on afk_channel_id and system_channel_id for now
CREATE TABLE servers (
    server_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(256),
    icon_url TEXT,
    banner_url TEXT,
    splash_url TEXT,
    afk_timeout INTEGER NOT NULL DEFAULT 300,
    afk_channel_id UUID,
    system_channel_id UUID,
    is_system_welcome_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_system_boost_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    boost_level SMALLINT NOT NULL DEFAULT 0 CHECK (boost_level BETWEEN 0 AND 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the channels table (depends on servers)
-- Omitting the foreign key constraint on last_message_id for now
CREATE TABLE channels (
    channel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(server_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(256),
    /* 0: text, 1: voice, 2: category */
    type SMALLINT NOT NULL CHECK (type IN (0, 1, 2)),
    position INTEGER NOT NULL DEFAULT 0,
    is_nsfw BOOLEAN DEFAULT FALSE,
    last_message_id UUID,
    bitrate INTEGER CHECK (bitrate BETWEEN 8000 AND 384000),
    user_limit INTEGER CHECK (user_limit BETWEEN 0 AND 99),
    rate_limit_per_user INTEGER CHECK (rate_limit_per_user BETWEEN 0 AND 21600),
    parent_id UUID REFERENCES channels(channel_id) ON DELETE SET NULL,
    rtc_region VARCHAR(50),
    /* 0: auto, 1: 720p, 2: 1080p */
    video_quality_mode SMALLINT CHECK (video_quality_mode IN (0, 1, 2)) DEFAULT 0,
    /* 15, 30, 60 */
    video_fps_mode SMALLINT CHECK (video_fps_mode IN (15, 30, 60)) DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create the messages table (depends on channels and users)
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(channel_id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    content BYTEA NOT NULL, -- Encrypted content
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_tts BOOLEAN NOT NULL DEFAULT FALSE,
    mentioned_list JSONB DEFAULT '[]'::JSONB,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Now that messages table is created, add the foreign key constraint to channels.last_message_id
ALTER TABLE channels
ADD CONSTRAINT fk_channels_last_message
FOREIGN KEY (last_message_id)
REFERENCES messages(message_id);

-- 6. Now that channels table is created, add foreign key constraints to servers.afk_channel_id and servers.system_channel_id
ALTER TABLE servers
ADD CONSTRAINT fk_servers_afk_channel
FOREIGN KEY (afk_channel_id)
REFERENCES channels(channel_id) ON DELETE SET NULL;

ALTER TABLE servers
ADD CONSTRAINT fk_servers_system_channel
FOREIGN KEY (system_channel_id)
REFERENCES channels(channel_id) ON DELETE SET NULL;

-- 7. Create the emojis table (depends on servers)
CREATE TABLE emojis (
    emoji_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(server_id) ON DELETE CASCADE,
    name VARCHAR(32) NOT NULL,
    image_url TEXT NOT NULL,
    is_animated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create the attachments table (depends on messages)
CREATE TABLE attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(message_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create the reactions table (depends on messages, users, and emojis)
CREATE TABLE reactions (
    message_id UUID REFERENCES messages(message_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    emoji_id UUID REFERENCES emojis(emoji_id),
    PRIMARY KEY (message_id, user_id, emoji_id)
);

-- 10. Create the relationships table (depends on users)
CREATE TABLE relationships (
    relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    /* 0: pending, 1: accepted, 2: blocked */
    status SMALLINT NOT NULL CHECK (status IN (0, 1, 2)),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id_1, user_id_2)
);

-- 11. Create the server_members table (depends on servers and users)
CREATE TABLE server_members (
    server_id UUID NOT NULL REFERENCES servers(server_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    nickname VARCHAR(32),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    is_deafened BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (server_id, user_id)
);

-- 12. Create the roles table (depends on servers)
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID NOT NULL REFERENCES servers(server_id) ON DELETE CASCADE,
    name VARCHAR(32) NOT NULL,
    color VARCHAR(7),
    position INTEGER,
    permissions BIGINT DEFAULT 0,
    is_mentionable BOOLEAN DEFAULT FALSE
);

-- 13. Create the server_bans table (depends on servers and users)
CREATE TABLE server_bans (
    server_id UUID NOT NULL REFERENCES servers(server_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    banned_by UUID REFERENCES users(user_id),
    reason TEXT,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (server_id, user_id)
);

-- 14. Create the server_invites table (depends on servers and users)
CREATE TABLE server_invites (
    code VARCHAR(10) PRIMARY KEY,
    server_id UUID NOT NULL REFERENCES servers(server_id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    uses INTEGER DEFAULT 0
);

-- 15. Create the dm_channels table (depends on users)
CREATE TABLE dm_channels (
    dm_channel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Create the dm_messages table (depends on dm_channels and users)
CREATE TABLE dm_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_channel_id UUID REFERENCES dm_channels(dm_channel_id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    content BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 17. Create the voice_states table (depends on servers, channels, and users)
CREATE TABLE voice_states (
    server_id UUID REFERENCES servers(server_id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(channel_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    session_id UUID,
    is_muted BOOLEAN DEFAULT FALSE,
    is_deafened BOOLEAN DEFAULT FALSE,
    is_self_muted BOOLEAN DEFAULT FALSE,
    is_self_deafened BOOLEAN DEFAULT FALSE,
    is_streaming BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (server_id, user_id)
);

-- 18. Create the audit_logs table (depends on servers and users)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(server_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id),
    action_type SMALLINT NOT NULL,
    target_id UUID,
    changes JSONB,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
