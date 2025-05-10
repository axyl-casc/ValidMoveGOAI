// genmove.js

const { coordsToGtp, gtpToCoords } = require('./utils');


/**
 * Generate the best move based on current board state and scoring.
 * @param {object} game - The Go game engine object with required methods.
 * @returns {string} - GTP string of the move or "pass"
 */

function generateMove(game, randomMode = false) {
	const boardSize = game.boardSize;
	const allCoords = [];

	for (let y = 0; y < boardSize; y++) {
		for (let x = 0; x < boardSize; x++) {
			if (game.intersectionAt(y, x).value === "empty") {
				allCoords.push({ x, y });
			}
		}
	}

	// Shuffle to randomize tiebreaks or pure randomness
	for (let i = allCoords.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
	}

	if (randomMode) {
		for (const { x, y } of allCoords) {
			if (game.playAt(y, x)) {
				return coordsToGtp(x, y, boardSize);
			}
		}
		game.pass();
		return "pass";
	}

	moveScores.sort((a, b) => {
		const diff = b.score[currentColor] - a.score[currentColor];
		return diff !== 0 ? diff : a.dist2 - b.dist2;
	});

	const best = moveScores[0];
	game.playAt(best.y, best.x);
	return coordsToGtp(best.x, best.y, boardSize);
}

module.exports = generateMove;
