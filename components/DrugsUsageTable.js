"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaUpload,
  FaEdit,
  FaTrash,
  FaFileCsv,
  FaDownload,
} from "react-icons/fa"; // Importing necessary icons
import Papa from "papaparse"; // Importing PapaParse for CSV parsing
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust the import path as necessary
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox for selection
import { ChevronDown, TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Cell } from "recharts"; // Import Cell for colorful chart
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
import jsPDF from "jspdf"; // Importing jsPDF for PDF generation

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function DrugsUsageTable() {
  const [drugsUsageObj, setDrugsUsageObj] = useState([]); // State to hold drugs usage data
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newDrugUsage, setNewDrugUsage] = useState({
    drug_name: "",
    dosage: "", // New dosage field
    batch_number: "",
    quantity_used: "",
    department: "",
    date_of_usage: "",
    usage_purpose: "",
    manufacturer_name: "", // Changed from supplier_name to manufacturer_name
    hospital_name: "", // New hospital name field
    hospital_location: "", // New hospital location field
    stock_available: "",
    expiration_date: "",
    delivery_date: "",
    lot_number: "",
    cost_per_unit: "",
    total_cost: "",
    mode_of_transport: "",
    storage_requirements: "",
    usage_approved_by: "", // Changed back to usage_approved_by
  });
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [CSVData, setCSVData] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]); // State for selected drugs
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");
  const [reportData, setReportData] = useState(""); // State for report data

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "supplierdrugusage"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrugsUsageObj(data);
    };
    fetchData();
  }, []);

  const filteredData = drugsUsageObj.filter(
    (drug) =>
      drug.drug_name &&
      drug.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (departmentFilter ? drug.department === departmentFilter : true) &&
      (manufacturerFilter
        ? drug.manufacturer_name === manufacturerFilter
        : true) &&
      (locationFilter ? drug.hospital_location === locationFilter : true) &&
      (transportFilter ? drug.mode_of_transport === transportFilter : true)
  );

  const handleAddDrugUsage = async () => {
    try {
      const docRef = await addDoc(
        collection(db, "supplierdrugusage"),
        newDrugUsage
      );
      setDrugsUsageObj([...drugsUsageObj, { id: docRef.id, ...newDrugUsage }]);
      resetNewDrugUsage();
      setShowForm(false);
    } catch (error) {
      alert("Error adding drug usage: " + error.message);
    }
  };

  const resetNewDrugUsage = () => {
    setNewDrugUsage({
      drug_name: "",
      dosage: "", // Reset dosage field
      batch_number: "",
      quantity_used: "",
      department: "",
      date_of_usage: "",
      usage_purpose: "",
      manufacturer_name: "", // Changed from supplier_name to manufacturer_name
      hospital_name: "", // Reset hospital name field
      hospital_location: "", // Reset hospital location field
      stock_available: "",
      expiration_date: "",
      delivery_date: "",
      lot_number: "",
      cost_per_unit: "",
      total_cost: "",
      mode_of_transport: "",
      storage_requirements: "",
      usage_approved_by: "", // Changed back to usage_approved_by
    });
  };

  const handleUploadCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const updatedData = results.data.map((item) => ({
            drug_name: item.drug_name, // Corrected mapping to match CSV header
            dosage: item.dosage, // New dosage field from CSV
            batch_number: item.batch_number,
            quantity_used: item.quantity_used,
            department: item.department,
            date_of_usage: item.date_of_usage,
            usage_purpose: item.usage_purpose,
            manufacturer_name: item.manufacturer_name, // Changed from supplier_name to manufacturer_name
            hospital_name: item.hospital_name, // New hospital name field from CSV
            hospital_location: item.hospital_location, // New hospital location field from CSV
            stock_available: item.stock_available,
            expiration_date: item.expiration_date,
            delivery_date: item.delivery_date,
            lot_number: item.lot_number,
            cost_per_unit: item.cost_per_unit,
            total_cost: item.total_cost,
            mode_of_transport: item.mode_of_transport,
            storage_requirements: item.storage_requirements,
            usage_approved_by: item.usage_approved_by, // Changed back to usage_approved_by
          }));
          setCSVData(updatedData);
          setDrugsUsageObj((prev) => [...prev, ...updatedData]);
        },
      });
    }
  };

  const submitToFirebase = async () => {
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "supplierdrugusage"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  const handleEditDrugUsage = (drug) => {
    setNewDrugUsage(drug);
    setCurrentEditId(drug.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleUpdateDrugUsage = async () => {
    try {
      const drugRef = doc(db, "supplierdrugusage", currentEditId);
      await updateDoc(drugRef, newDrugUsage);
      setDrugsUsageObj(
        drugsUsageObj.map((item) =>
          item.id === currentEditId ? { ...item, ...newDrugUsage } : item
        )
      );
      resetNewDrugUsage();
      setEditMode(false);
      setShowForm(false);
    } catch (error) {
      alert("Error updating drug usage: " + error.message);
    }
  };

  const handleDeleteDrugUsage = async (id) => {
    try {
      const drugRef = doc(db, "supplierdrugusage", id);
      await deleteDoc(drugRef);
      setDrugsUsageObj(drugsUsageObj.filter((item) => item.id !== id));
      alert("Drug usage deleted successfully!");
    } catch (error) {
      alert("Error deleting drug usage: " + error.message);
    }
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "drugs_usage_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFileDialog = () => {
    document.getElementById("csv-upload-input").click();
  };

  const generateReport = async () => {
    const prompt = `here is my drug consumption report- ${JSON.stringify(
      filteredData
    )} Title:
"PharmaLink Drugs Usage Report"
Sections to Include:
1. Summary/Overview
Total drugs used and their corresponding departments.
Total cost of drugs used.
Key insights such as the most used drugs, departments with the highest drug usage, and usage purposes.
2. Usage Analysis
By Drug Name:
Highlight the most frequently used drugs.
Total quantity and cost per drug.
By Department:
Breakdown of drugs used by each department (e.g., Emergency, Cardiology, Infectious Disease).
Cost of drugs used per department.
By Usage Purpose:
Overview of drugs used for different medical purposes (e.g., pain relief, infection control, diabetes management).
By Mode of Transport:
Analyze how different transport modes (Truck, Air, Rail) impact drug availability and cost.
3. Hospital Impact
Identify hospitals with the highest drug usage.
Correlation between drug usage, stock availability, and storage requirements.
4. Stock and Expiry Analysis
Drugs nearing expiration based on the dataset.
Overview of current stock levels for frequently used drugs.
Recommendations to optimize stock utilization before expiration.
5. Cost Analysis
Average cost per unit and total cost by drug name.
Cost distribution across hospitals and departments.
6. Recommendations
Suggestions based on trends, such as:
Prioritize usage of drugs nearing expiration.
Optimize stock levels to prevent overstocking or shortages.
Enhance coordination between transport modes to ensure timely drug delivery.
 make report on this formate`;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: "Generate a report based on the following data." }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response.text();
    setReportData(response);

    // Generate PDF if there's data
    if (response) {
      try {
        const doc = new jsPDF();
        doc.setFontSize(10); // Set font size
        const margin = 10; // Page margin
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin; // Width for text wrapping
        const lines = doc.splitTextToSize(response, pageWidth); // Split text to fit page width
        doc.text(lines, margin, margin);
        doc.save("drugs_usage_report.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  const chartData = React.useMemo(() => {
    const transportCounts = drugsUsageObj.reduce((acc, drug) => {
      acc[drug.mode_of_transport] = (acc[drug.mode_of_transport] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(transportCounts).map(([transport, count]) => ({
      mode_of_transport: transport,
      count,
      fill: `var(--color-${transport.toLowerCase()})`,
    }));
  }, [drugsUsageObj]);

  const chartConfig = {
    count: {
      label: "Count",
    },
    ...chartData.reduce((acc, { mode_of_transport }) => {
      acc[mode_of_transport] = {
        label: mode_of_transport,
        color: `hsl(var(--chart-${mode_of_transport.toLowerCase()}))`,
      };
      return acc;
    }, {}),
  };

  const totalTransports = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const locationChartData = React.useMemo(() => {
    const locationCounts = drugsUsageObj.reduce((acc, drug) => {
      acc[drug.hospital_location] = (acc[drug.hospital_location] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(locationCounts).map(([location, count]) => ({
      hospital_location: location,
      count,
      fill: `var(--color-${location.toLowerCase().replace(/\s+/g, "-")})`,
    }));
  }, [drugsUsageObj]);

  const locationChartConfig = {
    count: {
      label: "Count",
    },
    ...locationChartData.reduce((acc, { hospital_location }) => {
      acc[hospital_location] = {
        label: hospital_location,
        color: `hsl(var(--chart-${hospital_location
          .toLowerCase()
          .replace(/\s+/g, "-")}))`,
      };
      return acc;
    }, {}),
  };

  const totalLocations = React.useMemo(() => {
    return locationChartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [locationChartData]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
  ];

  return (
    <div className="relative overflow-x-auto mt-10 mx-24">
      <h1 className="text-center mb-16 font-semibold text-2xl">Drugs Usage</h1>

      <div className="flex flex-col md:flex-row justify-between mb-8">
        <Card className="flex flex-col mb-8 md:mb-0 md:mr-4 w-full md:w-1/2">
          <CardHeader className="items-center pb-0">
            <CardTitle>Mode of Transport</CardTitle>
            <CardDescription>Drug Transport Modes</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="mode_of_transport"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
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
                              {totalTransports.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Transports
                            </tspan>
                          </text>
                        );
                      }
                      return null;
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
              Showing total transports for the last 6 months
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col w-full md:w-1/2">
          <CardHeader className="items-center pb-0">
            <CardTitle>Hospital Locations</CardTitle>
            <CardDescription>Drug Usage by Location</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={locationChartConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={locationChartData}
                  dataKey="count"
                  nameKey="hospital_location"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {locationChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
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
                              {totalLocations.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Locations
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 3.8% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total locations for the last 6 months
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search drug name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-500" />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
        >
          <FaPlus className="mr-2" /> Add Drug Usage
        </button>
        <button
          onClick={openFileDialog}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded transition duration-200 hover:bg-yellow-600"
        >
          <FaUpload className="mr-2" /> Upload CSV
        </button>
        <input
          id="csv-upload-input"
          type="file"
          accept=".csv"
          onChange={handleUploadCSV}
          className="hidden"
        />
        <button
          onClick={generateReport}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
        >
          <FaDownload className="mr-2" /> Get Report
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            departmentFilter ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Department</option>
          {/* Add options dynamically based on your data */}
          {[...new Set(drugsUsageObj.map((drug) => drug.department))].map(
            (department) => (
              <option key={department} value={department}>
                {department}
              </option>
            )
          )}
        </select>
        <select
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            manufacturerFilter ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Manufacturer</option>
          {/* Add options dynamically based on your data */}
          {[
            ...new Set(drugsUsageObj.map((drug) => drug.manufacturer_name)),
          ].map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            locationFilter ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Location</option>
          {/* Add options dynamically based on your data */}
          {[
            ...new Set(drugsUsageObj.map((drug) => drug.hospital_location)),
          ].map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <select
          value={transportFilter}
          onChange={(e) => setTransportFilter(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            transportFilter ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Transport</option>
          {/* Add options dynamically based on your data */}
          {[
            ...new Set(drugsUsageObj.map((drug) => drug.mode_of_transport)),
          ].map((transport) => (
            <option key={transport} value={transport}>
              {transport}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 p-4 border border-gray-300 rounded bg-white shadow-lg z-10">
          <h2 className="text-lg font-semibold mb-2">
            {editMode ? "Edit Drug Usage" : "Add New Drug Usage"}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          >
            &times; {/* Close button */}
          </button>
          <input
            type="text"
            placeholder="Drug Name"
            value={newDrugUsage.drug_name}
            onChange={(e) =>
              setNewDrugUsage({ ...newDrugUsage, drug_name: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Dosage" // New dosage input
            value={newDrugUsage.dosage}
            onChange={(e) =>
              setNewDrugUsage({ ...newDrugUsage, dosage: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Batch Number"
            value={newDrugUsage.batch_number}
            onChange={(e) =>
              setNewDrugUsage({ ...newDrugUsage, batch_number: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Quantity Used"
            value={newDrugUsage.quantity_used}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                quantity_used: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Department"
            value={newDrugUsage.department}
            onChange={(e) =>
              setNewDrugUsage({ ...newDrugUsage, department: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="date"
            value={newDrugUsage.date_of_usage}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                date_of_usage: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Usage Purpose"
            value={newDrugUsage.usage_purpose}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                usage_purpose: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Manufacturer Name" // Changed from Supplier Name to Manufacturer Name
            value={newDrugUsage.manufacturer_name} // Changed from supplier_name to manufacturer_name
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                manufacturer_name: e.target.value,
              })
            } // Changed from supplier_name to manufacturer_name
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Hospital Name" // New hospital name input
            value={newDrugUsage.hospital_name}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                hospital_name: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Hospital Location" // New hospital location input
            value={newDrugUsage.hospital_location}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                hospital_location: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Stock Available"
            value={newDrugUsage.stock_available}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                stock_available: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="date"
            value={newDrugUsage.expiration_date}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                expiration_date: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="date"
            value={newDrugUsage.delivery_date}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                delivery_date: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Lot Number"
            value={newDrugUsage.lot_number}
            onChange={(e) =>
              setNewDrugUsage({ ...newDrugUsage, lot_number: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Cost Per Unit (₹)"
            value={newDrugUsage.cost_per_unit}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                cost_per_unit: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Total Cost (₹)"
            value={newDrugUsage.total_cost}
            onChange={(e) =>
              setNewDrugUsage({ ...newDrugUsage, total_cost: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Mode Of Transport"
            value={newDrugUsage.mode_of_transport}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                mode_of_transport: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Storage Requirements"
            value={newDrugUsage.storage_requirements}
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                storage_requirements: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Usage Approved By" // Changed back to Usage Approved By
            value={newDrugUsage.usage_approved_by} // Changed back to usage_approved_by
            onChange={(e) =>
              setNewDrugUsage({
                ...newDrugUsage,
                usage_approved_by: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <button
            onClick={editMode ? handleUpdateDrugUsage : handleAddDrugUsage}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
          >
            {editMode ? "Update Drug Usage" : "Add Drug Usage"}
          </button>
        </div>
      )}

      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
          <tr>
            <th scope="col" className="px-4 py-3">
              Sr. No.
            </th>
            <th scope="col" className="px-4 py-3">
              Drug Name
            </th>
            <th scope="col" className="px-4 py-3">
              Dosage
            </th>
            <th scope="col" className="px-4 py-3">
              Batch Number
            </th>
            <th scope="col" className="px-4 py-3">
              Quantity Used
            </th>
            <th scope="col" className="px-4 py-3">
              Department
            </th>
            <th scope="col" className="px-4 py-3">
              Date of Usage
            </th>
            <th scope="col" className="px-4 py-3">
              Usage Purpose
            </th>
            <th scope="col" className="px-4 py-3">
              Manufacturer Name
            </th>
            <th scope="col" className="px-4 py-3">
              Hospital Name
            </th>
            <th scope="col" className="px-4 py-3">
              Hospital Location
            </th>
            <th scope="col" className="px-4 py-3">
              Stock Available
            </th>
            <th scope="col" className="px-4 py-3">
              Expiration Date
            </th>
            <th scope="col" className="px-4 py-3">
              Delivery Date
            </th>
            <th scope="col" className="px-4 py-3">
              Lot Number
            </th>
            <th scope="col" className="px-4 py-3">
              Cost Per Unit (₹)
            </th>
            <th scope="col" className="px-4 py-3">
              Total Cost (₹)
            </th>
            <th scope="col" className="px-4 py-3">
              Mode of Transport
            </th>
            <th scope="col" className="px-4 py-3">
              Storage Requirements
            </th>
            <th scope="col" className="px-4 py-3">
              Usage Approved By
            </th>
            <th scope="col" className="px-4 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((drug, index) => (
            <tr
              key={index}
              className="bg-white border-b hover:bg-gray-50 transition-all duration-200"
            >
              <td className="px-4 py-4">{index + 1}</td>
              <td className="px-4 py-4">{drug.drug_name}</td>
              <td className="px-4 py-4">{drug.dosage}</td>
              <td className="px-4 py-4">{drug.batch_number}</td>
              <td className="px-4 py-4">{drug.quantity_used}</td>
              <td className="px-4 py-4">{drug.department}</td>
              <td className="px-4 py-4">{drug.date_of_usage}</td>
              <td className="px-4 py-4">{drug.usage_purpose}</td>
              <td className="px-4 py-4">{drug.manufacturer_name}</td>
              <td className="px-4 py-4">{drug.hospital_name}</td>
              <td className="px-4 py-4">{drug.hospital_location}</td>
              <td className="px-4 py-4">{drug.stock_available}</td>
              <td className="px-4 py-4">{drug.expiration_date}</td>
              <td className="px-4 py-4">{drug.delivery_date}</td>
              <td className="px-4 py-4">{drug.lot_number}</td>
              <td className="px-4 py-4">{drug.cost_per_unit}</td>
              <td className="px-4 py-4">{drug.total_cost}</td>
              <td className="px-4 py-4">{drug.mode_of_transport}</td>
              <td className="px-4 py-4">{drug.storage_requirements}</td>
              <td className="px-4 py-4">{drug.usage_approved_by}</td>
              <td className="px-4 py-4 flex items-center justify-center">
                <button
                  onClick={() => handleEditDrugUsage(drug)}
                  className="text-black hover:underline"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteDrugUsage(drug.id)}
                  className="text-black hover:underline ml-2"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={submitToFirebase}
          className="flex items-center px-4 py-2 bg-black text-white rounded transition duration-200 hover:bg-blue-600"
        >
          <FaUpload className="mr-2" /> Submit to Database
        </button>
        <button
          onClick={downloadCSV}
          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded transition duration-200 hover:bg-gray-600"
        >
          <FaFileCsv className="mr-2" /> Download CSV
        </button>
      </div>
    </div>
  );
}

export default DrugsUsageTable;
