"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

export const description = "A donut chart displaying market share by drug type";

const chartData = [
  { type: "Antibiotics", value: 35, fill: "var(--color-antibiotics)" },
  { type: "Pain Relievers", value: 25, fill: "var(--color-pain-relievers)" },
  { type: "Vitamins", value: 15, fill: "var(--color-vitamins)" },
  { type: "Antiseptics", value: 10, fill: "var(--color-antiseptics)" },
  { type: "Vaccines", value: 15, fill: "var(--color-vaccines)" },
];

const chartConfig = {
  value: {
    label: "Market Share",
  },
  antibiotics: {
    label: "Antibiotics",
    color: "hsl(var(--chart-1))",
  },
  "pain-relievers": {
    label: "Pain Relievers",
    color: "hsl(var(--chart-2))",
  },
  vitamins: {
    label: "Vitamins",
    color: "hsl(var(--chart-3))",
  },
  antiseptics: {
    label: "Antiseptics",
    color: "hsl(var(--chart-4))",
  },
  vaccines: {
    label: "Vaccines",
    color: "hsl(var(--chart-5))",
  },
} 

export default function SupplierPie() {
  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Market Share by Drug Type</CardTitle>
        <CardDescription>Showing distribution of market share for different drug types</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Market Share
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing market share distribution for the current period
        </div>
      </CardFooter>
    </Card>
  );
}
