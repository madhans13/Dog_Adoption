"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "~/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

const chartData = [
  { date: "2024-04-01", adoptions: 222, rescues: 150 },
  { date: "2024-04-02", adoptions: 97, rescues: 180 },
  { date: "2024-04-03", adoptions: 167, rescues: 120 },
  { date: "2024-04-04", adoptions: 242, rescues: 260 },
  { date: "2024-04-05", adoptions: 373, rescues: 290 },
  { date: "2024-04-06", adoptions: 301, rescues: 340 },
  { date: "2024-04-07", adoptions: 245, rescues: 180 },
  { date: "2024-04-08", adoptions: 409, rescues: 320 },
  { date: "2024-04-09", adoptions: 59, rescues: 110 },
  { date: "2024-04-10", adoptions: 261, rescues: 190 },
  { date: "2024-04-11", adoptions: 327, rescues: 350 },
  { date: "2024-04-12", adoptions: 292, rescues: 210 },
  { date: "2024-04-13", adoptions: 342, rescues: 380 },
  { date: "2024-04-14", adoptions: 137, rescues: 220 },
  { date: "2024-04-15", adoptions: 120, rescues: 170 },
  { date: "2024-04-16", adoptions: 138, rescues: 190 },
  { date: "2024-04-17", adoptions: 446, rescues: 360 },
  { date: "2024-04-18", adoptions: 364, rescues: 410 },
  { date: "2024-04-19", adoptions: 243, rescues: 180 },
  { date: "2024-04-20", adoptions: 89, rescues: 150 },
  { date: "2024-04-21", adoptions: 137, rescues: 200 },
  { date: "2024-04-22", adoptions: 224, rescues: 170 },
  { date: "2024-04-23", adoptions: 138, rescues: 230 },
  { date: "2024-04-24", adoptions: 387, rescues: 290 },
  { date: "2024-04-25", adoptions: 215, rescues: 250 },
  { date: "2024-04-26", adoptions: 75, rescues: 130 },
  { date: "2024-04-27", adoptions: 383, rescues: 420 },
  { date: "2024-04-28", adoptions: 122, rescues: 180 },
  { date: "2024-04-29", adoptions: 315, rescues: 240 },
  { date: "2024-04-30", adoptions: 454, rescues: 380 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  adoptions: {
    label: "Adoptions",
    color: "hsl(var(--chart-1))",
  },
  rescues: {
    label: "Rescues",
    color: "hsl(var(--chart-2))",
  },
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const isMobile = useIsMobile()

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000)
    return date >= startDate
  })

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Dog Adoption Analytics</CardTitle>
          <CardDescription>
            Showing adoption and rescue trends over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAdoptions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-adoptions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-adoptions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRescues" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rescues)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rescues)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator={isMobile ? "dot" : "line"}
                />
              }
            />
            <Area
              dataKey="rescues"
              type="natural"
              fill="url(#fillRescues)"
              stroke="var(--color-rescues)"
              stackId="a"
            />
            <Area
              dataKey="adoptions"
              type="natural"
              fill="url(#fillAdoptions)"
              stroke="var(--color-adoptions)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}