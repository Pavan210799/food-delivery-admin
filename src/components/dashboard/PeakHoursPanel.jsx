import LineTrendChart from './LineTrendChart.jsx'

export default function PeakHoursPanel({ series }) {
  const peak = series.reduce((best, row) => (row.orders > best.orders ? row : best), series[0])

  return (
    <LineTrendChart
      series={series}
      dataKey="orders"
      title="Peak-hour statistics"
      tone="peak"
      legendExtra={
        <span className="text-muted">
          <span className="text-copper font-bold">{peak.label}</span>
          <span className="text-ink font-bold"> · {peak.orders}</span>
        </span>
      }
    />
  )
}
