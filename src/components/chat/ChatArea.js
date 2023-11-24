import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import React from 'react';

const style = {
    chatAreaWrapper: `chat-area flex flex-col h-full mx-2`,
    chatTitle: `text-xl text-black py-1 mb-4 border-b-2 border-gray-200`,
    messagesContainer: `messages flex-1 overflow-auto`,
    messageInputContainer: `message-input mt-auto`
};

const ChatArea = () => {
  const messages = [
    { text: "Hey there. We would like to invite you over to our office for a visit. How about it?", isOwnMessage: false },
    { text: "All travel expenses are covered by us of course :D", isOwnMessage: false },
    { text: "It's like a dream come true", isOwnMessage: true },
    { text: "I accept. Thank you very much.", isOwnMessage: true },
    { text: "You are welcome. We will stay in touch.", isOwnMessage: false }
  ];

  return (
    <div className={style.chatAreaWrapper}>
      <h2 className={style.chatTitle}>
        Chatting with <b>Mercedes Yemelyan</b>
      </h2>

      <div className={style.messagesContainer}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg.text} isOwnMessage={msg.isOwnMessage} />
        ))}
      </div>

      <div className={style.messageInputContainer}>
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
