"use client";
import React, { useEffect, useState } from "react";
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
import InstituteDrugConsumptionChart from "./InstituteDrugConsumptionChart";
import InstituteRadial from "./InstituteRadial";
import SupplierSales from "./SupplierSales";
import SupplierPie from "./SupplierPie";
import CsvExport4 from "../CsvExport4";

const raleway = Raleway({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "700"],
  subsets: ["latin"],
});

function SupplierMiddle() {
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

  const [inventoryObj, setInventoryObj] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByManufacturer, setFilterByManufacturer] = useState("");
  const [filterByLocation, setFilterByLocation] = useState("");
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

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
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "inventory"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  

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
      {itemModal && (
        <div
          className={`${poppins.className} fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80 `}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow ">
            <div class="relative bg-white rounded-lg shadow ">
              <div class="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 class="text-xl font-semibold text-gray-900 ">
                  Create New Item
                </h3>
                <button
                  onClick={() => setItemModal(null)}
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center "
                  data-modal-hide="default-modal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div className="flex flex-col space-y-5 mb-20  mx-12 my-5">
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Item Name
                </h1>
                <input
                  onChange={(e) => setItem(e.target.value)}
                  value={item}
                  type="text"
                  placeholder="Marker"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Stock
                </h1>
                <input
                  onChange={(e) => setStock(e.target.value)}
                  value={stock}
                  type="number"
                  placeholder="200"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />

                <div
                  type="submit"
                  onClick={() => createItem()}
                  class=" cursor-pointer w-96 relative inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-600"
                >
                  <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                  <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                  <span class="relative">Submit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {departmentModal && (
        <div
          className={`${poppins.className} fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80 `}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow ">
            <div class="relative bg-white rounded-lg shadow ">
              <div class="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 class="text-xl font-semibold text-gray-900 ">
                  Create New Department
                </h3>
                <button
                  onClick={() => setDepartmentModal(null)}
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center "
                  data-modal-hide="default-modal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div className="flex flex-col space-y-5 mb-20  mx-12 my-5">
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Department Name
                </h1>
                <input
                  onChange={(e) => setDepartmentName(e.target.value)}
                  value={departmentName}
                  type="text"
                  placeholder="CE"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />

                <div
                  type="submit"
                  onClick={() => createDepartment()}
                  class=" cursor-pointer w-96 relative inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-600"
                >
                  <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                  <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                  <span class="relative">Submit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editModal && (
        <div
          className={`${poppins.className} fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80 `}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow ">
            <div class="relative bg-white rounded-lg shadow ">
              <div class="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 class="text-xl font-semibold text-gray-900 ">Edit Modal</h3>
                <button
                  onClick={() => setDepartmentModal(null)}
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center "
                  data-modal-hide="default-modal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div className="flex flex-col space-y-5 mb-20  mx-12 my-5">
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Department Name
                </h1>
                <input
                  onChange={(e) => setDepartmentName(e.target.value)}
                  value={departmentName}
                  type="text"
                  placeholder="Computer Science"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />
                <div
                  type="submit"
                  onClick={() => createDepartment()}
                  class=" cursor-pointer w-96 relative inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-600"
                >
                  <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                  <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                  <span class="relative">Submit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editItem && (
        <div
          className={`${poppins.className} fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80 `}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow ">
            <div class="relative bg-white rounded-lg shadow ">
              <div class="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 class="text-xl font-semibold text-gray-900 ">Edit Item</h3>
                <button
                  onClick={() => setEditItem(null)}
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center "
                  data-modal-hide="default-modal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div className="flex flex-col space-y-5 mb-20  mx-12 my-5">
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Item Name
                </h1>
                <input
                  onChange={(e) => setItem(e.target.value)}
                  value={item}
                  type="text"
                  placeholder="Marker"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Stock
                </h1>
                <input
                  onChange={(e) => setStock(e.target.value)}
                  value={stock}
                  type="number"
                  placeholder="200"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />
                <div
                  type="submit"
                  onClick={() => editItemSubmit(editItem)}
                  class=" cursor-pointer w-96 relative inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-600"
                >
                  <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                  <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                  <span class="relative">Submit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editDept && (
        <div
          className={`${poppins.className} fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80 `}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow ">
            <div class="relative bg-white rounded-lg shadow ">
              <div class="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 class="text-xl font-semibold text-gray-900 ">
                  Edit Department
                </h3>
                <button
                  onClick={() => setEditDept(null)}
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center "
                  data-modal-hide="default-modal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div className="flex flex-col space-y-5 mb-20  mx-12 my-5">
                <h1 className={`${poppins.className} text-lg font-medium`}>
                  Enter Department Name
                </h1>
                <input
                  onChange={(e) => setDepartmentName(e.target.value)}
                  value={departmentName}
                  type="text"
                  placeholder="CE"
                  className="placeholder:text-gray-500  px-5 py-2 outline-none border border-gray-800 w-96"
                />

                <div
                  type="submit"
                  onClick={() => updateDept(editDept)}
                  class=" cursor-pointer w-96 relative inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-600"
                >
                  <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                  <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                  <span class="relative">Submit</span>
                </div>
              </div>
            </div>
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
          <CsvExport4 data={drugConsumption} fileName="drugConsumption.csv" />
          <CsvExport3 data={inventoryObj} fileName="inventory.csv" />
        </div>



        <div class="flex justify-center items-center mt-10 space-x-10 ">
          <div class="flex justify-center items-center w-2/4">
            <SupplierPie />
          </div>
          <div class="flex justify-center items-center w-2/4">
            <ShipmentDelayChart />
          </div>

          <div class="flex justify-center items-center w-2/3">
            <SupplierSales />
          </div>
        </div>

        <div class="flex justify-between items-center mt-20">
          <h1 class={`${poppins.className} text-4xl font-bold `}>Inventory</h1>
          <div class="flex justify-center items-center space-x-5">
            <div
              onClick={() => {
                setItemModal(true);
                setDepartmentModal(false);
              }}
              className="flex justify-center items-center px-5 py-2 border border-gray-300 transition hover:ease-in hover:bg-gray-100  shadow-md rounded-lg cursor-pointer"
            >
              <h1 class={`${poppins.className} text-md  `}>Create New Item</h1>
            </div>
          </div>
        </div>

        {/* List of boxes */}
        {/* <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 py-14">
          {inventoryObj.map((item) => (
            <div
              key={item.id}
              class="flex flex-col justify-center border border-gray-300 shadow-md min-w-[250px] h-[300px] px-5 py-4 rounded-lg"
            >
              <h1 class="text-xl font-bold mb-2">{item.DrugName}</h1>
              <h2 class="text-md font-medium mb-1">
                Location: {item.Location}
              </h2>
              <p class="text-sm mb-1">Address: {item.Address}</p>
              <p class="text-sm mb-1">City: {item.City}</p>
              <p class="text-sm mb-1">Supplier: {item.Supplier}</p>
              <p class="text-sm mb-1">Quantity: {item.Quantity}</p>
              <p class="text-sm mb-1">
                Unit Price: ${item.UnitPrice}
              </p>
              <p class="text-sm mb-1">
                Expiration Date:{" "}
                {item.ExpirationDate}
              </p>
              <p class="text-sm mb-1">Reorder Level: {item.ReorderLevel}</p>

              <div className="flex justify-end items-end space-x-2 mt-4">
                <div class="cursor-pointer" onClick={() => handleEdit(item)}>
                  <img src="/edit.png" alt="edit" className="w-7 h-7" />
                </div>
                <div class="cursor-pointer" onClick={() => handleDelete(item)}>
                  <img src="/delete.png" alt="delete" className="w-7 h-7" />
                </div>
              </div>
            </div>
          ))}
        </div> */}
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
        <div className="rounded-md border border-gray-300 shadow-lg overflow-hidden">
  <table className="min-w-full bg-white border-collapse">
    <thead>
      <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <th className="px-4 py-2 text-center">#</th>
        <th className="px-4 py-2">Drug ID</th>
        <th className="px-4 py-2">Drug Name</th>
        <th className="px-4 py-2">Brand Name</th>
        <th className="px-4 py-2">Chemical Composition</th>
        <th className="px-4 py-2">Dose</th>
        <th className="px-4 py-2">Form</th>
        <th className="px-4 py-2">Quantity</th>
        <th className="px-4 py-2">Manufacturer</th>
        <th className="px-4 py-2">Location</th>
        <th className="px-4 py-2">Batch No</th>
        <th className="px-4 py-2">Expiry Date</th>
        <th className="px-4 py-2">Reorder Level</th>
        <th className="px-4 py-2">Last Updated</th>
        <th className="px-4 py-2">Unit Price</th>
        <th className="px-4 py-2">Storage Condition</th>
        <th className="px-4 py-2">Supplier Contact</th>
        <th className="px-4 py-2">Shipment Status</th>
        <th className="px-4 py-2">Remarks</th>
        <th className="px-4 py-2">Total Value</th>
        <th className="px-4 py-2 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {inventoryObj
        .filter(
          (item) =>
            item.Drug_Name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            item.Drug_ID?.toLowerCase().includes(searchQuery?.toLowerCase())
        )
        .filter((item) =>
          filterByManufacturer ? item.Manufacturer === filterByManufacturer : true
        )
        .filter((item) => (filterByLocation ? item.Location === filterByLocation : true))
        .map((item, index) => (
          <tr
            key={item.id}
            className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <td className="px-4 py-2 text-center">{index + 1}</td>
            <td className="px-4 py-2">{item.Drug_ID}</td>
            <td className="px-4 py-2">{item.Drug_Name}</td>
            <td className="px-4 py-2">{item.Brand_Name}</td>
            <td className="px-4 py-2">{item.Chemical_Composition}</td>
            <td className="px-4 py-2">{item.Dose}</td>
            <td className="px-4 py-2">{item.Form}</td>
            <td className="px-4 py-2">{item.Quantity}</td>
            <td className="px-4 py-2">{item.Manufacturer}</td>
            <td className="px-4 py-2">{item.Location}</td>
            <td className="px-4 py-2">{item.Batch_No}</td>
            <td className="px-4 py-2">{item.Expiry_Date}</td>
            <td className="px-4 py-2">{item.Reorder_Level}</td>
            <td className="px-4 py-2">{item.Last_Updated}</td>
            <td className="px-4 py-2">{item.Unit_Price}</td>
            <td className="px-4 py-2">{item.Storage_Condition}</td>
            <td className="px-4 py-2">{item.Supplier_Contact}</td>
            <td className="px-4 py-2">{item.Shipment_Status}</td>
            <td className="px-4 py-2">{item.Remarks}</td>
            <td className="px-4 py-2">{item.Total_Value}</td>
            <td className="px-4 py-2 text-center">
              {/* Edit Button */}
              <button
                onClick={() => openEditModal(item.id)}
                className="text-blue-500 px-2 py-1"
              >
                Edit
              </button>
              {/* Delete Button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 px-2 py-1 ml-2"
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
  <table className="min-w-full text-sm text-left border-collapse">
    <thead className="text-sm bg-gradient-to-r from-blue-500 to-blue-700 text-white">
      <tr>
        <th scope="col" className="px-4 py-2">Sr. No.</th>
        <th scope="col" className="px-4 py-2">Drug ID</th>
        <th scope="col" className="px-4 py-2">Drug Name</th>
        <th scope="col" className="px-4 py-2">Brand Name</th>
        <th scope="col" className="px-4 py-2">Chemical Composition</th>
        <th scope="col" className="px-4 py-2">Dose</th>
        <th scope="col" className="px-4 py-2">Form</th>
        <th scope="col" className="px-4 py-2">Quantity</th>
        <th scope="col" className="px-4 py-2">Manufacturer</th>
        <th scope="col" className="px-4 py-2">Location</th>
        <th scope="col" className="px-4 py-2">Batch No.</th>
        <th scope="col" className="px-4 py-2">Expiry Date</th>
        <th scope="col" className="px-4 py-2">Reorder Level</th>
        <th scope="col" className="px-4 py-2">Last Updated</th>
        <th scope="col" className="px-4 py-2">Unit Price</th>
        <th scope="col" className="px-4 py-2">Storage Condition</th>
        <th scope="col" className="px-4 py-2">Supplier Contact</th>
        <th scope="col" className="px-4 py-2">Shipment Status</th>
        <th scope="col" className="px-4 py-2">Remarks</th>
        <th scope="col" className="px-4 py-2">Total Value</th>
      </tr>
    </thead>
    <tbody>
      {CSVData.map((item, index) => (
        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
          <td className="px-4 py-2 text-center">{index + 1}</td>
          <td className="px-4 py-2 truncate w-32">{item.Drug_ID}</td>
          <td className="px-4 py-2 truncate w-32">{item.Drug_Name}</td>
          <td className="px-4 py-2 truncate w-32">{item.Brand_Name}</td>
          <td className="px-4 py-2 truncate w-32">{item.Chemical_Composition}</td>
          <td className="px-4 py-2 truncate w-32">{item.Dose}</td>
          <td className="px-4 py-2 truncate w-32">{item.Form}</td>
          <td className="px-4 py-2 truncate w-32">{item.Quantity}</td>
          <td className="px-4 py-2 truncate w-32">{item.Manufacturer}</td>
          <td className="px-4 py-2 truncate w-32">{item.Location}</td>
          <td className="px-4 py-2 truncate w-32">{item.Batch_No}</td>
          <td className="px-4 py-2 truncate w-32">{item.Expiry_Date}</td>
          <td className="px-4 py-2 truncate w-32">{item.Reorder_Level}</td>
          <td className="px-4 py-2 truncate w-32">{item.Last_Updated}</td>
          <td className="px-4 py-2 truncate w-32">{item.Unit_Price}</td>
          <td className="px-4 py-2 truncate w-32">{item.Storage_Condition}</td>
          <td className="px-4 py-2 truncate w-32">{item.Supplier_Contact}</td>
          <td className="px-4 py-2 truncate w-32">{item.Shipment_Status}</td>
          <td className="px-4 py-2 truncate w-32">{item.Remarks}</td>
          <td className="px-4 py-2 truncate w-32">{item.Total_Value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


          <div class="flex justify-end">
            <div
              type="submit"
              onClick={submitToFirebase}
              class=" cursor-pointer w-96 relative inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border border-gray-800 rounded-full hover:text-white group hover:bg-gray-600"
            >
              <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
              <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span class="relative">Submit</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SupplierMiddle;
