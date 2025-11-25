export const checkWinner = (board: ("X" | "O" | null)[][], player: "X" | "O") => {
  const size = board.length;

  const directions = [
    [0, 1],  // горизонталь
    [1, 0],  // вертикаль
    [1, 1],  // диагональ вниз
    [1, -1], // диагональ вверх
  ];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] !== player) continue;

      for (const [dx, dy] of directions) {
        let count = 1;
        let x = i + dx;
        let y = j + dy;

        while (
          x >= 0 &&
          y >= 0 &&
          x < size &&
          y < size &&
          board[x][y] === player
          ) {
          count++;
          if (count === 5) return true;
          x += dx;
          y += dy;
        }
      }
    }
  }
  return false;
};
