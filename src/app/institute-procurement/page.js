"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Raleway, Poppins } from "next/font/google";
import {
  getDocs,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { jsPDF } from "jspdf";
import LabNavbar from "../../../components/LabNavbar";
import Papa from "papaparse";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { FaDownload } from "react-icons/fa";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Font configurations
const raleway = Raleway({ weight: ["400", "700"], subsets: ["latin"] });
const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function ProcurementPage() {
  const [CSVData, setCSVData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fetch, setFetch] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const [procurementData, setProcurementData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch procurement data from Firebase collection
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "procurement"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProcurementData(data);
    };
    fetchData();
  }, []);

  // Filter data based on selected filters
  const filteredData = procurementData.filter(
    (order) =>
      order.drugName &&
      order.drugName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedVendor ? order.vendorName === selectedVendor : true) &&
      (selectedStatus ? order.orderStatus === selectedStatus : true) &&
      (selectedDate ? order.orderDate === selectedDate : true)
  );
  // Generate Procurement Report

  const generateReport = async () => {
    const reportData = filteredData.map((item) => ({
      orderId: item.orderId,
      orderDate: item.orderDate,
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      drugName: item.drugName,
      drugId: item.drugId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalCost: item.totalCost,
      orderStatus: item.orderStatus,
      deliveryDate: item.deliveryDate,
      contractId: item.contractId,
      contractDetails: item.contractDetails,
      remarks: item.remarks,
    }));

    const prompt = `Here is my procurement report: ${JSON.stringify(
      reportData
    )}. Title:
"PharmaLink Procurement Analysis Report"

Date:
${new Date().toLocaleDateString()}

Sections to Include:

1. Summary/Overview
Total number of procurement orders.
Total cost of procurement.
Vendors with the highest number of orders.
Most ordered drugs.
Order statuses (e.g., Pending, Delivered, Canceled).

2. Procurement Analysis

By Order Status:
Overview of orders categorized by status (e.g., Pending, Delivered, Canceled).

By Delivery Date:
Analyze the impact of delivery dates on procurement timelines.

3. Vendor Performance
Identify vendors with the highest procurement orders.
Evaluate vendor reliability based on delivery dates.

4. Cost Analysis
Total cost of procurement by drug name and vendor.
Average unit price per drug.

5. Recommendations
Suggestions to improve procurement efficiency, such as:
- Negotiating better prices with vendors.
- Optimizing drug quantities to meet hospital demand.
- Enhancing vendor performance tracking to reduce delays.
`;

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
              {
                text: "Generate a procurement report based on the following data.",
              },
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
  // Search and filter states
  const [searchFilters, setSearchFilters] = useState({
    drugName: "",
    orderStatus: "",
    vendorName: "",
  });

  const drugNames =
    orders.length > 0
      ? [...new Set(orders.map((order) => order["Drug Name"]))]
      : [];
  const orderStatuses =
    orders.length > 0
      ? [...new Set(orders.map((order) => order["Order Status"]))]
      : [];
  const vendorNames =
    orders.length > 0
      ? [...new Set(orders.map((order) => order["Vendor Name"]))]
      : [];

  const options = { drugNames, orderStatuses, vendorNames };

  const expectedHeaders = [
    "Order ID",
    "Order Date",
    "Vendor ID",
    "Vendor Name",
    "Drug Name",
    "Drug ID",
    "Quantity",
    "Unit Price",
    "Total Cost",
    "Order Status",
    "Delivery Date",
    "Contract ID",
    "Contract Details",
    "Remarks",
  ];

  const normalizeHeader = (header) =>
    header.trim().toLowerCase().replace(/ /g, "");

  // Fetch procurement data from Firebase
  useEffect(() => {
    if (!fetch) {
      const fetchOrders = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "procurement"));
          const fetchedOrders = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            TotalCost: (doc.data().Quantity * doc.data().UnitPrice).toFixed(2),
          }));
          setOrders(fetchedOrders);
          setFetch(true);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
      fetchOrders();
    }
  }, [fetch]);

  // Filter logic for displaying filtered data
  // Filter logic for displaying filtered data
  const filteredOrders = orders.filter((order) => {
    const { drugName, orderStatus, vendorName } = searchFilters;

    const isGlobalSearchMatch =
      globalSearch === "" ||
      Object.values(order).some((value) =>
        value.toString().toLowerCase().includes(globalSearch.toLowerCase())
      );

    const isDrugNameMatch =
      drugName === "" ||
      order["Drug Name"].toLowerCase().includes(drugName.toLowerCase());

    const isOrderStatusMatch =
      orderStatus === "" ||
      order["Order Status"].toLowerCase().includes(orderStatus.toLowerCase());

    const isVendorNameMatch =
      vendorName === "" ||
      order["Vendor Name"].toLowerCase().includes(vendorName.toLowerCase());

    return (
      isGlobalSearchMatch &&
      isDrugNameMatch &&
      isOrderStatusMatch &&
      isVendorNameMatch
    );
  });

  const handleUpdate = async (id, updatedData) => {
    try {
      const docRef = doc(db, "procurement", id);
      await updateDoc(docRef, updatedData);
      toast.success("Order updated successfully!");
      setFetch(false); // Trigger a re-fetch
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const docRef = doc(db, "procurement", id);
        await deleteDoc(docRef);
        toast.success("Order deleted successfully!");
        setOrders((prev) => prev.filter((order) => order.id !== id)); // Update UI without re-fetch
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order.");
      }
    }
  };

  const handleEditRow = (rowId) => {
    const updatedOrders = orders.map((order) => ({
      ...order,
      isEditing: order.id === rowId ? !order.isEditing : false,
    }));
    setOrders(updatedOrders);
  };

  const saveEdit = (rowId, updatedRow) => {
    handleUpdate(rowId, updatedRow);
    handleEditRow(rowId); // Exit editing mode
  };

  const parseCsv = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (result) => resolve(result),
        error: (error) => reject(error.message),
        header: true,
      });
    });
  };

  // CSV upload logic remains the same
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { data, errors, meta } = await parseCsv(file);
        const csvHeaders = meta.fields.map(normalizeHeader);

        const missingHeaders = expectedHeaders.filter(
          (header) => !csvHeaders.includes(normalizeHeader(header))
        );

        if (missingHeaders.length > 0) {
          toast.error(
            `CSV is missing the following headers: ${missingHeaders.join(", ")}`
          );
          return;
        }

        const normalizedData = data.map((row) => {
          const normalizedRow = {};
          expectedHeaders.forEach((header) => {
            const normalizedKey = normalizeHeader(header);
            normalizedRow[header] =
              row[
                meta.fields.find((f) => normalizeHeader(f) === normalizedKey)
              ] || "N/A";
          });
          return normalizedRow;
        });

        setCSVData(normalizedData);
        toast.success("CSV uploaded successfully!");
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Error parsing the uploaded CSV file.");
      }
    }
  };

  return (
    <>
      <LabNavbar />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        theme="light"
      />
      <div className="w-full flex flex-col items-center px-4 py-10">
        <h1 className={`${poppins.className} text-4xl font-bold mb-6`}>
          {" "}
          Upload Procurement{" "}
        </h1>

        {/* Global Search */}
        <input
          type="text"
          placeholder="Search across all fields"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded mb-4 w-full max-w-6xl"
        />

        {/* Procurement Table */}
        <div className="w-full max-w-6xl mx-auto mb-10">
          <FilterBar
            filters={searchFilters}
            setFilters={setSearchFilters}
            options={options}
          />
          <TableSection
            title="Procurement Data"
            data={filteredOrders}
            headers={expectedHeaders}
          />

          <div className="mt-6 flex flex-row justify-end w-full max-w-6xl mx-auto">
            {/* Button to trigger generateReport */}
            <button
              onClick={generateReport}
              className="bg-blue-600 text-white py-2 px-6 rounded flex items-center"
            >
              <FaDownload className="mr-2" /> {/* Icon with right margin */}
              Get Report
            </button>
          </div>
        </div>

        {/* Upload CSV Section */}
        <div className="flex flex-col w-full max-w-6xl mx-auto space-y-6">
          <h2 className={`${raleway.className} text-3xl font-bold mb-4`}>
            Upload CSV
          </h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="border border-gray-300 p-2 rounded mb-4 w-full"
          />
        </div>

        {/* CSV Preview */}
        {CSVData.length > 0 && (
          <div className="flex flex-col w-full max-w-6xl mx-auto mt-10">
            <h2 className={`${raleway.className} text-2xl font-semibold mb-4`}>
              CSV Preview
            </h2>
            <div className="overflow-x-auto w-full">
              <table className="mx-auto text-sm text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    {expectedHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 border-b text-center"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CSVData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      {expectedHeaders.map((header) => (
                        <td key={header} className="px-4 py-2 text-center">
                          {row[header] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// FilterBar Component
function FilterBar({
  filters,
  setFilters,
  options = { drugNames: [], orderStatuses: [], vendorNames: [] },
}) {
  const { drugNames, orderStatuses, vendorNames } = options;

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Drug Name Dropdown */}
      <select
        value={filters.drugName}
        onChange={(e) => setFilters({ ...filters, drugName: e.target.value })}
        className="border border-gray-300 p-2 rounded w-48"
      >
        <option value="">Select Drug</option>
        {drugNames.map((drug, index) => (
          <option key={index} value={drug}>
            {drug}
          </option>
        ))}
      </select>

      {/* Order Status Dropdown */}
      <select
        value={filters.orderStatus}
        onChange={(e) =>
          setFilters({ ...filters, orderStatus: e.target.value })
        }
        className="border border-gray-300 p-2 rounded w-48"
      >
        <option value="">Select Order Status</option>
        {orderStatuses.map((status, index) => (
          <option key={index} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Vendor Name Dropdown */}
      <select
        value={filters.vendorName}
        onChange={(e) => setFilters({ ...filters, vendorName: e.target.value })}
        className="border border-gray-300 p-2 rounded w-48"
      >
        <option value="">Select Vendor</option>
        {vendorNames.map((vendor, index) => (
          <option key={index} value={vendor}>
            {vendor}
          </option>
        ))}
      </select>
    </div>
  );
}

// Reusable Table Section
function TableSection({ title, data, headers, onEdit, onDelete }) {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

  const startEditing = (row) => {
    setEditingRowId(row.id);
    setEditRowData(row); // Clone the row data for editing
  };

  const handleChange = (e, header) => {
    setEditRowData({
      ...editRowData,
      [header]: e.target.value,
    });
  };

  const saveEdit = () => {
    onEdit(editingRowId, editRowData);
    setEditingRowId(null); // Exit editing mode
  };

  const cancelEdit = () => {
    setEditingRowId(null); // Exit editing mode without saving
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto w-full">
        <table className="mx-auto text-sm text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 border-b text-center">
                  {header}
                </th>
              ))}
              <th className="px-4 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-2 text-center">
                      {editingRowId === item.id ? (
                        <input
                          type="text"
                          value={editRowData[header] || ""}
                          onChange={(e) => handleChange(e, header)}
                          className="border border-gray-300 p-1 rounded"
                        />
                      ) : (
                        item[header] || "-"
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    {editingRowId === item.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 font-semibold mx-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 font-semibold mx-2"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(item)}
                          className="text-blue-600 font-semibold mx-2 hover:bg-blue-100 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 font-semibold mx-2 hover:bg-red-100 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
