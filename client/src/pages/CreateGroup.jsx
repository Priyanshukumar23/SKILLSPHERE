import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CreateGroup = () => {
    const [formData, setFormData] = useState({ name: '', description: '', category: '', image: '' });
    const navigate = useNavigate();

    const { name, description, category, image } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/groups', formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>Create a New Group</h2>
                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Group Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                                style={{ width: '100%', padding: '12px', background: '#FFFFFF', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
                            <select
                                name="category"
                                value={category}
                                onChange={onChange}
                                required
                                style={{ width: '100%', padding: '12px', background: '#FFFFFF', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
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
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Image URL (Optional)</label>
                            <input
                                type="text"
                                name="image"
                                value={image}
                                onChange={onChange}
                                placeholder="https://example.com/image.jpg"
                                style={{ width: '100%', padding: '12px', background: '#FFFFFF', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={onChange}
                                required
                                rows="5"
                                style={{ width: '100%', padding: '12px', background: '#FFFFFF', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Group</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
