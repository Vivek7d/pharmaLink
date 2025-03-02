"use client"; // Ensures this component is rendered on the client side

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebase"; // Import the Firestore database instance
import Link from "next/link";
import Map from "../../../../MapScreen";

const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

function ShipmentProps() {
  const [loading, setLoading] = useState(true); // Start with loading state as true
  const [shipment, setShipment] = useState(null); // State to store shipment data
  const [error, setError] = useState(null); // Error state for handling failures
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to access query parameters
  const id = searchParams.get("id"); // Get the 'id' from the query parameters

  useEffect(() => {
    if (id) {
      const fetchShipment = async () => {
        try {
          setLoading(true); // Start loading before the fetch
          const q = query(
            collection(db, "shipments"),
            where("shipmentId", "==", id) // Searching by shipmentId field
          );

          const querySnapshot = await getDocs(q); // Execute the query

          if (!querySnapshot.empty) {
            // Assuming there is only one document with that shipmentId
            setShipment(querySnapshot.docs[0].data()); // Set the first document's data
          } else {
            setError("No shipment found with the given ID");
          }
        } catch (err) {
          setError("An error occurred while fetching the shipment data.");
        } finally {
          setLoading(false); // Stop loading once the fetch is done
        }
      };

      fetchShipment();
    }
  }, [id]); // Only run the effect when 'id' changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>{" "}
        {/* Replace with your spinner component */}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-5">{error}</div>; // Show error message if there's an issue
  }

  return (
    <div className={`${poppins.className} flex h-screen relative`}>
      {/* Back button */}
      <div className="absolute top-5 -left-10 z-10">
        <Link
          href="/admin-shipments"
          className="object-contain rounded-full cursor-pointer p-2 hover:bg-gray-300 dark:bg-white"
        >
          <img
            src="/back.png"
            alt="back icon"
            className="w-7 h-7 object-contain"
          />
        </Link>
      </div>

      {/* Map - Left Side */}
      <div className="flex-1 h-full">
        <Map
          className="w-full h-full z-0"
          start={shipment.supplierLocation}
          end={shipment.hospitalLocation}
        />
      </div>

      {/* Shipment Information - Right Side */}
      <div className="bg-white border-l-2 border-gray-200 p-5 w-[600px] h-screen shadow-xl top-0 right-0 ">
        <h1 className="text-3xl font-semibold mb-5">Shipment Details</h1>

        <div className="flex justify-center items-center flex-col py-5 border-b ">
          {shipment && (
            <div className="flex flex-col justify-start items-center space-y-5 ">
              <div className="flex justify-start items-center space-x-10 ">
                <h1 className="text-md font-medium ">
                  {shipment.supplierLocation}
                </h1>

                <img
                  src="/right-arrow.png"
                  alt="right-arrow icon"
                  className="w-7 h-7 object-contain"
                />

                <h1 className="text-md font-medium ">
                  {shipment.hospitalLocation}
                </h1>
              </div>

              <div className="flex justify-center items-center space-x-10  text-sm text-gray-900">
                <div className="flex flex-col justify-center items-center">
                  <h1>Total Time</h1>
                  <h1>24 hours</h1>
                </div>
                <div className="flex flex-col justify-center items-center ">
                  <h1>Departure Time</h1>
                  <h1>{shipment.dispatchDate}</h1>
                </div>
                <div className="flex flex-col justify-center items-center ">
                  <h1>Arrival Time</h1>
                  <h1>{shipment.expectedDelivery}</h1>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shipped Products/Drugs Section */}
        <div className="flex justify-center items-start flex-col py-5">
          <h1 className="text-xl font-semibold mb-5">Shipped Products/Drugs</h1>
          <div className="flex justify-start items-center space-y-5">
            {/* Table for Random Product Data */}
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">
                    Product Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Quantity</th>
                  <th className="px-4 py-2 text-left font-medium">Batch No</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {["Paracetamol", "Ibuprofen", "Amoxicillin"].map(
                  (productName, index) => {
                    // Generate random data for each product
                    const randomQuantity =
                      Math.floor(Math.random() * 1000) + 100; // Random quantity between 100 and 1000
                    const randomBatchNo = `BATCH${
                      Math.floor(Math.random() * 1000) + 1
                    }`; // Random batch number
                    const randomExpiryDate = new Date(
                      Date.now() +
                        Math.floor(
                          Math.random() * 2 * 365 * 24 * 60 * 60 * 1000
                        )
                    )
                      .toISOString()
                      .split("T")[0]; // Random expiry date within 2 years

                    return (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{productName}</td>
                        <td className="px-4 py-2">{randomQuantity}</td>
                        <td className="px-4 py-2">{randomBatchNo}</td>
                        <td className="px-4 py-2">{randomExpiryDate}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="flex justify-start items-start flex-col py-5">
          <h1 className="text-xl font-semibold ">Shipping Details</h1>
          <div className="space-y-5 w-full flex flex-col justify-center items-start py-5">
            {/* Shipping Details Rows */}
            <div className="flex justify-between items-center space-x-2">
              <h2 className="font-medium ">Shipment ID: </h2>
              <p className="">{shipment.shipmentId}</p>
            </div>

            <div className="flex justify-between items-center space-x-2">
              <h2 className="font-medium ">Hospital: </h2>
              <p className="">{shipment.hospital}</p>
            </div>

            <div className="flex justify-between items-center space-x-2">
              <h2 className="font-medium ">Supplier Name: </h2>
              <p className="">{shipment.supplierName}</p>
            </div>

            <div className="flex justify-between items-center space-x-2">
              <h2 className="font-medium ">Status: </h2>
              <p className="">{shipment.status}</p>
            </div>
            <div className="flex justify-between items-center space-x-2">
              <h2 className="font-medium ">Priority: </h2>
              <p className="">{shipment.priority}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShipmentProps;
