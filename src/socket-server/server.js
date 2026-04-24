/* eslint-disable @typescript-eslint/no-require-imports */
try {
  // In local dev, load .env if dotenv is available.
  // In Railway/production, env vars are injected by the platform.
  require('dotenv').config();
} catch (_error) {}
const { Server } = require('socket.io');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { evaluate } = require('mathjs');

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://eulerelo.up.railway.app",
      "https://www.eulerelo.com"
    ],
    methods: ["GET", "POST"]
  }
});

const DEFAULT_TOTAL_ROUNDS = Number.parseInt(process.env.DUEL_TOTAL_ROUNDS || '5', 10);
const ROUND_DELAY_MS = Number.parseInt(process.env.DUEL_ROUND_DELAY_MS || '1500', 10);
const ELO_K = Number.parseInt(process.env.ELO_K_FACTOR || '16', 10);

const queue = [];
const matchesByRoom = new Map();
const socketMembership = new Map();

const fallbackProblems = [
  {
    title: 'Log Difference',
    promptTemplate: 'Compute log({{x}}) - log({{y}}).',
    answerExpression: 'log(x) - log(y)',
    variableSpec: { x: { min: 2, max: 20 }, y: { min: 1, max: 10 } },
    difficulty: 1
  },
  {
    title: 'Linear Expression',
    promptTemplate: 'Evaluate 3*{{x}} - 2*{{y}}.',
    answerExpression: '3*x - 2*y',
    variableSpec: { x: { min: 1, max: 30 }, y: { min: 1, max: 20 } },
    difficulty: 1
  },
  {
    title: 'Quadratic Value',
    promptTemplate: 'Evaluate {{x}}^2 + {{y}}.',
    answerExpression: 'x^2 + y',
    variableSpec: { x: { min: 2, max: 12 }, y: { min: 1, max: 30 } },
    difficulty: 2
  },
  {
    title: 'Fraction Sum',
    promptTemplate: 'Compute {{x}}/{{y}} + {{a}}/{{b}}.',
    answerExpression: 'x / y + a / b',
    variableSpec: { x: { min: 1, max: 20 }, y: { min: 2, max: 12 }, a: { min: 1, max: 20 }, b: { min: 2, max: 12 } },
    tolerance: 0.0001,
    difficulty: 2
  },
  {
    title: 'Root and Square',
    promptTemplate: 'Evaluate sqrt({{x}}) + {{y}}^2.',
    answerExpression: 'sqrt(x) + y^2',
    variableSpec: { x: { min: 4, max: 144 }, y: { min: 1, max: 10 } },
    tolerance: 0.0001,
    difficulty: 2
  },
  {
    title: 'Average of Three',
    promptTemplate: 'Find the average of {{x}}, {{y}}, and {{z}}.',
    answerExpression: '(x + y + z) / 3',
    variableSpec: { x: { min: 1, max: 30 }, y: { min: 1, max: 30 }, z: { min: 1, max: 30 } },
    tolerance: 0.0001,
    difficulty: 1
  }
];

function toPlayerPayload(payload) {
  if (typeof payload === 'string') {
    return { userId: null, username: payload.trim() };
  }
  if (!payload || typeof payload !== 'object') {
    return { userId: null, username: '' };
  }
  return {
    userId: typeof payload.userId === 'string' ? payload.userId.trim() : null,
    username: typeof payload.username === 'string' ? payload.username.trim() : ''
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildVariables(variableSpec) {
  if (!variableSpec || typeof variableSpec !== 'object') {
    return {};
  }
  const generated = {};
  for (const [key, value] of Object.entries(variableSpec)) {
    if (!value || typeof value !== 'object') continue;
    const min = Number.parseInt(value.min, 10);
    const max = Number.parseInt(value.max, 10);
    if (Number.isNaN(min) || Number.isNaN(max)) continue;
    generated[key] = randomInt(Math.min(min, max), Math.max(min, max));
  }
  return generated;
}

function renderPrompt(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    if (variables[varName] === undefined || variables[varName] === null) return `{{${varName}}}`;
    return String(variables[varName]);
  });
}

function normalizeAnswer(rawAnswer) {
  return rawAnswer
    .trim()
    .replace(/\s+/g, '')
    .replaceAll('ln', 'log')
    .toLowerCase();
}

function parseUserValue(rawAnswer, variables) {
  const normalized = normalizeAnswer(rawAnswer);
  const value = evaluate(normalized, variables);
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) {
    return null;
  }
  return { normalized, asNumber };
}

