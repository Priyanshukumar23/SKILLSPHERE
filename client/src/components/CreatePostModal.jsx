import { useState } from 'react';
import { X, Image, Music, Upload } from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';

const CreatePostModal = ({ onClose, onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [music, setMusic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleMusicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMusic(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert('Please select an image');

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        if (music) formData.append('music', music);
        formData.append('caption', caption);

        try {
            const res = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onPostCreated(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ width: '90%', maxWidth: '500px', padding: '30px', position: 'relative', background: 'var(--bg-primary)' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X />
                </button>

                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create New Post</h2>

                <form onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor="image-upload"
                            style={{
                                display: 'block',
                                width: '100%',
                                height: '200px',
                                border: '2px dashed var(--glass-border)',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                background: preview ? `url(${preview}) center/cover no-repeat` : 'var(--bg-secondary)'
                            }}
                        >
                            {!preview && (
                                <>
                                    <Image size={40} style={{ marginBottom: '10px', color: 'var(--text-secondary)' }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>Click to upload image</span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Music Upload */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="file"
                            id="music-upload"
                            accept="audio/*"
                            onChange={handleMusicChange}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor="music-upload"
                            className="btn btn-outline"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Music size={20} />
                            {music ? music.name : 'Add Background Music (Optional)'}
                        </label>
                    </div>

                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-secondary)',
                            minHeight: '100px',
                            marginBottom: '20px',
                            resize: 'none'
                        }}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : <><Upload size={20} /> Share Post</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreatePostModal;
