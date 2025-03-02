"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MdDelete } from "react-icons/md";
import { FaEdit, FaUpload, FaDownload } from "react-icons/fa";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import jsPDF from "jspdf";
import Papa from 'papaparse';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../../components/Navbar";
import { db } from "../../../firebase";
import { getDocs, collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

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
    Remarks: ""
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "admin_procurement"));
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
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
    const matchesSearch = order.DrugName && order.DrugName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? order.OrderDate === selectedDate : true;
    const matchesVendor = vendorFilter ? order.VendorName === vendorFilter : true;
    const matchesStatus = statusFilter ? order.OrderStatus === statusFilter : true;
    return matchesSearch && matchesDate && matchesVendor && matchesStatus;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCSVData(results.data);
        }
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
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "procurement_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueVendors = [...new Set(orders.map(order => order.VendorName))];
  const uniqueStatuses = [...new Set(orders.map(order => order.OrderStatus))];

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAllOrders = (checked) => {
    if (checked) {
      const allOrderIds = filteredOrders.map(order => order.id);
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
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
            <input
              type="text"
              placeholder="Search drug name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
            />
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded transition duration-200 hover:bg-yellow-600 cursor-pointer"
          >
            <FaUpload className="mr-2" /> Upload CSV
          </label>
        </div>

        <div className="mb-4 flex space-x-4">
          <select
            className="bg-white text-black p-2 border rounded"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          >
            <option value="">Select Vendor</option>
            {uniqueVendors.map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>

          <select
            className="bg-white text-black p-2 border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Select Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAllOrders}
                  />
                </TableHead>
                {Object.keys(newOrder).map(header => (
                  <TableHead key={header}>{header} <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                    />
                  </TableCell>
                  {Object.keys(newOrder).map(key => (
                    <TableCell key={key}>{order[key]}</TableCell>
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
    </>
  );
}

export default Page;
