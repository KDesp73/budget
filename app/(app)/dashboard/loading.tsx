export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl animate-pulse flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-6 w-6 rounded bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="mb-2 h-3 w-20 rounded bg-muted" />
            <div className="h-7 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4">
        <div className="mb-4 h-4 w-28 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-16 rounded-lg bg-muted/50" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
          <div className="h-16 rounded-lg bg-muted/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-full rounded-xl border p-4">
            <div className="mb-4 h-4 w-28 rounded bg-muted" />
            <div className="h-44 rounded bg-muted" />
          </div>
        </div>
        <div>
          <div className="h-full rounded-xl border p-4">
            <div className="mb-4 h-4 w-24 rounded bg-muted" />
            <div className="h-44 rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="h-full rounded-xl border p-4">
            <div className="mb-4 h-4 w-20 rounded bg-muted" />
            <div className="h-48 rounded bg-muted" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="h-full rounded-xl border p-4">
            <div className="mb-4 h-4 w-36 rounded bg-muted" />
            <div className="h-32 rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="h-full rounded-xl border p-4">
            <div className="mb-4 h-4 w-28 rounded bg-muted" />
            <div className="h-40 rounded bg-muted" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="h-full rounded-xl border p-4">
            <div className="mb-4 h-4 w-36 rounded bg-muted" />
            <div className="h-40 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}