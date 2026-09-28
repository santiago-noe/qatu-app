import { AuthShell } from "@/features/auth/shared/components/auth-shell";
import { RecoveryFlow } from "./recovery-flow";

export function RecoveryAccountView() {
  return (
    <AuthShell>
      <RecoveryFlow />
    </AuthShell>
  );
}
