"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A simple area chart showing sales trends";

const chartData = [
  { date: "2024-01", sales: 12000 },
  { date: "2024-02", sales: 15000 },
  { date: "2024-03", sales: 18000 },
  { date: "2024-04", sales: 17000 },
  { date: "2024-05", sales: 20000 },
  { date: "2024-06", sales: 22000 },
  { date: "2024-07", sales: 21000 },
  { date: "2024-08", sales: 23000 },
  { date: "2024-09", sales: 25000 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
}

export default function SupplierSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend Chart</CardTitle>
        <CardDescription>
          Showing sales performance over the past 9 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(5, 7)} // Format to display month
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="sales"
              type="monotone"
              fill="var(--color-sales)" // Adjust as needed
              fillOpacity={0.4}
              stroke="var(--color-sales)" // Adjust as needed
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - September 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
