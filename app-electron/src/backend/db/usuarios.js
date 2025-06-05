const db = require('../db/connection');

exports.login = (username, password, callback) => {
    console.log('Intentando login con:', username, password);
  const query = 'SELECT * FROM usuario WHERE nombre = ? AND clave = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return callback(err);
    if (results.length > 0) {
      callback(null, results[0]); // Usuario encontrado
    } else {
      callback(null, null); // Usuario no encontrado
    }
  });
};

exports.getUsers = (callback) => {
  const query = 'SELECT * FROM usuario';
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

// Consulta para obtener todos los usuarios

// if (require.main === module) {
//   const query = 'SELECT * FROM usuario';
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error al obtener usuarios:', err);
//     } else {
//       console.log('Usuarios:', results);
//     }
//     // Cierra la conexión después de la prueba
//     db.end();
//   });
// }

// prueba de Login

if (require.main === module) {

  const username = 'dev_user';
  const password = 'prueba123';

  exports.login(username, password, (err, user) => {
    if (err) {
      console.error('Error en login:', err);
    } else if (user) {
      console.log('Login exitoso:', user);
    } else {
      console.log('Usuario o contraseña incorrectos');
    }
    // Cierra la conexión después de la prueba
    db.end();
  });
}