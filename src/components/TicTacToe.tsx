// src/components/TicTacToe.tsx
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

  // Определяем, кто начинает новую игру
  useEffect(() => {
    if (gameCount % 2 === 0) {
      setTurn("O"); // компьютер начинает
    } else {
      setTurn("X"); // игрок начинает
    }
  }, [gameCount]);

  // Ход компьютера
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

  // Обработка победы
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
    if (board[i][j] || turn !== "X") return; // нельзя ходить на занятую клетку или если сейчас ход компьютера

    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = "X";
    setBoard(newBoard);
    setMoves(prev => prev + 1);
    setTurn("O"); // после хода игрока ходит компьютер
  };

  return (
    <div>
      <Board board={board} onClick={handleClick} />
    </div>
  );
};

export default TicTacToe;
