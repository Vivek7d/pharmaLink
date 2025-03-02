"use client";
import React from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';

const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
});

function Navbar() {
    return (
        <>
            <div className="w-screen py-6 px-10 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <img src="./logo3.jpeg" alt="PharmaLink Logo" className="h-12" /> 
                    <img src="./logoName.png" alt="PharmaLink Logo" className="h-8" />
                </Link>
                <div className="flex justify-center items-center space-x-10">
                    <Link href="/admin-panel" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Inventory</Link>
                    <Link href="/maps" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Maps</Link>
                    <Link href="/procurement" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Procurement</Link>
                    <Link href="/admin-shipments" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Shipments</Link>
                    <Link href="/admin-damage-drugs" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Damage Drugs</Link>
                    <Link href="/admin-drugs-usage" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Drugs Usage</Link>
                    <Link href="/profile" className={`${poppins.className} text-sm font-medium cursor-pointer hover:text-gray-400`}>Profile</Link>
                </div>
            </div>
            <div className='bg-gray-300 h-[1px]' />
        </>
    );
}

export default Navbar;
