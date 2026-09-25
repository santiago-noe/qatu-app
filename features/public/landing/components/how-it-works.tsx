import { HIRE_STEPS, RENT_STEPS, type Step } from "../lib/content";

function StepList({ title, steps }: { title: string; steps: Step[] }) {
  return (
    <div className="space-y-5 rounded-3xl bg-surface-lowest p-6 shadow-sm">
      <h3 className="text-xl font-bold">{title}</h3>
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-bold text-primary">
              {i + 1}
            </span>
            <div>
              <h4 className="font-bold">{s.title}</h4>
              <p className="text-sm text-on-surface-variant">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-surface py-14" aria-labelledby="h-como">
      <div className="mx-auto max-w-[1200px] space-y-8 px-4 md:px-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Simple y transparente
          </p>
          <h2 id="h-como" className="text-2xl font-extrabold md:text-3xl">
            ¿Cómo funciona Qatu?
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <StepList title="Para alquilar herramientas" steps={RENT_STEPS} />
          <StepList title="Para contratar un oficio" steps={HIRE_STEPS} />
        </div>
      </div>
    </section>
  );
}
