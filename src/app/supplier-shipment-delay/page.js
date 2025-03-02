import React from 'react'
import InstituteShipmentdelay from '../../../components/InstituteShipmentdelay'
import LabNavbar from '../../../components/LabNavbar'
import SupplierNavbar from '../../../components/SupplierNavbar'

export default function page() {
  return (
    <div>
      <SupplierNavbar/>
      <InstituteShipmentdelay />
    </div>
  )
}
