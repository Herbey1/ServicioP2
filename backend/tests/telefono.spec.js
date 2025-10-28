import { describe, it, expect } from "vitest";
import { validateAndNormalizeTelefono } from "../src/lib/telefono.js";

describe("validateAndNormalizeTelefono", () => {
  it("acepta 10 dígitos y normaliza a +52", () => {
    const r = validateAndNormalizeTelefono("6861234567");
    expect(r.ok).toBe(true);
    expect(r.value).toBe("+526861234567");
  });

  it("acepta '+52' + 10 dígitos y normaliza", () => {
    const r = validateAndNormalizeTelefono("+52 686 123 4567");
    expect(r.ok).toBe(true);
    expect(r.value).toBe("+526861234567");
  });

  it("rechaza menos de 10 dígitos", () => {
    expect(validateAndNormalizeTelefono("123").ok).toBe(false);
  });

  it("rechaza vacío o no string", () => {
    expect(validateAndNormalizeTelefono("").ok).toBe(false);
    expect(validateAndNormalizeTelefono(null).ok).toBe(false);
  });

    it("rechaza '+52' con menos de 10 dígitos", () => {
    const r = validateAndNormalizeTelefono("+52 686 123 45");
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Completa los 10 dígitos/);
  });

  it("rechaza sin '+52' cuando tiene menos de 10 dígitos", () => {
    const r = validateAndNormalizeTelefono("68612345");
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/10 dígitos/);
  });

  it("rechaza formato inválido (11+ dígitos sin '+52')", () => {
    const r = validateAndNormalizeTelefono("68612345678");
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Formato inválido/);
  });
});
