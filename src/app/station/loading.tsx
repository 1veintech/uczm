export default function StationLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-lg bg-slate-200 lg:col-span-2" />
        <div className="h-64 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
