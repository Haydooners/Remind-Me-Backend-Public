const express = require('express');
const { createReminder, getReminders, updateReminder, deleteReminder } = require('../controllers/reminder_controller');

const router = express.Router();

router.post('/createReminder', createReminder);
//router.get('/getReminders', getReminders);
//router.put('/updateReminder/:reminderId', updateReminder);
router.delete('/deleteReminder', deleteReminder);

module.exports = router;