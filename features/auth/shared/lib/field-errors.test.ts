import { expect, test } from "bun:test";
import { fieldForError } from "./client";

const SIGNUP_FIELDS = ["name", "email", "password", "adult_declared", "accept_legal"] as const;

test("los errores de qatu-api se muestran en su campo", () => {
  expect(fieldForError("correo_registrado", SIGNUP_FIELDS)).toBe("email");
  expect(fieldForError("contrasena_filtrada", SIGNUP_FIELDS)).toBe("password");
  expect(fieldForError("consentimiento_requerido", SIGNUP_FIELDS)).toBe("accept_legal");
});

test("un error sin campo, o de un campo que el formulario no tiene, va al aviso general", () => {
  expect(fieldForError("credenciales_invalidas", SIGNUP_FIELDS)).toBeUndefined();
  expect(fieldForError("nombre_invalido", ["email", "password"] as const)).toBeUndefined();
});
