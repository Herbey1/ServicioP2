export function validateAndNormalizeTelefono(raw) {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { ok: false, msg: "Ingresa un teléfono válido" };
  }
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  const startsWithPlus52 = trimmed.startsWith("+52");

  if (startsWithPlus52 && digits.length === 12) {
    return { ok: true, value: "+52" + digits.slice(-10) };
  }
  if (!startsWithPlus52 && digits.length === 10) {
    return { ok: true, value: "+52" + digits };
  }
  if (startsWithPlus52 && digits.length < 12) {
    return { ok: false, msg: "Completa los 10 dígitos después de +52" };
  }
  if (!startsWithPlus52 && digits.length < 10) {
    return { ok: false, msg: "El teléfono debe tener 10 dígitos" };
  }
  return { ok: false, msg: "Formato inválido. Usa 10 dígitos o +52" };
}
