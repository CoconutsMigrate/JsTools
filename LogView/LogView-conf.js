function isLogHeader(line) {
	return line.match(/^ *\[?([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}:[0-9]{2}:[0-9]{2})/);
}

var LINE_LENGTH_LIMIT = 200;

var STYLE = [
	{ query: /[\[ ]WARN(ING)?[ \]:]/, style: "background-color: #fab387" },
	{ query: /[\[ ]ERROR?[ \]:]/, style: "background-color: #ffa0a0" },
	{ query: /[\[ ]DEBUG?[ \]:]/, style: "color: #a0a0a0" }
];

var AUTO_REPLACE = [
	{ "from": /^Unknown$/, "to": "" }
];
