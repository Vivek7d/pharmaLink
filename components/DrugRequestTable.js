"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Search, Trash2 } from "lucide-react";
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
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import Script from "next/script";

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
  // ... other drug data (kept the same)
];

function DrugRequestTable() {
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [requests, setRequests] = useState(initialRequestData);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
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

  const calculatePriceInUSD = (priceInINR) => {
    if (exchangeRate) {
      const priceInUSD = priceInINR / exchangeRate;
      return priceInUSD.toFixed(2); // Convert to two decimal places
    }
    return "0.00"; // Default if exchange rate isn't available
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setIsDrawerOpen(true); // Open the drawer
  };

  // New function to redirect to PayPal
  const redirectToPayPal = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    
    setPaymentProcessing(true);
    
    // Calculate the total in USD
    const priceInUSD = calculatePriceInUSD(parseFloat(calculatedTotal));
    
    // Store cart data in sessionStorage to retrieve after payment
    sessionStorage.setItem('cartData', JSON.stringify(cart));
    sessionStorage.setItem('totalAmount', calculatedTotal);
    sessionStorage.setItem('instituteName', instituteName || 'Unknown Hospital');
    
    // Construct PayPal URL
    // For production, use 'www.paypal.com' instead of 'www.sandbox.paypal.com'
    const paypalBaseUrl = 'https://www.paypal.com/checkoutnow';
    const clientId = 'AYsqtfECNBejywgaAJIQ1BGVXu4d0USWj-Fxh_XuC9kOYB6C9v6mVSMKFMfEinKhb--gRAzJitoVsSfy';
    const returnUrl = window.location.origin + '/payment-success'; // Create this page to handle return
    const cancelUrl = window.location.origin + '/payment-cancel'; // Create this page to handle cancellation
    
    // Create a unique token for this transaction
    const transactionToken = `TRANS-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    sessionStorage.setItem('transactionToken', transactionToken);
    
    // Construct the PayPal URL
    const paypalUrl = `${paypalBaseUrl}?token=${transactionToken}&useraction=commit&client-id=${clientId}&currency=USD&amount=${priceInUSD}&merchant-id=MERCHANT_ID&return=${encodeURIComponent(returnUrl)}&cancel_return=${encodeURIComponent(cancelUrl)}`;
    
    // Redirect to PayPal
    window.location.href = paypalUrl;
  };

  const handlePaymentSuccess = async (paymentDetails) => {
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
            (error) => {
              console.warn("Geolocation error:", error);
              resolve({
                latitude: 28.6139, // Default coordinates (example: Delhi)
                longitude: 77.2090,
              });
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          console.warn("Geolocation not supported");
          resolve({
            latitude: 28.6139, // Default coordinates
            longitude: 77.2090,
          });
        }
      });
    };

    try {
      // Get the current location
      const { latitude, longitude } = await getCurrentLocation();
      
      // Use a default location if geolocation API fails
      const hospitalLocation = `Lat: ${latitude}, Long: ${longitude}`;

      // Loop through each drug in the cart and store it as a separate document in Firestore
      const drugPromises = cart.map(async (item) => {
        const drugData = {
          hospital: instituteName || "Unknown Hospital",
          hospitalLocation: hospitalLocation,
          drugName: item.drugName,
          dosage: item.dosage,
          supplier: item.supplier,
          supplierLocation: item.supplierLocation,
          perUnitPrice: item.perUnitPrice,
          price: item.price,
          quantity: item.quantity || 1, // Default to 1 if quantity is not provided
          purchaseId: purchaseId,
          shipmentId: shipmentId,
          paymentDate: formattedDate,
          status: "Ordered",
          paymentMethod: "PayPal",
          paymentId: paymentDetails.id || "Unknown",
          payerEmail: paymentDetails.payer?.email_address || "Unknown",
          payerName: paymentDetails.payer?.name?.given_name + " " + paymentDetails.payer?.name?.surname || "Unknown"
        };

        // Add each drug document to a "shipments" collection in Firestore
        try {
          await addDoc(collection(db, "shipments"), drugData);
          console.log(`Drug ${item.drugName} stored with Purchase ID: ${purchaseId}`);
        } catch (error) {
          console.error(`Error storing drug ${item.drugName}:`, error);
          // Continue with other drugs even if one fails
        }
      });

      // Wait for all drug documents to be added
      await Promise.all(drugPromises);

      // Confirmation message
      setPaymentSuccess(true);
      toast.success("Order Details Stored Successfully!");

      // Empty the cart after successful payment
      setCart([]);
      // Close the drawer after a delay
      setTimeout(() => {
        setIsDrawerOpen(false);
        setPaymentSuccess(false);
      }, 3000);
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
        // Set a fallback exchange rate
        setExchangeRate(83.5); // Approximate INR to USD rate
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("name");

    if (!name) {
      router.push("/institute-login");
    } else {
      setInstituteName(name); // Save the institute name to state
    }
  }, [router]);

  // Check for payment success return from PayPal
  useEffect(() => {
    // Listen for payment success when returning from PayPal
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('success');
      const paymentToken = urlParams.get('token');
      const savedToken = sessionStorage.getItem('transactionToken');
      
      // If we have success parameter and tokens match
      if (paymentSuccess === 'true' && paymentToken && paymentToken === savedToken) {
        // Retrieve cart data from sessionStorage
        const cartData = JSON.parse(sessionStorage.getItem('cartData') || '[]');
        
        if (cartData.length > 0) {
          setCart(cartData);
          
          // Create mock payment details from returned data
          const mockPaymentDetails = {
            id: paymentToken,
            status: 'COMPLETED',
            payer: {
              email_address: 'customer@example.com',
              name: {
                given_name: 'Customer',
                surname: 'Name'
              }
            }
          };
          
          // Process the successful payment
          await handlePaymentSuccess(mockPaymentDetails);
          
          // Clean up session storage
          sessionStorage.removeItem('cartData');
          sessionStorage.removeItem('totalAmount');
          sessionStorage.removeItem('transactionToken');
          sessionStorage.removeItem('instituteName');
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    checkPaymentStatus();
  }, []);

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

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
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
            <SelectTrigger className="w-[150px]">
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
            <SelectTrigger className="w-[150px]">
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
            <SelectTrigger className="w-[150px]">
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
            <SelectTrigger className="w-[150px]">
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
                    <div className="flex flex-wrap items-center gap-4">
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
            
            <div className="text-sm text-gray-500 mt-2 mb-4">
              Approximately ${calculatePriceInUSD(parseFloat(calculatedTotal))} USD
            </div>

            {paymentSuccess ? (
              <Alert className="bg-green-50 mb-4">
                <AlertDescription>
                  Payment successful! Your order has been placed.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="mt-4">
                {paymentProcessing ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p>Processing your payment...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-center text-sm text-gray-500">
                      <p>Secure checkout powered by</p>
                      <img 
                        src="/paypal-logo.png" 
                        alt="PayPal" 
                        className="h-5 mx-auto my-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Replace the PayPal button container with a regular button */}
                    <Button 
                      onClick={redirectToPayPal}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded flex items-center justify-center gap-2"
                    >
                      Pay Now with PayPal
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          <DrawerFooter>
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