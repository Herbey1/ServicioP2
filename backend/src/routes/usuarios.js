import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";

const ROLE_MAP = {
  DOCENTE: "DOCENTE",
  ADMIN: "ADMIN",
  ADMINISTRATIVO: "ADMIN",
  ADMINISTRADOR: "ADMIN"
};

function normalizeRole(input) {
  if (!input || typeof input !== "string") return null;
  const key = input.trim().toUpperCase();
  return ROLE_MAP[key] ?? null;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    verificado: user.verificado,
    must_change_password: user.must_change_password ?? false,
    deleted_at: user.deleted_at,
    created_at: user.created_at
  };
}

export default function usuariosRouter(prisma) {
  const router = express.Router();
  const upload = multer();

  // Helper: try creating a user, but if the Prisma client doesn't know the
  // `must_change_password` argument (schema not migrated yet), retry without it.
  async function createUserCompat(createArgs) {
    try {
      return await prisma.usuarios.create(createArgs);
    } catch (err) {
      const msg = String(err?.message ?? err);
      if (msg.includes('must_change_password') || msg.includes('Unknown argument `must_change_password`')) {
        // Retry without the field
        const data = { ...createArgs.data };
        delete data.must_change_password;
        return await prisma.usuarios.create({ ...createArgs, data });
      }
      throw err;
    }
  }

  router.get("/", async (_req, res) => {
    try {
      const users = await prisma.usuarios.findMany({
        orderBy: [{ deleted_at: "asc" }, { nombre: "asc" }],
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          verificado: true,
          // must_change_password may not exist in DB until migrations are applied
          deleted_at: true,
          created_at: true
        }
      });
      res.json({ ok: true, items: users.map(sanitizeUser) });
    } catch (error) {
      console.error("[USUARIOS] Error listando usuarios", error);
      res.status(500).json({ ok: false, msg: "No se pudieron obtener los usuarios" });
    }
  });

  router.post("/", async (req, res) => {
    const { nombre, correo, password, rol } = req.body ?? {};
    const normalizedRole = normalizeRole(rol) ?? "DOCENTE";

    if (!nombre || !correo) {
      return res.status(400).json({ ok: false, msg: "Nombre y correo son requeridos" });
    }

    const email = String(correo).trim().toLowerCase();
    const allowed = /^[a-z0-9._%+-]+@uabc\.edu\.mx$/i.test(email);
    if (!allowed) {
      return res.status(400).json({ ok: false, msg: "El correo debe ser institucional (@uabc.edu.mx)" });
    }

    try {
      // Si no se provee password: para DOCENTE usar 'docente' y forzar cambio
      let toHash = password;
      let mustChange = false;
      if (!toHash) {
        if (normalizedRole === 'DOCENTE') {
          toHash = 'docente';
          mustChange = true;
        } else {
          return res.status(400).json({ ok: false, msg: 'Contraseña requerida para este rol' });
        }
      }
      const hash = await bcrypt.hash(String(toHash), 12);
      const user = await createUserCompat({ data: {
        nombre: nombre.trim(),
        correo: email,
        contrasena_hash: hash,
        rol: normalizedRole,
        verificado: true,
        must_change_password: mustChange,
        deleted_at: null
      } });
      res.status(201).json({ ok: true, user: sanitizeUser(user) });
    } catch (error) {
      if (error?.code === "P2002") {
        return res.status(409).json({ ok: false, msg: "El correo ya está registrado" });
      }
      console.error("[USUARIOS] Error creando usuario", error);
      res.status(500).json({ ok: false, msg: "No se pudo crear el usuario" });
    }
  });

  // Subida masiva vía CSV (archivo multipart/form-data, campo: file)
  router.post("/upload-csv", upload.single('file'), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ ok: false, msg: 'No se recibió archivo' });
      }

      const text = req.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        return res.status(400).json({ ok: false, msg: 'El archivo está vacío' });
      }

      const rows = [];
      // Detectar encabezado si existe (correo,nombre) u otros
      let startIdx = 0;
      const first = lines[0].toLowerCase();
      if (first.includes('correo') || first.includes('email') || first.includes('nombre') || first.includes('name')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const raw = lines[i];
        // Split en la primera coma: correo, resto -> nombre (permite comas en el nombre)
        const idx = raw.indexOf(',');
        if (idx === -1) {
          rows.push({ line: i + 1, raw, ok: false, reason: 'Formato inválido, se esperaba: correo,nombre' });
          continue;
        }
        const correo = raw.slice(0, idx).trim().replace(/^"|"$/g, '').toLowerCase();
        const nombre = raw.slice(idx + 1).trim().replace(/^"|"$/g, '');
        rows.push({ line: i + 1, raw, correo, nombre });
      }

      if (rows.length === 0) {
        return res.status(400).json({ ok: false, msg: 'No se encontraron filas válidas' });
      }

      // Validar correos válidos y dominio institucional
      const validRows = [];
      const invalid = [];
      const emailRegex = /^[a-z0-9._%+-]+@uabc\.edu\.mx$/i;
      for (const r of rows) {
        if (r.ok === false) { invalid.push(r); continue; }
        if (!r.correo || !r.nombre) { invalid.push({ ...r, reason: 'Correo o nombre vacío' }); continue; }
        if (!emailRegex.test(r.correo)) { invalid.push({ ...r, reason: 'Correo no institucional (@uabc.edu.mx) o formato inválido' }); continue; }
        validRows.push(r);
      }

      const emails = validRows.map(r => r.correo);
      // Buscar correos ya existentes
  const existing = await prisma.usuarios.findMany({ where: { correo: { in: emails } }, select: { correo: true } });
  // Normalizar correos encontrados en DB para comparación segura
  const existingSet = new Set(existing.map(e => String(e.correo).toLowerCase().trim()));

  const toCreate = validRows.filter(r => !existingSet.has(String(r.correo).toLowerCase().trim()));
  const skipped = validRows.filter(r => existingSet.has(String(r.correo).toLowerCase().trim())).map(r => ({ correo: r.correo, line: r.line }));

      const created = [];
      // Crear usuarios (contraseña aleatoria)
      await Promise.all(toCreate.map(async (r) => {
        // Para docentes, asignamos la contraseña por defecto 'docente' y forzamos cambio
        const defaultPwd = 'docente'
        const hash = await bcrypt.hash(defaultPwd, 12);
        try {
            const u = await createUserCompat({ data: {
              nombre: r.nombre,
              correo: r.correo,
              contrasena_hash: hash,
              rol: 'DOCENTE',
              verificado: true,
              must_change_password: true,
              deleted_at: null
            }, select: { id: true, nombre: true, correo: true } });
          created.push({ id: u.id, nombre: u.nombre, correo: u.correo });
        } catch (err) {
          // Si hay conflicto por otro proceso simultáneo, marcar como skip
          console.error('[USUARIOS CSV] Error creando usuario', r.correo, err);
          const reason = err?.code ? `${err.code}: ${err.message ?? String(err)}` : (err?.message || String(err) || 'Error al crear');
          skipped.push({ correo: r.correo, line: r.line, reason });
        }
      }));

      // Incluir también la lista de correos encontrados en la DB para facilitar diagnóstico en cliente
      const existing_db = Array.from(existingSet);

      return res.status(201).json({ ok: true, created_count: created.length, created, skipped, invalid, existing_db });
    } catch (error) {
      console.error('[USUARIOS CSV] Error procesando CSV', error);
      return res.status(500).json({ ok: false, msg: 'Error procesando el CSV' });
    }
  });

  router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, rol, activo, password } = req.body ?? {};

    if (!nombre && !rol && typeof activo !== "boolean" && !password) {
      return res.status(400).json({ ok: false, msg: "No hay cambios para aplicar" });
    }

    const data = {};
    if (nombre) data.nombre = nombre.trim();
    if (rol) {
      const normalizedRole = normalizeRole(rol);
      if (!normalizedRole) {
        return res.status(400).json({ ok: false, msg: "Rol no válido" });
      }
      data.rol = normalizedRole;
    }
    if (typeof activo === "boolean") {
      data.deleted_at = activo ? null : new Date();
    }
    if (password) {
      data.contrasena_hash = await bcrypt.hash(password, 12);
    }

    try {
      const updated = await prisma.usuarios.update({
        where: { id },
        data,
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          verificado: true,
          deleted_at: true,
          created_at: true
        }
      });
      res.json({ ok: true, user: sanitizeUser(updated) });
    } catch (error) {
      if (error?.code === "P2025") {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }
      console.error("[USUARIOS] Error actualizando usuario", error);
      res.status(500).json({ ok: false, msg: "No se pudo actualizar el usuario" });
    }
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.usuarios.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
      res.json({ ok: true });
    } catch (error) {
      if (error?.code === "P2025") {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }
      console.error("[USUARIOS] Error deshabilitando usuario", error);
      res.status(500).json({ ok: false, msg: "No se pudo deshabilitar el usuario" });
    }
  });

  router.delete("/:id/permanent", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.usuarios.delete({ where: { id } });
      res.json({ ok: true });
    } catch (error) {
      if (error?.code === "P2025") {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }
      console.error("[USUARIOS] Error eliminando usuario", error);
      res.status(500).json({ ok: false, msg: "No se pudo eliminar el usuario" });
    }
  });

  return router;
}
