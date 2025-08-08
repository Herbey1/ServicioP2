-- Datos iniciales para el Sistema de Gestión de Comisiones Académicas

-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema con acceso completo'),
('docente', 'Usuario docente que puede solicitar comisiones y crear reportes');

-- Insertar departamentos
INSERT INTO departamentos (nombre) VALUES
('Departamento de Ingeniería en Computación'),
('Departamento de Ingeniería Eléctrica'),
('Departamento de Ingeniería Industrial'),
('Departamento de Ingeniería Civil'),
('Departamento de Ciencias Básicas');

-- Insertar programas educativos
INSERT INTO programas_educativos (nombre, clave, departamento_id) VALUES
('Ingeniería de Software', 'ISOFT', 1),
('Ingeniería en Computación', 'ICOMP', 1),
('Ingeniería Eléctrica', 'IELEC', 2),
('Ingeniería Industrial', 'IIND', 3),
('Ingeniería Civil', 'ICIVIL', 4),
('Bioingeniería', 'BIOING', 5);

-- Insertar tipos de participación
INSERT INTO tipos_participacion (nombre, descripcion) VALUES
('Ponente', 'Presentación de ponencia o conferencia'),
('Asistente', 'Asistencia a evento académico'),
('Instructor', 'Impartición de curso o taller'),
('Representante institucional', 'Representación oficial de la institución'),
('Colaborador', 'Colaboración en proyecto o investigación'),
('Otro', 'Otro tipo de participación');

-- Insertar estados de solicitud
INSERT INTO estados_solicitud (nombre, descripcion, color_texto, color_fondo) VALUES
('En revisión', 'Solicitud pendiente de revisión', 'text-blue-800', 'bg-blue-100'),
('Aprobada', 'Solicitud aprobada', 'text-green-800', 'bg-green-100'),
('Rechazada', 'Solicitud rechazada', 'text-red-800', 'bg-red-100'),
('Requiere correcciones', 'Solicitud devuelta para correcciones', 'text-yellow-800', 'bg-yellow-100');

-- Insertar tipos de reporte
INSERT INTO tipos_reporte (nombre, descripcion) VALUES
('Congreso', 'Reporte de asistencia a congreso'),
('Curso', 'Reporte de asistencia o impartición de curso'),
('Investigación', 'Reporte de actividad de investigación'),
('Vinculación', 'Reporte de actividad de vinculación'),
('Servicio', 'Reporte de actividad de servicio o extensión'),
('Otro', 'Otro tipo de reporte');

-- Insertar usuarios (contraseñas: 'password123' hasheada)
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, password, telefono, rol_id, departamento_id, programa_educativo_id, categoria) VALUES
-- Admin
('Administrador', 'Sistema', NULL, 'admin@uabc.edu.mx', '$2a$10$RIFb3d6hSFCg/Iw5pUD4iOhNHQLT0u0wgyxbX5k6UvA9LUSJVpGjG', '6461234567', 1, 1, 1, 'Administrativo'),
-- Docentes
('Fernando', 'Huerta', 'Gutiérrez', 'fernando.huerta@uabc.edu.mx', '$2a$10$RIFb3d6hSFCg/Iw5pUD4iOhNHQLT0u0wgyxbX5k6UvA9LUSJVpGjG', '6467654321', 2, 1, 2, 'Profesor de Tiempo Completo'),
('María', 'Pérez', 'López', 'maria.perez@uabc.edu.mx', '$2a$10$RIFb3d6hSFCg/Iw5pUD4iOhNHQLT0u0wgyxbX5k6UvA9LUSJVpGjG', '6461112233', 2, 2, 3, 'Profesor de Asignatura'),
('Javier', 'Rodríguez', 'Torres', 'javier.rodriguez@uabc.edu.mx', '$2a$10$RIFb3d6hSFCg/Iw5pUD4iOhNHQLT0u0wgyxbX5k6UvA9LUSJVpGjG', '6464445566', 2, 3, 4, 'Profesor de Tiempo Completo');

