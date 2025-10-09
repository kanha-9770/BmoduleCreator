import { ChartCard } from "@/components/dashboard/chart-card"

interface AnalyticsGridProps {
  charts: Array<{
    id: string
    title: string
    type: "line" | "bar" | "pie" | "area"
    data: any[]
  }>
}

export function AnalyticsGrid({ charts }: AnalyticsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {charts.map((chart) => (
        <ChartCard key={chart.id} title={chart.title} type={chart.type} data={chart.data} />
      ))}
    </div>
  )
}
