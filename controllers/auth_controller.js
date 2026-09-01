const Auth = require('../models/auth.js');
const bcryptjs = require('bcryptjs');
const { check, body, param, validationResult, header } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

exports.createUser = [
    body('username').notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    async (req, res, next) => {
        console.log("Recieved request body: ", req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.error("Validation errors: ", errors.array());
            return res.status(400).json({ msg: "Error in user creation: ", errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            const existingUser = await Auth.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ msg: "Username already exists." });
            }

            const hashedPassword = await bcryptjs.hash(password, 12);

            const newUser = new Auth({
                username,
                password: hashedPassword,
            });

            await newUser.save();

            res.status(201).json({
                success: true,
                msg: "User created successfully.",
                user: {
                    username: newUser.username,
                    uuid: newUser._id
                }
            });

        } catch (err) {
            return next(err);
        }
    }
]

exports.loginUser = [
    body('username').notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    async (req, res, next) => {
        console.log("Recieved request body: ", req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.error("Validation errors: ", errors.array());
            return res.status(400).json({ msg: "Error in user login: ", errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            const existingUser = await Auth.findOne({ username });
            if (!existingUser) {
                return res.status(400).json({ msg: "Username not found." });
            }

            const isPasswordValid = await bcryptjs.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return res.status(400).json({ msg: "Invalid password." });
            }

            res.status(200).json({
                success: true,
                msg: "User logged in successfully.",
                user: {
                    username: existingUser.username,
                    uuid: existingUser._id
                }
            });

        } catch (err) {
            return next(err);
        }
    }
]

// Currently redundant... but I might need it?
exports.getUser = [
    body('userUuid').notEmpty().withMessage('Buh... I didnt get a uuid bro lmao'),
    async (req, res, next) => {
        console.log('Gettin that user info for stuff and things ya heard me?');
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.error("Validation errors: ", errors.array());
            return res.status(400).json({ msg: "Error in user login: ", errors: errors.array() });
        }

        const userUuid = req.body;

        try {
            const existingUser = await Auth.findOne({ _id: userUuid });
            if (!existingUser) {
                return res.status(400).json({ msg: "Username not found." });
            }

            res.status(200).json({
                success: true,
                msg: "User found, sendin that info",
                username: existingUser.username
            });

        } catch (err) {
            return next(err);
        }
    }
]