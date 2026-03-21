const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
        });
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        if (error.message.includes('IP address')) {
            console.error('Note: Please ensure your current IP address is whitelisted in MongoDB Atlas.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
