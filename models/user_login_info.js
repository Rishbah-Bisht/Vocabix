const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true},
    nickname: {
        type: String,
        default: ""
    },
    singUp: {
        type: String,
        default:'no'
    }
});

module.exports = mongoose.model('User', userSchema);

