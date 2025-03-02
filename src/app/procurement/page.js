"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FaUpload, FaPaperPlane, FaDownload, FaSearch } from "react-icons/fa"; // Importing icons for submit and download
import Papa from "papaparse"; // Importing PapaParse for CSV parsing
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust the import path as necessary

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Importing dropdown menu components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai"; // Importing Gemini
import jsPDF from "jspdf"; // Importing jsPDF for PDF generation
import { Pie, Doughnut, Bar } from "react-chartjs-2"; // Importing chart components
import "chart.js/auto"; // Importing chart.js
import Navbar from "../../../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function Page() {
  const [CSVData, setCSVData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newOrder, setNewOrder] = useState({
    OrderID: "",
    OrderDate: "",
    VendorID: "",
    VendorName: "",
    DrugName: "",
    DrugID: "",
    Quantity: "",
    UnitPrice: "",
    TotalCost: "",
    OrderStatus: "",
    DeliveryDate: "",
    ContractID: "",
    ContractDetails: "",
    Remarks: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "admin_procurement")
        );
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        toast.error("Error fetching orders");
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = [...orders, ...CSVData].filter((order) => {
    const matchesSearch =
      order.DrugName &&
      order.DrugName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? order.OrderDate === selectedDate : true;
    const matchesVendor = vendorFilter
      ? order.VendorName === vendorFilter
      : true;
    const matchesStatus = statusFilter
      ? order.OrderStatus === statusFilter
      : true;
    return matchesSearch && matchesDate && matchesVendor && matchesStatus;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCSVData(results.data);
        },
      });
    }
  };

  const submitToFirebase = async () => {
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "admin_procurement"), dataItem);
      }
      toast.success("Data uploaded successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredOrders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "procurement_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFileDialog = () => {
    document.getElementById("csv-upload-input").click();
  };

  const generateReport = async () => {
    const reportData = filteredOrders.map((item) => ({
      OrderID: item.OrderID,
      OrderDate: item.OrderDate,
      VendorID: item.VendorID,
      VendorName: item.VendorName,
      DrugName: item.DrugName,
      DrugID: item.DrugID,
      Quantity: item.Quantity,
      UnitPrice: item.UnitPrice,
      TotalCost: item.TotalCost,
      OrderStatus: item.OrderStatus,
      DeliveryDate: item.DeliveryDate,
      ContractID: item.ContractID,
      ContractDetails: item.ContractDetails,
      Remarks: item.Remarks,
    }));

    const prompt = `Here is my procurement report: ${JSON.stringify(
      reportData
    )}. Title:
"PharmaLink Procurement Analysis Report"

Date:
December 6, 2024

Sections to Include:

1. Summary/Overview
Total number of orders.
Total cost of orders.
Most common vendors.
Most common drugs ordered.

2. Analysis
By Vendor:
Breakdown of orders by vendor.
By Drug:
Highlight drugs with the most orders.
By Status:
Compare orders categorized as "Pending" vs. "Completed."
3. Recommendations
Suggestions to optimize procurement processes, such as:
Improved vendor selection.
Enhanced order tracking and management.
Regular review of procurement data. Please generate a PDF report.`;

    try {
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
            parts: [
              { text: "Generate a report for the following procurement data." },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response.text();

      // Generate PDF if there's data
      if (response) {
        const doc = new jsPDF();
        doc.setFontSize(10); // Set font size
        const margin = 10; // Page margin
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin; // Width for text wrapping
        const lines = doc.splitTextToSize(response, pageWidth); // Split text to fit page width
        doc.text(lines, margin, margin);
        doc.save("procurement_report.pdf");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  // Extract unique vendors, statuses, and drugs for dropdowns
  const uniqueVendors = [
    ...new Set(orders.map((order) => order.VendorName).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(orders.map((order) => order.OrderStatus).filter(Boolean)),
  ];
  const uniqueDrugs = [
    ...new Set(orders.map((order) => order.DrugName).filter(Boolean)),
  ];

  // Prepare data for charts
  const vendorData = {
    labels: uniqueVendors,
    datasets: [
      {
        data: uniqueVendors.map(
          (vendor) =>
            orders.filter((order) => order.VendorName === vendor).length
        ),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const statusData = {
    labels: uniqueStatuses,
    datasets: [
      {
        label: "Status",
        data: uniqueStatuses.map(
          (status) =>
            orders.filter((order) => order.OrderStatus === status).length
        ),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const drugData = {
    labels: uniqueDrugs,
    datasets: [
      {
        data: uniqueDrugs.map(
          (drug) => orders.filter((order) => order.DrugName === drug).length
        ),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-center">
          <h3 className="text-4xl font-semibold">Procurement Management</h3>
        </div>

        <div className="mb-4 flex items-center space-x-4">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3 top-2.5 text-gray-500" />
            <FaSearch className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search drug name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
            />
          </div>
          <input
            id="csv-upload-input"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={generateReport}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
          >
            <FaDownload className="mr-2" /> Get Report
          </button>
        </div>

        <div className="mb-4 flex space-x-4">
          <select
            className="bg-white text-black p-2 border rounded"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          >
            <option value="">Select Vendor</option>
            {uniqueVendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>

          <select
            className="bg-white text-black p-2 border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Select Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-gray-300 shadow-lg overflow-hidden">
          <Table className="min-w-full bg-white">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={
                      selectedOrders.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onCheckedChange={(e) =>
                      handleSelectAllOrders(e.target.checked)
                    }
                  />
                </TableHead>
                {Object.keys(newOrder).map((header) => (
                  <TableHead
                    key={header}
                    className="px-6 py-3 text-left font-semibold uppercase text-sm"
                  >
                    {header}{" "}
                    <ChevronDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                    />
                  </TableCell>
                  {Object.keys(newOrder).map((key) => (
                    <TableCell
                      key={key}
                      className="px-6 py-3 text-sm text-gray-700"
                    >
                      {order[key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={submitToFirebase}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
          >
            <FaPaperPlane className="mr-2" /> Submit to Database
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center px-6 py-3 bg-gray-500 text-white rounded transition duration-200 hover:bg-gray-600"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
        </div>
      </div>
    </>
  );
}

export default Page;
