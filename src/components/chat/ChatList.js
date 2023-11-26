"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const style = {
    chatListWrapper: `flex-1 h-full overflow-auto px-2`,
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

  const chatSessions = []

  return (
    <div className={style.chatListWrapper}>
      <h2 className={style.chatHistoryTitle}>Chat History</h2>
      {chatSessions.map((session) => (
        <div key={session.id} className={style.chatEntry}>
          {/* Display chat session details here */}
          {/* For example, if you have a 'lastMessage' field in your chat session documents */}
          <div className={style.chatInfo}>
            {/* You might want to add a field to your chat documents to store the name */}
            <div className={style.chatName}>{session.name || 'Anonymous'}</div>
            <div className={style.chatLastMessage}><small>{session.lastMessage || 'No messages yet'}</small></div>
          </div>
          {/* You might want to format the timestamp into a readable date */}
          <div className={style.chatDate}>
            <small>{new Date(session.timestamp).toLocaleString() || 'Date unknown'}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
