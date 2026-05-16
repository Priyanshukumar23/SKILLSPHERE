import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { User, Mail, Users, Camera, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfile(res.data);
            setFormData({ username: res.data.username });
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile');
            setLoading(false);
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const data = new FormData();
        data.append('username', formData.username);
        if (selectedFile) {
            data.append('profilePicture', selectedFile);
        }

        try {
            const res = await api.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);

            // Update localStorage and trigger event for Navbar
            localStorage.setItem('user', JSON.stringify(res.data));
            window.dispatchEvent(new Event('userUpdated'));

            setIsEditing(false);
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to update profile');
        }
    };

    if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ paddingTop: '100px', textAlign: 'center', color: 'var(--error)' }}>{error}</div>;

    const profilePicUrl = previewUrl || (profile.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5003'}${profile.profilePicture}` : null);

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', position: 'relative' }}>

                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => { setIsEditing(false); setPreviewUrl(null); setSelectedFile(null); }} className="btn btn-outline" style={{ padding: '8px' }} title="Cancel">
                                <X size={20} />
                            </button>
                            <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '8px' }} title="Save">
                                <Save size={20} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ padding: '8px' }} title="Edit Profile">
                            <Edit2 size={20} />
                        </button>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: 'white',
                            overflow: 'hidden',
                            border: '4px solid white',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            {profilePicUrl ? (
                                <img src={profilePicUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                profile.username && profile.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    background: 'var(--text-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Camera size={18} />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            style={{
                                fontSize: '2rem',
                                textAlign: 'center',
                                border: 'none',
                                borderBottom: '2px solid var(--accent)',
                                background: 'transparent',
                                width: '100%',
                                maxWidth: '300px',
                                fontWeight: 'bold',
                                color: 'var(--text-primary)'
                            }}
                        />
                    ) : (
                        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{profile.username}</h1>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <User size={24} color="var(--accent)" />
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Username</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.username}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <Mail size={24} color="var(--accent)" />
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.email}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <Users size={24} color="var(--accent)" style={{ marginTop: '5px' }} />
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Joined Groups</p>
                            {profile.joinedGroups && profile.joinedGroups.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {profile.joinedGroups.map(group => (
                                        <span key={group._id} style={{
                                            padding: '5px 12px',
                                            background: 'var(--accent)',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {group.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No groups joined yet.</p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div style={{ marginTop: '5px' }}>🏆</div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Joined Events</p>
                            {profile.joinedContests && profile.joinedContests.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {profile.joinedContests.map(contest => (
                                        <span key={contest._id} style={{
                                            padding: '5px 12px',
                                            background: 'var(--success)',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            color: 'white'
                                        }}>
                                            {contest.title}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No events joined yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
