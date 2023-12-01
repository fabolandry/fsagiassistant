// Page.js
import React from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatList from '../components/chat/ChatList';
import ChatArea from '../components/chat/ChatArea';

const Page = () => {
  return (
    <div className="w-full h-screen flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 w-4/5 h-full flex">
        <ChatList />
        <ChatArea />
      </div>
    </div>
  );
};

export default Page;
