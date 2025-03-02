"use client";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { FaSearch, FaUpload } from "react-icons/fa";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Link from "next/link";

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

const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

function InstituteShipments() {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [CSVData, setCSVData] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null); // Store the shipment being edited
  const [formData, setFormData] = useState({
    shipmentId: "",
    drugName: "",
    quantity: "",
    hospital: "",
    hospitalLocation: "",
    supplier: "",
    supplierLocation: "",
    dispatchDate: "",
    expectedDelivery: "",
    status: "",
    priority: "",
    paymentDate: "",
    perUnitPrice: "",
    price: "",
    purchaseId: "",
  }); // Form state

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "shipments"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShipments(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Handle CSV file upload and parse
  const handleUploadCSV = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const updatedData = results.data.map((item) => ({
            shipmentId: item.Shipment_ID || "",
            drugName: item.drugName || "",
            quantity: item.Units_Dispatched || "",
            hospital: item.Hospital_Name || "",
            hospitalLocation: item.Hospital_Location || "",
            supplier: item.supplier || "",
            supplierLocation: item.Supplier_Location || "",
            dispatchDate: item.Dispatch_Date || "",
            expectedDelivery: item.Expected_Delivery_Date || "",
            status: item.Status || "",
            priority: item.Priority_Level || "",
            paymentDate: item.Payment_Date || "",
            perUnitPrice: item.Per_Unit_Price || "",
            price: item.Price || "",
            purchaseId: item.Purchase_ID || "",
          }));

          setCSVData(updatedData);
          setShipments((prev) =>
            [...prev, ...updatedData].filter((item) => item.shipmentId)
          );
        },
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  // Submit CSV data to Firestore
  const submitToFirebase = async () => {
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "shipments"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  // Download data as CSV
  const downloadCSV = () => {
    const csv = Papa.unparse(shipments);
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

  // Handle edit shipment
  const handleEditShipment = (item) => {
    setSelectedShipment(item); // Set the selected shipment
    setFormData({
      shipmentId: item.shipmentId,
      drugName: item.drugName,
      quantity: item.quantity,
      hospital: item.hospital,
      hospitalLocation: item.hospitalLocation,
      supplier: item.supplier,
      supplierLocation: item.supplierLocation,
      dispatchDate: item.dispatchDate,
      expectedDelivery: item.expectedDelivery,
      status: item.status,
      priority: item.priority,
      paymentDate: item.paymentDate,
      perUnitPrice: item.perUnitPrice,
      price: item.price,
      purchaseId: item.purchaseId,
    });
  };

  // Handle delete shipment
  const handleDeleteShipment = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this shipment?"
    );
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "shipments", id));
        setShipments(shipments.filter((shipment) => shipment.id !== id));
        alert("Shipment deleted successfully!");
      } catch (error) {
        console.error("Error deleting shipment: ", error);
        alert("Failed to delete shipment.");
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission (Edit shipment)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const shipmentRef = doc(db, "shipments", selectedShipment.id);
      await updateDoc(shipmentRef, formData); // Update the Firestore record
      setShipments((prevShipments) =>
        prevShipments.map((shipment) =>
          shipment.id === selectedShipment.id
            ? { ...shipment, ...formData }
            : shipment
        )
      );
      alert("Shipment updated successfully!");
      setSelectedShipment(null); // Close the modal
    } catch (error) {
      console.error("Error updating shipment: ", error);
      alert("Failed to update shipment.");
    }
  };

  return (
    <div
      className={`${poppins.className} relative overflow-x-auto my-20 mx-24`}
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

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded transition duration-200 hover:bg-yellow-600"
        >
          <FaUpload className="mr-2" /> Upload CSV
        </button>

        {/* Hidden file input for CSV upload */}
        <input
          type="file"
          accept=".csv"
          onChange={handleUploadCSV}
          className={`${showUpload ? "block" : "hidden"}`}
        />

        <button
          onClick={submitToFirebase}
          className={`${
            showUpload
              ? "flex items-center px-4 py-2 bg-green-500 text-white rounded transition duration-200 hover:bg-yellow-600"
              : "hidden"
          }`}
        >
          Submit
        </button>
      </div>

      {/* Table Display */}
      <table className="min-w-full bg-white border-b border-gray-300 mt-4">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Shipment ID</th>
            <th className="py-2 px-4 border-b text-left">Drug Name</th>
            <th className="py-2 px-4 border-b text-left">Units Dispatched</th>
            <th className="py-2 px-4 border-b text-left">Supplier Name</th>
            <th className="py-2 px-4 border-b text-left">Supplier Location</th>
            <th className="py-2 px-4 border-b text-left">Dispatch Date</th>
            <th className="py-2 px-4 border-b text-left">
              Expected Delivery Date
            </th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Priority Level</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments
            .filter(
              (item) =>
                item.shipmentId
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.drugName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.hospital.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((shipment) => (
              <tr key={shipment.id}>
                <td className="py-2 px-4 border-b">{shipment.shipmentId}</td>
                <td className="py-2 px-4 border-b">{shipment.drugName}</td>
                <td className="py-2 px-4 border-b">{shipment.quantity}</td>
                <td className="py-2 px-4 border-b">{shipment.supplier}</td>
                <td className="py-2 px-4 border-b">
                  {shipment.supplierLocation}
                </td>
                <td className="py-2 px-4 border-b">{shipment.dispatchDate}</td>
                <td className="py-2 px-4 border-b">

                  {shipment.expectedDelivery}
                </td>
                <td className="py-2 px-4 border-b">
                  {shipment.status === "ordered" 
                    ? "To be dispatched"
                    : shipment.status}
                </td>
                <td className="py-2 px-4 border-b">{shipment.priority}</td>
                <td className="py-2 px-4 border-b">
                  {/* <button
            onClick={() => handleEditShipment(shipment)}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Edit
          </button> */}
                  <div className="flex items-center space-x-4">
                    <Link
                      key={shipment.shipmentId}
                      href={{
                        pathname: `/institute-shipments/${shipment.shipmentId}`,
                        query: { id: shipment.shipmentId },
                      }}
                      className="w-7 h-7 object-contain cursor-pointer"
                    >
                      <img src="/more.png" alt="view details" />
                    </Link>

                    <Link
                      href="/chat"
                      className="text-blue-500 hover:text-blue-700"
                      title="Chat"
                    >
                      <IoChatboxEllipsesOutline size={20} />
                    </Link>
                    <button
                      onClick={() => handleDeleteShipment(shipment.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal for editing shipment */}
      {selectedShipment && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Edit Shipment</h2>
            <form onSubmit={handleSubmitForm}>
              {Object.keys(formData).map((key) => (
                <div className="mb-4" key={key}>
                  <label htmlFor={key} className="block text-sm font-medium">
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="mr-4 bg-gray-500 text-white px-6 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstituteShipments;
