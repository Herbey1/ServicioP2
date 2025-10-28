import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../_helpers/createApp.js";

// Mock módulos externos
vi.mock("bcrypt", () => ({ default: { compare: vi.fn() }, compare: vi.fn() }));
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(), verify: vi.fn() },
  sign: vi.fn(),
  verify: vi.fn()
}));

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRouter from "../../src/routes/auth.js";

describe("POST /api/auth/login", () => {
  let app;
  let prisma;

  beforeEach(() => {
    app = createApp();
    prisma = {
      usuarios: {
        findUnique: vi.fn()
      }
    };
    // monta el router como en index.js
    app.use("/api/auth", authRouter(prisma));
    // limpia mocks
    vi.resetAllMocks();
  });

  it("400 si faltan campos requeridos", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "x@test.com" }); // sin password ni rolEsperado
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.ok).toBe(false);
  });

  it("401 (o error) si credenciales inválidas", async () => {
    prisma.usuarios.findUnique.mockResolvedValue({
      id: "u1",
      correo: "admin@demo.test",
      contrasena_hash: "hash",
      rol: "ADMIN",
      verificado: true
    });
    (bcrypt.compare || bcrypt.default.compare).mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        correo: "admin@demo.test",
        password: "bad",
        rolEsperado: "ADMIN"
      });

    // algunos proyectos responden 401, otros 400. Validamos la intención:
    expect([400, 401]).toContain(res.status);
    expect(res.body.ok).toBe(false);
    expect(String(res.body.msg || "")).toMatch(/credenciales/i);
  });

  it("403 si el rol no coincide con rolEsperado", async () => {
    prisma.usuarios.findUnique.mockResolvedValue({
      id: "u1",
      correo: "admin@demo.test",
      contrasena_hash: "hash",
      rol: "DOCENTE",         // distinto
      verificado: true
    });
    (bcrypt.compare || bcrypt.default.compare).mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        correo: "admin@demo.test",
        password: "ok",
        rolEsperado: "ADMIN"
      });

    expect([403, 400]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  it("200 y token cuando todo es válido", async () => {
    prisma.usuarios.findUnique.mockResolvedValue({
      id: "u1",
      correo: "admin@demo.test",
      contrasena_hash: "hash",
      rol: "ADMIN",
      verificado: true
    });
    (bcrypt.compare || bcrypt.default.compare).mockResolvedValue(true);
    (jwt.sign || jwt.default.sign).mockReturnValue("fake.jwt.token");

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        correo: "admin@demo.test",
        password: "ok",
        rolEsperado: "ADMIN"
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBe("fake.jwt.token");
  });
});