function isCorrectNumericAnswer(userValue, correctValue, tolerance) {
  const absoluteDelta = Math.abs(userValue - correctValue);
  const relativeDelta = Math.abs(userValue - correctValue) / (Math.abs(correctValue) + 1);
  return absoluteDelta <= tolerance || relativeDelta <= tolerance;
}

async function ensureProblemSeed() {
  const count = await prisma.problem.count();
  if (count > 0) return;
  await prisma.problem.createMany({ data: fallbackProblems });
  console.log(`[seed] Added ${fallbackProblems.length} fallback problems`);
}

async function getRoundProblem(usedProblemIds) {
  const excludedIds = [...usedProblemIds];
  const activeCount = await prisma.problem.count({
    where: excludedIds.length ? { isActive: true, id: { notIn: excludedIds } } : { isActive: true }
  });
  if (!activeCount) return null;
  const offset = randomInt(0, activeCount - 1);
  const [problem] = await prisma.problem.findMany({
    where: excludedIds.length ? { isActive: true, id: { notIn: excludedIds } } : { isActive: true },
    skip: offset,
    take: 1
  });
  return problem || null;
}

function areBothCompetitorsConnected(matchState) {
  return matchState.players.every((player) => Boolean(player.socketId));
}

function emitScoreboard(roomId, players) {
  io.to(roomId).emit('scoreUpdate', {
    scores: players.map((player) => ({
      userId: player.userId,
      username: player.username,
      score: player.score
    }))
  });
}

async function startRound(matchState) {
  if (matchState.status !== 'IN_PROGRESS') return;
  if (matchState.currentRound >= matchState.totalRounds) {
    await finishMatch(matchState, 'completed');
    return;
  }

  const problem = await getRoundProblem(matchState.usedProblemIds);
  if (!problem) {
    await finishMatch(matchState, 'problem_pool_exhausted');
    return;
  }

  const variables = buildVariables(problem.variableSpec || {});
  const renderedPrompt = renderPrompt(problem.promptTemplate, variables);
  const correctNumericValue = Number(evaluate(problem.answerExpression, variables));
  if (!Number.isFinite(correctNumericValue)) {
    io.to(matchState.roomId).emit('message', 'system', 'Could not generate round question. Skipping...', 'system', '');
    await startRound(matchState);
    return;
  }

  matchState.currentRound += 1;
  matchState.usedProblemIds.add(problem.id);
  matchState.roundOpen = true;
  matchState.currentProblem = {
    id: problem.id,
    answerExpression: problem.answerExpression,
    answerType: problem.answerType,
    tolerance: Number(problem.tolerance || 0.001),
    variables,
    renderedPrompt,
    correctNumericValue,
    startedAt: Date.now()
  };

  const roundRecord = await prisma.matchRound.create({
    data: {
      matchId: matchState.matchId,
      problemId: problem.id,
      roundIndex: matchState.currentRound,
      prompt: problem.promptTemplate,
      renderedPrompt,
      variables,
      correctNumericValue
    }
  });
  matchState.currentRoundId = roundRecord.id;

  await prisma.match.update({
    where: { id: matchState.matchId },
    data: {
      currentRound: matchState.currentRound,
      usedProblemIds: [...matchState.usedProblemIds]
    }
  });

  io.to(matchState.roomId).emit('roundStart', {
    roundIndex: matchState.currentRound,
    totalRounds: matchState.totalRounds,
    prompt: renderedPrompt
  });
  emitScoreboard(matchState.roomId, matchState.players);
}

async function updateEloForMatch(matchState, winnerUserId) {
  if (!winnerUserId) return;
  const loser = matchState.players.find((player) => player.userId !== winnerUserId);
  if (!loser) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: winnerUserId },
      data: {
        elo: { increment: ELO_K },
        problemsSolved: { increment: 1 }
      }
    }),
    prisma.user.update({
      where: { id: loser.userId },
      data: { elo: { decrement: ELO_K } }
    })
  ]);
}

