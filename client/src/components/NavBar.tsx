// import React from 'react';
import '../NavBar.css'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../tailwind.css'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  username: string,
  email: string,
  avatar: string
}

function NavBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/auth/user-data', { withCredentials: true });
            setUser(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchUserData();
    }, []);


    return (
        <nav id = "nav" className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
          
            
            <div className="flex justify-center space-x-20">
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/">Home</Link>
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/gallery">Gallery</Link>
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/profile">Profile</Link>
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/about">About</Link>
            </div>
            {user ? (
            <div class="dropdown">
            <Avatar>
              <AvatarImage  />
              <AvatarFallback>
                <img src={user.avatar} alt="CN"/>
              </AvatarFallback>
              </Avatar>
              <div class="dropdown-content">
                    <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/profile">My Profile</Link>
                    <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/gallery">My Gallery</Link>
                    <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/about">About us</Link>
                    <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/">Log out</Link>
              </div>
            </div>
            ):(
              <div class="dropdown">
              <Avatar>
              <AvatarImage  />
              <AvatarFallback>
               CN
              </AvatarFallback>
              </Avatar>
              <div class="dropdown-content">
                <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/about">About us</Link>
                <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/">Log in</Link>
              </div>
            </div>
            )}
          </div>
        </div>
      </nav>
    )  
}
export default NavBar;