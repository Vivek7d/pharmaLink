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

const raleway = Raleway({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "700"],
  subsets: ["latin"],
});

function ManufacturerMiddle() {
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

  useEffect(() => {
    if (!fetch) {
      const fetchInventory = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "inventory"));
          const fetchedInventory = [];

          querySnapshot.forEach((doc) => {
            fetchedInventory.push({
              id: doc.id,
              DrugName: doc.data().DrugName,
              Location: doc.data().Location,
              Address: doc.data().Address,
              City: doc.data().City,
              Supplier: doc.data().Supplier,
              Quantity: doc.data().Quantity,
              UnitPrice: doc.data().UnitPrice,
              ExpirationDate: doc.data().ExpirationDate,
              ReorderLevel: doc.data().ReorderLevel,
            });
          });

          setInventoryObj(fetchedInventory);
          setFetch(true);
        } catch (error) {
          console.error("Error fetching inventory data: ", error);
        }
      };

      fetchInventory();
    }
  }, [fetch]);

  const [deptAllocationObj, setDeptAllocationObj] = useState([]);

  useEffect(() => {
    if (!fetch) {
      const fetchAllocationObj = async () => {
        const querySnapshot = await getDocs(collection(db, "allocations"));
        const fetchedAllocations = [];

        querySnapshot.forEach((doc) => {
          fetchedAllocations.push({
            id: doc.id,
            item: doc.data().item,
            quantity: doc.data().quantity,
            date: doc.data().date,
            dept: doc.data().dept,
          });
        });

        setDeptAllocationObj(fetchedAllocations);
        setFetch(true);
      };

      fetchAllocationObj();
    }
  }, [fetch]);

  const [deptObj, setDeptObj] = useState([]);

  useEffect(() => {
    if (!fetch) {
      const fetchDeptObj = async () => {
        const querySnapshot = await getDocs(collection(db, "departments"));
        const fetchedDept = [];

        querySnapshot.forEach((doc) => {
          fetchedDept.push({ id: doc.id, name: doc.data().name });
        });

        setDeptObj(fetchedDept);
        setFetch(true);
      };

      fetchDeptObj();
    }
  }, [fetch]);

  const createItem = async () => {
    if (item && stock) {
      try {
        await addDoc(collection(db, "inventory"), {
          item: item,
          stock: stock,
        });
        alert("Created Item successfully");
        window.location.reload();
      } catch (error) {
        alert("Something went wrong");
      }
    }
  };
  const createDepartment = async () => {
    if (departmentName) {
      try {
        await addDoc(collection(db, "departments"), {
          name: departmentName,
        });
        alert("Created Department Successfully");
        window.location.reload();
      } catch (error) {
        alert("Something went wrong");
      }
    }
  };

  async function editItemSubmit(editItem) {
    const docRef = doc(db, "inventory", editItem.id);

    try {
      await updateDoc(docRef, {
        item: item ? item : editItem.item,
        stock: stock ? stock : editItem.stock,
      });

      alert("Updated the Item successfully");
      window.location.reload();
    } catch (error) {
      alert(error);
      alert("Unable to update");
    }
  }

  async function updateDept(editDept) {
    const docRef = doc(db, "departments", editDept.id);

    try {
      await updateDoc(docRef, {
        name: departmentName,
      });

      alert("Updated the Department Successfully");
      window.location.reload();
    } catch (error) {
      alert("Unable to update");
    }
  }

  async function deleteItem(item) {
    var answer = window.confirm("Delete Item?");
    if (answer) {
      await deleteDoc(doc(db, "inventory", item.id));
      window.location.reload();
    } else {
      return;
    }
  }
  async function deleteDept(dept) {
    var answer = window.confirm("Delete Department?");
    if (answer) {
      await deleteDoc(doc(db, "departments", dept.id));
      window.location.reload();
    } else {
      return;
    }
  }
  const sortedWithoutId1 = inventoryObj.map(({ id, ...rest }) => rest);
  const sortedWithoutId2 = deptAllocationObj.map(({ id, ...rest }) => rest);
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
          <CsvExport2 data={drugConsumption} fileName="drugConsumption.csv" />
          <CsvExport3 data={inventoryObj} fileName="inventory.csv" />
        </div>

        <div class="flex justify-center items-center space-x-10 ">
          <div class="flex justify-center items-center w-2/3">
            <InstituteDrugConsumptionChart />
          </div>
          <div class="flex justify-center items-center w-1/3">
            <InstituteRadial />
          </div>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 py-14">
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
        </div>

        <div className="flex flex-col justify-start space-y-10 ">
          <h1 className={`${raleway.className} text-3xl font-bold mt-10`}>
            Upload CSV
          </h1>
          <input type="file" accept=".csv" onChange={handleFileUpload} />

          {/* <div class="flex items-center justify-center w-full">
                            <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                                <input id="dropzone-file" type="file" class="hidden" />
                            </label>
                        </div> */}

          <div class={`${inter.className} relative overflow-x-auto mt-10`}>
            <table class="min-w-full text-sm text-left">
              <thead class="text-sm border border-gray-800">
                <tr>
                  <th scope="col" class="px-2 py-2">
                    Sr. No.
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Drug Name
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Location
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Address
                  </th>
                  <th scope="col" class="px-2 py-2">
                    City
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Supplier
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Quantity
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Unit Price
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Expiration Date
                  </th>
                  <th scope="col" class="px-2 py-2">
                    Reorder Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {CSVData.map((item, index) => (
                  <tr key={index} class="border border-gray-800">
                    <th
                      scope="row"
                      class="px-2 py-2 text-center font-medium whitespace-nowrap"
                    >
                      <h1>{index + 1}</h1>
                    </th>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-32">{item.DrugName}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-32">{item.Location}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-40">{item.Address}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-32">{item.City}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-32">{item.Supplier}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-24">{item.Quantity}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-24">{item.UnitPrice}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-32">{item.ExpirationDate}</h1>
                    </td>
                    <td class="px-2 py-2">
                      <h1 className="truncate w-24">{item.ReorderLevel}</h1>
                    </td>
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

export default ManufacturerMiddle;
