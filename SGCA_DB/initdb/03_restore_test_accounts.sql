-- Restaurar cuentas de prueba y asegurar que estén activas

-- Añadir columna must_change_password si no existe (para compatibilidad con migraciones nuevas)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

-- Insertar o actualizar cuentas de prueba
-- Hasheos bcrypt precomputados (mismos que en 02_seed.sql)
INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, verificado, deleted_at, must_change_password)
VALUES
  ('Administrador SGCA', 'admin@uabc.edu.mx', '$2b$12$4ohKrAK1CgLZ7GeYa1uUTuC63sLdwTheZZbj/O95YV5N7fdfElsmq', 'ADMIN', TRUE, NULL, FALSE),
  ('Docente de Prueba', 'docente@uabc.edu.mx', '$2b$12$mUAdfuxdlUwuQ0jUE9rjtezHi3EXjfrcbrzfEWsye7bRmGeQvK/he', 'DOCENTE', TRUE, NULL, FALSE)
ON CONFLICT (correo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  contrasena_hash = EXCLUDED.contrasena_hash,
  rol = EXCLUDED.rol,
  verificado = EXCLUDED.verificado,
  deleted_at = NULL,
  must_change_password = EXCLUDED.must_change_password;
