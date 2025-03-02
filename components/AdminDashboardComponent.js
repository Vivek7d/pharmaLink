"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Bell, ChevronDown, Menu, Settings, User, Hospital, Truck, AlertTriangle, BarChart2, PieChart, Activity, FileText, Sliders, Users, Clipboard, Search } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts'

const admissionData = [
  { name: 'Jan', admissions: 4231 },
  { name: 'Feb', admissions: 3892 },
  { name: 'Mar', admissions: 4102 },
  { name: 'Apr', admissions: 3954 },
  { name: 'May', admissions: 4328 },
  { name: 'Jun', admissions: 4567 },
]

const supplierData = [
  { name: 'On Time', value: 412 },
  { name: 'Delayed', value: 243 },
  { name: 'Pending', value: 178 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

const MotionCard = motion(Card)

export default function AdminDashboardComponent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
     

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 w-full">
        {/* Navigation Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-8 w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center justify-center">
              <BarChart2 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center justify-center">
              <Hospital className="w-4 h-4 mr-2" />
              Hospitals
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center justify-center">
              <Truck className="w-4 h-4 mr-2" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Sliders className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MotionCard
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                  <Hospital className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,284</div>
                  <p className="text-xs text-muted-foreground">+20 from last month</p>
                </CardContent>
              </MotionCard>
              <MotionCard
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                  <Truck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">833</div>
                  <p className="text-xs text-muted-foreground">+15 from last month</p>
                </CardContent>
              </MotionCard>
              <MotionCard
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Inventory</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">+7 from yesterday</p>
                </CardContent>
              </MotionCard>
              <MotionCard
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+3 new alerts</p>
                </CardContent>
              </MotionCard>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                    Hospital Admission Trends
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
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-green-500" />
                    Supplier Activity Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={supplierData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {supplierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </div>

            {/* Activity Feed */}
            <MotionCard
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <p className="text-sm">Mercy General Hospital admitted 12 new patients</p>
                    <span className="ml-auto text-xs text-muted-foreground">5 min ago</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <p className="text-sm">MedSupply Co. reported a delay in PPE shipment</p>
                    <span className="ml-auto text-xs text-muted-foreground">22 min ago</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <p className="text-sm">Emergency alert: City Central Hospital needs additional ventilators</p>
                    <span className="ml-auto text-xs text-muted-foreground">1 hour ago</span>
                  </motion.div>
                </div>
              </CardContent>
            </MotionCard>
          </TabsContent>

          <TabsContent value="hospitals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hospital className="h-5 w-5 mr-2 text-blue-500" />
                  Hospitals Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Registered Hospitals</h3>
                    <Button>
                      <Users className="mr-2 h-4 w-4" /> Add New Hospital
                    </Button>
                  </div>
                  <Input placeholder="Search hospitals..." />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Mercy General Hospital</TableCell>
                        <TableCell>New York, NY</TableCell>
                        <TableCell>500 beds</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>St. Mary's Medical Center</TableCell>
                        <TableCell>Chicago, IL</TableCell>
                        <TableCell>350 beds</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Caution
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>City Central Hospital</TableCell>
                        <TableCell>Los Angeles, CA</TableCell>
                        <TableCell>600 beds</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Critical
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-green-500" />
                  Suppliers Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Active Suppliers</h3>
                    <Button>
                      <Truck className="mr-2 h-4 w-4" /> Add New Supplier
                    </Button>
                  </div>
                  <Input placeholder="Search suppliers..." />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Delivery</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>MedSupply Co.</TableCell>
                        <TableCell>Medical Equipment</TableCell>
                        <TableCell>2023-06-15</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>HealthTech Solutions</TableCell>
                        <TableCell>Technology</TableCell>
                        <TableCell>2023-06-10</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Pending Review
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Global Pharma Inc.</TableCell>
                        <TableCell>Pharmaceuticals</TableCell>
                        <TableCell>2023-06-05</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Delayed
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-500" />
                  Reports Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Available Reports</h3>
                    <Button>
                      <Clipboard className="mr-2 h-4 w-4" /> Generate New Report
                    </Button>
                  </div>
                  <Input placeholder="Search reports..." />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Generated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Monthly Hospital Performance</TableCell>
                        <TableCell>Performance</TableCell>
                        <TableCell>2023-06-01</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Supplier Delivery Times</TableCell>
                        <TableCell>Logistics</TableCell>
                        <TableCell>2023-05-15</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Emergency Response Times</TableCell>
                        <TableCell>Emergency</TableCell>
                        <TableCell>2023-06-10</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sliders className="h-5 w-5 mr-2 text-gray-500" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="system-name" className="text-sm font-medium">System Name</label>
                      <Input id="system-name" defaultValue="HealthTrack Gov" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="admin-email" className="text-sm font-medium">Admin Email</label>
                      <Input id="admin-email" defaultValue="admin@healthtrack.gov" type="email" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
                      <select id="timezone" className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        <option>UTC-05:00 Eastern Time</option>
                        <option>UTC-06:00 Central Time</option>
                        <option>UTC-07:00 Mountain Time</option>
                        <option>UTC-08:00 Pacific Time</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="data-retention" className="text-sm font-medium">Data Retention Period</label>
                      <select id="data-retention" className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                        <option>180 days</option>
                        <option>1 year</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button>
                      <Settings className="mr-2 h-4 w-4" /> Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

