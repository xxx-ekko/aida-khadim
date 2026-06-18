const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests (important for GitHub Pages)
app.use(express.json());

// Initialize PostgreSQL Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase / Render PostgreSQL
    }
});

// Create guests table if it doesn't exist
const initDb = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS guests (
            id SERIAL PRIMARY KEY,
            prenom VARCHAR(255) NOT NULL,
            nom VARCHAR(255) NOT NULL,
            presence VARCHAR(50) NOT NULL,
            message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await pool.query('ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE');
        console.log('Connected to PostgreSQL and guests table is ready.');
    } catch (err) {
        console.error('Error initializing database', err);
    }
};
initDb();

// API Endpoints

// 1. Submit an RSVP
app.post('/api/guests', async (req, res) => {
    const { prenom, nom, presence, message } = req.body;
    
    if (!prenom || !nom || !presence) {
        return res.status(400).json({ error: 'Prenom, nom, and presence are required.' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO guests (prenom, nom, presence, message) VALUES ($1, $2, $3, $4) RETURNING id',
            [prenom, nom, presence, message || '']
        );
        res.status(201).json({ id: result.rows[0].id, message: 'RSVP saved successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Get all guests (For the admin backoffice)
app.get('/api/guests', async (req, res) => {
    const { pwd } = req.query;
    if (pwd !== 'AidaKhadim2026') {
        return res.status(401).json({ error: 'Accès refusé. Mot de passe incorrect.' });
    }

    try {
        const result = await pool.query('SELECT * FROM guests ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Get all messages (For the public site display)
app.get('/api/messages', async (req, res) => {
    try {
        const result = await pool.query("SELECT prenom, message, timestamp FROM guests WHERE message != '' AND message IS NOT NULL AND is_hidden = FALSE ORDER BY timestamp DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Hide or unhide a message
app.patch('/api/guests/:id/hide', async (req, res) => {
    const { pwd } = req.query;
    const { is_hidden } = req.body;
    const { id } = req.params;
    
    if (pwd !== 'AidaKhadim2026') {
        return res.status(401).json({ error: 'Accès refusé. Mot de passe incorrect.' });
    }

    try {
        await pool.query('UPDATE guests SET is_hidden = $1 WHERE id = $2', [is_hidden, id]);
        res.json({ message: 'Statut du message mis à jour avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
