# ms-libros · Contrato de la API

Microservicio de ejemplo (biblioteca) para la demostración docente. Puerto: **3002**.

## Cómo ejecutarlo

1. Como root en MySQL: `CREATE DATABASE libros_db;`, `CREATE USER 'libros_user'@'localhost' IDENTIFIED BY 'una-clave-segura';`, `GRANT ALL PRIVILEGES ON libros_db.* TO 'libros_user'@'localhost';`
2. `mysql -u libros_user -p libros_db` y luego `SOURCE db/schema.sql;`
3. `npm install`, copiar `.env.example` como `.env`, `npm run dev`

## Representación

```json
{ "id": 1, "titulo": "Cien años de soledad", "autor": "Gabriel García Márquez", "isbn": "978-0307474728", "anio_publicacion": 1967, "ejemplares": 3 }
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| titulo | texto | Sí | No vacío |
| autor | texto | Sí | No vacío |
| isbn | texto | Sí | **Único** (409) |
| anio_publicacion | entero | Sí | Entre 1450 y el año actual |
| ejemplares | entero | Sí | Mayor o igual a 0 |

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /libros | 200 arreglo | — |
| Filtrar | GET | /libros?autor=Jorge Isaacs | 200 arreglo | — |
| Consultar por lotes | GET | /libros?ids=1,3 | 200 arreglo | 400 |
| Obtener | GET | /libros/:id | 200 objeto | 400 · 404 |
| Crear | POST | /libros | 201 objeto + Location | 400 · 409 |
| Actualizar | PUT | /libros/:id | 200 objeto | 400 · 404 · 409 |
| Eliminar | DELETE | /libros/:id | 204 | 400 · 404 |

## Relaciones

**Consulto a:** ninguno.

**Me consultan:**

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-prestamos | `GET /libros/:id` (validar) · `GET /libros?ids=…` (componer) | id, titulo, autor |

## Pruebas

Colección de Postman en `docs/ms-libros.postman_collection.json` (13 casos).
