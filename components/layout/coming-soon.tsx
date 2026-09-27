import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  description: string;
}

// Marcador honesto mientras la feature correspondiente no esta implementada.
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="text-ink-2">{description}</p>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </section>
  );
}
