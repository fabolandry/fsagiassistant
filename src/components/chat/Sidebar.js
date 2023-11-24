// Sidebar.js
import React from 'react';
import UserProfile from './UserProfile';
import Menu from './Menu';

const Sidebar = () => {
  return (
    <div className="hidden xl:block sm:flex-2 w-64 bg-gray-200">
      <UserProfile />
      <Menu />
    </div>
  );
};

export default Sidebar;
