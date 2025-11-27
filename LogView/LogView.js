var lines = [];
var logLine = "";
var infoLines = "";
var out = "";
var divId = 1;

function inputFromTextArea() {
	var text = byId("input").value;
	if (text) {
		lines = text.split("\n");
		performAutoReplace();
		processLines();
	}
}

async function inputFromFile() {
	if (byId("showText").checked) {
		byId("showText").click();
	}
	const file = event.target.files.item(0);
	document.title = "Log: " + file.name;
	const text = await file.text();
	lines = text.split("\n");
	performAutoReplace();
	processLines();
}

function performAutoReplace() {
	for (var i = 0; i < lines.length; i++) {
		for (var j in AUTO_REPLACE) {
			lines[i] = lines[i].replace(AUTO_REPLACE[j].from, AUTO_REPLACE[j].to);
		}
	}
}

function getLineLen() {
	return  parseInt(byId("linelen").value) || LINE_LENGTH_LIMIT;
}

function processLines() {
	var lineLengthLimit = getLineLen();
	saveFilter();
	var filter = byId("show").value;
	var hide = byId("hide").value;
	var isShow;
	var isHide;
	clearLines();
	out = "";
	for (var i = 0; i < lines.length; i++) {
		if (isLogHeader(lines[i])) {
			isShow = !filter || lines[i].match(new RegExp(filter, "i"));
			isHide = hide && lines[i].match(new RegExp(hide, "i"));
			writeLog();
			logLine = isShow && !isHide ? lines[i] : "";
			if (logLine.length > lineLengthLimit) {
				infoLines += logLine;
				logLine = logLine.substr(0, lineLengthLimit);
			}
		} else if (isShow && !isHide && lines[i] != "") {
			infoLines += lines[i].replaceAll(" ", "&nbsp;") + "<br>";
		}
	}
	writeLog();
	byId("out").innerHTML = out;
}

function writeLog() {
	if (logLine) {
		out += logLineFormat(logLine);
	}
	if (infoLines) {
		out += '<button href="#" onclick="toggleView(' + divId + ')">Show</button>' + infoDiv(divId, infoLines);
		divId++;
	}
	if (logLine || infoLines) {
		out += "<br>";
	}
	clearLines();
}

function infoDiv(id, content) {
	return '<div style="background-color: ffffe0; display:none" id="div-' + divId + '">' + infoLines + '</div>';
}

function isJsonFormat(line) {
	for (var i in TO_JSON) {
		if (line.match(TO_JSON[i])) {
			return true;
		}
	}
	return false;
}

function truncHeaderLine(line) {
	return line.replace(/(.*) +\| +(.*) +\| +(.*) +\| +(.*)/, "$1 | $2 | $4");
}

function logLineFormat(line) {
	line = truncHeaderLine(line);
	for (var i in STYLE) {
		if (line.match(STYLE[i].query)) {
			return '<span style="' + STYLE[i].style + '">' + line + '</span>';
		}
	}
	return line;
}

function clearLines() {
	logLine = "";
	infoLines = "";
}

function toggleView(id) {
	var d = byId("div-" + id);
	if (d) {
		d.style.display = d.style.display ? "" : "none";
	}
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<div class="' + cls + '">' + match + '</div>';
    });
}

function loadFilter() {
	try {
		var fields = JSON.parse(localStorage.logView);
		byId("show").value = fields.show;
		byId("hide").value = fields.hide;
		byId("linelen").value = parseInt(fields.linelen) || LINE_LENGTH_LIMIT;
	} catch (e) {}
}

function saveFilter() {
	var fields = JSON.stringify({ "show": byId("show").value, "hide": byId("hide").value, "linelen": (parseInt(byId("linelen").value) || LINE_LENGTH_LIMIT) });
	localStorage.logView = fields;
}

function byId(id) {
	return document.getElementById(id);
}

window.onload = (event) => {
	byId("fileSelect").onchange = inputFromFile;
	byId("processLog").onclick = inputFromTextArea;
	byId("filterCmd").onclick = processLines;
	byId("clearText").onclick = function() {
		byId("input").value = "";
		byId("input").focus();
	}
	byId("showText").addEventListener("change", function(e) {
		var input = byId("input");
		input.style.display = e.target.checked ? "" : "none";
	});
	loadFilter();
};