"use client";

import Link from 'next/link';
import GoogleSignInButton from './GoogleSignInButton';
import React, { useContext } from 'react';
import { AuthContext } from '../../AuthContext'; // Import AuthContext to access currentUser
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

const style = {
    menuWrapper: `flex flex-col mt-8`,
    menuItem: `block py-4 px-12 border-l-4 text-gray-600 hover:bg-gray-300 hover:text-black`,
    menuIcon: `inline-block align-text-bottom mr-2`,
    menuText: `inline-block`,
    svgStyle: `w-4 h-4`, // Adjusted styling for SVG
    googleButton: `block py-4 px-12 border-l-4 border-transparent hover:border-gray-300 text-gray-600 hover:text-black`, // New style for Google button
};

const Menu = () => {
    const { currentUser } = useContext(AuthContext); // Use AuthContext to access the current user

    const handleNewChatSession = async () => {
        if (currentUser) {
            const timestamp = Date.now();
            const chatSessionId = `${currentUser.uid}-${timestamp}`;

            // Optionally, store the chatSessionId in the user's document in Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
                currentChatSessionId: chatSessionId
            }, { merge: true });

            console.log("New Chat Session Created:", chatSessionId);
            // Redirect to the chat page or set state with the new session ID
            // For example, using router.push in Next.js or setting state in a context
        } else {
            console.error("No user is signed in.");
        }
    };

    return (
        <div className={style.menuWrapper}>
            <div className={style.menuItem} onClick={handleNewChatSession}>
                <span className={style.menuIcon}>
                    <svg className={style.svgStyle} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </span>
                <span className={style.menuText}>Chat</span>
            </div>
            <Link href="/calendar">
                <div className={style.menuItem}>
                    <span className={style.menuIcon}>
                        <svg className={style.svgStyle} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </span>
                    <span className={style.menuText}>Calendar</span>
                </div>
            </Link>
            <Link href="/files">
                <div className={style.menuItem}>
                    <span className={style.menuIcon}>
                        <svg className={style.svgStyle} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </span>
                    <span className={style.menuText}>Files</span>
                </div>
            </Link>
            <Link href="/jobs">
                <div className={style.menuItem}>
                    <span className={style.menuIcon}>
                        <svg className={style.svgStyle} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </span>
                    <span className={style.menuText}>Jobs</span>
                </div>
            </Link>
            <Link href="/settings">
                <div className={style.menuItem}>
                    <span className={style.menuIcon}>
                        <svg className={style.svgStyle} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </span>
                    <span className={style.menuText}>Settings</span>
                </div>
            </Link>
            <div className={style.googleButton}>
                <GoogleSignInButton />
            </div>
        </div>
    );
};

export default Menu;
