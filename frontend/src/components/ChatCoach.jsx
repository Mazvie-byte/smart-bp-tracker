import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatCoach = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! I am your AI Heart Coach. Ask me about your trends, diet, or blood pressure status.' }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setTyping(true);

        try {
            const res = await axios.post('http://localhost:8000/chat', { message: userMsg });
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
                setTyping(false);
            }, 500); // Fake delay for realism
        } catch (error) {
            console.error("Chat error:", error);
            setTyping(false);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    cursor: 'pointer'
                }}
            >
                <div style={{ position: 'relative' }}>
                    <MessageSquare size={28} />
                    <span style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        width: '12px',
                        height: '12px',
                        background: 'var(--accent-green)',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-dark)'
                    }} />
                </div>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '7rem',
                            right: '2rem',
                            width: '350px',
                            height: '500px',
                            background: 'var(--bg-card)',
                            borderRadius: '20px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.2)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: 'var(--primary)',
                            padding: '1rem',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bot size={24} />
                                <span style={{ fontWeight: 600 }}>AI Coach</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', color: 'white' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            padding: '1rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: msg.sender === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                    boxShadow: msg.sender === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                </div>
                            ))}
                            {typing && (
                                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', padding: '0.5rem 1rem', borderRadius: '15px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    Typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'var(--bg-card)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your health..."
                                style={{ flex: 1, borderRadius: '50px', padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                            />
                            <button type="submit" className="btn" style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatCoach;
