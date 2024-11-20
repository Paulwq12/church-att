// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const attendanceFilePath = path.join(__dirname, 'attendance.json');

// Load existing attendance data
const loadAttendanceData = () => {
    if (fs.existsSync(attendanceFilePath)) {
        const data = fs.readFileSync(attendanceFilePath);
        return JSON.parse(data);
    }
    return [];
};

// Register user
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const attendanceData = loadAttendanceData();
    if (attendanceData.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User  already exists' });
    }
    attendanceData.push({ username, password, lastSignIn: null });
    fs.writeFileSync(attendanceFilePath, JSON.stringify(attendanceData, null, 2));
    res.status(201).json({ message: 'User  registered successfully' });
});

// Login user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const attendanceData = loadAttendanceData();
    const user = attendanceData.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    user.lastSignIn = new Date();
    fs.writeFileSync(attendanceFilePath, JSON.stringify(attendanceData, null, 2));
    res.json({ message: 'Login successful', user });
});

// Get all users (for admin)
app.get('/api/users', (req, res) => {
    const attendanceData = loadAttendanceData();
    res.json(attendanceData);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});