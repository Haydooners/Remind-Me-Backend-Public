const express = require('express');
const { createCalendar, getCalendars, joinCalendar, removeUser } = require('../controllers/calendar_controller');

const router = express.Router();

router.post('/createCalendar', createCalendar);
router.post('/getCalendars', getCalendars);
router.post('/joinCalendar', joinCalendar);
router.put('/removeUser', removeUser);


module.exports = router;