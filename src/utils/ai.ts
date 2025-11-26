import { checkWinner } from "./checkWinner";
type Cell = "X" | "O" | null;

const SIZE = 10;
const WIN_LEN = 5;

// === Tunable parameters ===
const ITERATIONS = 500;        // number of MCTS simulations per move (increase for stronger play)
const SEARCH_RADIUS = 2;       // only consider empty cells within this manhattan distance of existing stones
const ROLLOUT_DEPTH = 40;      // max moves in a single simulation (to avoid infinite playouts)
const UCB_C = Math.sqrt(2);    // exploration constant for UCB1

// Helper: list empty cells
function allEmptyCells(board: Cell[][]): [number, number][] {
  const res: [number, number][] = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === null) res.push([i, j]);
    }
  }
  return res;
}

// Helper: candidate moves near existing stones (or full board if empty)
function candidateMoves(board: Cell[][]): [number, number][] {
  // collect occupied positions
  const occupied: [number, number][] = [];
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (board[i][j] !== null) occupied.push([i, j]);

  if (occupied.length === 0) {
    // start near center
    const c = Math.floor(SIZE / 2);
    return [[c, c]];
  }

  const set = new Set<string>();
  for (const [x, y] of occupied) {
    for (let dx = -SEARCH_RADIUS; dx <= SEARCH_RADIUS; dx++) {
      for (let dy = -SEARCH_RADIUS; dy <= SEARCH_RADIUS; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && board[nx][ny] === null) {
          set.add(`${nx},${ny}`);
        }
      }
    }
  }

  // if set empty (rare), fallback to any empty
  if (set.size === 0) return allEmptyCells(board);

  const arr: [number, number][] = [];
  for (const s of set) {
    const [a, b] = s.split(",").map(Number);
    arr.push([a, b]);
  }

  // sort by proximity to center (prefer center)
  const center = (SIZE - 1) / 2;
  arr.sort((A, B) => {
    const da = Math.abs(A[0] - center) + Math.abs(A[1] - center);
    const db = Math.abs(B[0] - center) + Math.abs(B[1] - center);
    return da - db;
  });

  return arr;
}

// Clone board
function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((r) => r.slice());
}

// Apply move
function applyMove(board: Cell[][], move: [number, number], player: "X" | "O") {
  board[move[0]][move[1]] = player;
}

// Heuristic for selecting moves in rollout: prefer moves near stones and center
function rolloutSelect(board: Cell[][]): [number, number] {
  const candidates = candidateMoves(board);
  // Score by distance to center and number of neighbors
  const center = (SIZE - 1) / 2;
  let bestScore = -Infinity;
  let best: [number, number] | null = null;
  for (const [i, j] of candidates) {
    // neighbor count
    let neigh = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const x = i + dx, y = j + dy;
      if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && board[x][y] !== null) neigh++;
    }
    const dist = Math.abs(i - center) + Math.abs(j - center);
    const score = neigh * 2 - dist * 0.5 + (Math.random() * 0.1); // small randomness
    if (score > bestScore) {
      bestScore = score;
      best = [i, j];
    }
  }
  // fallback
  return best ?? candidates[0];
}

// === MCTS node ===
class Node {
  move: [number, number] | null;      // move that led here (null for root)
  parent: Node | null;
  children: Node[];
  wins: number;   // wins for playerWhoMoved? we'll track wins for 'O' (computer)
  visits: number;
  player: "X" | "O"; // player who just moved to create this node
  untriedMoves: [number, number][];

  constructor(move: [number, number] | null, parent: Node | null, player: "X" | "O", untriedMoves: [number, number][]) {
    this.move = move;
    this.parent = parent;
    this.children = [];
    this.wins = 0;
    this.visits = 0;
    this.player = player;
    this.untriedMoves = untriedMoves.slice();
  }
}

// UCB1 score (maximize for root player's perspective: we'll use wins counted as O wins)
function ucb1(child: Node, totalVisits: number): number {
  if (child.visits === 0) return Infinity;
  const winRate = child.wins / child.visits;
  return winRate + UCB_C * Math.sqrt(Math.log(totalVisits) / child.visits);
}

