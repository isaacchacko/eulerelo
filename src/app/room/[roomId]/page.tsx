'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import CopyButton from '@/components/CopyButton';

type MessageType = 'chat' | 'buzz' | 'buzzCorrect' | 'system';

interface ChatMessage {
  role: string;
  username: string;
  text: string;
  type: MessageType;
}

interface PlayerScore {
  userId: string;
  username: string;
  score: number;
}

const words = [
  'velvet',
  'mango',
  'sunrise',
  'crimson',
  'forest',
  'echo',
  'silver',
  'breeze',
  'shadow',
  'amber',
  'river',
  'whisper',
  'cosmic',
  'pearl',
  'ember',
  'lunar',
  'sage',
  'harbor',
];

const getRandomThreeWordString = () =>
  Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join('-');

export default function RoomPage() {
  const { data: session } = useSession();
  const params = useParams();
  const roomId = params.roomId as string;
  const displayName =
    session && session.user?.name ? (session.user.name as string) : getRandomThreeWordString();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAnswerCooldown, setIsAnswerCooldown] = useState(false);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [role, setRole] = useState('Unknown');
  const [currentPrompt, setCurrentPrompt] = useState('Waiting for both competitors...');
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [winnerText, setWinnerText] = useState('');
  const [matchEnded, setMatchEnded] = useState(false);

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
    socketRef.current.emit('joinRoom', roomId, {
      userId,
      username: displayName,
    });

    socketRef.current.on('message', (type: MessageType, text: string, username: string, msgRole: string) => {
      setMessages((prev) => [
        ...prev,
        { type, text, username, role: msgRole } as ChatMessage,
      ]);
    });

    socketRef.current.on('recall', (data) => {
      setRole(data.role || 'Unknown');
      setPlayers(data.opponents || []);
      if (typeof data.currentRound === 'number') {
        setRoundIndex(data.currentRound);
      }
      if (typeof data.totalRounds === 'number') {
        setTotalRounds(data.totalRounds);
      }
      if (data.status === 'COMPLETED' || data.status === 'ABORTED') {
        setMatchEnded(true);
      }
    });

    socketRef.current.on('scoreUpdate', (payload: { scores: PlayerScore[] }) => {
      setPlayers(payload.scores || []);
    });

    socketRef.current.on('roundStart', (payload: { roundIndex: number; totalRounds: number; prompt: string }) => {
      setRoundIndex(payload.roundIndex);
      setTotalRounds(payload.totalRounds);
      setCurrentPrompt(payload.prompt);
      setWinnerText('');
    });

    socketRef.current.on('answerResult', (payload: { correct: boolean; username: string; rawAnswer: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          type: payload.correct ? 'buzzCorrect' : 'buzz',
          text: payload.rawAnswer,
          username: payload.username,
          role: 'Competitor',
        },
      ]);
    });

    socketRef.current.on('roundClosed', (payload: { winnerUsername: string; roundIndex: number }) => {
      setWinnerText(`Round ${payload.roundIndex} winner: ${payload.winnerUsername}`);
    });

    socketRef.current.on(
      'matchEnded',
      (payload: {
        winner: { username: string } | null;
        reason: string;
        scores: PlayerScore[];
      }) => {
        setMatchEnded(true);
        setPlayers(payload.scores || []);
        if (payload.winner?.username) {
          setWinnerText(`Match winner: ${payload.winner.username}`);
        } else {
          setWinnerText(`Match ended (${payload.reason}).`);
        }
      }
    );

    return () => {
      socketRef.current?.emit('leaveRoom', roomId, displayName);
      socketRef.current?.disconnect();
    };
  }, [displayName, roomId, userId]);

  const sendChat = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('message', {
      roomId,
      type: 'chat',
      text: chatInput,
      username: displayName,
      role,
    });
    setChatInput('');
  };

  const submitAnswer = () => {
    if (!answerInput.trim() || !socketRef.current || role !== 'Competitor' || matchEnded) return;
    socketRef.current.emit('submitAnswer', {
      roomId,
      roundIndex,
      rawAnswer: answerInput,
    });
    setAnswerInput('');
    setIsAnswerCooldown(true);
    setTimeout(() => {
      setIsAnswerCooldown(false);
    }, 1200);
  };

  return (
    <div className="mx-auto p-4">
      <div className="mb-2 flex flex-row items-center justify-between text-xl">
        <div className="flex flex-row items-center gap-3">
          {sortedPlayers.map((player) => (
            <div
              key={player.userId}
              className="flex flex-row gap-2 rounded-lg bg-black px-5 py-3 transition-transform duration-300 hover:scale-100 scale-90"
            >
              <img src="/globe.svg" alt="Player icon" width={24} />
              <Link href="" className="hover:text-blue-500 hover:underline">
                {player.username} ({player.score})
              </Link>
            </div>
          ))}
        </div>
        <CopyButton text={roomId} buttonText="Copy Room ID" />
      </div>

      <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
        Role: {role} | Round {roundIndex}/{totalRounds || '?'}
      </div>
      {winnerText ? (
        <div className="mb-3 font-semibold text-green-600 dark:text-green-400">{winnerText}</div>
      ) : null}

      <div className="flex">
        <div className="m-3 min-h-52 w-full rounded border p-6 text-3xl dark:bg-slate-800">
          <div className="mb-2 text-sm text-gray-500">Current Problem</div>
          <div>{currentPrompt}</div>
        </div>

        <div className="m-3 flex w-full flex-col">
          <div className="mb-2 h-64 flex-grow overflow-y-auto rounded border p-2 dark:bg-slate-700">
            {messages.map((msg, idx) =>
              msg.type === 'buzz' ? (
                <div key={idx} className="mb-1 text-red-500">
                  ({msg.role}) {msg.username}: {msg.text}
                </div>
              ) : msg.type === 'buzzCorrect' ? (
                <div key={idx} className="mb-1 text-green-600">
                  ({msg.role}) {msg.username}: {msg.text}
                </div>
              ) : msg.type === 'system' ? (
                <div key={idx} className="mb-1 italic text-gray-500">
                  {msg.text}
                </div>
              ) : (
                <div key={idx} className="mb-1">
                  ({msg.role}) {msg.username}: {msg.text}
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border p-2 dark:bg-slate-700"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Type a message..."
            />
            <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={sendChat}>
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded border p-2 dark:bg-slate-700"
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          onKeyDown={!isAnswerCooldown ? (e) => e.key === 'Enter' && submitAnswer() : () => {}}
          placeholder="Type your answer..."
          disabled={role !== 'Competitor' || matchEnded}
        />
        <button
          className={`rounded px-4 py-2 ${
            isAnswerCooldown || role !== 'Competitor' || matchEnded
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-500 text-white'
          }`}
          onClick={submitAnswer}
          disabled={isAnswerCooldown || role !== 'Competitor' || matchEnded}
        >
          {isAnswerCooldown ? 'Wait...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
