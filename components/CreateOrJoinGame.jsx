"use client";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function CreateOrJoinGame() {
  const { data, error, isLoading, mutate } = useSWR("/api/games/open", fetcher, {
    refreshInterval: 4000
  });

  async function ensurePlayer(username) {
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "Failed creating player");
    }
    return res.json();
  }

  async function onCreateGame(e) {
    e.preventDefault();
    const username = e.target.username.value.trim();
    if (!username) return alert("Enter username");
    try {
      await ensurePlayer(username);
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const game = await res.json();
      if (!res.ok) throw new Error(game?.error || "Failed to create game");
      localStorage.setItem("t3_username", username);
      window.location.href = `/game/${game._id}`;
    } catch (err) {
      alert(err.message);
    }
  }

  async function onJoinGame(gameId, username) {
    try {
      await ensurePlayer(username);
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Join failed");
      localStorage.setItem("t3_username", username);
      window.location.href = `/game/${gameId}`;
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={onCreateGame} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
        <h2 className="font-semibold text-lg mb-3">Create a new game</h2>
        <div className="space-y-3">
          <input
            name="username"
            placeholder="Your username"
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Game (You are X)
          </button>
        </div>
      </form>

      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
        <h2 className="font-semibold text-lg mb-3">Join an open game</h2>
        <div className="flex items-center gap-2 mb-3">
          <input
            id="join-username"
            placeholder="Your username"
            className="flex-1 rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900"
          />
          <button
            onClick={() => mutate()}
            className="px-3 py-2 rounded border bg-gray-100 dark:bg-gray-900"
            title="Refresh"
          >
            Refresh
          </button>
        </div>
        {error && <p className="text-red-600 text-sm">Failed to load open games</p>}
        {isLoading && <p className="text-sm">Loading open games...</p>}
        <ul className="space-y-2">
          {data?.games?.length ? (
            data.games.map((g) => (
              <li key={g._id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="text-sm">
                    Game: <span className="font-mono">{g._id}</span>
                  </div>
                  <div className="text-xs text-gray-500">Host: {g.player1?.username}</div>
                </div>
                <button
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    const username = document.getElementById("join-username").value.trim();
                    if (!username) return alert("Enter username");
                    onJoinGame(g._id, username);
                  }}
                >
                  Join (You are O)
                </button>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No open games. Create one!</p>
          )}
        </ul>
      </div>
    </div>
  );
}