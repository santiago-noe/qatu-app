import { describe, expect, test } from "bun:test";
import {
  hasErrors,
  PASSWORD_MIN,
  validateConsents,
  validateCode,
  validateCurrentPassword,
  validateEmail,
  validateName,
  validateNewPassword,
} from "./validation";

describe("validateEmail", () => {
  test.each(["ana@correo.pe", "  ana.quispe@gmail.com  "])("acepta %p", (email) => {
    expect(validateEmail(email)).toBeUndefined();
  });

  test.each(["", "   ", "ana", "ana@correo", "ana @correo.pe"])("rechaza %p", (email) => {
    expect(validateEmail(email)).toBeString();
  });
});

describe("validateNewPassword", () => {
  test("exige el mínimo de caracteres", () => {
    expect(validateNewPassword("a".repeat(PASSWORD_MIN - 1))).toContain(String(PASSWORD_MIN));
    expect(validateNewPassword("a".repeat(PASSWORD_MIN))).toBeUndefined();
  });

  test("rechaza vacía y demasiado larga", () => {
    expect(validateNewPassword("")).toBeString();
    expect(validateNewPassword("a".repeat(129))).toBeString();
  });
});

test("al iniciar sesión no se revela la política de contraseñas", () => {
  expect(validateCurrentPassword("corta")).toBeUndefined();
  expect(validateCurrentPassword("")).toBeString();
});

test("validateName recorta espacios y limita el largo", () => {
  expect(validateName("  Ana  ")).toBeUndefined();
  expect(validateName("   ")).toBeString();
  expect(validateName("a".repeat(121))).toBeString();
});

test("validateConsents exige ambas casillas", () => {
  expect(hasErrors(validateConsents(true, true))).toBe(false);
  expect(validateConsents(false, true).adult_declared).toBeString();
  expect(validateConsents(true, false).accept_legal).toBeString();
});

test("hasErrors ignora los campos sin mensaje", () => {
  expect(hasErrors({ email: undefined })).toBe(false);
  expect(hasErrors({ email: "Escribe tu correo." })).toBe(true);
});

test("validateCode acepta 6 dígitos, también pegados con espacios", () => {
  expect(validateCode("123456")).toBeUndefined();
  expect(validateCode(" 123 456 ")).toBeUndefined();
  expect(validateCode("")).toBeString();
  expect(validateCode("12345")).toBeString();
  expect(validateCode("12345a")).toBeString();
});
