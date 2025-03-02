import React from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const style = {
  wrapper: `flex justify-center`,
  button: `bg-black text-white px-4 py-2 rounded hover:bg-gray-800 `,
};

const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in: ", error.message, error.code, error);
  }
};

const SignIn = () => {
  return (
    <div className={style.wrapper}>
      <button className={style.button} onClick={googleSignIn}>
        Sign In
      </button>
    </div>
  );
};

export default SignIn;
