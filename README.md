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

- Next.js 14 with App Router
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

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### `.env`

- `DATABASE_URL`: PostgreSQL database connection URL

### `.env.local`

- `NEXTAUTH_URL`: Base URL of your application
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js (generate with `openssl rand -base64 32`)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
