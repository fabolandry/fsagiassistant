"use client";

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext'; // Import AuthContext to access the current user and chat session ID
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';

const style = {
    chatAreaWrapper: `chat-area flex flex-col h-full mx-2 w-2/3`,
    chatTitle: `text-xl text-black py-1 mb-4 border-b-2 border-gray-200`,
    messagesContainer: `messages flex-1 overflow-auto`,
    messageInputContainer: `message-input mt-auto`
};

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const { currentChatSessionId } = useContext(AuthContext); // Use AuthContext to get the current chat session ID
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentChatSessionId) {
      const chatSessionRef = doc(db, "chatSessions", currentChatSessionId);
      const messagesRef = collection(chatSessionRef, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc")); // Assuming you have a timestamp field on your messages

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().textContent,
          // Assuming you have a field to determine if the message is from the current user
          isOwnMessage: doc.data().sender === currentUser?.uid
        }));
        setMessages(updatedMessages);
      });

      return unsubscribe; // Unsubscribe from the listener when the component unmounts
    }
  }, [currentChatSessionId]); // Re-run the effect if the current chat session ID changes

  return (
    <div className={style.chatAreaWrapper}>
      <h2 className={style.chatTitle}>
        Chatting with <b>Ali</b> {/* Update this part to display the correct chat partner's name */}
      </h2>

      <div className={style.messagesContainer}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg.text} isOwnMessage={msg.isOwnMessage} />
        ))}
      </div>

      <div className={style.messageInputContainer}>
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
