import React from 'react'
import DrugsUsageTable from "../../../components/DrugsUsageTable"; 
import Navbar from '../../../components/Navbar';
import SupplierNavbar from '../../../components/SupplierNavbar';

function page() {
  return (
    <div>
    <SupplierNavbar/>
      <DrugsUsageTable />
    </div>
  )
}

export default page
