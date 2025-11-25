import React from "react";
import Square from "./Square";

interface BoardProps {
  board: ("X" | "O" | null)[][];
  onClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onClick }) => {
  return (
    <div className="board">
      {board.map((row, i) => (
        <div key={i} className="board-row">
          {row.map((cell, j) => (
            <Square key={j} value={cell} onClick={() => onClick(i, j)} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
