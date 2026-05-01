import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);
  const token = localStorage.getItem('token');
  const roomId = 1;

  useEffect(() => {
    const s = io('http://localhost:5002', { auth: { token } });
    s.emit('room:join', roomId);
    s.on('messages:history', (msgs) => setMessages(msgs));
    s.on('message:receive', (msg) => setMessages(prev => [...prev, msg]));
    s.on('typing:show', ({ name }) => setTyping(`${name} is typing...`));
    s.on('typing:hide', () => setTyping(''));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('message:send', { roomId, content: input });
    socket.emit('typing:stop', { roomId });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket?.emit('typing:start', { roomId });
    setTimeout(() => socket?.emit('typing:stop', { roomId }), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#1a73e8', color: '#fff', padding: '16px' }}>
        <h2 style={{ margin: 0 }}>Real-Time Chat</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#1a73e8' }}>{msg.sender_name}</strong>
            <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
            <p style={{ margin: '4px 0', background: '#fff', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
              {msg.content}
            </p>
          </div>
        ))}
        {typing && <p style={{ color: '#888', fontStyle: 'italic' }}>{typing}</p>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', padding: '12px', background: '#fff', borderTop: '1px solid #ddd' }}>
        <input value={input} onChange={handleTyping}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginRight: '8px' }} />
        <button onClick={sendMessage}
          style={{ background: '#1a73e8', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
