'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      socketRef.current = io('http://localhost:3001');

      socketRef.current.emit('joinRoom', roomId);

      socketRef.current.on('message', (msg: string) => {
        setMessages(prev => [...prev, msg]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('message', { 
        roomId, 
        message: input 
      });
      setInput('');
    }
  };

  return (
    <div>

      {/*gray out*/}
      <div className="fixed left-0 w-screen h-screen bg-gray-400 bg-opacity-75">.</div>
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-xl mb-2">Room: {roomId}</h2>
        <div className="border rounded p-2 h-64 overflow-y-auto mb-2 bg-gray-100">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-1">{msg}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
