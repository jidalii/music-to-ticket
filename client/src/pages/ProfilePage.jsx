import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AboutPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/auth/get-user', { withCredentials: true });
                setUser(response.data);
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
                    <h2 className='text-4xl text-spotify-white'>
                        Welcome to Music to Ticket, {user.username}
                    </h2>
                    <p className='text-2xl text-spotify-white'>
                        Email: {user.email}
                    </p>
                    {/* Display other user details as needed */}
                </div>
            )}
        </div>
    );
}

export default AboutPage;
