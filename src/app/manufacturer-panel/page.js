"use client"

import React, { useContext, useEffect } from 'react'
import ManufacturerNavbar from "../../../components/ManufacturerNavbar";
import ManufacturerMiddle from "../../../components/ManufacturerMiddle";
import { useRouter } from 'next/navigation';

function page() {


  const router = useRouter();


  return (

    <div className='w-screen h-screen bg-white'>
          <ManufacturerNavbar />
          <ManufacturerMiddle />
    </div>



  )
}

export default page