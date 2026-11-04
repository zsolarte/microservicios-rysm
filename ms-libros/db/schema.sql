-- db/schema.sql — base de datos de ms-libros
SET NAMES utf8mb4;

CREATE TABLE libros (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  titulo            VARCHAR(150) NOT NULL,
  autor             VARCHAR(100) NOT NULL,
  isbn              VARCHAR(20)  NOT NULL UNIQUE,
  anio_publicacion  INT          NOT NULL,
  ejemplares        INT          NOT NULL DEFAULT 0
);

INSERT INTO libros (titulo, autor, isbn, anio_publicacion, ejemplares) VALUES
  ('Cien años de soledad', 'Gabriel García Márquez', '978-0307474728', 1967, 3),
  ('La vorágine', 'José Eustasio Rivera', '978-8437620371', 1924, 2),
  ('María', 'Jorge Isaacs', '978-8437601219', 1867, 1);
