"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MdDelete } from "react-icons/md";
import {
  FaUpload,
  FaEdit,
  FaPaperPlane,
  FaDownload,
  FaSearch,
} from "react-icons/fa"; // Importing icons for submit and download
import Papa from "papaparse"; // Importing PapaParse for CSV parsing
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust the imaport path as necessary
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

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const AdminDamageDrugs = () => {
  const [damagedDrugsObj, setDamagedDrugsObj] = useState([]); // State to hold damaged drugs data
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newDamageDrug, setNewDamageDrug] = useState({
    item: "",
    dosage: "",
    batchNumber: "",
    quantity: "",
    date: "",
    damageReason: "",
    manufacturer: "",
    status: "",
    hospitalName: "", // New field for hospital name
    hospitalLocation: "", // New field for hospital location
    pickup_date: "", // New field for hospital location
  });
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [CSVData, setCSVData] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDamageReason, setSelectedDamageReason] = useState(""); // New state for damage reason
  const [selectedLocation, setSelectedLocation] = useState(""); // New state for hospital location
  const [selectedDosage, setSelectedDosage] = useState(""); // New state for dosage
  const [selectedQuantity, setSelectedQuantity] = useState(""); // New state for quantity
  const [selectedItem, setSelectedItem] = useState(""); // New state for item

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(db, "supplierdamagedrugs")
      );
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDamagedDrugsObj(data);
    };
    fetchData();
  }, []);

  const filteredData = damagedDrugsObj.filter(
    (drug) =>
      drug.item &&
      drug.item.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedManufacturer
        ? drug.manufacturer === selectedManufacturer
        : true) &&
      (selectedStatus ? drug.status === selectedStatus : true) &&
      (selectedDamageReason
        ? drug.damageReason === selectedDamageReason
        : true) && // Filter by damage reason if selected
      (selectedLocation ? drug.hospitalLocation === selectedLocation : true) && // Filter by hospital location if selected
      (selectedDate ? drug.date === selectedDate : true) && // Filter by date if selected
      (selectedDosage ? drug.dosage === selectedDosage : true) && // Filter by dosage if selected
      (selectedQuantity ? drug.quantity === selectedQuantity : true) && // Filter by quantity if selected
      (selectedItem ? drug.item === selectedItem : true) // Filter by item if selected
  );

  const handleAddDamageDrug = async () => {
    try {
      const docRef = await addDoc(
        collection(db, "supplierdamagedrugs"),
        newDamageDrug
      );
      setDamagedDrugsObj([
        ...damagedDrugsObj,
        { id: docRef.id, ...newDamageDrug },
      ]);
      resetNewDamageDrug();
      setShowForm(false);
    } catch (error) {
      alert("Error adding damaged drug: " + error.message);
    }
  };

  const resetNewDamageDrug = () => {
    setNewDamageDrug({
      item: "",
      dosage: "",
      batchNumber: "",
      quantity: "",
      date: "",
      damageReason: "",
      manufacturer: "",
      status: "",
      hospitalName: "", // Reset new field
      hospitalLocation: "", // Reset new field
      pickup_date: "", // Reset new field
    });
    setSelectedDamageReason(""); // Reset damage reason
    setSelectedLocation(""); // Reset hospital location
  };

  const handleUploadCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const updatedData = results.data.map((item) => ({
            ...item,
            status: item.status || "Pending", // Default status if not provided
          }));
          setCSVData(updatedData);
          setDamagedDrugsObj((prev) => [...prev, ...updatedData]);
        },
      });
    }
  };

  const submitToFirebase = async () => {
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "supplierdamagedrugs"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  const handleEditDamageDrug = (drug) => {
    setNewDamageDrug(drug);
    setCurrentEditId(drug.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleUpdateDamageDrug = async () => {
    try {
      const drugRef = doc(db, "supplierdamagedrugs", currentEditId);
      await updateDoc(drugRef, newDamageDrug);
      setDamagedDrugsObj(
        damagedDrugsObj.map((item) =>
          item.id === currentEditId ? { ...item, ...newDamageDrug } : item
        )
      );
      resetNewDamageDrug();
      setEditMode(false);
      setShowForm(false);
    } catch (error) {
      alert("Error updating damaged drug: " + error.message);
    }
  };

  const handleDeleteDamageDrug = async (id) => {
    try {
      const drugRef = doc(db, "supplierdamagedrugs", id);
      await deleteDoc(drugRef);
      setDamagedDrugsObj(damagedDrugsObj.filter((item) => item.id !== id));
      alert("Damaged drug deleted successfully!");
    } catch (error) {
      alert("Error deleting damaged drug: " + error.message);
    }
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "damaged_drugs_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFileDialog = () => {
    document.getElementById("csv-upload-input").click();
  };

  const generateReport = async () => {
    const reportData = filteredData.map((item) => ({
      item: item.item,
      dosage: item.dosage,
      batchNumber: item.batchNumber,
      quantity: item.quantity,
      date: item.date,
      damageReason: item.damageReason,
      manufacturer: item.manufacturer,
      status: item.status,
      hospitalName: item.hospitalName,
      hospitalLocation: item.hospitalLocation,
      pickup_date: item.pickup_date,
    }));

    const prompt = `Here is my damaged drugs report: ${JSON.stringify(
      reportData
    )}. Title:
"PharmaLink Damage Drugs Analysis Report"

Date:
December 6, 2024

Sections to Include:

1. Summary/Overview
Total number of damaged drug incidents.
Percentage of drugs returned vs. discarded.
Most common reasons for damage (e.g., expired, contamination, packaging issues).





You said:
i mean tell model to add toady date 
ChatGPT said:
ChatGPT
Here’s the updated prompt instructing the model to include today’s date dynamically:

Title:
"PharmaLink Damage Drugs Analysis Report"

Sections to Include:

1. Summary/Overview
Total number of damaged drug incidents.
Percentage of drugs returned vs. discarded.
Most common reasons for damage (e.g., expired, contamination, packaging issues).
Manufacturers with the highest number of damaged drugs.
2. Analysis
By Damage Reason:
Breakdown of incidents by cause (e.g., Expired, Contamination, Storage Issues, Packaging Issues).
By Manufacturer:
Highlight manufacturers with the most reported damages.
By Hospital Location:
Analyze locations with the most frequent damage incidents.
By Status:
Compare incidents categorized as "Returned" vs. "Discarded."
3. Hospital Impact
Identify hospitals most affected by damaged drug incidents.
Correlate with the reasons for damage and drug types.
4. Recommendations
Suggestions to reduce damage incidents, such as:
Improved packaging and handling processes.
Enhanced storage and transportation conditions.
Regular monitoring of drug expiry dates. Please generate a PDF report.`;

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
              { text: "Generate a report for the following damaged drugs." },
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
        doc.save("damaged_drugs_report.pdf");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  // Extract unique manufacturers, statuses, damage reasons, and locations for dropdowns
  const uniqueManufacturers = [
    ...new Set(
      damagedDrugsObj.map((item) => item.manufacturer).filter(Boolean)
    ),
  ];
  const uniqueStatuses = [
    ...new Set(damagedDrugsObj.map((item) => item.status).filter(Boolean)),
  ];
  const uniqueDamageReasons = [
    ...new Set(
      damagedDrugsObj.map((item) => item.damageReason).filter(Boolean)
    ),
  ]; // Unique damage reasons
  const uniqueLocations = [
    ...new Set(
      damagedDrugsObj.map((item) => item.hospitalLocation).filter(Boolean)
    ),
  ]; // Unique hospital locations
  const uniqueDosages = [
    ...new Set(damagedDrugsObj.map((item) => item.dosage).filter(Boolean)),
  ]; // Unique dosages
  const uniqueQuantities = [
    ...new Set(damagedDrugsObj.map((item) => item.quantity).filter(Boolean)),
  ]; // Unique quantities
  const uniqueItems = [
    ...new Set(damagedDrugsObj.map((item) => item.item).filter(Boolean)),
  ]; // Unique items

  // Prepare data for charts
  const damageReasonData = {
    labels: uniqueDamageReasons,
    datasets: [
      {
        data: uniqueDamageReasons.map(
          (reason) =>
            damagedDrugsObj.filter((drug) => drug.damageReason === reason)
              .length
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
            damagedDrugsObj.filter((drug) => drug.status === status).length
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

  const locationData = {
    labels: uniqueLocations,
    datasets: [
      {
        data: uniqueLocations.map(
          (location) =>
            damagedDrugsObj.filter((drug) => drug.hospitalLocation === location)
              .length
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
    <div className="relative overflow-x-auto mt-10 mx-24">
      <h1 className="text-center mb-8 font-semibold text-2xl">Damaged Drugs</h1>

      <div className="mb-4 flex items-center space-x-4">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search drug name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
        >
          + Add Damaged Drug
        </button>
        <button
          onClick={openFileDialog}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded transition duration-200 hover:bg-yellow-600 ml-4"
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
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600 ml-4"
        >
          <FaDownload className="mr-2" /> Get Report
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary Charts</h2>
        <div className="flex space-x-8">
          <div className="w-1/4 bg-white p-2 rounded-lg shadow-md">
            {" "}
            {/* Adjusted width */}
            <h3 className="text-lg font-semibold mb-2 text-center">
              Damage Reasons
            </h3>
            <Doughnut data={damageReasonData} />
          </div>
          <div className="w-1/4 bg-white p-2 rounded-lg shadow-md">
            {" "}
            {/* Adjusted width */}
            <h3 className="text-lg font-semibold mb-2 text-center">Status</h3>
            <Bar data={statusData} />
          </div>
          <div className="w-1/4 bg-white p-2 rounded-lg shadow-md">
            {" "}
            {/* Adjusted width */}
            <h3 className="text-lg font-semibold mb-2 text-center">
              Locations
            </h3>
            <Pie data={locationData} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            selectedItem ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Drug Name</option>
          {uniqueItems.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={selectedDosage}
          onChange={(e) => setSelectedDosage(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            selectedDosage ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Dosage</option>
          {uniqueDosages.map((dosage) => (
            <option key={dosage} value={dosage}>
              {dosage}
            </option>
          ))}
        </select>
        <select
          value={selectedQuantity}
          onChange={(e) => setSelectedQuantity(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            selectedQuantity ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Quantity</option>
          {uniqueQuantities.map((quantity) => (
            <option key={quantity} value={quantity}>
              {quantity}
            </option>
          ))}
        </select>
        <select
          value={selectedManufacturer}
          onChange={(e) => setSelectedManufacturer(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            selectedManufacturer ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Manufacturer</option>
          {uniqueManufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            selectedLocation ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Hospital Location</option>
          {uniqueLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`border border-gray-300 rounded-lg px-4 py-2 ${
            selectedStatus ? "bg-black text-white" : ""
          }`}
        >
          <option value="">Select Status</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" className="rounded-md" />
              </th>
              <th className="px-4 py-3">
                Drug Name <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Dosage <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Batch Number{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Quantity Damaged{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Manufacturer{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Hospital Name{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>{" "}
              {/* New column */}
              <th className="px-4 py-3">
                Hospital Location{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>{" "}
              {/* New column */}
              <th className="px-4 py-3">
                Date of Incident{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Damage Reason{" "}
                <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Status <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
              <th className="px-4 py-3">
                Pickup Date <ChevronDown className="ml-2 h-4 w-4 inline-block" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((drug, index) => (
              <tr
                key={index}
                className="bg-white border-b hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded-md" />
                </td>
                <td className="px-4 py-3 font-medium">{drug.item}</td>
                <td className="px-4 py-3">{drug.dosage}</td>
                <td className="px-4 py-3">{drug.batchNumber}</td>
                <td className="px-4 py-3">{drug.quantity}</td>
                <td className="px-4 py-3">{drug.manufacturer}</td>
                <td className="px-4 py-3">{drug.hospitalName}</td>{" "}
                {/* New data */}
                <td className="px-4 py-3">{drug.hospitalLocation}</td>{" "}
                {/* New data */}
                <td className="px-4 py-3">{drug.date}</td>
                <td className="px-4 py-3">{drug.damageReason}</td>
                <td className="px-4 py-3">{drug.status}</td>
                <td className="px-4 py-3">{drug.pickup_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={submitToFirebase}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
        >
          <FaPaperPlane className="mr-2" /> Submit to Database
        </button>
        <button
          onClick={downloadCSV}
          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded transition duration-200 hover:bg-gray-600"
        >
          <FaDownload className="mr-2" /> Download CSV
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Edit Damaged Drug" : "Add Damaged Drug"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700">Drug Name</label>
                <input
                  type="text"
                  value={newDamageDrug.item}
                  onChange={(e) =>
                    setNewDamageDrug({ ...newDamageDrug, item: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Dosage</label>
                <input
                  type="text"
                  value={newDamageDrug.dosage}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      dosage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Batch Number</label>
                <input
                  type="text"
                  value={newDamageDrug.batchNumber}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      batchNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={newDamageDrug.quantity}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  value={newDamageDrug.date}
                  onChange={(e) =>
                    setNewDamageDrug({ ...newDamageDrug, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Damage Reason</label>
                <input
                  type="text"
                  value={newDamageDrug.damageReason}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      damageReason: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Manufacturer</label>
                <input
                  type="text"
                  value={newDamageDrug.manufacturer}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      manufacturer: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Status</label>
                <input
                  type="text"
                  value={newDamageDrug.status}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Hospital Name</label>
                <input
                  type="text"
                  value={newDamageDrug.hospitalName}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      hospitalName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Hospital Location</label>
                <input
                  type="text"
                  value={newDamageDrug.hospitalLocation}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      hospitalLocation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Pickup Date</label>
                <input
                  type="text"
                  value={newDamageDrug.pickup_date}
                  onChange={(e) =>
                    setNewDamageDrug({
                      ...newDamageDrug,
                      pickup_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetNewDamageDrug();
                  setEditMode(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded transition duration-200 hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={
                  editMode ? handleUpdateDamageDrug : handleAddDamageDrug
                }
                className="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
              >
                {editMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDamageDrugs;
