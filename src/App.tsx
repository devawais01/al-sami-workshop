export default function App() {
  return (
    <div className="min-h-screen bg-chalk px-6 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-4xl text-indigo">Karigar Book</h1>
        <p className="mt-1 text-sm text-muted">Workshop ka hisaab</p>

        <div className="mt-8 space-y-3">
          <div className="rounded-xl bg-indigo-soft p-4">
            <p className="text-xs font-medium text-indigo">Blue Frock — Lot 44</p>
            <p className="nums mt-1 text-2xl font-semibold text-ink">25 dress diye</p>
          </div>

          <div className="rounded-xl bg-sabz-soft p-4">
            <p className="text-xs font-medium text-sabz">Blue Frock — Lot 44</p>
            <p className="nums mt-1 text-2xl font-semibold text-ink">18 dress wapis mile</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
            <span className="text-sm text-muted">Baqaya</span>
            <span className="nums rounded-full bg-brass px-3 py-1 text-sm font-semibold text-white">
              7
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}