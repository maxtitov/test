import React from "react";
import { getHighScores } from "../utils/cookies";
import type { Score } from "../utils/cookies";

const HighScore: React.FC = () => {
  const scores: Score[] = getHighScores();

  return (
    <div>
      <h2>High Score</h2>
      <ol>
        {scores.map((s, idx) => (
          <li key={idx}>
            {s.moves} ходов — {new Date(s.date).toLocaleString()}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default HighScore;
