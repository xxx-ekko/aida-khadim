const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests (important for GitHub Pages)
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        // Create guests table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prenom TEXT NOT NULL,
            nom TEXT NOT NULL,
            presence TEXT NOT NULL,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API Endpoints

// 1. Submit an RSVP
app.post('/api/guests', (req, res) => {
    const { prenom, nom, presence, message } = req.body;
    
    if (!prenom || !nom || !presence) {
        return res.status(400).json({ error: 'Prenom, nom, and presence are required.' });
    }
    
    const stmt = db.prepare('INSERT INTO guests (prenom, nom, presence, message) VALUES (?, ?, ?, ?)');
    stmt.run([prenom, nom, presence, message || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'RSVP saved successfully.' });
    });
    stmt.finalize();
});

// 2. Get all guests (For the admin backoffice)
app.get('/api/guests', (req, res) => {
    const { pwd } = req.query;
    if (pwd !== 'AidaKhadim2026') {
        return res.status(401).json({ error: 'Accès refusé. Mot de passe incorrect.' });
    }

    db.all('SELECT * FROM guests ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 3. Get all messages (For the public site display)
app.get('/api/messages', (req, res) => {
    db.all("SELECT prenom, message, timestamp FROM guests WHERE message != '' ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
