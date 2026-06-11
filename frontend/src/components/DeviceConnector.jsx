import React, { useState, useEffect, useRef } from 'react';
import { Bluetooth, Watch, Heart, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const generateReading = () => {
    const systolic = Math.floor(Math.random() * (145 - 105) + 105);
    const diastolic = Math.floor(Math.random() * (95 - 65) + 65);
    const heartRate = Math.floor(Math.random() * (95 - 60) + 60);
    return { systolic, diastolic, heart_rate: heartRate };
};

const getStatusLabel = (sys) => {
    if (sys < 120) return { text: 'Normal', color: 'var(--accent-green)' };
    if (sys < 130) return { text: 'Elevated', color: 'var(--accent-amber)' };
    return { text: 'High', color: 'var(--accent-red)' };
};

const DeviceConnector = ({ onReadingReceived }) => {
    const [status, setStatus] = useState('disconnected');
    const [errorMsg, setErrorMsg] = useState('');
    const [demoActive, setDemoActive] = useState(false);
    const [demoPhase, setDemoPhase] = useState('idle'); // idle, searching, pairing, syncing, reading, done
    const [currentReading, setCurrentReading] = useState(null);
    const [readingHistory, setReadingHistory] = useState([]);
    const [heartBeat, setHeartBeat] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const intervalRef = useRef(null);

    // Heart beat animation
    useEffect(() => {
        if (demoPhase === 'reading' || demoPhase === 'done') {
            const hb = setInterval(() => setHeartBeat(prev => !prev), 500);
            return () => clearInterval(hb);
        }
    }, [demoPhase]);

    // Auto-generate readings periodically
    useEffect(() => {
        if (demoPhase === 'reading') {
            intervalRef.current = setInterval(async () => {
                const reading = generateReading();
                setCurrentReading(reading);
                setReadingHistory(prev => [...prev.slice(-4), reading]);
                try {
                    await api.post('/readings', reading);
                    if (onReadingReceived) onReadingReceived();
                } catch (err) {
                    console.error("Failed to save demo reading", err);
                }
            }, 4000);
            return () => clearInterval(intervalRef.current);
        }
    }, [demoPhase]);

    const startDemo = () => {
        setDemoActive(true);
        setDemoPhase('searching');
        setReadingHistory([]);
        setCurrentReading(null);

        // Phase 1: Searching (2s)
        setTimeout(() => setDemoPhase('pairing'), 2000);

        // Phase 2: Pairing (2s)
        setTimeout(() => setDemoPhase('syncing'), 4000);

        // Phase 3: Syncing (1.5s)
        setTimeout(() => {
            setDemoPhase('reading');
            setStatus('connected');
            // Generate first reading immediately
            const first = generateReading();
            setCurrentReading(first);
            setReadingHistory([first]);
            api.post('/readings', first)
                .then(() => onReadingReceived && onReadingReceived())
                .catch(err => console.error(err));
        }, 5500);
    };

    const stopDemo = () => {
        clearInterval(intervalRef.current);
        setDemoPhase('done');
    };

    const resetDemo = () => {
        clearInterval(intervalRef.current);
        setDemoActive(false);
        setDemoPhase('idle');
        setStatus('disconnected');
        setCurrentReading(null);
        setReadingHistory([]);
    };

    const connectDevice = async () => {
        setStatus('connecting');
        setErrorMsg('');
        try {
            const { BLEService } = await import('../services/bleService');
            const ble = new BLEService();
            const success = await ble.connect(async (reading) => {
                if (reading && reading.systolic && reading.diastolic) {
                    await api.post('/readings', {
                        systolic: reading.systolic,
                        diastolic: reading.diastolic,
                        heart_rate: reading.heart_rate || 70
                    });
                    if (onReadingReceived) onReadingReceived();
                }
            });
            setStatus(success ? 'connected' : 'error');
            if (!success) setErrorMsg('Failed to connect or device not found.');
        } catch {
            setStatus('error');
            setErrorMsg('Bluetooth not available.');
        }
    };

    // Smartwatch face rendering
    const renderWatchFace = () => {
        const reading = currentReading;
        const bp = reading ? getStatusLabel(reading.systolic) : null;

        return (
            <div className="watch-container">
                <motion.div
                    className="watch-body"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    {/* Watch band top */}
                    <div className="watch-band watch-band-top" />

                    {/* Watch screen */}
                    <div className="watch-screen">
                        <AnimatePresence mode="wait">
                            {(demoPhase === 'searching') && (
                                <motion.div key="search" className="watch-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Bluetooth size={24} className="watch-icon-pulse" />
                                    <span className="watch-text-sm">Searching...</span>
                                    <div className="watch-dots">
                                        <span className="watch-dot" style={{ animationDelay: '0s' }} />
                                        <span className="watch-dot" style={{ animationDelay: '0.3s' }} />
                                        <span className="watch-dot" style={{ animationDelay: '0.6s' }} />
                                    </div>
                                </motion.div>
                            )}
                            {(demoPhase === 'pairing') && (
                                <motion.div key="pair" className="watch-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Bluetooth size={24} color="var(--primary)" />
                                    <span className="watch-text-sm" style={{ color: 'var(--primary)' }}>Pairing...</span>
                                    <RefreshCw size={16} className="watch-spin" />
                                </motion.div>
                            )}
                            {(demoPhase === 'syncing') && (
                                <motion.div key="sync" className="watch-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Activity size={24} color="var(--accent-green)" />
                                    <span className="watch-text-sm" style={{ color: 'var(--accent-green)' }}>Syncing Data</span>
                                    <div className="watch-progress-bar">
                                        <motion.div
                                            className="watch-progress-fill"
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.5 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                            {(demoPhase === 'reading' || demoPhase === 'done') && reading && (
                                <motion.div key="reading" className="watch-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                    <div className="watch-bp-display">
                                        <motion.span
                                            className="watch-bp-value"
                                            key={reading.systolic}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                        >
                                            {reading.systolic}/{reading.diastolic}
                                        </motion.span>
                                        <span className="watch-bp-unit">mmHg</span>
                                    </div>
                                    <div className="watch-hr-row">
                                        <Heart
                                            size={14}
                                            color="var(--accent-red)"
                                            fill={heartBeat ? 'var(--accent-red)' : 'none'}
                                            style={{ transition: 'all 0.2s' }}
                                        />
                                        <span className="watch-hr-value">{reading.heart_rate} BPM</span>
                                    </div>
                                    <span className="watch-status-badge" style={{ background: bp.color + '22', color: bp.color }}>
                                        {bp.text}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Watch band bottom */}
                    <div className="watch-band watch-band-bottom" />
                </motion.div>
            </div>
        );
    };

    return (
        <div className="card device-connector">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Watch color={status === 'connected' ? 'var(--accent-green)' : 'var(--primary)'} />
                    <h3>Device Connect</h3>
                </div>
                {status === 'connected' && (
                    <span style={{ color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="live-dot" /> LIVE
                    </span>
                )}
            </div>

            {!demoActive ? (
                <>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                        Sync with a Bluetooth Blood Pressure monitor or try the interactive demo.
                    </p>

                    {errorMsg && <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>{errorMsg}</p>}

                    {navigator.bluetooth && (
                        <button
                            className="btn"
                            onClick={connectDevice}
                            disabled={status === 'connecting' || status === 'connected'}
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
                        >
                            <Bluetooth size={18} />
                            {status === 'connecting' ? 'Connecting...' : 'Pair Real Device'}
                        </button>
                    )}

                    <button
                        className="btn"
                        onClick={startDemo}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                        }}
                    >
                        <Watch size={18} />
                        Simulate Smartwatch Demo
                    </button>
                </>
            ) : (
                <>
                    {renderWatchFace()}

                    {/* Reading history */}
                    {readingHistory.length > 0 && (
                        <div className="demo-history">
                            <span className="demo-history-label">Recent Readings</span>
                            {readingHistory.map((r, i) => {
                                const st = getStatusLabel(r.systolic);
                                return (
                                    <motion.div
                                        key={i}
                                        className="demo-history-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <span style={{ fontWeight: 600 }}>{r.systolic}/{r.diastolic}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.heart_rate} BPM</span>
                                        <span className="demo-status-dot" style={{ background: st.color }} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        {demoPhase === 'reading' && (
                            <button className="btn" onClick={stopDemo} style={{ flex: 1, background: 'var(--accent-amber)' }}>
                                Stop Monitoring
                            </button>
                        )}
                        <button
                            className="btn"
                            onClick={resetDemo}
                            style={{ flex: 1, background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeviceConnector;
