import React from 'react';
import { Route, Redirect } from 'react-router-dom';

function SpotifyCallback({ location }) {
  React.useEffect(() => {
    // You can process the callback data here
    // For example, extract a token from the query parameters (if provided)
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    // Store the token in local storage or context
    localStorage.setItem('spotifyToken', token);

    // Redirect to a different page after successful login
    // <Redirect to="/profile" />
  }, [location]);

  return (
    <div>
      Processing Spotify login...
      {/* Redirect or show a success message */}
    </div>
  );
}

// In your App or Router component
function App() {
  return (
    <Route path="/spotify/redirect" component={SpotifyCallback} />
  );
}
