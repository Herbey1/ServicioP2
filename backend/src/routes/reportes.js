// backend/src/routes/reportes.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth, requireRole } from "../middleware/auth.js";

const asInt = (v) => (v !== undefined && v !== null ? parseInt(v, 10) : undefined);
const ESTADOS_REPORTE = ["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO", "DEVUELTO"];
const MAX_SIZE = 10 * 1024 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeName(original) {
  const base = String(original).replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
  return `${Date.now()}_${base}`;
}

function canTransition(from, to) {
  if (from === to) return true;
  if (["APROBADO", "RECHAZADO"].includes(from)) return false;
  if (from === "EN_REVISION" && ["APROBADO", "RECHAZADO", "DEVUELTO"].includes(to)) return true;
  if (from === "DEVUELTO" && to === "EN_REVISION") return true;
  return false;
}

export default function reportesRouter(prisma) {
  const router = express.Router();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const reporteId = req.params.id;
      const dest = path.join(UPLOAD_ROOT, "reportes", reporteId);
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

  const mapReporte = (item) => ({
    id: item.id,
    solicitud_id: item.solicitud_id,
    asunto: item.solicitud.asunto,
    descripcion: item.descripcion,
    estado: item.estado,
    fecha_entrega: item.created_at,
    docente_id: item.docente_id,
    usuarios: { nombre: item.docente.nombre },
    last_change_at: item.estados_hist?.[0]?.created_at ?? item.updated_at,
    last_change_by: item.estados_hist?.[0]?.actor?.nombre ?? null,
    hist_count: item._count?.estados_hist ?? 0,
    motivo_estado: (item.estado === "DEVUELTO" || item.estado === "RECHAZADO") ? (item.estados_hist?.[0]?.motivo ?? null) : null,
    is_pending: false,
    evidencias: item.evidencias ?? [],
  });

  const mapPendingSolicitud = (item) => ({
    id: null,
    solicitud_id: item.id,
    asunto: item.asunto,
    descripcion: null,
    estado: "PENDIENTE",
    fecha_entrega: null,
    docente_id: item.docente_id,
    usuarios: { nombre: item.docente.nombre },
    last_change_at: item.updated_at,
    last_change_by: null,
    hist_count: 0,
    motivo_estado: null,
    is_pending: true,
    evidencias: [],
  });

  async function canEditReporte(req, reporteId) {
    if (!UUID_RE.test(reporteId)) {
      return { ok: false, code: 400, msg: "ID de reporte invalido" };
    }

    const reporte = await prisma.reportes.findUnique({
      where: { id: reporteId },
      select: { docente_id: true, estado: true }
    });
    if (!reporte) return { ok: false, code: 404, msg: "Reporte no encontrado" };
    if (req.user?.rol === "ADMIN") return { ok: true, reporte };
    if (reporte.docente_id !== req.user?.sub) return { ok: false, code: 403, msg: "Sin permisos" };
    return { ok: true, reporte };
  }

  async function ensureDuePendingReportes() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const solicitudesVencidas = await prisma.solicitudes.findMany({
      where: {
        estado: "APROBADA",
        fecha_regreso: { lte: today },
        reporte: null,
      },
      select: {
        id: true,
        docente_id: true,
      }
    });

    if (solicitudesVencidas.length === 0) return;

    await prisma.$transaction(
      solicitudesVencidas.map((solicitud) =>
        prisma.reportes.create({
          data: {
            solicitud_id: solicitud.id,
            docente_id: solicitud.docente_id,
            descripcion: null,
            estado: "PENDIENTE",
          }
        })
      )
    );
  }

  // GET /api/reportes
  router.get("/", requireAuth, async (req, res) => {
    try {
      await ensureDuePendingReportes();

      const { estado, page = 1, size = 20 } = req.query;

      const where = {};
      if (estado && ESTADOS_REPORTE.includes(estado)) {
        where.estado = estado;
      }

      if (req.user.rol !== "ADMIN") {
        where.docente_id = req.user.sub;
      }

      const pendingWhere = {
        estado: "APROBADA",
        reporte: null,
      };
      if (req.user.rol !== "ADMIN") {
        pendingWhere.docente_id = req.user.sub;
      }

      const take = Math.min(asInt(size) || 20, 100);
      const skip = (asInt(page) > 1 ? (asInt(page) - 1) * take : 0);
      const includePending = !estado || estado === "PENDIENTE";

      const [reportItems, pendingItems] = await prisma.$transaction([
        prisma.reportes.findMany({
          where,
          orderBy: { created_at: "desc" },
          include: {
            docente: { select: { nombre: true } },
            solicitud: { select: { asunto: true } },
            evidencias: { orderBy: { created_at: "desc" } },
            estados_hist: {
              orderBy: { created_at: "desc" },
              take: 1,
              select: {
                created_at: true,
                motivo: true,
                a_estado: true,
                actor: { select: { nombre: true } },
              },
            },
            _count: { select: { estados_hist: true } },
          },
        }),
        includePending
          ? prisma.solicitudes.findMany({
              where: pendingWhere,
              orderBy: { updated_at: "desc" },
              include: {
                docente: { select: { nombre: true } },
              },
            })
          : prisma.solicitudes.findMany({ where: { id: "00000000-0000-0000-0000-000000000000" } }),
      ]);

      const allItems = [
        ...reportItems.map(mapReporte),
        ...pendingItems.map(mapPendingSolicitud),
      ].sort((a, b) => {
        const aDate = new Date(a.fecha_entrega ?? a.last_change_at ?? 0).getTime();
        const bDate = new Date(b.fecha_entrega ?? b.last_change_at ?? 0).getTime();
        return bDate - aDate;
      });
      const total = allItems.length;
      const reportes = allItems.slice(skip, skip + take);

      res.json({ total, page: asInt(page) || 1, size: take, items: reportes });
    } catch (e) {
      console.error("ERROR al listar reportes:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // POST /api/reportes
  router.post("/", requireAuth, async (req, res) => {
    try {
      const { solicitud_id, descripcion } = req.body || {};
      if (!solicitud_id) return res.status(400).json({ ok: false, msg: "Falta solicitud_id" });

      const sol = await prisma.solicitudes.findUnique({ where: { id: solicitud_id } });
      if (!sol) return res.status(404).json({ ok: false, msg: "Solicitud no encontrada" });
      if (req.user.rol !== "ADMIN" && sol.docente_id !== req.user.sub) {
        return res.status(403).json({ ok: false, msg: "Solo el duenio puede crear el reporte" });
      }
      if (sol.estado !== "APROBADA") {
        return res.status(409).json({ ok: false, msg: "Solo se puede crear reporte para solicitudes APROBADAS" });
      }

      try {
        const created = await prisma.$transaction(async (tx) => {
          const reporte = await tx.reportes.create({
            data: {
              solicitud_id,
              docente_id: sol.docente_id,
              descripcion: descripcion ?? null,
              estado: "EN_REVISION",
            },
            include: { docente: { select: { nombre: true } }, solicitud: { select: { asunto: true } } },
          });
          await tx.reporte_estados_hist.create({
            data: {
              reporte_id: reporte.id,
              de_estado: null,
              a_estado: "EN_REVISION",
              motivo: "Reporte enviado por el docente",
              actor_id: req.user.sub,
            },
          });
          return reporte;
        });

        const out = {
          id: created.id,
          solicitud_id: created.solicitud_id,
          asunto: created.solicitud.asunto,
          descripcion: created.descripcion,
          estado: created.estado,
          fecha_entrega: created.created_at,
          docente_id: created.docente_id,
          usuarios: { nombre: created.docente.nombre },
        };
        return res.status(201).json({ ok: true, reporte: out });
      } catch (e) {
        if (e?.code === "P2002") {
          return res.status(409).json({ ok: false, msg: "Ya existe un reporte para esta solicitud" });
        }
        throw e;
      }
    } catch (e) {
      console.error("ERROR crear reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // POST /api/reportes/:id/evidencias
  router.post("/:id/evidencias", requireAuth, upload.single("file"), async (req, res) => {
    try {
      const reporteId = req.params.id;
      const perm = await canEditReporte(req, reporteId);
      if (!perm.ok) return res.status(perm.code).json({ ok: false, msg: perm.msg });

      if (!["PENDIENTE", "EN_REVISION", "DEVUELTO"].includes(perm.reporte.estado)) {
        return res.status(409).json({ ok: false, msg: "Solo se puede adjuntar evidencia en PENDIENTE, EN_REVISION o DEVUELTO" });
      }

      if (!req.file) return res.status(400).json({ ok: false, msg: "Falta archivo 'file'" });

      const record = await prisma.reporte_evidencias.create({
        data: {
          reporte_id: reporteId,
          filename: req.file.filename,
          mime_type: req.file.mimetype,
          bytes: req.file.size,
          url: `/uploads/reportes/${reporteId}/${req.file.filename}`
        }
      });

      res.status(201).json({ ok: true, evidencia: record });
    } catch (e) {
      console.error("ERROR subir evidencia de reporte:", e);
      if (e instanceof multer.MulterError && e.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ ok: false, msg: "Archivo excede 10MB" });
      }
      res.status(400).json({ ok: false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // GET /api/reportes/:id
  router.get("/:id", requireAuth, async (req, res) => {
    try {
      const r = await prisma.reportes.findUnique({
        where: { id: req.params.id },
        include: {
          docente: { select: { nombre: true } },
          solicitud: { select: { asunto: true } },
          estados_hist: {
            orderBy: { created_at: "asc" },
            select: {
              de_estado: true,
              a_estado: true,
              motivo: true,
              created_at: true,
              actor: { select: { nombre: true } },
            },
          },
          evidencias: true,
          actividades: true,
        },
      });
      if (!r) return res.status(404).json({ ok: false, msg: "No encontrado" });
      if (req.user.rol !== "ADMIN" && r.docente_id !== req.user.sub) {
        return res.status(403).json({ ok: false, msg: "Sin permisos" });
      }

      const out = {
        id: r.id,
        solicitud_id: r.solicitud_id,
        asunto: r.solicitud.asunto,
        descripcion: r.descripcion,
        estado: r.estado,
        fecha_entrega: r.created_at,
        docente_id: r.docente_id,
        usuarios: { nombre: r.docente.nombre },
        estados_hist: r.estados_hist,
        evidencias: r.evidencias,
        actividades: r.actividades,
      };
      res.json(out);
    } catch (e) {
      console.error("ERROR detalle reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // PATCH /api/reportes/:id/estado
  router.patch("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const { estado, motivo } = req.body || {};
      if (!ESTADOS_REPORTE.includes(estado)) {
        return res.status(400).json({ ok: false, msg: "Estado invalido" });
      }

      const id = req.params.id;
      const curr = await prisma.reportes.findUnique({ where: { id } });
      if (!curr) return res.status(404).json({ ok: false, msg: "Reporte no encontrado" });
      if (!canTransition(curr.estado, estado)) {
        return res.status(409).json({ ok: false, msg: `Transicion ${curr.estado} -> ${estado} no permitida` });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const upd = await tx.reportes.update({
          where: { id },
          data: { estado, updated_at: new Date() },
          include: {
            docente: { select: { nombre: true } },
            solicitud: { select: { asunto: true } },
          },
        });
        await tx.reporte_estados_hist.create({
          data: {
            reporte_id: id,
            de_estado: curr.estado,
            a_estado: estado,
            motivo: motivo ?? null,
            actor_id: req.user.sub,
          },
        });
        return upd;
      });

      const out = {
        id: updated.id,
        solicitud_id: updated.solicitud_id,
        asunto: updated.solicitud.asunto,
        descripcion: updated.descripcion,
        estado: updated.estado,
        fecha_entrega: updated.created_at,
        docente_id: updated.docente_id,
        usuarios: { nombre: updated.docente.nombre },
      };

      res.json({ ok: true, reporte: out });
    } catch (e) {
      console.error("ERROR cambiar estado de reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // PATCH /api/reportes/:id
  router.patch("/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const curr = await prisma.reportes.findUnique({ where: { id } });
      if (!curr) return res.status(404).json({ ok: false, msg: "Reporte no encontrado" });
      if (req.user.rol !== "ADMIN" && curr.docente_id !== req.user.sub) {
        return res.status(403).json({ ok: false, msg: "Sin permisos" });
      }
      if (!["PENDIENTE", "EN_REVISION", "DEVUELTO"].includes(curr.estado)) {
        return res.status(409).json({ ok: false, msg: "Solo se puede editar en PENDIENTE, EN_REVISION o DEVUELTO" });
      }

      const b = req.body || {};
      const data = {};
      if (b.descripcion !== undefined) data.descripcion = b.descripcion;

      if (curr.estado === "PENDIENTE" || curr.estado === "DEVUELTO") {
        const upd = await prisma.$transaction(async (tx) => {
          const r = await tx.reportes.update({
            where: { id },
            data: { ...data, estado: "EN_REVISION", updated_at: new Date() },
            include: { docente: { select: { nombre: true } }, solicitud: { select: { asunto: true } } },
          });
          await tx.reporte_estados_hist.create({
            data: {
              reporte_id: id,
              de_estado: curr.estado,
              a_estado: "EN_REVISION",
              motivo: curr.estado === "DEVUELTO"
                ? "Correccion enviada por el docente"
                : "Reporte enviado por el docente",
              actor_id: req.user.sub,
            },
          });
          return r;
        });

        const out = {
          id: upd.id,
          solicitud_id: upd.solicitud_id,
          asunto: upd.solicitud.asunto,
          descripcion: upd.descripcion,
          estado: upd.estado,
          fecha_entrega: upd.created_at,
          docente_id: upd.docente_id,
          usuarios: { nombre: upd.docente.nombre },
        };
        return res.json({ ok: true, reporte: out });
      }

      const updated = await prisma.reportes.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
        include: { docente: { select: { nombre: true } }, solicitud: { select: { asunto: true } } },
      });
      const out = {
        id: updated.id,
        solicitud_id: updated.solicitud_id,
        asunto: updated.solicitud.asunto,
        descripcion: updated.descripcion,
        estado: updated.estado,
        fecha_entrega: updated.created_at,
        docente_id: updated.docente_id,
        usuarios: { nombre: updated.docente.nombre },
      };
      return res.json({ ok: true, reporte: out });
    } catch (e) {
      console.error("ERROR editar reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  return router;
}
