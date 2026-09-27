// Textos para los códigos de error que llegan en ?error= al volver de Google. Solo se muestran
// estos textos: nunca texto tomado de la URL (cualquiera podría armar un enlace engañoso).
const MESSAGES: Record<string, string> = {
  google_cancelado: "Cancelaste el acceso con Google. Puedes intentarlo de nuevo o usar tu correo.",
  google_estado_invalido: "El acceso con Google venció. Inténtalo de nuevo.",
  google_fallido: "Google no pudo confirmar tu cuenta. Inténtalo de nuevo.",
  google_no_disponible: "El acceso con Google no está disponible por ahora. Usa tu correo y contraseña.",
  google_correo_no_verificado:
    "Tu cuenta de Google no tiene el correo verificado. Verifícalo en Google o regístrate con tu correo.",
  vincular_con_contrasena:
    "Ya tienes una cuenta con ese correo. Inicia sesión con tu contraseña; luego podrás vincular Google desde tu perfil.",
  registro_requerido:
    "Aún no tienes cuenta. Para crearla con Google, marca las casillas de mayoría de edad y términos y vuelve a pulsar «Continuar con Google».",
  cuenta_eliminada: "Esta cuenta fue eliminada.",
  demasiados_intentos: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
};

const FALLBACK = "No pudimos completar el acceso con Google. Inténtalo de nuevo.";

/** Mensaje para un código de ?error=, o undefined si no hay error. */
export function authErrorMessage(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  // hasOwn: "__proto__" o "constructor" no deben leerse del prototipo del objeto.
  return Object.hasOwn(MESSAGES, code) ? MESSAGES[code] : FALLBACK;
}
