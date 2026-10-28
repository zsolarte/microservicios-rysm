# Biblioteca de ejemplo · Proyecto de demostración

Aplicación web de una biblioteca construida con microservicios REST en Node.js + Express.
Proyecto de ejemplo de la docente para el Módulo 3 de Redes y Servicios Multimedia · UAO.

Muestra, paso a paso, lo que cada grupo construye en su propia aplicación. La biblioteca
es una empresa ficticia que no pertenece a ningún grupo.

## Integrantes

| Nombre | Usuario GitHub | Microservicio |
|--------|----------------|---------------|
| Zeida Solarte (docente) | @tu-usuario | todos |

## Microservicios

| Carpeta | Entidad | Responsable | Puerto | Consulta a | Estado |
|---|---|---|---|---|---|
| ms-usuarios | Usuarios (login y roles) | Docente | 3001 | — | Versión del Taller 1 |
| ms-libros | Libros | Docente | 3002 | — | Próximamente |
| ms-prestamos | Préstamos de libros | Docente | 3003 | ms-libros | Próximamente |

## Estructura del repositorio

- `ms-usuarios/`: microservicio de usuarios. En esta versión es el esqueleto en capas del
  Taller 1: datos en memoria y tres operaciones (listar, obtener por id y crear).
- `ms-libros/` y `ms-prestamos/`: se agregan más adelante, como ejemplo de una relación
  entre microservicios.
- `frontend/`: interfaz web (más adelante).
- `deploy/`: archivos de despliegue en las VMs (Taller 3).

## Cómo ejecutar un microservicio

Requisitos: Node.js 22.9 o superior.

```
cd ms-usuarios
npm install
copy .env.example .env      (en Linux o Mac: cp .env.example .env)
npm run dev
```

Prueben en el navegador: http://localhost:3001/health y http://localhost:3001/usuarios

## Convenciones del proyecto

- Cada microservicio vive en su propia carpeta y tiene su propio README con su contrato.
- Atributos en *snake_case* (`fecha_prestamo`, `libro_id`), iguales en el JSON y en la base de datos.
- Las relaciones entre microservicios se guardan como un id y se consultan por REST, nunca
  con llaves foráneas entre bases de datos.
- Mensajes de commit con el formato `ms-<recurso>: qué se hizo`.
- Nunca se suben `node_modules` ni `.env`.