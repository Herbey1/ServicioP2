import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.js";
import solicitudesRouter from "./routes/solicitudes.js";
import reportesRouter from "./routes/reportes.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import usuariosRouter from "./routes/usuarios.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// === ruta absoluta a /uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

// CORS Configuration - permisivo en producción
app.use(cors());
app.use(express.json());

// Root endpoint - simplest possible
app.get("/", (_req, res) => {
  res.status(200).json({ 
    ok: true, 
    message: "Backend is alive",
    timestamp: new Date().toISOString()
  });
});

// Health
app.get("/api/health", async (_req, res) => {
  try { 
    await prisma.$queryRaw`SELECT 1`; 
    res.status(200).json({ ok: true, message: "Backend is healthy" }); 
  }
  catch (e) { 
    console.error("Health check failed:", e);
    res.status(500).json({ ok: false, error: e.message }); 
  }
});

// Test endpoint
app.get("/api/test", (_req, res) => {
  res.status(200).json({ 
    ok: true, 
    message: "Backend is reachable",
    timestamp: new Date().toISOString()
  });
});

// Catálogos de ejemplo 
app.get("/api/catalogos/programas", async (_req, res) => {
  try {
    const data = await prisma.programas_educativos.findMany({ orderBy: { id: "asc" } });
    res.status(200).json(data);
  } catch (e) {
    console.error("Error fetching programas:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/catalogos/tipos-participacion", async (_req, res) => {
  try {
    const data = await prisma.tipos_participacion.findMany({ orderBy: { id: "asc" } });
    res.status(200).json(data);
  } catch (e) {
    console.error("Error fetching tipos-participacion:", e);
    res.status(500).json({ error: e.message });
  }
});

// Archivos subidos (p.ej. /uploads/solicitudes/<id>/<archivo>)
app.use("/uploads", express.static(UPLOAD_ROOT));

// Auth
app.use("/api/auth", authRouter(prisma));

// Solicitudes (todas requieren login)
app.use("/api/solicitudes", requireAuth, solicitudesRouter(prisma));

// Reportes (todas requieren login)
app.use("/api/reportes", requireAuth, reportesRouter(prisma));

// Gestión de usuarios (solo ADMIN)
app.use(
  "/api/usuarios",
  requireAuth,
  requireRole("ADMIN"),
  usuariosRouter(prisma)
);

// Error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 4000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ API started on http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`DATABASE_URL configured: ${process.env.DATABASE_URL ? 'yes' : 'NO - THIS IS A PROBLEM'}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});
