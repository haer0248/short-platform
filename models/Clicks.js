const mongoose = require('mongoose');
const { Schema } = mongoose;

const clickSchema = new mongoose.Schema({
    shortId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    accessIp: {
        type: String,
        default: ''
    },
    accessTime: Date,
    userAgent: {
        type: String,
        default: ''
    },
    userMethod: {
        type: Object,
        default: ''
    },
    userReferer: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Clicks', clickSchema);