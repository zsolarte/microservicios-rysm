// CAPA DE PRESENTACIÓN: HTTP ↔ servicio de préstamos
const service = require('../services/prestamos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /prestamos, GET /prestamos?estado=activo
async function listar(req, res) {
  res.status(200).json(await service.listar({ estado: req.query.estado}, req.headers.authorization));
}

async function obtener(req, res) {
  res.status(200).json(await service.obtener(leerId(req), req.headers.authorization));
}

async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

async function actualizar(req, res) {
  res.status(200).json(await service.actualizar(leerId(req), req.body, req.headers.authorization));
}

async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
