const mongoose = require('mongoose');

const genralAwarenes = new mongoose.Schema({
    User_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gener: String,
    sentence: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('genralAwarenes', genralAwarenes);

