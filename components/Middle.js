"use client";
import React, { useEffect, useState } from "react";
import "ldrs/ring";
import { zoomies } from "ldrs";

zoomies.register();

import { cardio } from "ldrs";

cardio.register();

import { Inter, Poppins, Raleway } from "next/font/google";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import CsvExport2 from "../CsvExport2";
import CsvExport3 from "../CsvExport3";
import ChartComponent from "./Chart";
import RadialChart from "./RadialChart";
const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ComplianceChart from "./ComplianceChart";
import QualityChart from "./QualityChart";
import ShipmentDelayChart from "./ShipmentDelays";
import Papa from "papaparse";
import Basic from "../Basic";
import AdminDashboardComponent from "./AdminDashboardComponent";

const raleway = Raleway({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const strengthUnits = ["mg", "g", "ml", "mcg"]; // Medical units for strength
const priceUnits = ["INR"]; // Only INR as the currency for unit price

function Middle() {
  const [active, setActive] = useState("Overview");
  const [itemModal, setItemModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editDept, setEditDept] = useState(null);
  const [item, setItem] = useState("");
  const [stock, setStock] = useState(0);
  const [inventoryName, setInventoryName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [departmentModal, setDepartmentModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [fetch, setFetch] = useState(false);
  const [CSVData, setCSVData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inventoryObj, setInventoryObj] = useState([]);
  useEffect(() => {
    if (!fetch) {
      const fetchInventory = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "inventory"));
          const fetchedInventory = [];

          querySnapshot.forEach((doc) => {
            // Map Firestore data fields to the table field names with underscores
            fetchedInventory.push({
              id: doc.id,
              Drug_ID: doc.data().Drug_ID, // Mapping Firestore Drug_ID
              Drug_Name: doc.data().Drug_Name,
              Brand_Name: doc.data().Brand_Name,
              Chemical_Composition: doc.data().Chemical_Composition,
              Dose: doc.data().Dose, // Added new Dose field
              Form: doc.data().Form,
              Quantity: doc.data().Quantity,
              Manufacturer: doc.data().Manufacturer,
              Location: doc.data().Location,
              Batch_No: doc.data().Batch_No,
              Expiry_Date: doc.data().Expiry_Date,
              Reorder_Level: doc.data().Reorder_Level,
              Last_Updated: doc.data().Last_Updated,
              Unit_Price: doc.data().Unit_Price,
              Storage_Condition: doc.data().Storage_Condition,
              Supplier_Contact: doc.data().Supplier_Contact,
              Shipment_Status: doc.data().Shipment_Status,
              Remarks: doc.data().Remarks,
              Total_Value: doc.data().Total_Value,
            });
          });

          setInventoryObj(fetchedInventory);
          setFetch(true);

          console.log(fetchedInventory);
        } catch (error) {
          console.error("Error fetching inventory data: ", error);
        }
      };

      fetchInventory();
    }
  }, [fetch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterByManufacturer, setFilterByManufacturer] = useState("");
  const [filterByLocation, setFilterByLocation] = useState("");
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  // Fetch inventory data
  useEffect(() => {
    // Fetch inventory data (assuming you have this already)
    // Populate manufacturer and location options
    const uniqueManufacturers = [
      ...new Set(inventoryObj.map((item) => item.Manufacturer)),
    ];
    const uniqueLocations = [
      ...new Set(inventoryObj.map((item) => item.Location)),
    ];

    setManufacturerOptions(uniqueManufacturers);
    setLocationOptions(uniqueLocations);
  }, [inventoryObj]);

  // Only apply filtering if the data is fetched
  const filteredInventory = fetch
    ? inventoryObj
        .filter(
          (item) =>
            item.Drug_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Drug_ID?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((item) =>
          filterByManufacturer
            ? item.Manufacturer === filterByManufacturer
            : true
        )
        .filter((item) =>
          filterByLocation ? item.Location === filterByLocation : true
        )
    : inventoryObj; // If not fetched, just use the raw data

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    Drug_ID: "",
    Drug_Name: "",
    Brand_Name: "",
    Chemical_Composition: "",
    Dose: "", // Added new Dose field
    Manufacturer: "",
    Location: "",
    Batch_No: "",
    Expiry_Date: "",
    Reorder_Level: "",
    Unit_Price: "",
    Storage_Condition: "",
    Supplier_Contact: "",
    Shipment_Status: "",
    Remarks: "",
    Total_Value: "",
  });

  // Function to open the modal with the item data
  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      Drug_ID: item.Drug_ID,
      Drug_Name: item.Drug_Name,
      Brand_Name: item.Brand_Name,
      Chemical_Composition: item.Chemical_Composition, // Added new Dose field
      Dose: item.Dose,
      Manufacturer: item.Manufacturer,
      Location: item.Location,
      Batch_No: item.Batch_No,
      Expiry_Date: item.Expiry_Date,
      Reorder_Level: item.Reorder_Level,
      Unit_Price: item.Unit_Price,
      Storage_Condition: item.Storage_Condition,
      Supplier_Contact: item.Supplier_Contact,
      Shipment_Status: item.Shipment_Status,
      Remarks: item.Remarks,
      Total_Value: item.Total_Value,
    });
    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedFields = {};

    // Collect only the fields that were changed
    for (const key in formData) {
      if (formData[key] !== currentItem[key]) {
        updatedFields[key] = formData[key];
      }
    }

    // Only update if there are changes
    if (Object.keys(updatedFields).length > 0) {
      const itemDoc = doc(db, "inventory", currentItem.id);
      await updateDoc(itemDoc, updatedFields);
    }

    // Close the modal
    setIsEditModalOpen(false);
  };

  // Handle Delete
  const handleDelete = async (itemId) => {
    try {
      const updatedInventory = inventoryObj.filter(
        (item) => item.id !== itemId
      );
      setInventoryObj(updatedInventory);

      // Delete from the database (e.g., Firestore)
      await deleteItemFromDatabase(itemId);

      console.log("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Firestore Update and Delete functions
  const updateItemInDatabase = async (itemId, updatedItem) => {
    const itemRef = doc(db, "inventory", itemId);
    await updateDoc(itemRef, updatedItem);
  };

  const deleteItemFromDatabase = async (itemId) => {
    const itemRef = doc(db, "inventory", itemId);
    await deleteDoc(itemRef);
  };

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [newInventoryItem, setNewInventoryItem] = useState({
    Drug_ID: "",
    Drug_Name: "",
    Brand_Name: "",
    Chemical_Composition: "",
    Dose: "", // Added new Dose field
    Manufacturer: "",
    Location: "",
    Batch_No: "",
    Expiry_Date: "",
    Reorder_Level: "",
    Unit_Price: "",
    Storage_Condition: "",
    Supplier_Contact: "",
    Shipment_Status: "",
    Remarks: "",
    Total_Value: "",
  });

  // Handle form input changes
  const handleInventoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewInventoryItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (Add New Item to Firestore)
  const handleAddInventoryItem = async (e) => {
    e.preventDefault();

    try {
      // Add the new item to Firestore
      const docRef = await addDoc(
        collection(db, "inventory"),
        newInventoryItem
      );
      console.log("Document written with ID: ", docRef.id);

      // Reset form fields and close modal
      setNewInventoryItem({
        Drug_ID: "",
        Drug_Name: "",
        Brand_Name: "",
        Chemical_Composition: "", // Added new Dose field
        Dose: "",
        Manufacturer: "",
        Location: "",
        Batch_No: "",
        Expiry_Date: "",
        Reorder_Level: "",
        Unit_Price: "",
        Storage_Condition: "",
        Supplier_Contact: "",
        Shipment_Status: "",
        Remarks: "",
        Total_Value: "",
      });
      setIsModalOpen(false); // Close modal after submission
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const drugConsumption = [
    // January
    { date: "2023-01-05", morphine: 310, fentanyl: 200, methadone: 175 },
    { date: "2023-01-12", morphine: 320, fentanyl: 210, methadone: 180 },
    { date: "2023-01-18", morphine: 330, fentanyl: 220, methadone: 185 },
    { date: "2023-01-23", morphine: 340, fentanyl: 230, methadone: 190 },
    { date: "2023-01-30", morphine: 355, fentanyl: 240, methadone: 200 },

    // February
    { date: "2023-02-03", morphine: 325, fentanyl: 215, methadone: 185 },
    { date: "2023-02-10", morphine: 335, fentanyl: 225, methadone: 190 },
    { date: "2023-02-15", morphine: 345, fentanyl: 230, methadone: 200 },
    { date: "2023-02-22", morphine: 340, fentanyl: 240, methadone: 210 },
    { date: "2023-02-28", morphine: 355, fentanyl: 245, methadone: 215 },

    // March
    { date: "2023-03-04", morphine: 330, fentanyl: 225, methadone: 195 },
    { date: "2023-03-09", morphine: 340, fentanyl: 230, methadone: 200 },
    { date: "2023-03-14", morphine: 350, fentanyl: 240, methadone: 210 },
    { date: "2023-03-20", morphine: 360, fentanyl: 250, methadone: 215 },
    { date: "2023-03-28", morphine: 375, fentanyl: 260, methadone: 220 },

    // April
    { date: "2023-04-02", morphine: 340, fentanyl: 235, methadone: 200 },
    { date: "2023-04-08", morphine: 350, fentanyl: 245, methadone: 210 },
    { date: "2023-04-14", morphine: 355, fentanyl: 255, methadone: 220 },
    { date: "2023-04-19", morphine: 365, fentanyl: 265, methadone: 225 },
    { date: "2023-04-25", morphine: 375, fentanyl: 275, methadone: 230 },

    // May
    { date: "2023-05-03", morphine: 350, fentanyl: 240, methadone: 210 },
    { date: "2023-05-10", morphine: 360, fentanyl: 250, methadone: 215 },
    { date: "2023-05-15", morphine: 370, fentanyl: 260, methadone: 225 },
    { date: "2023-05-22", morphine: 380, fentanyl: 270, methadone: 230 },
    { date: "2023-05-30", morphine: 390, fentanyl: 280, methadone: 240 },

    // June
    { date: "2023-06-04", morphine: 360, fentanyl: 250, methadone: 220 },
    { date: "2023-06-10", morphine: 370, fentanyl: 260, methadone: 225 },
    { date: "2023-06-15", morphine: 375, fentanyl: 270, methadone: 230 },
    { date: "2023-06-21", morphine: 380, fentanyl: 275, methadone: 240 },
    { date: "2023-06-30", morphine: 390, fentanyl: 280, methadone: 250 },

    // July
    { date: "2023-07-05", morphine: 370, fentanyl: 265, methadone: 230 },
    { date: "2023-07-11", morphine: 380, fentanyl: 275, methadone: 240 },
    { date: "2023-07-17", morphine: 390, fentanyl: 285, methadone: 245 },
    { date: "2023-07-22", morphine: 400, fentanyl: 290, methadone: 250 },
    { date: "2023-07-31", morphine: 410, fentanyl: 300, methadone: 260 },

    // August
    { date: "2023-08-02", morphine: 375, fentanyl: 270, methadone: 240 },
    { date: "2023-08-09", morphine: 385, fentanyl: 275, methadone: 245 },
    { date: "2023-08-15", morphine: 395, fentanyl: 285, methadone: 250 },
    { date: "2023-08-20", morphine: 405, fentanyl: 295, methadone: 255 },
    { date: "2023-08-30", morphine: 415, fentanyl: 305, methadone: 265 },

    // September
    { date: "2023-09-04", morphine: 380, fentanyl: 275, methadone: 245 },
    { date: "2023-09-10", morphine: 390, fentanyl: 285, methadone: 250 },
    { date: "2023-09-14", morphine: 400, fentanyl: 295, methadone: 260 },
    { date: "2023-09-22", morphine: 410, fentanyl: 305, methadone: 265 },
    { date: "2023-09-30", morphine: 420, fentanyl: 315, methadone: 275 },

    // October
    { date: "2023-10-02", morphine: 390, fentanyl: 280, methadone: 250 },
    { date: "2023-10-09", morphine: 400, fentanyl: 290, methadone: 255 },
    { date: "2023-10-15", morphine: 410, fentanyl: 300, methadone: 260 },
    { date: "2023-10-22", morphine: 420, fentanyl: 310, methadone: 270 },
    { date: "2023-10-31", morphine: 430, fentanyl: 320, methadone: 275 },

    // November
    { date: "2023-11-03", morphine: 400, fentanyl: 290, methadone: 260 },
    { date: "2023-11-08", morphine: 410, fentanyl: 300, methadone: 270 },
    { date: "2023-11-15", morphine: 420, fentanyl: 310, methadone: 275 },
    { date: "2023-11-21", morphine: 430, fentanyl: 320, methadone: 280 },
    { date: "2023-11-30", morphine: 440, fentanyl: 330, methadone: 290 },

    // December
    { date: "2023-12-05", morphine: 410, fentanyl: 300, methadone: 270 },
    { date: "2023-12-10", morphine: 420, fentanyl: 310, methadone: 275 },
    { date: "2023-12-15", morphine: 430, fentanyl: 320, methadone: 280 },
    { date: "2023-12-22", morphine: 440, fentanyl: 330, methadone: 290 },
    { date: "2023-12-29", morphine: 450, fentanyl: 340, methadone: 300 },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const { data } = await parseCsv(file);
      console.log("CSV Data:", data);
      setCSVData(data);
    }
  };

  const parseCsv = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (result) => {
          resolve(result);
        },
        error: (error) => {
          reject(error.message);
        },
        header: true, // Set to false if your CSV doesn't have headers
      });
    });
  };

  const submitToFirebase = async () => {
    setLoading(true); // Set loading to true before starting the upload

    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "inventory"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false); // Set loading to false after the operation is done
    }
  };

  // Function to combine the value and unit into a single string
  const combineValueAndUnit = (value, unit) => {
    return value && unit ? `${value}${unit}` : "";
  };

  // Calculate Total Value based on Unit Price and Quantity
  const calculateTotalValue = () => {
    const unitPriceStr = newInventoryItem.Unit_Price;
    const unitPriceValue = parseFloat(unitPriceStr.replace(/[^\d.-]/g, "")); // Remove INR and parse as float
    const quantity = parseInt(newInventoryItem.Quantity, 10);
    return unitPriceValue * quantity;
  };

  // Update Total Value on each change to Unit Price or Quantity
  useEffect(() => {
    const totalValue = calculateTotalValue();
    setNewInventoryItem((prev) => ({
      ...prev,
      Total_Value: totalValue.toFixed(2),
    }));
  }, [newInventoryItem.Unit_Price, newInventoryItem.Quantity]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className=" text-white p-5 text-lg">
            <l-cardio size="50" stroke="4" speed="2" color="blue"></l-cardio>
          </div>
        </div>
      )}

      {/* New Inventory Modal */}
      <div
        className={`${
          isModalOpen ? "block" : "hidden"
        } fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 `}
      >
        <div className="bg-white p-6 rounded-lg w-full sm:w-full lg:w-3/4 xl:w-2/3 overflow-auto max-h-screen relative">
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Add New Inventory Item
          </h2>
          <form onSubmit={handleAddInventoryItem}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Input Fields */}
              {Object.keys(newInventoryItem).map((key, index) => {
                // Skip Total_Value, as it's calculated dynamically
                if (key === "Total_Value") return null;

                return (
                  <div key={key} className="flex flex-col">
                    <label
                      htmlFor={key}
                      className="font-medium text-sm text-gray-700 block mb-1"
                    >
                      {key.replace("_", " ").toUpperCase()}
                    </label>

                    {key === "Dose" ? (
                      <div className="flex space-x-4">
                        <input
                          id="Dose_Value"
                          name="Dose_Value"
                          type="number"
                          value={newInventoryItem.Dose.split(/[a-zA-Z]+/)[0]} // Extract numeric part
                          onChange={(e) => {
                            const value = e.target.value;
                            const unit = newInventoryItem.Dose.split(/\d+/)[1]; // Get current unit
                            setNewInventoryItem((prev) => ({
                              ...prev,
                              Dose: combineValueAndUnit(value, unit),
                            }));
                          }}
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                        <select
                          id="Dose_Unit"
                          name="Dose_Unit"
                          value={newInventoryItem.Dose.split(/\d+/)[1]} // Extract unit part
                          onChange={(e) => {
                            const value = newInventoryItem.Dose.split(/\d+/)[0]; // Get current value
                            const unit = e.target.value;
                            setNewInventoryItem((prev) => ({
                              ...prev,
                              Dose: combineValueAndUnit(value, unit),
                            }));
                          }}
                          className="p-2 border border-gray-300 rounded-lg w-full z-60" // Added z-index
                        >
                          <option value="per gm">per gm</option>
                          <option value="per mg">per mg</option>
                          <option value="per mcg">per mcg</option>
                          <option value="per ml">per ml</option>
                          <option value="per IU">per IU</option>
                          <option value="per tablet">per tablet</option>
                          <option value="per capsule">per capsule</option>
                          <option value="other">Other (Custom)</option>
                        </select>
                        {newInventoryItem.Dose.split(/\d+/)[1] === "other" && (
                          <input
                            type="text"
                            value={newInventoryItem.Dose_Unit}
                            onChange={(e) => {
                              setNewInventoryItem((prev) => ({
                                ...prev,
                                Dose_Unit: e.target.value,
                              }));
                            }}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                            placeholder="Enter custom unit"
                          />
                        )}
                      </div>
                    ) : key === "Unit_Price" ? (
                      <input
                        id="Unit_Price"
                        name="Unit_Price"
                        type="number"
                        value={newInventoryItem.Unit_Price}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewInventoryItem((prev) => ({
                            ...prev,
                            Unit_Price: value,
                          }));
                        }}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    ) : key === "Quantity" ? (
                      <div className="flex space-x-4">
                        <input
                          id={key}
                          name={key}
                          type="number"
                          value={newInventoryItem[key]}
                          onChange={handleInventoryInputChange}
                          className="p-2 border border-gray-300 rounded-lg w-full"
                          min="1"
                        />
                        <select
                          id="Quantity_Unit"
                          name="Quantity_Unit"
                          value={newInventoryItem.Quantity_Unit}
                          onChange={(e) => {
                            const quantityUnit = e.target.value;
                            setNewInventoryItem((prev) => ({
                              ...prev,
                              Quantity_Unit: quantityUnit,
                            }));
                          }}
                          className="p-2 border border-gray-300 rounded-lg w-full z-60" // Added z-index
                        >
                          <option value="Tablets">Tablets</option>
                          <option value="Capsules">Capsules</option>
                          <option value="Vials">Vials</option>
                          <option value="Grams">Grams</option>
                          <option value="Milliliters">Milliliters</option>
                          <option value="Units">Units</option>
                          <option value="other">Other (Custom)</option>
                        </select>
                        {newInventoryItem.Quantity_Unit === "other" && (
                          <input
                            type="text"
                            value={newInventoryItem.Quantity_Unit_Custom}
                            onChange={(e) => {
                              setNewInventoryItem((prev) => ({
                                ...prev,
                                Quantity_Unit_Custom: e.target.value,
                              }));
                            }}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                            placeholder="Enter custom unit"
                          />
                        )}
                      </div>
                    ) : key === "Drug_Category" ? (
                      <select
                        id={key}
                        name={key}
                        value={newInventoryItem[key]}
                        onChange={handleInventoryInputChange}
                        className="p-2 border border-gray-300 rounded-lg w-full z-60" // Added z-index
                      >
                        <option value="">Select Category</option>
                        <option value="Antibiotics">Antibiotics</option>
                        <option value="Analgesics">Analgesics</option>
                        <option value="Antipyretics">Antipyretics</option>
                        <option value="Vaccines">Vaccines</option>
                        <option value="Antifungals">Antifungals</option>
                        <option value="Vitamins">Vitamins</option>
                        <option value="Hormones">Hormones</option>
                        <option value="other">Other (Custom)</option>
                      </select>
                    ) : key === "Drug_Status" ? (
                      <select
                        id={key}
                        name={key}
                        value={newInventoryItem[key]}
                        onChange={handleInventoryInputChange}
                        className="p-2 border border-gray-300 rounded-lg w-full z-60" // Added z-index
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Expired">Expired</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Backordered">Backordered</option>
                        <option value="other">Other (Custom)</option>
                      </select>
                    ) : key === "Storage_Conditions" ? (
                      <select
                        id={key}
                        name={key}
                        value={newInventoryItem[key]}
                        onChange={handleInventoryInputChange}
                        className="p-2 border border-gray-300 rounded-lg w-full z-60" // Added z-index
                      >
                        <option value="Room Temperature">
                          Room Temperature
                        </option>
                        <option value="Refrigerated">
                          Refrigerated (2-8°C)
                        </option>
                        <option value="Frozen">Frozen (-20°C or below)</option>
                        <option value="Dry Storage">
                          Desiccated (Dry Storage)
                        </option>
                        <option value="Controlled">
                          Controlled Room Temperature (15-25°C)
                        </option>
                        <option value="Light Sensitive">Light Sensitive</option>
                        <option value="Flammable">Flammable Storage</option>
                        <option value="other">Other (Custom)</option>
                      </select>
                    ) : (
                      <input
                        id={key}
                        name={key}
                        type="text"
                        value={newInventoryItem[key]}
                        onChange={handleInventoryInputChange}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                        required
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-5 mt-6">
              <button
                type="submit"
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Modal for inventory*/}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Edit Inventory Item</h2>
            <form onSubmit={handleUpdate}>
              {/* Grid layout for inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(formData).map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">
                      {key.replace(/_/g, " ")}:
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
              {/* Buttons */}
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div class="w-screen px-44 py-10 flex flex-col ">
        <div class="flex justify-start items-center space-x-10">
          {/* <div
            className="mb-20 px-12 py-4 space-x-4 flex justify-center items-center  shadow-2xl rounded-xl bg-gray-800 hover:cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
          >
            <h1 className={`${poppins.className} text-center text-lg font-semibold text-gray-200`}>
              Download Inventory CSV
            </h1>
            <img src="/download.png" alt="download" className='w-7 h-7' />
          </div> */}
          <CsvExport2 data={drugConsumption} fileName="drugConsumption.csv" />
          <CsvExport3 data={inventoryObj} fileName="inventory.csv" />
        </div>

        <div class="flex justify-center items-center space-x-10 ">
          {/* <div class="flex justify-center items-center w-2/3">
            <ChartComponent />
          </div>
          <div class="flex justify-center items-center w-1/3">
            <RadialChart />
          </div> */}

          <AdminDashboardComponent />
        </div>

        <div class="flex justify-center items-center mt-20 space-x-10 ">
          <div class="flex justify-center items-center w-2/4">
            <ComplianceChart />
          </div>
          <div class="flex justify-center items-center w-2/4">
            <ShipmentDelayChart />
          </div>

          <div class="flex justify-center items-center w-2/4">
            <QualityChart />
          </div>
        </div>

        <div class="flex justify-end items-center">
          <Basic />
        </div>

        <div className="flex justify-between items-center mt-20">
          <h1 className={`${poppins.className} text-4xl font-bold `}>
            Inventory
          </h1>
        </div>

        <div className="mt-5 mb-5 flex justify-between items-center">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by Drug Name or ID"
            className="px-4 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setSearchQuery(e.target.value)} // You need to create a state `searchQuery`
          />

          {/* Filter Dropdowns */}
          <div className="flex space-x-5">
            <select
              onChange={(e) => setFilterByManufacturer(e.target.value)} // Filter by Manufacturer
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Filter by Manufacturer</option>
              {manufacturerOptions.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => setFilterByLocation(e.target.value)} // Filter by Location
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Filter by Location</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${poppins.className} overflow-x-auto`}>
          <table className="min-w-full table-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold text-sm uppercase">
                <th className="px-6 py-3 text-center">#</th>
                <th className="px-6 py-3">Drug ID</th>
                <th className="px-6 py-3">Drug Name</th>
                <th className="px-6 py-3">Brand Name</th>
                <th className="px-6 py-3">Chemical Composition</th>
                <th className="px-6 py-3">Dose</th>
                <th className="px-6 py-3">Form</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Manufacturer</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Batch No</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3">Reorder Level</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3">Unit Price</th>
                <th className="px-6 py-3">Storage Condition</th>
                <th className="px-6 py-3">Supplier Contact</th>
                <th className="px-6 py-3">Shipment Status</th>
                <th className="px-6 py-3">Remarks</th>
                <th className="px-6 py-3">Total Value</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryObj
                .filter(
                  (item) =>
                    item.Drug_Name?.toLowerCase().includes(
                      searchQuery?.toLowerCase()
                    ) ||
                    item.Drug_ID?.toLowerCase().includes(
                      searchQuery?.toLowerCase()
                    )
                )
                .filter((item) =>
                  filterByManufacturer
                    ? item.Manufacturer === filterByManufacturer
                    : true
                )
                .filter((item) =>
                  filterByLocation ? item.Location === filterByLocation : true
                )
                .map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-6 py-3 text-center">{index + 1}</td>
                    <td className="px-6 py-3">{item.Drug_ID}</td>
                    <td className="px-6 py-3">{item.Drug_Name}</td>
                    <td className="px-6 py-3">{item.Brand_Name}</td>
                    <td className="px-6 py-3">{item.Chemical_Composition}</td>
                    <td className="px-6 py-3">{item.Dose}</td>
                    <td className="px-6 py-3">{item.Form}</td>
                    <td className="px-6 py-3">{item.Quantity}</td>
                    <td className="px-6 py-3">{item.Manufacturer}</td>
                    <td className="px-6 py-3">{item.Location}</td>
                    <td className="px-6 py-3">{item.Batch_No}</td>
                    <td className="px-6 py-3">{item.Expiry_Date}</td>
                    <td className="px-6 py-3">{item.Reorder_Level}</td>
                    <td className="px-6 py-3">{item.Last_Updated}</td>
                    <td className="px-6 py-3">{item.Unit_Price}</td>
                    <td className="px-6 py-3">{item.Storage_Condition}</td>
                    <td className="px-6 py-3">{item.Supplier_Contact}</td>
                    <td className="px-6 py-3">{item.Shipment_Status}</td>
                    <td className="px-6 py-3">{item.Remarks}</td>
                    <td className="px-6 py-3">{item.Total_Value}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => openEditModal(item.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md ml-2 hover:bg-red-600 transition duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-start space-y-10 w-screen">
          <h1 className={`${raleway.className} text-3xl font-bold mt-10`}>
            Upload CSV
          </h1>
          <input type="file" accept=".csv" onChange={handleFileUpload} />

          <div className={`${inter.className} relative overflow-x-auto mt-10`}>
            <table className="min-w-full text-sm text-left">
              <thead className="text-sm border border-gray-800">
                <tr>
                  <th scope="col" className="px-2 py-2">
                    Sr. No.
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Drug ID
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Drug Name
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Brand Name
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Chemical Composition
                  </th>

                  <th scope="col" className="px-2 py-2">
                    Dose
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Form
                  </th>

                  <th scope="col" className="px-2 py-2">
                    Quantity
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Manufacturer
                  </th>

                  <th scope="col" className="px-2 py-2">
                    Location
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Batch No.
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Expiry Date
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Reorder Level
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Last Updated
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Unit Price
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Storage Condition
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Supplier Contact
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Shipment Status
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Remarks
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {CSVData.map((item, index) => (
                  <tr key={index} className="border border-gray-800">
                    <th
                      scope="row"
                      className="px-2 py-2 text-center font-medium whitespace-nowrap"
                    >
                      <h1>{index + 1}</h1>
                    </th>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Drug_ID}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Drug_Name}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Brand_Name}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">
                        {item.Chemical_Composition}
                      </h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Dose}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Form}</h1>
                    </td>

                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Quantity}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Manufacturer}</h1>
                    </td>

                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Location}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Batch_No}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Expiry_Date}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Reorder_Level}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Last_Updated}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Unit_Price}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">
                        {item.Storage_Condition}
                      </h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Supplier_Contact}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Shipment_Status}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Remarks}</h1>
                    </td>
                    <td className="px-2 py-2">
                      <h1 className="truncate w-32">{item.Total_Value}</h1>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end w-full max-w-6xl mx-auto">
            <div
              onClick={submitToFirebase}
              className="relative cursor-pointer w-96 inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border border-gray-800 rounded-full hover:text-white group hover:bg-gray-600"
            >
              {/* Background hover animation */}
              <span className="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>

              {/* Right-side icon hover animation */}
              <span className="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>

              {/* Text inside the button */}
              <span className="relative">Submit</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Middle;
