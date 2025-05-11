const { spawn } = require("child_process");

// Launch your GTP bot
const bot = spawn("node", ["app.js", "-random"]);
const commands = [
	"# Initialize board",
	"boardsize 9",
	"clear_board",
	"showboard",

	"# Basic legal plays",
	"play B D4",
	"play W D3",
	"play B D5",
	"play W D2",
	"play B D1",
	"play W C1",
	"showboard",

	"# Test out-of-turn",
	"play B E5",
	"showboard",

	"# Test invalid move string",
	"play black Z99",  // Out of bounds
	"play black XX",   // Invalid string

	"# Test pass",
	"play white pass",
	"play black pass",
    "clear_board",

	"# Show updated board",
	"showboard",

	"# Test genmove with turn sync (should play for black)",
	"genmove black",
	"showboard",
	"genmove white",
	"showboard",

	"# Fill board for endgame check",
	"play black C3",
	"play white E3",
	"play black C5",
	"play white E5",
	"play black C6",
	"play white E6",
	"play black D6",
	"play white F4",
	"showboard",

	"# Final moves",
	"genmove black",
	"genmove white",

    
"clear_board",
"boardsize 9",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"genmove b",
"showboard",

	"# End",
	"quit",
];


// Print responses from the bot
bot.stdout.on("data", (data) => {
	process.stdout.write(data.toString());
});

// Print any errors (like invalid command or crash)
bot.stderr.on("data", (data) => {
	console.error("STDERR:", data.toString());
});

// Send the commands line by line
bot.stdin.setDefaultEncoding("utf-8");

for (const cmd of commands) {
	bot.stdin.write(`${cmd}\n`);
}
