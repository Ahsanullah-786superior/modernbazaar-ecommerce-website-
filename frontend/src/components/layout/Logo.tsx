export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center w-12 h-12 rounded-3xl bg-white shadow-lg shadow-primary/15 ring-1 ring-primary/10">
        <img src="/logo.svg" alt="Modern Bazaar logo" className="w-10 h-10" />
      </div>
      <div className="leading-tight">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary opacity-90">Modern</p>
        <p className="text-lg font-semibold text-foreground">Bazaar</p>
      </div>
    </div>
  )
}
