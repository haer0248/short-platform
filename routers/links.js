const express = require('express');
const path = require('path');
const Link = require('../models/Link');
const Click = require('../models/Clicks');
const QRCode = require('qrcode');
const sharp = require('sharp');

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

router.get('/qrcode/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const link = await Link.findOne({ _id: id });

        if (!link || !link.enabled) {
            return res.sendFile(path.join(__dirname, '../public', '404.html'));
        }

        const fullShortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}?method=QRCode`;

        const qrCodeBuffer = await QRCode.toBuffer(fullShortUrl, {
            type: 'png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
        });

        const logoPath = path.join(__dirname, '../public/assets/avatar.png');

        const logoSize = 60;
        const paddingSize = 8;

        const logoWithBackground = await sharp({
            create: {
                width: logoSize + paddingSize * 2,
                height: logoSize + paddingSize * 2,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite([{
                input: await sharp(logoPath)
                    .resize(logoSize, logoSize, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toBuffer(),
                left: paddingSize,
                top: paddingSize
            }])
            .png()
            .toBuffer();

        const totalLogoSize = logoSize + paddingSize * 2;
        const finalQRCode = await sharp(qrCodeBuffer)
            .composite([{
                input: logoWithBackground,
                left: Math.floor((300 - totalLogoSize) / 2),
                top: Math.floor((300 - totalLogoSize) / 2)
            }])
            .png()
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="${id}-qr.png"`);
        res.send(finalQRCode);

    } catch (error) {
        console.error('QR Code generation error:', error);
        return res.sendFile(path.join(__dirname, '../public', '500.html'));
    }
});

router.get('/:shortCode', async (req, res) => {
    try {
        if (req.params.shortCode === 'dashboard' || req.params.shortCode === 'login') {
            return res.sendFile(path.join(__dirname, '../public', '404.html'));
        }

        const link = await Link.findOne({ shortCode: req.params.shortCode });

        const accessIp = req.headers['cf-connecting-ip'] || req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'unknown';
        const userReferer = req.headers.referer || req.headers.referrer || req.get('referer') || req.get('referrer') || 'direct';
        const userMethod = req.query.method || null;

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
            userAgent: userAgent,
            userReferer: userReferer,
            userMethod: userMethod
        });
        await clicks.save();

        res.redirect(link.originalUrl);
    } catch (error) {
        console.error('Redirect error:', error);
        return res.sendFile(path.join(__dirname, '../public', '500.html'));
    }
});

module.exports = router;