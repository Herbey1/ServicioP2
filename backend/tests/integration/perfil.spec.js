import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../_helpers/createApp.js";
import perfilRouter from "../../src/routes/perfil.js";

// Fake auth que setea req.user para las pruebas
function fakeAuth(req, _res, next) {
  req.user = { sub: "u1", rol: "ADMIN" };
  next();
}

describe("GET/PUT /api/perfil", () => {
  let app;
  let prisma;

  beforeEach(() => {
    app = createApp();
    prisma = {
      usuarios: {
        findUnique: vi.fn(),
        update: vi.fn()
      }
    };
    app.use("/api/perfil", fakeAuth, perfilRouter(prisma));
    vi.resetAllMocks();
  });

  it("GET devuelve el perfil del usuario autenticado", async () => {
    const now = new Date().toISOString();
    prisma.usuarios.findUnique.mockResolvedValue({
      id: "u1",
      nombre: "Admin",
      correo: "admin@demo.test",
      rol: "ADMIN",
      telefono: "+526861234567",
      verificado: true,
      created_at: now
    });

    const res = await request(app).get("/api/perfil");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toMatchObject({ id: "u1", correo: "admin@demo.test" });
  });

  it("PUT 400 si teléfono es inválido", async () => {
    const res = await request(app)
      .put("/api/perfil")
      .send({ telefono: "123" }); // inválido
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("PUT 200 si teléfono es válido (+ normaliza a +52...)", async () => {
    prisma.usuarios.update.mockResolvedValue({
      id: "u1",
      nombre: "Admin",
      correo: "admin@demo.test",
      rol: "ADMIN",
      telefono: "+526861234567",
      verificado: true,
      created_at: new Date().toISOString()
    });

    const res = await request(app)
      .put("/api/perfil")
      .send({ telefono: "6861234567" });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.telefono).toBe("+526861234567");
  });
});
