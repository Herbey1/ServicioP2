
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

-- Usuario admin listo para usar
-- Usuario: admin@uabc.edu.mx
-- Password: WkdbdY45LFtvoBdhfcGkGQ
INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, verificado)
VALUES ('Administrador SGCA', 'admin@uabc.edu.mx', '$2b$12$4ohKrAK1CgLZ7GeYa1uUTuC63sLdwTheZZbj/O95YV5N7fdfElsmq', 'ADMIN', TRUE)
ON CONFLICT (correo) DO NOTHING;
