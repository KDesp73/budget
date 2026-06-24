export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl animate-pulse flex-col gap-6 p-4">
      <div className="h-6 w-28 rounded bg-muted" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="mb-2 h-3 w-20 rounded bg-muted" />
            <div className="h-7 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-4">
            <div className="mb-4 h-4 w-28 rounded bg-muted" />
            <div className="h-44 rounded bg-muted" />
          </div>
        </div>
        <div>
          <div className="rounded-xl border p-4">
            <div className="mb-4 h-4 w-24 rounded bg-muted" />
            <div className="h-44 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
