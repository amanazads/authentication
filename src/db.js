const mongoose = require('mongoose');

// ✅ Fix: Add recommended MongoDB connection options
mongoose.connect("mongodb://localhost:27017/Authentication", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
});

// Get the default connection
const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Define schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

// Create model
const Collection = mongoose.model("AuthCollection", userSchema);

// Export the database connection and Collection model
module.exports = Collection;
