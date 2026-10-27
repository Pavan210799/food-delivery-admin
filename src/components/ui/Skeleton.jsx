const barHeights = [42, 68, 54, 82, 60, 92, 48]

export function Bone({ className = '', style }) {
  return <span className={`skeleton-bone ${className}`} style={style} aria-hidden="true" />
}

export function KpiSkeleton() {
  return (
    <div className="chart-panel skeleton-card flex min-h-[6.6rem] items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Bone className="h-3 w-24" />
        <Bone className="h-6 w-20" />
        <Bone className="h-4 w-16 rounded-full" />
      </div>
      <Bone className="h-12 w-12 shrink-0 rounded-xl" />
    </div>
  )
}

export function KpiRowSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <KpiSkeleton key={i} />
      ))}
    </div>
  )
}

function ChartBody({ variant }) {
  if (variant === 'donut') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row">
        <span className="skeleton-ring" aria-hidden="true" />
        <div className="flex w-full max-w-[13rem] flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Bone key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }
  if (variant === 'progress') {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 p-1">
        {[78, 62, 88, 54, 70].map((w, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Bone className="h-3 w-28" />
              <Bone className="h-3 w-10" />
            </div>
            <Bone className="h-2.5 rounded-full" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    )
  }
  if (variant === 'list') {
    return (
      <div className="flex flex-1 flex-col justify-center gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Bone className="h-3 w-3/4" />
              <Bone className="h-2.5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="skeleton-plot grid flex-1 grid-cols-7 items-end gap-2 px-2 pb-2">
      {barHeights.map((h, i) => (
        <span key={i} className="flex h-full flex-col justify-end">
          <Bone className={`w-full rounded-t-lg rounded-b-none ${variant === 'line' ? 'skeleton-bone--soft' : ''}`} style={{ height: `${h}%` }} />
        </span>
      ))}
    </div>
  )
}

export function ChartSkeleton({ variant = 'bars' }) {
  return (
    <div className="chart-panel skeleton-card flex h-full min-h-[20rem] min-w-0 flex-col gap-4 p-4 sm:min-h-[22rem] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-5 w-36" />
        <Bone className="h-6 w-24 rounded-full" />
      </div>
      <ChartBody variant={variant} />
    </div>
  )
}

const splitClass = {
  '65-35': 'dashboard-split-65-35',
  '40-60': 'dashboard-split-40-60',
  '50-50': 'dashboard-split-50-50',
}

export function ChartRowSkeleton({ ratio = '65-35', variants = ['bars', 'donut'] }) {
  return (
    <div className={`${splitClass[ratio] ?? splitClass['65-35']} min-w-0`}>
      {variants.map((v, i) => (
        <ChartSkeleton key={i} variant={v} />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4 p-1.5 sm:gap-5" aria-busy="true" aria-label="Loading dashboard">
      <KpiRowSkeleton />
      <ChartRowSkeleton ratio="65-35" variants={['bars', 'donut']} />
      <ChartRowSkeleton ratio="50-50" variants={['progress', 'line']} />
      <ChartRowSkeleton ratio="40-60" variants={['list', 'line']} />
    </div>
  )
}

function TableRowsSkeleton({ rows = 7 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="hidden items-center gap-4 px-3 pb-1 sm:flex">
        <Bone className="h-2.5 w-20" />
        <Bone className="ml-auto h-2.5 w-16" />
        <Bone className="h-2.5 w-14" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row">
          <Bone className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Bone className="h-3 w-2/3 max-w-[14rem]" />
            <Bone className="h-2.5 w-1/3 max-w-[8rem]" />
          </div>
          <Bone className="hidden h-3 w-16 sm:block" />
          <Bone className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function CardGridSkeleton({ cards = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="skeleton-tile">
          <Bone className="h-36 w-full rounded-none rounded-t-[1rem]" />
          <div className="flex flex-col gap-2 p-4">
            <Bone className="h-4 w-1/2" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5" />
            <div className="mt-1 flex gap-2">
              <Bone className="h-5 w-16 rounded-full" />
              <Bone className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="skeleton-tile flex flex-col gap-4 p-4 sm:p-5">
          <Bone className="h-4 w-40" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Bone className="h-2.5 w-24" />
              <Bone className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function ModuleSkeleton({ variant = 'table', kpis = 4, tabs = 4 }) {
  return (
    <div className="module-page" aria-busy="true" aria-label="Loading page">
      {kpis ? <KpiRowSkeleton count={kpis} /> : null}
      <div className="chart-panel skeleton-card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Bone className="h-5 w-44" />
            <Bone className="h-3 w-56 max-w-[70vw]" />
          </div>
          <Bone className="h-10 w-36 rounded-xl" />
        </div>
        <div className="skeleton-tabs">
          {Array.from({ length: tabs }, (_, i) => (
            <Bone key={i} className={`h-8 shrink-0 rounded-[0.68rem] ${i === 0 ? 'w-28' : 'w-24'}`} />
          ))}
        </div>
        {variant === 'cards' ? <CardGridSkeleton /> : variant === 'form' ? <FormSkeleton /> : <TableRowsSkeleton />}
      </div>
    </div>
  )
}
