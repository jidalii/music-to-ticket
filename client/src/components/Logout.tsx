function Logout() {
    const handleLogout = () => {
      localStorage.removeItem('spotifyToken');
      // Optionally notify backend about logout
      // Redirect to login page or show logout message
    };
  
    return (
      <button onClick={handleLogout}>Logout</button>
    );
  }