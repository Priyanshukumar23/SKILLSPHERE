import { useState } from 'react';
import api from '../utils/api';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const CreateEvent = () => {
    const { groupId } = useParams();
    const locationState = useLocation();
    const groupName = locationState.state?.groupName || 'Group';
    const [formData, setFormData] = useState({ title: '', description: '', date: '', time: '', location: '' });
    const navigate = useNavigate();

    const { title, description, date, time, location } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            // Combine date and time
            const dateTime = new Date(`${date}T${time}`);

            const formattedData = {
                title,
                description,
                location,
                date: dateTime.toISOString(),
                groupId
            };

            await api.post('/events', formattedData);
            navigate(`/group/${groupId}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>Create Event for {groupName}</h2>
                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={onChange}
                                required
                                style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={date}
                                    onChange={onChange}
                                    required
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={time}
                                    onChange={onChange}
                                    required
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={location}
                                onChange={onChange}
                                required
                                style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
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
                                style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Event</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
