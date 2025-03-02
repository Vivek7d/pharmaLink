"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Manrope, Poppins, Raleway } from 'next/font/google';
import Navbar from '../../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const raleway = Raleway({
    weight: ['400', '700'],
    subsets: ['latin'],
});
const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
});


function page() {

    const router = useRouter();
    const [fetch, setFetch] = useState(false)



    const [deptObj, setDeptObj] = useState([])

    useEffect(() => {
      if (!fetch) {
        const fetchDeptObj = async () => {
          const querySnapshot = await getDocs(collection(db, "departments"));
          const fetchedDept = [];
  
          querySnapshot.forEach((doc) => {
            fetchedDept.push({ id: doc.id, name: doc.data().name });
          });
  
          setDeptObj(fetchedDept);
          setFetch(true);
        }
  
        fetchDeptObj();
      }
    }, [fetch]);



    return (
        <>
            <Navbar />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="mx-10 lg:mx-28 mt-10 mb-20"
            >

                <div className={`${poppins.className} flex justify-start items-center space-x-2 pb-3 `}>

                    <img src='/back.png' alt="back" className='w-5 h-5 ' />


                    <Link href="/admin-panel" className='text-lg text-black cursor-pointer hover:ease-in transition  hover:text-gray-400'>Back</Link>


                </div>
                <div className={`${poppins.className} text-start mt-10`}>
                    <h1 className="text-2xl lg:text-4xl font-semibold tracking-wide ">
                        Select any one Department
                    </h1>
                </div>
                <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
                    {deptObj.map((department) => (
                        <Link
                            key={department.id}
                            href={{
                                pathname: `/departments/${department.name}`,
                                query: { departmentName: department.name },
                            }}
                            className="px-12 py-4 lg:px-0 lg:py-0 flex justify-center items-center lg:w-[200px] lg:h-[200px] shadow-2xl rounded-xl bg-[#60a5fa] hover:cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                        >
                            <h1 className={`${poppins.className} text-center lg:text-3xl text-2xl`}>
                                {department.name}
                            </h1>
                        </Link>
                    )
                    )}
                </div>



            </motion.div >
        </>
    );
}

export default page;
