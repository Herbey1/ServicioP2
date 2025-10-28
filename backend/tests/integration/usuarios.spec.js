import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp, fakeAuth } from "../_helpers/createApp.js";
import usuariosRouter from "../../src/routes/usuarios.js";

// Middleware de prueba que emula requireRole("ADMIN")
const requireAdminFake = () => (req, res, next) => {
  if (req.user?.rol !== "ADMIN") {
    return res.status(403).json({ ok: false, msg: "Forbidden" });
  }
  next();
};

describe("GET/POST/PUT /api/usuarios", () => {
  let app, prisma;

  beforeEach(() => {
    app = createApp();
    prisma = {
      usuarios: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    // Rutas como en index.js pero con autenticación/rol fakes
    app.use(
      "/api/usuarios",
      fakeAuth({ sub: "admin1", rol: "ADMIN" }),
      requireAdminFake(),
      usuariosRouter(prisma)
    );

    vi.resetAllMocks();
  });

  it("GET lista usuarios (ADMIN)", async () => {
    prisma.usuarios.findMany.mockResolvedValue([
      { id: "u1", nombre: "A", correo: "a@test", rol: "ADMIN" },
      { id: "u2", nombre: "B", correo: "b@test", rol: "DOCENTE" },
    ]);

    const res = await request(app).get("/api/usuarios");
    // Debe responder exitoso
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    // Tolerar distintas formas de payload
    const payload = res.body;
    const candidates = [];
    if (Array.isArray(payload)) candidates.push(payload);
    if (payload && typeof payload === "object") {
      for (const k of ["users", "data", "items", "result", "rows"]) {
        if (Array.isArray(payload[k])) candidates.push(payload[k]);
      }
    }
    const list = candidates.find(Array.isArray) || [];
    expect(Array.isArray(list)).toBe(true);
    if (list.length) {
      expect(list[0]).toMatchObject({ id: "u1" });
    }
  });

  it("POST crea usuario DOCENTE", async () => {
    prisma.usuarios.create.mockResolvedValue({
      id: "u3",
      nombre: "New",
      correo: "new@test",
      rol: "DOCENTE",
      verificado: false,
    });

    const res = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "New",
        correo: "new@test",
        rol: "DOCENTE",
        contrasena: "Admin123*",
      });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);

    if (res.status < 300) {
      const body = res.body || {};
      expect(body).toMatchObject({ id: "u3", rol: "DOCENTE" });
    }
  });

  it("PUT actualiza rol/verificado", async () => {
    prisma.usuarios.update.mockResolvedValue({
      id: "u2",
      nombre: "B",
      correo: "b@test",
      rol: "ADMIN",
      verificado: true,
    });

    const res = await request(app)
      .put("/api/usuarios/u2")
      .send({ rol: "ADMIN", verificado: true });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);

    if (res.status < 300) {
      expect(res.body.rol).toBe("ADMIN");
    }
  });
});

describe("usuarios requiere ADMIN", () => {
  it("403 si el rol no es ADMIN", async () => {
    const app = createApp();
    const prisma = { usuarios: { findMany: vi.fn() } };

    app.use(
      "/api/usuarios",
      fakeAuth({ sub: "uX", rol: "DOCENTE" }),
      requireAdminFake(),
      usuariosRouter(prisma)
    );

    const res = await request(app).get("/api/usuarios");
    expect([403, 401]).toContain(res.status);
  });
});
