import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import path from "path";
import { fileURLToPath } from "url";
import solicitudArchivosRouter from "./solicitudArchivos.js";

const asInt = (v) => (v !== undefined && v !== null ? parseInt(v, 10) : undefined);
const asDate = (v) => (v ? new Date(v) : undefined);
const ESTADOS = ["EN_REVISION", "APROBADA", "RECHAZADA", "DEVUELTA", "CANCELADA"];

// --- helpers para manejar horas como DateTime (Prisma) ---
const padTime = (t) => (t && t.length === 5 ? `${t}:00` : t);           // "08:00" -> "08:00:00"
const toDateTime = (fecha, hora) => new Date(`${fecha}T${padTime(hora)}`); // "2025-09-01T08:00:00"
const dateOnly = (d) => new Date(d).toISOString().slice(0, 10);           // Date -> "YYYY-MM-DD"

function canTransition(from, to) {
  if (from === to) return true;
  if (from === "CANCELADA") return false;
  if (from === "APROBADA" && to !== "DEVUELTA") return false;
  if (from === "RECHAZADA" && to !== "DEVUELTA") return false;
  if (from === "EN_REVISION" && ["APROBADA","RECHAZADA","DEVUELTA","CANCELADA"].includes(to)) return true;
  if (from === "DEVUELTA" && ["EN_REVISION","CANCELADA"].includes(to)) return true;
  return false;
}

