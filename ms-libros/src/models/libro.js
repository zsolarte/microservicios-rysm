// CAPA DE MODELO: atributos de un Libro y sus validaciones
const ANIO_ACTUAL = new Date().getFullYear();

function validarLibro(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') return ['Se esperaba un objeto JSON con los datos del libro'];
  if (!datos.titulo || typeof datos.titulo !== 'string' || datos.titulo.trim() === '') errores.push('titulo es obligatorio');
  if (!datos.autor || typeof datos.autor !== 'string' || datos.autor.trim() === '') errores.push('autor es obligatorio');
  if (!datos.isbn || typeof datos.isbn !== 'string' || datos.isbn.trim() === '') errores.push('isbn es obligatorio');
  if (!Number.isInteger(datos.anio_publicacion) || datos.anio_publicacion < 1450 || datos.anio_publicacion > ANIO_ACTUAL) {
    errores.push(`anio_publicacion debe ser un entero entre 1450 y ${ANIO_ACTUAL}`);
  }
  if (!Number.isInteger(datos.ejemplares) || datos.ejemplares < 0) errores.push('ejemplares debe ser un entero mayor o igual a 0');
  return errores;
}

function construirLibro(datos) {
  return {
    titulo: datos.titulo.trim(),
    autor: datos.autor.trim(),
    isbn: datos.isbn.trim(),
    anio_publicacion: datos.anio_publicacion,
    ejemplares: datos.ejemplares,
  };
}

module.exports = { validarLibro, construirLibro };
