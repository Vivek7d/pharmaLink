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
    { date: "2023-01-05", morphine: 155, fentanyl: 100, methadone: 87.5 },
    { date: "2023-01-12", morphine: 160, fentanyl: 105, methadone: 90 },
    { date: "2023-01-18", morphine: 165, fentanyl: 110, methadone: 92.5 },
    { date: "2023-01-23", morphine: 170, fentanyl: 115, methadone: 95 },
    { date: "2023-01-30", morphine: 177.5, fentanyl: 120, methadone: 100 },
  
    // February
    { date: "2023-02-03", morphine: 162.5, fentanyl: 107.5, methadone: 92.5 },
    { date: "2023-02-10", morphine: 167.5, fentanyl: 112.5, methadone: 95 },
    { date: "2023-02-15", morphine: 172.5, fentanyl: 115, methadone: 100 },
    { date: "2023-02-22", morphine: 170, fentanyl: 120, methadone: 105 },
    { date: "2023-02-28", morphine: 177.5, fentanyl: 122.5, methadone: 107.5 },
  
    // March
    { date: "2023-03-04", morphine: 165, fentanyl: 112.5, methadone: 97.5 },
    { date: "2023-03-09", morphine: 170, fentanyl: 115, methadone: 100 },
    { date: "2023-03-14", morphine: 175, fentanyl: 120, methadone: 105 },
    { date: "2023-03-20", morphine: 180, fentanyl: 125, methadone: 107.5 },
    { date: "2023-03-28", morphine: 187.5, fentanyl: 130, methadone: 110 },
  
    // April
    { date: "2023-04-02", morphine: 170, fentanyl: 117.5, methadone: 100 },
    { date: "2023-04-08", morphine: 175, fentanyl: 122.5, methadone: 105 },
    { date: "2023-04-14", morphine: 177.5, fentanyl: 127.5, methadone: 110 },
    { date: "2023-04-19", morphine: 182.5, fentanyl: 132.5, methadone: 112.5 },
    { date: "2023-04-25", morphine: 187.5, fentanyl: 137.5, methadone: 115 },
  
    // May
    { date: "2023-05-03", morphine: 175, fentanyl: 120, methadone: 105 },
    { date: "2023-05-10", morphine: 180, fentanyl: 125, methadone: 107.5 },
    { date: "2023-05-15", morphine: 185, fentanyl: 130, methadone: 112.5 },
    { date: "2023-05-22", morphine: 190, fentanyl: 135, methadone: 115 },
    { date: "2023-05-30", morphine: 195, fentanyl: 140, methadone: 120 },
  
    // June
    { date: "2023-06-04", morphine: 180, fentanyl: 125, methadone: 110 },
    { date: "2023-06-10", morphine: 185, fentanyl: 130, methadone: 112.5 },
    { date: "2023-06-15", morphine: 187.5, fentanyl: 135, methadone: 115 },
    { date: "2023-06-21", morphine: 190, fentanyl: 137.5, methadone: 120 },
    { date: "2023-06-30", morphine: 195, fentanyl: 140, methadone: 125 },
  
    // July
    { date: "2023-07-05", morphine: 185, fentanyl: 132.5, methadone: 115 },
    { date: "2023-07-11", morphine: 190, fentanyl: 137.5, methadone: 120 },
    { date: "2023-07-17", morphine: 195, fentanyl: 142.5, methadone: 122.5 },
    { date: "2023-07-22", morphine: 200, fentanyl: 145, methadone: 125 },
    { date: "2023-07-31", morphine: 205, fentanyl: 150, methadone: 130 },
  
    // August
    { date: "2023-08-02", morphine: 187.5, fentanyl: 135, methadone: 120 },
    { date: "2023-08-09", morphine: 192.5, fentanyl: 137.5, methadone: 122.5 },
    { date: "2023-08-15", morphine: 197.5, fentanyl: 142.5, methadone: 125 },
    { date: "2023-08-20", morphine: 202.5, fentanyl: 147.5, methadone: 127.5 },
    { date: "2023-08-30", morphine: 207.5, fentanyl: 152.5, methadone: 132.5 },
  
    // September
    { date: "2023-09-04", morphine: 190, fentanyl: 137.5, methadone: 122.5 },
    { date: "2023-09-10", morphine: 195, fentanyl: 142.5, methadone: 125 },
    { date: "2023-09-14", morphine: 200, fentanyl: 147.5, methadone: 130 },
    { date: "2023-09-22", morphine: 205, fentanyl: 152.5, methadone: 132.5 },
    { date: "2023-09-30", morphine: 210, fentanyl: 157.5, methadone: 137.5 },
  
    // October
    { date: "2023-10-02", morphine: 195, fentanyl: 140, methadone: 125 },
    { date: "2023-10-09", morphine: 200, fentanyl: 145, methadone: 127.5 },
    { date: "2023-10-15", morphine: 205, fentanyl: 150, methadone: 130 },
    { date: "2023-10-22", morphine: 210, fentanyl: 155, methadone: 135 },
    { date: "2023-10-31", morphine: 215, fentanyl: 160, methadone: 137.5 },
  
    // November
    { date: "2023-11-03", morphine: 200, fentanyl: 145, methadone: 130 },
    { date: "2023-11-08", morphine: 205, fentanyl: 150, methadone: 135 },
    { date: "2023-11-15", morphine: 210, fentanyl: 155, methadone: 137.5 },
    { date: "2023-11-21", morphine: 215, fentanyl: 160, methadone: 140 },
    { date: "2023-11-30", morphine: 220, fentanyl: 165, methadone: 145 },
  
    // December
    { date: "2023-12-05", morphine: 205, fentanyl: 150, methadone: 135 },
    { date: "2023-12-10", morphine: 210, fentanyl: 155, methadone: 137.5 },
    { date: "2023-12-15", morphine: 215, fentanyl: 160, methadone: 140 },
    { date: "2023-12-22", morphine: 220, fentanyl: 165, methadone: 145 },
    { date: "2023-12-29", morphine: 225, fentanyl: 170, methadone: 150 },
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

export default function InstituteDrugConsumptionChart() {
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
