"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
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

export const description = "An interactive bar chart showing high-dosage drug consumption"

const chartData = [
  // January
  { date: "2023-01-05", morphine: 310, fentanyl: 200, methadone: 175 },
  { date: "2023-01-12", morphine: 320, fentanyl: 210, methadone: 180 },
  { date: "2023-01-18", morphine: 330, fentanyl: 220, methadone: 185 },
  { date: "2023-01-23", morphine: 340, fentanyl: 230, methadone: 190 },
  { date: "2023-01-30", morphine: 355, fentanyl: 240, methadone: 200 },

  // February
  { date: "2023-02-03", morphine: 325, fentanyl: 215, methadone: 185 },
  { date: "2023-02-10", morphine: 335, fentanyl: 225, methadone: 190 },
  { date: "2023-02-15", morphine: 345, fentanyl: 230, methadone: 200 },
  { date: "2023-02-22", morphine: 340, fentanyl: 240, methadone: 210 },
  { date: "2023-02-28", morphine: 355, fentanyl: 245, methadone: 215 },

  // March
  { date: "2023-03-04", morphine: 330, fentanyl: 225, methadone: 195 },
  { date: "2023-03-09", morphine: 340, fentanyl: 230, methadone: 200 },
  { date: "2023-03-14", morphine: 350, fentanyl: 240, methadone: 210 },
  { date: "2023-03-20", morphine: 360, fentanyl: 250, methadone: 215 },
  { date: "2023-03-28", morphine: 375, fentanyl: 260, methadone: 220 },

  // April
  { date: "2023-04-02", morphine: 340, fentanyl: 235, methadone: 200 },
  { date: "2023-04-08", morphine: 350, fentanyl: 245, methadone: 210 },
  { date: "2023-04-14", morphine: 355, fentanyl: 255, methadone: 220 },
  { date: "2023-04-19", morphine: 365, fentanyl: 265, methadone: 225 },
  { date: "2023-04-25", morphine: 375, fentanyl: 275, methadone: 230 },

  // May
  { date: "2023-05-03", morphine: 350, fentanyl: 240, methadone: 210 },
  { date: "2023-05-10", morphine: 360, fentanyl: 250, methadone: 215 },
  { date: "2023-05-15", morphine: 370, fentanyl: 260, methadone: 225 },
  { date: "2023-05-22", morphine: 380, fentanyl: 270, methadone: 230 },
  { date: "2023-05-30", morphine: 390, fentanyl: 280, methadone: 240 },

  // June
  { date: "2023-06-04", morphine: 360, fentanyl: 250, methadone: 220 },
  { date: "2023-06-10", morphine: 370, fentanyl: 260, methadone: 225 },
  { date: "2023-06-15", morphine: 375, fentanyl: 270, methadone: 230 },
  { date: "2023-06-21", morphine: 380, fentanyl: 275, methadone: 240 },
  { date: "2023-06-30", morphine: 390, fentanyl: 280, methadone: 250 },

  // July
  { date: "2023-07-05", morphine: 370, fentanyl: 265, methadone: 230 },
  { date: "2023-07-11", morphine: 380, fentanyl: 275, methadone: 240 },
  { date: "2023-07-17", morphine: 390, fentanyl: 285, methadone: 245 },
  { date: "2023-07-22", morphine: 400, fentanyl: 290, methadone: 250 },
  { date: "2023-07-31", morphine: 410, fentanyl: 300, methadone: 260 },

  // August
  { date: "2023-08-02", morphine: 375, fentanyl: 270, methadone: 240 },
  { date: "2023-08-09", morphine: 385, fentanyl: 275, methadone: 245 },
  { date: "2023-08-15", morphine: 395, fentanyl: 285, methadone: 250 },
  { date: "2023-08-20", morphine: 405, fentanyl: 295, methadone: 255 },
  { date: "2023-08-30", morphine: 415, fentanyl: 305, methadone: 265 },

  // September
  { date: "2023-09-04", morphine: 380, fentanyl: 275, methadone: 245 },
  { date: "2023-09-10", morphine: 390, fentanyl: 285, methadone: 250 },
  { date: "2023-09-14", morphine: 400, fentanyl: 295, methadone: 260 },
  { date: "2023-09-22", morphine: 410, fentanyl: 305, methadone: 265 },
  { date: "2023-09-30", morphine: 420, fentanyl: 315, methadone: 275 },

  // October
  { date: "2023-10-02", morphine: 390, fentanyl: 280, methadone: 250 },
  { date: "2023-10-09", morphine: 400, fentanyl: 290, methadone: 255 },
  { date: "2023-10-15", morphine: 410, fentanyl: 300, methadone: 260 },
  { date: "2023-10-22", morphine: 420, fentanyl: 310, methadone: 270 },
  { date: "2023-10-31", morphine: 430, fentanyl: 320, methadone: 275 },

  // November
  { date: "2023-11-03", morphine: 400, fentanyl: 290, methadone: 260 },
  { date: "2023-11-08", morphine: 410, fentanyl: 300, methadone: 270 },
  { date: "2023-11-15", morphine: 420, fentanyl: 310, methadone: 275 },
  { date: "2023-11-21", morphine: 430, fentanyl: 320, methadone: 280 },
  { date: "2023-11-30", morphine: 440, fentanyl: 330, methadone: 290 },

  // December
  { date: "2023-12-05", morphine: 410, fentanyl: 300, methadone: 270 },
  { date: "2023-12-10", morphine: 420, fentanyl: 310, methadone: 275 },
  { date: "2023-12-15", morphine: 430, fentanyl: 320, methadone: 280 },
  { date: "2023-12-22", morphine: 440, fentanyl: 330, methadone: 290 },
  { date: "2023-12-29", morphine: 450, fentanyl: 340, methadone: 300 },
];

const chartConfig = {
  views: {
    label: "Drug Consumption",
  },
  morphine: {
    label: "Morphine",
    color: "hsl(var(--chart-1))",
  },
  fentanyl: {
    label: "Fentanyl",
    color: "hsl(var(--chart-2))",
  },
  methadone: {
    label: "Methadone",
    color: "hsl(var(--chart-3))",
  },
}

export default function ChartComponent() {
  const [activeChart, setActiveChart] = React.useState("morphine");

  const total = React.useMemo(
    () => ({
      morphine: chartData.reduce((acc, curr) => acc + curr.morphine, 0),
      fentanyl: chartData.reduce((acc, curr) => acc + curr.fentanyl, 0),
      methadone: chartData.reduce((acc, curr) => acc + curr.methadone, 0),
    }),
    []
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - High-Dosage Drug Consumption</CardTitle>
          <CardDescription>
            Showing total consumption of high-dosage drugs for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["morphine", "fentanyl", "methadone"].map((key) => {
            const chart = key
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[chart].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
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
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
