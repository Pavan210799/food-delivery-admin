import MetricCard from '../components/dashboard/MetricCard.jsx'
import OrdersBarChart from '../components/dashboard/OrdersBarChart.jsx'
import LineTrendChart from '../components/dashboard/LineTrendChart.jsx'
import PeakHoursPanel from '../components/dashboard/PeakHoursPanel.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import OrderStatusDonut from '../components/dashboard/OrderStatusDonut.jsx'
import PerformanceMetricsChart from '../components/dashboard/PerformanceMetricsChart.jsx'
import DashboardRow from '../components/dashboard/DashboardRow.jsx'
import ChartSvgDefs from '../components/dashboard/ChartSvgDefs.jsx'
import { getDashboardSnapshot } from '../data/platformData.js'
import { LazySection } from '../components/ui/PageLoader.jsx'
import { ChartRowSkeleton } from '../components/ui/Skeleton.jsx'

export default function DashboardPage() {
  const {
    metrics,
    salesDaily,
    peakHoursToday,
    orderStatusMix,
    performanceMetrics,
    activities,
  } = getDashboardSnapshot()

  return (
    <div className="relative mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4 p-1.5 sm:gap-5">
      <ChartSvgDefs />

      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <LazySection skeleton={<ChartRowSkeleton ratio="65-35" variants={['bars', 'donut']} />}>
        <DashboardRow ratio="65-35" className="relative min-w-0 [&>*]:h-full [&>*]:min-w-0" delay={0.05}>
          <OrdersBarChart series={salesDaily} />
          <OrderStatusDonut slices={orderStatusMix} />
        </DashboardRow>
      </LazySection>

      <LazySection skeleton={<ChartRowSkeleton ratio="50-50" variants={['progress', 'line']} />}>
        <DashboardRow ratio="50-50" className="relative min-w-0 [&>*]:h-full [&>*]:min-w-0">
          <PerformanceMetricsChart metrics={performanceMetrics} />
          <LineTrendChart series={salesDaily} dataKey="revenueK" title="Sales analytics · Revenue" tone="revenue" />
        </DashboardRow>
      </LazySection>

      <LazySection skeleton={<ChartRowSkeleton ratio="40-60" variants={['list', 'line']} />}>
        <DashboardRow ratio="40-60" className="relative min-w-0 [&>*]:h-full [&>*]:min-w-0">
          <RecentActivity items={activities} />
          <PeakHoursPanel series={peakHoursToday} />
        </DashboardRow>
      </LazySection>
    </div>
  )
}
