"use client";

import React, { useState, useContext } from 'react';
import { MdSend } from 'react-icons/md';
import { db } from '../../firebase';
import { AuthContext, createChatSession } from '../../AuthContext';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});


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
  const { currentUser, currentChatSessionId, setCurrentChatSessionId } = useContext(AuthContext);

  // Function to save a message
  const saveMessage = async (chatSessionId, userId, text) => {
    const chatSessionRef = doc(db, "chatSessions", chatSessionId);
    const messagesRef = collection(chatSessionRef, "messages");

    await addDoc(messagesRef, {
      sender: userId,
      timestamp: serverTimestamp(),
      textContent: text
    });
  };
  

  // Function to update the last message in a chat session
  const updateLastMessage = async (chatSessionId, lastMessageText) => {
    const chatSessionRef = doc(db, "chatSessions", chatSessionId);
    await setDoc(chatSessionRef, {
      lastMessage: lastMessageText,
      endTime: serverTimestamp()
    }, { merge: true });
  };
  

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Function to retrieve the last 100 messages for the current session
  const fetchMessages = async (chatSessionId) => {
    if (!db) {
      console.error('Firestore instance (db) is null. Make sure it is initialized correctly.');
      return [];
    }
    if (!chatSessionId) {
      console.error('Session ID is null. Make sure it is being set correctly.');
      return [];
    }
  
    const messages = [];
    try {
      const chatSessionRef = doc(db, "chatSessions", chatSessionId);
      const messagesRef = collection(chatSessionRef, "messages");
  
      // Order by 'timestamp' and limit to the last 100 messages
      const q = query(messagesRef, orderBy("timestamp", "desc"), limit(100));
  
      const querySnapshot = await getDocs(q);
  
      // Since we're ordering in descending order, we need to reverse the results to get the correct order
      querySnapshot.forEach((docSnapshot) => {
        // Prepend messages to the start of the array to reverse the order
        messages.unshift(docSnapshot.data());
      });
  
    } catch (error) {
      console.error('Error fetching messages:', error);
      // You may want to handle the error more gracefully in a user-facing application
    }
  
    return messages;
  };

  const generateAIResponse = async (userMessage, sessionId) => {
    const messages = await fetchMessages(sessionId);

    const messagesString = messages.map(message => 
        `${message.sender === currentUser.uid ? "You" : "AI"}: ${message.textContent}`
      ).join("\n");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI"
          },
          { 
            role: "assistant", 
            content: "Message History:\n" + messagesString 
          },
          { 
            role: "user", 
            content: userMessage 
          }
        ],
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return '';
    }
  };


  const handleSendMessage = async () => {
    if (message.trim() === '') return;
  
    let currentSessionId = currentChatSessionId; // Use the current chat session ID from the context
    let currentMessage = message;
    setMessage('');
  
    // If a chat session ID does not exist, create a new session and use that ID.
    if (!currentSessionId) {
      // Here you would check if there's a chat session already existing for the user before creating a new one
      const newSessionId = await createChatSession(currentUser.uid);
      setCurrentChatSessionId(newSessionId); // Update the context with the new session ID
      currentSessionId = newSessionId; // Use the new session ID for the current operation
    }
  
    // Proceed with the currentSessionId whether it was just created or already existed.
    if (currentSessionId) {
      await saveMessage(currentSessionId, currentUser.uid, currentMessage);
      await updateLastMessage(currentSessionId, currentMessage);

      // Generate AI Response
      const aiResponse = await generateAIResponse(currentMessage, currentSessionId);

      // Save AI Response to Firestore
      if (aiResponse) {
        await saveMessage(currentSessionId, 'AI', aiResponse);
        await updateLastMessage(currentSessionId, aiResponse);
      }

    } else {
      console.error("Failed to create or retrieve a chat session ID.");
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

