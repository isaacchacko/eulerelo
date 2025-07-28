
"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const MatchmakingPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {

    if (!session) return;
    if (!session.user) return;

    console.log("ran! session.user", session.user);
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
    socketRef.current.emit('joinMatchmaking', session.user);

    socketRef.current.on('matched', (roomId: string) => {
      router.push(`/room/${roomId}`);
    });

    return () => {
      if (!socketRef.current) return;
      socketRef.current.disconnect();
    };
  }, [session, router]); // im not too confident about router dependency

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Matchmaking</h1>
      <p>Waiting for another user to join...</p>
    </div>
  );
};

export default MatchmakingPage;
