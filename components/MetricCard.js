import React from 'react'
import { cn } from "@/lib/utils"

export function MetricCard({
  icon: Icon,
  value,
  label,
  comparison,
  className,
}) {
  const isPositive = comparison > 0

  return (
    <div className={cn("w-[325px] rounded-xl bg-white p-3 shadow-lg border border-gray-200 h-[120px] flex flex-col justify-around", className)}>
      <div className="flex items-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-950 text-white">
          <Icon size={32} color="black" className="h-5 w-5" />
        </div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div>
        <p className="mx-10 text-sm text-gray-500">{label}</p>
      </div>
      <div className='my-1'></div>
      <hr></hr>
      <div className='my-1'></div>
      <div className="my-1 text-xs text-gray-500 flex items-center justify-between">
        <span>compare to yesterday</span>
        <span className={cn(
          "font-medium",
          isPositive ? "text-emerald-600" : "text-red-600"
        )}>
          {isPositive ? "↑" : "↓"} {Math.abs(comparison)}%
        </span>
      </div>
    </div>
  )
}