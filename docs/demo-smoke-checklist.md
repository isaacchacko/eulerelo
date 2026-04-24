# Demo Smoke Checklist

## Preconditions
- Web app and socket server are both deployed.
- `NEXT_PUBLIC_SOCKET_SERVER_URL` points to the deployed socket URL.
- Database schema has been pushed and problem pool seeded.

## Flow Check (two browser sessions)
1. Log into account A and account B.
2. Open `Duel -> Find Match` for both users.
3. Confirm both users land in the same room.
4. Confirm round counter starts and a problem prompt appears.
5. Submit an incorrect answer from one client and verify both clients see it marked incorrect.
6. Submit a correct answer from the other client and verify:
   - round closes,
   - score updates for both clients,
   - next round starts with a different problem template.
7. Complete all rounds and verify winner banner appears.
8. Confirm `/api/users` still returns leaderboard data after the match.

## Quick Runtime Checks
- Socket health endpoint responds:
  - `GET /healthz` returns `{ "ok": true, ... }`
- Problem pool endpoint responds:
  - `GET /api/problems` returns `count > 0`
