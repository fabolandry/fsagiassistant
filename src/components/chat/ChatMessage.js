"use client";

import React from 'react';

const style = {
    messageWrapper: (isOwnMessage) => `message mb-4 flex ${isOwnMessage ? "text-right" : "text-left"}`,
    profileImageContainer: `flex-2`,
    profileImageWrapper: `w-12 h-12 relative`,
    profileImage: `w-12 h-12 rounded-full mx-auto`,
    statusIndicator: `absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white`,
    messageContent: (isOwnMessage) => `flex-1 px-2`,
    messageBubble: (isOwnMessage) => `inline-block ${isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"} rounded-full p-2 px-6`,
    messageTime: (isOwnMessage) => `${isOwnMessage ? 'pr-4' : 'pl-4'} text-gray-500`
};

const ChatMessage = ({ message, isOwnMessage }) => {
    return (
        <div className={style.messageWrapper(isOwnMessage)}>
            {!isOwnMessage && (
                <div className={style.profileImageContainer}>
                    <div className={style.profileImageWrapper}>
                        <img className={style.profileImage} src="../resources/profile-image.png" alt="chat-user" />
                        <span className={style.statusIndicator}></span>
                    </div>
                </div>
            )}
            <div className={style.messageContent(isOwnMessage)}>
                <div className={style.messageBubble(isOwnMessage)}>
                    <span>{message}</span>
                </div>
                <div className={style.messageTime(isOwnMessage)}>
                    <small>15 April</small>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
