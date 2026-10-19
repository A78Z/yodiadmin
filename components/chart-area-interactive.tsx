"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface MonthlyStats {
  month: string
  count: number
  totalAmount: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const [year, month] = label.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    const monthName = date.toLocaleString('fr-FR', { month: 'long' })
    const yearStr = date.getFullYear()

    return (
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="mb-2 font-medium text-gray-900">
          {monthName} {yearStr}
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name === "Montant total"
                  ? `${entry.name}: ${formatCurrency(entry.value)}`
                  : `${entry.name}: ${entry.value}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/orders/stats")
        if (!response.ok) throw new Error("Erreur lors de la récupération des statistiques")
        const data = await response.json()
        setMonthlyStats(data.monthlyStats)
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const filteredData = monthlyStats.filter((item) => {
    const date = new Date(item.month)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const chartConfig = {
    orders: {
      label: "Commandes",
    },
    count: {
      label: "Nombre de commandes",
      color: "var(--primary)",
    },
    totalAmount: {
      label: "Montant total",
      color: "var(--primary)",
    },
  } satisfies ChartConfig

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse bg-gray-100" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Statistiques des commandes</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total des 3 derniers mois
          </span>
          <span className="@[540px]/card:hidden">3 derniers mois</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 derniers mois</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 derniers jours</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 derniers jours</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Période des statistiques"
            >
              <SelectValue placeholder="3 derniers mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 derniers mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 derniers jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? <div className="admin-chart-empty" role="status"><span>Votre activité prend place ici.</span><p>Aucune commande sur cette période. Les prochaines apparaîtront dans ce graphique.</p></div> : <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-count)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-amount)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-amount)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const [year, month] = value.split('-')
                const date = new Date(parseInt(year), parseInt(month) - 1)
                return date.toLocaleString('fr-FR', { month: 'short' })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={<CustomTooltip />}
            />
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillCount)"
              stroke="var(--color-count)"
              stackId="a"
              name="Nombre de commandes"
            />
            <Area
              dataKey="totalAmount"
              type="natural"
              fill="url(#fillAmount)"
              stroke="var(--color-amount)"
              stackId="a"
              name="Montant total"
            />
          </AreaChart>
        </ChartContainer>}
      </CardContent>
    </Card>
  )
}
