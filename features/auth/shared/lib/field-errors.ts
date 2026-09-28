// Reparte los errores de qatu-api en los campos de los formularios de acceso.

// Códigos de qatu-api (handler/errors.go) que corresponden a un campo del formulario.
// Los demás (credenciales, límite de intentos, captcha…) se muestran como aviso general.
const FIELD_BY_CODE: Record<string, string> = {
  correo_invalido: "email",
  correo_registrado: "email",
  contrasena_corta: "password",
  contrasena_larga: "password",
  contrasena_filtrada: "password",
  contrasena_igual_correo: "password",
  nombre_invalido: "name",
  mayoria_de_edad_requerida: "adult_declared",
  consentimiento_requerido: "accept_legal",
  codigo_invalido: "code",
  codigo_agotado: "code",
};

/** Campo del formulario al que pertenece el error, si el formulario lo tiene. */
export function fieldForError<F extends string>(code: string, fields: readonly F[]): F | undefined {
  const field = FIELD_BY_CODE[code];
  return fields.find((f) => f === field);
}
