import { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Plus } from 'lucide-react';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, postsRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/posts')
                ]);
                setUser(userRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePostCreated = (newPost) => {
        // Optimistically add the new post to the top of the feed - populate user manually for correct display
        const postWithUser = { ...newPost, user: { ...user, _id: user._id }, comments: [] };
        setPosts([postWithUser, ...posts]);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete post');
        }
    };

    if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading feed...</div>;

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '80px', background: 'var(--bg-primary)' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Explore</h1>

                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post._id} post={post} user={user} onDelete={handleDeletePost} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                        <p>No posts yet. Be the first to share something!</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Creating Post */}
            <button
                onClick={() => setShowCreateModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 90
                }}
            >
                <Plus size={30} />
            </button>

            {showCreateModal && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={handlePostCreated}
                />
            )}
        </div>
    );
};

export default Explore;
