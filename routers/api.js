const express = require('express');
const Link = require('../models/Link');
const Clicks = require('../models/Clicks');
const { requireAuth, generateShortCode } = require('../middleware/auth');

const router = express.Router();

router.get('/user', requireAuth, (req, res) => {
    res.json(req.session.user);
});

router.get('/links', requireAuth, async (req, res) => {
    try {
        const links = await Link.find({ userId: req.session.user.id })
            .sort({ createdAt: -1 })
            .populate('totalClicks');;
        res.json(links);
    } catch (error) {
        console.error('Fetch links error:', error);
        res.status(500).json({ error: '讀取短網址時發生問題' });
    }
});

router.post('/analytics/:id', requireAuth, async (req, res) => {
    try {
        const links = await Link.findOne({ _id: req.params.id, userId: req.session.user.id });
        const clicks = await Clicks.find({ shortId: links.id }).sort({ accessTime: 'desc' });

        res.json({
            link: links,
            click: clicks
        });
    } catch (error) {
        console.error('Fetch links error:', error);
        res.status(500).json({ error: '讀取短網址時發生問題' });
    }
});

router.post('/links', requireAuth, async (req, res) => {
    try {
        const { originalUrl, customName, customCode } = req.body;

        if (!originalUrl) {
            return res.status(400).json({ error: '缺少原始網址' });
        }

        try {
            new URL(originalUrl);
        } catch {
            return res.status(400).json({ error: '未知網址格式' });
        }

        let shortCode = customCode || generateShortCode();

        if (customCode) {
            if (!/^[\w\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff-]+$/u.test(customCode)) {
                return res.status(400).json({ error: '自訂網址只能包含字母、數字、漢字、連字符和底線' });
            }

            const existing = await Link.findOne({ shortCode: customCode });
            if (existing) {
                return res.status(400).json({ error: '自訂網址已經存在ㄌ！' });
            }
        }

        while (await Link.findOne({ shortCode })) {
            shortCode = generateShortCode();
        }

        const link = new Link({
            shortCode,
            originalUrl,
            customName: customName || shortCode,
            userId: req.session.user.id,
        });

        await link.save();
        res.json(link);
    } catch (error) {
        console.error('Create link error:', error);
        res.status(500).json({ error: '建立短網址失敗' });
    }
});

router.put('/links/:id', requireAuth, async (req, res) => {
    try {
        const { originalUrl, customName, enabled, shortCode } = req.body;

        const link = await Link.findOne({ _id: req.params.id, userId: req.session.user.id });
        if (!link) {
            return res.status(404).json({ error: '找不到短網址' });
        }

        if (originalUrl !== undefined) {
            try {
                new URL(originalUrl);
                link.originalUrl = originalUrl;
            } catch {
                return res.status(400).json({ error: '網址格式錯誤' });
            }
        }

        if (customName !== undefined) link.customName = customName;
        if (enabled !== undefined) link.enabled = enabled;
        if (shortCode !== undefined) link.shortCode = shortCode;

        await link.save();
        res.json(link);
    } catch (error) {
        console.error('Update link error:', error);
        res.status(500).json({ error: '更新短網址失敗' });
    }
});

router.delete('/links/:id', requireAuth, async (req, res) => {
    try {
        const result = await Link.deleteOne({ _id: req.params.id, userId: req.session.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: '找不到短網址' });
        }
        await Clicks.deleteMany({ shortId: new Object(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete link error:', error);
        res.status(500).json({ error: '刪除短網址失敗' });
    }
});

module.exports = router;