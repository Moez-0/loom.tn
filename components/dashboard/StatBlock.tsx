type StatBlockProps = {
  label: string
  value: number
}

export default function StatBlock({ label, value }: StatBlockProps) {
  return (
    <article className="rounded-xl border border-loom-border bg-loom-surface p-6">
      <p className="section-label">{label}</p>
      <p className="mt-4 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{value}</p>
    </article>
  )
}