-- Insertar algunas solicitudes de comisión
INSERT INTO solicitudes_comision (titulo, usuario_id, tipo_participacion_id, programa_educativo_id, fecha_salida, fecha_regreso, ciudad, estado, pais, institucion, justificacion, objetivo, actividades, estado_id) VALUES
-- Solicitud en revisión
('Congreso Nacional de Ingeniería', 2, 1, 2, '2025-07-02', '2025-07-06', 'Monterrey', 'Nuevo León', 'México', 'Universidad Autónoma de Nuevo León', 
'Presentación de resultados de investigación en el área de desarrollo de software.', 
'Dar a conocer los avances del proyecto de investigación departamental y establecer redes de colaboración.', 
'Presentación de ponencia, asistencia a mesas de trabajo y reuniones con posibles colaboradores.', 1),

-- Solicitud aprobada
('Taller de Nuevas Tecnologías Web', 3, 3, 3, '2025-08-15', '2025-08-17', 'Guadalajara', 'Jalisco', 'México', 'Instituto Tecnológico de Occidente', 
'Impartición de taller especializado en tecnologías frontend modernas.', 
'Compartir conocimientos sobre React, Angular y Vue con estudiantes de otras instituciones.', 
'Impartición de taller de 12 horas dividido en 3 sesiones diarias.', 2),

-- Solicitud rechazada
('Simposio Internacional de Robótica', 4, 2, 4, '2025-09-10', '2025-09-15', 'Boston', 'Massachusetts', 'Estados Unidos', 'MIT', 
'Asistencia al simposio para actualización en tendencias de robótica industrial.', 
'Adquirir conocimientos actualizados para mejorar el contenido de las materias de automatización.', 
'Asistencia a conferencias, demostraciones de nuevos productos y talleres prácticos.', 3),

-- Solicitud que requiere correcciones
('Conferencia de Inteligencia Artificial', 2, 1, 2, '2025-10-05', '2025-10-10', 'Madrid', '', 'España', 'Universidad Politécnica de Madrid', 
'Presentación de paper aceptado sobre algoritmos de aprendizaje automático.', 
'Presentar resultados de investigación y establecer colaboraciones internacionales.', 
'Presentación de ponencia y participación en panel de discusión sobre IA en educación.', 4);

-- Insertar algunos reportes académicos
INSERT INTO reportes_academicos (titulo, usuario_id, solicitud_id, tipo_reporte_id, fecha_inicio, fecha_fin, descripcion, resultados, conclusiones, estado_id) VALUES
-- Reporte en revisión
('Reporte de asistencia a Taller de Tecnologías Web', 3, 2, 2, '2025-08-15', '2025-08-17',
'Se impartió el taller programado sobre tecnologías web modernas con enfoque práctico en React, Angular y Vue.',
'Se capacitó a 25 estudiantes y 5 docentes de la institución anfitriona. La evaluación de los asistentes fue muy positiva.',
'La actividad permitió establecer una relación de colaboración con la institución anfitriona para futuras actividades académicas conjuntas.',
1),

-- Reporte aprobado
('Informe de participación en Congreso Nacional de Ingeniería', 2, 1, 1, '2025-07-02', '2025-07-06',
'Se asistió al congreso programado donde se presentó la ponencia "Desarrollo de aplicaciones web con React y TailwindCSS".',
'La ponencia tuvo buena recepción y se establecieron contactos con investigadores de otras universidades interesados en colaborar.',
'La participación en el congreso fue muy beneficiosa, permitiendo difundir el trabajo realizado en la FCQI y establecer nuevas relaciones académicas.',
2);

-- Insertar configuración del sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('dias_anticipacion_solicitud', '15', 'Días de anticipación mínimos para presentar una solicitud de comisión'),
('max_dias_reporte', '7', 'Días máximos después de finalizada la comisión para presentar el reporte correspondiente'),
('num_max_archivos_solicitud', '5', 'Número máximo de archivos adjuntos por solicitud'),
('tam_max_archivo_mb', '10', 'Tamaño máximo en MB para los archivos adjuntos'),
('formatos_permitidos', 'pdf,doc,docx,jpg,png', 'Formatos de archivo permitidos para adjuntos');
