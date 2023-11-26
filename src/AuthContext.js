"use client";

import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; // Ensure you have imported db
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentChatSessionId, setCurrentChatSessionId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch the most recent chat session ID for the logged-in user
        const chatSessionsRef = collection(db, 'chatSessions');
        const q = query(chatSessionsRef, where('userId', '==', user.uid), orderBy('startTime', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Assuming there's only one recent session, set it as the current session ID
          const currentSession = querySnapshot.docs[0];
          setCurrentChatSessionId(currentSession.id);
        } else {
          // No sessions found, set the current session ID to null
          setCurrentChatSessionId(null);
        }
      } else {
        // User is not logged in, reset the current chat session ID
        setCurrentChatSessionId(null);
      }
    });

    return unsubscribe;
  }, []);

  // Provide a method to manually set the current chat session ID
  const handleSetCurrentChatSessionId = (sessionId) => {
    setCurrentChatSessionId(sessionId);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentChatSessionId,
      setCurrentChatSessionId: handleSetCurrentChatSessionId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
