import React from 'react';

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
  const chats = [
    { id: 1, name: "Ryann Remo", lastMessage: "Yea, Sure!", date: "15 April", status: "online" },
    { id: 2, name: "Karp Bonolo", lastMessage: "Yea, Sure!", date: "15 April", status: "offline" },
    // Add more chat data here
  ];

  return (
    <div className={style.chatListWrapper}>
      <h2 className={style.chatHistoryTitle}>Chat History</h2>
      {chats.map((chat) => (
        <div key={chat.id} className={style.chatEntry}>
          <div className={style.chatProfileImageWrapper}>
            <img className={style.chatProfileImage} src="../resources/profile-image.png" alt="chat-user" />
            <span className={style.chatStatusIndicator(chat.status)}></span>
          </div>
          <div className={style.chatInfo}>
            <div className={style.chatName}>{chat.name}</div>
            <div className={style.chatLastMessage}><small>{chat.lastMessage}</small></div>
          </div>
          <div className={style.chatDate}>
            <small>{chat.date}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
