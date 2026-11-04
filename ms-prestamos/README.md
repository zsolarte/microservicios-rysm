# ms-prestamos · Contrato de la API

Microservicio de ejemplo (biblioteca) para la demostración docente. Puerto: **3003**.

## Cómo ejecutarlo

1. Como root en MySQL: `CREATE DATABASE prestamos_db;`, `CREATE USER 'prestamos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';`, `GRANT ALL PRIVILEGES ON prestamos_db.* TO 'prestamos_user'@'localhost';`
2. `mysql -u prestamos_user -p prestamos_db` y luego `SOURCE db/schema.sql;`
3. `npm install`, copiar `.env.example` como `.env`, `npm run dev`

## Representación

Así responderá `GET /prestamos/1` cuando la relación esté implementada (semana 3). El objeto `libro` no se guarda: se pide a ms-libros.

```json
{ "id": 1, "libro_id": 1, "lector": "Camila Torres", "fecha_prestamo": "2026-10-20", "fecha_devolucion": "2026-11-03", "estado": "activo",
  "libro": { "id": 1, "titulo": "Cien años de soledad", "autor": "Gabriel García Márquez" } }
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| libro_id | entero | Sí | Debe existir en ms-libros (se valida en la semana 3) |
| lector | texto | Sí | No vacío |
| fecha_prestamo | fecha AAAA-MM-DD | Sí | — |
| fecha_devolucion | fecha AAAA-MM-DD | Sí | No anterior a fecha_prestamo (400) |
| estado | texto | Sí | activo o devuelto |

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /prestamos | 200 arreglo | — |
| Filtrar | GET | /prestamos?estado=activo | 200 arreglo | — |
| Obtener | GET | /prestamos/:id | 200 objeto | 400 · 404 |
| Crear | POST | /prestamos | 201 objeto + Location | 400 |
| Actualizar | PUT | /prestamos/:id | 200 objeto | 400 · 404 |
| Eliminar | DELETE | /prestamos/:id | 204 | 400 · 404 |

## Relaciones

**Consulto a:**

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que uso |
|---|---|---|---|---|
| libro_id | ms-libros | `GET /libros/:id` | `GET /libros?ids=…` | id, titulo, autor |

**Me consultan:** ninguno.

## Pruebas

Colección de Postman en `docs/ms-prestamos.postman_collection.json` (12 casos).
