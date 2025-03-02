import React from 'react'
import DamageDrugsTable  from "../../../components/DamageDrugsTable"; 
import Navbar from '../../../components/Navbar';
import SupplierNavbar from '../../../components/SupplierNavbar';

function page() {
  return (
    <div>
    <SupplierNavbar/>
      <DamageDrugsTable/>
    </div>
  )
}

export default page
