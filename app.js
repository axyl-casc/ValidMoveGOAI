#!/usr/bin/env node

const { coordsToGtp, gtpToCoords } = require('./utils');

const randomMode = process.argv.includes("-random");

const readline = require("readline");
const { Game } = require("tenuki");
const generateMove = require('./genmove');

// Create the Tenuki game without a DOM element
let game = new Game({
	scoring: "area"
  });
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
});

rl.on("line", (line) => {
	//console.log(`Game State: ${game.isOver() ? "Game Over" : "In Progress"}`);
	//console.log(`Received: ${line}`);
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
			respond("AtariBot");
			break;

		case "version":
			respond("0.2");
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
			const [colorStr, moveStr] = args;
			const lc = colorStr.toLowerCase();
			const expectedColor =
				lc === "b" || lc === "black" ? "black" :
				lc === "w" || lc === "white" ? "white" :
				null;

			if (game.currentPlayer() !== expectedColor) {
				game.pass();
			}
			if (!expectedColor) {
				respond("? invalid color");
				break;
			}

			if (moveStr.toLowerCase() === "pass") {
				respond("");
				break;
			}

			let coords;
			try {
				coords = gtpToCoords(moveStr, game.boardSize);
			} catch {
				respond("? invalid coordinates");
				break;
			}

			if (!coords || typeof coords.x !== "number" || typeof coords.y !== "number") {
				respond("? invalid move");
				break;
			}

			const { x, y } = coords;

			if (x < 0 || y < 0 || x >= game.boardSize || y >= game.boardSize) {
				respond("? move out of bounds");
				break;
			}

			const success = game.playAt(y, x);
			respond(success ? "" : "? illegal move");
			break;
		}

		case "genmove": {
			const lc = args[0].toLowerCase();
			const expectedColor =
				lc === "b" || lc === "black" ? "black" :
				lc === "w" || lc === "white" ? "white" :
				null;

			if (!expectedColor) {
				respond("? invalid color");
				break;
			}
			if (game.currentPlayer() !== expectedColor) {
				game.pass();
			}

			const move = generateMove(game, randomMode);
			respond(move);
			break;
		}



		case "quit":
			rl.close();
			break;

		default:
			respond(`? unknown command: ${line}`);
	}
});

function respond(response) {
	process.stdout.write(`= ${response}\n\n`);
}
