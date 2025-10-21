// backend/src/routes/reportes.js

import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

// Helpers para convertir valores de la URL a los tipos correctos
const asInt = (v) => (v !== undefined && v !== null ? parseInt(v, 10) : undefined);
const ESTADOS_REPORTE = ["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO", "DEVUELTO"];

function canTransition(from, to, role = 'USER') {
  if (from === to) return true;
  
  // Los admins pueden hacer transiciones más flexibles
  if (role === 'ADMIN') {
    // Desde EN_REVISION o PENDIENTE
    if (["EN_REVISION", "PENDIENTE"].includes(from) && ["APROBADO", "RECHAZADO", "DEVUELTO"].includes(to)) return true;
    // Desde DEVUELTO
    if (from === "DEVUELTO" && ["EN_REVISION", "APROBADO", "RECHAZADO"].includes(to)) return true;
    // Desde APROBADO
    if (from === "APROBADO" && ["RECHAZADO", "DEVUELTO"].includes(to)) return true;
    // Desde RECHAZADO
    if (from === "RECHAZADO" && ["APROBADO", "DEVUELTO"].includes(to)) return true;
  }
  
  return false;
}

export default function reportesRouter(prisma) {
  const router = express.Router();

  // --- Listar Reportes ---
  // GET /api/reportes
  router.get("/", requireAuth, async (req, res) => {
    try {
      const { estado, page = 1, size = 20 } = req.query;

      const where = {};
      if (estado && ESTADOS_REPORTE.includes(estado)) {
        where.estado = estado;
      }
      
      // Si el rol del usuario NO es ADMIN, filtramos para que solo vea sus propios reportes.
      if (req.user.rol !== "ADMIN") {
        where.docente_id = req.user.sub;
      }

      // Configuración de paginación
      const take = Math.min(asInt(size) || 20, 100);
      const skip = (asInt(page) > 1 ? (asInt(page) - 1) * take : 0);

      // Hacemos dos consultas a la vez: una para el total y otra para los datos paginados
      const [total, items] = await prisma.$transaction([
        prisma.reportes.count({ where }),
        prisma.reportes.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take,
          include: {
            docente: { select: { nombre: true }},
            solicitud: { select: { asunto: true }},
            estados_hist: { orderBy: { created_at: "desc" }, take: 1, select: { created_at: true, motivo: true, a_estado: true, actor: { select: { nombre: true } } } },
            _count: { select: { estados_hist: true } }
          }
        })
      ]);

      // Transformamos los datos para que el frontend los reciba en un formato consistente
      const reportes = items.map(item => ({
        id: item.id,
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
      }));

      res.json({ total, page: asInt(page) || 1, size: take, items: reportes });
    } catch (e) {
      console.error("ERROR al listar reportes:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // --- Crear Reporte (DOCENTE dueño o ADMIN) ---
  // POST /api/reportes
  router.post("/", requireAuth, async (req, res) => {
    try {
      const { solicitud_id, descripcion } = req.body || {};
      if (!solicitud_id) return res.status(400).json({ ok: false, msg: "Falta solicitud_id" });

      const sol = await prisma.solicitudes.findUnique({ where: { id: solicitud_id } });
      if (!sol) return res.status(404).json({ ok: false, msg: "Solicitud no encontrada" });
      if (req.user.rol !== "ADMIN" && sol.docente_id !== req.user.sub) {
        return res.status(403).json({ ok: false, msg: "Solo el dueño puede crear el reporte" });
      }
      if (sol.estado !== "APROBADA") {
        return res.status(409).json({ ok: false, msg: "Solo se puede crear reporte para solicitudes APROBADAS" });
      }

      try {
        const created = await prisma.reportes.create({
          data: {
            solicitud_id,
            docente_id: sol.docente_id,
            descripcion: descripcion ?? null,
            // estado: PENDIENTE (por defecto)
          },
          include: { docente: { select: { nombre: true } }, solicitud: { select: { asunto: true } } }
        });
        const out = {
          id: created.id,
          asunto: created.solicitud.asunto,
          descripcion: created.descripcion,
          estado: created.estado,
          fecha_entrega: created.created_at,
          docente_id: created.docente_id,
          usuarios: { nombre: created.docente.nombre },
        };
        return res.status(201).json({ ok: true, reporte: out });
      } catch (e) {
        // Prisma unique constraint
        if (e?.code === 'P2002') {
          return res.status(409).json({ ok: false, msg: "Ya existe un reporte para esta solicitud" });
        }
        throw e;
      }
    } catch (e) {
      console.error("ERROR crear reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // --- Detalle de un reporte ---
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
              actor: { select: { nombre: true } }
            }
          },
          evidencias: true,
          actividades: true,
        }
      });
      if (!r) return res.status(404).json({ ok: false, msg: "No encontrado" });
      if (req.user.rol !== "ADMIN" && r.docente_id !== req.user.sub) {
        return res.status(403).json({ ok: false, msg: "Sin permisos" });
      }

      const out = {
        id: r.id,
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

  // --- Cambiar estado de un reporte (ADMIN) ---
  // PATCH /api/reportes/:id/estado
  router.patch("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const { estado, motivo } = req.body || {};
      if (!ESTADOS_REPORTE.includes(estado)) {
        return res.status(400).json({ ok: false, msg: "Estado inválido" });
      }

      const id = req.params.id;
      const curr = await prisma.reportes.findUnique({ where: { id } });
      if (!curr) return res.status(404).json({ ok: false, msg: "Reporte no encontrado" });
      if (!canTransition(curr.estado, estado, 'ADMIN')) {
        return res.status(409).json({ ok: false, msg: `Transición ${curr.estado} -> ${estado} no permitida` });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const upd = await tx.reportes.update({
          where: { id },
          data: { estado, updated_at: new Date() },
          include: {
            docente: { select: { nombre: true } },
            solicitud: { select: { asunto: true } }
          }
        });
        await tx.reporte_estados_hist.create({
          data: {
            reporte_id: id,
            de_estado: curr.estado,
            a_estado: estado,
            motivo: motivo ?? null,
            actor_id: req.user.sub
          }
        });
        return upd;
      });

      const out = {
        id: updated.id,
        asunto: updated.solicitud.asunto,
        descripcion: updated.descripcion,
        estado: updated.estado,
        fecha_entrega: updated.created_at,
        docente_id: updated.docente_id,
        usuarios: { nombre: updated.docente.nombre }
      };

      res.json({ ok: true, reporte: out });
    } catch (e) {
      console.error("ERROR cambiar estado de reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // --- Editar reporte (DOCENTE dueño o ADMIN) ---
  // PATCH /api/reportes/:id
  router.patch("/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const curr = await prisma.reportes.findUnique({ where: { id } });
      if (!curr) return res.status(404).json({ ok: false, msg: "Reporte no encontrado" });
      if (req.user.rol !== "ADMIN" && curr.docente_id !== req.user.sub) {
        return res.status(403).json({ ok: false, msg: "Sin permisos" });
      }
      if (!["EN_REVISION", "DEVUELTO"].includes(curr.estado)) {
        return res.status(409).json({ ok: false, msg: "Solo se puede editar en EN_REVISION o DEVUELTO" });
      }

      const b = req.body || {};
      const data = {};
      if (b.descripcion !== undefined) data.descripcion = b.descripcion;

      // Si está DEVUELTO, al guardar pasa a EN_REVISION y registramos historial
      if (curr.estado === "DEVUELTO") {
        const upd = await prisma.$transaction(async (tx) => {
          const r = await tx.reportes.update({
            where: { id },
            data: { ...data, estado: "EN_REVISION", updated_at: new Date() },
            include: { docente: { select: { nombre: true } }, solicitud: { select: { asunto: true } } }
          });
          await tx.reporte_estados_hist.create({
            data: {
              reporte_id: id,
              de_estado: "DEVUELTO",
              a_estado: "EN_REVISION",
              motivo: "Corrección enviada por el docente",
              actor_id: req.user.sub
            }
          });
          return r;
        });

        const out = {
          id: upd.id,
          asunto: upd.solicitud.asunto,
          descripcion: upd.descripcion,
          estado: upd.estado,
          fecha_entrega: upd.created_at,
          docente_id: upd.docente_id,
          usuarios: { nombre: upd.docente.nombre }
        };
        return res.json({ ok: true, reporte: out });
      }

      const updated = await prisma.reportes.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
        include: { docente: { select: { nombre: true } }, solicitud: { select: { asunto: true } } }
      });
      const out = {
        id: updated.id,
        asunto: updated.solicitud.asunto,
        descripcion: updated.descripcion,
        estado: updated.estado,
        fecha_entrega: updated.created_at,
        docente_id: updated.docente_id,
        usuarios: { nombre: updated.docente.nombre }
      };
      return res.json({ ok: true, reporte: out });
    } catch (e) {
      console.error("ERROR editar reporte:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // Aquí puedes agregar en el futuro más rutas para reportes (ver detalle, editar, etc.)

  return router;
}
