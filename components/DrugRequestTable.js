"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, Plus, Minus, Search, Trash2 } from "lucide-react";
import { PayPalButton } from "react-paypal-button-v2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import dotenv from "dotenv";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
dotenv.config();

const initialRequestData = [
  {
    drugName: "Paracetamol",
    dosage: "500mg",
    quantity: "10000 tablets",
    price: "1250",
    supplier: "PharmaSup",
    supplierLocation: "Mumbai, India",
    perUnitPrice: "0.125",
    status: "Approved",
    estimatedDuration: "30 days",
    priority: "Low",
    discount: "5%",
  },
  {
    drugName: "Amoxicillin",
    dosage: "500mg",
    quantity: "5000 capsules",
    price: "1500",
    supplier: "MediCare Ltd.",
    supplierLocation: "Delhi, India",
    perUnitPrice: "0.3",
    status: "Pending",
    estimatedDuration: "45 days",
    priority: "Medium",
    discount: "10%",
  },
  {
    drugName: "Ibuprofen",
    dosage: "400mg",
    quantity: "15000 tablets",
    price: "1300",
    supplier: "HealthLine Pharmacy",
    supplierLocation: "Bangalore, India",
    perUnitPrice: "0.0867",
    status: "Approved",
    estimatedDuration: "20 days",
    priority: "High",
  },
  {
    drugName: "Metformin",
    dosage: "500mg",
    quantity: "20000 tablets",
    price: "2500",
    supplier: "MediTrust",
    supplierLocation: "Guwahati, India",
    perUnitPrice: "0.125",
    status: "Pending",
    estimatedDuration: "50 days",
    priority: "Medium",
  },
  {
    drugName: "Cetirizine",
    dosage: "10mg",
    quantity: "12000 tablets",
    price: "1400",
    supplier: "CurePharma",
    supplierLocation: "Chennai, India",
    perUnitPrice: "0.1167",
    status: "Approved",
    estimatedDuration: "25 days",
    priority: "Low",
    discount: "7%",
  },
  {
    drugName: "Omeprazole",
    dosage: "20mg",
    quantity: "8000 capsules",
    price: "1600",
    supplier: "GastroMed",
    supplierLocation: "Noida, India",
    perUnitPrice: "0.2",
    status: "Shipped",
    estimatedDuration: "30 days",
    priority: "High",
  },
  {
    drugName: "Aspirin",
    dosage: "100mg",
    quantity: "10000 tablets",
    price: "1300",
    supplier: "PainRelief Inc.",
    supplierLocation: "Hyderabad, India",
    perUnitPrice: "0.13",
    status: "Approved",
    estimatedDuration: "15 days",
    priority: "Medium",
  },
  {
    drugName: "Lisinopril",
    dosage: "10mg",
    quantity: "5000 tablets",
    price: "1500",
    supplier: "HeartCare Ltd.",
    supplierLocation: "Pune, India",
    perUnitPrice: "0.3",
    status: "Pending",
    estimatedDuration: "40 days",
    priority: "High",
    discount: "15%",
  },
  {
    drugName: "Atorvastatin",
    dosage: "20mg",
    quantity: "7000 tablets",
    price: "1700",
    supplier: "CholesterolBusters",
    supplierLocation: "Kolkata, India",
    perUnitPrice: "0.2429",
    status: "Shipped",
    estimatedDuration: "35 days",
    priority: "Low",
  },
  {
    drugName: "Metoprolol",
    dosage: "50mg",
    quantity: "6000 tablets",
    price: "1800",
    supplier: "BetaBlockers Ltd.",
    supplierLocation: "Ahmedabad, India",
    perUnitPrice: "0.3",
    status: "Approved",
    estimatedDuration: "20 days",
    priority: "Medium",
  },
];

