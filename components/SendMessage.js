import React, { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const style = {
  container: `flex-1 overflow-auto p-4 space-y-4 mb-16`, // Added margin bottom to prevent overlap
  messageWrapper: `flex`,
  messageSent: `justify-end`,
  messageReceived: `justify-start`,
  messageBox: `max-w-[70%] p-3 rounded-lg`,
  messageSentBox: `bg-gray-100 text-gray-900`,
  messageReceivedBox: `bg-blue-100 text-blue-900`,
  form: `p-4 border-t flex space-x-2`,
  input: `flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`,
  button: `px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors`,
  footer: `fixed bottom-0 left-0 right-0 bg-white border-t`,
  chatContainer: `max-w-[1200px] mx-auto px-4`, // Increased max width and added padding
  messageArea: `w-full max-w-[1200px] mx-auto`, // Container for messages
};

const SendMessage = ({ scroll }) => {
  const [input, setInput] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input === "") {
      alert("Please enter a valid message");
      return;
    }
    const { uid, displayName } = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      text: input,
      name: displayName,
      uid,
      timestamp: serverTimestamp(),
    });
    setInput("");
    scroll.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={style.messageArea}>
      <div className={style.container}>
        {/* Messages will be rendered by parent Chat component */}
      </div>

      <div className={style.footer}>
        <div className={style.chatContainer}>
          <form onSubmit={sendMessage} className="flex space-x-2 p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={style.input}
              type="text"
              placeholder="Type your message here..."
            />
            <button className={style.button} type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
