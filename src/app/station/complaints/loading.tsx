export default function ComplaintsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-lg bg-slate-200" />
      ))}
    </div>
  );
}