function DrugRequestTable() {
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [requests, setRequests] = useState(initialRequestData);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [instituteName, setInstituteName] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedDosage, setSelectedDosage] = useState("all");
  const router = useRouter();

  const showNotification = (message, type = "success") => {
    if (type === "error") {
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } else {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const itemExists = prevCart.find(
        (cartItem) => cartItem.drugName === item.drugName && cartItem.dosage === item.dosage
      );
      if (itemExists) {
        showNotification("This item is already in your cart.", "error");
        return prevCart;
      }
      showNotification(`${item.drugName} ${item.dosage} added to cart!`);
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (drugName, dosage, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.drugName === drugName && item.dosage === dosage
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const updateSupplier = (drugName, dosage, newSupplier) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.drugName === drugName && item.dosage === dosage
          ? { ...item, supplier: newSupplier }
          : item
      )
    );
  };

  const updateDosage = (drugName, supplier, newDosage) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.drugName === drugName && item.supplier === supplier
          ? { ...item, dosage: newDosage }
          : item
      )
    );
  };

  const removeFromCart = (drugName, dosage) => {
    setCart((prevCart) => prevCart.filter((item) => item.drugName !== drugName || item.dosage !== dosage));
  };

  const calculateItemPrice = (item) => {
    const basePrice = parseFloat(item.price);
    const totalPrice = basePrice * item.quantity;
    let discount = 0;

    if (item.discount) {
      discount = parseFloat(item.discount) / 100;
    }

    const discountedPrice = totalPrice * (1 - discount);
    return discountedPrice.toFixed(2);
  };

  const calculatedTotal = cart
    .reduce((acc, item) => acc + parseFloat(calculateItemPrice(item)), 0)
    .toFixed(2);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setIsDrawerOpen(true); // Open the drawer
  };

  const handlePaymentSuccess = async (details, data) => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    // Generate unique purchaseId (PO) and shipmentId (SHP)
    const purchaseId = `PO-${year}${month}${day}-${hours}${minutes}${seconds}`;
    const shipmentId = `SHP-${year}${month}${day}-${hours}${minutes}${seconds}`;

    const formattedDate = `${day}/${month}/${year}`; // Format as dd/mm/yyyy

    // Function to get current location (latitude and longitude)
    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => reject(error),
            { enableHighAccuracy: true }
          );
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
    };

    // Function to get address from latitude and longitude using Google Maps API (optional)
    const getAddressFromCoordinates = async (latitude, longitude) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        return data.results[0]?.formatted_address || "Unknown location";
      } else {
        throw new Error("Failed to get address");
      }
    };

    try {
      // Get the current location
      const { latitude, longitude } = await getCurrentLocation();

      // Optionally, get the full address (using reverse geocoding)
      const hospitalLocation = await getAddressFromCoordinates(
        latitude,
        longitude
      );

      // Loop through each drug in the cart and store it as a separate document in Firestore
      const drugPromises = cart.map(async (item) => {
        const drugData = {
          hospital: instituteName,
          hospitalLocation: hospitalLocation, // Store the address here
          drugName: item.drugName,
          dosage: item.dosage,
          supplier: item.supplier,
          supplierLocation: item.supplierLocation,
          perUnitPrice: item.perUnitPrice,
          price: item.price,
          quantity: item.quantity || 1, // Default to 1 if quantity is not provided
          purchaseId: purchaseId, // Attach purchaseId to each drug
          shipmentId: shipmentId, // Attach shipmentId to each drug
          paymentDate: formattedDate, // Timestamp for the payment
          status: "Ordered", // Or 'Pending' based on the payment status
        };

        // Add each drug document to a "shipments" collection in Firestore
        await addDoc(collection(db, "shipments"), drugData);

        // Log each drug being added (for debugging purposes)
        console.log(
          `Drug ${item.drugName} stored with Purchase ID: ${purchaseId}, Shipment ID: ${shipmentId}`
        );
      });

      // Wait for all drug documents to be added
      await Promise.all(drugPromises);

      // Confirmation message (Toast/notification)
      toast.success(
        "Payment Successful and Order Details Stored for All Drugs!"
      );

      // Empty the cart after successful payment
      setCart([]);
    } catch (error) {
      console.error("Error adding drug documents: ", error);
      toast.error("Error occurred while saving drug order details.");
    }
  };

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://v6.exchangerate-api.com/v6/528c55fc12a14b60b18dc69c/latest/USD"
        );
        const data = await response.json();
        const rate = data.conversion_rates.INR; // INR rate from USD
        setExchangeRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    // Dynamically load the PayPal script
    const addPaypalScript = () => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=AQxSzYUtU9zn85Vj9rDwuT_rk2n-uAH_GVJFkokuoAmsitDwGsSrlR0YTdlJ5bXg3DmK6P8A9VTZNS6d`;
      script.async = true;
      script.onload = () => setScriptLoaded(true); // Set script loaded to true when PayPal script is ready
      document.body.appendChild(script);
    };
    addPaypalScript();
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("name");

    if (!name) {
      router.push("/institute-login");
    } else {
      setInstituteName(name); // Save the institute name to state
    }
  }, [router]);

  const calculatePriceInUSD = (priceInINR) => {
    if (exchangeRate) {
      const priceInUSD = priceInINR / exchangeRate;
      return priceInUSD.toFixed(2); // Convert to two decimal places
    }
    return "0.00"; // Default if exchange rate isn't available
  };

  const filteredRequests = requests.filter((request) => {
    return (
      request.drugName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedPriority !== "all" ? request.priority === selectedPriority : true) &&
      (selectedStatus !== "all" ? request.status === selectedStatus : true) &&
      (selectedSupplier !== "all" ? request.supplier === selectedSupplier : true) &&
      (selectedDosage !== "all" ? request.dosage === selectedDosage : true)
    );
  });

  return (
    <div className="p-6">
      <ToastContainer />
      {notification && (
        <Alert className={`mb-4 ${notification.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
          <AlertDescription>
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-6">Available Drugs</h1>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search drugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <Select onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PharmaSup">PharmaSup</SelectItem>
              <SelectItem value="MediCare Ltd.">MediCare Ltd.</SelectItem>
              <SelectItem value="HealthLine Pharmacy">HealthLine Pharmacy</SelectItem>
              <SelectItem value="MediTrust">MediTrust</SelectItem>
              <SelectItem value="CurePharma">CurePharma</SelectItem>
              <SelectItem value="GastroMed">GastroMed</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedDosage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dosage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="500mg">500mg</SelectItem>
              <SelectItem value="400mg">400mg</SelectItem>
              <SelectItem value="10mg">10mg</SelectItem>
              <SelectItem value="20mg">20mg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Sr. No.</th>
                <th className="p-4 text-left">Drug Name</th>
                <th className="p-4 text-left">Dosage</th>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Supplier Location</th>
                <th className="p-4 text-left">Per Unit Price</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Estimated Duration</th>
                <th className="p-4 text-left">Priority</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{request.drugName}</td>
                  <td className="p-4">{request.dosage}</td>
                  <td className="p-4">{request.supplier}</td>
                  <td className="p-4">{request.supplierLocation}</td>
                  <td className="p-4">{request.perUnitPrice}</td>
                  <td className="p-4">₹{request.price}</td>
                  <td className="p-4">{request.estimatedDuration}</td>
                  <td className="p-4">{request.priority}</td>
                  <td className="p-4 text-center">
                    <Button
                      onClick={() => handleAddToCart(request)}
                      className="inline-flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleProceedToCheckout} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            View Cart ({cart.length})
          </Button>
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Shopping Cart</DrawerTitle>
            <DrawerDescription>
              Review your selected items before checkout
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-4">
                      <p className="font-semibold">{item.drugName}</p>
                      <Select onValueChange={(value) => updateSupplier(item.drugName, item.dosage, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={item.supplier} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PharmaSup">PharmaSup</SelectItem>
                          <SelectItem value="MediCare Ltd.">MediCare Ltd.</SelectItem>
                          <SelectItem value="HealthLine Pharmacy">HealthLine Pharmacy</SelectItem>
                          <SelectItem value="MediTrust">MediTrust</SelectItem>
                          <SelectItem value="CurePharma">CurePharma</SelectItem>
                          <SelectItem value="GastroMed">GastroMed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => updateDosage(item.drugName, item.supplier, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={item.dosage} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500mg">500mg</SelectItem>
                          <SelectItem value="400mg">400mg</SelectItem>
                          <SelectItem value="10mg">10mg</SelectItem>
                          <SelectItem value="20mg">20mg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-gray-500">₹{item.price} per unit</p>
                    {item.discount && (
                      <p className="text-sm text-green-500">{item.discount} discount applied</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.drugName, item.dosage, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.drugName, item.dosage, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.drugName, item.dosage, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <span className="font-medium">₹{calculateItemPrice(item)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.drugName, item.dosage)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center border-t pt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold">₹{calculatedTotal}</span>
            </div>
          </div>

          <DrawerFooter>
            {/* PayPal Button */}
            {scriptLoaded && (
              <PayPalButton
                amount={cart
                  .reduce(
                    (acc, item) =>
                      acc +
                      parseFloat(
                        calculatePriceInUSD(
                          parseFloat(item.price) * item.quantity
                        )
                      ),
                    0
                  )
                  .toFixed(2)}
                onSuccess={(details, data) => {
                  handlePaymentSuccess(details, data); // Call the function correctly
                }}
                onError={(err) =>
                  toast.error("Payment failed. Please try again.")
                }
              />
            )}

            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default DrugRequestTable;