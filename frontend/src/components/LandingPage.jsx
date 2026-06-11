import React from 'react';
import { Heart, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
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
                maxWidth: '800px',
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
                    fontSize: '3.5rem',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    lineHeight: 1.1
                }}>
                    Heart Health <br />
                    <span style={{ color: 'var(--primary)' }}>Reimagined.</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem auto',
                    lineHeight: 1.6
                }}>
                    Use Artificial Intelligence to track your blood pressure, analyze trends, and build better habits. All simply and beautifully.
                </p>

                <button
                    className="btn"
                    onClick={onGetStarted}
                    style={{
                        fontSize: '1.25rem',
                        padding: '1rem 2.5rem',
                        borderRadius: '50px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.3)'
                    }}
                >
                    Get Started <ArrowRight size={24} />
                </button>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                    marginTop: '4rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '3rem'
                }}>
                    <div>
                        <Activity color="var(--primary)" size={32} style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--text-primary)' }}>Smart Tracking</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Visualize your vitals with beautiful charts.</p>
                    </div>
                    <div>
                        <ShieldCheck color="var(--primary)" size={32} style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--text-primary)' }}>AI Analysis</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Get instant feedback on your health status.</p>
                    </div>
                    <div>
                        <Heart color="var(--primary)" size={32} style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--text-primary)' }}>Habit Coach</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Daily suggestions to improve your wellness.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
