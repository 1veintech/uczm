export default function AgentLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
