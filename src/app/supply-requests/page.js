"use client"

import React from 'react'
import Navbar from "../../../components/Navbar";
import SupplierViewRequests from '../../../components/SupplierViewRequests';
import SupplierNavbar from '../../../components/SupplierNavbar';

function page() {

  return (
    <div>
      <SupplierNavbar />
      <SupplierViewRequests />
    </div>

  )
}

export default page