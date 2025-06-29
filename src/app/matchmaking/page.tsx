
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

const MatchmakingPage = () => {
  const router = useRouter();

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
    socket.emit('joinMatchmaking');

    socket.on('matched', (roomId: string) => {
      router.push(`/room/${roomId}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Matchmaking</h1>
      <p>Waiting for another user to join...</p>
    </div>
  );
};

export default MatchmakingPage;
