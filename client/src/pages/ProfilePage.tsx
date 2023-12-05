import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
                <div>
                    <h2 className='text-4xl'>
                        Welcome to Music to Ticket, {user.username}
                    </h2>
                    <img src={user.avatar}/>
                    {/* {AvatarShow(user.avatar)} */}
                    <p className='text-2xl'>
                        Email: {user.email}
                    </p>

                </div>
            )}
        </div>
    );
}

export default ProfilePage;
