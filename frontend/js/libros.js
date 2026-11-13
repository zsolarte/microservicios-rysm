// =====================================================================
// PANTALLA DE LIBROS (responsable: ms-libros)
// Usa: GET /libros, POST /libros, PUT /libros/:id, DELETE /libros/:id
// =====================================================================
const CAMPOS_LIBRO = [
  { nombre: 'titulo', etiqueta: 'Título' },
  { nombre: 'autor', etiqueta: 'Autor' },
  { nombre: 'isbn', etiqueta: 'ISBN', ayuda: '978-…' },
  { nombre: 'anio_publicacion', etiqueta: 'Año de publicación', tipo: 'number', min: 1450 },
  { nombre: 'ejemplares', etiqueta: 'Ejemplares', tipo: 'number', min: 0 },
];

PANTALLAS.libros = async function (contenedor, { editar, titulo }) {
  contenedor.innerHTML = `
    <div class="cabecera-seccion">
      <div>
        <h1>${esc(titulo)}</h1>
        <p class="resumen" id="resumen-libros">Cargando…</p>
      </div>
      <div class="herramientas">
        <input type="search" id="buscar-libro" placeholder="Buscar por título o autor" aria-label="Buscar libro">
        ${editar ? '<button class="boton" id="nuevo-libro">Agregar libro</button>' : ''}
      </div>
    </div>
    <ul class="estante" id="lista-libros"></ul>`;

  let libros = [];

  const pintar = () => {
    const texto = document.getElementById('buscar-libro').value.trim().toLowerCase();
    const visibles = libros.filter((l) =>
      `${l.titulo} ${l.autor}`.toLowerCase().includes(texto));
    const total = libros.reduce((suma, l) => suma + l.ejemplares, 0);
    document.getElementById('resumen-libros').textContent =
      `${libros.length} títulos, ${total} ejemplares en total`;

    document.getElementById('lista-libros').innerHTML = visibles.length
      ? visibles.map((l) => `
        <li class="libro" style="--lomo:${colorLomo(l.id)}">
          <div class="lomo" aria-hidden="true"></div>
          <div class="libro-datos">
            <h3>${esc(l.titulo)}</h3>
            <p class="autor">${esc(l.autor)}, ${esc(l.anio_publicacion)}</p>
            <p class="ficha">ISBN ${esc(l.isbn)}</p>
          </div>
          <p class="ejemplares ${l.ejemplares === 0 ? 'agotado' : ''}">
            <strong>${esc(l.ejemplares)}</strong> ${l.ejemplares === 1 ? 'ejemplar' : 'ejemplares'}
          </p>
          ${editar ? `
          <div class="acciones">
            <button class="boton boton-suave" data-editar="${l.id}">Editar</button>
            <button class="boton boton-peligro" data-eliminar="${l.id}">Eliminar</button>
          </div>` : ''}
        </li>`).join('')
      : `<li class="vacio">${libros.length ? 'Ningún libro coincide con la búsqueda.' : 'Todavía no hay libros. Agregue el primero.'}</li>`;
  };

  const cargar = async () => {
    try {
      libros = await api('/libros');
      pintar();
    } catch (error) {
      document.getElementById('resumen-libros').textContent = 'No se pudo cargar el catálogo.';
      mostrarError(error);
    }
  };

  document.getElementById('buscar-libro').oninput = pintar;

  if (editar) {
    document.getElementById('nuevo-libro').onclick = async () => {
      const datos = await pedirDatos('Agregar libro', CAMPOS_LIBRO, {}, 'Agregar libro');
      if (!datos) return;
      try {
        await api('/libros', { method: 'POST', body: datos });
        mostrarMensaje(`Libro agregado: ${datos.titulo}`);
        cargar();
      } catch (error) { mostrarError(error); }
    };

    document.getElementById('lista-libros').onclick = async (evento) => {
      const idEditar = evento.target.dataset.editar;
      const idEliminar = evento.target.dataset.eliminar;
      const libro = libros.find((l) => l.id === Number(idEditar || idEliminar));
      if (!libro) return;
      try {
        if (idEditar) {
          const datos = await pedirDatos('Editar libro', CAMPOS_LIBRO, libro);
          if (!datos) return;
          await api(`/libros/${libro.id}`, { method: 'PUT', body: datos });
          mostrarMensaje('Cambios guardados');
        } else {
          if (!(await confirmar(`¿Eliminar «${libro.titulo}» del catálogo?`, 'Eliminar libro'))) return;
          await api(`/libros/${libro.id}`, { method: 'DELETE' });
          mostrarMensaje(`Libro eliminado: ${libro.titulo}`);
        }
        cargar();
      } catch (error) { mostrarError(error); }
    };
  }

  cargar();
};
