-- Añade columnas opcionales de perfil a la tabla usuarios
ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "telefono" TEXT;

ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "departamento" TEXT;

ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "categoria" TEXT;
