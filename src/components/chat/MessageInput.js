"use client";

import React, { useState, useContext } from 'react';
import { MdSend } from 'react-icons/md';
import { db } from '../../firebase';
import { AuthContext, createChatSession } from '../../AuthContext';
import { collection, addDoc, updateDoc, serverTimestamp, setDoc, where, doc, getDocs, query, orderBy, limit, Timestamp, deleteDoc  } from 'firebase/firestore';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});


const style = {
    messageInputWrapper: `w-11/12 pt-4 pb-4`,
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
  const [allMessages, setAllMessages] = useState([]);

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


  const saveAndPrintMessages = (chatSessionId, userId, text) => {
    // Create a new message object
    const newMessage = { chatSessionId, userId, text };

    // Use a temporary variable to accumulate messages
    const updatedMessages = [...allMessages, newMessage];

    // Generate the message string using updatedMessages
    const messagesString = updatedMessages.map(m => `Session: ${m.chatSessionId}, User: ${m.userId}, Text: ${m.text}`).join("\n");

    // Log the message string to the console
    console.log(messagesString);

    return messagesString
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default action to stop from adding a new line
      handleSendMessage(); // Call the send message function
    } else {
      setMessage(e.target.value);
    }
  };

  // Function to retrieve the last 50 messages across all chat sessions for the current user
