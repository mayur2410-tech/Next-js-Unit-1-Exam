export const metadata = {
  title: "Tic Tac Toe Multiplayer | CodingGita",
  description: "Play Tic Tac Toe online powered by Next.js and MongoDB",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b bg-white/70 dark:bg-gray-800/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-xl">Tic Tac Toe</a>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:underline">Home</a>
              <a href="/leaderboard" className="hover:underline">Leaderboard</a>
              <a href="/history" className="hover:underline">History</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-gray-500">
          Built with Next.js, MongoDB, and Tailwind CSS
        </footer>
      </body>
    </html>
  );
}