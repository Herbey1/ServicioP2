import express from "express";
import bcrypt from "bcrypt";

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
    deleted_at: user.deleted_at,
    created_at: user.created_at
  };
}

export default function usuariosRouter(prisma) {
  const router = express.Router();

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

    if (!nombre || !correo || !password) {
      return res.status(400).json({ ok: false, msg: "Nombre, correo y contraseña son requeridos" });
    }

    try {
      const hash = await bcrypt.hash(password, 12);
      const user = await prisma.usuarios.create({
        data: {
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          contrasena_hash: hash,
          rol: normalizedRole,
          verificado: true,
          deleted_at: null
        }
      });
      res.status(201).json({ ok: true, user: sanitizeUser(user) });
    } catch (error) {
      if (error?.code === "P2002") {
        return res.status(409).json({ ok: false, msg: "El correo ya está registrado" });
      }
      console.error("[USUARIOS] Error creando usuario", error);
      res.status(500).json({ ok: false, msg: "No se pudo crear el usuario" });
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

  return router;
}
