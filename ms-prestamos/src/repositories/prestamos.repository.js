// CAPA DE ACCESO A DATOS: préstamos en MySQL
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM prestamos';
  const valores = [];
  if (filtros.estado) {
    sql += ' WHERE estado = ?';
    valores.push(filtros.estado);
  }
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM prestamos WHERE id = ?', [id]);
  return filas[0] || null;
}

async function create(p) {
  const [resultado] = await pool.query(
    'INSERT INTO prestamos (libro_id, lector, fecha_prestamo, fecha_devolucion, estado) VALUES (?, ?, ?, ?, ?)',
    [p.libro_id, p.lector, p.fecha_prestamo, p.fecha_devolucion, p.estado]);
  return findById(resultado.insertId);
}

async function update(id, p) {
  const [resultado] = await pool.query(
    'UPDATE prestamos SET libro_id = ?, lector = ?, fecha_prestamo = ?, fecha_devolucion = ?, estado = ? WHERE id = ?',
    [p.libro_id, p.lector, p.fecha_prestamo, p.fecha_devolucion, p.estado, id]);
  return resultado.affectedRows === 0 ? null : findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM prestamos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
