-- Datos semilla SGCA (finales)
INSERT INTO programas_educativos (nombre) VALUES
  ('Ingeniería Química'),
  ('Ingeniería Industrial'),
  ('Ingeniería en Computación'),
  ('Ingeniería en Electrónica'),
  ('Ingeniería en Software y Tecnologías Emergentes'),
  ('Químico Farmacobiólogo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipos_participacion (nombre) VALUES
  ('Congreso'),
  ('Taller'),
  ('Viaje de prácticas'),
  ('Ponencia'),
  ('Capacitación')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, verificado, telefono, departamento, categoria) VALUES
  ('Administrador SGCA', 'admin@uabc.edu.mx', '$2b$12$4ohKrAK1CgLZ7GeYa1uUTuC63sLdwTheZZbj/O95YV5N7fdfElsmq', 'ADMIN', TRUE, '(686) 555-1000', 'Coordinación Administrativa', 'Administrador'),
  ('Docente de Prueba', 'docente@uabc.edu.mx', '$2b$12$mUAdfuxdlUwuQ0jUE9rjtezHi3EXjfrcbrzfEWsye7bRmGeQvK/he', 'DOCENTE', TRUE, '(686) 555-2000', 'Ingeniería en Computación', 'Docente de Tiempo Completo')
ON CONFLICT (correo) DO NOTHING;
