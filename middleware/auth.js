const crypto = require('crypto');

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

const generateShortCode = () => {
    return crypto.randomBytes(4).toString('hex');
};

module.exports = {
    requireAuth,
    generateShortCode
};