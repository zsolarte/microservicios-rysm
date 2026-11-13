// =====================================================================
// API: TODAS las llamadas del frontend pasan por aquí.
//   api('/libros')                                  → GET
//   api('/libros', { method: 'POST', body: {...} }) → POST
// Devuelve los datos de la respuesta, o lanza un ErrorApi con el código
// y el mensaje del microservicio (400, 403, 404, 409, 503…).
// =====================================================================
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles || [];
  }
}

async function api(ruta, opciones = {}) {
  const metodo = opciones.method || 'GET';
  const respuesta = MODO === 'api'
    ? await llamarApiReal(ruta, metodo, opciones.body)
    : await simularApi(ruta, metodo, opciones.body);

  if (respuesta.status === 401 && ruta !== '/usuarios/login') {
    cerrarSesion();                    // sin sesión o token vencido: volver a entrar
    return null;
  }
  if (respuesta.status >= 400) {
    const datos = respuesta.datos || {};
    throw new ErrorApi(respuesta.status, datos.error || 'Error inesperado', datos.detalles);
  }
  return respuesta.datos;
}

// --- MODO 'api': petición real al gateway, con el token ------------------
async function llamarApiReal(ruta, metodo, cuerpo) {
  const token = sessionStorage.getItem('token');
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  try {
    const r = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const datos = r.status === 204 ? null : await r.json().catch(() => null);
    return { status: r.status, datos };
  } catch (error) {
    return { status: 503, datos: { error: 'No hay conexión con el servidor' } };
  }
}

// --- MODO 'ejemplo': simula los microservicios en el navegador ----------
// Reproduce las mismas reglas de la API (permisos, 400, 404, 409) para que
// las pantallas se comporten igual que con los microservicios reales.
function cargarBase() {
  try {
    const guardada = sessionStorage.getItem('base-ejemplo');
    if (guardada) return JSON.parse(guardada);
  } catch (error) { /* sin almacenamiento: se usan los datos iniciales */ }
  return JSON.parse(JSON.stringify(DATOS_EJEMPLO));
}

function guardarBase(base) {
  try { sessionStorage.setItem('base-ejemplo', JSON.stringify(base)); } catch (e) { /* nada */ }
}

const r = (status, datos) => ({ status, datos });
const sinPassword = ({ password, ...u }) => u;

async function simularApi(ruta, metodo, cuerpo) {
  await new Promise((listo) => setTimeout(listo, 120));   // como si fuera la red
  const base = cargarBase();
  const [camino, consulta] = ruta.split('?');
  const [, recurso, parte] = camino.split('/');
  const params = new URLSearchParams(consulta || '');
  const usuario = usuarioActual();

  // POST /usuarios/login (público)
  if (recurso === 'usuarios' && parte === 'login') {
    const u = base.usuarios.find((x) => x.email === (cuerpo.email || '').trim().toLowerCase());
    if (!u || !u.activo || u.password !== cuerpo.password) {
      return r(401, { error: 'Email o contraseña incorrectos' });
    }
    return r(200, { token: `ejemplo-${u.id}`, usuario: sinPassword(u) });
  }

  if (!usuario) return r(401, { error: 'Falta el token de acceso' });
  const escribe = metodo !== 'GET';
  const id = parte && parte !== 'me' ? Number(parte) : null;

  // Permisos: los mismos de las rutas de cada microservicio
  if (recurso === 'usuarios') {
    const propio = metodo === 'GET' && (parte === 'me' || id === usuario.id);
    if (usuario.rol !== 'administrador' && !propio) {
      return r(403, { error: `El rol ${usuario.rol} no tiene permiso para esta operación` });
    }
  } else if (escribe && !['administrador', 'bibliotecario'].includes(usuario.rol)) {
    return r(403, { error: `El rol ${usuario.rol} no tiene permiso para esta operación` });
  }

  const tabla = base[recurso];
  if (!tabla) return r(404, { error: `No existe el recurso ${recurso}` });
  const nombre = { usuarios: 'usuario', libros: 'libro', prestamos: 'préstamo' }[recurso];
  const salida = (fila) => {
    if (recurso === 'usuarios') return sinPassword(fila);
    if (recurso !== 'prestamos') return fila;
    const libro = base.libros.find((l) => l.id === fila.libro_id);       // composición
    return { ...fila, libro: libro ? { id: libro.id, titulo: libro.titulo, autor: libro.autor } : null };
  };

  if (metodo === 'GET' && parte === 'me') return r(200, salida(base.usuarios.find((u) => u.id === usuario.id)));
  if (metodo === 'GET' && !id) {
    const estado = params.get('estado');
    return r(200, tabla.filter((f) => !estado || f.estado === estado).map(salida));
  }

  const posicion = id ? tabla.findIndex((f) => f.id === id) : -1;
  if (id && posicion === -1) return r(404, { error: `No existe el ${nombre} con id ${id}` });
  if (metodo === 'GET') return r(200, salida(tabla[posicion]));
  if (metodo === 'DELETE') {
    tabla.splice(posicion, 1);
    guardarBase(base);
    return r(204, null);
  }

  // POST y PUT: validaciones básicas y reglas de negocio
  const errores = validarEjemplo(recurso, cuerpo, metodo === 'POST');
  if (errores.length) return r(400, { error: 'Datos inválidos', detalles: errores });
  const repetido = (campo) => tabla.find((f) => f[campo] === cuerpo[campo] && f.id !== id);
  if (recurso === 'libros' && repetido('isbn')) return r(409, { error: `Ya existe un libro con el ISBN ${cuerpo.isbn}` });
  if (recurso === 'usuarios' && repetido('email')) return r(409, { error: `Ya existe un usuario con el email ${cuerpo.email}` });
  if (recurso === 'prestamos') {
    if (cuerpo.fecha_devolucion < cuerpo.fecha_prestamo) {
      return r(400, { error: 'fecha_devolucion no puede ser anterior a fecha_prestamo' });
    }
    if (!base.libros.some((l) => l.id === cuerpo.libro_id)) {
      return r(400, { error: `No existe el libro con id ${cuerpo.libro_id}` });
    }
  }

  if (metodo === 'POST') {
    const nuevo = { ...cuerpo, id: Math.max(0, ...tabla.map((f) => f.id)) + 1 };
    if (recurso === 'usuarios' && nuevo.activo === undefined) nuevo.activo = true;
    tabla.push(nuevo);
    guardarBase(base);
    return r(201, salida(nuevo));
  }
  const anterior = tabla[posicion];
  tabla[posicion] = { ...cuerpo, id, password: cuerpo.password || anterior.password };
  if (recurso !== 'usuarios') delete tabla[posicion].password;
  guardarBase(base);
  return r(200, salida(tabla[posicion]));
}

function validarEjemplo(recurso, d, creando) {
  const falta = (campos) => campos.filter((c) => d[c] === undefined || d[c] === '' || d[c] === null)
    .map((c) => `${c} es obligatorio`);
  if (recurso === 'libros') return falta(['titulo', 'autor', 'isbn', 'anio_publicacion', 'ejemplares']);
  if (recurso === 'prestamos') return falta(['libro_id', 'lector', 'fecha_prestamo', 'fecha_devolucion', 'estado']);
  const errores = falta(['nombre', 'email', 'rol']);
  if ((creando || d.password) && (!d.password || d.password.length < 8)) {
    errores.push('password es obligatoria y debe tener al menos 8 caracteres');
  }
  return errores;
}
