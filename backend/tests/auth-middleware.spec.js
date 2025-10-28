// tests/auth-middleware.spec.js
import { describe, it, expect, vi } from "vitest";

// 1) Mock del módulo ESM ANTES de importar el código bajo prueba
vi.mock("jsonwebtoken", () => ({
  // cubre ambos estilos de import en tu código: default y named
  default: { verify: vi.fn() },
  verify: vi.fn()
}));

// 2) Ahora sí importa
import jwt from "jsonwebtoken"; // si tu middleware usa default import
// import * as jwt from "jsonwebtoken"; // si usara named; con el mock de arriba igual funciona

import { requireAuth, requireRole } from "../src/middleware/auth.js";

const resMock = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe("requireAuth", () => {
  it("401 si falta token", () => {
    const req = { headers: {} }, res = resMock(), next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });

  it("setea req.user con token válido", () => {
    // 3) en lugar de vi.spyOn(...), usa el mock directo
    (jwt.verify || jwt.default.verify).mockReturnValue({ sub: "u1", rol: "ADMIN" });

    const req = { headers: { authorization: "Bearer ok" } };
    const res = resMock();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual({ sub: "u1", rol: "ADMIN" });
    expect(next).toHaveBeenCalled();
  });

  it("401 si el token es inválido", () => {
    (jwt.verify || jwt.default.verify).mockImplementation(() => { throw new Error("bad"); });

    const req = { headers: { authorization: "Bearer bad" } };
    const res = resMock();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("requireRole", () => {
  it("permite si el rol está autorizado", () => {
    const mw = requireRole("ADMIN");
    const req = { user: { rol: "ADMIN" } }, res = resMock(), next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 si el rol NO está autorizado", () => {
    const mw = requireRole("ADMIN");
    const req = { user: { rol: "DOCENTE" } }, res = resMock(), next = vi.fn();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
