const express = require('express');
const path = require('path');
const axios = require('axios');
const User = require('../models/User');

const router = express.Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:8080/auth/discord/callback';

router.get('/discord', (req, res) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        return res.sendFile(path.join(__dirname, '../public', 'client-app-error.html'));
    }
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});

router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/dashboard?error=no_code');
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: DISCORD_REDIRECT_URI,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = tokenResponse.data;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const discordUser = userResponse.data;

        let user = await User.findOne({ discordId: discordUser.id });
        if (!user) {
            if (process.env.ENABLE_REGISTER == "true") {
                user = new User({
                    discordId: discordUser.id,
                    username: discordUser.username,
                    globalName: discordUser.global_name,
                    discriminator: discordUser.discriminator,
                    avatar: discordUser.avatar,
                });

                req.session.user = {
                    id: user._id,
                    discordId: user.discordId,
                    username: user.username,
                    discriminator: user.discriminator,
                    globalName: user.globalName,
                    avatar: user.avatar,
                };
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
                
                await user.save();
                return res.redirect('/dashboard');
            } else {
                return res.redirect('/dashboard?message=register_disable');
            }
        } else {
            user.username = discordUser.username;
            user.discriminator = discordUser.discriminator;
            user.globalName = discordUser.global_name;
            user.avatar = discordUser.avatar;
            user.lastLogin = new Date();
            await user.save();

            req.session.user = {
                id: user._id,
                discordId: user.discordId,
                username: user.username,
                discriminator: user.discriminator,
                globalName: user.globalName,
                avatar: user.avatar,
            };

            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            res.redirect('/dashboard');
        }

    } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect('/dashboard?message=auth_failed');
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/dashboard?message=logout');
    });
});

module.exports = router;