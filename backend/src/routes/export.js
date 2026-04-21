import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const cell = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const table = (title, headers, rows) => `
  <h2>${cell(title)}</h2>
  <table border="1">
    <thead>
      <tr>${headers.map((header) => `<th>${cell(header)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.length === 0
        ? `<tr><td colspan="${headers.length}">Sin registros</td></tr>`
        : rows.map((row) => `
          <tr>${headers.map((header) => `<td>${cell(row[header])}</td>`).join("")}</tr>
        `).join("")}
    </tbody>
  </table>
`;

export default function exportRouter(prisma) {
  const router = express.Router();

  router.get("/dump", requireAuth, requireRole("ADMIN"), async (_req, res) => {
    try {
      const [
        usuarios,
        solicitudes,
        solicitudArchivos,
        solicitudHistorial,
        reportes,
        reporteEvidencias,
        reporteActividades,
        reporteHistorial,
      ] = await prisma.$transaction([
        prisma.usuarios.findMany({ orderBy: { created_at: "desc" } }),
        prisma.solicitudes.findMany({
          orderBy: { created_at: "desc" },
          include: {
            docente: { select: { nombre: true, correo: true } },
            tipo_participacion: { select: { nombre: true } },
            programa_educativo: { select: { nombre: true } },
            archivos: { select: { id: true, bytes: true } },
            reporte: { select: { id: true, estado: true, created_at: true, updated_at: true } },
          },
        }),
        prisma.solicitud_archivos.findMany({
          orderBy: { created_at: "desc" },
          include: { solicitud: { select: { asunto: true } } },
        }),
        prisma.solicitud_estados_hist.findMany({
          orderBy: { created_at: "desc" },
          include: {
            solicitud: { select: { asunto: true } },
            actor: { select: { nombre: true, correo: true } },
          },
        }),
        prisma.reportes.findMany({
          orderBy: { created_at: "desc" },
          include: {
            solicitud: { select: { asunto: true } },
            docente: { select: { nombre: true, correo: true } },
          },
        }),
        prisma.reporte_evidencias.findMany({
          orderBy: { created_at: "desc" },
          include: { reporte: { select: { solicitud: { select: { asunto: true } } } } },
        }),
        prisma.reporte_actividades.findMany({
          orderBy: { created_at: "desc" },
          include: { reporte: { select: { solicitud: { select: { asunto: true } } } } },
        }),
        prisma.reporte_estados_hist.findMany({
          orderBy: { created_at: "desc" },
          include: {
            reporte: { select: { solicitud: { select: { asunto: true } } } },
            actor: { select: { nombre: true, correo: true } },
          },
        }),
      ]);

      const solicitudesRows = solicitudes.map((s) => {
        const archivos = Array.isArray(s.archivos) ? s.archivos : [];
        const totalAdjuntos = archivos.length;
        const totalBytesAdjuntos = archivos.reduce((acc, item) => acc + (Number(item.bytes) || 0), 0);
        const fechaSalida = s.fecha_salida ? new Date(s.fecha_salida) : null;
        const fechaRegreso = s.fecha_regreso ? new Date(s.fecha_regreso) : null;
        const diasComision = fechaSalida && fechaRegreso
          ? Math.max(1, Math.round((fechaRegreso.getTime() - fechaSalida.getTime()) / 86400000) + 1)
          : "";

        return {
          id: s.id,
          docente_id: s.docente_id,
          docente: s.docente?.nombre,
          correo_docente: s.docente?.correo,
          asunto: s.asunto,
          estado: s.estado,
          tipo_participacion: s.tipo_participacion?.nombre,
          programa_educativo: s.programa_educativo?.nombre,
          ciudad: s.ciudad,
          pais: s.pais,
          lugar: s.lugar,
          fecha_salida: s.fecha_salida,
          hora_salida: s.hora_salida,
          fecha_regreso: s.fecha_regreso,
          hora_regreso: s.hora_regreso,
          dias_comision: diasComision,
          num_personas: s.num_personas,
          usa_unidad_transporte: s.usa_unidad_transporte,
          cantidad_combustible: s.cantidad_combustible,
          alumnos_beneficiados: s.alumnos_beneficiados,
          proyecto_investigacion: s.proyecto_investigacion,
          obtendra_constancia: s.obtendra_constancia,
          comentarios: s.comentarios,
          motivo_estado: s.motivo_estado,
          total_adjuntos: totalAdjuntos,
          total_bytes_adjuntos: totalBytesAdjuntos,
          tiene_reporte: s.reporte ? "SI" : "NO",
          reporte_id: s.reporte?.id ?? "",
          reporte_estado: s.reporte?.estado ?? "",
          reporte_creado_en: s.reporte?.created_at ?? "",
          reporte_actualizado_en: s.reporte?.updated_at ?? "",
          created_at: s.created_at,
          updated_at: s.updated_at,
        };
      });

      const sections = [
        table("Usuarios", [
          "id", "nombre", "correo", "rol", "verificado", "must_change_password", "created_at", "updated_at", "deleted_at"
        ], usuarios.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          correo: u.correo,
          rol: u.rol,
          verificado: u.verificado,
          must_change_password: u.must_change_password,
          created_at: u.created_at,
          updated_at: u.updated_at,
          deleted_at: u.deleted_at,
        }))),

        table("Solicitudes", [
          "id", "docente_id", "docente", "correo_docente", "asunto", "estado", "tipo_participacion", "programa_educativo",
          "ciudad", "pais", "lugar", "fecha_salida", "hora_salida", "fecha_regreso", "hora_regreso",
          "dias_comision", "num_personas", "usa_unidad_transporte", "cantidad_combustible", "alumnos_beneficiados",
          "proyecto_investigacion", "obtendra_constancia", "comentarios", "motivo_estado",
          "total_adjuntos", "total_bytes_adjuntos", "tiene_reporte", "reporte_id", "reporte_estado",
          "reporte_creado_en", "reporte_actualizado_en", "created_at", "updated_at"
        ], solicitudesRows),

        table("Archivos de solicitudes", [
          "id", "solicitud_id", "asunto", "filename", "mime_type", "bytes", "url", "created_at"
        ], solicitudArchivos.map((a) => ({
          id: a.id,
          solicitud_id: a.solicitud_id,
          asunto: a.solicitud?.asunto,
          filename: a.filename,
          mime_type: a.mime_type,
          bytes: a.bytes,
          url: a.url,
          created_at: a.created_at,
        }))),

        table("Historial de solicitudes", [
          "id", "solicitud_id", "asunto", "de_estado", "a_estado", "motivo", "actor", "correo_actor", "created_at"
        ], solicitudHistorial.map((h) => ({
          id: h.id,
          solicitud_id: h.solicitud_id,
          asunto: h.solicitud?.asunto,
          de_estado: h.de_estado,
          a_estado: h.a_estado,
          motivo: h.motivo,
          actor: h.actor?.nombre,
          correo_actor: h.actor?.correo,
          created_at: h.created_at,
        }))),

        table("Reportes", [
          "id", "solicitud_id", "asunto", "docente", "correo_docente", "descripcion", "estado", "created_at", "updated_at"
        ], reportes.map((r) => ({
          id: r.id,
          solicitud_id: r.solicitud_id,
          asunto: r.solicitud?.asunto,
          docente: r.docente?.nombre,
          correo_docente: r.docente?.correo,
          descripcion: r.descripcion,
          estado: r.estado,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }))),

        table("Evidencias de reportes", [
          "id", "reporte_id", "asunto", "filename", "mime_type", "bytes", "url", "created_at"
        ], reporteEvidencias.map((e) => ({
          id: e.id,
          reporte_id: e.reporte_id,
          asunto: e.reporte?.solicitud?.asunto,
          filename: e.filename,
          mime_type: e.mime_type,
          bytes: e.bytes,
          url: e.url,
          created_at: e.created_at,
        }))),

        table("Actividades de reportes", [
          "id", "reporte_id", "asunto", "descripcion", "fecha", "created_at"
        ], reporteActividades.map((a) => ({
          id: a.id,
          reporte_id: a.reporte_id,
          asunto: a.reporte?.solicitud?.asunto,
          descripcion: a.descripcion,
          fecha: a.fecha,
          created_at: a.created_at,
        }))),

        table("Historial de reportes", [
          "id", "reporte_id", "asunto", "de_estado", "a_estado", "motivo", "actor", "correo_actor", "created_at"
        ], reporteHistorial.map((h) => ({
          id: h.id,
          reporte_id: h.reporte_id,
          asunto: h.reporte?.solicitud?.asunto,
          de_estado: h.de_estado,
          a_estado: h.a_estado,
          motivo: h.motivo,
          actor: h.actor?.nombre,
          correo_actor: h.actor?.correo,
          created_at: h.created_at,
        }))),
      ];

      const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    h1 { color: #166534; }
    h2 { margin-top: 28px; color: #14532d; }
    table { border-collapse: collapse; margin-bottom: 20px; }
    th { background: #166534; color: white; font-weight: bold; }
    th, td { padding: 6px 8px; vertical-align: top; mso-number-format:"\\@"; }
  </style>
</head>
<body>
  <h1>Dump del Sistema de Gestion de Comisiones Academicas</h1>
  <p>Generado: ${cell(new Date())}</p>
  ${sections.join("\n")}
</body>
</html>`;

      const filename = `dump-sgca-${new Date().toISOString().slice(0, 10)}.xls`;
      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(html);
    } catch (e) {
      console.error("ERROR generando dump:", e);
      res.status(500).json({ ok: false, msg: "No se pudo generar el dump", message: e.message });
    }
  });

  return router;
}
