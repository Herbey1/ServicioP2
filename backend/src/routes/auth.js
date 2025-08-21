import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";

export default function authRouter(prisma) {
  const router = express.Router();

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    const { correo, password } = req.body;

console.log(`\n[AUTH] Intento de login para: ${correo}`);
    
    if (!correo || !password) {
      return res.status(400).json({ ok: false, msg: "Correo y contraseña requeridos" });
    }

    const user = await prisma.usuarios.findUnique({ where: { correo } });
    
    if (!user) {
      console.error(`[AUTH] Error: Usuario con correo "${correo}" no fue encontrado en la base de datos.`);
      return res.status(401).json({ ok: false, msg: "Credenciales inválidas" });
    }
    
    console.log(`[AUTH] Usuario encontrado: ${user.nombre}`);

    const ok = await bcrypt.compare(password, user.contrasena_hash);
    
    console.log(`[AUTH] Resultado de bcrypt.compare: ${ok}`);

    if (!ok) return res.status(401).json({ ok: false, msg: "Credenciales inválidas" });

    const token = jwt.sign({ sub: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.json({
      ok: true,
      token,
      user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol }
    });
  });

  return router;
}
