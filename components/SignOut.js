import React from "react";
import { auth } from "../firebase";

const style = {
  button: `bg-black text-white px-4 py-2 rounded hover:bg-gray-600`,
};

const SignOut = () => {
  return (
    <button className={style.button} onClick={() => auth.signOut()}>
      Sign Out
    </button>
  );
};

export default SignOut;
