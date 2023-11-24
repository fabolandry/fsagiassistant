import React from 'react';

const style = {
    userProfileWrapper: `text-center user-profile`,
    profileImageContainer: `w-32 h-32 rounded-full m-auto mt-16 border-2 border-white bg-white shadow-lg`,
    profileImage: `block`,
    userName: `text-gray-800 mt-8`,
    // Add more styles if needed for SVG or other elements
};

const UserProfile = () => {
    return (
        <div className={style.userProfileWrapper}>
            <div className={style.profileImageContainer}>
                <img src="/resources/profile-image.png" alt="user" className={style.profileImage} />
            </div>
            <div className={style.userName}>
                Ali
                {/* Place SVG icon here if needed */}
            </div>
        </div>
    );
};

export default UserProfile;
