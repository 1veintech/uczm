export default function AgentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-zinc-800/50" />
        <div className="h-9 w-24 rounded bg-zinc-800/50" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-zinc-800/50" />
        ))}
      </div>
    </div>
  );
}
