const express = require('express');
const { createCalendar, getCalendars, updateCalendar, deleteCalendar, joinCalendar } = require('../controllers/calendar_controller');

const router = express.Router();

router.post('/createCalendar', createCalendar);
router.post('/getCalendars', getCalendars);
router.post('/joinCalendar', joinCalendar);
//router.get('/getCalendarById/:calendarId', getCalendarById);
//router.put('/updateCalendar/:calendarId', updateCalendar);
//router.delete('/deleteCalendar/:calendarId', deleteCalendar);

module.exports = router;