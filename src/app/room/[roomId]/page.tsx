'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      socketRef.current = io('http://localhost:3001');

      socketRef.current.emit('joinRoom', roomId);

      socketRef.current.on('message', (msg: string) => {
        setMessages(prev => [...prev, msg]);
      });

      socketRef.current.on('buzz', (buzzMsg: string) => {
        setMessages(prev => [...prev, `Buzz: ${buzzMsg}`]);
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
  const sendBuzz = () => {
    if (answerInput.trim() && socketRef.current) {
      socketRef.current.emit('buzz', {
        roomId,
        answer: answerInput
      });
      setAnswerInput('');
    }
  };
  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl mb-2">Room: {roomId}</h2>
      <div className="flex">
        <div className="w-3/4">
          MATH
        </div>
        <div>
          <div className="border rounded p-2 h-64 overflow-y-auto mb-2 bg-gray-100">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-1">{msg}</div>
            ))}
            <div ref={messagesEndRef} />
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
      <div>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 border rounded p-2"
              value={answerInput}
              onChange={e => setAnswerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendBuzz()}
              placeholder="Type an answer..."
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={sendBuzz}
            >
              Buzz
            </button>
            </div>
      </div>
    </div>
  );
}
