
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

let socket: Socket;

const MatchmakingPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;
    if (!session.user) return;
    const userId = (session.user as { id?: string }).id;
    if (!userId || !session.user.name) return;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
    if (!socketUrl) return;

    socket = io(socketUrl);
    socket.emit('joinMatchmaking', {
      userId,
      username: session.user.name,
    });

    socket.on('matched', ({ roomId }: { roomId: string }) => {
      router.push(`/room/${roomId}`);
    });
    socket.on('matchmakingError', (message: string) => {
      // Surface server-side matchmaking failures in deployed environments.
      console.error('[matchmaking] server error:', message);
      alert(message);
    });

    return () => {
      socket.off('matched');
      socket.off('matchmakingError');
      socket.disconnect();
    };
  }, [router, session]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Matchmaking</h1>
      <p>Waiting for another user to join...</p>
    </div>
  );
};

export default MatchmakingPage;
