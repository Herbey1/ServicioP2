// backend/src/routes/perfil.js
import express from "express";

export function validateAndNormalizeTelefono(raw) {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { ok: false, msg: "Ingresa un teléfono válido" };
  }
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  const startsWithPlus52 = trimmed.startsWith("+52");

  if (startsWithPlus52 && digits.length === 12) {
    return { ok: true, value: "+52" + digits.slice(-10) };
  }
  if (!startsWithPlus52 && digits.length === 10) {
    return { ok: true, value: "+52" + digits };
  }
  if (startsWithPlus52 && digits.length < 12) {
    return { ok: false, msg: "Completa los 10 dígitos después de +52" };
  }
  if (!startsWithPlus52 && digits.length < 10) {
    return { ok: false, msg: "El teléfono debe tener 10 dígitos" };
  }
  return { ok: false, msg: "Formato inválido. Usa 10 dígitos o +52" };
}

export default function perfilRouter(prisma) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const me = await prisma.usuarios.findUnique({
        where: { id: req.user.sub },
        select: { id: true, nombre: true, correo: true, rol: true, telefono: true, verificado: true, created_at: true },
      });
      if (!me) return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      res.json({ ok: true, user: me });
    } catch (e) {
      res.status(500).json({ ok: false, msg: "No se pudo obtener el perfil" });
    }
  });

  router.put("/", async (req, res) => {
    try {
      const { telefono } = req.body ?? {};
      const v = validateAndNormalizeTelefono(telefono);
      if (!v.ok) return res.status(400).json({ ok: false, msg: v.msg });

      const updated = await prisma.usuarios.update({
        where: { id: req.user.sub },
        data: { telefono: v.value },
        select: { id: true, nombre: true, correo: true, rol: true, telefono: true, verificado: true, created_at: true },
      });
      res.json({ ok: true, user: updated });
    } catch (e) {
      if (e?.code === "P2025") return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      res.status(500).json({ ok: false, msg: "No se pudo actualizar el teléfono" });
    }
  });

  return router;
}
