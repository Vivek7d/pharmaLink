import React from "react";
import { auth } from "../firebase";

const style = {
  container: `flex-1 overflow-auto p-4`,
  messageWrapper: `flex mb-4`, // Gap between messages
  messageSent: `justify-end`,
  messageReceived: `justify-start`,
  messageBox: `max-w-[70%] p-3 rounded-lg text-left`,
  messageSentBox: `bg-gray-100 text-gray-900`,
  messageReceivedBox: `bg-blue-100 text-blue-900`,
  name: `font-semibold text-[10px] mb-1`, // Made messenger name even smaller
  text: `text-left text-base`, // Message text stays same size
};

const Message = ({ message }) => {
  const isCurrentUser = message.uid === auth.currentUser.uid;

  return (
    <div
      className={`${style.messageWrapper} ${
        isCurrentUser ? style.messageSent : style.messageReceived
      }`}
    >
      <div
        className={`${style.messageBox} ${
          isCurrentUser ? style.messageSentBox : style.messageReceivedBox
        }`}
      >
        <p className={style.name}>{message.name}</p>
        <p className={style.text}>{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
