import React from 'react'
import InstituteAlertsTable from '../../../components/InstituteAlertsTable'
import LabNavbar from '../../../components/LabNavbar'
import SupplierNavbar from '../../../components/SupplierNavbar'

function page() {
  return (
    <div>
      <SupplierNavbar />
      <InstituteAlertsTable />
    </div>
  )
}

export default page