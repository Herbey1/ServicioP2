-- Esquema de base de datos para el Sistema de Gestión de Comisiones Académicas

-- 1. Tablas de usuarios
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50),
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Almacenar hash, no contraseñas en texto plano
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    departamento_id INT,
    programa_educativo_id INT,
    categoria VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    token_recuperacion VARCHAR(255),
    expiracion_token TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    FOREIGN KEY (programa_educativo_id) REFERENCES programas_educativos(id)
);

-- 2. Tablas organizacionales
CREATE TABLE departamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE programas_educativos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    clave VARCHAR(20) NOT NULL UNIQUE,
    departamento_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
);

-- 3. Tablas para comisiones
CREATE TABLE tipos_participacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE estados_solicitud (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    color_texto VARCHAR(20), -- Para los estilos en frontend
    color_fondo VARCHAR(20), -- Para los estilos en frontend
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE solicitudes_comision (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    usuario_id INT NOT NULL,
    tipo_participacion_id INT NOT NULL,
    programa_educativo_id INT NOT NULL,
    fecha_salida DATE NOT NULL,
    fecha_regreso DATE NOT NULL,
    hora_salida TIME,
    hora_regreso TIME,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100),
    pais VARCHAR(100) NOT NULL,
    institucion VARCHAR(255),
    justificacion TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    actividades TEXT,
    estado_id INT NOT NULL,
    comentarios_admin TEXT,
    administrador_id INT,
    fecha_revision TIMESTAMP,
    archivos_adjuntos BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tipo_participacion_id) REFERENCES tipos_participacion(id),
    FOREIGN KEY (programa_educativo_id) REFERENCES programas_educativos(id),
    FOREIGN KEY (estado_id) REFERENCES estados_solicitud(id),
    FOREIGN KEY (administrador_id) REFERENCES usuarios(id)
);

CREATE TABLE archivos_solicitud (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100),
    tamaño_bytes INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_comision(id) ON DELETE CASCADE
);

-- 4. Tablas para reportes académicos
CREATE TABLE tipos_reporte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reportes_academicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    usuario_id INT NOT NULL,
    solicitud_id INT, -- Puede ser NULL si no está asociado a una solicitud previa
    tipo_reporte_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descripcion TEXT NOT NULL,
    resultados TEXT NOT NULL,
    conclusiones TEXT,
    estado_id INT NOT NULL, -- Reutilizamos estados_solicitud
    comentarios_admin TEXT,
    administrador_id INT,
    fecha_revision TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_comision(id),
    FOREIGN KEY (tipo_reporte_id) REFERENCES tipos_reporte(id),
    FOREIGN KEY (estado_id) REFERENCES estados_solicitud(id),
    FOREIGN KEY (administrador_id) REFERENCES usuarios(id)
);

CREATE TABLE evidencias_reporte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporte_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100),
    tamaño_bytes INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporte_id) REFERENCES reportes_academicos(id) ON DELETE CASCADE
);

-- 5. Tablas de auditoría
CREATE TABLE log_actividad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    id_registro INT,
    detalle TEXT,
    direccion_ip VARCHAR(50),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 6. Tablas de configuración
CREATE TABLE configuracion_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    modificable BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Notificaciones
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    tipo VARCHAR(50), -- 'sistema', 'solicitud', 'reporte', etc.
    referencia_id INT, -- ID de la solicitud o reporte relacionado
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
