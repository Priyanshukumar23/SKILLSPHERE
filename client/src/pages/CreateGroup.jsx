import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const CreateGroup = () => {
    const [formData, setFormData] = useState({ name: '', description: '', category: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, description, category } = formData;

    const onChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const onFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', name);
        data.append('description', description);
        data.append('category', category);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            await api.post('/groups', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>Create a New Group</h2>
                    <form onSubmit={onSubmit}>
                        {/* Image Upload Area */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Group Cover Image (Optional)</label>
                            <div
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => !imagePreview && document.getElementById('image-upload').click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ background: 'var(--accent)', color: 'white', padding: '12px', borderRadius: '50%', marginBottom: '10px' }}>
                                            <Upload size={24} />
                                        </div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Click to upload cover image</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.7, marginTop: '5px' }}>JPG, PNG or GIF (Max 50MB)</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                onChange={onFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Group Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                                placeholder="Enter a catchy name"
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
                            <select
                                name="category"
                                value={category}
                                onChange={onChange}
                                required
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            >
                                <option value="">Select a Category</option>
                                <option value="Technology">Technology</option>
                                <option value="Sports">Sports</option>
                                <option value="Arts">Arts</option>
                                <option value="Music">Music</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={onChange}
                                required
                                rows="5"
                                placeholder="What is this group about?"
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} disabled={loading}>
                            {loading ? 'Creating...' : <><ImageIcon size={18} /> Create Group</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
