"use client";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { useState } from "react";
import jsPDF from "jspdf";
import { Poppins } from 'next/font/google';
import Papa from 'papaparse';
import React from "react"


const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
  });
  
export default function Home() {
  const [data, setData] = useState("");

  const runChat = async (prompt) => {
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
            parts: [{ text: "HELLO" }],
          },
          {
            role: "model",
            parts: [{ text: "Hello there! How can I assist you today?" }],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response.text();
      setData(response);
         // Generate PDF if there's data
         if (response) {
            try {
              const doc = new jsPDF();
              doc.setFontSize(10); // Set font size
              const margin = 10; // Page margin
              const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin; // Width for text wrapping
              const lines = doc.splitTextToSize(response, pageWidth); // Split text to fit page width
              doc.text(lines, margin, margin);
              doc.save("response.pdf");
            } catch (error) {
              console.error("Error generating PDF:", error);
            }
          }
        } catch (error) {
          console.error("Error running chat:", error);
        }
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    const prompt = `here is my drug consumption report- const chartData = [
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
      so give me insights on it. don't use bold characters. use plaintext as format`;
    
    await runChat(prompt);
  
 
  };

  return (
    <main className="flex mb-20">
      <form onSubmit={onSubmit} className="">
        <br />
        <button
          type="submit"
            className=" px-12 py-4 space-x-4 flex justify-center items-center  shadow-2xl rounded-xl bg-gray-800 hover:cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
        >
            <h1 className={`${poppins.className} text-center text-lg font-semibold text-gray-200`}>
            Get Report
            </h1>
            <img src="/download.png" alt="download" className='w-7 h-7' />
        </button>
      </form>
      {/* {data && (
        <div>
          <h1 className="mt-32">Output</h1>
          <div dangerouslySetInnerHTML={{ __html: data }} />
        </div>
      )} */}
    </main>
  );
}
