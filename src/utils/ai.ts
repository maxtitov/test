type Cell = "X" | "O" | null;

const SIZE = 10;

const directions = [
  [0, 1], [1, 0], [1, 1], [1, -1]
];

const openLineLength = (board: Cell[][], row: number, col: number, player: "X" | "O"): number => {
  let maxLen = 0;

  for (const [dx, dy] of directions) {
    let count = 1;
    let openEnds = 0;

    // вперед
    let x = row + dx;
    let y = col + dy;
    while (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === player) {
      count++;
      x += dx;
      y += dy;
    }
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === null) openEnds++;

    // назад
    x = row - dx;
    y = col - dy;
    while (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === player) {
      count++;
      x -= dx;
      y -= dy;
    }
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] === null) openEnds++;

    // Если линия заблокирована с одной стороны, то threat уменьшается
    let effectiveLen = count;
    if (openEnds === 0) effectiveLen = count / 2; // полностью заблокирована
    if (openEnds === 1 && count < 5) effectiveLen = count * 0.8; // полузаблокирована, немного меньше вес

    if (effectiveLen > maxLen) maxLen = effectiveLen;
  }

  return maxLen;
};

export const computerMove = (board: Cell[][]): [number, number] => {
  let bestScore = -1;
  let bestMoves: [number, number][] = [];

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== null) continue;

      const myLen = openLineLength(board.map(r => [...r]), i, j, "O");
      const playerLen = openLineLength(board.map(r => [...r]), i, j, "X");

      // Оценка: развитие своей линии + блокировка игрока
      const score = myLen * 2 + playerLen * 1.5;

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
