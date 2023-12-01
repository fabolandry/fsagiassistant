"use client";

import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../../AuthContext';

const style = {
    chatListWrapper: `flex-1 h-full w-1/3 overflow-auto px-2`,
    chatHistoryTitle: `text-xl text-black py-1 mb-8 border-b-2 border-gray-200`,
    chatEntry: `cursor-pointer transform hover:scale-105 duration-300 transition-transform bg-white mb-4 rounded p-4 flex shadow-md`,
    chatProfileImageWrapper: `flex-2 w-12 h-12 relative`,
    chatProfileImage: `w-12 h-12 rounded-full mx-auto`,
    chatStatusIndicator: (status) => `absolute w-4 h-4 ${status === 'online' ? 'bg-green-400' : 'bg-gray-400'} rounded-full right-0 bottom-0 border-2 border-white`,
    chatInfo: `flex-1 px-2`,
    chatName: `truncate w-32 text-gray-800`,
    chatLastMessage: `text-gray-600`,
    chatDate: `flex-2 text-right text-gray-500`
};


const ChatList = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const { currentUser, setCurrentChatSessionId } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      const chatSessionsRef = collection(db, "chatSessions");
      const q = query(chatSessionsRef, where('userId', '==', currentUser.uid), orderBy('endTime', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sessions = querySnapshot.docs.map(doc => {
          const sessionData = doc.data();
          const truncatedLastMessage = sessionData.lastMessage
            ? `${String(sessionData.lastMessage).slice(0, 20)}${String(sessionData.lastMessage).length > 20 ? '...' : ''}`
            : 'No messages yet';
          return {
            id: doc.id,
            ...sessionData,
            lastMessage: truncatedLastMessage,
            timestamp: sessionData.endTime?.toDate().toLocaleString() || 'Date unknown'
          };
        });
        setChatSessions(sessions);
      });

      // Cleanup the subscription on unmount
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleChatSessionClick = (sessionId) => {
    setCurrentChatSessionId(sessionId); // Update the current chat session in context
  };

  return (
    <div className={style.chatListWrapper}>
      <h2 className={style.chatHistoryTitle}>Chat History</h2>
      {chatSessions.map((session) => (
        <div 
        key={session.id} 
        className={style.chatEntry} 
        onClick={() => handleChatSessionClick(session.id)} // Attach onClick event
        >
          {/* Display chat session details */}
          <div className={style.chatInfo}>
            {/* Replace 'Anonymous' with actual user's name or session identifier */}
            <div className={style.chatName}>{session.name || 'Anonymous'}</div>
            <div className={style.chatLastMessage}><small>{session.lastMessage || 'No messages yet'}</small></div>
          </div>
          <div className={style.chatDate}>
            <small>{session.timestamp}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
