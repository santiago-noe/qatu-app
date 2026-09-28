import { KeyRound } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { PASSWORD_MIN } from "@/features/auth/shared/lib/validation";

interface NewPasswordFieldProps {
  label?: string;
  error?: string;
}

// Contraseña nueva (registro y recuperación): new-password para que el celular sugiera una segura.
export function NewPasswordField({ label = "Contraseña", error }: NewPasswordFieldProps) {
  return (
    <TextField
      label={label}
      icon={KeyRound}
      name="password"
      type="password"
      autoComplete="new-password"
      placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
      hint="Mejor una frase fácil de recordar que símbolos raros."
      error={error}
    />
  );
}
