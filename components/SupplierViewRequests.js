"use client";

import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import Papa from "papaparse";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebase"; // Import your Firestore DB instance from firebase.js
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust based on actual Select component import

const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

function SupplierViewRequests() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const shipmentsRef = collection(db, "shipments"); // Reference to the 'shipments' collection
        const snapshot = await getDocs(shipmentsRef); // Fetch documents from Firestore
        const shipmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPurchaseOrders(shipmentsData); // Set the data in the state
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchShipments(); // Fetch data
  }, []); // Empty dependency array means this runs once when the component mounts

  // Handle downloading the CSV
  const handleDownload = () => {
    const csv = Papa.unparse(purchaseOrders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "purchase_orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload and CSV parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const filteredData = results.data.filter(
          (item) =>
            (item.hospital && item.hospital.includes("JJ Hospital")) ||
            (item.hospitalLocation && item.hospitalLocation.includes("Thane"))
        );
        setPurchaseOrders(filteredData); // Set filtered data in state
      },
    });
  };

  // Get status badge class based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Ordered":
        return "border border-black !text-gray-700 bg-blue-500";
      case "Shipped":
        return "border border-black !text-gray-700 bg-yellow-500";
      case "Delivered":
        return "border border-black !text-gray-700 bg-green-500";
      case "Pending":
        return "border border-black !text-gray-700 bg-red-500";
      default:
        return "border border-black !text-gray-700";
    }
  };

  // Update the status in the state when changed
  const handleStatusChange = async (id, newStatus) => {
    // Update Firestore document
    try {
      const orderRef = doc(db, "shipments", id); // Reference to the order document in Firestore
      await updateDoc(orderRef, {
        status: newStatus, // Update the status field in Firestore
      });
      // Update the state locally
      setPurchaseOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating status in Firestore:", error);
    }
  };
  if (loading) {
    return <div>Loading...</div>; // Show a loading message while data is being fetched
  }

  return (
    <div
      className={`${poppins.className} relative overflow-x-auto mt-10 mx-20`}
    >
      <h1 className="text-3xl font-semibold pb-12">Supply Requests</h1>
      {/* <div className="mb-4">
        <button className="relative flex justify-center items-center bg-green-700 text-white border-none py-3 px-8 rounded-md overflow-hidden shadow-lg transition-all duration-250">
          <img
            src="/upload.png"
            alt="upload"
            className="w-7 h-7 object-contain mr-4"
          />
          Upload CSV
          <input
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            name="text"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          <span className="absolute inset-0 bg-green-600 rounded-md transition-all duration-350 z-[-1] w-0 hover:w-full"></span>
        </button>
      </div> */}
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-md text-gray-700 bg-gray-50 border-b">
          <tr>
            <th scope="col" className="px-2 py-3">
              Sr. No.
            </th>
            <th scope="col" className="px-2 py-3">
              Purchase Order ID
            </th>
            <th scope="col" className="px-2 py-3">
              Drug Name
            </th>
            <th scope="col" className="px-2 py-3">
              Supplier Name
            </th>
            <th scope="col" className="px-2 py-3">
              Quantity Ordered
            </th>
            <th scope="col" className="px-2 py-3">
              Payment Date
            </th>
            <th scope="col" className="px-2 py-3">
              Unit Price
            </th>
            <th scope="col" className="px-2 py-3">
              Total Price
            </th>
            <th scope="col" className="px-2 py-3">
              Order Status
            </th>
            <th scope="col" className="px-2 py-3">
              Actions
            </th>{" "}
            {/* New column */}
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((order, index) => (
            <tr key={index} className="bg-white border-b">
              <th
                scope="row"
                className="w-24 px-2 py-4 text-center font-medium text-gray-900 whitespace-nowrap"
              >
                {index + 1}
              </th>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.purchaseId}</h1>
              </td>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.drugName}</h1>
              </td>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.supplier}</h1>
              </td>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.quantity}</h1>
              </td>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.paymentDate}</h1>
              </td>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.perUnitPrice}</h1>
              </td>
              <td className="px-2 py-4">
                <h1 className="truncate w-56">{order.price}</h1>
              </td>
              <td className="px-2 py-3">
                <Select
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={order.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ordered">Ordered</SelectItem>
                    <SelectItem value="Dispatched">Dispatched</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-2 py-4 text-center">
                {order.status === "Ordered" ? (
                  <button
                    onClick={() => handleCreateId(order.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                  >
                    Create ID
                  </button>
                ) : (
                  <button
                    onClick={() => handleShowId(order.purchaseId)}
                    className="px-3 py-1 bg-gray-300 text-black rounded-md"
                  >
                    Show ID
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Download CSV
      </button>
    </div>
  );
}

export default SupplierViewRequests;
