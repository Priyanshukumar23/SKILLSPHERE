import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, Link } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';

const GroupDetails = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupRes = await api.get(`/groups/${id}`);
                setGroup(groupRes.data);

                const eventsRes = await api.get(`/events/group/${id}`);
                setEvents(eventsRes.data);

                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                if (groupRes.data.members.some(member => member._id === userRes.data._id)) {
                    setIsMember(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleJoin = async () => {
        try {
            await api.post(`/groups/${id}/join`);
            setIsMember(true);
            // Refresh group data
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return;
        try {
            await api.post(`/groups/${id}/leave`);
            setIsMember(false);
            // Refresh group data
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
    if (!group) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Group not found</div>;

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container">
                <div className="glass-panel" style={{
                    padding: '40px',
                    marginBottom: '40px',
                    backgroundImage: group.image ? `linear-gradient(var(--glass), var(--glass)), url(${group.image.startsWith('http') ? group.image : api.defaults.baseURL.replace('/api', '') + group.image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>{group.name}</h1>
                            <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', borderRadius: '20px', fontSize: '1rem', marginBottom: '20px' }}>
                                {group.category}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {isMember && (
                                <>
                                    <Link to={`/group/${id}/create-event`} state={{ groupName: group.name }} className="btn btn-outline">
                                        Create Event
                                    </Link>
                                    <button onClick={handleLeave} className="btn" style={{ background: 'var(--error)', color: 'white' }}>
                                        Leave Group
                                    </button>
                                </>
                            )}
                            {!isMember && user?.role !== 'admin' && (
                                <button onClick={handleJoin} className="btn btn-primary">Join Group</button>
                            )}
                        </div>
                    </div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>{group.description}</p>
                </div>

                {/* Events Section */}
                <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Upcoming Events</h2>
                    {events.length > 0 ? (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {events.map(event => (
                                <div key={event._id} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{event.title}</h3>
                                    <p style={{ color: 'var(--accent)', marginBottom: '10px', fontWeight: '500' }}>
                                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()} • {event.location}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No events scheduled yet.</p>
                    )}
                </div>

                {/* Chat Section */}
                {(isMember || user?.role === 'admin') && user && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Community Chat</h2>
                        <ChatRoom groupId={id} user={user} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupDetails;
