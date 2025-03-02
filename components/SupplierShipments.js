"use client";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import Papa from "papaparse";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  limit,
  where,
  query,
} from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebase"; // Import your Firestore DB instance from firebase.js
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust based on actual Select component import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

function SupplierShipments() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showIDDialog, setShowIDDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the order id for which dialog is triggered
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierLocation, setSupplierLocation] = useState("");
  const [driver, setDriver] = useState(null);
  const router = useRouter();

  const generateRandomString = (length) => {
    return Math.random().toString(36).slice(-length); // Generates a random string of given length
  };

  const handleCreateId = async (order) => {
    // Trigger dialog open
    setSelectedOrder(order);

    // Simulate username and password creation with random values
    const generatedUsername = `user_${generateRandomString(8)}`; // Random username
    const generatedPassword = `pass_${generateRandomString(8)}`; // Random password

    // Set the username and password to state
    setUsername(generatedUsername);
    setPassword(generatedPassword);

    // Update Firestore document with username and password
    try {
      const orderRef = doc(db, "shipments", order.id); // Get reference to the Firestore document

      // Update the document with the generated username and password
      await updateDoc(orderRef, {
        username: generatedUsername,
        password: generatedPassword,
      });

      console.log("Document successfully updated with username and password!");
    } catch (error) {
      console.error(
        "Error updating document with username and password:",
        error
      );
    }

    // Open the dialog once the ID is created and the document is updated
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleCloseShowIDDialog = () => {
    setShowIDDialog(false);
  };

  const handleShowId = (order) => {
    // Show ID logic here
    setSelectedOrder(order); // Set the selected order
    // Use existing username and password for "Show ID"
    setUsername(order.username); // Assuming you have username in your order data
    setPassword(order.password); // Assuming you have password in your order data
    setShowIDDialog(true); // Open the dialog
  };

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

  useEffect(() => {
    const isSupplier = localStorage.getItem("isSupplier") === "true" || "";

    if (!isSupplier) {
      router.push("supplier-login");
    } else {
      const sn = localStorage.getItem("supplierName");
      const sl = localStorage.getItem("supplierLocation");

      setSupplierName(sn);
      setSupplierLocation(sl);

      // Fetch driver only if supplier info is set
      const fetchDriver = async () => {
        try {
          const q = query(
            collection(db, "drivers"),
            where("supplier", "==", sn),
            where("status", "==", "Available"),
            limit(1)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const driverData = querySnapshot.docs[0].data();
            console.log(driverData);
            setDriver(driverData);
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchDriver();
    }
  }, []); // Empty dependency array to run only once on mount

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
      className={`${poppins.className} relative overflow-x-auto my-10 mx-20`}
    >
      <h1 className="text-3xl font-semibold pb-12">Shipments</h1>

      <div className="mb-10 flex justify-start items-center space-x-5">
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

        <button
          onClick={handleDownload}
          className="relative flex justify-center items-center bg-blue-700 text-white border-none py-3 px-8 rounded-md overflow-hidden shadow-lg transition-all duration-250"
        >
          Download CSV
        </button>
      </div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-md text-white bg-gradient-to-r from-blue-500 to-blue-700">
          <tr>
            <th className="px-4 py-3 text-center">Sr. No.</th>
            <th className="px-4 py-3">Shipment ID</th>
            <th className="px-4 py-3">Drug Name</th>
            <th className="px-4 py-3">Units Dispatched</th>
            <th className="px-4 py-3">Hospital Name</th>
            <th className="px-4 py-3">Hospital Location</th>
            <th className="px-4 py-3">Dispatch Date</th>
            <th className="px-4 py-3">Expected Delivery Date</th>
            <th className="px-4 py-3">Priority Level</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((order, index) => (
            <tr
              key={index}
              className="bg-white border-b hover:bg-gray-50 transition-all duration-200"
            >
              <th
                scope="row"
                className="w-24 px-4 py-4 text-center font-medium text-gray-900 whitespace-nowrap"
              >
                {index + 1}
              </th>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">{order.shipmentId}</h1>
              </td>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">{order.drugName}</h1>
              </td>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">{order.quantity}</h1>
              </td>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">{order.hospital}</h1>
              </td>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">{order.hospitalLocation}</h1>
              </td>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">
                  {order.dispatchDate || "To be dispatched"}
                </h1>
              </td>
              <td className="px-4 py-4">
                <h1 className="truncate w-56">
                  {order.expectedDelivery || "To be dispatched"}
                </h1>
              </td>

              <td className="px-4 py-4">
                <h1 className="truncate w-56">{order.priority || "Low"}</h1>
              </td>
              <td className="px-4 py-3">
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
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-4">
                  {/* Button (Create ID or Show ID) */}
                  {order.status === "Ordered" ? (
                    <button
                      onClick={() => handleCreateId(order.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      Create ID
                    </button>
                  ) : (
                    <button
                      onClick={() => handleShowId(order.shipmentId)}
                      className="px-4 py-2 bg-gray-300 text-black rounded-md"
                    >
                      Show ID
                    </button>
                  )}

                  {/* Chat Icon Link */}
                  <Link
                    href="/chat"
                    className="text-blue-500 hover:text-blue-700"
                    title="Chat"
                  >
                    <IoChatboxEllipsesOutline size={20} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shipment to {selectedOrder.hospital}</DialogTitle>
              <DialogDescription>Credentials for Driver:</DialogDescription>
              <DialogDescription>{driver.name}</DialogDescription>
              <DialogDescription>{driver.phone}</DialogDescription>
            </DialogHeader>
            <div className="dialog-body">
              <p>
                <strong>Username:</strong> {username}
              </p>
              <p>
                <strong>Password:</strong> {password}
              </p>
            </div>

            <DialogTrigger asChild>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogTrigger>
          </DialogContent>
        </Dialog>
      )}
      {showIDDialog && (
        <Dialog open={showIDDialog} onClose={handleCloseShowIDDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shipment to {selectedOrder.hospital}</DialogTitle>
              <DialogDescription>Credentials for Driver:</DialogDescription>
              <DialogDescription>{driver.name}</DialogDescription>
              <DialogDescription>{driver.phone}</DialogDescription>
            </DialogHeader>
            <div className="dialog-body">
              <p>
                <strong>Username:</strong> {username}
              </p>
              <p>
                <strong>Password:</strong> {password}
              </p>
            </div>

            <DialogTrigger asChild>
              <Button onClick={handleCloseShowIDDialog}>Close</Button>
            </DialogTrigger>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default SupplierShipments;
