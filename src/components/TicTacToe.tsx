import React, { useState, useEffect } from "react";
import Board from "./Board";
import { checkWinner } from "../utils/checkWinner";
import { computerMove } from "../utils/ai";
import { saveHighScore } from "../utils/cookies";

const SIZE = 10;

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<( "X" | "O" | null)[][]>(
    Array(SIZE).fill(null).map(() => Array(SIZE).fill(null))
  );
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [moves, setMoves] = useState(0);
  const [gameCount, setGameCount] = useState(1);

  useEffect(() => {
    if (gameCount % 2 === 0) {
      setTurn("O");
    } else {
      setTurn("X");
    }
  }, [gameCount]);

  useEffect(() => {
    if (turn === "O") {
      const [i, j] = computerMove(board);
      if (i !== undefined && j !== undefined) {
        const newBoard = board.map(row => [...row]);
        newBoard[i][j] = "O";
        setBoard(newBoard);
        setTurn("X");
        setMoves(prev => prev + 1);
      }
    }
  }, [turn, board]);

  useEffect(() => {
    if (checkWinner(board, "X")) {
      alert(`Вы выиграли за ${moves} ходов!`);
      saveHighScore(moves);
      startNewGame();
    } else if (checkWinner(board, "O")) {
      alert("Компьютер выиграл!");
      startNewGame();
    }
  }, [board]);

  const startNewGame = () => {
    setBoard(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    setMoves(0);
    setGameCount(prev => prev + 1);
  };

  const handleClick = (i: number, j: number) => {
    if (board[i][j] || turn !== "X") return;

    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = "X";
    setBoard(newBoard);
    setMoves(prev => prev + 1);
    setTurn("O");
  };

  return (
    <div>
      <Board board={board} onClick={handleClick} />
    </div>
  );
};

export default TicTacToe;
