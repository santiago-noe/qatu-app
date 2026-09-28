import { Hash } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { CODE_LENGTH } from "@/features/auth/shared/lib/validation";

interface CodeFieldProps {
  error?: string;
  autoFocus?: boolean;
}

// Código de 6 dígitos que llega al correo. one-time-code: el celular lo sugiere desde la notificación.
export function CodeField({ error, autoFocus }: CodeFieldProps) {
  return (
    <TextField
      label="Código de verificación"
      icon={Hash}
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder={"0".repeat(CODE_LENGTH)}
      hint="Revisa también la carpeta de spam. El código vence en unos minutos."
      className="[&_input]:font-mono [&_input]:text-lg [&_input]:tracking-[0.3em]"
      autoFocus={autoFocus}
      error={error}
    />
  );
}
