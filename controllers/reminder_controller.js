const Reminders = require('../models/reminders');
const Calendar = require('../models/Calendar');
const {check, body, validationResult, header} = require('express-validator');
const Users = require('../models/auth');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env'});

exports.createReminder = [
    body('startTime').notEmpty().withMessage('Start time is required.').isISO8601().toDate().withMessage('Start time must be a valid date.'),
    body('endTime').optional().isISO8601().toDate().withMessage('End time must be a valid date.'),
    body('reminderName').notEmpty().withMessage('Reminder name is required.'),
    body('description').optional(),
    body('reoccuring').optional().isBoolean().withMessage('Reoccuring must be a boolean value.'),
    body('createdBy').notEmpty().withMessage('Creator UUID is required.'),
    body('calendar').notEmpty().withMessage('Calendar ID is required.'),
    async (req, res, next) => {
        console.log("Recieved request body: ", req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.error("Validation errors: ", errors.array());
            return res.status(400).json({ msg: "Error in reminder creation: ", errors: errors.array() });
        }

        const {
            startTime,
            endTime,
            reminderName,
            description,
            reoccuring,
            createdBy,
            calendar
        } = req.body;

        try {
            const reminderCreator = await Users.findOne({ _id: createdBy });
            if (!reminderCreator) {
                return res.status(404).json({ msg: "Creator not found." });
            }

            const newReminder = await Reminders.create({
                startTime,
                endTime,
                reminderName,
                description,
                reoccuring,
                createdBy,
                calendar
            });

            await Calendar.findByIdAndUpdate(calendar, { $addToSet: { reminders: newReminder._id } });

            res.status(201).json({ 
                success: true,
                msg: "Reminder created successfully." 
            });
            
        } catch (err) {
            next(err);
        }
    }
]

exports.getReminders = [
    header('uuid'),
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ msg: "Error in fetching reminders: ", errors: errors.array() });
        }

        const { uuid } = req.body;
        console.log("Fetching reminders for current month");
        const currentTime = new Date();

        try {
            const user = await Users.find({ uuid });
            if (!user || user.length === 0) {
                return res.status(404).json({ msg: "User not found." });
            }
            const reminders = await Reminders.find({ createdBy: uuid });
            res.status(200).json({ 
                success: true,
                reminders 
            });
        } catch (err) {
            next(err);
        }
    }
]

exports.deleteReminder = [
    body('reminderId').notEmpty().withMessage('Reminder ID is required.'),
    body('uuid').notEmpty().withMessage('User UUID is required.'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ msg: "Error in reminder deletion: ", errors: errors.array() });
        }

        const { reminderId, uuid } = req.body;
        const reminderCreator = uuid;

        console.log("Attempting to delete reminder by user with UUID: ", uuid);
        try {
            const reminderToDelete = await Reminders.findOne({ _id: reminderId });
            const calenderCreator = await Calendar.findOne({ reminders: reminderId });
            if (!reminderToDelete) {
                return res.status(404).json({ msg: "Reminder not found." });
            }
            if (reminderCreator !== reminderToDelete.createdBy || reminderCreator !== calenderCreator.createdBy) {
                return res.status(403).json({ msg: "Only the creator of the reminder or calendar can delete this reminder." });
            }

            await Reminders.deleteOne({ _id: reminderId });

            res.status(200).json({ 
                success: true,
                msg: "Reminder deleted successfully." 
            });
            
        } catch (err) {
            next(err);
        }
    }
]