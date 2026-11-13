// =====================================================================
// PANTALLA DE USUARIOS (ms-usuarios, solo administrador)
// Usa: GET /usuarios, POST /usuarios, PUT /usuarios/:id, DELETE /usuarios/:id
// =====================================================================
PANTALLAS.usuarios = async function (contenedor, { titulo, usuario: yo }) {
  contenedor.innerHTML = `
    <div class="cabecera-seccion">
      <div>
        <h1>${esc(titulo)}</h1>
        <p class="resumen" id="resumen-usuarios">Cargando…</p>
      </div>
      <div class="herramientas">
        <button class="boton" id="nuevo-usuario">Crear usuario</button>
      </div>
    </div>
    <div class="tabla-envoltura">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Email</th>
            <th scope="col">Rol</th>
            <th scope="col">Estado</th>
            <th scope="col"><span class="oculto">Acciones</span></th>
          </tr>
        </thead>
        <tbody id="lista-usuarios"></tbody>
      </table>
    </div>`;

  let usuarios = [];
  const campos = (creando) => [
    { nombre: 'nombre', etiqueta: 'Nombre' },
    { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
    { nombre: 'rol', etiqueta: 'Rol', tipo: 'select',
      opciones: ROLES.map((r) => ({ valor: r, texto: r })) },
    { nombre: 'activo', etiqueta: 'Estado', tipo: 'select',
      opciones: [{ valor: 'true', texto: 'Activo' }, { valor: 'false', texto: 'Inactivo' }] },
    { nombre: 'password', etiqueta: creando ? 'Contraseña' : 'Nueva contraseña (opcional)',
      tipo: 'password', opcional: !creando, ayuda: 'Mínimo 8 caracteres' },
  ];
  const aCuerpo = (datos) => ({ ...datos, activo: datos.activo === 'true' });

  const pintar = () => {
    const activos = usuarios.filter((u) => u.activo).length;
    document.getElementById('resumen-usuarios').textContent =
      `${usuarios.length} usuarios, ${activos} activos`;
    document.getElementById('lista-usuarios').innerHTML = usuarios.map((u) => `
      <tr>
        <td>${esc(u.nombre)}${u.id === yo.id ? ' <span class="sub">(usted)</span>' : ''}</td>
        <td>${esc(u.email)}</td>
        <td><span class="etiqueta-rol">${esc(u.rol)}</span></td>
        <td>${u.activo ? 'Activo' : '<span class="sub">Inactivo</span>'}</td>
        <td class="acciones">
          <button class="boton boton-suave" data-editar="${u.id}">Editar</button>
          ${u.id === yo.id ? '' : `<button class="boton boton-peligro" data-eliminar="${u.id}">Eliminar</button>`}
        </td>
      </tr>`).join('');
  };

  const cargar = async () => {
    try {
      usuarios = await api('/usuarios');
      pintar();
    } catch (error) { mostrarError(error); }
  };

  document.getElementById('nuevo-usuario').onclick = async () => {
    const datos = await pedirDatos('Crear usuario', campos(true), { rol: 'lector', activo: 'true' }, 'Crear usuario');
    if (!datos) return;
    try {
      await api('/usuarios', { method: 'POST', body: aCuerpo(datos) });
      mostrarMensaje(`Usuario creado: ${datos.nombre}`);
      cargar();
    } catch (error) { mostrarError(error); }
  };

  document.getElementById('lista-usuarios').onclick = async (evento) => {
    const idEditar = evento.target.dataset.editar;
    const idEliminar = evento.target.dataset.eliminar;
    const u = usuarios.find((x) => x.id === Number(idEditar || idEliminar));
    if (!u) return;
    try {
      if (idEditar) {
        const datos = await pedirDatos('Editar usuario', campos(false), { ...u, activo: String(u.activo) });
        if (!datos) return;
        await api(`/usuarios/${u.id}`, { method: 'PUT', body: aCuerpo(datos) });
        mostrarMensaje('Cambios guardados');
      } else {
        if (!(await confirmar(`¿Eliminar a ${u.nombre}?`, 'Eliminar usuario'))) return;
        await api(`/usuarios/${u.id}`, { method: 'DELETE' });
        mostrarMensaje(`Usuario eliminado: ${u.nombre}`);
      }
      cargar();
    } catch (error) { mostrarError(error); }
  };

  cargar();
};
