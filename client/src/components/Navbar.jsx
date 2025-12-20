import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, LogOut } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

        // Listen for updates from Profile page
        window.addEventListener('userUpdated', checkUser);

        return () => {
            window.removeEventListener('userUpdated', checkUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('hasSeenTutorial');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            zIndex: 1000,
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                <Users size={28} color="var(--accent)" />
                <span>HobbyHub</span>
            </Link>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/about" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>About Us</Link>
                <Link to="/explore" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Posts</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Dashboard</Link>
                        <Link to="/profile" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Profile</Link>
                        <Link to="/chat" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Global Chat</Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                            {user.profilePicture ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5003'}${user.profilePicture}`}
                                    alt={user.username}
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user.username}</span>
                        </div>

                        <button onClick={handleLogout} style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
