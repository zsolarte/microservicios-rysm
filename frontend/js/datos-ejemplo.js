// =====================================================================
// DATOS DE EJEMPLO (solo para MODO = 'ejemplo')
// Son las mismas filas iniciales de los schema.sql de cada microservicio.
// El simulador de js/api.js responde con la MISMA forma que la API real:
// cada préstamo sale con su objeto libro, como lo compone ms-prestamos.
// Así, al pasar al modo 'api' no hay que cambiar ninguna pantalla.
// =====================================================================
const DATOS_EJEMPLO = {
  usuarios: [
    { id: 1, nombre: 'Administrador General', email: 'admin@empresa.com',
      rol: 'administrador', activo: true, password: 'Admin2026*' },
    { id: 2, nombre: 'Lucía Lectora', email: 'lectora@biblioteca.com',
      rol: 'lector', activo: true, password: 'Lectora2026' },
    { id: 3, nombre: 'Bruno Bibliotecario', email: 'bibliotecario@biblioteca.com',
      rol: 'bibliotecario', activo: true, password: 'Biblio2026' },
  ],
  libros: [
    { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez',
      isbn: '978-0307474728', anio_publicacion: 1967, ejemplares: 3 },
    { id: 2, titulo: 'La vorágine', autor: 'José Eustasio Rivera',
      isbn: '978-8437620371', anio_publicacion: 1924, ejemplares: 2 },
    { id: 3, titulo: 'María', autor: 'Jorge Isaacs',
      isbn: '978-8437601219', anio_publicacion: 1867, ejemplares: 1 },
  ],
  prestamos: [
    { id: 1, libro_id: 1, lector: 'Camila Torres', fecha_prestamo: '2026-10-20',
      fecha_devolucion: '2026-11-03', estado: 'activo' },
    { id: 2, libro_id: 3, lector: 'Andrés Rojas', fecha_prestamo: '2026-10-15',
      fecha_devolucion: '2026-10-29', estado: 'devuelto' },
    { id: 3, libro_id: 1, lector: 'Valentina Ruiz', fecha_prestamo: '2026-10-27',
      fecha_devolucion: '2026-11-10', estado: 'activo' },
  ],
};
