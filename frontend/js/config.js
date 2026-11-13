// =====================================================================
// CONFIGURACIÓN DEL FRONTEND
// MODO 'ejemplo': datos simulados (js/datos-ejemplo.js), sin microservicios.
//                 Es el modo del Taller 2: se abre login.html con doble clic.
// MODO 'api':     llama a los microservicios a través del gateway (/api/...).
//                 Es el modo del Taller 3, con el frontend servido por Apache.
// =====================================================================
const MODO = 'ejemplo';

// Página de inicio de cada rol (a dónde lleva el login)
const PAGINA_POR_ROL = {
  administrador: 'admin.html',
  bibliotecario: 'bibliotecario.html',
  lector: 'lector.html',
};

// Qué secciones ve cada rol y si puede modificarlas.
// Es solo para la interfaz: quien decide de verdad es el microservicio (403).
const SECCIONES_POR_ROL = {
  administrador: [
    { id: 'prestamos', nombre: 'Préstamos', editar: true },
    { id: 'libros', nombre: 'Libros', editar: true },
    { id: 'usuarios', nombre: 'Usuarios', editar: true },
  ],
  bibliotecario: [
    { id: 'prestamos', nombre: 'Préstamos', editar: true },
    { id: 'libros', nombre: 'Libros', editar: true },
  ],
  lector: [
    { id: 'libros', nombre: 'Catálogo', editar: false },
    { id: 'prestamos', nombre: 'Préstamos', editar: false },
  ],
};

const ROLES = ['administrador', 'bibliotecario', 'lector'];
