const mongoose = require('mongoose');
const { create } = require('./reminders');
const { use } = require('react');

// Calendar's are created and shared by users, they are then populated with reminders. 
// Each calendar has a share code that can be used by other users to access the calendar.

const calendarSchema = new mongoose.Schema ({
    calendarName: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    shareCode: {
        type: String,
        required: true,
        unique: true
    },
    reminders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reminder'
    }],
    usersWithAccess: [{
        type: String
    }]
});

module.exports = mongoose.model('calendar', calendarSchema);