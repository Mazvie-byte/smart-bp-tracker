import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

const ChatCoachPage = () => {
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
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setTyping(true);

        try {
            const res = await api.post('/chat', { message: userMsg });
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
                setTyping(false);
            }, 500);
        } catch (error) {
            console.error("Chat error:", error);
            setTyping(false);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        }
    };

    return (
        <div className="page-content">
            <header className="page-header">
                <h1 className="page-title">
                    <Bot size={28} color="var(--primary)" />
                    AI Heart Coach
                </h1>
                <p className="page-description">Ask me anything about your blood pressure, diet, or health</p>
            </header>

            <div className="chat-page-container card">
                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                            <div className="chat-bubble-avatar">
                                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className="chat-bubble-content">
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="chat-bubble chat-bubble-bot">
                            <div className="chat-bubble-avatar"><Bot size={16} /></div>
                            <div className="chat-bubble-content chat-typing">Typing...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="chat-input-bar">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your health..."
                        className="chat-input"
                    />
                    <button type="submit" className="btn chat-send-btn">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatCoachPage;
