"use client";
import React, { useEffect, useState } from "react";

import "ldrs/ring";
import { zoomies } from "ldrs";
import toast, { Toaster } from "react-hot-toast";

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
  query,
  updateDoc,
  where,
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
import DeliveryStatsDashboard from "./DeliveryStatsDashboard";
import InstituteAdminPanelChart from "./InstituteAdminPanelChart";

const raleway = Raleway({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const data_ = [
  {
    drug_id: "D001",
    drug_name: "Paracetamol",
    quantity: 150,
    temperature: "22°C",
    usage_reasons: "Fever, Pain Relief",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D002",
    drug_name: "Amoxicillin",
    quantity: 75,
    temperature: "20°C",
    usage_reasons: "Bacterial Infections",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D003",
    drug_name: "Ibuprofen",
    quantity: 200,
    temperature: "25°C",
    usage_reasons: "Inflammation, Pain Relief",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D004",
    drug_name: "Ciprofloxacin",
    quantity: 50,
    temperature: "18°C",
    usage_reasons: "Urinary Tract Infections",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D005",
    drug_name: "Metformin",
    quantity: 120,
    temperature: "22°C",
    usage_reasons: "Type 2 Diabetes",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D006",
    drug_name: "Lisinopril",
    quantity: 90,
    temperature: "21°C",
    usage_reasons: "High Blood Pressure",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D007",
    drug_name: "Omeprazole",
    quantity: 200,
    temperature: "24°C",
    usage_reasons: "Acid Reflux, Heartburn",
    timestamp: new Date().toISOString(),
  },
  {
    drug_id: "D008",
    drug_name: "Aspirin",
    quantity: 300,
    temperature: "22°C",
    usage_reasons: "Pain Relief, Blood Thinner",
    timestamp: new Date().toISOString(),
  },
];

const inter = Inter({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const barcodeId = {
  Drug_ID: "CAN0011",
  Drug_Name: "Levothyroxine",
  Brand_Name: "Metrogyl",
  Dose: "50mcg",
  Form: "TABLET",
  Chemical_Composition: "Levothyroxine Sodium",
  Quantity: 100,
  Manufacturer: "Glenmark",
  Location: "Village Clinic",
  Batch_No: "B74987",
  Expiry_Date: "18-09-2025",
  Reorder_Level: 194,
  Last_Updated: "08-11-2024",
  Unit_Price: 110.52,
  Storage_Condition: "Refrigerated",
  Supplier_Contact: "8631282534",
  Shipment_Status: "Pending",
  Remarks: "Damaged Stock",
  Total_Value: 212087.88,
};

function LabMiddle() {
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
  const [loading, setLoading] = useState(false);
  const [CSVData, setCSVData] = useState([]);
  const [activeButton, setActiveButton] = useState("showInventory");
  const [barcode, setBarcode] = useState();

  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value);
  };

  async function barcodeSubmit() {
    try {
      // Query the inventory to check if the Drug_ID already exists
      const querySnapshot = await getDocs(
        query(
          collection(db, "inventory"),
          where("Drug_ID", "==", barcodeId.Drug_ID)
        )
      );

      if (!querySnapshot.empty) {
        // If the Drug_ID exists, show an error and return
        toast.error("Drug ID already exists in the inventory");
        return;
      }

      const docRef = await addDoc(collection(db, "inventory"), {
        Drug_ID: barcodeId.Drug_ID,
        Drug_Name: barcodeId.Drug_Name,
        Chemical_Composition: barcodeId.Chemical_Composition,
        Brand_Name: barcodeId.Brand_Name,
        Dose: barcodeId.Dose,
        Form: barcodeId.Form,
        Quantity: barcodeId.Quantity,
        Manufacturer: barcodeId.Manufacturer,
        Location: barcodeId.Location,
        Batch_No: barcodeId.Batch_No,
        Expiry_Date: barcodeId.Expiry_Date,
        Reorder_Level: barcodeId.Reorder_Level,
        Last_Updated: barcodeId.Last_Updated,
        Unit_Price: barcodeId.Unit_Price,
        Storage_Condition: barcodeId.Storage_Condition,
        Supplier_Contact: barcodeId.Supplier_Contact,
        Shipment_Status: barcodeId.Shipment_Status,
        Remarks: barcodeId.Remarks,
        Total_Value: barcodeId.Total_Value,
      });

      if (docRef.id) {
        toast.success("Submitted Successfully");
      }
    } catch (error) {
      // Handle any errors that might occur
      toast.error(
        "An error occurred while submitting the data: " + error.message
      );
    }
  }

  const handleReorderLevelChange = async (id, newReorderLevel) => {
    try {
      // Get a reference to the Firestore document
      const itemDocRef = doc(db, "inventory", id); // Assuming 'inventory' is the collection name

      // Update the reorder level in Firestore
      await updateDoc(itemDocRef, {
        Reorder_Level: newReorderLevel,
      });

      // Optionally, update local state if you're maintaining the state for immediate UI updates
      setInventoryObj((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, Reorder_Level: newReorderLevel } : item
        )
      );
    } catch (error) {
      console.error("Error updating reorder level in Firestore: ", error);
    }
  };

  const [drugData, setDrugData] = useState([]);
  const [loading_, setLoading_] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/drug-storage");
        const data = await response.json();
        setDrugData(data);
        console.log(drug);
        setLoading_(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading_(false);
      }
    };

    fetchData();
  }, []);

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
              Chemical_Composition: doc.data().Chemical_Composition,
              Dose: doc.data().Dose,
              Form: doc.data().Form,
              Brand_Name: doc.data().Brand_Name,
              Manufacturer: doc.data().Manufacturer,
              Quantity: doc.data().Quantity,
              Location: doc.data().Location,
              Batch_No: doc.data().Batch_No,
              Expiry_Date: doc.data().Expiry_Date,
              Reorder_Level: doc.data().Reorder_Level,
              Last_Updated: doc.data().Last_Updated, // Assuming this field exists
              Unit_Price: doc.data().Unit_Price,
              Storage_Condition: doc.data().Storage_Condition, // Assuming this field exists
              Supplier_Contact: doc.data().Supplier_Contact, // Assuming this field exists
              Shipment_Status: doc.data().Shipment_Status, // Assuming this field exists
              Remarks: doc.data().Remarks, // Assuming this field exists
              Total_Value: doc.data().Total_Value, // Assuming this field exists
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

  const filterByExpiryDate = (item) => {
    const currentDate = new Date(); // Get the current date

    // Ensure Expiry_Date is in dd/mm/yyyy format
    const expiryDateParts = item.Expiry_Date.split("-"); // Split the date into [dd, mm, yyyy]

    // Parse the date into a valid Date object (using yyyy-mm-dd format for JavaScript)
    const expiryDate = new Date(
      parseInt(expiryDateParts[2]), // year
      parseInt(expiryDateParts[1]) - 1, // month (JavaScript months are 0-indexed)
      parseInt(expiryDateParts[0]) // day
    );

    // Log the comparison for debugging purposes
    console.log(`Expiry Date: ${expiryDate}, Current Date: ${currentDate}`);

    // Return true if the expiry date is in the future, false otherwise
    return expiryDate < currentDate;
  };

  // Function to open the modal with the item data
  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      Drug_ID: item.Drug_ID,
      Drug_Name: item.Drug_Name,
      Dose: item.Dose,
      Brand_Name: item.Brand_Name,
      Manufacturer: item.Manufacturer,
      Quantity: item.Quantity,
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
    Dose: "",
    Brand_Name: "",
    Manufacturer: "",
    Quantity: "",
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
        Dose: "",
        Brand_Name: "",
        Manufacturer: "",
        Quantity: "",
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
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "inventory"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <Toaster />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 ">
          <div className=" text-white p-5 text-lg">
            <l-cardio size="50" stroke="4" speed="2" color="blue"></l-cardio>
          </div>
        </div>
      )}

      {/* New Inventory Modal */}
      <div
        className={`${
          isModalOpen ? "block" : "hidden"
        } fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}
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

        <InstituteAdminPanelChart />

        {/* </div> */}

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

        <div className="flex flex-col justify-start items-start">
          <div className="flex flex-col justify-start space-y-10 w-screen">
            <h1 className={`${raleway.className} text-3xl font-bold mt-10`}>
              Barcode Scanner
            </h1>
          </div>

          <div>
            <input
              type="text"
              value={barcode}
              onChange={handleBarcodeChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />

            <div className="flex justify-end w-full max-w-6xl mx-auto mt-4">
              <div
                onClick={barcodeSubmit}
                className="relative cursor-pointer w-96 inline-flex items-center px-12 py-2 overflow-hidden text-lg font-medium text-black border border-gray-800 rounded-full hover:text-white group hover:bg-gray-600"
              >
                <span className="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>

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

                <span className="relative">Submit</span>
              </div>
            </div>
          </div>
        </div>

        <DeliveryStatsDashboard />

        <div className="flex justify-start items-center mt-20 space-x-10 font-medium text-xl">
          <button
            className={`relative flex justify-center items-center border py-3 px-8 rounded-md overflow-hidden shadow-md transition-all duration-250 ${
              activeButton === "showInventory"
                ? "bg-gray-800 text-white"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveButton("showInventory")}
          >
            <h1 className={`${poppins.className}`}>Show Inventory</h1>
          </button>
          <button
            className={`relative flex justify-center items-center border py-3 px-8 rounded-md overflow-hidden shadow-md transition-all duration-250 ${
              activeButton === "setLimits"
                ? "bg-gray-800 text-white"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveButton("setLimits")}
          >
            <h1 className={`${poppins.className}`}>Set Limits on Inventory</h1>
          </button>
          <button
            className={`relative flex justify-center items-center border py-3 px-8 rounded-md overflow-hidden shadow-md transition-all duration-250 ${
              activeButton === "ExpiredDrugs"
                ? "bg-gray-800 text-white"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveButton("ExpiredDrugs")}
          >
            <h1 className={`${poppins.className}`}>View Expired Drugs</h1>
          </button>
        </div>

        {activeButton === "showInventory" && (
          <div>
            <div class="flex justify-between items-center mt-20">
              <h1 class={`${poppins.className} text-4xl font-bold `}>
                Inventory
              </h1>
              <div className="flex justify-center items-center space-x-5">
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="flex justify-center items-center px-5 py-2 border border-gray-300 transition hover:ease-in hover:bg-gray-100 shadow-md rounded-lg cursor-pointer"
                >
                  <h1 className={`${poppins.className} text-md  `}>
                    Add New Item
                  </h1>
                </div>
              </div>
            </div>

            <div className="relative overflow-x-auto shadow-md rounded-lg my-10">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
                    {[
                      "#",
                      "Drug ID",
                      "Drug Name",
                      "Brand Name",
                      "Chemical Composition",
                      "Dose",
                      "Form",
                      "Quantity",
                      "Manufacturer",
                      "Location",
                      "Batch No",
                      "Expiry Date",
                      "Reorder Level",
                      "Last Updated",
                      "Unit Price",
                      "Storage Condition",
                      "Supplier Contact",
                      "Shipment Status",
                      "Remarks",
                      "Total Value",
                      "Actions",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className={`px-4 py-3 font-semibold ${
                          header === "#" || header === "Actions"
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
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
                      filterByLocation
                        ? item.Location === filterByLocation
                        : true
                    )
                    .map((item, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="px-4 py-3 text-center">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Drug_ID}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Drug_Name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Brand_Name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Chemical_Composition}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Dose}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Form}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Quantity}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Manufacturer}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Location}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Batch_No}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Expiry_Date}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Reorder_Level}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Last_Updated}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Unit_Price}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Storage_Condition}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Supplier_Contact}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Shipment_Status}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Remarks}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Total_Value}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openEditModal(item.id)}
                            className="text-blue-500 hover:text-blue-700 font-medium px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 font-medium px-3 py-1 ml-2 rounded-md transition-colors duration-200"
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

              <div
                className={`${inter.className} relative overflow-x-auto mt-10 shadow-md rounded-lg`}
              >
                <table className="min-w-full text-sm text-left">
                  <thead className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
                    <tr>
                      {[
                        "Sr. No.",
                        "Drug ID",
                        "Drug Name",
                        "Brand Name",
                        "Dose",
                        "Form",
                        "Chemical Composition",
                        "Quantity",
                        "Manufacturer",
                        "Location",
                        "Batch No.",
                        "Expiry Date",
                        "Reorder Level",
                        "Last Updated",
                        "Unit Price",
                        "Storage Condition",
                        "Supplier Contact",
                        "Shipment Status",
                        "Remarks",
                        "Total Value",
                      ].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-4 py-3 font-semibold"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CSVData.map((item, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50 transition-all duration-200"
                      >
                        <th
                          scope="row"
                          className="px-4 py-3 text-center font-medium"
                        >
                          {index + 1}
                        </th>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Drug_ID}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Drug_Name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Brand_Name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Dose}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Form}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Chemical_Composition}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Quantity}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Manufacturer}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Location}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Batch_No}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Expiry_Date}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Reorder_Level}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Last_Updated}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Unit_Price}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Storage_Condition}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Supplier_Contact}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Shipment_Status}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">{item.Remarks}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate w-32">
                            {item.Total_Value}
                          </div>
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
        )}

        {activeButton === "setLimits" && (
          <div>
            <div className="flex justify-start items-center mt-20">
              <div className="overflow-x-auto">
                <div className="flex flex-col justify-center items-start ">
                  <h1
                    className={`${poppins.className} text-4xl font-bold mb-10 `}
                  >
                    Set Limits
                  </h1>

                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
                        {[
                          "#",
                          "Drug ID",
                          "Drug Name",
                          "Reorder Level",
                          "Max Stock Level",
                          "Min Stock Level",
                          "Critical Stock Alert Level",
                          "Expiry Buffer Period",
                          "Lead Time (Days)",
                        ].map((header, index) => (
                          <th
                            key={index}
                            className={`px-4 py-3 font-semibold ${
                              header === "#" ? "text-center" : "text-left"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
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
                          filterByLocation
                            ? item.Location === filterByLocation
                            : true
                        )
                        .map((item, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-4 py-3 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="truncate w-32">
                                {item.Drug_ID}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="truncate w-32">
                                {item.Drug_Name}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={item.Reorder_Level}
                                onChange={(e) =>
                                  handleReorderLevelChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={
                                  item.Max_Stock_Level ||
                                  Math.floor(Math.random() * 1000) + 500
                                }
                                onChange={(e) =>
                                  handleMaxStockLevelChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={
                                  item.Min_Stock_Level ||
                                  Math.floor(Math.random() * 100) + 50
                                }
                                onChange={(e) =>
                                  handleMinStockLevelChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={
                                  item.Critical_Stock_Alert_Level ||
                                  Math.floor(Math.random() * 50) + 10
                                }
                                onChange={(e) =>
                                  handleCriticalStockAlertLevelChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={
                                  item.Expiry_Buffer_Period ||
                                  Math.floor(Math.random() * 30) + 10
                                }
                                onChange={(e) =>
                                  handleExpiryBufferPeriodChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={
                                  item.Lead_Time ||
                                  Math.floor(Math.random() * 10) + 5
                                }
                                onChange={(e) =>
                                  handleLeadTimeChange(item.id, e.target.value)
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeButton === "ExpiredDrugs" && (
          <div>
            <div className="flex flex-col justify-center items-start mt-20">
              <h1 className={`${poppins.className} text-4xl font-bold mb-10 `}>
                Expired Drugs
              </h1>
              <div className="flex justify-center items-center w-full h-auto overflow-x-auto">
                {/* Make the table scrollable horizontally */}
                <div className="min-w-full">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
                        {[
                          "#",
                          "Drug ID",
                          "Drug Name",
                          "Dose",
                          "Form",
                          "Chemical Composition",
                          "Brand Name",
                          "Manufacturer",
                          "Location",
                          "Batch No",
                          "Expiry Date",
                          "Reorder Level",
                          "Last Updated",
                          "Unit Price",
                          "Storage Condition",
                          "Supplier Contact",
                          "Shipment Status",
                          "Remarks",
                          "Total Value",
                          "Actions",
                        ].map((header, index) => (
                          <th
                            key={index}
                            className={`px-4 py-3 font-semibold ${
                              header === "#" || header === "Actions"
                                ? "text-center"
                                : "text-left"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
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
                        .filter(filterByExpiryDate)
                        .map((item, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-4 py-3 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="truncate w-32">
                                {item.Drug_ID}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="truncate w-32">
                                {item.Drug_Name}
                              </div>
                            </td>
                            <td className="px-4 py-3">{item.Dose}</td>
                            <td className="px-4 py-3">{item.Form}</td>
                            <td className="px-4 py-3">
                              <div className="truncate w-40">
                                {item.Chemical_Composition}
                              </div>
                            </td>
                            <td className="px-4 py-3">{item.Brand_Name}</td>
                            <td className="px-4 py-3">{item.Manufacturer}</td>
                            <td className="px-4 py-3">{item.Location}</td>
                            <td className="px-4 py-3">{item.Batch_No}</td>
                            <td className="px-4 py-3">{item.Expiry_Date}</td>
                            <td className="px-4 py-3">{item.Reorder_Level}</td>
                            <td className="px-4 py-3">{item.Last_Updated}</td>
                            <td className="px-4 py-3">{item.Unit_Price}</td>
                            <td className="px-4 py-3">
                              {item.Storage_Condition}
                            </td>
                            <td className="px-4 py-3">
                              {item.Supplier_Contact}
                            </td>
                            <td className="px-4 py-3">
                              {item.Shipment_Status}
                            </td>
                            <td className="px-4 py-3">
                              <div className="truncate w-32">
                                {item.Remarks}
                              </div>
                            </td>
                            <td className="px-4 py-3">{item.Total_Value}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openEditModal(item.id)}
                                className=" text-blue-500 px-3 py-1 rounded-md  transition-colors duration-200 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-500 px-3 py-1 rounded-md  transition-colors duration-200 ml-2 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default LabMiddle;
