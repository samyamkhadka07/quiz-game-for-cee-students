/*
Node.js server for CEEE Entrance Quiz Game
Features:
- Serves static HTML/CSS/JS
- Handles user signup/login (simple, not secure for production)
- Stores quiz results per user
- Shows admin page for viewing results

To run:
1. Save this as server.js
2. Place ceee.html in a folder called 'public'
3. Run: npm install express body-parser
4. Start: node server.js
*/

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// In-memory user and result storage (use DB for production)
let users = {};
let results = [];

// Load users/results from file if exists
const USERS_FILE = './users.json';
const RESULTS_FILE = './results.json';
if (fs.existsSync(USERS_FILE)) users = JSON.parse(fs.readFileSync(USERS_FILE));
if (fs.existsSync(RESULTS_FILE)) results = JSON.parse(fs.readFileSync(RESULTS_FILE));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    if (users[username]) return res.status(400).json({ error: 'User exists' });
    users[username] = { password };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
    res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!users[username] || users[username].password !== password)
        return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true });
});

// Save quiz result
app.post('/api/result', (req, res) => {
    const { username, subject, score, total } = req.body;
    if (!username || !subject || typeof score !== 'number' || typeof total !== 'number')
        return res.status(400).json({ error: 'Missing fields' });
    results.push({ username, subject, score, total, time: new Date().toISOString() });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results));
    res.json({ success: true });
});

// Admin: view all results
app.get('/admin/results', (req, res) => {
    let html = `<h2>Quiz Results</h2><table border="1"><tr><th>User</th><th>Subject</th><th>Score</th><th>Total</th><th>Time</th></tr>`;
    results.forEach(r => {
        html += `<tr><td>${r.username}</td><td>${r.subject}</td><td>${r.score}</td><td>${r.total}</td><td>${r.time}</td></tr>`;
    });
    html += '</table>';
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});