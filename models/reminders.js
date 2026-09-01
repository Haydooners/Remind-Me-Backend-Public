const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema ({
    startTime: {
        type: Date,
        required: true
    },
    endTime: { // End time is optional, if not provided the reminder will only use the start time.
        type: Date,
        required: false
    },
    reminderName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    reoccuring: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: String,
        required: true
    },
    calendar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calendar',
        required: true
    }
});


module.exports = mongoose.model('Reminder', reminderSchema);