const fetchAllMessages = async () => {
  if (!db) {
    console.error('Firestore instance (db) is null. Make sure it is initialized correctly.');
    return [];
  }

  const messages = [];
  try {
    // First, get all chat session IDs for the current user
    const chatSessionsRef = collection(db, "chatSessions");
    const qSessions = query(chatSessionsRef, where("userId", "==", currentUser.uid));
    const sessionSnapshots = await getDocs(qSessions);

    for (const sessionDoc of sessionSnapshots.docs) {
      const messagesRef = collection(sessionDoc.ref, "messages");
      const qMessages = query(messagesRef, orderBy("timestamp", "desc"), limit(50));
      const messageSnapshots = await getDocs(qMessages);

      messageSnapshots.forEach(docSnapshot => {
        messages.push(docSnapshot.data());
      });
    }

    // Sort all messages by timestamp
    messages.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to the last 50 messages
    return messages.slice(0, 50);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};


  // Function to create multiple events
const createMultipleEvents = async (events) => {
  const responses = [];

  for (const event of events) {
    try {
      const startDate = new Date(`${event.date}T${event.startTime}`);
      const endDate = new Date(`${event.date}T${event.endTime}`);

      let eventData = {
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
        userId: currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'calendarEvents'), eventData);
      responses.push({ status: "success", message: "Event created successfully", eventId: docRef.id });
    } catch (error) {
      console.error("Error in creating event:", error);
      responses.push({ status: "error", message: error.message });
    }
  }

  return responses;
};
 

  const deleteMultipleEvents = async (eventIds) => {
    const responses = [];
    for (const eventId of eventIds) {
      try {
        await deleteDoc(doc(db, 'calendarEvents', eventId));
        responses.push({ status: "success", message: "Event deleted successfully", eventId: eventId });
      } catch (error) {
        console.error("Error in deleting event:", error);
        responses.push({ status: "error", message: error.message, eventId: eventId });
      }
    }
    return responses;
  };

  const searchEvents_fd = async (searchTerm) => {
    const eventsRef = collection(db, "calendarEvents");
    const querySnapshot = await getDocs(eventsRef);
    return querySnapshot.docs
      .filter(doc => 
        doc.data().title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.data().description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(doc => doc.id);
  };

  const searchEvents = async (searchTerm) => {
    try {
      const eventsRef = collection(db, "calendarEvents");
      const q = query(eventsRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .filter(doc => 
          doc.data().title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          doc.data().description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(doc => {
          const data = doc.data();
          const startDate = data.start.toDate().toLocaleString();
          const endDate = data.end.toDate().toLocaleString();
          return `${doc.id}, ${data.title}, ${data.description}, ${startDate}, ${endDate}`;
        });
    } catch (error) {
      console.error("Error in searching events:", error);
      return []; // Return an empty array in case of an error
    }
  };
  

  const queryCalendarEvents = async (currentUser) => {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      const q = query(eventsRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Timestamp to JavaScript Date object and then to a readable string
        const startDate = data.start.toDate().toLocaleString(); // Converts start time
        const endDate = data.end.toDate().toLocaleString(); // Converts end time

        // Format the string with readable date and time
        return `${doc.id}, ${data.title}, ${data.description}, ${startDate}, ${endDate}, ${data.date}`;
      });
    } catch (error) {
      console.error("Error in querying calendar events:", error);
      return []; // Return an empty array in case of an error
    }
  };

  const searchAndDelete = async (searchTerm) => {
    try {
      const eventIds = await searchEvents_fd(searchTerm);
      const deleteResponses = await deleteMultipleEvents(eventIds);
      return deleteResponses;
    } catch (error) {
      console.error("Error in search and delete:", error);
      return { status: "error", message: error.message };
    }
  };


  const generateAIResponse = async (userMessage, sessionId) => {
    const messages = await fetchAllMessages();

    const messagesString = messages.map(message => {
    // Check if the message has a sender and text content
    if (message.sender && message.textContent) {
      return `${message.sender === currentUser.uid ? "You" : "AI"}: ${message.textContent}`;
    }
    return "Unknown message format"; // Or any other placeholder text
    }).join("\n");

    const tools = [
      {
        type: "function",
        function: {
          name: "create_multiple_events",
          description: "Create multiple events",
          parameters: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    date: { type: "string" },
                    startTime: { type: "string" },
                    endTime: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title", "date", "startTime", "endTime", "description"],
                },
              },
            },
            required: ["events"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "query_calendar_events",
          description: "Query all calendar events for the current user",
          parameters: {
            type: "object",
            properties: {}
          },
          required: []
        }
      },
      {
        type: "function",
        function: {
          name: "search_events",
          description: "Search events based on partial matches in titles or descriptions",
          parameters: {
            type: "object",
            properties: {
              searchTerm: { type: "string" }
            },
            required: ["searchTerm"]
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_and_delete",
          description: "Search and delete events based on a search term",
          parameters: {
            type: "object",
            properties: {
              searchTerm: { type: "string" }
            },
            required: ["searchTerm"]
          },
        },
      }
    ];
  
    try {
        const entrycompletion = await openai.chat.completions.create ({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are the awareness tracker of a system. You only reply with yes or not.
                        You will answer the following question. 
                        Based on the message history between the user and AI do we know the name and occupation of the user ?`
            },
            { 
              role: "user", 
              content: "Message History:\n" + messagesString 
            },
          ]
        });
      
      
      console.log (entrycompletion.choices[0].message.content)
      console.log ( "Message History: " + messagesString)

      if (entrycompletion.choices[0].message.content === 'No') {
        const firstcompletion = await openai.chat.completions.create ({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are the greater of the a system. If this is your first time 
                        to talk to this user (no message history) present yourself as Ali,
                        the best assistant for freelancer and solopreneur. Ask the name and business line of the user.`
            },
            { 
              role: "user", 
              content: userMessage 
            },
            { 
              role: "user", 
              content: "Message History:\n" + messagesString 
            },
          ]
        });

        return firstcompletion.choices[0].message.content;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI, you can use your tools to create or delete event in the user calendar , 
                      You ask clarifications to get all the needed details to create or delete events
                      When the user ask to update one or many events, you must search for the events first using search_events,
                      You must then confirm the change to be applied, You can then search and delete the corresponding events
                      and then create new events with the new parameters`
          },
          { 
            role: "user", 
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
  
      let responseMessage = completion.choices[0].message.content;
  
      // Handle function call response
      if (completion.choices[0].message.tool_calls) {
        for (const toolCall of completion.choices[0].message.tool_calls) {
          if (toolCall.function.name === "create_multiple_events") {
            const functionArgs = JSON.parse(toolCall.function.arguments).events; // Access the 'events' array
            try {
              const functionResponses = await createMultipleEvents(functionArgs);
              for (const response of functionResponses) {
              saveAndPrintMessages(sessionId, 'AI', `Event creation status: ${response.message}`);
              }
            } catch (error) {
              saveAndPrintMessages(sessionId, 'AI', `Error creating events: ${error.message}`);
            }
          } else if (toolCall.function.name === "query_calendar_events") {
            try {
              const eventsData = await queryCalendarEvents(currentUser);
              saveAndPrintMessages(sessionId, 'AI', `Calendar events fetched: ${eventsData}`);
            } catch (error) {
              saveAndPrintMessages(sessionId, 'AI', `Error querying calendar events: ${error.message}`);
            } 
          } else if (toolCall.function.name === "search_events") {
            const searchTerm = JSON.parse(toolCall.function.arguments).searchTerm;
            try {
              const searchResults = await searchEvents(searchTerm);
              saveAndPrintMessages(sessionId, 'AI', `Search results: ${searchResults.join(', ')}`);
            } catch (error) {
              saveAndPrintMessages(sessionId, 'AI', `Error searching events: ${error.message}`);
            }
          } else if (toolCall.function.name === "search_and_delete") {
            const searchTerm = JSON.parse(toolCall.function.arguments).searchTerm;
            try {
              const deleteResponses = await searchAndDelete(searchTerm);
              for (const response of deleteResponses) {
                saveAndPrintMessages(sessionId, 'AI', `Delete status for ${response.eventId}: ${response.message}`);
              }
            } catch (error) {
                saveAndPrintMessages(sessionId, 'AI', `Error in search and delete: ${error.message}`);
            }
          }
        }
      }

      const extracompletion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: `This is a play and You will not reveal being AI under no condition
                      Make sure no one find out that you are an AI.
                      You are ALI the assistant of an Executive and you are trying to impress your boss
                      You receive message from a machine you have created, you use those message to reply to 
                      the user inquiry to the best of your ability while adpting to the flow of the conversation`
          },
          { 
            role: "user", 
            content: "Message History:\n" + messagesString 
          },
          { 
            role: "user", 
            content: "Machine message :\n" + allMessages 
          },
          { 
            role: "user", 
            content: userMessage 
          },
        ]
      });

      responseMessage = extracompletion.choices[0].message.content;

      setAllMessages([]);
  
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
            onKeyDown={handleInputChange} // Add this line
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

