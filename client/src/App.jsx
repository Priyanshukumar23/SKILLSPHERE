import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
      <ThemeHandler />
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

// Helper component to manage body class for theme
const ThemeHandler = () => {
  const location = window.location; // Simple check or use useLocation
  // We need useLocation from router
  // Since we are inside Router now, we can use useLocation
  return <ThemeController />;
};

const ThemeController = () => {
  const location = useLocation();

  // List of pages that should keep the Dark Theme
  const darkPages = ['/login', '/register', '/about'];

  if (darkPages.includes(location.pathname)) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  return null;
};

export default App;
