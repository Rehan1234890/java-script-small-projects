const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if DB connection fails
    }
    console.log('Connected to MySQL database');
});

// Test Route
app.get('/', (req, res) => {
    res.send('Todo List API is running');
});

// Fetch All Tasks
app.get('/tasks', (req, res) => {
    db.query('SELECT id, Title, Description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i") AS created_at FROM tasks', 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Fields cannot be empty!" });

    db.query('INSERT INTO tasks (Title, Description) VALUES (?, ?)', [title, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Fetch newly created task with timestamp
        db.query('SELECT id, Title, Description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i") AS created_at FROM tasks WHERE id = ?', 
        [result.insertId], (err, newTask) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(newTask[0]);
        });
    });
});

// Update Task
app.put('/tasks/:id', (req, res) => {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description || title.trim() === "" || description.trim() === "") {
        return res.status(400).json({ error: 'Title and Description cannot be empty' });
    }

    db.query('UPDATE tasks SET Title = ?, Description = ? WHERE id = ?', [title.trim(), description.trim(), id], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ error: 'Failed to update task' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// Delete Task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ error: 'Failed to delete task' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(204).send(); // No content
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
