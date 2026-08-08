export function SkeletonHero() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-secondary/50">
      <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/70 to-deep/40" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-7xl px-6 w-full">
          <div className="max-w-2xl space-y-4">
            <div className="h-8 bg-secondary/50 rounded animate-pulse w-1/3" />
            <div className="h-12 md:h-16 bg-secondary/50 rounded animate-pulse w-3/4" />
            <div className="h-6 bg-secondary/50 rounded animate-pulse w-full" />
            <div className="h-6 bg-secondary/50 rounded animate-pulse w-2/3" />
            <div className="flex gap-4 mt-6">
              <div className="h-12 bg-secondary/50 rounded-full animate-pulse w-32" />
              <div className="h-12 bg-secondary/50 rounded-full animate-pulse w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
