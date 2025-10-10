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
        <header className="header">
          <div className="max-w-5xl mx-auto px-4 py-3 header-content">
            <a href="/" className="logo">Tic Tac Toe</a>
            <nav className="nav">
              <a href="/">Home</a>
              <a href="/leaderboard">Leaderboard</a>
              <a href="/history">History</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="footer">
          Built with Next.js, MongoDB, and Custom CSS
        </footer>
      </body>
    </html>
  );
}