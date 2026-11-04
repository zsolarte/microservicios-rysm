// CAPA DE SERVICIO: reglas del negocio de los préstamos
const repo = require('../repositories/prestamos.repository');
const { validarPrestamo, construirPrestamo } = require('../models/prestamo');
const HttpError = require('../utils/http-error');

// Regla de negocio: la devolución no puede ser anterior al préstamo
function validarFechas(prestamo) {
  if (prestamo.fecha_devolucion < prestamo.fecha_prestamo) {
    throw new HttpError(400, 'fecha_devolucion no puede ser anterior a fecha_prestamo');
  }
}

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const prestamo = await repo.findById(id);
  if (!prestamo) throw new HttpError(404, `No existe el préstamo con id ${id}`);
  return prestamo;
}

async function crear(datos) {
  const errores = validarPrestamo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const prestamo = construirPrestamo(datos);
  validarFechas(prestamo);
  return repo.create(prestamo);
}

async function actualizar(id, datos) {
  const errores = validarPrestamo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const prestamo = construirPrestamo(datos);
  validarFechas(prestamo);
  const actualizado = await repo.update(id, prestamo);
  if (!actualizado) throw new HttpError(404, `No existe el préstamo con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  if (!(await repo.remove(id))) throw new HttpError(404, `No existe el préstamo con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
