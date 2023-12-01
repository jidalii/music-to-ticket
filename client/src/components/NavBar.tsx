import React from 'react';
import { Link } from 'react-router-dom';
import '../tailwind.css'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


function NavBar() {
    return (
        <nav id = "nav" className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
          
            {/* Center links horizontally and add spacing */}
            
            <div className="flex justify-center space-x-20">
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/">Home</Link>
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/gallery">Gallery</Link>
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/profile">Profile</Link>
              <Link className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium" to="/about">About</Link>
            </div>
            <Avatar>
              <AvatarImage  />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>
    )  
}
export default NavBar;