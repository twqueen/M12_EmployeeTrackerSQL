// for connecting to database
// update password
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Cloudykun0',
    database: 'employee_tracker_db'
});

module.exports = db;