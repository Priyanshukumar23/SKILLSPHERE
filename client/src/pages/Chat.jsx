import { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Chat.css';
import api from '../utils/api';
import Filter from 'bad-words';
const filter = new Filter();

// Initialize socket outside component to prevent multiple connections
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5003');

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [messageInp, setMessageInp] = useState('');
    const [name, setName] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [joinName, setJoinName] = useState('');
    const [showRules, setShowRules] = useState(true);
    const nameRef = useRef(name);
    const chatContainerRef = useRef(null);
    const [userProfile, setUserProfile] = useState(null);
    const audioRef = useRef(new Audio('/notification.mp3'));

    useEffect(() => {
        // Pre-load audio
        audioRef.current.load();
    }, []);

    const enableAudio = () => {
        // Play silently to unlock audio context on user gesture
        audioRef.current.play().then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }).catch(e => console.log('Audio enable failed', e));
    };

    useEffect(() => {
        nameRef.current = name;
    }, [name]);

    useEffect(() => {
        // Socket event listeners
        socket.on('user-joined', (data) => {
            const name = typeof data === 'object' ? data.name : data;
            appendMessage({ content: `${name} joined the chat`, type: 'system' });
        });

        socket.on('receive', (data) => {
            const isMe = data.name === nameRef.current;
            if (!isMe) {
                try {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(err => console.log('Audio playback failed:', err));
                } catch (e) {
                    console.error('Audio error', e);
                }
            }
            appendMessage({
                id: data.id, // Use ID from server
                content: data.message,
                name: data.name,
                profilePicture: data.profilePicture,
                position: isMe ? 'chat-left' : 'chat-right',
                type: 'text'
            });
        });

        socket.on('left', (data) => {
            const name = typeof data === 'object' ? data.name : data;
            if (name) appendMessage({ content: `${name} left the chat`, type: 'system' });
        });

        socket.on('global_message_restricted', ({ messageId }) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === messageId && !msg.isRestricted) {
                    return { ...msg, originalContent: msg.content, content: '***', isRestricted: true };
                }
                return msg;
            }));
        });

        socket.on('global_message_unrestricted', ({ messageId }) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === messageId && msg.isRestricted) {
                    return { ...msg, content: msg.originalContent || msg.content, isRestricted: false };
                }
                return msg;
            }));
        });

        return () => {
            socket.off('user-joined');
            socket.off('receive');
            socket.off('left');
            socket.off('global_message_restricted');
            socket.off('global_message_unrestricted');
        };
    }, []);

    // ... (auto-scroll useEffect remains same)

    const appendMessage = (msgData) => {
        setMessages(prev => [...prev, { ...msgData, id: Date.now() }]);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (joinName.trim()) {
            setName(joinName);
            setHasJoined(true);
            socket.emit('new-user-joined', { name: joinName, profilePicture: null });
        }
    };

    useEffect(() => {
        // Auto-join if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setName(user.username);
            setUserProfile(user.profilePicture); // Assume login response includes this or fetch it
            setHasJoined(true);

            // Just emit, backend handles broadcasting join
            // We need to fetch latest profile info ideally, but for now use stored or fetch
            api.get('/auth/me').then(res => {
                setUserProfile(res.data.profilePicture);
                socket.emit('new-user-joined', { name: user.username, profilePicture: res.data.profilePicture });
            }).catch(() => {
                socket.emit('new-user-joined', { name: user.username, profilePicture: null });
            });
        }
    }, []);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkAdmin();
    }, []);

    const handleBlockUser = async (username) => {
        if (!window.confirm(`Are you sure you want to block ${username} from Global Chat?`)) return;
        try {
            // First find user ID by username (we might need a new route or just fetch all users and find, but let's assume we can get it)
            // Ideally message should contain senderId. For now, let's fetch user by username via a new admin route or search.
            // Simplified: Fetch all users (admin only) and find the one.
            const res = await api.get('/users');
            const userToBlock = res.data.find(u => u.username === username);

            if (userToBlock) {
                await api.put(`/users/${userToBlock._id}/block`);
                alert(`User ${username} has been blocked/unblocked.`);
            } else {
                alert('User not found.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to block user.');
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        const message = messageInp.trim();
        if (!message) return;

        const cleanMessage = filter.clean(message);

        // Removed local append to prevent duplicates
        // appendMessage({ ... });

        socket.emit('send', { message, name, profilePicture: userProfile });
        setMessageInp('');
    };

    // ... (rest of render)

    return (
        <div className="chat-page-container">
            {/* Rules Modal */}
            <div className={`chat-join-overlay ${showRules ? 'visible' : 'hidden'}`} style={{ display: showRules ? 'flex' : 'none', zIndex: 2001 }}>
                <div className="chat-join-box" style={{ maxWidth: '500px', textAlign: 'left' }}>
                    {/* ... (rules content) ... */}
                    <div style={{ marginBottom: '20px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '10px' }}>Welcome to the global community chat! To keep this space safe and fun, please follow these rules:</p>
                        <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                            <li>Be respectful to everyone. Harassment will not be tolerated.</li>
                            <li>No hate speech, NSFW content, or spamming.</li>
                            <li>Do not share personal or sensitive information.</li>
                            <li>Keep the conversation friendly and constructive.</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => {
                            setShowRules(false);
                            enableAudio();
                        }}
                        className="chat-btn"
                        style={{ width: '100%' }}
                    >
                        I Agree & Enter
                    </button>
                </div>
            </div>

            {/* Join Overlay (only show if rules are accepted) */}
            {!hasJoined && !showRules && (
                <div className="chat-join-overlay">
                    <div className="chat-join-box">
                        <h2>Join Anonymous Chat</h2>
                        <form onSubmit={handleJoin}>
                            <input
                                type="text"
                                className="chat-input"
                                style={{ marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}
                                placeholder="Enter your alias..."
                                value={joinName}
                                onChange={(e) => setJoinName(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="chat-btn" style={{ width: '100%' }}>Join Chat</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="chat-logo-area">
                <span className="chat-brand">Global Chats</span>
            </div>

            <div className="chat-container" ref={chatContainerRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message-wrapper ${msg.position || 'system'}`}>
                        {msg.type === 'system' ? (
                            <div className="chat-system-message" style={{ textAlign: 'center', width: '100%', color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '10px 0' }}>{msg.content}</div>
                        ) : (
                            <>
                                {msg.position === 'chat-right' && (
                                    <div className="chat-avatar" style={{ marginRight: '10px', width: '35px', height: '35px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                        {msg.profilePicture ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${msg.profilePicture}`} alt={msg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{msg.name?.[0]?.toUpperCase()}</div>
                                        )}
                                    </div>
                                )}
                                <div className={`chat-message ${msg.position}`}>
                                    {msg.position === 'chat-right' && (
                                        <div className="chat-name" style={{ fontSize: '0.75rem', marginBottom: '2px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {msg.name}
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button
                                                        onClick={() => handleBlockUser(msg.name)}
                                                        style={{
                                                            background: 'var(--error)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '2px 6px',
                                                            fontSize: '0.6rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Block
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const user = JSON.parse(localStorage.getItem('user'));
                                                            if (msg.isRestricted) {
                                                                socket.emit('unrestrict_global_message', { messageId: msg.id, adminId: user._id });
                                                            } else {
                                                                socket.emit('restrict_global_message', { messageId: msg.id, adminId: user._id });
                                                            }
                                                        }}
                                                        style={{
                                                            background: msg.isRestricted ? 'var(--accent)' : 'var(--text-secondary)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '2px 6px',
                                                            fontSize: '0.6rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {msg.isRestricted ? 'Unrestrict' : 'Restrict'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {msg.content}
                                </div>
                                {msg.position === 'chat-left' && (
                                    <div className="chat-avatar right" style={{ marginLeft: '10px', width: '35px', height: '35px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                        {msg.profilePicture ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${msg.profilePicture}`} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{name?.[0]?.toUpperCase()}</div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="chat-send-section">
                <form className="chat-send-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        name="messageInp"
                        id="messageInp"
                        className="chat-input"
                        placeholder="Type a message..."
                        autoComplete="off"
                        value={messageInp}
                        onChange={(e) => setMessageInp(e.target.value)}
                        disabled={!hasJoined}
                    />
                    <button className="chat-btn" type="submit" disabled={!hasJoined}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
