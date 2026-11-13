// =====================================================================
// SESIÓN: inicio de sesión, usuario actual y cierre de sesión.
// El token y el usuario se guardan en sessionStorage: se borran al
// cerrar la pestaña.
// =====================================================================
function usuarioActual() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario'));
  } catch (error) {
    return null;
  }
}

async function iniciarSesion(email, password) {
  const { token, usuario } = await api('/usuarios/login', {
    method: 'POST',
    body: { email, password },
  });
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('usuario', JSON.stringify(usuario));   // nombre y rol
  location.href = PAGINA_POR_ROL[usuario.rol];
}

function cerrarSesion() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
  location.href = 'login.html';
}

// Cada página de rol llama a esto al cargar: sin sesión → login;
// con otro rol → a la página que le corresponde.
function exigirRol(rolDeLaPagina) {
  const usuario = usuarioActual();
  if (!usuario) {
    location.href = 'login.html';
    return null;
  }
  if (usuario.rol !== rolDeLaPagina) {
    location.href = PAGINA_POR_ROL[usuario.rol];
    return null;
  }
  return usuario;
}
