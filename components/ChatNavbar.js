import React from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "./SignIn";
import SignOut from "./SignOut";
import Link from "next/link";

const ChatNavbar = () => {
  const [user] = useAuthState(auth);
  console.log("Auth State User: ", user);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-white border-b z-50">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl font-semibold text-black">
          <Link href="/" className="flex items-center">
                    <img src="./logo3.jpeg" alt="PharmaLink Logo" className="h-12" /> 
                    <img src="./logoName.png" alt="PharmaLink Logo" className="h-8" />
                </Link>
          </span>
        </div>
        <div className="flex items-center">
          {user ? <SignOut /> : <SignIn />}
        </div>
      </nav>
      <div className="mt-12 sm:mt-16"></div> {/* Adjusted spacer for mobile */}
    </>
  );
};

export default ChatNavbar;
