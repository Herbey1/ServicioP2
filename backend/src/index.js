import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.js";
import solicitudesRouter from "./routes/solicitudes.js";
import { requireAuth, requireRole } from "./middleware/auth.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();



// === ruta absoluta a /uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok: true }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Catálogos de ejemplo 
app.get("/api/catalogos/programas", async (_req, res) => {
  res.json(await prisma.programas_educativos.findMany({ orderBy: { id: "asc" } }));
});
app.get("/api/catalogos/tipos-participacion", async (_req, res) => {
  res.json(await prisma.tipos_participacion.findMany({ orderBy: { id: "asc" } }));
});

// Archivos subidos (p.ej. /uploads/solicitudes/<id>/<archivo>)
app.use("/uploads", express.static(UPLOAD_ROOT));

// Auth
app.use("/api/auth", authRouter(prisma));

// Solicitudes (todas requieren login)
app.use("/api/solicitudes", requireAuth, solicitudesRouter(prisma));

// Reportes (todas requieren login)
app.use("/api/reportes", requireAuth, reportesRouter(prisma));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
