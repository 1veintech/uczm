export default function AgentDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded bg-zinc-800/50" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-zinc-800/50" />
          <div className="h-4 w-24 rounded bg-zinc-800/50" />
        </div>
      </div>
      <div className="h-48 rounded-lg bg-zinc-800/50" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-zinc-800/50" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-zinc-800/50" />
    </div>
  );
}
