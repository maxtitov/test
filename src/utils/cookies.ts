import Cookies from "js-cookie";

const COOKIE_KEY = "tic_tac_toe_highscores";

export interface Score {
  moves: number;
  date: string;
}

export const getHighScores = (): Score[] => {
  const cookie = Cookies.get(COOKIE_KEY);
  return cookie ? JSON.parse(cookie) : [];
};

export const saveHighScore = (moves: number) => {
  const scores = getHighScores();
  const newScore: Score = { moves, date: new Date().toISOString() };
  scores.push(newScore);

  // Сортировка: по количеству ходов asc, затем по дате desc (более поздние ниже)
  scores.sort((a, b) => a.moves - b.moves || new Date(a.date).getTime() - new Date(b.date).getTime());

  const newScores = scores.slice(0, 10);
  Cookies.set(COOKIE_KEY, JSON.stringify(newScores), { expires: 365 });
};
