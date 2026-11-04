// CAPA DE MODELO: atributos de un Préstamo y sus validaciones
const ESTADOS = ['activo', 'devuelto'];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function validarPrestamo(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') return ['Se esperaba un objeto JSON con los datos del préstamo'];
  if (!Number.isInteger(datos.libro_id) || datos.libro_id <= 0) errores.push('libro_id debe ser un entero positivo');
  if (!datos.lector || typeof datos.lector !== 'string' || datos.lector.trim() === '') errores.push('lector es obligatorio');
  if (typeof datos.fecha_prestamo !== 'string' || !FECHA.test(datos.fecha_prestamo)) errores.push('fecha_prestamo debe tener el formato AAAA-MM-DD');
  if (typeof datos.fecha_devolucion !== 'string' || !FECHA.test(datos.fecha_devolucion)) errores.push('fecha_devolucion debe tener el formato AAAA-MM-DD');
  if (!ESTADOS.includes(datos.estado)) errores.push(`estado debe ser uno de: ${ESTADOS.join(', ')}`);
  return errores;
}

function construirPrestamo(datos) {
  return {
    libro_id: datos.libro_id,
    lector: datos.lector.trim(),
    fecha_prestamo: datos.fecha_prestamo,
    fecha_devolucion: datos.fecha_devolucion,
    estado: datos.estado,
  };
}

module.exports = { validarPrestamo, construirPrestamo };