export default function solicitudesRouter(prisma) {
  const router = express.Router();

  // ===== monta sub-rutas de archivos =====
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

  // /api/solicitudes/:id/archivos/*
  router.use("/:id/archivos", requireAuth, solicitudArchivosRouter(prisma, UPLOAD_ROOT));

  // ---------- Listado ----------
  router.get("/", requireAuth, async (req, res) => {
    try {
      const { estado, programaId, tipoId, desde, hasta, page = 1, size = 20 } = req.query;

      const where = {};
      if (estado && ESTADOS.includes(estado)) where.estado = estado;
      if (programaId) where.programa_educativo_id = asInt(programaId);
      if (tipoId) where.tipo_participacion_id = asInt(tipoId);
      if (desde || hasta) {
        where.fecha_salida = {};
        if (desde) where.fecha_salida.gte = asDate(desde);
        if (hasta) where.fecha_salida.lte = asDate(hasta);
      }
      // docente solo ve las suyas
      if (req.user.rol !== "ADMIN") where.docente_id = req.user.sub;

      const take = Math.min(asInt(size) || 20, 100);
      const skip = (asInt(page) > 1 ? (asInt(page) - 1) * take : 0);

      const [total, items] = await prisma.$transaction([
        prisma.solicitudes.count({ where }),
        prisma.solicitudes.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip, take,
          include: { usuarios: { select: { nombre:true }}}
        })
      ]);

      res.json({ total, page: asInt(page) || 1, size: take, items });
    } catch (e) {
      console.error("ERROR listar solicitudes:", e);
      res.status(400).json({ ok:false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // ---------- Detalle ----------
  router.get("/:id", requireAuth, async (req, res) => {
    try {
      const s = await prisma.solicitudes.findUnique({
        where: { id: req.params.id },
        include: {
          solicitud_archivos: true,
          solicitud_estados_hist: { orderBy: { created_at: "asc" } }
        }
      });
      if (!s) return res.status(404).json({ ok:false, msg: "No encontrada" });
      if (req.user.rol !== "ADMIN" && s.docente_id !== req.user.sub)
        return res.status(403).json({ ok:false, msg: "Sin permisos" });
      res.json(s);
    } catch (e) {
      console.error("ERROR detalle solicitud:", e);
      res.status(400).json({ ok:false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // ---------- Crear ----------
  router.post("/", requireAuth, async (req, res) => {
    try {
      const b = req.body;
      const required = [
        "asunto","tipo_participacion_id","ciudad","pais","lugar",
        "fecha_salida","hora_salida","fecha_regreso","hora_regreso",
        "num_personas","programa_educativo_id","alumnos_beneficiados"
      ];
      for (const k of required) {
        if (b[k] === undefined || b[k] === null || b[k] === "")
          return res.status(400).json({ ok:false, msg:`Falta ${k}` });
      }

      const data = {
        docente_id: req.user.sub,
        asunto: b.asunto,
        tipo_participacion_id: asInt(b.tipo_participacion_id),
        ciudad: b.ciudad,
        pais: b.pais,
        lugar: b.lugar,
        // fechas (DATE)
        fecha_salida: asDate(b.fecha_salida),     // "YYYY-MM-DD"
        fecha_regreso: asDate(b.fecha_regreso),   // "YYYY-MM-DD"
        // horas (Prisma espera DateTime: combinamos con la fecha correspondiente)
        hora_salida: toDateTime(b.fecha_salida, b.hora_salida),
        hora_regreso: toDateTime(b.fecha_regreso, b.hora_regreso),

        num_personas: asInt(b.num_personas),
        usa_unidad_transporte: !!b.usa_unidad_transporte,
        cantidad_combustible: b.cantidad_combustible ?? null,
        programa_educativo_id: asInt(b.programa_educativo_id),
        alumnos_beneficiados: asInt(b.alumnos_beneficiados),
        proyecto_investigacion: b.proyecto_investigacion ?? null,
        cuerpo_academico: b.cuerpo_academico ?? null,
        obtendra_constancia: !!b.obtendra_constancia,
        comentarios: b.comentarios ?? null
      };

      const created = await prisma.solicitudes.create({ data });
      res.status(201).json({ ok: true, id: created.id });
    } catch (e) {
      console.error("ERROR crear solicitud:", e);
      res.status(400).json({ ok:false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // ---------- Editar (EN_REVISION) ----------
  router.patch("/:id", requireAuth, async (req, res) => {
    try {
      const s = await prisma.solicitudes.findUnique({ where: { id: req.params.id } });
      if (!s) return res.status(404).json({ ok:false, msg: "No encontrada" });
      if (s.estado !== "EN_REVISION") return res.status(409).json({ ok:false, msg:"Solo se puede editar en EN_REVISION" });
      if (req.user.rol !== "ADMIN" && s.docente_id !== req.user.sub)
        return res.status(403).json({ ok:false, msg:"Sin permisos" });

      const b = req.body;
      const data = {};
      const assign = (k, v) => { if (v !== undefined) data[k] = v; };
      assign("asunto", b.asunto);
      assign("tipo_participacion_id", asInt(b.tipo_participacion_id));
      assign("ciudad", b.ciudad);
      assign("pais", b.pais);
      assign("lugar", b.lugar);
      assign("fecha_salida", b.fecha_salida ? asDate(b.fecha_salida) : undefined);
      assign("fecha_regreso", b.fecha_regreso ? asDate(b.fecha_regreso) : undefined);

      // si cambia la hora, combinamos con la fecha que venga en el body, o con la actual guardada
      if (b.hora_salida) {
        const baseFecha = b.fecha_salida ?? dateOnly(s.fecha_salida);
        data.hora_salida = toDateTime(baseFecha, b.hora_salida);
      }
      if (b.hora_regreso) {
        const baseFecha = b.fecha_regreso ?? dateOnly(s.fecha_regreso);
        data.hora_regreso = toDateTime(baseFecha, b.hora_regreso);
      }

      assign("num_personas", asInt(b.num_personas));
      assign("usa_unidad_transporte", b.usa_unidad_transporte === undefined ? undefined : !!b.usa_unidad_transporte);
      assign("cantidad_combustible", b.cantidad_combustible ?? undefined);
      assign("programa_educativo_id", asInt(b.programa_educativo_id));
      assign("alumnos_beneficiados", asInt(b.alumnos_beneficiados));
      assign("proyecto_investigacion", b.proyecto_investigacion ?? undefined);
      assign("cuerpo_academico", b.cuerpo_academico ?? undefined);
      assign("obtendra_constancia", b.obtendra_constancia === undefined ? undefined : !!b.obtendra_constancia);
      assign("comentarios", b.comentarios ?? undefined);

      const upd = await prisma.solicitudes.update({ where: { id: s.id }, data });
      res.json({ ok:true, solicitud: upd });
    } catch (e) {
      console.error("ERROR editar solicitud:", e);
      res.status(400).json({ ok:false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // ---------- Cancelar (dueño) ----------
  router.post("/:id/cancelar", requireAuth, async (req, res) => {
    try {
      const s = await prisma.solicitudes.findUnique({ where: { id: req.params.id } });
      if (!s) return res.status(404).json({ ok:false, msg:"No encontrada" });
      if (s.docente_id !== req.user.sub) return res.status(403).json({ ok:false, msg:"Solo el creador puede cancelar" });
      if (!canTransition(s.estado, "CANCELADA")) return res.status(409).json({ ok:false, msg:`No se puede cancelar desde ${s.estado}` });

      const out = await prisma.$transaction(async (tx) => {
        const upd = await tx.solicitudes.update({
          where: { id: s.id },
          data: { estado: "CANCELADA", motivo_estado: req.body?.motivo ?? null }
        });
        await tx.solicitud_estados_hist.create({
          data: {
            solicitud_id: s.id,
            de_estado: s.estado,
            a_estado: "CANCELADA",
            motivo: req.body?.motivo ?? null,
            actor_id: req.user.sub
          }
        });
        return upd;
      });

      res.json({ ok:true, solicitud: out });
    } catch (e) {
      console.error("ERROR cancelar solicitud:", e);
      res.status(400).json({ ok:false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  // ---------- Cambiar estado (ADMIN) ----------
  router.patch("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const { estado, motivo } = req.body || {};
      if (!ESTADOS.includes(estado)) return res.status(400).json({ ok:false, msg:"Estado inválido" });

      const s = await prisma.solicitudes.findUnique({ where: { id: req.params.id } });
      if (!s) return res.status(404).json({ ok:false, msg:"No encontrada" });
      if (!canTransition(s.estado, estado)) return res.status(409).json({ ok:false, msg:`Transición ${s.estado} -> ${estado} no permitida` });

      const out = await prisma.$transaction(async (tx) => {
        const upd = await tx.solicitudes.update({
          where: { id: s.id },
          data: { estado, motivo_estado: motivo ?? null }
        });
        await tx.solicitud_estados_hist.create({
          data: {
            solicitud_id: s.id,
            de_estado: s.estado,
            a_estado: estado,
            motivo: motivo ?? null,
            actor_id: req.user.sub
          }
        });
        return upd;
      });

      res.json({ ok:true, solicitud: out });
    } catch (e) {
      console.error("ERROR cambiar estado:", e);
      res.status(400).json({ ok:false, message: e.message, code: e.code, meta: e.meta });
    }
  });

  return router;
}
