"use client";

import React, { useState, useContext } from 'react';
import { MdSend } from 'react-icons/md';
import { db } from '../../firebase';
import { AuthContext } from '../../AuthContext';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';

const style = {
    messageInputWrapper: `flex-2 pt-4 pb-4`,
    messageInputGroup: `write bg-white shadow flex rounded-lg`,
    iconContainer: `flex-3 flex content-center items-center text-center p-4 pr-0`,
    // Add styles for any icons or additional elements
    textareaContainer: `flex-1`,
    textarea: `w-full block text-black outline-none py-4 px-4 bg-transparent`,
    buttonContainer: `flex-2 w-32 p-2 flex content-center items-center`,
    buttonWrapper: `flex-1 text-center`,
    sendButton: `bg-blue-400 w-10 h-10 rounded-full inline-block`,
    sendButtonIcon: `inline-block align-text-bottom text-white`,
    // Add styles for send icon
};

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const { currentUser } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    try {
      if (currentUser) {
        const timestamp = Date.now();
        const chatId = `${currentUser.uid}-${timestamp}`;
  
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          text: message,
          timestamp: serverTimestamp(),
          // Add other fields as necessary, such as the user ID
        });
  
        console.log("Message Sent:", message);
        setMessage(''); // Clear the input after sending
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className={style.messageInputWrapper}>
      <div className={style.messageInputGroup}>
        <div className={style.iconContainer}>
          {/* Icons or additional elements can be added here */}
        </div>
        <div className={style.textareaContainer}>
          <textarea
            name="message"
            className={style.textarea}
            rows="1"
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
            autoFocus
          />
        </div>
        <div className={style.buttonContainer}>
          <div className={style.buttonWrapper}>
            {/* Optional additional icon */}
          </div>
          <div className={style.buttonWrapper}>
            <button
              className={style.sendButton}
              onClick={handleSendMessage}
            >
              <MdSend className={style.sendButtonIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;

