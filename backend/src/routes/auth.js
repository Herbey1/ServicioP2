import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";

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

    const token = jwt.sign({ sub: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.json({
      ok: true,
      token,
      user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol }
    });
  });

  return router;
}
