"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json());

function Cell({ value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-20 h-20 md:w-24 md:h-24 text-3xl font-bold flex items-center justify-center border hover:bg-gray-100 dark:hover:bg-gray-800"
      disabled={value !== null}
    >
      {value}
    </button>
  );
}

export default function GameBoard({ gameId }) {
  const [username, setUsername] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/api/games/${gameId}`, fetcher, {
    refreshInterval: 1500
  });

  useEffect(() => {
    const u = localStorage.getItem("t3_username") || "";
    setUsername(u);
  }, []);

  const info = data || {};
  const game = info.game || {};
  const board = info.board || Array(9).fill(null);
  const you =
    username && game?.player1?.username === username
      ? "X"
      : username && game?.player2?.username === username
      ? "O"
      : null;

  const nextSymbol = useMemo(() => {
    if (!info.moves) return "X";
    const count = info.moves.length;
    return count % 2 === 0 ? "X" : "O";
  }, [info.moves]);

  const yourTurn = you && game?.status === "active" && you === nextSymbol;

  async function play(pos) {
    if (!username) return alert("Set your username on home before playing.");
    if (!yourTurn) return;
    try {
      const res = await fetch(`/api/games/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, position: pos })
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Move failed");
      await mutate();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600">Failed to load game.</p>}
      {isLoading && <p>Loading game...</p>}

      {game?._id && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">
                Game: <span className="font-mono">{game._id}</span>
              </div>
              <div className="text-sm">
                X: {game.player1?.username} | O: {game.player2?.username || "(waiting...)
                "}
              </div>
              <div className="text-sm">Status: {game.status}</div>
            </div>
            <div className="text-right text-sm">
              <div>You: {you || "(spectator or unknown)"}</div>
              {game.status !== "finished" ? (
                <div>Turn: {nextSymbol}</div>
              ) : info.winnerSymbol ? (
                <div className="font-semibold">Winner: {info.winnerSymbol}</div>
              ) : (
                <div className="font-semibold">Draw</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 w-fit">
            {board.map((val, idx) => (
              <Cell key={idx} value={val} onClick={() => (val == null ? play(idx) : null)} />)
            ))}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Rendering strategy: CSR (client-side rendering) with SWR polling.
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Moves</h3>
            <ol className="list-decimal list-inside text-sm space-y-1">
              {info.moves?.map((m, i) => (
                <li key={m._id}>
                  {i % 2 === 0 ? "X" : "O"} → position {m.position} ({new Date(m.timestamp).toLocaleString()})
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}