// CAPA DE SERVICIO: reglas del negocio de los libros
const repo = require('../repositories/libros.repository');
const { validarLibro, construirLibro } = require('../models/libro');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const libro = await repo.findById(id);
  if (!libro) throw new HttpError(404, `No existe el libro con id ${id}`);
  return libro;
}

async function crear(datos) {
  const errores = validarLibro(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const libro = construirLibro(datos);
  // Regla de negocio: el ISBN no se puede repetir
  if (await repo.findByIsbn(libro.isbn)) throw new HttpError(409, `Ya existe un libro con el ISBN ${libro.isbn}`);
  return repo.create(libro);
}

async function actualizar(id, datos) {
  const errores = validarLibro(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const libro = construirLibro(datos);
  const otro = await repo.findByIsbn(libro.isbn);
  if (otro && otro.id !== id) throw new HttpError(409, `Ya existe un libro con el ISBN ${libro.isbn}`);
  const actualizado = await repo.update(id, libro);
  if (!actualizado) throw new HttpError(404, `No existe el libro con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  if (!(await repo.remove(id))) throw new HttpError(404, `No existe el libro con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
