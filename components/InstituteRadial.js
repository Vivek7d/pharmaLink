import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

// Update this value to reflect the total number of institutions added from Jan - Dec
const noOfProcurements = 120; 

const chartData = [
  { category: "Procurements", count: noOfProcurements, fill: "var(--color-institution)" },
]

const chartConfig = {
  institutions: {
    label: "Procurements",
  },
  category: {
    label: "Institutions",
    color: "hsl(var(--chart-2))",
  },
} 

export default function InstituteRadial() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Number of Procurements Done</CardTitle>
        <CardDescription>January - December 2023</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={360}
            innerRadius={80}
            outerRadius={140}
            barSize={10}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="fill-none"  // Ensure grid does not interfere
            />
            <RadialBar
              dataKey="count"
              background
              clockWise
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="text-4xl font-bold"
                        >
                          {noOfProcurements.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy={30} // Adjust vertical positioning
                          className="text-muted-foreground"
                        >
                          Procurements
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 3.3% this year <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the total number of procurements done from January to December 2023
        </div>
      </CardFooter>
    </Card>
  )
}
