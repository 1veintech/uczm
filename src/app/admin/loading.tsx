export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-lg bg-zinc-800/50" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-zinc-800/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-lg bg-zinc-800/50 lg:col-span-2" />
        <div className="h-64 rounded-lg bg-zinc-800/50" />
      </div>
    </div>
  );
}
