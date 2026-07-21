'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const MODEL_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#DC2626',
  '#059669',
  '#D97706',
] as const

interface ModelResult {
  model: { name: string }
  totalScore: number
  breakdown: { criteriaName: string; normalizedScore: number }[]
}

interface ResultsChartProps {
  results: ModelResult[]
  criteria: { slug: string; name: string }[]
}

export function ResultsChart({ results, criteria }: ResultsChartProps) {
  // Build radar data: one entry per criterion
  const radarData = criteria.map((c) => {
    const entry: Record<string, string | number> = { criterion: c.name }
    results.forEach((r) => {
      const match = r.breakdown.find((b) => b.criteriaName === c.name)
      entry[r.model.name] = match ? Math.round(match.normalizedScore * 100) : 0
    })
    return entry
  })

  // Build bar data: one entry per model
  const barData = results.map((r, i) => ({
    name: r.model.name,
    score: Math.round(r.totalScore * 100),
    fill: MODEL_COLORS[i % MODEL_COLORS.length],
  }))

  return (
    <Tabs defaultValue="radar" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="radar">Radar</TabsTrigger>
        <TabsTrigger value="bar">Barras</TabsTrigger>
      </TabsList>

      <TabsContent value="radar">
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart data={radarData}>
            <PolarGrid strokeOpacity={0.3} />
            <PolarAngleAxis
              dataKey="criterion"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            {results.map((r, i) => (
              <Radar
                key={r.model.name}
                name={r.model.name}
                dataKey={r.model.name}
                stroke={MODEL_COLORS[i % MODEL_COLORS.length]}
                fill={MODEL_COLORS[i % MODEL_COLORS.length]}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            ))}
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            <RechartTooltip
              formatter={(value: number) => [`${value}`, '']}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="bar">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.2} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <RechartTooltip
              formatter={(value: number) => [`${value} / 100`, 'Puntuación']}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}
