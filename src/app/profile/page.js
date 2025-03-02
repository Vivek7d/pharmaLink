"use client";

import React, { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../../components/Navbar";
import { Inter, Poppins, Raleway } from "next/font/google";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

const raleway = Raleway({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "700"],
  subsets: ["latin"],
});
const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
});

function page() {
  const router = useRouter();
  const [fetch, setFetch] = useState(false);
  const [username, setUsername] = useState(null);
  const [username2, setUsername2] = useState(null);
  const [password2, setPassword2] = useState(null);
  const [password, setPassword] = useState(null);
  const [location, setLocation] = useState("N/A");

  const [departmentsObj, setDepartmentsObj] = useState([]);

  const institutes = [
    {
        srNo: 1,
        username: "user1",
        password: "pass1",
        location: "Location1"
    },
    {
        srNo: 2,
        username: "user2",
        password: "pass2",
        location: "Location2"
    },
    {
        srNo: 3,
        username: "user3",
        password: "pass3",
        location: "Location3"
    }
    // Add more objects as needed
];

  var count = 1;
  useEffect(() => {
    if (!fetch) {
      const fetchdeptObj = async () => {
        const querySnapshot = await getDocs(collection(db, "departments"));

        const fetchedDepartments = [
          {
            id: 1,
            name: "N/A",
          },
        ];

        querySnapshot.forEach((doc) => {
          fetchedDepartments.push({ id: doc.id, name: doc.data().name });
        });

        setDepartmentsObj(fetchedDepartments);
        setFetch(true);
      };

      fetchdeptObj();
    }
  }, [fetch]);

  const [credsObj, setCredsObj] = useState([]);

  useEffect(() => {
    if (!fetch) {
      const fetchCredsObj = async () => {
        const querySnapshot = await getDocs(collection(db, "lab"));

        const fetchedCreds = [];

        querySnapshot.forEach((doc) => {
          fetchedCreds.push({
            id: doc.id,
            username: doc.data().username,
            password: doc.data().password,
            department: doc.data().department,
          });
        });

        setCredsObj(fetchedCreds);
        setFetch(true);
      };

      fetchCredsObj();
    }
  }, [fetch]);

  async function updateAdmin() {
    const docRef = doc(db, "admin", "0ohAfcHwHts4JCIMGUqH");

    try {
      await updateDoc(docRef, {
        username: username,
        password: password,
      });

      alert("Updated the Credentials Successfully");

      setUsername("");
      setPassword("");
      window.location.reload();
    } catch (error) {
      alert("Unable to update");
    }
  }

  async function createID() {
    if (username2 && password2 && department) {
      try {
        await addDoc(collection(db, "lab"), {
          username: username2,
          password: password2,
          department: department,
        });
        window.location.reload();
      } catch (error) {
        alert("Something went wrong");
      }
    }

    alert("Submitted Successfully");
    window.location.reload();
  }

  const handleDepartmentDropdown = (event) => {
    setDepartment(event.target.value);
  };

  async function deleteCred(cred) {
    try {
      await deleteDoc(doc(db, "lab", cred.id));
      alert("Deleted Credentials Successfully");
      window.location.reload();
    } catch (error) {
      alert("Error Deleting Credentials");
    }
  }

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex justify-evenly items-center  border-b border-gray-200 h-screen">
        <div className="flex flex-col justify-center items-center w-screen  space-y-5">
          <h1 className={`${raleway.className} text-4xl font-bold mb-10`}>
            Reset your credentials{" "}
          </h1>
          <form className="flex flex-col justify-center items-center space-y-10 ">
            <input
              onChange={(e) => setUsername(e.target.value)}
              required
              type="text"
              placeholder="Enter Username"
              className={`${inter.className} placeholder:text-gray-800 px-5 py-2  outline-none border border-gray-800 w-96`}
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="Password"
              className={`${inter.className} placeholder:text-gray-800 px-5 py-2  outline-none border border-gray-800 w-96`}
            />

            <div
              onClick={updateAdmin}
              disabled={!username || !password}
              type="submit"
              class="cursor-pointer relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-50 w-96 mx-auto"
            >
              <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
              <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span class="relative text-center">Change Credentials</span>
            </div>
          </form>
        </div>

        {/* <div className="flex h-screen w-[2px] bg-gray-200" /> */}

        <div className="flex flex-col justify-center items-center w-screen space-y-5">
          <h1 className={`${raleway.className} text-4xl font-bold mb-10`}>
            Create Institute ID's
          </h1>

          <form className="flex flex-col justify-start  space-y-5 ">
            <input
              onChange={(e) => setUsername2(e.target.value)}
              required
              type="text"
              placeholder="Enter Username"
              className={`${inter.className} placeholder:text-gray-800 px-5 py-2  outline-none border border-gray-800 w-96`}
            />
            <input
              onChange={(e) => setPassword2(e.target.value)}
              required
              type="password"
              placeholder="Password"
              className={`${inter.className} placeholder:text-gray-800 px-5 py-2  outline-none border border-gray-800 w-96`}
            />

       
            <input
              onChange={(e) => setLocation(e.target.value)}
              required
              type="text"
              placeholder="Enter Location"
              className={`${inter.className} placeholder:text-gray-800 px-5 py-2  outline-none border border-gray-800 w-96`}
            />

            <div
              onClick={createID}
              disabled={!username2 || !password2}
              type="submit"
              class="cursor-pointer relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-black border-2 border-black rounded-full hover:text-white group hover:bg-gray-50 w-96 mx-auto"
            >
              <span class="absolute left-0 block w-full h-0 transition-all bg-black opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
              <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span class="relative text-center">Create ID</span>
            </div>
          </form>
        </div>
      </div>

  
      <div className="flex flex-col justify-start items-center my-20">
      <h1 className={`${raleway.className} text-4xl text-left font-bold mt-10`}>
            Institute Profiles{" "}
          </h1>
        <div class={`${poppins.className} relative overflow-x-auto my-10`}>
          <table class="w-full text-sm text-left text-gray-500 ">
            <thead class="text-md text-gray-700  bg-gray-50 border-b  ">
              <tr>
                <th scope="col" class="px-6 py-3">
                  Sr. No.
                </th>
                <th scope="col" class="px-6 py-3">
                  Username
                </th>
                <th scope="col" class="px-6 py-3">
                  Password
                </th>
                <th scope="col" class="px-6 py-3">
                  Location
                </th>
                <th scope="col" class="px-6 py-3">
                  Options
                </th>
              </tr>
            </thead>
            {institutes.map((cred) => (
              <tbody>
                <tr class="bg-white border-b ">
                  <th
                    scope="row"
                    class="w-24 px-6 py-4 text-center font-medium text-gray-900 whitespace-nowrap "
                  >
                    <h1>{count++}</h1>
                  </th>
                  <td class="px-6 py-4">
                    <h1 className="truncate w-56">{cred.username}</h1>
                  </td>
                  <td class="px-6 py-4">
                    <h1 className="truncate w-56">{cred.password}</h1>
                  </td>
                  <td class="px-6 py-4">
                    <h1 className="truncate w-56">{cred.location}</h1>
                  </td>

                  <td class="px-6 py-4">
                    <div className="flex justify-center items-center w-[150px] space-x-4">
                      <div
                        onClick={() => deleteCred(cred)}
                        className=" w-32 flex justify-around items-center cursor-pointer"
                      >
                        <img
                          src="/delete.png"
                          alt="remove"
                          className="w-5 h-5 "
                        />
                        <h1>Delete Record</h1>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </>
  );
}

export default page;
