export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Given an array of 9 with values 'X' | 'O' | null, return 'X' | 'O' | null
export function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function isDraw(board) {
  return board.every((c) => c === "X" || c === "O");
}

// Build board symbols from ordered moves and player order.
// player1 is 'X', player2 is 'O'
export function boardFromMoves(moves, player1Id, player2Id) {
  const board = Array(9).fill(null);
  const sorted = [...moves].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    const symbol = String(m.playerId) === String(player1Id) ? "X" : "O";
    if (board[m.position] == null) board[m.position] = symbol;
  }
  return board;
}