import { FormAlert, FormNotice } from "@/components/form/form-alert";

// Resultado de la última acción del panel (error o confirmación); no ocupa espacio si no hay nada.
export function ActionStatus({ alert, notice }: { alert?: string; notice?: string }) {
  if (!alert && !notice) return null;
  return (
    <div className="flex flex-col gap-2">
      <FormAlert>{alert}</FormAlert>
      <FormNotice>{notice}</FormNotice>
    </div>
  );
}
