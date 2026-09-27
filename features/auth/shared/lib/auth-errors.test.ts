import { expect, test } from "bun:test";
import { authErrorMessage } from "./auth-errors";

test("sin código no hay mensaje", () => {
  expect(authErrorMessage(null)).toBeUndefined();
  expect(authErrorMessage("")).toBeUndefined();
});

test("cada código conocido tiene su texto", () => {
  expect(authErrorMessage("vincular_con_contrasena")).toContain("contraseña");
  expect(authErrorMessage("registro_requerido")).toContain("casillas");
});

test("un código desconocido o manipulado muestra un texto genérico, nunca el de la URL", () => {
  const injected = "Tu cuenta fue bloqueada, llama al 999";
  expect(authErrorMessage(injected)).not.toContain("999");
  expect(authErrorMessage("__proto__")).toBeString();
});
