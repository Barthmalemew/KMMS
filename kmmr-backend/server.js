const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Database connection parameters
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'mood_cats',
    port: 5432
};

// Create a PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Allow cross-origin requests from any origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Fetches a random image path for a specific mood from the database
async function getRandomImagePathForMood(mood) {
    const sql = "SELECT filename FROM images WHERE mood = $1 ORDER BY RANDOM() LIMIT 1";
    const result = await pool.query(sql, [mood]);
    return result.rows.length > 0 ? result.rows[0].filename : null;
}

// Route handler for handling GET requests
app.get('/', async (req, res) => {
    try {
        const mood = req.query.mood.toLowerCase(); // Convert mood to lowercase
        if (!mood) {
            return res.status(400).json({ error: 'Mood parameter is missing' });
        }
        const imagePath = await getRandomImagePathForMood(mood);
        if (!imagePath) {
            return res.status(404).json({ error: 'Image not found for the specified mood' });
        }
        // Send the image path as a JSON response
        res.json({ imagePath });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
