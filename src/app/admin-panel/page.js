"use client"

import React, { useContext, useEffect } from 'react'
import Navbar from "../../../components/Navbar";
import Middle from "../../../components/Middle";
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../../contexts/AuthContext';
import { JellyTriangle } from '@uiball/loaders'

function page() {


  const { admin, setAdmin } = useContext(AuthContext);
  const router = useRouter();


  let isAdmin;

  useEffect(() => {

     isAdmin = localStorage.getItem("isAdmin") === "true" || '';

    if (!isAdmin) {
      router.push('admin-login');
    }
  }, [])
  return (

    <div className='w-screen h-screen bg-white'>
      {isAdmin ? (
        <div className="flex items-center justify-center w-screen h-screen">
          <JellyTriangle color="black" size={100} />
        </div>
      ) : (
        <div>
          <Navbar />
          <Middle />
        </div>)}
    </div>



  )
}

export default page