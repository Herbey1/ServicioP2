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
    telefono: user.telefono,
    departamento: user.departamento,
    categoria: user.categoria,
    verificado: user.verificado,
    deleted_at: user.deleted_at,
    created_at: user.created_at
  };
}

export default function usuariosRouter(prisma) {
  const router = express.Router();

  const MAX_NAME = 120;
  const MAX_PHONE = 40;
  const MAX_DEPT = 180;
  const MAX_CATEGORIA = 120;

  router.get("/", async (_req, res) => {
    try {
      const users = await prisma.usuarios.findMany({
        orderBy: [{ deleted_at: "asc" }, { nombre: "asc" }],
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          telefono: true,
          departamento: true,
          categoria: true,
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
    const {
      nombre,
      correo,
      password,
      rol,
      telefono,
      departamento,
      categoria
    } = req.body ?? {};
    const normalizedRole = normalizeRole(rol) ?? "DOCENTE";

    if (!nombre || !correo || !password) {
      return res.status(400).json({ ok: false, msg: "Nombre, correo y contraseña son requeridos" });
    }

    const trimmedNombre = nombre.trim();
    const trimmedCorreo = correo.trim().toLowerCase();
    const trimmedTelefono = typeof telefono === "string" ? telefono.trim() : "";
    const trimmedDepartamento = typeof departamento === "string" ? departamento.trim() : "";
    const trimmedCategoria = typeof categoria === "string" ? categoria.trim() : "";

    if (!trimmedNombre) {
      return res.status(400).json({ ok: false, msg: "El nombre no puede estar vacío" });
    }
    if (trimmedNombre.length > MAX_NAME) {
      return res.status(400).json({ ok: false, msg: `El nombre supera ${MAX_NAME} caracteres` });
    }
    if (trimmedTelefono.length > MAX_PHONE) {
      return res.status(400).json({ ok: false, msg: `El teléfono supera ${MAX_PHONE} caracteres` });
    }
    if (trimmedDepartamento.length > MAX_DEPT) {
      return res.status(400).json({ ok: false, msg: `El departamento supera ${MAX_DEPT} caracteres` });
    }
    if (trimmedCategoria.length > MAX_CATEGORIA) {
      return res.status(400).json({ ok: false, msg: `La categoría supera ${MAX_CATEGORIA} caracteres` });
    }

    try {
      const hash = await bcrypt.hash(password, 12);
      const user = await prisma.usuarios.create({
        data: {
          nombre: trimmedNombre,
          correo: trimmedCorreo,
          contrasena_hash: hash,
          rol: normalizedRole,
          verificado: true,
          deleted_at: null,
          telefono: trimmedTelefono || null,
          departamento: trimmedDepartamento || null,
          categoria: trimmedCategoria || null
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
    const { nombre, rol, activo, password, telefono, departamento, categoria } = req.body ?? {};

    if (
      nombre === undefined &&
      rol === undefined &&
      typeof activo !== "boolean" &&
      password === undefined &&
      telefono === undefined &&
      departamento === undefined &&
      categoria === undefined
    ) {
      return res.status(400).json({ ok: false, msg: "No hay cambios para aplicar" });
    }

    const data = {};
    if (nombre !== undefined) {
      const trimmedNombre = typeof nombre === "string" ? nombre.trim() : "";
      if (!trimmedNombre) {
        return res.status(400).json({ ok: false, msg: "El nombre no puede estar vacío" });
      }
      if (trimmedNombre.length > MAX_NAME) {
        return res.status(400).json({ ok: false, msg: `El nombre supera ${MAX_NAME} caracteres` });
      }
      data.nombre = trimmedNombre;
    }
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
    if (telefono !== undefined) {
      const trimmedTelefono = typeof telefono === "string" ? telefono.trim() : "";
      if (trimmedTelefono.length > MAX_PHONE) {
        return res.status(400).json({ ok: false, msg: `El teléfono supera ${MAX_PHONE} caracteres` });
      }
      data.telefono = trimmedTelefono || null;
    }
    if (departamento !== undefined) {
      const trimmedDepartamento = typeof departamento === "string" ? departamento.trim() : "";
      if (trimmedDepartamento.length > MAX_DEPT) {
        return res.status(400).json({ ok: false, msg: `El departamento supera ${MAX_DEPT} caracteres` });
      }
      data.departamento = trimmedDepartamento || null;
    }
    if (categoria !== undefined) {
      const trimmedCategoria = typeof categoria === "string" ? categoria.trim() : "";
      if (trimmedCategoria.length > MAX_CATEGORIA) {
        return res.status(400).json({ ok: false, msg: `La categoría supera ${MAX_CATEGORIA} caracteres` });
      }
      data.categoria = trimmedCategoria || null;
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
          telefono: true,
          departamento: true,
          categoria: true,
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
