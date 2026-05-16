import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, ThumbsDown, Music, Volume2, VolumeX, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const PostCard = ({ post, user, onDelete }) => {
    const [likes, setLikes] = useState(post.likes);
    const [dislikes, setDislikes] = useState(post.dislikes);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const audioRef = useRef(null);

    const isLiked = user && likes.includes(user._id);
    const isDisliked = user && dislikes.includes(user._id);

    const handleLike = async () => {
        try {
            const res = await api.put(`/posts/like/${post._id}`);
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDislike = async () => {
        try {
            const res = await api.put(`/posts/dislike/${post._id}`);
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/posts/comment/${post._id}`, { text: newComment });
            setComments(res.data);
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ marginBottom: '30px', overflow: 'hidden', padding: 0 }}
        >
            {/* Header */}
            <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                        {post.user && post.user.profilePicture ? (
                            <img src={`${import.meta.env.VITE_API_URL}${post.user.profilePicture}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            post.user ? post.user.username[0].toUpperCase() : '?'
                        )}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {post.user ? post.user.username : 'Unknown User'}
                            {post.isHidden && <span style={{ fontSize: '0.7rem', background: 'var(--text-secondary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Starts Hidden</span>}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {/* Admin Actions */}
                    {user && user.role === 'admin' && (
                        <>
                            <button onClick={async () => {
                                try {
                                    await api.put(`/posts/${post._id}/hide`);
                                    // Ideally notify parent to refresh or just force update UI visually
                                    window.location.reload(); // Quick refresh to reflect state
                                } catch (e) {
                                    alert('Failed to hide post');
                                }
                            }} style={{ background: 'var(--text-secondary)', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                {post.isHidden ? 'Unhide' : 'Hide'}
                            </button>
                            <button onClick={() => onDelete(post._id)} style={{ background: 'var(--error)', border: 'none', color: 'white', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Delete
                            </button>
                        </>
                    )}

                    {/* User Actions */}
                    {post.user && user && user._id === post.user._id ? (
                        <button onClick={() => onDelete(post._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                            <Trash2 size={20} />
                        </button>
                    ) : (
                        // Report Button for others
                        user && (
                            <button onClick={() => setShowReportModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Report
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Image */}
            <div style={{ position: 'relative' }}>
                {post.isHidden && user?.role !== 'admin' ? (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>Post Hidden</div>
                ) : (
                    <>
                        <img
                            src={`${import.meta.env.VITE_API_URL}${post.image}`}
                            alt="Post"
                            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', opacity: post.isHidden ? 0.5 : 1 }}
                        />

                        {/* Music Controls Overlay */}
                        {post.music && (
                            <div style={{
                                position: 'absolute',
                                bottom: '15px',
                                right: '15px',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '8px 12px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <audio ref={audioRef} src={`${import.meta.env.VITE_API_URL}${post.music}`} loop />
                                <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
                                    <Music size={18} className={isPlaying ? 'spin-animation' : ''} />
                                </button>
                                <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
                                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Actions */}
            <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <button onClick={handleLike} style={{ background: 'none', border: 'none', color: isLiked ? 'var(--error)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                        {likes.length}
                    </button>
                    <button onClick={handleDislike} style={{ background: 'none', border: 'none', color: isDisliked ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <ThumbsDown size={24} fill={isDisliked ? 'currentColor' : 'none'} />
                        {dislikes.length}
                    </button>
                    <button onClick={() => setShowComments(!showComments)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <MessageCircle size={24} />
                        {comments.length}
                    </button>
                </div>

                {/* Caption */}
                <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{post.user ? post.user.username : 'Unknown'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{post.caption}</span>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', paddingRight: '5px' }}>
                                {comments.map((comment, index) => (
                                    <div key={index} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: 'bold', marginRight: '5px' }}>
                                            {comment.user ? comment.user.username : 'User'}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{comment.text}</span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleComment} style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--bg-primary)' // Light bg for input
                                    }}
                                />
                                <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold' }}>Post</button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ padding: '20px', width: '300px', background: 'var(--bg-primary)' }}>
                        <h3>Report Post</h3>
                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Reason:</label>
                            <select
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                <option value="">Select a reason...</option>
                                <option value="sexual content">Sexual Content</option>
                                <option value="abusive">Abusive / Harassment</option>
                                <option value="spam">Spam</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowReportModal(false)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => {
                                if (!reportReason) return alert('Please select a reason');
                                api.post('/reports', { reportedPost: post._id, reportedUser: post.user._id, reason: reportReason })
                                    .then(() => { alert('Report submitted'); setShowReportModal(false); })
                                    .catch(() => alert('Failed to report'));
                            }} style={{ padding: '5px 10px', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PostCard;
