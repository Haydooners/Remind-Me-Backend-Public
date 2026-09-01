const mongoose = require('mongoose');

const authSchema = new mongoose.Schema ({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    calendars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'calendar'
    }]
});

module.exports = mongoose.model('Auth', authSchema);