"use client"

import React, { useContext, useEffect } from 'react'
import SupplierNavbar from "../../../components/SupplierNavbar";
import SupplierMiddle from "../../../components/SupplierMiddle";
import { useRouter } from 'next/navigation';

function page() {


  const router = useRouter();


  return (

    <div className='w-screen h-screen bg-white'>
          <SupplierNavbar />
          <SupplierMiddle />
    </div>



  )
}

export default page