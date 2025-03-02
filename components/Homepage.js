import React, { useState } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  weight: ["100", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

function Homepage() {
  return (
    <>
      <div class="w-screen py-6 px-10 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img src="./logo3.jpeg" alt="PharmaLink Logo" className="h-12" />
          <img src="./logoName.png" alt="PharmaLink Logo" className="h-8" />
        </Link>{" "}
      </div>
      <div className="bg-gray-300 h-[1px] " />

      <div class="flex flex-col justify-center items-center mt-36 space-y-10 ">
        <h1 class={`${poppins.className} text-3xl font-bold `}>
          Select one to proceed
        </h1>
        <div className="flex justify-center items-center space-x-10">
          <Link
            href="/admin-login"
            className="border border-gray-900 shadow-lg px-10 py-2  cursor-pointer hover:ease-in transition  hover:bg-gray-200"
          >
            <h1
              class={`${poppins.className} text-lg font-medium cursor-pointer rounded-2xl`}
            >
              Govt Login
            </h1>
          </Link>
          <Link
            href="/institute-login"
            className="border border-gray-900 shadow-lg px-10 py-2 cursor-pointer hover:ease-in transition  hover:bg-gray-200"
          >
            <h1
              class={`${poppins.className} text-lg font-medium cursor-pointer  rounded-2xl
                        `}
            >
              Institute Login
            </h1>
          </Link>

          <Link
            href="/supplier-login"
            className="border border-gray-900 shadow-lg px-10 py-2 cursor-pointer hover:ease-in transition  hover:bg-gray-200"
          >
            <h1
              class={`${poppins.className} text-lg font-medium cursor-pointer  rounded-2xl
                        `}
            >
              Supplier Login
            </h1>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Homepage;
