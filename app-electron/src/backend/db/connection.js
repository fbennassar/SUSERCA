const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'dev_user',
    password: 'prueba123',
    database: 'suserca'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database successfully');
});

module.exports = connection;