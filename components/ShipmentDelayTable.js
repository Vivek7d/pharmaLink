"use client";

import { useEffect, useState } from "react";
import { ChevronDown, DeleteIcon, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MdDelete } from "react-icons/md";
import { FaEdit, FaUpload, FaDownload } from "react-icons/fa";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Importing Gemini
import jsPDF from "jspdf"; // Importing jsPDF for PDF generation
import Papa from 'papaparse'; // Importing PapaParse for CSV parsing
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "../firebase"; // Adjust the import path as necessary
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const ShipmentDelayTable = () => {
  const [allocationObj, setAllocationObj] = useState([]); // State to hold shipment data
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newShipment, setNewShipment] = useState({
    shipmentId: "",
    item: "",
    dosage: "",
    date: "",
    quantity: "",
    dept: "",
    expectedDelivery: "",
    delayReason: "",
    hospital: "",
    location: "", // Changed from hospitalLocation to location
    status: "",
    transportMode: "",
    priority: "",
  });
  const [selectedPriority, setSelectedPriority] = useState("");
  const [CSVData, setCSVData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState(""); // New state for location filter
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "suppliershipmentdelay"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllocationObj(data.filter(item => item.shipmentId)); // Remove rows with blank Shipment ID

      // Automatically set the next Shipment ID starting from SHP0
      const nextId = data.length > 0 ? Math.max(...data.map(item => parseInt(item.shipmentId.replace('SHP', '')))) + 1 : 0;
      setNewShipment(prev => ({ ...prev, shipmentId: `SHP${nextId}` }));
    };
    fetchData();
  }, []);

  const filteredData = [...allocationObj, ...CSVData].filter((stock) => {
    const matchesSearch = stock.item && stock.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? stock.date === selectedDate : true;
    const matchesPriority = priorityFilter ? stock.priority === priorityFilter : true;
    const matchesDept = departmentFilter ? stock.dept === departmentFilter : true;
    const matchesStatus = statusFilter ? stock.status === statusFilter : true;
    const matchesHospital = hospitalFilter ? stock.hospital === hospitalFilter : true;
    const matchesLocation = locationFilter ? stock.location === locationFilter : true; // Match location
    return matchesSearch && matchesDate && matchesPriority && matchesDept && matchesStatus && matchesHospital && matchesLocation;
  });

  const handleAddShipment = async () => {
    try {
      await addDoc(collection(db, "suppliershipmentdelay"), newShipment); // Submit new shipment to Firebase
      setAllocationObj([...allocationObj, newShipment]);
      resetNewShipment();
      setShowForm(false);
    } catch (error) {
      alert("Error adding shipment: " + error.message);
    }
  };

  const resetNewShipment = () => {
    setNewShipment({
      shipmentId: "",
      item: "",
      dosage: "",
      date: "",
      quantity: "",
      dept: "",
      expectedDelivery: "",
      delayReason: "",
      hospital: "",
      location: "", // Reset location
      status: "",
      transportMode: "",
      priority: "",
    });
  };

  const handleUploadCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const updatedData = results.data.map(item => ({
            ...item,
            hospital: item.hospital || "",
            location: item.location || "", // Corrected to use location
          }));
          setCSVData(updatedData);
          setAllocationObj(prev => {
            const combinedData = [...prev, ...updatedData];
            const uniqueData = Array.from(new Map(combinedData.map(item => [item.shipmentId, item])).values());
            return uniqueData.filter(item => item.shipmentId);
          });
        },
      });
    }
  };

  const submitToFirebase = async () => {
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "suppliershipmentdelay"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  const handleEditShipment = (stock) => {
    setNewShipment(stock);
    setCurrentEditId(stock.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleUpdateShipment = async () => {
    try {
      const shipmentRef = doc(db, "suppliershipmentdelay", currentEditId);
      await updateDoc(shipmentRef, newShipment);
      setAllocationObj(allocationObj.map(item => (item.id === currentEditId ? newShipment : item)));
      resetNewShipment();
      setEditMode(false);
      setShowForm(false);
    } catch (error) {
      alert("Error updating shipment: " + error.message);
    }
  };

  const handleDeleteShipment = async (id) => {
    try {
      const shipmentRef = doc(db, "suppliershipmentdelay", id);
      await deleteDoc(shipmentRef);
      setAllocationObj(allocationObj.filter(item => item.id !== id));
      alert("Shipment deleted successfully!");
    } catch (error) {
      alert("Error deleting shipment: " + error.message);
    }
  };

  const sortedAllocationObj = filteredData.sort((a, b) => {
    const idA = a.shipmentId.replace('SHP', '');
    const idB = b.shipmentId.replace('SHP', '');
    return parseInt(idA) - parseInt(idB);
  });

  const downloadCSV = () => {
    const csv = Papa.unparse(sortedAllocationObj);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "shipment_delay_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFileDialog = () => {
    document.getElementById('csv-upload-input').click();
  };

  const generateReport = async () => {
    const reportData = sortedAllocationObj.map(item => ({
      shipmentId: item.shipmentId,
      item: item.item,
      dosage: item.dosage,
      date: item.date,
      quantity: item.quantity,
      dept: item.dept,
      expectedDelivery: item.expectedDelivery,
      delayReason: item.delayReason,
      hospital: item.hospital,
      location: item.location,
      status: item.status,
      transportMode: item.transportMode,
      priority: item.priority,
    }));

    const prompt = `Here is my shipment delay report: ${JSON.stringify(reportData)} i wnat report in this formate Title:
"PharmaLink Shipment Delay Analysis Report"
Sections to Include:
1. Summary/Overview
Total number of shipments.
Number and percentage of delayed shipments.
Key insights such as common delay reasons, affected departments, and percentage of "Critical" shipments delayed or pending.
2. Delay Analysis
By Reason:
Breakdown of delays by cause (e.g., transport strike, customs delay, logistics error).
By Department:
Analysis of delays for each department (e.g., Pediatrics, General Medicine, Endocrinology).
By Transport Mode:
Highlight the performance of different transport modes (Road, Air, Sea) in terms of delays.
By Priority:
Assessment of delays across priority levels (Critical, Moderate, Minor).
3. Hospital Impact
Analysis of shipment delays for each hospital.
Identify hospitals most affected and correlate with critical shipments or departments.
4. Recommendations
Suggestions based on trends, such as:
Streamline customs clearance.
Diversify transport modes for critical shipments.
Improve vendor collaboration to prevent raw material shortages. `;
    
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
            parts: [{ text: "Generate a report for the following shipment delays." }],
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
        doc.save("shipment_delay_report.pdf");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  // Extract unique departments, statuses, hospitals, locations, and priorities from allocationObj
  const uniqueDepartments = [...new Set(allocationObj.map(item => item.dept))];
  const uniqueStatuses = [...new Set(allocationObj.map(item => item.status))];
  const uniqueHospitals = [...new Set(allocationObj.map(item => item.hospital))];
  const uniqueLocations = [...new Set(allocationObj.map(item => item.location))]; // Extract unique locations
  const uniquePriorities = [...new Set(allocationObj.map(item => item.priority))];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-center">
        <h3 className="text-2xl font-semibold">Shipment Delay</h3>
      </div>
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search medicine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
        >
          <FaEdit className="mr-2" /> Add Shipment Delay
        </button>
        <button
          onClick={openFileDialog}
          className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded transition duration-200 hover:bg-yellow-600"
        >
          <FaUpload className="mr-2" /> Upload CSV
        </button>
        <button
          onClick={generateReport}
          className="flex items-center px-6 py-3 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
        >
          <FaDownload className="mr-2" /> Get Report
        </button>
        <input
          id="csv-upload-input"
          type="file"
          accept=".csv"
          onChange={handleUploadCSV}
          className="hidden"
        />
      </div>

      <div className="mb-4 flex space-x-4">
      {/* Department Dropdown */}
  <div className="relative ">
  <select
        className="bg-white text-black p-2 mr-5 border rounded"
        value={departmentFilter || ""}
        onChange={(e) => setDepartmentFilter(e.target.value)}
      >
        <option value="">Select Department</option>
        {uniqueDepartments.map(department => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>

      {/* Status Dropdown */}
      <select
        className="bg-white text-black p-2 mr-5 border rounded"
        value={statusFilter || ""}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">Select Status</option>
        {uniqueStatuses.map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Hospital Dropdown */}
      <select
        className="bg-white text-black p-2 mr-5 border rounded"
        value={hospitalFilter || ""}
        onChange={(e) => setHospitalFilter(e.target.value)}
      >
        <option value="">Select Hospital</option>
        {uniqueHospitals.map(hospital => (
          <option key={hospital} value={hospital}>
            {hospital}
          </option>
        ))}
      </select>

      {/* Location Dropdown */}
      <select
        className="bg-white text-black p-2 mr-5 border rounded"
        value={locationFilter || ""}
        onChange={(e) => setLocationFilter(e.target.value)}
      >
        <option value="">Select Location</option>
        {uniqueLocations.map(location => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>

      {/* Priority Dropdown */}
      <select
        className="bg-white text-black p-2 mr-5 border rounded"
        value={priorityFilter || ""}
        onChange={(e) => setPriorityFilter(e.target.value)}
      >
        <option value="">Select Priority</option>
        {uniquePriorities.map(priority => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

     
    </div>

  
  </div>

      {showForm && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 p-4 border border-gray-300 rounded bg-white shadow-lg z-10">
          <h2 className="text-lg font-semibold mb-2">{editMode ? "Edit Shipment" : "Add New Shipment"}</h2>
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          >
            &times; {/* Close button */}
          </button>
          <input
            type="text"
            placeholder="Shipment ID"
            value={newShipment.shipmentId}
            onChange={(e) =>
              setNewShipment({ ...newShipment, shipmentId: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Item"
            value={newShipment.item}
            onChange={(e) =>
              setNewShipment({ ...newShipment, item: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Dosage"
            value={newShipment.dosage}
            onChange={(e) =>
              setNewShipment({ ...newShipment, dosage: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="date"
            value={newShipment.date}
            onChange={(e) =>
              setNewShipment({ ...newShipment, date: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Quantity"
            value={newShipment.quantity}
            onChange={(e) =>
              setNewShipment({ ...newShipment, quantity: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Department"
            value={newShipment.dept}
            onChange={(e) =>
              setNewShipment({ ...newShipment, dept: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="date"
            value={newShipment.expectedDelivery}
            onChange={(e) =>
              setNewShipment({
                ...newShipment,
                expectedDelivery: e.target.value,
              })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Delay Reason"
            value={newShipment.delayReason}
            onChange={(e) =>
              setNewShipment({ ...newShipment, delayReason: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Hospital"
            value={newShipment.hospital}
            onChange={(e) =>
              setNewShipment({ ...newShipment, hospital: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Hospital Location" // Added hospital location input
            value={newShipment.location}
            onChange={(e) =>
              setNewShipment({ ...newShipment, location: e.target.value }) // Changed from hospitalLocation to location
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Status"
            value={newShipment.status}
            onChange={(e) =>
              setNewShipment({ ...newShipment, status: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Transport Mode"
            value={newShipment.transportMode}
            onChange={(e) =>
              setNewShipment({ ...newShipment, transportMode: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          
          <select
            value={newShipment.priority}
            onChange={(e) =>
              setNewShipment({ ...newShipment, priority: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          >
            <option value="" disabled>Select Priority</option>
            <option value="Critical">Critical</option>
            <option value="Moderate">Moderate</option>
            <option value="Minor">Minor</option>
          </select>
          <button
            onClick={editMode ? handleUpdateShipment : handleAddShipment}
            className="mt-2 px-6 py-3 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
          >
            {editMode ? "Update Shipment" : "Add Shipment"}
          </button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedShipments.length === allocationObj.length}
                  onCheckedChange={() =>
                    setSelectedShipments(
                      selectedShipments.length === allocationObj.length ? [] : allocationObj.map((s) => s.id)
                    )
                  }
                />
              </TableHead>
              <TableHead>Shipment ID <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Item <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Dosage <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Date <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Quantity <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Department <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Expected Delivery <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Delay Reason <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Hospital <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Hospital Location <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead> {/* Added Hospital Location header */}
              <TableHead>Status <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Transport Mode <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Priority <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Actions <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAllocationObj.map((stock, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={selectedShipments.includes(stock.id)}
                    onCheckedChange={() => handleEditShipment(stock)}
                  />
                </TableCell>
                <TableCell className="font-medium">{stock.shipmentId}</TableCell>
                <TableCell>{stock.item}</TableCell>
                <TableCell>{stock.dosage}</TableCell>
                <TableCell>{stock.date}</TableCell>
                <TableCell>{stock.quantity}</TableCell>
                <TableCell>{stock.dept}</TableCell>
                <TableCell>{stock.expectedDelivery}</TableCell>
                <TableCell>{stock.delayReason}</TableCell>
                <TableCell>{stock.hospital}</TableCell>
                <TableCell>{stock.location}</TableCell> {/* Added Hospital Location data */}
                <TableCell>{stock.status}</TableCell>
                <TableCell>{stock.transportMode}</TableCell>
                <TableCell>{stock.priority}</TableCell>
                <TableCell className="flex items-center">
                  <FaEdit onClick={() => handleEditShipment(stock)} className="text-black hover:underline mr-2" />
                  <MdDelete onClick={() => handleDeleteShipment(stock.id)} className="text-black hover:underline" />
                </TableCell>
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
          <FaUpload className="mr-2" /> Submit to Database
        </button>
        <button
          onClick={downloadCSV}
          className="flex items-center px-6 py-3 bg-gray-500 text-white rounded transition duration-200 hover:bg-gray-600"
        >
          <FaDownload className="mr-2" /> Download CSV
        </button>
      </div>
    </div>
  );
};

export default ShipmentDelayTable;