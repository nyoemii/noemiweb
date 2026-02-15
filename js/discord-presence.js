// Discord Rich Presence Widget using Lanyard API
class DiscordPresence {
    constructor(userId, containerId) {
        this.userId = userId;
        this.container = document.getElementById(containerId);
        this.apiUrl = `https://api.lanyard.rest/v1/users/${userId}`;
        this.init();
    }

    async init() {
        await this.fetchPresence();
        // Update every 15 seconds for more real-time feel
        setInterval(() => this.fetchPresence(), 15000);
    }

    async fetchPresence() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();

            if (data.success) {
                this.renderPresence(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch Discord presence:', error);
            this.renderError();
        }
    }

    getStatusColor(status) {
        const colors = {
            'online': '#43b581',
            'idle': '#faa61a',
            'dnd': '#f04747',
            'offline': '#747f8d'
        };
        return colors[status] || colors.offline;
    }

    getStatusEmoji(status) {
        const emojis = {
            'online': '🟢',
            'idle': '🟡',
            'dnd': '🔴',
            'offline': '⚫'
        };
        return emojis[status] || emojis.offline;
    }

    getAvatarUrl(user) {
        const baseUrl = 'https://cdn.discordapp.com';
        if (user.avatar) {
            const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
            return `${baseUrl}/avatars/${user.id}/${user.avatar}.${format}?size=128`;
        }
        return `${baseUrl}/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
    }

    formatElapsedTime(timestamp) {
        const elapsed = Date.now() - timestamp;
        const minutes = Math.floor(elapsed / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m elapsed`;
        }
        return `${minutes}m elapsed`;
    }

    renderPresence(data) {
        const status = data.discord_status;
        const user = data.discord_user;
        const activities = data.activities || [];
        const spotify = data.spotify;

        const avatarUrl = this.getAvatarUrl(user);
        let activityHTML = '';

        // Check for Spotify
        if (spotify) {
            const elapsed = this.formatElapsedTime(spotify.timestamps.start);
            activityHTML = `
                <div class="discord-activity spotify-activity">
                    <img src="${spotify.album_art_url}" alt="Album Art" class="spotify-album-art">
                    <div class="activity-details">
                        <div class="activity-label">
                            <span class="spotify-icon">🎵</span>
                            Listening to Spotify
                        </div>
                        <div class="activity-name">${this.escapeHtml(spotify.song)}</div>
                        <div class="activity-state">by ${this.escapeHtml(spotify.artist)}</div>
                        <div class="activity-time">${elapsed}</div>
                    </div>
                </div>
            `;
        } else if (activities.length > 0) {
            const activity = activities.find(a => a.type !== 4) || activities[0];
            if (activity && activity.type !== 4) {
                const activityType = activity.type === 0 ? 'Playing' :
                    activity.type === 2 ? 'Listening to' :
                        activity.type === 3 ? 'Watching' : '';

                let timeHTML = '';
                if (activity.timestamps?.start) {
                    timeHTML = `<div class="activity-time">${this.formatElapsedTime(activity.timestamps.start)}</div>`;
                }

                let assetHTML = '';
                if (activity.assets?.large_image) {
                    const imageUrl = activity.assets.large_image.startsWith('mp:')
                        ? `https://media.discordapp.net/${activity.assets.large_image.slice(3)}`
                        : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                    assetHTML = `<img src="${imageUrl}" alt="Activity" class="activity-image">`;
                }

                activityHTML = `
                    <div class="discord-activity game-activity">
                        ${assetHTML}
                        <div class="activity-details">
                            <div class="activity-label">
                                <span class="game-icon">🎮</span>
                                ${activityType}
                            </div>
                            <div class="activity-name">${this.escapeHtml(activity.name)}</div>
                            ${activity.details ? `<div class="activity-state">${this.escapeHtml(activity.details)}</div>` : ''}
                            ${activity.state ? `<div class="activity-state">${this.escapeHtml(activity.state)}</div>` : ''}
                            ${timeHTML}
                        </div>
                    </div>
                `;
            }
        }

        this.container.innerHTML = `
            <div class="discord-widget" data-status="${status}">
                <div class="discord-header">
                    <div class="discord-avatar-container">
                        <img src="${avatarUrl}" alt="${user.username}" class="discord-avatar">
                        <div class="discord-status-indicator" style="background-color: ${this.getStatusColor(status)}"></div>
                    </div>
                    <div class="discord-user">
                        <div class="discord-username">${this.escapeHtml(user.global_name || user.username)}</div>
                        <div class="discord-discriminator">${user.username}</div>
                        <div class="discord-status-text">${status.toUpperCase()}</div>
                    </div>
                </div>
                ${activityHTML}
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderError() {
        this.container.innerHTML = `
            <div class="discord-widget">
                <div class="discord-error">
                    <span style="font-size: 24px;">😔</span>
                    <div>Unable to load Discord status</div>
                </div>
            </div>
        `;
    }
}
