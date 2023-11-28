"use client";

import React, { useState, useContext } from 'react';
import { MdSend } from 'react-icons/md';
import { db } from '../../firebase';
import { AuthContext, createChatSession } from '../../AuthContext';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDocs, query, orderBy, limit, Timestamp, deleteDoc  } from 'firebase/firestore';
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

  const createEvent = async ({ title, date, startTime, endTime, description, isRepeating = false, repeatFrequency, repeatEndsOn }) => {
    try {
  
      const startDate = new Date(`${date}T${startTime}`);
      const endDate = new Date(`${date}T${endTime}`);
  
      let eventData = {
        title,
        description,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
        isRepeating,
        userId: currentUser.uid
      };
  
      // Only add repeatFrequency and repeatEndsOn if the event is repeating
      if (isRepeating) {
        if (!repeatFrequency) {
          throw new Error("Repeat frequency is required for repeating events.");
        }
  
        eventData.repeatFrequency = repeatFrequency;
  
        if (repeatEndsOn) {
          const repeatEndsOnDate = new Date(repeatEndsOn);
          if (isNaN(repeatEndsOnDate.getTime())) {
            throw new Error("Invalid repeat ends on date value.");
          }
          eventData.repeatEndsOn = Timestamp.fromDate(repeatEndsOnDate);
        }
      }
  
  
      const docRef = await addDoc(collection(db, 'calendarEvents'), eventData);
      return JSON.stringify({ status: "success", message: "Event created successfully", eventId: docRef.id });
    } catch (error) {
      console.error("Error in creating event:", error);
      return JSON.stringify({ status: "error", message: error.message });
    }
  };
  
  

  const deleteEvent = async ({ eventId }) => {
    try {
      await deleteDoc(doc(db, 'calendarEvents', eventId));
      return JSON.stringify({ status: "success", message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error in deleting event:", error);
      return JSON.stringify({ status: "error", message: error.message });
    }
  };
    

  const generateAIResponse = async (userMessage, sessionId) => {
    const messages = await fetchMessages(sessionId);
  
    const messagesString = messages.map(message => 
        `${message.sender === currentUser.uid ? "You" : "AI"}: ${message.textContent}`
    ).join("\n");
  
    const tools = [
      {
        type: "function",
        function: {
          name: "create_event",
          description: "Create a new event",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string" },
              startTime: { type: "string" },
              endTime: { type: "string" },
              description: { type: "string" },
              isRepeating: { type: "boolean" },
              repeatFrequency: { type: "string" },
              repeatEndsOn: { type: "string" },
              userId: { type: "string" },
            },
            required: ["title", "date", "startTime", "endTime"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "delete_event",
          description: "Delete an event",
          parameters: {
            type: "object",
            properties: {
              eventId: { type: "string" },
            },
            required: ["eventId"],
          },
        },
      },
    ];
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI, you can use your tools to create or delete event in the user calendar , you ask clarifications to get all the needed details to create or delete events"
          },
          { 
            role: "assistant", 
            content: "Message History:\n" + messagesString 
          },
          {
            role: "assistant",
            content: "Make sure that the date and time values are in the correct format (e.g., YYYY-MM-DD for dates and HH:MM for times) and are valid before they are passed to the createEvent function."
          },
          { 
            role: "user", 
            content: userMessage 
          }
        ],
        tools: tools, // Include the tools for function calling
      });
  
      const responseMessage = completion.choices[0].message.content;
  
      // Handle function call response
      if (completion.choices[0].message.tool_calls) {
        for (const toolCall of completion.choices[0].message.tool_calls) {
          if (toolCall.function.name === "create_event") {
            const functionArgs = JSON.parse(toolCall.function.arguments);
            console.log (functionArgs)
            try {
              const functionResponse = await createEvent(functionArgs);
              console.log (functionResponse)
              await saveMessage(sessionId, 'AI', `Event created successfully: ${functionResponse.message}`);
            } catch (error) {
              await saveMessage(sessionId, 'AI', `Error creating event: ${error.message}`);
            }
          } else if (toolCall.function.name === "delete_event") {
            const functionArgs = JSON.parse(toolCall.function.arguments);
            try {
              await deleteEvent(functionArgs);
              await saveMessage(sessionId, 'AI', "Event deleted successfully.");
            } catch (error) {
              await saveMessage(sessionId, 'AI', `Error deleting event: ${error.message}`);
            }
          }
        }
      }
  
      return responseMessage;
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

