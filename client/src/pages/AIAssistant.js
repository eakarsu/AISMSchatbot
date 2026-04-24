import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiSend, FiCpu, FiUser, FiTrash2 } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Benefits Assistant. I can help you with:\n\n- **SNAP** (Supplemental Nutrition Assistance Program)\n- **TANF** (Temporary Assistance for Needy Families)\n- **WIC** (Women, Infants, and Children)\n- **Medicaid** healthcare coverage\n- **Housing Assistance** programs\n- **LIHEAP** (Low Income Home Energy Assistance)\n- **Child Care Assistance**\n\nHow can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/chat', { message: input, conversationHistory: history });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response, model: res.data.model, usage: res.data.usage }]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const quickQuestions = [
    'What are the SNAP eligibility requirements?',
    'How do I apply for TANF benefits?',
    'What documents do I need for my application?',
    'How long does the application process take?',
    'Can I apply for multiple programs at once?',
    'What is the income limit for a family of 4?'
  ];

  return (
    <div className="page chat-page">
      <div className="page-header">
        <h1><FiCpu /> AI Benefits Assistant</h1>
        <button className="btn btn-outline" onClick={() => setMessages([messages[0]])}><FiTrash2 /> Clear Chat</button>
      </div>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? <FiUser /> : <FiCpu />}
              </div>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <AIResponseDisplay content={msg.content} model={msg.model} usage={msg.usage} title="" />
                ) : (
                  <div className="user-message-text">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-avatar"><FiCpu className="spinning" /></div>
              <div className="message-content">
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="quick-questions">
          {quickQuestions.map((q, i) => (
            <button key={i} className="quick-question-btn" onClick={() => { setInput(q); }}>{q}</button>
          ))}
        </div>
        <form className="chat-input" onSubmit={sendMessage}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about benefits, eligibility, applications..." disabled={loading} />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}><FiSend /></button>
        </form>
      </div>
    </div>
  );
}