async function finishMatch(matchState, reason, forcedWinnerUserId = null) {
  if (matchState.status === 'COMPLETED' || matchState.status === 'ABORTED') return;
  matchState.status = reason === 'completed' ? 'COMPLETED' : 'ABORTED';
  matchState.roundOpen = false;

  let winner = null;
  if (forcedWinnerUserId) {
    winner = matchState.players.find((player) => player.userId === forcedWinnerUserId) || null;
  } else {
    const [first, second] = matchState.players;
    if (first && second) {
      if (first.score > second.score) winner = first;
      else if (second.score > first.score) winner = second;
    }
  }

  if (matchState.currentRoundId) {
    await prisma.matchRound.update({
      where: { id: matchState.currentRoundId },
      data: { endedAt: new Date() }
    }).catch(() => {});
  }

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchState.matchId },
      data: {
        status: matchState.status,
        endedAt: new Date(),
        winnerId: winner ? winner.userId : null
      }
    }),
    ...matchState.players.map((player) =>
      prisma.matchParticipant.update({
        where: { id: player.participantId },
        data: { score: player.score }
      })
    )
  ]);

  if (winner) {
    await updateEloForMatch(matchState, winner.userId).catch((error) => {
      console.error('[match] Failed to update Elo:', error);
    });
  }

  io.to(matchState.roomId).emit('matchEnded', {
    reason,
    winner: winner
      ? { userId: winner.userId, username: winner.username, score: winner.score }
      : null,
    scores: matchState.players.map((player) => ({
      userId: player.userId,
      username: player.username,
      score: player.score
    }))
  });
}

function findParticipantBySocket(matchState, socketId) {
  return matchState.players.find((player) => player.socketId === socketId) || null;
}

async function createMatchFromQueue() {
  if (queue.length < 2) return;
  const roomId = uuidv4();
  const [player1, player2] = queue.splice(0, 2);
  const playerPoolCount = await prisma.problem.count({ where: { isActive: true } });
  const totalRounds = Math.max(1, Math.min(DEFAULT_TOTAL_ROUNDS, playerPoolCount || DEFAULT_TOTAL_ROUNDS));

  const matchRecord = await prisma.match.create({
    data: {
      roomId,
      status: 'IN_PROGRESS',
      totalRounds,
      startedAt: new Date()
    }
  });

  const participants = await Promise.all([
    prisma.matchParticipant.create({
      data: {
        matchId: matchRecord.id,
        userId: player1.userId,
        username: player1.username
      }
    }),
    prisma.matchParticipant.create({
      data: {
        matchId: matchRecord.id,
        userId: player2.userId,
        username: player2.username
      }
    })
  ]);

  const matchState = {
    roomId,
    matchId: matchRecord.id,
    players: [
      { userId: player1.userId, username: player1.username, score: 0, socketId: null, participantId: participants[0].id },
      { userId: player2.userId, username: player2.username, score: 0, socketId: null, participantId: participants[1].id }
    ],
    totalRounds,
    currentRound: 0,
    usedProblemIds: new Set(),
    roundOpen: false,
    currentProblem: null,
    currentRoundId: null,
    status: 'IN_PROGRESS'
  };

  matchesByRoom.set(roomId, matchState);
  io.to(player1.matchmakingSocketId).emit('matched', { roomId });
  io.to(player2.matchmakingSocketId).emit('matched', { roomId });
}

