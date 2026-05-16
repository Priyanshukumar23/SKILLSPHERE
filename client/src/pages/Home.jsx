import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setGroups(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchGroups();
    }, []);

    return (
        <div className="home-container">
            <div className="container">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-section"
                >
                    <h1 className="hero-title">
                        Find Your Tribe.
                    </h1>
                    <p className="hero-subtitle">
                        Connect with people who share your passions. Join local clubs, attend events, and build lasting friendships.
                    </p>
                    <button
                        onClick={() => document.getElementById('groups-section').scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary hero-btn"
                    >
                        Explore Groups
                    </button>
                </motion.div>

                {/* Groups Grid */}
                <h2 id="groups-section" className="section-title">Popular Groups</h2>
                <div className="groups-grid">
                    {groups.map((group, index) => {
                        const groupImageUrl = group.image
                            ? (group.image.startsWith('http') ? group.image : `${api.defaults.baseURL.replace('/api', '')}${group.image}`)
                            : null;

                        return (
                            <motion.div
                                key={group._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-panel group-card"
                                style={{
                                    backgroundImage: groupImageUrl ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${groupImageUrl})` : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    color: groupImageUrl ? 'white' : 'inherit',
                                    border: groupImageUrl ? 'none' : '1px solid var(--glass-border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    minHeight: '280px',
                                    padding: '25px'
                                }}
                            >
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <h3 className="group-name" style={{ color: groupImageUrl ? 'white' : 'inherit', fontSize: '1.8rem', marginBottom: '8px' }}>{group.name}</h3>
                                    <span className="group-category" style={{
                                        background: groupImageUrl ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.1)',
                                        color: groupImageUrl ? 'white' : 'var(--accent)',
                                        backdropFilter: groupImageUrl ? 'blur(5px)' : 'none'
                                    }}>
                                        {group.category}
                                    </span>
                                    <p className="group-description" style={{ color: groupImageUrl ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', marginTop: '15px' }}>
                                        {group.description.substring(0, 80)}...
                                    </p>
                                    <Link to={`/group/${group._id}`} className="btn btn-primary" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>
                                        View Group
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;
