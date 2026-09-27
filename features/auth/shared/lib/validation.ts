// Validación en el navegador para dar respuesta inmediata. qatu-api vuelve a validar todo:
// estos límites son los de internal/core/domain/account.go.
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;
export const NAME_MAX = 120;

export type FieldErrors<F extends string> = Partial<Record<F, string>>;

export const hasErrors = (errors: FieldErrors<string>) => Object.values(errors).some(Boolean);

// Forma básica "algo@algo.algo"; la regla completa la aplica el API.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Escribe tu correo.";
  if (!EMAIL_SHAPE.test(email)) return "Revisa tu correo, por ejemplo: nombre@correo.pe";
}

/** Contraseña nueva (registro): largo mínimo y máximo. La lista de filtradas la revisa el API. */
export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Escribe una contraseña.";
  if (value.length < PASSWORD_MIN) return `Usa al menos ${PASSWORD_MIN} caracteres.`;
  if (value.length > PASSWORD_MAX) return `Usa como máximo ${PASSWORD_MAX} caracteres.`;
}

/** Contraseña al iniciar sesión: solo que no esté vacía (no se revela la política). */
export function validateCurrentPassword(value: string): string | undefined {
  if (!value) return "Escribe tu contraseña.";
}

/** Casillas obligatorias para crear una cuenta (con correo o con Google). */
export function validateConsents(adultDeclared: boolean, acceptLegal: boolean) {
  return {
    adult_declared: adultDeclared ? undefined : "Debes ser mayor de 18 años para crear una cuenta.",
    accept_legal: acceptLegal ? undefined : "Acepta los términos y la política de privacidad para continuar.",
  };
}

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Escribe tu nombre.";
  if (name.length > NAME_MAX) return `Usa como máximo ${NAME_MAX} caracteres.`;
}
