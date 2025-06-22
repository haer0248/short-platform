const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    shortCode: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    originalUrl: {
        type: String,
        required: true
    },
    customName: {
        type: String,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: Date
});

// Compound index for user's links
linkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Link', linkSchema);