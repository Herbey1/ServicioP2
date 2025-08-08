const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Inicializar aplicación Express
const app = express();
app.use(express.json());
app.use(cors());

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sgca_fcqi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Verificar si el usuario existe y está activo
    const [users] = await pool.execute(
      'SELECT id, nombre, apellido_paterno, correo, rol_id FROM usuarios WHERE id = ? AND activo = 1',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol_id === 1) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

// Middleware para verificar rol de docente
const isDocente = (req, res, next) => {
  if (req.user && req.user.rol_id === 2) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de docente.' });
  }
};

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.originalUrl.includes('/reportes/') 
      ? './uploads/evidencias' 
      : './uploads/solicitudes';
    
    // Crear directorio si no existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtrar archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se permiten PDF, DOC, DOCX, JPG y PNG.'), false);
  }
};

// Configurar multer
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB máximo
});

// --------------------- RUTAS DE LA API ---------------------

// Ruta de prueba/salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'API funcionando correctamente', timestamp: new Date() });
});

// --------- Rutas de autenticación ---------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    if (!correo || !password) {
      return res.status(400).json({ error: 'Se requiere correo y contraseña' });
    }
    
    // Buscar usuario por correo
    const [users] = await pool.execute(
      'SELECT u.id, u.nombre, u.apellido_paterno, u.correo, u.password, u.rol_id, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.correo = ? AND u.activo = 1',
      [correo]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.rol_id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '8h' }
    );
    
    // Actualizar último acceso
    await pool.execute(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
      [user.id]
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido_paterno,
        correo: user.correo,
        rol: user.rol_nombre
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------- Rutas de usuario ---------
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, 
             u.telefono, d.nombre as departamento, pe.nombre as programa_educativo,
             u.categoria
      FROM usuarios u
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      LEFT JOIN programas_educativos pe ON u.programa_educativo_id = pe.id
      WHERE u.id = ?`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const userData = users[0];
    delete userData.password; // Asegurar que la contraseña no se envía
    
    res.json(userData);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, telefono } = req.body;
    
    // Actualizar información del usuario
    await pool.execute(
      `UPDATE usuarios 
       SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, telefono = ?
       WHERE id = ?`,
      [nombre, apellido_paterno, apellido_materno, telefono, req.user.id]
    );
    
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------- Rutas de datos maestros ---------
app.get('/api/departamentos', authenticateToken, async (req, res) => {
  try {
    const [departamentos] = await pool.execute('SELECT id, nombre FROM departamentos ORDER BY nombre');
    res.json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/programas', authenticateToken, async (req, res) => {
  try {
    const [programas] = await pool.execute(
      `SELECT pe.id, pe.nombre, pe.clave, d.nombre as departamento 
       FROM programas_educativos pe 
       JOIN departamentos d ON pe.departamento_id = d.id 
       ORDER BY pe.nombre`
    );
    res.json(programas);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/tipos-participacion', authenticateToken, async (req, res) => {
  try {
    const [tipos] = await pool.execute('SELECT id, nombre, descripcion FROM tipos_participacion ORDER BY nombre');
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de participación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/tipos-reporte', authenticateToken, async (req, res) => {
  try {
    const [tipos] = await pool.execute('SELECT id, nombre, descripcion FROM tipos_reporte ORDER BY nombre');
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------- Rutas de solicitudes ---------
app.get('/api/solicitudes', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT s.id, s.titulo, s.fecha_salida, s.fecha_regreso, s.ciudad, s.pais,
             tp.nombre as tipo_participacion, es.nombre as status,
             u.nombre as nombre_solicitante, u.apellido_paterno as apellido_solicitante
      FROM solicitudes_comision s
      JOIN usuarios u ON s.usuario_id = u.id
      JOIN tipos_participacion tp ON s.tipo_participacion_id = tp.id
      JOIN estados_solicitud es ON s.estado_id = es.id
    `;
    
    const params = [];
    
    // Filtros según el rol
    if (req.user.rol_id === 2) { // Docente - solo sus solicitudes
      query += ' WHERE s.usuario_id = ?';
      params.push(req.user.id);
    }
    
    // Ordenar por fecha de creación descendente (más recientes primero)
    query += ' ORDER BY s.creado_en DESC';
    
    const [solicitudes] = await pool.execute(query, params);
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/solicitudes', authenticateToken, isDocente, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      titulo, tipo_participacion_id, programa_educativo_id,
      fecha_salida, fecha_regreso, hora_salida, hora_regreso,
      ciudad, estado, pais, institucion, justificacion, objetivo, actividades
    } = req.body;
    
    // Validar campos requeridos
    if (!titulo || !tipo_participacion_id || !programa_educativo_id || !fecha_salida || 
        !fecha_regreso || !ciudad || !pais || !justificacion || !objetivo) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Verificar que la fecha de regreso sea posterior a la de salida
    if (new Date(fecha_regreso) < new Date(fecha_salida)) {
      return res.status(400).json({ error: 'La fecha de regreso debe ser posterior a la fecha de salida' });
    }
    
    // Insertar solicitud - estado 1 = "En revisión"
    const [result] = await connection.execute(
      `INSERT INTO solicitudes_comision (
        titulo, usuario_id, tipo_participacion_id, programa_educativo_id,
        fecha_salida, fecha_regreso, hora_salida, hora_regreso,
        ciudad, estado, pais, institucion, justificacion, objetivo, actividades, estado_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        titulo, req.user.id, tipo_participacion_id, programa_educativo_id,
        fecha_salida, fecha_regreso, hora_salida, hora_regreso,
        ciudad, estado, pais, institucion, justificacion, objetivo, actividades
      ]
    );
    
    // Crear notificación para administradores
    await connection.execute(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
       SELECT u.id, 'Nueva solicitud de comisión', ?, 'solicitud', ?
       FROM usuarios u WHERE u.rol_id = 1`,
      [`Se ha recibido una nueva solicitud de comisión: ${titulo}`, result.insertId]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Solicitud creada correctamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

app.get('/api/solicitudes/:id', authenticateToken, async (req, res) => {
  try {
    const solicitudId = req.params.id;
    
    // Obtener solicitud con información relacionada
    const [solicitudes] = await pool.execute(
      `SELECT s.*, 
              tp.nombre as tipo_participacion, 
              pe.nombre as programa_educativo,
              es.nombre as estado,
              es.color_texto, es.color_fondo,
              u.nombre as nombre_solicitante, 
              u.apellido_paterno as apellido_solicitante
       FROM solicitudes_comision s
       JOIN usuarios u ON s.usuario_id = u.id
       JOIN tipos_participacion tp ON s.tipo_participacion_id = tp.id
       JOIN programas_educativos pe ON s.programa_educativo_id = pe.id
       JOIN estados_solicitud es ON s.estado_id = es.id
       WHERE s.id = ?`,
      [solicitudId]
    );
    
    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const solicitud = solicitudes[0];
    
    // Verificar permiso (solo el propietario o admin)
    if (req.user.rol_id !== 1 && req.user.id !== solicitud.usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta solicitud' });
    }
    
    // Obtener archivos adjuntos
    const [archivos] = await pool.execute(
      'SELECT id, nombre_archivo, ruta_archivo, tipo_archivo FROM archivos_solicitud WHERE solicitud_id = ?',
      [solicitudId]
    );
    
    solicitud.archivos = archivos;
    
    res.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/solicitudes/:id', authenticateToken, async (req, res) => {
  try {
    const solicitudId = req.params.id;
    
    // Verificar que la solicitud exista y el usuario tenga permiso
    const [solicitudes] = await pool.execute(
      'SELECT usuario_id, estado_id FROM solicitudes_comision WHERE id = ?',
      [solicitudId]
    );
    
    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const solicitud = solicitudes[0];
    
    // Solo el propietario puede editar
    if (req.user.id !== solicitud.usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta solicitud' });
    }
    
    // Solo se pueden editar solicitudes en estado "En revisión" (1) o "Requiere correcciones" (4)
    if (![1, 4].includes(solicitud.estado_id)) {
      return res.status(400).json({ error: 'No se puede editar la solicitud en su estado actual' });
    }
    
    const {
      titulo, tipo_participacion_id, programa_educativo_id,
      fecha_salida, fecha_regreso, hora_salida, hora_regreso,
      ciudad, estado, pais, institucion, justificacion, objetivo, actividades
    } = req.body;
    
    // Actualizar solicitud
    await pool.execute(
      `UPDATE solicitudes_comision SET
        titulo = ?, tipo_participacion_id = ?, programa_educativo_id = ?,
        fecha_salida = ?, fecha_regreso = ?, hora_salida = ?, hora_regreso = ?,
        ciudad = ?, estado = ?, pais = ?, institucion = ?, 
        justificacion = ?, objetivo = ?, actividades = ?,
        estado_id = 1, actualizado_en = NOW()
       WHERE id = ?`,
      [
        titulo, tipo_participacion_id, programa_educativo_id,
        fecha_salida, fecha_regreso, hora_salida, hora_regreso,
        ciudad, estado, pais, institucion, justificacion, objetivo, actividades,
        solicitudId
      ]
    );
    
    // Si estaba en estado "Requiere correcciones", notificar al admin
    if (solicitud.estado_id === 4) {
      await pool.execute(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
         SELECT u.id, 'Solicitud corregida', ?, 'solicitud', ?
         FROM usuarios u WHERE u.rol_id = 1`,
        [`La solicitud "${titulo}" ha sido corregida y enviada para revisión.`, solicitudId]
      );
    }
    
    res.json({ message: 'Solicitud actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/solicitudes/:id', authenticateToken, isDocente, async (req, res) => {
  try {
    const solicitudId = req.params.id;
    
    // Verificar que la solicitud exista y el usuario tenga permiso
    const [solicitudes] = await pool.execute(
      'SELECT usuario_id, estado_id FROM solicitudes_comision WHERE id = ?',
      [solicitudId]
    );
    
    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const solicitud = solicitudes[0];
    
    // Solo el propietario puede eliminar
    if (req.user.id !== solicitud.usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta solicitud' });
    }
    
    // Solo se pueden eliminar solicitudes en estado "En revisión" (1) o "Requiere correcciones" (4)
    if (![1, 4].includes(solicitud.estado_id)) {
      return res.status(400).json({ error: 'No se puede eliminar la solicitud en su estado actual' });
    }
    
    // Eliminar archivos relacionados
    const [archivos] = await pool.execute(
      'SELECT ruta_archivo FROM archivos_solicitud WHERE solicitud_id = ?',
      [solicitudId]
    );
    
    // Eliminar los archivos físicos
    for (const archivo of archivos) {
      const filePath = path.join(__dirname, archivo.ruta_archivo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Eliminar registros de archivos y la solicitud
    await pool.execute('DELETE FROM archivos_solicitud WHERE solicitud_id = ?', [solicitudId]);
    await pool.execute('DELETE FROM solicitudes_comision WHERE id = ?', [solicitudId]);
    
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de revisión de solicitudes (Admin)
app.put('/api/solicitudes/:id/aprobar', authenticateToken, isAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const solicitudId = req.params.id;
    const { comentarios } = req.body;
    
    // Actualizar estado a "Aprobada" (2)
    await connection.execute(
      `UPDATE solicitudes_comision 
       SET estado_id = 2, comentarios_admin = ?, administrador_id = ?, fecha_revision = NOW()
       WHERE id = ?`,
      [comentarios, req.user.id, solicitudId]
    );
    
    // Obtener información de la solicitud
    const [solicitudes] = await connection.execute(
      'SELECT usuario_id, titulo FROM solicitudes_comision WHERE id = ?',
      [solicitudId]
    );
    
    if (solicitudes.length > 0) {
      // Crear notificación para el docente
      await connection.execute(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
         VALUES (?, 'Solicitud aprobada', ?, 'solicitud', ?)`,
        [solicitudes[0].usuario_id, `Tu solicitud "${solicitudes[0].titulo}" ha sido aprobada.`, solicitudId]
      );
    }
    
    await connection.commit();
    
    res.json({ message: 'Solicitud aprobada correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

app.put('/api/solicitudes/:id/rechazar', authenticateToken, isAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const solicitudId = req.params.id;
    const { comentarios } = req.body;
    
    if (!comentarios) {
      return res.status(400).json({ error: 'Se requieren comentarios para rechazar una solicitud' });
    }
    
    // Actualizar estado a "Rechazada" (3)
    await connection.execute(
      `UPDATE solicitudes_comision 
       SET estado_id = 3, comentarios_admin = ?, administrador_id = ?, fecha_revision = NOW()
       WHERE id = ?`,
      [comentarios, req.user.id, solicitudId]
    );
    
    // Obtener información de la solicitud
    const [solicitudes] = await connection.execute(
      'SELECT usuario_id, titulo FROM solicitudes_comision WHERE id = ?',
      [solicitudId]
    );
    
    if (solicitudes.length > 0) {
      // Crear notificación para el docente
      await connection.execute(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
         VALUES (?, 'Solicitud rechazada', ?, 'solicitud', ?)`,
        [solicitudes[0].usuario_id, `Tu solicitud "${solicitudes[0].titulo}" ha sido rechazada.`, solicitudId]
      );
    }
    
    await connection.commit();
    
    res.json({ message: 'Solicitud rechazada correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

app.put('/api/solicitudes/:id/devolver', authenticateToken, isAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const solicitudId = req.params.id;
    const { comentarios } = req.body;
    
    if (!comentarios) {
      return res.status(400).json({ error: 'Se requieren comentarios para devolver una solicitud' });
    }
    
    // Actualizar estado a "Requiere correcciones" (4)
    await connection.execute(
      `UPDATE solicitudes_comision 
       SET estado_id = 4, comentarios_admin = ?, administrador_id = ?, fecha_revision = NOW()
       WHERE id = ?`,
      [comentarios, req.user.id, solicitudId]
    );
    
    // Obtener información de la solicitud
    const [solicitudes] = await connection.execute(
      'SELECT usuario_id, titulo FROM solicitudes_comision WHERE id = ?',
      [solicitudId]
    );
    
    if (solicitudes.length > 0) {
      // Crear notificación para el docente
      await connection.execute(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
         VALUES (?, 'Solicitud requiere cambios', ?, 'solicitud', ?)`,
        [
          solicitudes[0].usuario_id, 
          `Tu solicitud "${solicitudes[0].titulo}" requiere correcciones. Por favor revisa los comentarios.`, 
          solicitudId
        ]
      );
    }
    
    await connection.commit();
    
    res.json({ message: 'Solicitud devuelta para correcciones correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al devolver solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// Rutas para archivos adjuntos
app.post('/api/solicitudes/:id/archivos', authenticateToken, isDocente, upload.single('archivo'), async (req, res) => {
  try {
    const solicitudId = req.params.id;
    
    // Verificar que la solicitud exista y el usuario tenga permiso
    const [solicitudes] = await pool.execute(
      'SELECT usuario_id, estado_id FROM solicitudes_comision WHERE id = ?',
      [solicitudId]
    );
    
    if (solicitudes.length === 0) {
      // Eliminar el archivo que se acaba de subir
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    // Verificar que sea el propietario
    if (req.user.id !== solicitudes[0].usuario_id) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'No tienes permiso para adjuntar archivos a esta solicitud' });
    }
    
    // Verificar que esté en estado editable
    if (![1, 4].includes(solicitudes[0].estado_id)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No se pueden adjuntar archivos en el estado actual de la solicitud' });
    }
    
    // Verificar límite de archivos
    const [configuracion] = await pool.execute(
      'SELECT valor FROM configuracion_sistema WHERE clave = ?',
      ['num_max_archivos_solicitud']
    );
    
    const maxArchivos = parseInt(configuracion[0]?.valor || 5);
    
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM archivos_solicitud WHERE solicitud_id = ?',
      [solicitudId]
    );
    
    if (countResult[0].total >= maxArchivos) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `No se pueden adjuntar más de ${maxArchivos} archivos` });
    }
    
    // Guardar referencia en la base de datos
    await pool.execute(
      'INSERT INTO archivos_solicitud (solicitud_id, nombre_archivo, ruta_archivo, tipo_archivo, tamaño_bytes) VALUES (?, ?, ?, ?, ?)',
      [solicitudId, req.file.originalname, req.file.path, req.file.mimetype, req.file.size]
    );
    
    // Actualizar indicador de archivos adjuntos
    await pool.execute(
      'UPDATE solicitudes_comision SET archivos_adjuntos = 1 WHERE id = ?',
      [solicitudId]
    );
    
    res.status(201).json({
      message: 'Archivo adjuntado correctamente',
      archivo: {
        nombre: req.file.originalname,
        tipo: req.file.mimetype,
        tamaño: req.file.size
      }
    });
  } catch (error) {
    console.error('Error al adjuntar archivo:', error);
    
    // Eliminar archivo en caso de error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------- Rutas para reportes ---------
app.get('/api/reportes', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT r.id, r.titulo, r.fecha_inicio, r.fecha_fin, 
             tr.nombre as tipo_reporte, es.nombre as status,
             u.nombre as nombre_docente, u.apellido_paterno as apellido_docente,
             es.color_texto, es.color_fondo
      FROM reportes_academicos r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN tipos_reporte tr ON r.tipo_reporte_id = tr.id
      JOIN estados_solicitud es ON r.estado_id = es.id
    `;
    
    const params = [];
    
    // Filtros según el rol
    if (req.user.rol_id === 2) { // Docente - solo sus reportes
      query += ' WHERE r.usuario_id = ?';
      params.push(req.user.id);
    }
    
    // Ordenar por fecha de creación descendente (más recientes primero)
    query += ' ORDER BY r.creado_en DESC';
    
    const [reportes] = await pool.execute(query, params);
    
    res.json(reportes);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/reportes', authenticateToken, isDocente, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      titulo, tipo_reporte_id, solicitud_id, fecha_inicio, fecha_fin,
      descripcion, resultados, conclusiones
    } = req.body;
    
    // Validar campos requeridos
    if (!titulo || !tipo_reporte_id || !fecha_inicio || !fecha_fin || !descripcion || !resultados) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Si se proporciona una solicitud_id, verificar que exista y pertenezca al usuario
    if (solicitud_id) {
      const [solicitudes] = await connection.execute(
        'SELECT id FROM solicitudes_comision WHERE id = ? AND usuario_id = ? AND estado_id = 2',
        [solicitud_id, req.user.id]
      );
      
      if (solicitudes.length === 0) {
        return res.status(400).json({ error: 'La solicitud especificada no existe, no te pertenece o no está aprobada' });
      }
    }
    
    // Insertar reporte - estado 1 = "En revisión"
    const [result] = await connection.execute(
      `INSERT INTO reportes_academicos (
        titulo, usuario_id, solicitud_id, tipo_reporte_id,
        fecha_inicio, fecha_fin, descripcion, resultados, conclusiones, estado_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        titulo, req.user.id, solicitud_id, tipo_reporte_id,
        fecha_inicio, fecha_fin, descripcion, resultados, conclusiones
      ]
    );
    
    // Crear notificación para administradores
    await connection.execute(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
       SELECT u.id, 'Nuevo reporte académico', ?, 'reporte', ?
       FROM usuarios u WHERE u.rol_id = 1`,
      [`Se ha recibido un nuevo reporte académico: ${titulo}`, result.insertId]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Reporte creado correctamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// --------- Rutas para notificaciones ---------
app.get('/api/notificaciones', authenticateToken, async (req, res) => {
  try {
    const [notificaciones] = await pool.execute(
      'SELECT id, titulo, mensaje, leida, tipo, referencia_id, fecha_envio FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_envio DESC LIMIT 50',
      [req.user.id]
    );
    
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/notificaciones/:id/leer', authenticateToken, async (req, res) => {
  try {
    const notificacionId = req.params.id;
    
    // Verificar que la notificación exista y pertenezca al usuario
    const [notificaciones] = await pool.execute(
      'SELECT id FROM notificaciones WHERE id = ? AND usuario_id = ?',
      [notificacionId, req.user.id]
    );
    
    if (notificaciones.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    // Marcar como leída
    await pool.execute(
      'UPDATE notificaciones SET leida = 1 WHERE id = ?',
      [notificacionId]
    );
    
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------- Iniciar servidor ---------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en puerto ${PORT}`);
});
