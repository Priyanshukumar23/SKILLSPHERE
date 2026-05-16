import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, User, CheckCircle, Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';

const ContestRegistration = () => {
    const navigate = useNavigate();
    const { contestId } = useParams();
    const [registrationType, setRegistrationType] = useState('individual'); // 'individual' or 'group'
    const [members, setMembers] = useState([{ name: '', mobile: '', address: '' }]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleTypeChange = (type) => {
        setRegistrationType(type);
        // Reset members when switching type
        if (type === 'individual') {
            setMembers([{ name: '', mobile: '', address: '' }]);
        } else {
            // Start with 2 members for a group by default, or just 1 as base
            setMembers([{ name: '', mobile: '', address: '' }]);
        }
    };

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const addMember = () => {
        setMembers([...members, { name: '', mobile: '', address: '' }]);
    };

    const removeMember = (index) => {
        if (members.length > 1) {
            const newMembers = members.filter((_, i) => i !== index);
            setMembers(newMembers);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        for (const member of members) {
            if (!member.name || !member.mobile || !member.address) {
                alert('Please fill in all fields for all members.');
                return;
            }
        }

        setLoading(true);

        try {
            // Pass members and type, though backend currently focuses on linking user to contest
            await api.post(`/contests/register/${contestId}`, {
                registrationType,
                members
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
                    <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Registration Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                        You have successfully registered for the contest as {registrationType === 'group' ? 'a Group' : 'an Individual'}.
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>Event Registration</h1>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                        Register for Today's Contest
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Registration Type Selection */}
                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '500' }}>Registration Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div
                                    onClick={() => handleTypeChange('individual')}
                                    style={{
                                        padding: '20px',
                                        border: `2px solid ${registrationType === 'individual' ? 'var(--accent)' : 'var(--glass-border)'}`,
                                        borderRadius: '12px',
                                        background: registrationType === 'individual' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <User size={32} color={registrationType === 'individual' ? 'var(--accent)' : 'var(--text-secondary)'} style={{ marginBottom: '10px' }} />
                                    <span style={{ fontWeight: '600' }}>Individual</span>
                                </div>

                                <div
                                    onClick={() => handleTypeChange('group')}
                                    style={{
                                        padding: '20px',
                                        border: `2px solid ${registrationType === 'group' ? 'var(--accent)' : 'var(--glass-border)'}`,
                                        borderRadius: '12px',
                                        background: registrationType === 'group' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Users size={32} color={registrationType === 'group' ? 'var(--accent)' : 'var(--text-secondary)'} style={{ marginBottom: '10px' }} />
                                    <span style={{ fontWeight: '600' }}>Group</span>
                                </div>
                            </div>
                        </div>

                        {/* Member Details */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {registrationType === 'individual' ? 'Personal Details' : 'Team Members Details'}
                                {registrationType === 'group' && (
                                    <button type="button" onClick={addMember} className="btn btn-outline" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Plus size={16} /> Add Member
                                    </button>
                                )}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {members.map((member, index) => (
                                    <div key={index} style={{
                                        padding: '20px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        position: 'relative'
                                    }}>
                                        {registrationType === 'group' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <h4 style={{ color: 'var(--accent)' }}>Member {index + 1}</h4>
                                                {members.length > 1 && (
                                                    <button type="button" onClick={() => removeMember(index)} style={{ background: 'none', color: 'var(--error)', padding: '5px' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                                    placeholder="John Doe"
                                                    required
                                                    style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    value={member.mobile}
                                                    onChange={(e) => handleMemberChange(index, 'mobile', e.target.value)}
                                                    placeholder="+1 234 567 890"
                                                    required
                                                    style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Address</label>
                                                <input
                                                    type="text"
                                                    value={member.address}
                                                    onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                                                    placeholder="123 Main St, City, Country"
                                                    required
                                                    style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContestRegistration;
