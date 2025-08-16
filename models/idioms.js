const mongoose = require('mongoose');

const idiomSchema = new mongoose.Schema({
    User_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    idiom: String,
    meaning: String,
    example: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Idiom', idiomSchema);
