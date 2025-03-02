import React from 'react'
import DrugsUsageTable from "../../../components/DrugsUsageTable"; 
import Navbar from '../../../components/Navbar';
import AdminDamageUsage from '../../../components/AdminDamageUsage';

function page() {
  return (
    <div>
    <Navbar/>
      <AdminDamageUsage />
    </div>
  )
}

export default page
