import { useId } from 'react'
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts'
import { ChartColumn } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { EmptyState } from '@/components/ui/empty-state'
import { niceMax, tickIndexes } from '@/lib/chart'
import { formatRingkas } from '@/lib/format'

const config = { value: { label: 'Penjualan', color: 'var(--color-pena)' } }

/**
 * Grafik batang total per hari (shadcn charts / Recharts). Batang terakhir (hari ini) berwarna penuh,
 * yang lain lebih lembut; ada garis rata-rata dan label di puncak. Warna mengikuti tema aplikasi.
 * data: [{ label, date, value }]
 */
export function BarChart({ data, emptyTitle, emptyDescription, formatValue = String, label = 'Grafik batang' }) {
  const id = useId()
  const max = Math.max(...data.map((item) => item.value), 0)
  if (data.length === 0 || max === 0) {
    return <EmptyState icon={ChartColumn} title={emptyTitle} description={emptyDescription} />
  }

  const count = data.length
  const top = niceMax(max)
  const average = data.reduce((total, item) => total + item.value, 0) / count
  const peak = data.reduce((best, item, index) => (item.value > data[best].value ? index : best), 0)
  const dense = count > 12
  const ticks = (dense ? tickIndexes(count) : data.map((_, index) => index)).map((index) => data[index].label)

  return (
    <figure className="m-0">
      <ChartContainer config={config} className="aspect-auto h-56 w-full" role="img" aria-label={label} aria-describedby={`${id}-tabel`}>
        <RechartsBarChart data={data} margin={{ top: 22, right: 8, bottom: 0, left: 0 }} barCategoryGap={dense ? '12%' : '22%'} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--color-garis-halus)" />
          <XAxis dataKey="label" ticks={ticks} interval={0} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis width={42} domain={[0, top]} ticks={[0, top / 2, top]} tickFormatter={formatRingkas} tickLine={false} axisLine={false} />
          <ReferenceLine
            y={average}
            stroke="var(--color-tinta-redup)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={{ value: `rata-rata ${formatRingkas(average)}`, position: 'insideBottomLeft', fontSize: 10, fill: 'var(--color-tinta-redup)' }}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--color-garis-halus)', opacity: 0.6 }}
            content={
              <ChartTooltipContent
                hideIndicator
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-tinta-redup">Penjualan</span>
                    <strong className="tabular-nums">{formatValue(value)}</strong>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} maxBarSize={36} background={{ fill: 'transparent' }}>
            {data.map((item, index) => (
              <Cell key={item.date ?? item.label} fill="var(--color-value)" fillOpacity={index === count - 1 ? 1 : 0.3} />
            ))}
            <LabelList
              dataKey="value"
              content={({ x, y, width, index }) =>
                index === peak ? (
                  <text x={Number(x) + Number(width) / 2} y={Number(y) - 5} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--color-tinta)">
                    {formatRingkas(data[peak].value)}
                  </text>
                ) : null
              }
            />
          </Bar>
        </RechartsBarChart>
      </ChartContainer>
      <table id={`${id}-tabel`} className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr><th>Tanggal</th><th>Nilai</th></tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date ?? item.label}><td>{item.label}</td><td>{formatValue(item.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
