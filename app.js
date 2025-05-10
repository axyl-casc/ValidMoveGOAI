#!/usr/bin/env node

const readline = require("readline");
const { Game } = require("tenuki");

// Create the Tenuki game without a DOM element
let game = new Game();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
});

function coordsToGtp(x, y) {
	const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
	return letters[x] + (game.boardSize - y);
}

function gtpToCoords(moveStr) {
	const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
	const x = letters.indexOf(moveStr[0].toUpperCase());
	const y = game.boardSize - Number.parseInt(moveStr.slice(1));
	return { x, y };
}

// Random Move Bot
function generateMove() {
	const boardSize = game.boardSize;
	const allCoords = [];

	for (let y = 0; y < boardSize; y++) {
		for (let x = 0; x < boardSize; x++) {
			if (game.intersectionAt(y, x).value === "empty") {
				allCoords.push({ x, y });
			}
		}
	}

	// Shuffle to randomize ties
	for (let i = allCoords.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
	}

	const currentColor = game.currentPlayer();
	const moveScores = [];

	for (const { x, y } of allCoords) {
		if (game.playAt(y, x)) {
			const score = game.score(); // Scoring midgame, may be noisy
			moveScores.push({ x, y, score });
			game.undo();
		}
	}

	if (moveScores.length === 0) {
		game.pass();
		return "pass";
	}

	// Sort by score descending only
	moveScores.sort((a, b) => b.score[currentColor] - a.score[currentColor]);

	const best = moveScores[0];
	game.playAt(best.y, best.x);
	return coordsToGtp(best.x, best.y);
}


rl.on("line", (line) => {
	const trimmed = line.trim();
	if (!trimmed) return;

	const tokens = trimmed.split(/\s+/);
	const command = tokens[0];
	const args = tokens.slice(1);

	switch (command) {
		case "protocol_version":
			respond("2");
			break;

		case "name":
			respond("RandomMove");
			break;

		case "version":
			respond("0.1");
			break;

		case "boardsize": {
			const size = Number.parseInt(args[0], 10);
			game = new Game({ boardSize: size });
			respond("");
			break;
		}

		case "clear_board":
			game = new Game({ boardSize: game.boardSize });
			respond("");
			break;
		case "showboard": {
			const size = game.boardSize;
			const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

			let output = "";
			for (let y = 0; y < size; y++) {
				const row = [];
				for (let x = 0; x < size; x++) {
					const value = game.intersectionAt(y, x).value;
					if (value === "black") {
						row.push("X");
					} else if (value === "white") {
						row.push("O");
					} else {
						row.push(".");
					}
				}
				const rowNum = String(size - y).padStart(2, " ");
				output += `${rowNum} ${row.join(" ")}\n`;
			}

			// Column labels at the bottom
			const colLabels = letters.slice(0, size).split("").join(" ");
			output += `   ${colLabels}\n`;

			respond(`\n${output}`);
			break;
		}

		case "play": {
			const [color, moveStr] = args;
			if (moveStr.toLowerCase() === "pass") {
				game.pass();
				respond("");
				break;
			}
			const { x, y } = gtpToCoords(moveStr);
			const success = game.playAt(y, x);
			respond(success ? "" : "? illegal move");
			break;
		}

		case "genmove": {
			const color = args[0];
			const move = generateMove();
			respond(move);
			break;
		}

		case "quit":
			rl.close();
			break;

		default:
			respond("? unknown command");
	}
});

function respond(response) {
	process.stdout.write(`= ${response}\n\n`);
}
