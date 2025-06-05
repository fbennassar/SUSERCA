const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'dev_user',
    password: 'prueba123',
    database: 'suserca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.promise().query('SELECT 1')
  .then(() => console.log('Conexión a MySQL exitosa'))
  .catch(err => console.error('Error de conexión a MySQL:', err));

module.exports = pool.promise();