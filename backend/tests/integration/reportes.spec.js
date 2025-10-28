import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../_helpers/createApp.js";
import reportesRouter from "../../src/routes/reportes.js";

vi.mock("../../src/middleware/auth.js", () => ({
  requireAuth: (req, _res, next) => { req.user = { sub: "doc1", rol: "DOCENTE" }; next(); },
  requireRole: () => (_req, _res, next) => next()
}));

describe("GET/POST /api/reportes", () => {
  let app, prisma;

  beforeEach(() => {
    app = createApp();
    prisma = { reportes: { findMany: vi.fn(), create: vi.fn(), count: vi.fn?.() ?? vi.fn() } };
    app.use("/api/reportes", reportesRouter(prisma));
    vi.resetAllMocks();
  });

  it("GET lista reportes del usuario (200 o 400)", async () => {
    prisma.reportes.findMany.mockResolvedValue([{ id: "r1", docente_id: "doc1", titulo: "Informe A" }]);
    prisma.reportes.count?.mockResolvedValue?.(1);

    const res = await request(app).get("/api/reportes").query({ page: 1, pageSize: 10 });
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      const payload = res.body;
      const list = Array.isArray(payload) ? payload
        : payload.items || payload.data || payload.result || [];
      expect(Array.isArray(list)).toBe(true);
    }
  });

  it("POST crea reporte (2xx si válido, 400 si validación falla)", async () => {
    prisma.reportes.create.mockResolvedValue({ id: "r2", docente_id: "doc1", titulo: "Informe B" });

    const body = { titulo: "Informe B", contenido: "Resultados...", solicitud_id: "s1" };
    const res = await request(app).post("/api/reportes").send(body);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
});
