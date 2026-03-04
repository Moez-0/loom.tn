"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartDatum = {
  name: string
  value: number
}

type DailyDatum = {
  day: string
  reservations: number
}

type OwnerAnalyticsChartsProps = {
  statusData: ChartDatum[]
  sourceData: ChartDatum[]
  dailyData: DailyDatum[]
  statusTitle: string
  sourceTitle: string
  trendTitle: string
}

const colors = ['#0067B0', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

export default function OwnerAnalyticsCharts({
  statusData,
  sourceData,
  dailyData,
  statusTitle,
  sourceTitle,
  trendTitle,
}: OwnerAnalyticsChartsProps) {
  return (
    <>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-loom-border bg-loom-surface p-6">
          <h2 className="text-lg font-semibold text-loom-black">{statusTitle}</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fill: '#a0a0a0', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111111',
                    border: '1px solid #2a2a2a',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-loom-border bg-loom-surface p-6">
          <h2 className="text-lg font-semibold text-loom-black">{sourceTitle}</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92} innerRadius={52}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#111111',
                    border: '1px solid #2a2a2a',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ color: '#a0a0a0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-loom-border bg-loom-surface p-6">
        <h2 className="text-lg font-semibold text-loom-black">{trendTitle}</h2>
        <div className="mt-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="day" stroke="#888" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
              <YAxis stroke="#888" tick={{ fill: '#a0a0a0', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#111111',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              <Bar dataKey="reservations" fill="#0067B0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  )
}
