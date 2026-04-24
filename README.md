# Eulerelo

A competitve math website! Challenge your math skills in real-time duels, climb the leaderboard, and master topics from arithmetic to calculus. Compete with others, solve problems faster, and see how you rank among math enthusiasts worldwide!

## Screenshots

The Eulerelo Landing Page

![Eulerelo Landing Page](https://raw.githubusercontent.com/isaacchacko/eulerelo/main/public/hero.png "The homepage!")

The Eulerelo Practice Room

![Eulerelo Practice Room](https://raw.githubusercontent.com/isaacchacko/eulerelo/main/public/practice-room.png "Can't take the heat?Practice hard problems without stress in our practice rooms!")

## Features

- User authentication with email/password
- Protected routes and API endpoints
- Progress tracking
- Leaderboard system
- Responsive design
- Modern UI with Tailwind CSS

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- NextAuth.js for authentication
- Prisma with PostgreSQL
- Tailwind CSS for styling

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/eulerelo.git
   cd eulerelo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` and fill in your database URL
   - Copy `.env.example` to `.env.local` and fill in your NextAuth configuration

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the app in **two terminals** (web and socket are separate processes):

   **Terminal 1 — Next.js**

   ```bash
   npm run dev
   ```

   **Terminal 2 — Socket.IO server**

   ```bash
   npm run start:socket
   ```

   Ensure `.env` / `.env.local` set `NEXT_PUBLIC_SOCKET_SERVER_URL` to the socket URL (for example `http://localhost:3001` when using the default `SOCKET_PORT`).

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### `.env`

- `DATABASE_URL`: PostgreSQL database connection URL
- `SOCKET_PORT`: Port used by the socket server (default: `3001`)

### `.env.local`

- `NEXTAUTH_URL`: Base URL of your application
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_SOCKET_SERVER_URL`: Public URL of the socket server used by client pages (for local dev: `http://localhost:3001`)

## Deployment Topology (Demo)

This project uses two runtime services:

1. **Web app service** (Next.js)
   - Build: `npm run build`
   - Start: `npm run start`
2. **Socket service** (Socket.IO + Express)
   - Start: `npm run start:socket`

For hosted demos, set `NEXT_PUBLIC_SOCKET_SERVER_URL` in the web app service to the deployed socket service URL.

## Demo Smoke Checklist

Before class:

1. Run database sync and seed:
   - `npx prisma db push`
   - `npm run prisma:seed` (or `npx prisma db seed`)
2. Start both local services (two terminals):
   - `npm run dev`
   - `npm run start:socket`
3. Verify with two accounts in separate browsers:
   - both join matchmaking and enter the same room
   - each round receives a new random problem
   - answer correctness appears for both clients
   - match ends with a winner and score summary

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
