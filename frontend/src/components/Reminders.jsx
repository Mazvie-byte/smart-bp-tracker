import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock } from 'lucide-react';

const Reminders = () => {
    const [reminders, setReminders] = useState(() => {
        const saved = localStorage.getItem('bp_reminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [newTime, setNewTime] = useState('');
    const [label, setLabel] = useState('');

    useEffect(() => {
        localStorage.setItem('bp_reminders', JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            reminders.forEach(r => {
                if (r.time === currentTime) {
                    // Simple check to avoid spamming alerts in the same minute
                    // In a real app, track 'lastAlerted' timestamp
                    if (now.getSeconds() === 0) {
                        if (Notification.permission === "granted") {
                            new Notification(`BP Check: ${r.label}`);
                        } else {
                            alert(`Time to check your Blood Pressure: ${r.label}`);
                        }
                    }
                }
            });
        }, 1000); // Check every second to catch the minute change accurately

        // Request notification permission
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [reminders]);

    const addReminder = (e) => {
        e.preventDefault();
        if (!newTime) return;
        setReminders([...reminders, { id: Date.now(), time: newTime, label: label || 'BP Check', enabled: true }]);
        setNewTime('');
        setLabel('');
    };

    const removeReminder = (id) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    return (
        <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Bell color="var(--primary)" />
                <h3>Smart Reminders</h3>
            </div>

            <form onSubmit={addReminder} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ flex: 1, minWidth: '80px' }}
                    required
                />
                <input
                    type="text"
                    placeholder="Label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    style={{ flex: 2 }}
                />
                <button type="submit" className="btn" style={{ padding: '0.75rem' }}>
                    <Plus size={20} />
                </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {reminders.map(r => (
                    <div key={r.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.75rem',
                        borderRadius: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={16} color="var(--text-muted)" />
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{r.time}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                        </div>
                        <button onClick={() => removeReminder(r.id)} style={{ background: 'none', color: 'var(--accent-red)', padding: 0 }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {reminders.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No reminders set</p>}
            </div>
        </div>
    );
};

export default Reminders;
