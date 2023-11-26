import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./profile.css";

interface User {
    username: string,
    email: string,
    avatar: string
}


function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/auth/user-data', { withCredentials: true });
                setUser(response.data);
                // USER_ID = response.data
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div>

            {user && (
                <main>
                    <div class="profile-header">
                        <div class="user-info">
                            <h2 className='text-2xl'>
                                User Name:
                            </h2>
                            <h3 className='text-8xl profile-name'>
                                {user.username}
                            </h3>
                        </div >
                        
                        <div class="pic">
                            <img src={user.avatar} alt="Profile Avatar"/>
                            {/* {AvatarShow(user.avatar)} */}
                        </div>
                            <p className='text-2xl'>
                                Email: {user.email}
                            </p>
                    </div>
                </main>
                )}
        
        </div>
    );
}

export default ProfilePage;
