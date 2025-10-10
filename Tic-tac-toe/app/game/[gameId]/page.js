import GameBoard from "@/components/GameBoard";

export const metadata = {
  title: "Game | Tic Tac Toe Multiplayer",
  description: "Play a live Tic Tac Toe match (CSR)."
};

// This route is CSR for gameplay via the client component.
export default function GamePage({ params }) {
  const { gameId } = params;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Game</h1>
      <GameBoard gameId={gameId} />
    </div>
  );
}