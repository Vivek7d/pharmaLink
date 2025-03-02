"use client";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { FaSearch, FaUpload } from "react-icons/fa";
import Papa from "papaparse";
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Link from "next/link";

const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

function AdminShipments() {
  const [shipments, setShipments] = useState([]); // State for shipment data
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [CSVData, setCSVData] = useState([]); // State for CSV data

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "shipments"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(data);
        setShipments(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Download data as CSV
  const downloadCSV = () => {
    const csv = Papa.unparse(sortedShipments);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "shipments.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`${poppins.className} relative overflow-x-auto mt-10 mx-24`}
    >
      <h1 className="text-center mb-8 font-semibold text-2xl">Shipments</h1>

      {/* Search and Filter Section */}
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search shipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>

      {/* Table Display */}
      <div className="rounded-md border border-gray-300 shadow-lg overflow-hidden mt-4">
  <table className="min-w-full bg-white border-b border-gray-300 text-sm">
    <thead>
      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <th className="py-2 px-4 text-left">Shipment ID</th>
        <th className="py-2 px-4 text-left">Units Dispatched</th>
        <th className="py-2 px-4 text-left">Hospital Name</th>
        <th className="py-2 px-4 text-left">Hospital Location</th>
        <th className="py-2 px-4 text-left">Supplier Name</th>
        <th className="py-2 px-4 text-left">Supplier Location</th>
        <th className="py-2 px-4 text-left">Dispatch Date</th>
        <th className="py-2 px-4 text-left">Expected Delivery Date</th>
        <th className="py-2 px-4 text-left">Status</th>
        <th className="py-2 px-4 text-left">Priority Level</th>
        <th className="py-2 px-4 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {shipments.map((item) => (
        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
          <td className="py-2 px-4">{item.shipmentId}</td>
          <td className="py-2 px-4">{item.quantity}</td>
          <td className="py-2 px-4">{item.hospital}</td>
          <td className="py-2 px-4">{item.hospitalLocation}</td>
          <td className="py-2 px-4">{item.supplierName}</td>
          <td className="py-2 px-4">{item.supplierLocation}</td>
          <td className="py-2 px-4">{item.dispatchDate}</td>
          <td className="py-2 px-4">{item.expectedDelivery}</td>
          <td className="py-2 px-4">{item.status}</td>
          <td className="py-2 px-4">{item.priority}</td>
          <td className="py-2 px-4">
            <a
              href={{
                pathname: `/admin-shipments/${item.shipmentId}`,
                query: { id: item.shipmentId },
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              View Details
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}

export default AdminShipments;