// Simulation (rollout) returns +1 if computer (O) wins, -1 if X wins, 0 for draw
function rolloutSimulator(startBoard: Cell[][], startPlayer: "X" | "O"): number {
  const board = cloneBoard(startBoard);
  let player = startPlayer;
  for (let step = 0; step < ROLLOUT_DEPTH; step++) {
    // if terminal?
    if (checkWinner(board, "O")) return 1;
    if (checkWinner(board, "X")) return -1;
    // pick move
    const move = rolloutSelect(board);
    applyMove(board, move, player);
    // check immediate winner
    if (checkWinner(board, player)) {
      return player === "O" ? 1 : -1;
    }
    player = player === "O" ? "X" : "O";
    // if board full -> draw
    const anyEmpty = board.some((row) => row.some((c) => c === null));
    if (!anyEmpty) break;
  }
  return 0; // draw / inconclusive
}

// Main MCTS function: returns best move [i,j]
export function computerMove(board: Cell[][]): [number, number] {
  // root node: last moved player is 'X' if it's O's turn, or 'O' if X's turn.
  // We assume call happens when it's O's turn.
  const rootPlayer: "X" | "O" = "X"; // last moved was X, now O to play
  const moves = candidateMoves(board);
  // if only one candidate, return it
  if (moves.length === 1) return moves[0];

  const root = new Node(null, null, rootPlayer, moves);

  for (let it = 0; it < ITERATIONS; it++) {
    // 1. Selection
    let node = root;
    const boardCopy = cloneBoard(board);
    // replay moves from root to node
    // node.player is last mover; children nodes represent moves by the other player
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      // select best child by UCB
      let bestChild: Node | null = null;
      let bestScore = -Infinity;
      for (const ch of node.children) {
        const score = ucb1(ch, node.visits || 1);
        if (score > bestScore) {
          bestScore = score;
          bestChild = ch;
        }
      }
      if (!bestChild) break;
      // apply the move of bestChild to boardCopy
      if (bestChild.move) applyMove(boardCopy, bestChild.move, bestChild.player === "X" ? "X" : "O");
      node = bestChild;
    }

    // 2. Expansion
    if (node.untriedMoves.length > 0) {
      // pick a random untried move (prefer earlier ones which are closer to center due to sorting)
      const idx = Math.floor(Math.random() * node.untriedMoves.length);
      const m = node.untriedMoves.splice(idx, 1)[0];
      // determine which player made this move: node.player is last mover, so next mover is opposite
      const mover: "X" | "O" = node.player === "X" ? "O" : "X";
      applyMove(boardCopy, m, mover);
      // create new child
      const newMoves = candidateMoves(boardCopy);
      const child = new Node(m, node, mover, newMoves);
      node.children.push(child);
      node = child;
    }

    // 3. Simulation (rollout) from node
    // current player to move is opposite of node.player
    const currentToMove: "X" | "O" = node.player === "X" ? "O" : "X";
    const result = rolloutSimulator(boardCopy, currentToMove);
    // result: 1 if O wins, -1 if X wins, 0 draw

    // 4. Backpropagation
    let backNode: Node | null = node;
    while (backNode) {
      backNode.visits += 1;
      if (result === 1) {
        // O win contributes as a win
        backNode.wins += 1;
      } else if (result === 0) {
        backNode.wins += 0.5; // half credit for draw
      } // X win -> add 0
      backNode = backNode.parent;
    }
  }

  // choose the child of root with highest visits (robust child)
  let bestChild: Node | null = null;
  let bestVisits = -1;
  for (const ch of root.children) {
    if (ch.visits > bestVisits) {
      bestVisits = ch.visits;
      bestChild = ch;
    }
  }
  // fallback: pick move closest to center among root.untriedMoves or all moves
  if (!bestChild) {
    if (root.untriedMoves.length > 0) {
      // choose closest to center
      const center = (SIZE - 1) / 2;
      root.untriedMoves.sort((A, B) => {
        return (Math.abs(A[0] - center) + Math.abs(A[1] - center)) - (Math.abs(B[0] - center) + Math.abs(B[1] - center));
      });
      return root.untriedMoves[0];
    }
    return moves[0];
  }

  return bestChild.move as [number, number];
}
