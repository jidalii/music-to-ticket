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
                                User Name
                            </h2>
                            <h3 className='text-8xl profile-name'>
                                {user.username}
                            </h3>
                            <p className='text-2xl'>
                                Email: {user.email}
                            </p>
                        </div >
                        
                        <div class="pic">
                            <img src={user.avatar} alt="Profile Avatar"/>
                            {/* {AvatarShow(user.avatar)} */}
                        </div>
                         
                       
                    </div>
                    <div class="bottom-area">
                        <div className="music-preferences">
                            <h3>Favorite Genres</h3>
                                {/*<ul>
                                    {user.favoriteGenres.map((genre) => (
                                        <li key={genre}>{genre}</li>
                                    ))}
                                    </ul>
                                    {/* Add create/edit/delete playlist functionality */}
                        </div>
                        <div className="playlists">
                            <h3>User's Playlists</h3>
                            {/*<ul>
                            {user.playlists.map((playlist) => (
                                <li key={playlist.id}>{playlist.name}</li>
                            ))}
                            </ul>
                            {/* Add create/edit/delete playlist functionality */} 
                        </div>
                    </div>
                </main>

                )}
        
        </div>
    );
}

export default ProfilePage;
