// genmove.js
const { coordsToGtp } = require("./utils");

/**
 * Proper two-eye life shapes with solid formations and distinct eyes
 * "S" = stone, "_" = eye (must remain empty)
 */
const SHAPES = [
  [
    "SSSSS",
    "S_S_S",
    "SSSSS",
  ],
  [
    "SSSS",
    "SS_S",
    "S_SS",
    "SSSS",
  ],
];

// ──────────────────────── Game State Management ────────────────────────
let currentGameId = null;
let state = {
  shapeBuilt: false,
  shapeIndex: 0,
  triedShapes: 0,
  stonesToPlay: [],
  eyePoints: [],
};

function resetState(game) {
  if (game.id !== currentGameId) {
    currentGameId = game.id;
    state = {
      shapeBuilt: false,
      shapeIndex: 0,
      triedShapes: 0,
      stonesToPlay: [],
      eyePoints: [],
    };
  }
}

function initShape(boardSize) {
  const pattern = SHAPES[state.shapeIndex];
  const patternHeight = pattern.length;
  const patternWidth = pattern[0].length;
  const offsetY = Math.floor((boardSize - patternHeight) / 2);
  const offsetX = Math.floor((boardSize - patternWidth) / 2);

  state.stonesToPlay = [];
  state.eyePoints = [];

  for (let y = 0; y < patternHeight; y++) {
    for (let x = 0; x < patternWidth; x++) {
      const point = { 
        x: offsetX + x, 
        y: offsetY + y 
      };
      
      switch (pattern[y][x]) {
        case "S":
          state.stonesToPlay.push(point);
          break;
        case "_":
          state.eyePoints.push(point);
          break;
      }
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function tryPlaceShapeStone(game, boardSize) {
  for (let i = 0; i < state.stonesToPlay.length; i++) {
    const { x, y } = state.stonesToPlay[i];
    const intersection = game.intersectionAt(y, x);
    
    if (intersection.value === "empty" && game.playAt(y, x)) {
      state.stonesToPlay.splice(i, 1);
      return coordsToGtp(x, y, boardSize);
    }
  }
  return null;
}

// ──────────────────────── Main Logic ────────────────────────
function generateMove(game, randomMode = false) {
  resetState(game);
  const { boardSize } = game;
  const center = (boardSize - 1) / 2;

  // Phase 1: Build two-eye formation
  while (!state.shapeBuilt) {
    if (!state.stonesToPlay.length) initShape(boardSize);

    const move = tryPlaceShapeStone(game, boardSize);
    if (move) {
      if (!state.stonesToPlay.length) state.shapeBuilt = true;
      return move;
    }

    // Try next pattern if current fails
    state.shapeIndex = (state.shapeIndex + 1) % SHAPES.length;
    state.triedShapes++;

    if (state.triedShapes >= SHAPES.length) {
      state.shapeBuilt = true;
    } else {
      state.stonesToPlay = [];
      state.eyePoints = [];
    }
  }

  // Phase 2: Normal move selection
  const candidates = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (game.intersectionAt(y, x).value === "empty" &&
         !state.eyePoints.some(p => p.x === x && p.y === y)) {
        candidates.push({ x, y });
      }
    }
  }

  if (candidates.length === 0) {
    game.pass();
    return "pass";
  }

  shuffle(candidates);

  const currentPlayer = game.currentPlayer();
  const scoredMoves = candidates.map(({ x, y }) => {
    if (!game.playAt(y, x)) return null;
    
    const score = game.score()[currentPlayer];
    game.undo();
    
    const dx = x - center;
    const dy = y - center;
    return {
      x,
      y,
      score,
      distance: dx * dx + dy * dy,
    };
  }).filter(Boolean);

  if (scoredMoves.length === 0) {
    game.pass();
    return "pass";
  }

  scoredMoves.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    return scoreDiff !== 0 ? scoreDiff : a.distance - b.distance;
  });

  const bestMove = randomMode 
    ? scoredMoves[Math.floor(Math.random() * scoredMoves.length)]
    : scoredMoves[0];

  game.playAt(bestMove.y, bestMove.x);
  return coordsToGtp(bestMove.x, bestMove.y, boardSize);
}

module.exports = generateMove;