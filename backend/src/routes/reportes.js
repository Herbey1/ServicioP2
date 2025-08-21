// backend/src/routes/reportes.js

import express from "express";
import { requireAuth } from "../middleware/auth.js";

// Helpers para convertir valores de la URL a los tipos correctos
const asInt = (v) => (v !== undefined && v !== null ? parseInt(v, 10) : undefined);
const ESTADOS_REPORTE = ["PENDIENTE", "EN_REVISION", "APROBADO", "DEVUELTO"];

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
            // Incluimos datos relacionados para obtener el nombre del docente
            docente: { select: { nombre: true }},
            // y el asunto de la solicitud original para dar contexto
            solicitud: { select: { asunto: true }}
          }
        })
      ]);

      // Transformamos los datos para que el frontend los reciba en un formato consistente
      const reportes = items.map(item => ({
        id: item.id,
        asunto: item.solicitud.asunto, // El "título" del reporte será el asunto de su comisión
        descripcion: item.descripcion,
        estado: item.estado,
        fecha_entrega: item.created_at,
        docente_id: item.docente_id,
        // Simulamos la estructura `usuarios` que espera el frontend
        usuarios: { 
            nombre: item.docente.nombre
        }
      }));

      res.json({ total, page: asInt(page) || 1, size: take, items: reportes });
    } catch (e) {
      console.error("ERROR al listar reportes:", e);
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // Aquí puedes agregar en el futuro más rutas para reportes (ver detalle, editar, etc.)

  return router;
}