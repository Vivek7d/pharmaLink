"use client"
import React, { useContext, useEffect, useState } from 'react'
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';

const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
});


function ManufacturerNavbar() {

    const router = useRouter();


    return (
        <>
            <div class="w-screen py-6 px-10 flex justify-between items-center">
            <Link href="/" className="flex items-center">
                    <img src="./logo3.jpeg" alt="PharmaLink Logo" className="h-12" /> 
                    <img src="./logoName.png" alt="PharmaLink Logo" className="h-8" />
                </Link>                <div class="flex justify-center items-center space-x-10">
                    <Link href="/institute-panel" class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>Institute Panel</Link>
                    <Link href="/institute-procurement" class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>Institute Procurement</Link>
                    <Link href="/institute-purchase-order" class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>Institute Purchase Order</Link>
                    <Link href="/institute-shipment-delay" class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>Institute Shipment Delay</Link>
                    <Link href="/institute-requests" class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>Request For Drugs</Link>
                    <Link href="/institute-alerts" class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>Alerts</Link>

                    <div onClick={() => {
                        router.push('/manufacturer-login');
                        if (typeof window !== 'undefined') {
                            localStorage.setItem("isManufacturer", "false") || ''
                            localStorage.removeItem("name")
                        }
                    }}>
                        <div class={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition  hover:text-gray-400`}>
                            <h1>Logout</h1>
                        </div>
                    </div>

                </div>
            </div>
            <div className='bg-gray-300 h-[1px] ' />


        </>

    )
}

export default ManufacturerNavbar