io.on('connection', (socket) => {
  socket.on('joinMatchmaking', async (payload) => {
    try {
      const player = toPlayerPayload(payload);
      if (!player.userId || !player.username) {
        io.to(socket.id).emit('matchmakingError', 'Missing user identity for matchmaking');
        return;
      }

      if (!queue.some((queued) => queued.userId === player.userId)) {
        queue.push({
          userId: player.userId,
          username: player.username,
          matchmakingSocketId: socket.id
        });
        console.log(`${player.username} joined matchmaking queue`);
      }

      await createMatchFromQueue();
    } catch (error) {
      console.error('[matchmaking] Failed to enqueue user:', error);
      io.to(socket.id).emit('matchmakingError', 'Could not join matchmaking queue');
    }
  });

  socket.on('joinRoom', async (roomId, payload) => {
    const player = toPlayerPayload(payload);
    socket.join(roomId);

    const matchState = matchesByRoom.get(roomId);
    if (!matchState) {
      io.to(socket.id).emit('message', 'system', 'Room not found or already closed.', 'system', '');
      return;
    }

    let role = 'Spectator';
    const participant = matchState.players.find((entry) => entry.userId === player.userId);
    if (participant) {
      participant.socketId = socket.id;
      role = 'Competitor';
      socketMembership.set(socket.id, { roomId, userId: player.userId, role });
    } else {
      socketMembership.set(socket.id, { roomId, userId: player.userId || null, role });
    }

    io.to(socket.id).emit('recall', {
      role,
      opponents: matchState.players.map((entry) => ({
        userId: entry.userId,
        username: entry.username,
        score: entry.score
      })),
      currentRound: matchState.currentRound,
      totalRounds: matchState.totalRounds,
      status: matchState.status
    });

    io.to(roomId).emit('message', 'system', `${role} "${player.username || 'Unknown'}" joined room.`, 'system', role);
    emitScoreboard(roomId, matchState.players);

    if (role === 'Competitor' && areBothCompetitorsConnected(matchState) && !matchState.roundOpen && !matchState.currentProblem) {
      await startRound(matchState).catch((error) => {
        console.error('[round] Failed to start first round:', error);
      });
    }
  });

  socket.on('message', ({ roomId, type, text, username, role }) => {
    io.to(roomId).emit('message', type, text, username, role);
  });

  socket.on('submitAnswer', async ({ roomId, roundIndex, rawAnswer }) => {
    try {
      if (!rawAnswer || typeof rawAnswer !== 'string') return;
      const matchState = matchesByRoom.get(roomId);
      if (!matchState || !matchState.currentProblem || !matchState.roundOpen) return;
      if (roundIndex !== matchState.currentRound) return;

      const player = findParticipantBySocket(matchState, socket.id);
      if (!player) return;

      let normalizedAnswer = '';
      let isCorrect = false;
      let parsedUser = null;

      try {
        parsedUser = parseUserValue(rawAnswer, matchState.currentProblem.variables);
        normalizedAnswer = parsedUser ? parsedUser.normalized : normalizeAnswer(rawAnswer);
        if (parsedUser) {
          isCorrect = isCorrectNumericAnswer(
            parsedUser.asNumber,
            matchState.currentProblem.correctNumericValue,
            matchState.currentProblem.tolerance
          );
        }
      } catch {
        normalizedAnswer = normalizeAnswer(rawAnswer);
        isCorrect = false;
      }

      await prisma.answerSubmission.create({
        data: {
          roundId: matchState.currentRoundId,
          participantId: player.participantId,
          userId: player.userId,
          rawAnswer,
          normalizedAnswer,
          isCorrect,
          submittedAfterMs: Date.now() - matchState.currentProblem.startedAt
        }
      });

      io.to(matchState.roomId).emit('answerResult', {
        roundIndex: matchState.currentRound,
        username: player.username,
        userId: player.userId,
        rawAnswer,
        correct: isCorrect
      });

      if (!isCorrect || !matchState.roundOpen) return;

      matchState.roundOpen = false;
      player.score += 1;

      await prisma.matchRound.update({
        where: { id: matchState.currentRoundId },
        data: {
          endedAt: new Date(),
          winnerParticipantId: player.participantId
        }
      });

      emitScoreboard(matchState.roomId, matchState.players);
      io.to(matchState.roomId).emit('roundClosed', {
        roundIndex: matchState.currentRound,
        winnerUsername: player.username,
        winnerUserId: player.userId
      });

      const shouldEnd = matchState.currentRound >= matchState.totalRounds;
      matchState.currentProblem = null;
      matchState.currentRoundId = null;

      if (shouldEnd) {
        await finishMatch(matchState, 'completed');
        return;
      }

      setTimeout(() => {
        startRound(matchState).catch((error) => {
          console.error('[round] Failed to start next round:', error);
        });
      }, ROUND_DELAY_MS);
    } catch (error) {
      console.error('[answer] Failed to process submission:', error);
    }
  });

  socket.on('leaveRoom', (roomId, username) => {
    io.to(roomId).emit('message', 'system', `"${username}" left the room.`, 'system', '');
    socket.leave(roomId);
  });

  socket.on('disconnect', async () => {
    try {
      const queueIndex = queue.findIndex((queued) => queued.matchmakingSocketId === socket.id);
      if (queueIndex >= 0) {
        queue.splice(queueIndex, 1);
      }

      const member = socketMembership.get(socket.id);
      if (!member) return;
      socketMembership.delete(socket.id);

      if (member.role !== 'Competitor') return;
      const matchState = matchesByRoom.get(member.roomId);
      if (!matchState || matchState.status !== 'IN_PROGRESS') return;

      const disconnectedPlayer = matchState.players.find((player) => player.userId === member.userId);
      if (disconnectedPlayer) {
        disconnectedPlayer.socketId = null;
      }

      const otherPlayer = matchState.players.find((player) => player.userId !== member.userId);
      if (!otherPlayer) return;
      await finishMatch(matchState, 'forfeit', otherPlayer.userId);
    } catch (error) {
      console.error('[socket] Disconnect handling failed:', error);
    }
  });
});

app.get('/healthz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, matches: matchesByRoom.size, queue: queue.length });
  } catch (error) {
    console.error('[healthz] Failed db check:', error);
    res.status(500).json({ ok: false });
  }
});

ensureProblemSeed().catch((error) => {
  console.error('[seed] Problem initialization failed:', error);
});

const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Socket.IO server running on ${PORT}`));
