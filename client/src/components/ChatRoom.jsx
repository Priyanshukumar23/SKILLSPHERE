import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { Send, Image, BarChart2, Lock } from 'lucide-react'; // Example icons

const ChatRoom = ({ groupId, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5003');
        setSocket(newSocket);

        newSocket.emit('join_group', { groupId, username: user.username });

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        newSocket.on('poll_updated', (updatedMessage) => {
            setMessages(prev => prev.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            ));
        });

        newSocket.on('message_updated', (updatedMessage) => {
            setMessages(prev => prev.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            ));
        });

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${groupId}`);
                setMessages(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();

        return () => newSocket.close();
    }, [groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!newMessage && !showPollCreator && !pollQuestion) || (showPollCreator && (!pollQuestion || pollOptions.some(opt => !opt)))) return;

        if (showPollCreator) {
            const messageData = {
                groupId,
                senderId: user._id,
                type: 'poll',
                content: 'Poll',
                pollQuestion,
                pollOptions: pollOptions.map(opt => ({ text: opt, votes: [] }))
            };
            socket.emit('send_message', messageData);
            setShowPollCreator(false);
            setPollQuestion('');
            setPollOptions(['', '']);
        } else {
            const messageData = {
                groupId,
                senderId: user._id,
                type: 'text',
                content: newMessage,
            };
            socket.emit('send_message', messageData);
            setNewMessage('');
        }
    };

    const handleVote = (messageId, optionIndex) => {
        socket.emit('vote_poll', { messageId, optionIndex, userId: user._id });
    };

    const handleRestrictMessage = (messageId) => {
        if (window.confirm('Restrict this message content?')) {
            socket.emit('restrict_message', { messageId, adminId: user._id });
        }
    };

    const handleUnrestrictMessage = (messageId) => {
        if (window.confirm('Unrestrict this message content?')) {
            socket.emit('unrestrict_message', { messageId, adminId: user._id });
        }
    };

    return (
        <div className="glass-panel" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                <h3>Group Chat</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg, idx) => {
                    if (msg.type === 'system') {
                        return (
                            <div key={idx} style={{ textAlign: 'center', margin: '10px 0', opacity: 0.7 }}>
                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    {msg.content}
                                </span>
                            </div>
                        );
                    }

                    const senderId = msg.sender?._id || msg.sender;
                    const currentUserId = user._id;
                    const isOwn = String(senderId) === String(currentUserId);

                    return (
                        <div key={idx} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                            {!isOwn && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', background: 'var(--accent)', flexShrink: 0 }}>
                                        {msg.sender?.profilePicture ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${msg.sender.profilePicture}`} alt={msg.sender.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                                                {msg.sender?.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {msg.sender?.username || 'User'}
                                        {user.role === 'admin' && (
                                            msg.isRestricted ? (
                                                <span
                                                    onClick={() => handleUnrestrictMessage(msg._id)}
                                                    style={{ marginLeft: '8px', color: 'var(--success)', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Unrestrict
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => handleRestrictMessage(msg._id)}
                                                    style={{ marginLeft: '8px', color: 'var(--error)', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Restrict
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                background: isOwn ? 'linear-gradient(135deg, var(--accent), var(--accent-hover))' : 'var(--bg-secondary)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                borderTopRightRadius: isOwn ? '2px' : '12px',
                                borderTopLeftRadius: !isOwn ? '2px' : '12px'
                            }}>
                                {msg.type === 'text' && <p>{msg.content}</p>}
                                {msg.type === 'poll' && (
                                    <div>
                                        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{msg.pollQuestion}</p>
                                        {msg.pollOptions.map((opt, i) => {
                                            const totalVotes = msg.pollOptions.reduce((acc, curr) => acc + curr.votes.length, 0);
                                            const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                                            const hasVoted = opt.votes.includes(user._id);

                                            return (
                                                <div key={i} onClick={() => handleVote(msg._id, i)} style={{
                                                    marginBottom: '8px',
                                                    cursor: 'pointer',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, bottom: 0,
                                                        width: `${percentage}%`,
                                                        background: 'rgba(255,255,255,0.1)',
                                                        zIndex: 1
                                                    }} />
                                                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{opt.text} {hasVoted && '✓'}</span>
                                                        <span>{percentage}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>Total votes: {msg.pollOptions.reduce((acc, curr) => acc + curr.votes.length, 0)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
                {showPollCreator && (
                    <div style={{ marginBottom: '10px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px' }}>
                        <input
                            placeholder="Ask a question..."
                            value={pollQuestion}
                            onChange={e => setPollQuestion(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)', borderRadius: '4px' }}
                        />
                        {pollOptions.map((opt, i) => (
                            <input
                                key={i}
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={e => {
                                    const newOpts = [...pollOptions];
                                    newOpts[i] = e.target.value;
                                    setPollOptions(newOpts);
                                }}
                                style={{ width: '100%', padding: '8px', marginBottom: '4px', background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)', borderRadius: '4px' }}
                            />
                        ))}
                        <button onClick={() => setPollOptions([...pollOptions, ''])} style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', marginBottom: '8px' }}>+ Add Option</button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                    {!showPollCreator && (
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    )}

                    {!showPollCreator ? (
                        <button type="button" onClick={() => setShowPollCreator(true)} style={{ background: 'none', color: 'var(--text-secondary)' }}>
                            <BarChart2 />
                        </button>
                    ) : (
                        <button type="button" onClick={() => setShowPollCreator(false)} style={{ background: 'none', color: 'var(--error)' }}>
                            Cancel
                        </button>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>
                        <Send size={20} />
                    </button>
                </form>
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '10px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Lock size={12} /> Secure
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
