// =====================================================================
// CLIENTE HTTP de ms-libros: la única parte de ms-prestamos que sabe
// cómo hablar con otro microservicio (análogo al repositorio).
// =====================================================================
const HttpError = require('../utils/http-error');
const LIBROS_URL = process.env.LIBROS_URL;

// Hace la petición reenviando el token del usuario. null si no hubo respuesta.
async function pedir(ruta, token) {
  try {
    return await fetch(`${LIBROS_URL}${ruta}`, {
      headers: { Authorization: token },        // el token de la petición original
      signal: AbortSignal.timeout(3000),         // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                                 // ms-libros caído o sin responder
  }
}

// VALIDACIÓN: ¿existe el libro? Si ms-libros no responde → 503
async function existeLibro(id, token) {
  const respuesta = await pedir(`/libros/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'ms-libros no está disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) {
    throw new HttpError(502, `ms-libros respondió ${respuesta.status}`);
  }
  return true;
}

// COMPOSICIÓN: varios libros en UNA petición → Map id → libro (null si no responde)
async function librosPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/libros?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const libros = await respuesta.json();
  return new Map(libros.map((l) =>
    [l.id, { id: l.id, titulo: l.titulo, autor: l.autor }]));
}

module.exports = { existeLibro, librosPorIds };
