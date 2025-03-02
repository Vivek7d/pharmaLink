"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Bell, ChevronDown, Menu, Settings, User, Hospital, AlertTriangle, BarChart2, BedDouble, UserPlus, Thermometer, Syringe, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const admissionData = [
  { name: 'Jan', admissions: 421 },
  { name: 'Feb', admissions: 389 },
  { name: 'Mar', admissions: 412 },
  { name: 'Apr', admissions: 395 },
  { name: 'May', admissions: 432 },
  { name: 'Jun', admissions: 456 },
]

const occupancyData = [
  { name: 'Mon', occupancy: 75 },
  { name: 'Tue', occupancy: 82 },
  { name: 'Wed', occupancy: 87 },
  { name: 'Thu', occupancy: 84 },
  { name: 'Fri', occupancy: 80 },
  { name: 'Sat', occupancy: 72 },
  { name: 'Sun', occupancy: 68 },
]

const MotionCard = motion(Card)

export default function InstituteAdminPanelChart() {
  return (
    <div className="flex flex-col min-h-screen w-full "> {/* Background color for the whole page */}
      <main className="flex-grow w-full px-6 py-8 space-y-8"> {/* Padding and spacing for layout */}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Beds', value: '524', icon: <BedDouble className="h-4 w-4 text-blue-500" />, subtitle: '48 available' },
            { title: 'New Admissions', value: '37', icon: <UserPlus className="h-4 w-4 text-green-500" />, subtitle: '+12% from yesterday' },
            { title: 'Critical Patients', value: '18', icon: <Thermometer className="h-4 w-4 text-red-500" />, subtitle: '3 in ICU' },
            { title: 'Vaccinations Today', value: '89', icon: <Syringe className="h-4 w-4 text-purple-500" />, subtitle: '+23 from yesterday' }
          ].map((card, idx) => (
            <MotionCard
              key={idx}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="shadow-lg rounded-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </MotionCard>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="shadow-lg rounded-lg"
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                Monthly Admissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={admissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="admissions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="shadow-lg rounded-lg"
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <BedDouble className="h-5 w-5 mr-2 text-green-500" />
                Weekly Bed Occupancy (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="occupancy" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
        </div>

        {/* Patient List */}
        <MotionCard
          className="mb-8 shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CardHeader className="flex justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Critical Patients</span>
            </div>
            <Input className="max-w-sm" placeholder="Search patients..." />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 'PT-5678', name: 'Emma Thompson', age: 62, condition: 'Respiratory Failure', room: 'ICU-03', status: 'Critical' },
                  { id: 'PT-9012', name: 'Michael Chen', age: 45, condition: 'Myocardial Infarction', room: 'CCU-02', status: 'Serious' },
                  { id: 'PT-3456', name: 'Sophia Rodriguez', age: 78, condition: 'Sepsis', room: 'ICU-05', status: 'Critical' }
                ].map((patient, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.condition}</TableCell>
                    <TableCell>{patient.room}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {patient.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </MotionCard>
      </main>
    </div>
  )
}
