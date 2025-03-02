"use client";
import Image from "next/image";
import ChatNavbar from "../../../components/ChatNavbar";
import { auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Chat from "../../../components/Chat";

const style = {
  appContainer: `max-w-[728px] mx-auto text-center`,
  sectionContainer: `flex flex-col h-[90vh] bg-gray-100 mt-10 shadow-xl border relative`,
};
export default function page() {
  const [user] = useAuthState(auth);
  return (
    <div className="">
      <div className={style.appContainer}>
        <section className="{style.sectionContainer}">
          {/* Navbar */}
          <ChatNavbar/>
          {user ? <Chat /> : null}
        </section>
      </div>
    </div>
  );
}
