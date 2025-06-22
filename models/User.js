const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    globalName: {
        type: String
    },
    discriminator: String,
    avatar: String,
    lastLogin: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.index({ discordId: 1 });

module.exports = mongoose.model('User', userSchema);