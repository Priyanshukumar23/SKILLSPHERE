import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import CreateEvent from './pages/CreateEvent';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ContestRegistration from './pages/ContestRegistration';
import About from './pages/About';
import Explore from './pages/Explore';

function App() {
  return (
    <Router>
      <ThemeInitializer />
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/group/:id" element={<GroupDetails />} />
          <Route path="/group/:groupId/create-event" element={<CreateEvent />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/contest-registration/:contestId" element={<ContestRegistration />} />
        </Routes>
      </div>
    </Router>
  );
}

// Helper component to initialize theme globally
const ThemeInitializer = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);
  return null;
};

export default App;
