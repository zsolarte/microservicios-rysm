# Frontend · Biblioteca

HTML, CSS y JavaScript, sin framework ni instalación.

## Cómo abrirlo

**Modo ejemplo (Taller 2):** doble clic en `login.html`. Use una de las cuentas de prueba que aparecen bajo el formulario. Los datos son simulados (`js/datos-ejemplo.js`) y los cambios duran hasta cerrar la pestaña.

**Modo api (Taller 3):** en `js/config.js` cambie `const MODO = 'ejemplo';` por `'api'` y copie la carpeta a `/var/www/app` de servidor2. Las pantallas llaman a `/api/<recurso>` a través del gateway de Apache, con el token del usuario.

Las pantallas no cambian entre un modo y otro: el simulador responde con la misma forma que los microservicios.

## Estructura

| Archivo | Qué hace |
|---|---|
| `login.html` | Inicio de sesión; lleva a cada usuario a la página de su rol |
| `admin.html`, `bibliotecario.html`, `lector.html` | Página de inicio de cada rol |
| `js/config.js` | Modo, página de cada rol y secciones que ve cada rol |
| `js/api.js` | Todas las llamadas a la API (y el simulador del modo ejemplo) |
| `js/sesion.js` | Login, usuario actual y cierre de sesión |
| `js/app.js` | Estructura común: menú, mensajes y formularios |
| `js/libros.js` | Pantalla de libros (ms-libros) |
| `js/prestamos.js` | Pantalla de préstamos (ms-prestamos) |
| `js/usuarios.js` | Pantalla de usuarios (ms-usuarios) |
| `js/datos-ejemplo.js` | Datos simulados, con las filas iniciales de cada `schema.sql` |
| `css/estilos.css` | Estilos |

Cada entidad tiene su propio archivo de pantalla: es el archivo del responsable de ese microservicio.

## Reglas

- Ocultar un botón no es seguridad: quien decide es el microservicio (401, 403). La interfaz solo evita mostrar lo que el rol no puede usar.
- La pantalla de préstamos muestra el título del libro que viene **dentro** de cada préstamo (composición de ms-prestamos). No le pregunta nada a ms-libros para listar.
- Si ms-libros no responde, los préstamos llegan con `libro: null` y un `aviso`: la pantalla lo muestra y sigue funcionando.
