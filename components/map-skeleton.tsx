export function MapSkeleton() {
  return (
    <div className="rounded-none border-0 bg-transparent p-0 backdrop-blur-none md:rounded-[var(--radius-lg)] md:border md:border-line md:bg-[rgb(12_10_8_/_0.65)] md:p-7 md:backdrop-blur-md">
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-stretch lg:gap-7">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {["Top country", "Total views", "Countries"].map((label) => (
            <div
              key={label}
              className="min-w-0 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-4 py-[13px] backdrop-blur-md"
            >
              <div className="mb-2 h-3 w-20 rounded-sm bg-[rgb(255_255_255_/_0.08)]" />
              <div className="h-8 rounded-sm bg-[rgb(255_255_255_/_0.06)]" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:h-full lg:w-full lg:grid-rows-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[34px] rounded-[var(--radius-md)] border border-line-strong bg-[rgb(12_10_8_/_0.42)] py-2 backdrop-blur-md lg:h-full"
              data-testid="skeleton-filter"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <div className="h-[280px] rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] backdrop-blur-md md:h-[440px]" />
        <div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="mb-1.5 h-10 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] backdrop-blur-md md:h-[38.6px]"
              data-testid="skeleton-country-row"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
