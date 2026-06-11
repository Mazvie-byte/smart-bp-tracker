import React, { useState } from 'react';
import axios from 'axios';
import { Heart, ArrowRight, Lock, User, UserPlus } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const LoginPage = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim() || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isRegister) {
            if (password.length < 4) {
                setError('Password must be at least 4 characters');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }

        setLoading(true);
        try {
            if (isRegister) {
                await axios.post(`${API_BASE}/register`, {
                    username: name.trim(),
                    password: password
                });
                setSuccess('Account created! Logging you in...');
                setTimeout(() => {
                    localStorage.setItem('bp_username', name.trim());
                    onLogin(name.trim());
                }, 800);
            } else {
                const res = await axios.post(`${API_BASE}/login`, {
                    username: name.trim(),
                    password: password
                });
                localStorage.setItem('bp_username', res.data.username);
                onLogin(res.data.username);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Something went wrong';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setSuccess('');
        setConfirmPassword('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                padding: '3rem',
                borderRadius: '30px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.15)',
                maxWidth: '450px',
                width: '100%',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)'
            }}>
                <div style={{
                    background: 'rgba(236,72,153,0.15)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto'
                }}>
                    <Heart size={40} color="var(--primary)" fill="var(--primary)" style={{ opacity: 0.8 }} />
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                }}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>

                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    {isRegister
                        ? 'Sign up for your personalized health assistant'
                        : 'Sign in to your personalized health assistant'}
                </p>

                {/* Login/Register tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0',
                    marginBottom: '1.5rem',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <button
                        type="button"
                        onClick={() => switchMode()}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: !isRegister ? 'var(--primary)' : 'transparent',
                            color: !isRegister ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <User size={16} /> Login
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode()}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: isRegister ? 'var(--primary)' : 'transparent',
                            color: isRegister ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <UserPlus size={16} /> Register
                    </button>
                </div>

                {/* Error / Success messages */}
                {error && (
                    <div style={{
                        background: 'rgba(248, 113, 113, 0.12)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: '#f87171',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        textAlign: 'left'
                    }}>
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        background: 'rgba(52, 211, 153, 0.12)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: '#34d399',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        textAlign: 'left'
                    }}>
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>

                    <div>
                        <label style={{ fontSize: '0.9rem', marginLeft: '0.5rem', marginBottom: '0.25rem', display: 'block' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your username"
                                style={{ width: '100%', paddingLeft: '2.8rem', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.9rem', marginLeft: '0.5rem', marginBottom: '0.25rem', display: 'block' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', paddingLeft: '2.8rem', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    {isRegister && (
                        <div>
                            <label style={{ fontSize: '0.9rem', marginLeft: '0.5rem', marginBottom: '0.25rem', display: 'block' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', paddingLeft: '2.8rem', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className="btn"
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            fontSize: '1.1rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.3)',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Login')} <ArrowRight size={20} />
                    </button>

                </form>
            </div>

            <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                National University of Science and Technology • Final Year Project
            </p>
        </div>
    );
};

export default LoginPage;
