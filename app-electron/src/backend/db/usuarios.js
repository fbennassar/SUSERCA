const db = require('../db/connection');

exports.login = async (username, password) => {
  const [rows] = await db.query(
    'SELECT * FROM usuario WHERE nombre = ? AND clave = ?',
    [username, password]
  );
  return rows.length > 0 ? rows[0] : null;
}


exports.getUsers = async () => {
  const [rows] = await db.query('SELECT * FROM usuario');
  return rows;
};