import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '80px', padding: '60px 0' }}
                >
                    <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(to right, #2C2C2C, #595959)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Find Your Tribe.
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Connect with people who share your passions. Join local clubs, attend events, and build lasting friendships.
                    </p>
                    <button
                        onClick={() => document.getElementById('groups-section').scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary"
                        style={{ padding: '15px 40px', fontSize: '1.1rem' }}
                    >
                        Explore Groups
                    </button>
                </motion.div>

                {/* Groups Grid */}
                <h2 id="groups-section" style={{ fontSize: '2rem', marginBottom: '30px', scrollMarginTop: '100px' }}>Popular Groups</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {groups.map((group, index) => (
                        <motion.div
                            key={group._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel"
                            style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}
                        >
                            <div style={{ height: '150px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
                                {group.image ? (
                                    <img src={group.image} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{group.name}</h3>
                            <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '15px', width: 'fit-content' }}>
                                {group.category}
                            </span>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', flex: 1 }}>
                                {group.description.substring(0, 100)}...
                            </p>
                            <Link to={`/group/${group._id}`} className="btn btn-outline" style={{ textAlign: 'center' }}>
                                View Group
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
