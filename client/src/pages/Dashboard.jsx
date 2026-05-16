import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingTutorial from '../components/OnboardingTutorial';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);
    const [allGroups, setAllGroups] = useState([]);
    const [discoverLoading, setDiscoverLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);

                // Show tutorial only if not seen in this session
                const hasSeenTutorial = sessionStorage.getItem('hasSeenTutorial');
                if (!hasSeenTutorial) {
                    setShowTutorial(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchDiscoverGroups = async () => {
            try {
                const res = await api.get('/groups');
                setAllGroups(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setDiscoverLoading(false);
            }
        };

        fetchUser();
        fetchDiscoverGroups();
    }, []);

    const handleTutorialComplete = () => {
        setShowTutorial(false);
        sessionStorage.setItem('hasSeenTutorial', 'true');
    };

    if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <AnimatePresence>
                {showTutorial && <OnboardingTutorial onComplete={handleTutorialComplete} />}
            </AnimatePresence>
            <div className="container">
                <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome, {user?.username}!</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {user?.role === 'admin' ? 'Admin Dashboard - Manage Groups' : 'Manage your groups and events here.'}
                    </p>
                </div>

                {/* Contest Section */}
                <ContestSection isAdmin={user?.role === 'admin'} />

                {user?.role === 'admin' ? (
                    <>
                        <AdminReportList />
                        <AdminGroupList />
                        <AdminUserList />
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '2rem' }}>My Groups</h2>
                            <Link to="/create-group" className="btn btn-primary">Create New Group</Link>
                        </div>

                        {user?.joinedGroups?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                                {user.joinedGroups.map((group, index) => {
                                    const groupImageUrl = group.image
                                        ? (group.image.startsWith('http') ? group.image : `${api.defaults.baseURL.replace('/api', '')}${group.image}`)
                                        : null;

                                    return (
                                        <motion.div
                                            key={group._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="glass-panel"
                                            style={{
                                                padding: '25px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                                minHeight: '250px',
                                                backgroundImage: groupImageUrl ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${groupImageUrl})` : undefined,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                justifyContent: 'flex-end',
                                                color: groupImageUrl ? 'white' : 'inherit',
                                                border: groupImageUrl ? 'none' : '1px solid var(--glass-border)'
                                            }}
                                        >
                                            <div style={{ position: 'relative', zIndex: 2 }}>
                                                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: groupImageUrl ? 'white' : 'inherit' }}>{group.name}</h3>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 12px',
                                                    background: groupImageUrl ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.1)',
                                                    color: groupImageUrl ? 'white' : 'var(--accent)',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    marginBottom: '15px',
                                                    width: 'fit-content',
                                                    backdropFilter: groupImageUrl ? 'blur(5px)' : 'none'
                                                }}>
                                                    {group.category}
                                                </span>
                                                <p style={{ color: groupImageUrl ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', marginBottom: '20px' }}>
                                                    {group.description.substring(0, 80)}...
                                                </p>
                                                <Link to={`/group/${group._id}`} className="btn btn-primary" style={{ textAlign: 'center', width: '100%' }}>
                                                    View Group
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>You haven't joined any groups yet.</p>
                                <Link to="/" className="btn btn-outline">Explore Groups</Link>
                            </div>
                        )}
                        {/* Discover Groups Section */}
                        {!discoverLoading && (
                            <DiscoverGroupsSection
                                joinedGroups={user?.joinedGroups || []}
                                allGroups={allGroups}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const DiscoverGroupsSection = ({ joinedGroups, allGroups }) => {
    // Filter out groups the user has already joined
    const joinedIds = new Set(joinedGroups.map(g => g._id));
    const discoverGroups = allGroups.filter(g => !joinedIds.has(g._id)).slice(0, 3); // Show top 3 suggestions

    if (discoverGroups.length === 0) return null;

    return (
        <div style={{ marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem' }}>Discover New Communities</h2>
                <Link to="/" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>See All</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {discoverGroups.map((group, index) => {
                    const groupImageUrl = group.image
                        ? (group.image.startsWith('http') ? group.image : `${api.defaults.baseURL.replace('/api', '')}${group.image}`)
                        : null;

                    return (
                        <motion.div
                            key={group._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel"
                            style={{
                                padding: '25px',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '250px',
                                justifyContent: 'flex-end',
                                border: groupImageUrl ? 'none' : '1px solid var(--glass-border)',
                                background: groupImageUrl ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${groupImageUrl})` : 'rgba(255, 255, 255, 0.03)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: groupImageUrl ? 'white' : 'inherit'
                            }}
                        >
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', color: groupImageUrl ? 'white' : 'inherit' }}>{group.name}</h3>
                                <span style={{
                                    display: 'inline-block',
                                    fontSize: '0.8rem',
                                    color: groupImageUrl ? 'white' : 'var(--accent)',
                                    background: groupImageUrl ? 'rgba(255,255,255,0.2)' : 'none',
                                    padding: groupImageUrl ? '2px 8px' : '0',
                                    borderRadius: '10px',
                                    backdropFilter: groupImageUrl ? 'blur(5px)' : 'none',
                                    marginBottom: '10px'
                                }}>
                                    {group.category}
                                </span>
                                <p style={{ color: groupImageUrl ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                    {group.description.substring(0, 80)}...
                                </p>
                                <Link to={`/group/${group._id}`} className="btn btn-primary" style={{ textAlign: 'center', fontSize: '0.9rem', padding: '8px' }}>
                                    View & Join
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};



const AdminReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports').then(res => {
            setReports(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleResolve = async (id) => {
        try {
            await api.put(`/reports/${id}/resolve`);
            setReports(reports.map(r => r._id === id ? { ...r, status: 'resolved' } : r));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <div style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Content Reports</h2>
            {reports.length === 0 ? <p>No reports found.</p> : (
                <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '10px' }}>Reporter</th>
                                <th style={{ padding: '10px' }}>Reported User</th>
                                <th style={{ padding: '10px' }}>Type</th>
                                <th style={{ padding: '10px' }}>Reason</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '10px' }}>{report.reporter?.username || 'Unknown'}</td>
                                    <td style={{ padding: '10px' }}>{report.reportedUser?.username || 'Unknown'}</td>
                                    <td style={{ padding: '10px' }}>{report.reportedPost ? 'Post' : 'User'}</td>
                                    <td style={{ padding: '10px' }}>{report.reason}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: report.status === 'resolved' ? 'var(--success)' : 'orange',
                                            color: 'white',
                                            fontSize: '0.8rem'
                                        }}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {report.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleResolve(report._id)}
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const AdminGroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/groups').then(res => {
            setGroups(res.data);
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        try {
            await api.delete(`/groups/${id}`);
            setGroups(groups.filter(g => g._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete group');
        }
    };

    const handleRestrict = async (id) => {
        try {
            const res = await api.put(`/groups/${id}/restrict`);
            setGroups(groups.map(g => g._id === id ? res.data : g));
        } catch (err) {
            console.error(err);
            alert('Failed to update group');
        }
    };

    if (loading) return <div>Loading groups...</div>;

    return (
        <div style={{ marginBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem' }}>All Groups</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {groups.map((group) => (
                    <div key={group._id} className="glass-panel" style={{ padding: '20px', position: 'relative', border: group.isRestricted ? '1px solid var(--error)' : '1px solid var(--glass-border)' }}>
                        {group.isRestricted && <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--error)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Restricted</div>}
                        <h3>{group.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '10px 0' }}>{group.description.substring(0, 80)}...</p>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button onClick={() => handleDelete(group._id)} style={{ background: 'var(--error)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                            <button onClick={() => handleRestrict(group._id)} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                {group.isRestricted ? 'Unrestrict' : 'Restrict'}
                            </button>
                            <Link to={`/group/${group._id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>View</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users').then(res => {
            setUsers(res.data);
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to delete user');
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem' }}>All Users</h2>
            </div>
            <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Username</th>
                            <th style={{ padding: '15px' }}>Email</th>
                            <th style={{ padding: '15px' }}>Role</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '15px' }}>{user.username}</td>
                                <td style={{ padding: '15px' }}>{user.email}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: user.role === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                                        color: user.role === 'admin' ? 'var(--success)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    {user.role !== 'admin' && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} access for ${user.username}?`)) {
                                                        try {
                                                            const res = await api.put(`/users/${user._id}/access-block`);
                                                            setUsers(users.map(u => u._id === user._id ? { ...u, isBlocked: res.data.isBlocked } : u));
                                                        } catch (e) { alert('Failed'); }
                                                    }
                                                }}
                                                style={{ color: user.isBlocked ? 'var(--success)' : 'orange', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                {user.isBlocked ? 'Unblock Access' : 'Block Access'}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Are you sure you want to ${user.isChatBlocked ? 'unblock' : 'block'} chat for ${user.username}?`)) {
                                                        try {
                                                            const res = await api.put(`/users/${user._id}/block`);
                                                            setUsers(users.map(u => u._id === user._id ? { ...u, isChatBlocked: res.data.isChatBlocked } : u));
                                                        } catch (e) { alert('Failed'); }
                                                    }
                                                }}
                                                style={{ color: user.isChatBlocked ? 'var(--success)' : 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                {user.isChatBlocked ? 'Unblock Chat' : 'Block Chat'}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ContestSection = ({ isAdmin }) => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sliderIndex, setSliderIndex] = useState(0);

    const fetchContests = async () => {
        try {
            const res = await api.get('/contests');
            setContests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContests();
    }, []);

    useEffect(() => {
        if (contests.length === 0) return;
        const interval = setInterval(() => {
            if (!showDetailsModal && !showCreateModal) {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % contests.length);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [showDetailsModal, showCreateModal, contests.length]);

    // Placeholder images for the slider
    const sliderImages = [
        {
            id: 1,
            url: '/img/ev1.jpg',
            title: 'Tech Hackathon 2025',
            description: 'Join the biggest coding event of the year.'
        },
        {
            id: 2,
            url: '/img/ev2.jpg',
            title: 'Digital Art Showcase',
            description: 'Unleash your creativity and win prizes.'
        },
        {
            id: 3,
            url: '/img/ev3.jpg',
            title: 'Gaming Championship',
            description: 'Battle for glory in our e-sports tournament.'
        }
    ];

    useEffect(() => {
        if (contests.length === 0) {
            const timer = setInterval(() => {
                setSliderIndex((prev) => (prev + 1) % sliderImages.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [contests.length]);

    const contest = contests[currentIndex];

    if (loading) return <div>Loading contests...</div>;


    if (contests.length === 0) return (
        <div className="glass-panel" style={{ padding: '0', marginBottom: '40px', overflow: 'hidden', position: 'relative', minHeight: '300px' }}>
            <h3 style={{
                position: 'absolute',
                top: '20px',
                left: '30px',
                zIndex: 10,
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '5px 15px',
                borderRadius: '20px',
                backdropFilter: 'blur(5px)',
                fontSize: '1.2rem'
            }}>
                Today's Contests
            </h3>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={sliderIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                        width: '100%',
                        height: '350px',
                        backgroundImage: `url(${sliderImages[sliderIndex].url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        padding: '40px 30px 30px',
                        color: 'white'
                    }}>
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ fontSize: '2.2rem', marginBottom: '5px', color: 'white' }}
                        >
                            {sliderImages[sliderIndex].title}
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ fontSize: '1.1rem', opacity: 0.9 }}
                        >
                            {sliderImages[sliderIndex].description}
                        </motion.p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div style={{ position: 'absolute', bottom: '20px', right: '30px', display: 'flex', gap: '8px', zIndex: 10 }}>
                {sliderImages.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSliderIndex(idx)}
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: idx === sliderIndex ? 'white' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>

            {isAdmin && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                    style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}
                >
                    Create First Contest
                </button>
            )}

            {/* Render Create Modal if needed */}
            {showCreateModal && <CreateContestModal onClose={() => setShowCreateModal(false)} onCreated={fetchContests} />}
        </div>
    );

    return (
        <>
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px', textAlign: 'left', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', minHeight: '300px' }}>


                <AnimatePresence mode='wait'>
                    <motion.div
                        key={contest._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{ width: '100%' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{contest.title}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                    {contest.description}
                                </p>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Deadline:</strong> {contest.deadline}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Participants:</strong> {contest.participants}
                                    </span>
                                </div>
                                <div style={{ background: 'rgba(192, 160, 128, 0.1)', padding: '15px', borderRadius: '10px', marginBottom: '20px', borderLeft: '4px solid var(--accent)' }}>
                                    <strong style={{ display: 'block', marginBottom: '5px', color: 'var(--accent-hover)' }}>🏆 Prize</strong>
                                    {contest.prize}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                                {isAdmin ? (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="btn btn-primary"
                                        style={{ textAlign: 'center' }}
                                    >
                                        Create Contest
                                    </button>
                                ) : (
                                    <Link to={`/contest-registration/${contest._id}`} className="btn btn-primary" style={{ textAlign: 'center' }}>
                                        Register Now
                                    </Link>
                                )}
                                <button
                                    onClick={() => setShowDetailsModal(true)}
                                    className="btn btn-outline"
                                    style={{ textAlign: 'center' }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                    {contests.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: idx === currentIndex ? 'var(--accent)' : 'var(--text-secondary)',
                                opacity: idx === currentIndex ? 1 : 0.3,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>

                {isAdmin && (
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this contest?')) {
                                try {
                                    await api.delete(`/contests/${contest._id}`);
                                    fetchContests(); // Refresh
                                } catch (err) {
                                    alert('Failed to delete contest');
                                }
                            }
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            background: 'var(--error)',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            zIndex: 20
                        }}
                    >
                        Delete Contest
                    </button>
                )}
            </div>

            {/* Details Modal Portal */}
            {createPortal(
                <AnimatePresence>
                    {showDetailsModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)', zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(5px)',
                            padding: '20px'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-panel"
                                style={{
                                    maxWidth: '600px',
                                    width: '100%',
                                    background: 'var(--bg-primary)',
                                    maxHeight: '90vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '0',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '20px 30px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '1.5rem' }}>{contest.title}</h2>
                                    <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 0.5 }}>&times;</button>
                                </div>

                                <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                                    <div style={{ marginBottom: '25px' }}>
                                        <h3 style={{ marginBottom: '10px' }}>About the Challenge</h3>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{contest.details || contest.description}</p>
                                    </div>

                                    {contest.rules && contest.rules.length > 0 && (
                                        <div style={{ marginBottom: '25px' }}>
                                            <h3 style={{ marginBottom: '10px' }}>Rules & Guidelines</h3>
                                            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                                                {contest.rules.map((rule, i) => (
                                                    <li key={i} style={{ marginBottom: '8px' }}>{rule}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '10px' }}>
                                        <h3 style={{ marginBottom: '10px' }}>Prize</h3>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{contest.prize}</p>
                                    </div>
                                </div>

                                <div style={{ padding: '20px 30px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
                                    <Link
                                        to={`/contest-registration/${contest._id}`}
                                        className="btn btn-primary"
                                        style={{ display: 'block', textAlign: 'center', width: '100%' }}
                                    >
                                        Proceed to Registration
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Create Contest Modal */}
            {showCreateModal && <CreateContestModal onClose={() => setShowCreateModal(false)} onCreated={fetchContests} />}
        </>
    );
};

const CreateContestModal = ({ onClose, onCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        details: '',
        rules: '', // multiline string, will split by newlines
        prize: '',
        deadline: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const rulesArray = formData.rules.split('\n').filter(r => r.trim() !== '');
            await api.post('/contests', { ...formData, rules: rulesArray });
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to create contest');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-primary)', padding: '30px' }}>
                <h2 style={{ marginBottom: '20px' }}>Create New Contest</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Contest Title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    < textarea
                        placeholder="Short Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                    />
                    <textarea
                        placeholder="Detailed Description (About the Challenge)"
                        value={formData.details}
                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                        rows={5}
                    />
                    <textarea
                        placeholder="Rules (One per line)"
                        value={formData.rules}
                        onChange={e => setFormData({ ...formData, rules: e.target.value })}
                        rows={5}
                    />
                    <input
                        type="text"
                        placeholder="Prize"
                        value={formData.prize}
                        onChange={e => setFormData({ ...formData, prize: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Deadline (e.g., Ends in 2 days)"
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        required
                    />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Creating...' : 'Create Contest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default Dashboard;
