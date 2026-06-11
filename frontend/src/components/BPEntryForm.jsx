import React, { useState } from 'react';
import api from '../api';
import { Activity, Heart, Save } from 'lucide-react';

const BPEntryForm = ({ onReadingAdded }) => {
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const availableTags = ["Stressed", "Post-Exercise", "High Salt", "Caffeine", "Meds Taken"];

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/readings', {
                systolic: parseInt(systolic),
                diastolic: parseInt(diastolic),
                heart_rate: parseInt(heartRate),
                tags: selectedTags
            });
            setSystolic('');
            setDiastolic('');
            setHeartRate('');
            setSelectedTags([]);
            if (onReadingAdded) onReadingAdded();
        } catch (error) {
            console.error("Error logging reading:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Activity color="var(--primary)" />
                <h3>Log New Reading</h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2">
                    <div className="input-group">
                        <label>Systolic (mmHg)</label>
                        <input
                            type="number"
                            value={systolic}
                            onChange={(e) => setSystolic(e.target.value)}
                            placeholder="120"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Diastolic (mmHg)</label>
                        <input
                            type="number"
                            value={diastolic}
                            onChange={(e) => setDiastolic(e.target.value)}
                            placeholder="80"
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Heart Rate (BPM)</label>
                    <div style={{ position: 'relative' }}>
                        <Heart size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="number"
                            value={heartRate}
                            onChange={(e) => setHeartRate(e.target.value)}
                            placeholder="75"
                            style={{ paddingLeft: '2.5rem', width: '90%' }}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Lifestyle Context</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                style={{
                                    background: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--bg-dark)',
                                    color: selectedTags.includes(tag) ? 'white' : 'var(--text-muted)',
                                    border: `1px solid ${selectedTags.includes(tag) ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Reading'}
                </button>
            </form>
        </div>
    );
};

export default BPEntryForm;
