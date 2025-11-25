type Cell = "X" | "O" | null;

const SIZE = 10;
const directions = [
  [0, 1], [1, 0], [1, 1], [1, -1]
];

const openLineLength = (board: Cell[][], row: number, col: number, player: "X" | "O"): { length: number, openEnds: number } => {
  let maxLen = 0;
  let maxOpenEnds = 0;

  for (const [dx, dy] of directions) {
    let count = 1;
    let openEnds = 0;

    // вперед
    let x = row + dx, y = col + dy;
    while (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === player) {
      count++;
      x += dx;
      y += dy;
    }
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === null) openEnds++;

    // назад
    x = row - dx; y = col - dy;
    while (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === player) {
      count++;
      x -= dx;
      y -= dy;
    }
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === null) openEnds++;

    if (count > maxLen || (count === maxLen && openEnds > maxOpenEnds)) {
      maxLen = count;
      maxOpenEnds = openEnds;
    }
  }

  return { length: maxLen, openEnds: maxOpenEnds };
};

// AI ход
export const computerMove = (board: Cell[][]): [number, number] => {
  let bestScore = -1;
  let bestMoves: [number, number][] = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== null) continue;

      const myLine = openLineLength(board.map(r => [...r]), i, j, "O");
      const playerLine = openLineLength(board.map(r => [...r]), i, j, "X");

      let score = 0;

      // 1. Если игрок может выиграть за 1 ход, блокировать обязательно
      if (playerLine.length >= 4 && playerLine.openEnds > 0) {
        score += 1000;
      } else {
        // 2. Если у игрока есть линия из 3 с открытыми концами
        if (playerLine.length === 3 && playerLine.openEnds === 2) {
          // блокировать только если у компьютера нет линии >=4
          if (myLine.length < 4) {
            score += 500;
          }
        }
      }

      score += myLine.length * 10 + myLine.openEnds * 5;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [[i, j]];
      } else if (score === bestScore) {
        bestMoves.push([i, j]);
      }
    }
  }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
