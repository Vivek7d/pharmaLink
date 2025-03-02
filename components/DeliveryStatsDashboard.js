"use client";

import React, { useState } from "react";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";

const DeliveryStatsCard = ({ title, count, change, status, onClick }) => {
  const isPositiveChange = change >= 0;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="p-6 w-[200px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500">
                Vehicles operating on the road
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-8">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold text-gray-900">
                  {count}
                </span>
                <div
                  className={`flex items-center ${
                    isPositiveChange ? "text-green-500" : "text-red-500"
                  } text-sm font-medium`}
                >
                  {isPositiveChange ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {isPositiveChange ? "+" : ""}
                  {change.toFixed(2)}%
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">than last week</p>
            </div>
          </div>
        </div>
        <img
          src="/vehicle.jpeg"
          alt="vehicle"
          className="w-44 h-44 object-contain"
        />
      </div>
    </div>
  );
};

const DeliveryStatsDashboard = () => {
  const [selectedTruck, setSelectedTruck] = useState(null);

  const stats = [
    { title: "Truck A", count: 89, change: 2.29, status: "On-Route" },
    { title: "Truck B", count: 75, change: -1.5, status: "On-Duty" },
    { title: "Truck C", count: 123, change: 5.67, status: "Completed" },
  ];

  const trucksData = {
    "Truck A": [
      {
        drug_id: "D001",
        drug_name: "Paracetamol",
        quantity: 150,
        temperature: "22°C",
        usage_reasons: "Fever, Pain Relief",
      },
      {
        drug_id: "D002",
        drug_name: "Amoxicillin",
        quantity: 75,
        temperature: "20°C",
        usage_reasons: "Bacterial Infections",
      },
      {
        drug_id: "D003",
        drug_name: "Ibuprofen",
        quantity: 200,
        temperature: "25°C",
        usage_reasons: "Inflammation, Pain Relief",
      },
      {
        drug_id: "D004",
        drug_name: "Ciprofloxacin",
        quantity: 50,
        temperature: "18°C",
        usage_reasons: "Urinary Tract Infections",
      },
      {
        drug_id: "D005",
        drug_name: "Metformin",
        quantity: 120,
        temperature: "22°C",
        usage_reasons: "Type 2 Diabetes",
      },
      {
        drug_id: "D006",
        drug_name: "Lisinopril",
        quantity: 90,
        temperature: "21°C",
        usage_reasons: "High Blood Pressure",
      },
      {
        drug_id: "D007",
        drug_name: "Omeprazole",
        quantity: 200,
        temperature: "24°C",
        usage_reasons: "Acid Reflux, Heartburn",
      },
      {
        drug_id: "D008",
        drug_name: "Aspirin",
        quantity: 300,
        temperature: "22°C",
        usage_reasons: "Pain Relief, Blood Thinner",
      },
    ],
    "Truck B": [
      {
        drug_id: "D009",
        drug_name: "Clindamycin",
        quantity: 180,
        temperature: "19°C",
        usage_reasons: "Bacterial Infections",
      },
      {
        drug_id: "D010",
        drug_name: "Hydroxyzine",
        quantity: 120,
        temperature: "23°C",
        usage_reasons: "Anxiety, Allergies",
      },
      {
        drug_id: "D011",
        drug_name: "Warfarin",
        quantity: 95,
        temperature: "21°C",
        usage_reasons: "Blood Clots",
      },
      {
        drug_id: "D012",
        drug_name: "Simvastatin",
        quantity: 200,
        temperature: "22°C",
        usage_reasons: "Cholesterol Control",
      },
      {
        drug_id: "D013",
        drug_name: "Gabapentin",
        quantity: 300,
        temperature: "20°C",
        usage_reasons: "Nerve Pain",
      },
      {
        drug_id: "D014",
        drug_name: "Atorvastatin",
        quantity: 250,
        temperature: "22°C",
        usage_reasons: "Cholesterol Control",
      },
      {
        drug_id: "D015",
        drug_name: "Levothyroxine",
        quantity: 160,
        temperature: "24°C",
        usage_reasons: "Thyroid Disorders",
      },
      {
        drug_id: "D016",
        drug_name: "Sertraline",
        quantity: 210,
        temperature: "23°C",
        usage_reasons: "Depression, Anxiety",
      },
    ],
    "Truck C": [
      {
        drug_id: "D017",
        drug_name: "Alprazolam",
        quantity: 140,
        temperature: "18°C",
        usage_reasons: "Anxiety Disorders",
      },
      {
        drug_id: "D018",
        drug_name: "Furosemide",
        quantity: 230,
        temperature: "19°C",
        usage_reasons: "Edema, Hypertension",
      },
      {
        drug_id: "D019",
        drug_name: "Metoprolol",
        quantity: 175,
        temperature: "21°C",
        usage_reasons: "Hypertension, Angina",
      },
      {
        drug_id: "D020",
        drug_name: "Zolpidem",
        quantity: 90,
        temperature: "20°C",
        usage_reasons: "Insomnia",
      },
      {
        drug_id: "D021",
        drug_name: "Prednisone",
        quantity: 110,
        temperature: "23°C",
        usage_reasons: "Inflammation, Allergies",
      },
      {
        drug_id: "D022",
        drug_name: "Clonazepam",
        quantity: 95,
        temperature: "22°C",
        usage_reasons: "Seizures, Panic Disorders",
      },
      {
        drug_id: "D023",
        drug_name: "Esomeprazole",
        quantity: 180,
        temperature: "24°C",
        usage_reasons: "Acid Reflux",
      },
      {
        drug_id: "D024",
        drug_name: "Lorazepam",
        quantity: 85,
        temperature: "19°C",
        usage_reasons: "Anxiety, Insomnia",
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Delivery Statistics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <DeliveryStatsCard
            key={index}
            {...stat}
            onClick={() => setSelectedTruck(stat.title)}
          />
        ))}
      </div>

      {selectedTruck && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {selectedTruck} - Drug Details
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-lg rounded-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    Drug ID
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    Drug Name
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    Temperature
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    Usage Reasons
                  </th>
                </tr>
              </thead>
              <tbody>
                {trucksData[selectedTruck].map((drug) => (
                  <tr key={drug.drug_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                      {drug.drug_id}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                      {drug.drug_name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                      {drug.quantity}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                      {drug.temperature}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                      {drug.usage_reasons}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatsDashboard;
