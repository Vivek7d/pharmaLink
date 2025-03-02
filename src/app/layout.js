"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContext } from '../../contexts/AuthContext'
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [admin, setAdmin] = useState(false)
  const [lab, setLab] = useState(false)

  return (
    <html lang="en">
      <AuthContext.Provider value={{ admin, setAdmin, lab, setLab }}>
        <body className={inter.className}>{children}</body>
      </AuthContext.Provider>

    </html>
  );
}
