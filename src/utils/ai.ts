type Cell = "X" | "O" | null;
const SIZE = 10;
const CENTER = (SIZE - 1) / 2;
const directions = [
  [0, 1], [1, 0], [1, 1], [1, -1]
];

const checkLine = (board: Cell[][], row: number, col: number, player: "X" | "O") => {
  let maxLen = 0;
  let openEnds = 0;

  for (const [dx, dy] of directions) {
    let count = 1;
    let ends = 0;

    let x = row + dx;
    let y = col + dy;
    while (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === player) {
      count++;
      x += dx;
      y += dy;
    }
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === null) ends++;

    x = row - dx; y = col - dy;
    while (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === player) {
      count++;
      x -= dx; y -= dy;
    }
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === null) ends++;

    if (count > maxLen || (count === maxLen && ends > openEnds)) {
      maxLen = count;
      openEnds = ends;
    }
  }

  return { length: maxLen, openEnds };
};

export const computerMove = (board: Cell[][]): [number, number] => {
  const candidates: { cell: [number, number]; priority: number }[] = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== null) continue;

      const tempBoard = board.map(r => [...r]);
      tempBoard[i][j] = "O";

      const myLine = checkLine(tempBoard, i, j, "O");
      const playerLine = checkLine(board, i, j, "X");

      let priority = 0;

      if (myLine.length >= 5) priority = 6;
      else if (playerLine.length >= 4 && playerLine.openEnds > 0) priority = 5;
      else if (myLine.length === 4 && myLine.openEnds === 2) priority = 4;
      else if (playerLine.length === 3 && playerLine.openEnds === 2) priority = 3;
      else if (myLine.length === 3 && myLine.openEnds === 2) priority = 2;
      else if (playerLine.length === 2 && playerLine.openEnds === 2) priority = 1;

      if (priority > 0) candidates.push({ cell: [i, j], priority });
    }
  }

  let bestMoves: [number, number][] = [];

  if (candidates.length > 0) {
    const maxPriority = Math.max(...candidates.map(c => c.priority));
    bestMoves = candidates.filter(c => c.priority === maxPriority).map(c => c.cell);
  } else {
    board.forEach((row, i) => row.forEach((cell, j) => { if (!cell) bestMoves.push([i, j]); }));
  }

  bestMoves.sort((a, b) => {
    const distA = Math.abs(a[0] - CENTER) + Math.abs(a[1] - CENTER);
    const distB = Math.abs(b[0] - CENTER) + Math.abs(b[1] - CENTER);
    return distA - distB;
  });

  return bestMoves[0];
};
