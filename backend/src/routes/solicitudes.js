import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import path from "path";
import { fileURLToPath } from "url";
import solicitudArchivosRouter from "./solicitudArchivos.js";

const asInt = (v) => (v !== undefined && v !== null ? parseInt(v, 10) : undefined);
const asDate = (v) => (v ? new Date(v) : undefined);
const ESTADOS = ["EN_REVISION", "APROBADA", "RECHAZADA", "DEVUELTA", "CANCELADA"];

// Normaliza campo libre `proyecto_investigacion` (DB: String?) aceptando boolean del frontend
function normalizeProyecto(v) {
  if (v === undefined) return undefined;        // no tocar
  if (v === null) return null;
  if (typeof v === 'string') return v || null;  // cadena vacía -> null
  if (typeof v === 'boolean') return v ? 'SI' : null;
  return null;
}

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
  const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

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
          include: {
            docente: { select: { nombre:true }},
            // último evento de historial para resumen (evitar BigInt en JSON)
            estados_hist: {
              orderBy: { created_at: "desc" },
              take: 1,
              select: { created_at: true, actor: { select: { nombre: true } } }
            },
            _count: { select: { estados_hist: true } }
          }
        })
      ]);
      // Alinear forma con /api/reportes: exponer usuarios.nombre
      const mapped = items.map(item => ({
        ...item,
        usuarios: { nombre: item.docente?.nombre ?? null },
        last_change_at: item.estados_hist?.[0]?.created_at ?? item.updated_at,
        last_change_by: item.estados_hist?.[0]?.actor?.nombre ?? null,
        hist_count: item._count?.estados_hist ?? 0,
      }));

      res.json({ total, page: asInt(page) || 1, size: take, items: mapped });
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
          docente: { select: { nombre: true } },
          archivos: true,
          estados_hist: {
            orderBy: { created_at: "asc" },
            select: {
              de_estado: true,
              a_estado: true,
              motivo: true,
              created_at: true,
              actor: { select: { nombre: true } }
            }
          }
        }
      });
      if (!s) return res.status(404).json({ ok:false, msg: "No encontrada" });
      if (req.user.rol !== "ADMIN" && s.docente_id !== req.user.sub)
        return res.status(403).json({ ok:false, msg: "Sin permisos" });
      // Alinear forma con listados y con /api/reportes
      const { archivos, estados_hist, ...rest } = s;
      const out = {
        ...rest,
        solicitud_archivos: archivos,
        solicitud_estados_hist: estados_hist,
        usuarios: { nombre: s.docente?.nombre ?? null }
      };
      res.json(out);
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
        proyecto_investigacion: normalizeProyecto(b.proyecto_investigacion) ?? null,
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

  // ---------- Editar (EN_REVISION o DEVUELTA) ----------
  router.patch("/:id", requireAuth, async (req, res) => {
    try {
      const s = await prisma.solicitudes.findUnique({ where: { id: req.params.id } });
      if (!s) return res.status(404).json({ ok:false, msg: "No encontrada" });
      if (!["EN_REVISION","DEVUELTA"].includes(s.estado))
        return res.status(409).json({ ok:false, msg:"Solo se puede editar en EN_REVISION o DEVUELTA" });
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
      if (b.proyecto_investigacion !== undefined) {
        data.proyecto_investigacion = normalizeProyecto(b.proyecto_investigacion);
      }
      assign("cuerpo_academico", b.cuerpo_academico ?? undefined);
      assign("obtendra_constancia", b.obtendra_constancia === undefined ? undefined : !!b.obtendra_constancia);
      assign("comentarios", b.comentarios ?? undefined);

      // Si viene de DEVUELTA, al guardar pasará a EN_REVISION y registramos historial
      if (s.estado === "DEVUELTA") {
        const out = await prisma.$transaction(async (tx) => {
          const upd = await tx.solicitudes.update({
            where: { id: s.id },
            data: { ...data, estado: "EN_REVISION", motivo_estado: null }
          });
          await tx.solicitud_estados_hist.create({
            data: {
              solicitud_id: s.id,
              de_estado: "DEVUELTA",
              a_estado: "EN_REVISION",
              motivo: "Corrección enviada por el docente",
              actor_id: req.user.sub
            }
          });
          return upd;
        });
        return res.json({ ok:true, solicitud: out });
      }

      const upd = await prisma.solicitudes.update({ where: { id: s.id }, data });
      return res.json({ ok:true, solicitud: upd });
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
