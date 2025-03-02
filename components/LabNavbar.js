"use client"
import React, { useContext, useEffect, useState } from 'react'
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
});


function LabNavbar() {

    const router = useRouter();

    useEffect(() => {

        const isHospital = localStorage.getItem("isHospital") === "true" || '';

        if (!isHospital) {
            router.push('institute-login');
        }
    }, [])

    return (
        <>
            <div className="w-screen py-6 px-10 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <img src="./logo3.jpeg" alt="PharmaLink Logo" className="h-12" />
                    <img src="./logoName.png" alt="PharmaLink Logo" className="h-8" />
                </Link>
                <div className="flex justify-center items-center space-x-10">
                    <Link href="/institute-panel" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Institute Panel</Link>
                    <Link href="/institute-procurement" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Institute Procurement</Link>
                    <Link href="/institute-purchase-order" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Institute Purchase Order</Link>
                    <Link href="/institute-shipments" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Institute Shipments</Link>
                    {/* <Link href="/institute-shipment-delay" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Institute Shipment Delay</Link> */}
                    <Link href="/institute-requests" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Request For Drugs</Link>

                    

                    <Link href="/forecast" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Demand forecast</Link>
                    {/* <Link href="/institute-alerts" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Alerts</Link> */}
                    <Link href="/patient-record" className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>Patients</Link>
                    <div onClick={() => {
                        router.push('/institute-login');
                        if (typeof window !== 'undefined') {
                            localStorage.setItem("isHospital", "false") || ''
                            localStorage.removeItem("name")
                        }
                    }}>
                        <div className={`${poppins.className} text-sm font-medium cursor-pointer hover:ease-in transition hover:text-gray-400`}>
                            <h1>Logout</h1>
                        </div>
                    </div>

                </div>
            </div>
            <div className='bg-gray-300 h-[1px]' />
        </>
    )
}

export default LabNavbar;
