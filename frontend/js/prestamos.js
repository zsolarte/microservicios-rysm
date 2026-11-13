// =====================================================================
// PANTALLA DE PRÉSTAMOS (responsable: ms-prestamos)
// Usa: GET /prestamos?estado=, POST, PUT, DELETE /prestamos/:id
// El título del libro llega DENTRO de cada préstamo (composición que hace
// ms-prestamos): esta pantalla no le pregunta nada a ms-libros para listar.
// Solo el formulario pide GET /libros, para llenar la lista de opciones.
// =====================================================================
PANTALLAS.prestamos = async function (contenedor, { editar, titulo }) {
  contenedor.innerHTML = `
    <div class="cabecera-seccion">
      <div>
        <h1>${esc(titulo)}</h1>
        <p class="resumen" id="resumen-prestamos">Cargando…</p>
      </div>
      <div class="herramientas">
        <div class="filtro" role="group" aria-label="Filtrar por estado">
          <button data-estado="" aria-pressed="true">Todos</button>
          <button data-estado="activo" aria-pressed="false">Activos</button>
          <button data-estado="devuelto" aria-pressed="false">Devueltos</button>
        </div>
        ${editar ? '<button class="boton" id="nuevo-prestamo">Registrar préstamo</button>' : ''}
      </div>
    </div>
    <div id="aviso-prestamos"></div>
    <div class="tabla-envoltura">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Libro</th>
            <th scope="col">Lector</th>
            <th scope="col">Prestado</th>
            <th scope="col">Devolver antes del</th>
            <th scope="col">Estado</th>
            ${editar ? '<th scope="col"><span class="oculto">Acciones</span></th>' : ''}
          </tr>
        </thead>
        <tbody id="lista-prestamos"></tbody>
      </table>
    </div>`;

  let prestamos = [];
  let estado = '';
  const hoy = new Date().toISOString().slice(0, 10);

  const pintar = () => {
    // Si ms-libros no respondió, ms-prestamos manda libro: null y un aviso
    const aviso = prestamos.find((p) => p.aviso);
    document.getElementById('aviso-prestamos').innerHTML = aviso
      ? `<p class="mensaje mensaje-alerta">No se pudieron cargar los títulos de los libros (${esc(aviso.aviso)}). Los préstamos se muestran sin ellos.</p>`
      : '';
    const activos = prestamos.filter((p) => p.estado === 'activo').length;
    document.getElementById('resumen-prestamos').textContent = estado
      ? `${prestamos.length} préstamos ${estado === 'activo' ? 'activos' : 'devueltos'}`
      : `${prestamos.length} préstamos, ${activos} sin devolver`;

    document.getElementById('lista-prestamos').innerHTML = prestamos.length
      ? prestamos.map((p) => {
        const vencido = p.estado === 'activo' && p.fecha_devolucion < hoy;
        const sello = vencido ? 'vencido' : p.estado;
        return `
        <tr>
          <td>
            ${p.libro
              ? `<span class="titulo-libro" style="--lomo:${colorLomo(p.libro.id)}">${esc(p.libro.titulo)}</span>
                 <span class="sub">${esc(p.libro.autor)}</span>`
              : `<span class="sub">Libro ${esc(p.libro_id)} (sin datos)</span>`}
          </td>
          <td>${esc(p.lector)}</td>
          <td>${formatoFecha(p.fecha_prestamo)}</td>
          <td>${formatoFecha(p.fecha_devolucion)}</td>
          <td><span class="sello sello-${sello}">${sello}</span></td>
          ${editar ? `
          <td class="acciones">
            <button class="boton boton-suave" data-editar="${p.id}">Editar</button>
            <button class="boton boton-peligro" data-eliminar="${p.id}">Eliminar</button>
          </td>` : ''}
        </tr>`;
      }).join('')
      : `<tr><td class="vacio" colspan="6">No hay préstamos ${estado ? 'con ese estado' : 'registrados'}.</td></tr>`;
  };

  const cargar = async () => {
    try {
      prestamos = await api(estado ? `/prestamos?estado=${estado}` : '/prestamos');
      pintar();
    } catch (error) {
      document.getElementById('resumen-prestamos').textContent = 'No se pudieron cargar los préstamos.';
      mostrarError(error);
    }
  };

  contenedor.querySelector('.filtro').onclick = (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;
    estado = boton.dataset.estado;
    contenedor.querySelectorAll('.filtro button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b === boton)));
    cargar();
  };

  // Campos del formulario: la lista de libros se pide a ms-libros
  const camposPrestamo = async () => {
    const libros = await api('/libros');
    return [
      { nombre: 'libro_id', etiqueta: 'Libro', tipo: 'select', numero: true,
        opciones: libros.map((l) => ({ valor: l.id, texto: `${l.titulo} (${l.ejemplares} disp.)` })) },
      { nombre: 'lector', etiqueta: 'Lector' },
      { nombre: 'fecha_prestamo', etiqueta: 'Fecha del préstamo', tipo: 'date' },
      { nombre: 'fecha_devolucion', etiqueta: 'Devolver antes del', tipo: 'date' },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'select',
        opciones: [{ valor: 'activo', texto: 'Activo' }, { valor: 'devuelto', texto: 'Devuelto' }] },
    ];
  };

  if (editar) {
    document.getElementById('nuevo-prestamo').onclick = async () => {
      try {
        const enDosSemanas = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
        const datos = await pedirDatos('Registrar préstamo', await camposPrestamo(),
          { fecha_prestamo: hoy, fecha_devolucion: enDosSemanas, estado: 'activo' }, 'Registrar préstamo');
        if (!datos) return;
        await api('/prestamos', { method: 'POST', body: datos });
        mostrarMensaje(`Préstamo registrado para ${datos.lector}`);
        cargar();
      } catch (error) { mostrarError(error); }
    };

    document.getElementById('lista-prestamos').onclick = async (evento) => {
      const idEditar = evento.target.dataset.editar;
      const idEliminar = evento.target.dataset.eliminar;
      const prestamo = prestamos.find((p) => p.id === Number(idEditar || idEliminar));
      if (!prestamo) return;
      try {
        if (idEditar) {
          const datos = await pedirDatos('Editar préstamo', await camposPrestamo(), prestamo);
          if (!datos) return;
          await api(`/prestamos/${prestamo.id}`, { method: 'PUT', body: datos });
          mostrarMensaje('Cambios guardados');
        } else {
          if (!(await confirmar(`¿Eliminar el préstamo de ${prestamo.lector}?`, 'Eliminar préstamo'))) return;
          await api(`/prestamos/${prestamo.id}`, { method: 'DELETE' });
          mostrarMensaje('Préstamo eliminado');
        }
        cargar();
      } catch (error) { mostrarError(error); }
    };
  }

  cargar();
};
