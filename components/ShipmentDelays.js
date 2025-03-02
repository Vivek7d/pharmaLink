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

// Example data for shipment delays over the entire year
const chartData = [
  { month: "January", delays: 50 },
  { month: "February", delays: 60 },
  { month: "March", delays: 55 },
  { month: "April", delays: 70 },
  { month: "May", delays: 65 },
  { month: "June", delays: 75 },
  { month: "July", delays: 80 },
  { month: "August", delays: 85 },
  { month: "September", delays: 90 },
  { month: "October", delays: 70 },
  { month: "November", delays: 60 },
  { month: "December", delays: 65 },
]

// Calculate percentage change
const initialDelays = chartData[0].delays; // January
const finalDelays = chartData[chartData.length - 1].delays; // December
const percentageChange = ((finalDelays - initialDelays) / initialDelays) * 100;
const formattedPercentageChange = percentageChange.toFixed(1); // Format to one decimal place

// Configuration for the chart
const chartConfig = {
  delays: {
    label: "Shipment Delays",
    color: "hsl(120, 100%, 50%)", // Green color in HSL format
  },
}

export default function ShipmentDelayChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Delays Overview</CardTitle>
        <CardDescription>
          Showing the total number of shipment delays over the past year
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
              tickFormatter={(value) => `${value} delays`} // Formatting Y-axis values
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="delays"
              type="natural"
              fill="rgba(0, 255, 0, 0.4)" // Green color with opacity
              stroke="rgb(0, 255, 0)" // Green color for the stroke
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending {formattedPercentageChange}% this year <TrendingUp className="h-4 w-4" />
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
