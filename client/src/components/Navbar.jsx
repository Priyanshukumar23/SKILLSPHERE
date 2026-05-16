import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, LogOut, Menu, X } from 'lucide-react';
import api from '../utils/api';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const checkUser = async () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Also fetch fresh data to sync profile picture
        try {
            if (localStorage.getItem('token')) {
                const res = await api.get('/auth/me');
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            }
        } catch (err) {
            console.error('Failed to sync user data in navbar', err);
        }
    };

    useEffect(() => {
        checkUser();
        window.addEventListener('userUpdated', checkUser);
        return () => window.removeEventListener('userUpdated', checkUser);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('hasSeenTutorial');
        setUser(null);
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="navbar glass-panel">
            <Link to="/" className="nav-brand">
                <img src="/SkillSphere.png" alt="Logo" className="nav-logo" />
                <span>SkillSphere</span>
            </Link>

            <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                <Link to="/about" className="nav-link">About Us</Link>
                <Link to="/explore" className="nav-link">Posts</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/profile" className="nav-link">Profile</Link>
                        <Link to="/chat" className="nav-link">Global Chat</Link>

                        <div className="user-pill">
                            {user.profilePicture ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5003'}${user.profilePicture}`}
                                    alt={user.username}
                                    className="user-avatar"
                                />
                            ) : (
                                <div className="user-initial-avatar">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="user-name">{user.username}</span>
                        </div>

                        <button onClick={handleLogout} className="logout-btn" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
