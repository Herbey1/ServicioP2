import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// crea si no existe
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// nombre único y "limpio"
function safeName(original) {
  const base = String(original).replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
  return `${Date.now()}_${base}`;
}

// fabrica un router "anidado" bajo /api/solicitudes/:id/archivos
export default function solicitudArchivosRouter(prisma, uploadRootAbs) {
  const router = express.Router({ mergeParams: true });

  // Multer storage por solicitud
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const solicitudId = req.params.id;
      const dest = path.join(uploadRootAbs, "solicitudes", solicitudId);
      try {
        ensureDirSync(dest);
        cb(null, dest);
      } catch (e) {
        cb(e);
      }
    },
    filename: (_req, file, cb) => {
      cb(null, safeName(file.originalname));
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
  });

  // verifica permisos (docente o ADMIN)
  async function canEdit(req, solicitudId) {
    // validación de formato de UUID
    if (!UUID_RE.test(solicitudId)) {
      return { ok: false, code: 400, msg: "ID de solicitud inválido" };
    }

    const s = await prisma.solicitudes.findUnique({
      where: { id: solicitudId },
      select: { docente_id: true }
    });
    if (!s) return { ok: false, code: 404, msg: "Solicitud no encontrada" };
    if (req.user?.rol === "ADMIN") return { ok: true, docenteId: s.docente_id };
    if (s.docente_id !== req.user?.sub) return { ok: false, code: 403, msg: "Sin permisos" };
    return { ok: true, docenteId: s.docente_id };
  }

  // subir 1 archivo
  router.post("/", upload.single("file"), async (req, res) => {
    try {
      const solicitudId = req.params.id;
      const perm = await canEdit(req, solicitudId);
      if (!perm.ok) return res.status(perm.code).json({ ok: false, msg: perm.msg });

      if (!req.file) return res.status(400).json({ ok: false, msg: "Falta archivo 'file'" });

      const record = await prisma.solicitud_archivos.create({
        data: {
          solicitud_id: solicitudId,
          filename: req.file.filename,              // guardamos el nombre físico
          mime_type: req.file.mimetype,
          bytes: req.file.size,
          url: `/uploads/solicitudes/${solicitudId}/${req.file.filename}`
        }
      });

      res.status(201).json({ ok: true, archivo: record });
    } catch (e) {
      console.error("ERROR subir archivo:", e);
      // si multer lanzó error de límite de tamaño
      if (e instanceof multer.MulterError && e.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ ok: false, msg: "Archivo excede 10MB" });
      }
      res.status(400).json({ ok: false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // listar archivos de una solicitud
  router.get("/", async (req, res) => {
    try {
      const solicitudId = req.params.id;
      const perm = await canEdit(req, solicitudId);
      if (!perm.ok) return res.status(perm.code).json({ ok: false, msg: perm.msg });

      const archivos = await prisma.solicitud_archivos.findMany({
        where: { solicitud_id: solicitudId },
        select: {
          id: true,
          solicitud_id: true,
          filename: true,
          mime_type: true,
          bytes: true,
          url: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" }
      });

      res.json({ ok: true, total: archivos.length, archivos });
    } catch (e) {
      console.error("ERROR listar archivos:", e);
      res.status(500).json({ ok: false, msg: "Error al listar archivos" });
    }
  });

  // descargar / ver un archivo
  // GET /api/solicitudes/:id/archivos/:archivoId/descargar?download=1
  router.get("/:archivoId/descargar", async (req, res) => {
    try {
      const { id: solicitudId, archivoId } = req.params;
      if (!UUID_RE.test(archivoId)) {
        return res.status(400).json({ ok: false, msg: "ID de archivo inválido" });
      }

      const perm = await canEdit(req, solicitudId);
      if (!perm.ok) return res.status(perm.code).json({ ok: false, msg: perm.msg });

      const row = await prisma.solicitud_archivos.findUnique({
        where: { id: archivoId }
      });
      if (!row || row.solicitud_id !== solicitudId) {
        return res.status(404).json({ ok: false, msg: "Archivo no encontrado" });
      }

      const filePath = path.join(uploadRootAbs, "solicitudes", solicitudId, row.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ ok: false, msg: "Archivo físico no encontrado" });
      }

      // Si viene ?download=1 forzamos descarga; si no, inline
      const forceDownload = String(req.query.download || "") === "1";
      res.setHeader("Content-Type", row.mime_type || "application/octet-stream");
      if (forceDownload) {
        res.setHeader("Content-Disposition", `attachment; filename="${row.filename}"`);
      } else {
        res.setHeader("Content-Disposition", `inline; filename="${row.filename}"`);
      }
      return res.sendFile(filePath);
    } catch (e) {
      console.error("ERROR descargar archivo:", e);
      res.status(500).json({ ok: false, msg: "Error al descargar archivo" });
    }
  });

  // borrar un archivo
  router.delete("/:archivoId", async (req, res) => {
    try {
      const solicitudId = req.params.id;
      const archivoId = req.params.archivoId;

      if (!UUID_RE.test(archivoId)) {
        return res.status(400).json({ ok: false, msg: "ID de archivo inválido" });
      }

      const perm = await canEdit(req, solicitudId);
      if (!perm.ok) return res.status(perm.code).json({ ok: false, msg: perm.msg });

      const row = await prisma.solicitud_archivos.findUnique({ where: { id: archivoId } });
      if (!row || row.solicitud_id !== solicitudId) {
        return res.status(404).json({ ok: false, msg: "Archivo no encontrado" });
      }

      // borrar archivo físico si existe
      const filePath = path.join(uploadRootAbs, "solicitudes", solicitudId, row.filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fsErr) {
        console.warn("No se pudo borrar el archivo físico:", fsErr.message);
      }

      await prisma.solicitud_archivos.delete({ where: { id: archivoId } });
      res.json({ ok: true });
    } catch (e) {
      console.error("ERROR eliminar archivo:", e);
      res.status(400).json({ ok: false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  return router;
}
