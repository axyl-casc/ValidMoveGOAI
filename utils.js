// utils.js

const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

/**
 * Converts (x, y) to GTP coordinate string.
 * @param {number} x - x coordinate (0-indexed).
 * @param {number} y - y coordinate (0-indexed).
 * @param {number} boardSize - Size of the board (e.g., 19).
 * @returns {string} - GTP coordinate (e.g., "D4").
 */
function coordsToGtp(x, y, boardSize) {
	return letters[x] + (boardSize - y);
}

/**
 * Converts GTP coordinate string to (x, y).
 * @param {string} moveStr - GTP coordinate (e.g., "D4").
 * @param {number} boardSize - Size of the board (e.g., 19).
 * @returns {{x: number, y: number}} - Object with x and y.
 */
function gtpToCoords(moveStr, boardSize) {
	const x = letters.indexOf(moveStr[0].toUpperCase());
	const y = boardSize - Number.parseInt(moveStr.slice(1));
	return { x, y };
}

module.exports = {
	coordsToGtp,
	gtpToCoords,
};
