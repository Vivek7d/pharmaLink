import React, { useEffect, useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
const inter = Inter({
    weight: ['400', '700'],
    subsets: ['latin'],
});

const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
});


function ViewRequests() {
    const [fetch, setFetch] = useState(false)
    const [requestsObj, setRequestsObj] = useState([])

    useEffect(() => {
        if (!fetch) {
            const fetchRequestsObj = async () => {
                const querySnapshot = await getDocs(collection(db, "requests"));
                const fetchedRequests = [];

                querySnapshot.forEach((doc) => {
                    fetchedRequests.push({ id: doc.id, department: doc.data().department, item: doc.data().item, quantity: doc.data().quantity, });
                });

                setRequestsObj(fetchedRequests);
                setFetch(true);
            }

            fetchRequestsObj();
        }
    }, [fetch]);

    async function accept(request) {
        // 1. Add doc inside allocations
        async function addAllocation(request) {


            let currentDate = new Date();

            let day = currentDate.getDate();
            let month = currentDate.getMonth() + 1;
            let year = currentDate.getFullYear();

            if (day < 10) {
                day = '0' + day;
            }

            if (month < 10) {
                month = '0' + month;
            }

            let formattedDate = day + '/' + month + '/' + year;



            if (request.item && request.quantity) {
                try {
                    await addDoc(collection(db, 'allocations'), {
                        date: formattedDate,
                        quantity: request.quantity,
                        dept: request.department,
                        item: request.item,
                    });
                } catch (error) {
                    alert('Something went wrong');
                }
            }


        }
        // 2. Minus from inventory
        async function syncInventory(request) {

            const q = query(
                collection(db, "inventory"),
                where("item", "==", request.item),
            );
            const querySnapshot = await getDocs(q);
            let existingStock;
            let itemId;

            querySnapshot.forEach((doc) => {
                itemId = doc.id
                existingStock = doc.data().stock
            });
            if (existingStock < request.quantity) {
                alert("The inventory doesn't have that much stock.")
            }
            else {
                const docRef = doc(db, "inventory", itemId);

                let finalQuantity = existingStock - request.quantity;
                try {
                    await updateDoc(docRef, {
                        stock: finalQuantity,
                    });

                } catch (error) {
                    alert('Unable to update');
                    window.location.reload();
                }

            }


        }

        // 3. Remove from requests
        async function deleteRequest(request) {
            await deleteDoc(doc(db, "requests", request.id));
            alert("Approved Request Successfully")
            window.location.reload();
        }


        addAllocation(request)
        syncInventory(request);
        deleteRequest(request)



    }
    async function reject(request) {
        // 1. Remove from requests
        async function deleteRequest(request) {
            await deleteDoc(doc(db, "requests", request.id));
            alert("Rejected Request Successfully")
            window.location.reload();
        }
        deleteRequest(request)


    }



    return (
        <div className='my-28 flex justify-center items-center'>

            <div class="w-screen px-44 py-10 flex flex-col ">
                <div class="flex justify-between items-center ">
                    <h1 class={`${poppins.className} text-4xl font-bold `}>Pending Requests</h1>

                </div>


                {/* List of boxes */}
                <div class="grid grid-cols-4 gap-10 py-14 ">
                    {requestsObj.map((request) => (
                        <div class="flex flex-col justify-center border border-gray-300 shadow-md min-w-[250px] h-[180px] px-5 rounded-lg ">
                            <h1 class={`${poppins.className} text-xl font-bold cursor-pointer`}>{request.department}</h1>
                            <h1 class={`${poppins.className} text-md font-medium  cursor-pointer `}>{request.item}</h1>
                            <h1 class={`${poppins.className} text-md font-medium  cursor-pointer `}>{request.quantity}</h1>

                            <div className='flex justify-end items-end space-x-2 '>

                                <div class="mt-10 cursor-pointer " onClick={() => accept(request)} >
                                    <img src="/accept.png" alt="accept" className='w-7 h-7' />
                                </div>
                                <div class="mt-10 cursor-pointer " onClick={() => reject(request)} >
                                    <img src="/delete.png" alt="delete" className='w-7 h-7' />
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ViewRequests;
