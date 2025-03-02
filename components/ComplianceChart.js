"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Example data for hospital/clinic visits for the entire year
const chartData = [
  { month: "January", visits: 320 },
  { month: "February", visits: 450 },
  { month: "March", visits: 390 },
  { month: "April", visits: 470 },
  { month: "May", visits: 510 },
  { month: "June", visits: 430 },
  { month: "July", visits: 480 },
  { month: "August", visits: 550 },
  { month: "September", visits: 600 },
  { month: "October", visits: 520 },
  { month: "November", visits: 490 },
  { month: "December", visits: 530 },
]

// Calculate percentage change
const initialVisits = chartData[0].visits; // January
const finalVisits = chartData[chartData.length - 1].visits; // December
const percentageChange = ((finalVisits - initialVisits) / initialVisits) * 100;
const formattedPercentageChange = percentageChange.toFixed(1); // Format to one decimal place

// Configuration for the chart
const chartConfig = {
  visits: {
    label: "Hospital Visits",
    color: "hsl(210, 100%, 50%)", // Blue color in HSL format
  },
}

export default function ComplianceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance By Hospitals/Clinics</CardTitle>
        <CardDescription>
          Showing the total number of hospital/clinic visits over the past year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)} // Shorten month names
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`} // Formatting Y-axis values
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="visits"
              type="natural"
              fill="rgba(0, 123, 255, 0.4)" // Blue color with opacity
              stroke="rgb(0, 123, 255)" // Blue color for the stroke
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by {formattedPercentageChange}% this year <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - December 2023
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
