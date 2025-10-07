import express from "express";

const PROFILE_SELECT = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  telefono: true,
  departamento: true,
  categoria: true,
  verificado: true,
  created_at: true,
  updated_at: true,
};

function sanitizeProfile(user) {
  if (!user) return null;
  return {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    telefono: user.telefono,
    departamento: user.departamento,
    categoria: user.categoria,
    verificado: user.verificado,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

const MAX_NAME = 120;
const MAX_DEPARTAMENTO = 180;
const MAX_CATEGORIA = 120;
const MAX_TELEFONO = 40;

export default function perfilRouter(prisma) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const user = await prisma.usuarios.findUnique({
        where: { id: req.user.sub },
        select: PROFILE_SELECT,
      });
      if (!user) return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      res.json({ ok: true, profile: sanitizeProfile(user) });
    } catch (error) {
      console.error("[PERFIL] Error obteniendo perfil", error);
      res.status(500).json({ ok: false, msg: "No se pudo obtener el perfil" });
    }
  });

  router.put("/", async (req, res) => {
    const { nombre, telefono, departamento, categoria } = req.body ?? {};

    const data = {};
    const errors = [];

    const assignTrimmed = (key, value, maxLength, fieldName, allowEmpty = false) => {
      if (value === undefined) return;
      const trimmed = typeof value === "string" ? value.trim() : "";
      if (!allowEmpty && trimmed.length === 0) {
        errors.push(`El campo ${fieldName} no puede estar vacío`);
        return;
      }
      if (trimmed.length > maxLength) {
        errors.push(`El campo ${fieldName} supera el límite de ${maxLength} caracteres`);
        return;
      }
      data[key] = trimmed.length === 0 ? null : trimmed;
    };

    assignTrimmed("nombre", nombre, MAX_NAME, "nombre");
    assignTrimmed("telefono", telefono, MAX_TELEFONO, "teléfono", true);
    assignTrimmed("departamento", departamento, MAX_DEPARTAMENTO, "departamento", true);
    assignTrimmed("categoria", categoria, MAX_CATEGORIA, "categoría", true);

    if (errors.length > 0) {
      return res.status(400).json({ ok: false, msg: errors[0], errors });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ ok: false, msg: "No hay cambios para aplicar" });
    }

    try {
      data.updated_at = new Date();
      const updated = await prisma.usuarios.update({
        where: { id: req.user.sub },
        data,
        select: PROFILE_SELECT,
      });
      res.json({ ok: true, profile: sanitizeProfile(updated) });
    } catch (error) {
      console.error("[PERFIL] Error actualizando perfil", error);
      if (error?.code === "P2025") {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }
      res.status(500).json({ ok: false, msg: "No se pudo actualizar el perfil" });
    }
  });

  return router;
}
