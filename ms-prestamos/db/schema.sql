-- db/schema.sql — base de datos de ms-prestamos
SET NAMES utf8mb4;

CREATE TABLE prestamos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  libro_id          INT          NOT NULL,       -- referencia a ms-libros: SIN FOREIGN KEY
  lector            VARCHAR(100) NOT NULL,
  fecha_prestamo    DATE         NOT NULL,
  fecha_devolucion  DATE         NOT NULL,
  estado            VARCHAR(20)  NOT NULL
);

INSERT INTO prestamos (libro_id, lector, fecha_prestamo, fecha_devolucion, estado) VALUES
  (1, 'Camila Torres', '2026-10-20', '2026-11-03', 'activo'),
  (3, 'Andrés Rojas', '2026-10-15', '2026-10-29', 'devuelto'),
  (1, 'Valentina Ruiz', '2026-10-27', '2026-11-10', 'activo');
