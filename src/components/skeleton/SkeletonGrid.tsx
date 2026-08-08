export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="aspect-[16/9] bg-secondary/50 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-1/3" />
            <div className="h-6 bg-secondary/50 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-secondary/50 rounded animate-pulse" />
              <div className="h-4 bg-secondary/50 rounded animate-pulse w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
