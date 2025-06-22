const express = require('express');
const path = require('path');
const Link = require('../models/Link');
const Click = require('../models/Clicks');

const router = express.Router();

router.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public', '404.html'));
});

router.get('/dashboard', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

router.get('/dashboard/:id', async (req, res) => {
    const { id } = req.params;
    const fs = require('fs').promises;
    let html = await fs.readFile(path.join(__dirname, '../public', 'analytics.html'), 'utf8');
    html = html.replace('{{UNIQUE_LINK_ID}}', id);

    return res.send(html);
});

router.get('/:shortCode', async (req, res) => {
    try {
        if (req.params.shortCode === 'dashboard' || req.params.shortCode === 'login') {
            return res.sendFile(path.join(__dirname, '../public', '404.html'));
        }

        const link = await Link.findOne({ shortCode: req.params.shortCode });

        const accessIp = req['headers']['cf-connecting-ip'];
        const userAgent = req['headers']['user-agent'];

        if (!link) {
            return res.sendFile(path.join(__dirname, '../public', '404.html'));
        }

        if (!link.enabled) {
            return res.sendFile(path.join(__dirname, '../public', '404.html'));
        }

        link.clicks += 1;
        link.lastAccessed = new Date();
        await link.save();

        let clicks;
        clicks = new Click({
            shortId: link.id,
            accessIp: accessIp,
            accessTime: new Date(),
            userAgent: userAgent
        });
        await clicks.save();

        res.redirect(link.originalUrl);
    } catch (error) {
        console.error('Redirect error:', error);
        return res.sendFile(path.join(__dirname, '../public', '500.html'));
    }
});

module.exports = router;