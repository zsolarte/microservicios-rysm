// CAPA DE ACCESO A DATOS: libros en MySQL
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM libros';
  const condiciones = [];
  const valores = [];
  if (filtros.autor) {
    condiciones.push('autor = ?');
    valores.push(filtros.autor);
  }
  if (filtros.ids) {                       // ?ids=1,2,3 → WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);
  return filas[0] || null;
}

async function findByIsbn(isbn) {
  const [filas] = await pool.query('SELECT * FROM libros WHERE isbn = ?', [isbn]);
  return filas[0] || null;
}

async function create(libro) {
  const [resultado] = await pool.query(
    'INSERT INTO libros (titulo, autor, isbn, anio_publicacion, ejemplares) VALUES (?, ?, ?, ?, ?)',
    [libro.titulo, libro.autor, libro.isbn, libro.anio_publicacion, libro.ejemplares]);
  return findById(resultado.insertId);
}

async function update(id, libro) {
  const [resultado] = await pool.query(
    'UPDATE libros SET titulo = ?, autor = ?, isbn = ?, anio_publicacion = ?, ejemplares = ? WHERE id = ?',
    [libro.titulo, libro.autor, libro.isbn, libro.anio_publicacion, libro.ejemplares, id]);
  return resultado.affectedRows === 0 ? null : findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM libros WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByIsbn, create, update, remove };
