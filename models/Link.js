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
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: Date
});

// Compound index for user's links
linkSchema.index({ userId: 1, createdAt: -1 });

linkSchema.virtual('totalClicks', {
    ref: 'Clicks',
    localField: '_id',
    foreignField: 'shortId',
    count: true
});

linkSchema.set('toJSON', { virtuals: true });
linkSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Link', linkSchema);