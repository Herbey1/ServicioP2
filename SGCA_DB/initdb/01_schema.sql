-- SGCA - Esquema de Base de Datos
-- Requiere extensiones: uuid-ossp, citext
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================
-- Tipos ENUM
-- =====================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('DOCENTE','ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'solicitud_estado') THEN
        CREATE TYPE solicitud_estado AS ENUM ('EN_REVISION','APROBADA','RECHAZADA','DEVUELTA','CANCELADA');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reporte_estado') THEN
        CREATE TYPE reporte_estado AS ENUM ('PENDIENTE','EN_REVISION','APROBADO','RECHAZADO','DEVUELTO');
    ELSE
        BEGIN
            ALTER TYPE reporte_estado ADD VALUE IF NOT EXISTS 'RECHAZADO';
        EXCEPTION WHEN duplicate_object THEN
            -- valor ya existe o fue añadido en otra ejecución
            NULL;
        END;
    END IF;
END $$;

-- =====================
-- Usuarios y seguridad
-- =====================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    correo CITEXT UNIQUE NOT NULL CHECK (position('@' in correo) > 1),
    contrasena_hash TEXT NOT NULL,
    rol USER_ROLE NOT NULL DEFAULT 'DOCENTE',
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    correo CITEXT,
    success BOOLEAN NOT NULL,
    ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_time ON login_attempts (user_id, created_at DESC);

-- =====================
-- Catálogos
-- =====================
CREATE TABLE IF NOT EXISTS programas_educativos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipos_participacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- =====================
-- Solicitudes de comisión
-- =====================
CREATE TABLE IF NOT EXISTS solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    asunto TEXT NOT NULL,
    tipo_participacion_id INT NOT NULL REFERENCES tipos_participacion(id),
    ciudad TEXT NOT NULL,
    pais TEXT NOT NULL,
    lugar TEXT NOT NULL,
    fecha_salida DATE NOT NULL,
    hora_salida TIME NOT NULL,
    fecha_regreso DATE NOT NULL,
    hora_regreso TIME NOT NULL,
    num_personas INT NOT NULL CHECK (num_personas >= 1),
    usa_unidad_transporte BOOLEAN NOT NULL DEFAULT FALSE,
    cantidad_combustible NUMERIC(10,2),
    programa_educativo_id INT NOT NULL REFERENCES programas_educativos(id),
    alumnos_beneficiados INT NOT NULL CHECK (alumnos_beneficiados >= 0),
    proyecto_investigacion TEXT,
    cuerpo_academico TEXT,
    obtendra_constancia BOOLEAN NOT NULL DEFAULT FALSE,
    comentarios TEXT,
    estado SOLICITUD_ESTADO NOT NULL DEFAULT 'EN_REVISION',
    motivo_estado TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_solicitudes_docente ON solicitudes(docente_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fechas ON solicitudes(fecha_salida, fecha_regreso);
CREATE INDEX IF NOT EXISTS idx_solicitudes_programa ON solicitudes(programa_educativo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_tipo ON solicitudes(tipo_participacion_id);

CREATE TABLE IF NOT EXISTS solicitud_archivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    bytes INT NOT NULL CHECK (bytes > 0 AND bytes <= 10*1024*1024),
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_solicitud_archivos_solicitud ON solicitud_archivos(solicitud_id);

CREATE TABLE IF NOT EXISTS solicitud_estados_hist (
    id BIGSERIAL PRIMARY KEY,
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    de_estado SOLICITUD_ESTADO,
    a_estado SOLICITUD_ESTADO NOT NULL,
    motivo TEXT,
    actor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_solicitud_estados_hist_sol ON solicitud_estados_hist(solicitud_id, created_at);

-- =====================
-- Reportes
-- =====================
CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL UNIQUE REFERENCES solicitudes(id) ON DELETE CASCADE,
    docente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    descripcion TEXT,
    estado REPORTE_ESTADO NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reportes_docente ON reportes(docente_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);

CREATE TABLE IF NOT EXISTS reporte_evidencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png')),
    bytes INT NOT NULL CHECK (bytes > 0 AND bytes <= 10*1024*1024),
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reporte_evidencias_rep ON reporte_evidencias(reporte_id);

CREATE TABLE IF NOT EXISTS reporte_actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reporte_estados_hist (
    id BIGSERIAL PRIMARY KEY,
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    de_estado REPORTE_ESTADO,
    a_estado REPORTE_ESTADO NOT NULL,
    motivo TEXT,
    actor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reporte_estados_hist_rep ON reporte_estados_hist(reporte_id, created_at);

-- =====================
-- Notificaciones y recordatorios
-- =====================
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    asunto TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    canal TEXT NOT NULL DEFAULT 'EMAIL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS email_queue (
    id BIGSERIAL PRIMARY KEY,
    to_email CITEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_email_queue_sched ON email_queue(scheduled_at, sent_at);

CREATE TABLE IF NOT EXISTS recordatorios_reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL UNIQUE REFERENCES reportes(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_envio TIMESTAMPTZ,
    proximo_envio TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- Auditoría
-- =====================
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion TEXT NOT NULL,
    entidad TEXT NOT NULL,
    entidad_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad, created_at DESC);

-- =====================
-- Vistas para analítica
-- =====================
CREATE OR REPLACE VIEW v_solicitudes_resumen AS
SELECT
    s.id,
    s.docente_id,
    u.nombre AS docente_nombre,
    s.estado,
    s.tipo_participacion_id,
    tp.nombre AS tipo_participacion,
    s.programa_educativo_id,
    pe.nombre AS programa,
    s.lugar,
    s.ciudad,
    s.pais,
    s.fecha_salida,
    s.fecha_regreso,
    (s.fecha_regreso - s.fecha_salida) AS dias,
    s.created_at
FROM solicitudes s
JOIN usuarios u ON u.id = s.docente_id
JOIN tipos_participacion tp ON tp.id = s.tipo_participacion_id
JOIN programas_educativos pe ON pe.id = s.programa_educativo_id;

CREATE OR REPLACE VIEW v_reportes_resumen AS
SELECT
    r.id,
    r.solicitud_id,
    r.docente_id,
    u.nombre AS docente_nombre,
    r.estado,
    r.created_at,
    r.updated_at
FROM reportes r
JOIN usuarios u ON u.id = r.docente_id;

CREATE OR REPLACE VIEW v_metricas_solicitudes AS
SELECT estado, COUNT(*) AS total FROM solicitudes GROUP BY estado;

CREATE OR REPLACE VIEW v_metricas_reportes AS
SELECT estado, COUNT(*) AS total FROM reportes GROUP BY estado;

-- =====================
-- Triggers
-- =====================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_solicitudes_updated
BEFORE UPDATE ON solicitudes
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_reportes_updated
BEFORE UPDATE ON reportes
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE OR REPLACE FUNCTION desactivar_recordatorio_reporte() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'APROBADO' THEN
    UPDATE recordatorios_reportes SET activo = FALSE WHERE reporte_id = NEW.id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reporte_aprobado
AFTER UPDATE OF estado ON reportes
FOR EACH ROW EXECUTE PROCEDURE desactivar_recordatorio_reporte();
