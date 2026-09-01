const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../config/config.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log('Connected to MongoDB yataaaaa!!!!! ^.^');
    } catch (error) {
        console.error('MongoDB connection error: ', error);
        process.exit(1);
    }
};

module.exports = connectDB;