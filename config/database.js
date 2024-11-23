const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'admin',
    password: 'root',
    database: 'mood_match',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Please check your database username and password in .env file');
        }
        return;
    }
    console.log('Database connected successfully');
    connection.release();
});

module.exports = pool.promise();