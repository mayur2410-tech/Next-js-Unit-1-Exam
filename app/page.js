import CreateOrJoinGame from "@/components/CreateOrJoinGame";

export const metadata = {
  title: "Home | Tic Tac Toe Multiplayer",
  description: "Create or join a Tic Tac Toe game. Built with SSG."
};

// This page is static (SSG) and contains client components for actions.
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="prose dark:prose-invert max-w-none">
        <h1>Welcome to Tic Tac Toe Multiplayer</h1>
        <p>
          Create a new game or join an open one. Players are identified by username only.
          Player 1 is always X, Player 2 is O.
        </p>
      </section>
      <CreateOrJoinGame />
      <section className="text-sm text-gray-600 dark:text-gray-400">
        <p>Rendering strategy: SSG (static) with client-side actions.</p>
      </section>
    </div>
  );
}