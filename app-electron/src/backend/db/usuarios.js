const db = require('../db/connection');

// Las rows son un array de objetos, cada objeto representa una fila de la tabla
exports.login = async (username, password) => {
  const [rows] = await db.query(
    'SELECT * FROM usuario WHERE nombre = ? AND clave = ?',
    [username, password]
  );
  return rows.length > 0 ? rows[0] : null;
  // Si hay al menos un usuario, devuelve el primero; si no, devuelve null
}


exports.getUsers = async () => {
  const [rows] = await db.query('SELECT * FROM usuario');
  return rows;
};