"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type AdminBusinessLoadDatum = {
  business: string
  reservations: number
}

type AdminAnalyticsChartsProps = {
  businessLoad: AdminBusinessLoadDatum[]
  title: string
}

export default function AdminAnalyticsCharts({ businessLoad, title }: AdminAnalyticsChartsProps) {
  return (
    <section className="mt-6 rounded-xl border border-loom-border bg-loom-surface p-6">
      <h2 className="text-lg font-semibold text-loom-black">{title}</h2>
      <div className="mt-4 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={businessLoad} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="business" stroke="#888" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
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
  )
}
