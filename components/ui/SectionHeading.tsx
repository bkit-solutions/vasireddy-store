export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-studio-accent">Curated Edit</p>
        <h2 className="mt-1 text-3xl font-semibold text-studio-primary md:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-studio-ink/75">{subtitle}</p> : null}
      </div>
    </div>
  );
}
