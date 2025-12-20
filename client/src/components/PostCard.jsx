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
                        <h4 style={{ margin: 0 }}>{post.user ? post.user.username : 'Unknown User'}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                {post.user && user && user._id === post.user._id && (
                    <button onClick={() => onDelete(post._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            {/* Image */}
            <div style={{ position: 'relative' }}>
                <img
                    src={`${import.meta.env.VITE_API_URL}${post.image}`}
                    alt="Post"
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
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
        </motion.div>
    );
};

export default PostCard;
