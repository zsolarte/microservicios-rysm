// CAPA DE SERVICIO: reglas del negocio de los préstamos
const repo = require('../repositories/prestamos.repository');
const { validarPrestamo, construirPrestamo } = require('../models/prestamo');
const HttpError = require('../utils/http-error');

const librosClient = require('../clients/libros.client');

// Relación: el libro referenciado debe existir en ms-libros
async function validarLibro(libroId, token) {
  if (!(await librosClient.existeLibro(libroId, token))) {
    throw new HttpError(400, `No existe el libro con id ${libroId}`);
  }
}

// Regla de negocio: la devolución no puede ser anterior al préstamo
function validarFechas(prestamo) {
  if (prestamo.fecha_devolucion < prestamo.fecha_prestamo) {
    throw new HttpError(400, 'fecha_devolucion no puede ser anterior a fecha_prestamo');
  }
}

// Agrega a cada préstamo su objeto libro, con UNA sola consulta a ms-libros
async function componer(prestamos, token) {
  const ids = [...new Set(prestamos.map((p) => p.libro_id))];
  const libros = await librosClient.librosPorIds(ids, token);
  if (!libros) {                                   // degradación controlada
    return prestamos.map((p) =>
      ({ ...p, libro: null, aviso: 'ms-libros no disponible' }));
  }
  return prestamos.map((p) => ({ ...p, libro: libros.get(p.libro_id) || null }));
}

async function listar(filtros, token) {
  return componer(await repo.findAll(filtros), token);
}

async function obtener(id, token) {
  const prestamo = await repo.findById(id);
  if (!prestamo) throw new HttpError(404, `No existe el préstamo con id ${id}`);
  const [compuesto] = await componer([prestamo], token);
  return compuesto;
  
}

async function crear(datos, token) {
  const errores = validarPrestamo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const prestamo = construirPrestamo(datos);
  validarFechas(prestamo);
  await validarLibro(prestamo.libro_id, token);
  const nuevo = await repo.create(prestamo);
  const [compuesto] = await componer([nuevo], token);    // NUEVO: agrega el libro
  return compuesto;
}

async function actualizar(id, datos, token) {
  const errores = validarPrestamo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const prestamo = construirPrestamo(datos);
  validarFechas(prestamo);
  await validarLibro(prestamo.libro_id, token);
  const actualizado = await repo.update(id, prestamo);
  if (!actualizado) throw new HttpError(404, `No existe el préstamo con id ${id}`);
  const [compuesto] = await componer([actualizado], token);  // NUEVO: agrega el libro
  return compuesto;
}

async function eliminar(id) {
  if (!(await repo.remove(id))) throw new HttpError(404, `No existe el préstamo con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
