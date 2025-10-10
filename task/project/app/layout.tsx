import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tic Tac Toe Multiplayer | Full-Stack Game Application',
  description: 'Play Tic Tac Toe online with Next.js and Supabase. Multiplayer game with leaderboard, game history, and real-time gameplay.',
  keywords: ['tic tac toe', 'multiplayer game', 'nextjs', 'supabase', 'online game'],
  authors: [{ name: 'CodingGita' }],
  openGraph: {
    title: 'Tic Tac Toe Multiplayer',
    description: 'Play Tic Tac Toe online with Next.js and Supabase',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
