import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
  
interface Image {
    url: string
    width: Number
    height: Number
  }

  interface Event {
    name: string,
    date: string,
    time: string,
    url: string,
    images_url: string
  }
  interface Artist {
      id: string,
      name: string,
      image: Image[],
      ticket: Event[]
  }

  const EventPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // const [eventDetails, setEventDetails] = useState<Event | null>(null);
    const [artistList, setArtistList] = useState<Artist[] | null>(null);
  
    useEffect(() => {
      const fetchEventDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/spotify/v0/artist/${id}`, { withCredentials: true });
          console.log("event details", response.data)
        //   setEventDetails(response.data);
        setArtistList(response.data);
        } catch (error) {
          console.error('Error fetching event details:', error);
        }
      };
  
      fetchEventDetails();
    }, [id]);
  
    if (artistList !== null) {
        const selectedArtist = artistList.find((artist) => artist.id === id);

        if (selectedArtist){
        return (
            <div className = "flex justify-center w-full">
            <ul role="list" className="divide-y divide-gray-100 flex flex-col items-center"></ul>
            {artistList.map((artist) => (
                <div>
                    {artist.ticket.map((ticket, index) => (
                        <div key={index}>
                            {ticket ? (
                            <div>
                            <p>{ticket.date}</p>
                            <p>{ticket.name}</p>
                            <img src ={ticket.images_url} alt = "hello"/>
                            </div>
                            ):(
                            <p>no info</p>
                            )
                        }
                        </div>
                    ))}
                </div>
            ))} 
            </div>
        )
        }else{
            return <p>No artist found with the provided ID</p>
        }
    }else {
      return "loading";
    }
  };
  
  export default EventPage;