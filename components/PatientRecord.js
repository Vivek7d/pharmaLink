"use client";

import { useEffect, useState } from "react";
import { ChevronDown, DeleteIcon, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MdDelete } from "react-icons/md";
import { FaEdit, FaUpload, FaDownload } from "react-icons/fa";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Importing Gemini
import jsPDF from "jspdf"; // Import  ing jsPDF for PDF generation
import Papa from 'papaparse'; // Importing PapaParse for CSV parsing
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "../firebase"; // Adjust the import path as necessary
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const PatientRecord = () => {
  const [prescriptions, setPrescriptions] = useState([]); // State to hold prescription data
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    id: "",
    registrationNo: "",
    primaryDoctor: "",
    patientIdentifier: "",
    prescriptionNo: "",
    medicationDetails: "",
    startDate: "",
    duration: "",
    totalQuantity: "",
    comments: "",
    reasonForPrescribing: "",
    drugId: "" // Added drugId field
  });
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [CSVData, setCSVData] = useState([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "patientrecord"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data); // Show all records
    };
    fetchData();
  }, []);

  const filteredPrescriptions = [...prescriptions, ...CSVData].filter((prescription) => {
    const matchesSearch = prescription.registrationNo && prescription.registrationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDoctor = selectedDoctor ? prescription.primaryDoctor === selectedDoctor : true;
    return matchesSearch && matchesDoctor;
  });

  const handleAddPrescription = async () => {
    try {
      const docRef = await addDoc(collection(db, "patientrecord"), newPrescription); // Submit new prescription to Firebase
      setPrescriptions([...prescriptions, { ...newPrescription, id: docRef.id }]);
      resetNewPrescription();
      setShowForm(false);
    } catch (error) {
      alert("Error adding prescription: " + error.message);
    }
  };

  const resetNewPrescription = () => {
    setNewPrescription({
      id: "",
      registrationNo: "",
      primaryDoctor: "",
      patientIdentifier: "",
      prescriptionNo: "",
      medicationDetails: "",
      startDate: "",
      duration: "",
      totalQuantity: "",
      comments: "",
      reasonForPrescribing: "",
      drugId: "" // Reset drugId field
    });
  };

  const handleUploadCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const updatedData = results.data.map(item => ({
            ...item,
            primaryDoctor: item.primaryDoctor || "",
          }));
          setCSVData(updatedData);
          setPrescriptions(prev => {
            const combinedData = [...prev, ...updatedData];
            const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
            return uniqueData;
          });
        },
      });
    }
  };

  const submitToFirebase = async () => {
    try {
      for (const dataItem of CSVData) {
        await addDoc(collection(db, "patientrecord"), dataItem);
      }
      alert("Data uploaded successfully!");
    } catch (error) {
      alert(error);
    }
  };

  const handleEditPrescription = (prescription) => {
    setNewPrescription(prescription);
    setCurrentEditId(prescription.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleUpdatePrescription = async () => {
    try {
      const prescriptionRef = doc(db, "patientrecord", currentEditId);
      await updateDoc(prescriptionRef, newPrescription);
      setPrescriptions(prescriptions.map(item => (item.id === currentEditId ? { ...newPrescription, id: currentEditId } : item)));
      resetNewPrescription();
      setEditMode(false);
      setShowForm(false);
    } catch (error) {
      alert("Error updating prescription: " + error.message);
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      const prescriptionRef = doc(db, "patientrecord", id);
      await deleteDoc(prescriptionRef);
      setPrescriptions(prescriptions.filter(item => item.id !== id));
      alert("Prescription deleted successfully!");
    } catch (error) {
      alert("Error deleting prescription: " + error.message);
    }
  };

  const sortedPrescriptions = filteredPrescriptions.sort((a, b) => {
    const idA = a.id;
    const idB = b.id;
    return parseInt(idA) - parseInt(idB);
  });

  const downloadCSV = () => {
    const csv = Papa.unparse(sortedPrescriptions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "patient_record_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFileDialog = () => {
    document.getElementById('csv-upload-input').click();
  };

  const generateReport = async () => {
    const reportData = sortedPrescriptions.map(item => ({
      id: item.id,
      registrationNo: item.registrationNo,
      primaryDoctor: item.primaryDoctor,
      patientIdentifier: item.patientIdentifier,
      prescriptionNo: item.prescriptionNo,
      medicationDetails: item.medicationDetails,
      startDate: item.startDate,
      duration: item.duration,
      totalQuantity: item.totalQuantity,
      comments: item.comments,
      reasonForPrescribing: item.reasonForPrescribing,
    }));

    const prompt = `Here is my patient record report: ${JSON.stringify(reportData)} i want report in this format Title:
"Patient Record Analysis Report"
Sections to Include:
1. Summary/Overview
Total number of prescriptions.
Number and percentage of prescriptions by each doctor.
Key insights such as common medications, reasons for prescribing, and average duration of prescriptions.
2. Prescription Analysis
By Doctor:
Breakdown of prescriptions by doctor.
By Medication:
Analysis of common medications prescribed.
By Reason:
Highlight the reasons for prescribing.
3. Recommendations
Suggestions based on trends, such as:
Encourage doctors to review common medications.
Identify any potential over-prescribing patterns.`;

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [{ text: "Generate a report for the following patient records." }],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response.text();

      // Generate PDF if there's data
      if (response) {
        const doc = new jsPDF();
        doc.setFontSize(10); // Set font size
        const margin = 10; // Page margin
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin; // Width for text wrapping
        const lines = doc.splitTextToSize(response, pageWidth); // Split text to fit page width
        doc.text(lines, margin, margin);
        doc.save("patient_record_report.pdf");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  // Extract unique doctors from prescriptions
  const uniqueDoctors = [...new Set(prescriptions.map(item => item.primaryDoctor))];

  const isUnique = (field, value) => {
    return !prescriptions.some(prescription => prescription[field] === value);
  };

  const handleInputChange = (field, value) => {
    if (field === "drugId" || field === "registrationNo" || field === "prescriptionNo") {
      if (!/^\d+$/.test(value)) {
        alert(`${field} should only contain numbers.`);
        return;
      }
    }
    setNewPrescription({ ...newPrescription, [field]: value });
  };

  const handleFormSubmit = () => {
    if (!isUnique("drugId", newPrescription.drugId)) {
      alert("Drug ID must be unique.");
      return;
    }
    if (!isUnique("registrationNo", newPrescription.registrationNo)) {
      alert("Registration Number must be unique.");
      return;
    }
    if (!isUnique("prescriptionNo", newPrescription.prescriptionNo)) {
      alert("Prescription Number must be unique.");
      return;
    }
    if (Object.values(newPrescription).some(value => value === "")) {
      alert("All fields must be filled out.");
      return;
    }
    editMode ? handleUpdatePrescription() : handleAddPrescription();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-center">
        <h3 className="text-2xl font-semibold">Patient Record</h3>
      </div>
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by Registration No"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
          />
        </div>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">Select Doctor</option>
          {uniqueDoctors.map((doctor, index) => (
            <option key={index} value={doctor}>{doctor}</option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
        >
          <FaEdit className="mr-2" /> Add Prescription
        </button>
        <button
          onClick={openFileDialog}
          className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded transition duration-200 hover:bg-yellow-600"
        >
          <FaUpload className="mr-2" /> Upload CSV
        </button>
        <button
          onClick={generateReport}
          className="flex items-center px-6 py-3 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
        >
          <FaDownload className="mr-2" /> Get Report
        </button>
        <input
          id="csv-upload-input"
          type="file"
          accept=".csv"
          onChange={handleUploadCSV}
          className="hidden"
        />
      </div>

      {showForm && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 p-4 border border-gray-300 rounded bg-white shadow-lg z-10">
          <h2 className="text-lg font-semibold mb-2">{editMode ? "Edit Prescription" : "Add New Prescription"}</h2>
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          >
            &times; {/* Close button */}
          </button>
          <input
            type="text"
            placeholder="Drug ID"
            value={newPrescription.drugId}
            onChange={(e) => handleInputChange("drugId", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Registration No"
            value={newPrescription.registrationNo}
            onChange={(e) => handleInputChange("registrationNo", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Primary Doctor"
            value={newPrescription.primaryDoctor}
            onChange={(e) => handleInputChange("primaryDoctor", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Patient Identifier"
            value={newPrescription.patientIdentifier}
            onChange={(e) => handleInputChange("patientIdentifier", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Prescription No"
            value={newPrescription.prescriptionNo}
            onChange={(e) => handleInputChange("prescriptionNo", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Medication Details"
            value={newPrescription.medicationDetails}
            onChange={(e) => handleInputChange("medicationDetails", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="date"
            value={newPrescription.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Duration (Days)"
            value={newPrescription.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Total Quantity"
            value={newPrescription.totalQuantity}
            onChange={(e) => handleInputChange("totalQuantity", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Comments"
            value={newPrescription.comments}
            onChange={(e) => handleInputChange("comments", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Reason for Prescribing"
            value={newPrescription.reasonForPrescribing}
            onChange={(e) => handleInputChange("reasonForPrescribing", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 w-full"
          />
          <button
            onClick={handleFormSubmit}
            className="mt-2 px-6 py-3 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
          >
            {editMode ? "Update Prescription" : "Add Prescription"}
          </button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedPrescriptions.length === prescriptions.length}
                  onCheckedChange={() =>
                    setSelectedPrescriptions(
                      selectedPrescriptions.length === prescriptions.length ? [] : prescriptions.map((s) => s.id)
                    )
                  }
                />
              </TableHead>
              <TableHead>Drug ID <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Registration No <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Primary Doctor <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Patient Identifier <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Prescription No <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Medication Details <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Start Date <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Duration (Days) <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Total Quantity <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Comments <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Reason for Prescribing <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
              <TableHead>Actions <ChevronDown className="ml-2 h-4 w-4 inline-block" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPrescriptions.map((prescription, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={selectedPrescriptions.includes(prescription.id)}
                    onCheckedChange={() => handleEditPrescription(prescription)}
                  />
                </TableCell>
                <TableCell className="font-medium">{`DRG${String(index + 1).padStart(2, '0')}`}</TableCell>
                <TableCell className="font-medium">{prescription.registrationNo}</TableCell>
                <TableCell>{prescription.primaryDoctor}</TableCell>
                <TableCell>{prescription.patientIdentifier}</TableCell>
                <TableCell>{prescription.prescriptionNo}</TableCell>
                <TableCell>{prescription.medicationDetails}</TableCell>
                <TableCell>{prescription.startDate}</TableCell>
                <TableCell>{prescription.duration}</TableCell>
                <TableCell>{prescription.totalQuantity}</TableCell>
                <TableCell>{prescription.comments}</TableCell>
                <TableCell>{prescription.reasonForPrescribing}</TableCell>
                <TableCell className="flex items-center">
                  <FaEdit onClick={() => handleEditPrescription(prescription)} className="text-black hover:underline mr-2" />
                  <MdDelete onClick={() => handleDeletePrescription(prescription.id)} className="text-black hover:underline" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={submitToFirebase}
          className="flex items-center px-6 py-3 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
        >
          <FaUpload className="mr-2" /> Submit to Database
        </button>
        <button
          onClick={downloadCSV}
          className="flex items-center px-6 py-3 bg-gray-500 text-white rounded transition duration-200 hover:bg-gray-600"
        >
          <FaDownload className="mr-2" /> Download CSV
        </button>
      </div>
    </div>
  );
};

export default PatientRecord;