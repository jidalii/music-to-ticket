import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/Login'; // Assuming HomePage is in the same directory
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Router>
      <NavBar />

      {/* Add padding to the top of your main content */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;