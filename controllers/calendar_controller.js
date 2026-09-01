const Calendar = require('../models/Calendar');
const Auth = require('../models/auth');
const Reminders = require('../models/reminders');
const { body, validationResult, header } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

// Adds a new calendar to the DB
// The Calendar document stores reminders and every user with access to the Calendar. 
exports.createCalendar = [
    body('calendarName').notEmpty().withMessage('Calendar name is required.'),
    body('createdBy').notEmpty().withMessage('Creator UUID is required.'),
    async (req, res, next) => {
        console.log("Recieved request body: ", req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.error("Validation errors: ", errors.array());
            return res.status(400).json({ msg: "Error in calendar creation: ", errors: errors.array() });
        }

        const {
            calendarName,
            createdBy
        } = req.body;

        try {
            console.log("Looking for user with UUID: ", createdBy);
            const calendarCreator = await Auth.findOne({ _id: createdBy });
            if (!calendarCreator) {
                return res.status(404).json({ msg: "user not found." });
            }

            // Share code to allow additional users to join the Calendar
            const shareCode = require('crypto').randomBytes(16).toString("hex");

            const newCalendar = await Calendar.create({
                calendarName,
                createdBy,
                shareCode,
                usersWithAccess: [calendarCreator._id]
            });

            await Auth.findByIdAndUpdate(calendarCreator._id, { $addToSet: { calendars: newCalendar._id } });

            res.status(201).json({
                success: true,
                msg: "Calendar created successfully.",
                calendar: newCalendar
            });

        } catch (err) {
            next(err);
        }
    }
]

// Used on the "home page" of the app, serves all the calendars a user has access too.
exports.getCalendars = [
    body('_id'),
    async (req, res, next) => {
        console.log("Recieved request body: ", req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.error("Validation errors: ", errors.array());
            return res.status(400).json({ msg: "Error in getting calendars: ", errors: errors.array() });
        }

        const { _id } = req.body;
        console.log("Fetching calendars for user with _id: ", _id);

        try {
            const findUser = await Auth.findOne({ _id });
            if (!findUser) {
                console.log("User not found with _id: ", _id);
                return res.status(404).json({ msg: "User not found." });
            }
            const userCalendars = await Calendar.find({ usersWithAccess: findUser._id });
            if (!userCalendars || userCalendars.length === 0) {
                return res.status(404).json({ msg: "User not found or has no calendars." });
            }

            console.log('Found calendars for user: ', findUser._id);
            const calendarsData = userCalendars.map(cal => ({
                _id: cal._id,
                calendarName: cal.calendarName,
                createdBy: cal.createdBy,
                shareCode: cal.shareCode
            }));

            res.status(200).json({
                success: true,
                calendars: calendarsData
            });

        } catch (err) {
            next(err);
        }
    }
]

// TODO: Just in case, might need to get a calendars specific ID for stuff.
// Set it up if needed.
exports.getCalendarById = [
    header('uuid'),
    async (req, res, next) => {

    }
]

// I wonder what this one does
exports.deleteCalendar = [
    body('calendarId').notEmpty().withMessage('Calender ID is required'),
    body('uuid').notEmpty(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ msg: "Error in calendar deletion" });
        }

        const { calendarId, uuid } = req.body;
        const calendarCreator = uuid;

        console.log(`Deleting calendar with ID: ${calendarId} using user ID ${uuid}`);
        try {
            const calendarToDelete = await Calendar.findOne({ _id: calendarId });
            if (!calendarToDelete) {
                return res.status(404).json({ msg: "Calendar not found" });
            }
            if (calendarCreator !== calendarToDelete.createdBy) {
                return res.status(403).json({ msg: "Only the Calendar Creator can delete this Calendar" });
            }

            console.log(`Now deleting Calendar: ${calendarToDelete._id}`);
            await Calendar.deleteOne({ _id: calendarId });

            res.status(200).json({
                success: true,
                msg: "Calendar deleted successfully."
            });
        } catch (err) {
            next(err);
        }
    }
]

// Remove a user from a Calendar, still working on this didnt get a chance to try it last night.
exports.removeUser = [
    body('ownerId').required().notEmpty().withMessage('Missing Calendar Owner ID'),
    body('removeId').required().notEmpty().withMessage('Missing removed user ID'),
    body('calendarId').required().notEmpty().withMessage('Calendar ID cannot be empty.'),
    async (req, res, next) => {
        async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ msg: "Error in update calendar" })
            }

            const { ownerId, removedId, calendarId } = req.body;

            console.log(`Verifying user: ${ownerId} owns calendar: ${calendarId}`);
            try {
                const ownerValidation = Calendar.findOne(
                    { createdBy: ownerId },
                    { _id: calendarId }
                )

                if (ownerValidation.isEmpty()) {
                    return res.status(422).json({ msg: "Error verifying ownerId" });
                } else {
                    console.log(`Owner validated for ${ownerValidation._id}`);
                }

            } catch (err) {
                // I mean if it cant find it with the ownerId and CalendarID
                // Then whomever is doing it probably shouldnt, right? Does that make sense?
                console.log("Unable to find Calendar or user is not the owner.")
                next(err);
            }

            console.log(`Attempting to remove ${removedId} from calendar: ${calendarId}`);
            try {
                const removeUser = Calendar.findByIdAndUpdate(
                    { _id: calendarId },
                    { $pull: { usersWithAccess: { $in: [removedId] } } }
                );

                res.status(200).json({
                    success: true,
                    msg: "Yerrr booted them out fr"
                });
            } catch (err) {
                console.log("Unable to remove user from calendar");
                next(err);
            }
        }
    }
]

// Adds another user to a Calendars "usersWithAccess" Array.
exports.joinCalendar = [
    body('shareCode').notEmpty().withMessage('Share Code is required'),
    body('uuid').notEmpty().withMessage('User ID is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ msg: "Error in join calendar" });
        }

        const { shareCode, uuid } = req.body;

        console.log(`Attempting to join ${uuid} to calendar share code ${shareCode}`);
        try {
            const user = await Auth.findOne({ _id: uuid });
            if (!user) {
                return res.status(404).json({ msg: "User not found." });
            }

            const calendar = await Calendar.findOne({ shareCode });
            if (!calendar) {
                return res.status(404).json({ msg: "Calendar not found." });
            }

            await Calendar.findByIdAndUpdate(calendar._id, {
                $addToSet: { usersWithAccess: uuid }
            }
            );
            // Adds calendar id to users Calendars array
            await Auth.findByIdAndUpdate(user._id, {
                $addToSet: { calendars: calendar._id }
            }
            );

            res.status(200).json({
                success: true,
                msg: "Yerrr they joined that shit.",
                calendar: {
                    _id: calendar._id,
                    calendarName: calendar.calendarName,
                    createdBy: calendar.createdBy,
                    shareCode: calendar.shareCode
                }
            });

        } catch (err) {
            next(err);
        }
    }

]