// =====================================================================
// ESTRUCTURA COMÚN de las páginas de cada rol: encabezado, menú,
// mensajes y formularios. Cada entidad tiene su propio archivo de
// pantalla (libros.js, prestamos.js, usuarios.js), registrado en PANTALLAS.
// =====================================================================
const PANTALLAS = {};

// Escapa texto antes de ponerlo en el HTML (evita inyectar etiquetas)
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatoFecha(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- Mensajes al usuario --------------------------------------------------
function mostrarMensaje(texto, tipo = 'ok') {
  const zona = document.getElementById('mensajes');
  const aviso = document.createElement('div');
  aviso.className = `mensaje mensaje-${tipo}`;
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.textContent = texto;
  zona.appendChild(aviso);
  setTimeout(() => aviso.remove(), tipo === 'error' ? 6000 : 3000);
}

function mostrarError(error) {
  const detalle = error.detalles && error.detalles.length ? `: ${error.detalles.join('; ')}` : '';
  mostrarMensaje(`${error.message}${detalle}`, 'error');
}

// --- Formulario en un cuadro de diálogo ----------------------------------
// campos: [{ nombre, etiqueta, tipo: 'text'|'number'|'date'|'email'|'password'|'select', opciones }]
// Devuelve una promesa con los datos escritos, o null si se cancela.
function pedirDatos(titulo, campos, valores = {}, textoBoton = 'Guardar') {
  const dialogo = document.getElementById('dialogo');
  const filas = campos.map((c) => {
    const valor = valores[c.nombre] ?? '';
    const control = c.tipo === 'select'
      ? `<select name="${c.nombre}" ${c.opcional ? '' : 'required'}>
           ${c.opciones.map((o) => `<option value="${esc(o.valor)}" ${String(o.valor) === String(valor) ? 'selected' : ''}>${esc(o.texto)}</option>`).join('')}
         </select>`
      : `<input name="${c.nombre}" type="${c.tipo || 'text'}" value="${esc(valor)}"
           ${c.opcional ? '' : 'required'} ${c.min !== undefined ? `min="${c.min}"` : ''}
           ${c.ayuda ? `placeholder="${esc(c.ayuda)}"` : ''}>`;
    return `<label class="campo"><span>${esc(c.etiqueta)}</span>${control}</label>`;
  }).join('');

  dialogo.innerHTML = `
    <form method="dialog" class="formulario">
      <h2>${esc(titulo)}</h2>
      ${filas}
      <div class="acciones-form">
        <button type="button" class="boton boton-suave" value="cancelar">Cancelar</button>
        <button type="submit" class="boton">${esc(textoBoton)}</button>
      </div>
    </form>`;

  return new Promise((resolver) => {
    const form = dialogo.querySelector('form');
    form.querySelector('[value="cancelar"]').onclick = () => { dialogo.close(); resolver(null); };
    form.onsubmit = (evento) => {
      evento.preventDefault();
      const datos = {};
      for (const c of campos) {
        const texto = form.elements[c.nombre].value.trim();
        if (c.opcional && texto === '') continue;
        datos[c.nombre] = c.tipo === 'number' || c.numero ? Number(texto) : texto;
      }
      dialogo.close();
      resolver(datos);
    };
    dialogo.oncancel = () => resolver(null);
    dialogo.showModal();
    (form.querySelector('input, select') || form.querySelector('[type=submit]')).focus();
  });
}

async function confirmar(texto, textoBoton) {
  const respuesta = await pedirDatos(texto, [], {}, textoBoton);
  return respuesta !== null;
}

// --- Arranque de cada página de rol ---------------------------------------
function iniciarPagina(rol) {
  const usuario = exigirRol(rol);
  if (!usuario) return;

  document.getElementById('nombre-usuario').textContent = usuario.nombre;
  document.getElementById('rol-usuario').textContent = usuario.rol;
  document.getElementById('cerrar-sesion').onclick = cerrarSesion;
  if (MODO === 'ejemplo') document.getElementById('modo').hidden = false;

  const secciones = SECCIONES_POR_ROL[rol];
  const menu = document.getElementById('menu');
  menu.innerHTML = secciones.map((s) =>
    `<a href="#${s.id}" data-seccion="${s.id}">${esc(s.nombre)}</a>`).join('');

  const mostrar = () => {
    const actual = secciones.find((s) => `#${s.id}` === location.hash) || secciones[0];
    menu.querySelectorAll('a').forEach((a) =>
      a.toggleAttribute('aria-current', a.dataset.seccion === actual.id));
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '';
    PANTALLAS[actual.id](contenido, { editar: actual.editar, titulo: actual.nombre, usuario });
  };
  window.addEventListener('hashchange', mostrar);
  mostrar();
}

// Color de lomo para cada libro: el mismo libro siempre tiene el mismo color
function colorLomo(id) {
  const colores = ['#7A2E2A', '#1F4D3A', '#2D4A73', '#8A6A1F', '#5B3A5E', '#3F5F5A'];
  return colores[(Number(id) || 0) % colores.length];
}
