"use client";

import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, provider } from '../../firebase';

const style = {
    button: `inline-flex items-center justify-center bg-white hover:text-black text-gray-600 font-semibold py-2 px-2 border border-gray-300 rounded shadow-lg`,
    icon: `mr-5`,
    text: `text-xs`, // Adjust text size as needed
    googleIcon: `w-10 h-10`, // Adjust Google icon size
    userInfo: `flex flex-col items-center bg-white hover:text-black text-gray-600 font-semibold py-2 px-2 border border-gray-300 rounded shadow-lg`, // Style for user info display
    username: `font-bold`, // Style for username display
    logout: `text-gray-500 text-xs cursor-pointer` // Style for logout text
};

const GoogleSignInButton = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
    };

    const handleLogout = () => {
        signOut(auth).catch((error) => {
            // Handle Errors here.
            // ...
        });
    };

    if (user) {
        return (
            <div className={style.userInfo}>
                <span className={style.username}>@{user.displayName || user.email}</span>
                <span onClick={handleLogout} className={style.logout}>Logout</span>
            </div>
        );
    }

    return (
        <button onClick={handleGoogleSignIn} className={style.button}>
            <img 
                src="/google.png" 
                alt="Google sign-in" 
                className={`${style.icon} ${style.googleIcon}`} 
            />
            <span className={style.text}>Sign in with Google</span>
        </button>
    );
};

export default GoogleSignInButton;

