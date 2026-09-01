const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./connection/mongodb');
const jwt = require('jsonwebtoken');
dotenv.config({ path: './config/config.env' });
const port = process.env.PORT || 4000;

connectDB();


var corsOptions = {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

const remiderRoutes = require('./routes/reminder_route');
const authRoutes = require('./routes/auth_route');
const calendarRoutes = require('./routes/calendar_route');

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
})

app.use('/api/v1/reminders', remiderRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/calendars', calendarRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

app.use(function (err, req, res, next) {
    res.status(500);
    res.send({ status: 500, message: "Oops: " + err.message });
});