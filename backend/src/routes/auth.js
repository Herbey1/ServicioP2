import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import crypto from "crypto";

export default function authRouter(prisma) {
  const router = express.Router();

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    const { correo, password, rolEsperado, rol, userType } = req.body;

    const providedRole = rolEsperado ?? rol ?? userType;
    const normalizedRole = typeof providedRole === "string" ? providedRole.trim().toUpperCase() : "";

    console.log(`\n[AUTH] Intento de login para: ${correo} (rol esperado: ${normalizedRole || "sin especificar"})`);

    if (!correo || !password || !normalizedRole) {
      return res.status(400).json({ ok: false, msg: "Correo, password y rol esperados son requeridos" });
    }

    const roleMap = {
      ADMINISTRADOR: "ADMIN",
      ADMIN: "ADMIN",
      DOCENTE: "DOCENTE"
    };

    const expectedRole = roleMap[normalizedRole];

    if (!expectedRole) {
      return res.status(400).json({ ok: false, msg: "Rol esperado no soportado" });
    }

    const user = await prisma.usuarios.findUnique({ where: { correo } });

    if (!user) {
      console.error(`[AUTH] Error: Usuario con correo "${correo}" no fue encontrado en la base de datos.`);
      return res.status(401).json({ ok: false, msg: "Credenciales invalidas" });
    }

    if (user.deleted_at) {
      console.warn(`[AUTH] Error: Usuario ${correo} está deshabilitado`);
      return res.status(403).json({ ok: false, msg: "El usuario está deshabilitado" });
    }

    const userRole = typeof user.rol === "string" ? user.rol.trim().toUpperCase() : "";

    if (userRole !== expectedRole) {
      console.warn(`[AUTH] Error: Rol seleccionado (${expectedRole}) no coincide con rol real (${userRole})`);
      return res.status(403).json({ ok: false, msg: "El correo no corresponde al tipo de usuario seleccionado" });
    }

    console.log(`[AUTH] Usuario encontrado: ${user.nombre}`);

    const ok = await bcrypt.compare(password, user.contrasena_hash);

    console.log(`[AUTH] Resultado de bcrypt.compare: ${ok}`);

    if (!ok) {
      return res.status(401).json({ ok: false, msg: "Credenciales invalidas" });
    }

    // Si el usuario usa la contraseña por defecto ('docente' o 'admin'), forzamos
    // el cambio de contraseña en la respuesta y tratamos de persistirlo en la BD
    const lowerPwd = String(password ?? '').trim();
    const defaultPwds = new Set(['docente', 'admin']);
    const usedDefaultPwd = defaultPwds.has(lowerPwd);

    if (usedDefaultPwd) {
      try {
        // Intentamos actualizar la columna must_change_password = true.
        await prisma.usuarios.update({ where: { id: user.id }, data: { must_change_password: true } });
      } catch (e) {
        // Si la columna no existe en la BD (cliente Prisma sin migración), ignoramos el error
        const msg = String(e?.message ?? '');
        if (!msg.includes('must_change_password') && !msg.includes('Unknown argument')) {
          console.error('[AUTH] Error actualizando must_change_password', e);
        }
      }
    }

    const token = jwt.sign({ sub: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "8h" });

    const responseMustChange = usedDefaultPwd || (user.must_change_password ?? false);

    res.json({
      ok: true,
      token,
      user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol, must_change_password: responseMustChange }
    });
  });

  // POST /api/auth/change-password (requiere login)
  router.post("/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body ?? {};
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ ok: false, msg: "Contraseña actual y nueva son requeridas" });
      }
      if (String(newPassword).trim().length < 8) {
        return res.status(400).json({ ok: false, msg: "La nueva contraseña debe tener al menos 8 caracteres" });
      }
      if (String(currentPassword) === String(newPassword)) {
        return res.status(400).json({ ok: false, msg: "La nueva contraseña no puede ser igual a la actual" });
      }

      const user = await prisma.usuarios.findUnique({ where: { id: req.user.sub } });
      if (!user || user.deleted_at) {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }

      const ok = await bcrypt.compare(currentPassword, user.contrasena_hash);
      if (!ok) {
        return res.status(401).json({ ok: false, msg: "La contraseña actual es incorrecta" });
      }

      const hash = await bcrypt.hash(String(newPassword), 12);
      // Intentamos actualizar incluyendo must_change_password; si la columna no existe,
      // reintentamos sin ella.
      try {
        await prisma.usuarios.update({ where: { id: user.id }, data: { contrasena_hash: hash, updated_at: new Date(), must_change_password: false } });
      } catch (e) {
        const msg = String(e?.message ?? '');
        if (msg.includes('must_change_password') || msg.includes('Unknown argument')) {
          // Retry without that field
          await prisma.usuarios.update({ where: { id: user.id }, data: { contrasena_hash: hash, updated_at: new Date() } });
        } else {
          throw e;
        }
      }

      return res.json({ ok: true });
    } catch (error) {
      console.error("[AUTH] Error al cambiar contraseña", error);
      return res.status(500).json({ ok: false, msg: "No se pudo cambiar la contraseña" });
    }
  });

  // POST /api/auth/forgot-password
  router.post("/forgot-password", async (req, res) => {
    try {
      const { correo } = req.body || {};
      if (!correo) return res.status(400).json({ ok: false, msg: "Correo requerido" });

      // Buscamos usuario (si no existe, devolvemos 200 para no filtrar existencia)
      const user = await prisma.usuarios.findUnique({ where: { correo } });

      if (!user) {
        // Responder 200 indistintamente
        return res.json({ ok: true });
      }

      // Crear token aleatorio
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      // Guardar en password_resets
      await prisma.password_resets.create({ data: { user_id: user.id, token, expires_at: expiresAt } });

      // Encolar email en email_queue (se procesará por un worker si existe)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
      const subject = 'Restablece tu contraseña';
      const body = `Hola ${user.nombre},\n\nVisita el siguiente enlace para restablecer tu contraseña:\n\n${resetLink}\n\nSi no solicitaste este cambio, ignora este mensaje.`;

      await prisma.email_queue.create({ data: { to_email: user.correo, subject, body } });

      return res.json({ ok: true });
    } catch (e) {
      console.error('[AUTH] Error forgot-password', e);
      return res.status(500).json({ ok: false, msg: 'No se pudo procesar la solicitud' });
    }
  });

  // POST /api/auth/reset-password
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) return res.status(400).json({ ok: false, msg: 'Token y nueva contraseña requeridos' });
      if (String(newPassword).trim().length < 8) return res.status(400).json({ ok: false, msg: 'La nueva contraseña debe tener al menos 8 caracteres' });

      const pr = await prisma.password_resets.findUnique({ where: { token } , include: { user: true }});
      if (!pr) return res.status(400).json({ ok: false, msg: 'Token inválido' });
      if (pr.used_at) return res.status(400).json({ ok: false, msg: 'Token ya usado' });
      if (pr.expires_at && pr.expires_at < new Date()) return res.status(400).json({ ok: false, msg: 'Token expirado' });

      const hash = await bcrypt.hash(String(newPassword), 12);
      await prisma.$transaction(async (tx) => {
        await tx.usuarios.update({ where: { id: pr.user_id }, data: { contrasena_hash: hash, updated_at: new Date() } });
        await tx.password_resets.update({ where: { id: pr.id }, data: { used_at: new Date() } });
      });

      return res.json({ ok: true });
    } catch (e) {
      console.error('[AUTH] Error reset-password', e);
      return res.status(500).json({ ok: false, msg: 'No se pudo restablecer la contraseña' });
    }
  });

  return router;
}
