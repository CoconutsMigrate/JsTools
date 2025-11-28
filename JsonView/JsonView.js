var lastSelection = null;
var lastArray = null;
var lastObject = null;
var contents = {};
var contentId = 0;
var IDB_ID = "JsonView";
var IDB_NAME = "JsonView";
var IDB_STORE = "JsonViewStore";
var lastRow = null;

function writeOut(out) {
	document.getElementById("table").innerHTML = out;
}

function doClear() {
	setInput("");
	getAndRememberCurrentJson();
	setFilename("");
}

function generate(name) {
	clearView();
	lastSelection = name;
	var selectedConfig = CONFIG[name];
	var obj = null;
	for (var i in selectedConfig.paths) {
		obj = obj || getSValue(json, selectedConfig.paths[i]);
	}
	if (!obj) {
		return;
	}
	if (selectedConfig.format === "array") {
		obj = objectToArray(obj);
	}
	if (obj instanceof Array) {
		generateFromArray(obj, selectedConfig);
	} else {
		generateFromObject(obj, selectedConfig);
	}
}

function generateFromArray(arr, config) {
	var out = addHeader(config.fields.map(f => f.header));
	arr = config.filter ? arr.filter(config.filter.fn) : arr;
	lastRow = null;
	for (var i in arr) {
		var obj = arr[i];
		out += addRow(config.fields.map(sc => getAndFormatData(sc, obj)));
		lastRow = obj;
	}
	writeOut(out);
}

function generateFromObject(obj, config) {
	var out = addHeader(["Key", "Value"]);
	for (var i in config.fields) {
		var field = config.fields[i];
		var value = getAndFormatData(field, obj);
		out += addRow([field.header, value]);
	}
	writeOut(out);
}

function objectToArray(obj) {
	var arr = [];
	for (var i in obj) {
		arr.push({key: i, value: obj[i]});
	}
	return arr;
}


function isPathPresentInJson(configId) {
	var config = CONFIG[configId];
	var list = config.paths
		.map(path => getSValue(json, path))
		.filter(list => isNonEmptyArray(list))
		.map(list => config.filter ? list.filter(config.filter.fn) : list)
		.filter(list => isNonEmptyArray(list))
	//console.log(configId, list);
	return list.length > 0 && Object.keys(list[0]).length > 0;
}

function isValidFn(configId) {
	var config = CONFIG[configId];
	return config.validFn ? config.validFn() : true;
}

function isNonEmptyArray(obj) {
	return (obj instanceof Array && obj.length > 0 || (obj && Object.keys(obj).length > 0));
}

function isShowAllItems() {
	return false;
}

function generateFilterButtons(selectedConfig) {
	if (selectedConfig.filter && selectedConfig.filter.fields) {
		var out = "";
		for (var i in selectedConfig.filter.fields) {
			out += "&nbsp;" + createQueryField(selectedConfig.filter.fields[i]);
		}
		out += '&nbsp; &nbsp;<input type="button" onclick="generate(lastSelection)" value="Apply">';
	} else {
		var out = "";
	}
	document.getElementById("filter").innerHTML = out;
}




function createButtons() {
	document.getElementById("buttons").innerHTML = "";
	var defaultConfig;
	for (var id in CONFIG) {
		if (isPathPresentInJson(id) && isValidFn(id)) {
			var btn = document.createElement("button");
			btn.innerHTML = id;
			btn.id = id;
			btn.style.marginRight = "10px";
			btn.classList.add("tableSelector");
			document.getElementById("buttons").appendChild(btn);
			if (!defaultConfig && CONFIG[id].default) {
				defaultConfig = id;
			}
		}
	}
	if (defaultConfig) {
		console.log("Generating view: " + defaultConfig);
		generateFilterButtons(CONFIG[defaultConfig]);
		generate(defaultConfig);
	}
}

function showContent(str) {
	document.getElementById("extraContent").innerHTML = str;
}

function toggleVisible(id) {
	var obj = document.getElementById(id.trim());
	obj.style.display = obj.style.display ? "" : "none";
}

function getAndFormatData(selectedConfig, obj) {
	var name = selectedConfig.format || "";
	var paths = selectedConfig.paths;
	var paths = paths instanceof Array ? paths : [paths];
	var value = undefined;
	for (var i in paths) {
		if (!value && isSValue(obj, paths[i])) {
			value = FORMATTING[name].call(null, obj, paths[i], selectedConfig);
		}
	}
	return isValidOr(value, "");
}

function clearView() {
	document.getElementById("extraContent").innerHTML = "";
	document.getElementById("table").innerHTML = "";
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
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

function createContentButton(value) {
	var id = "content-" + contentId;
	contentId++;
	contents[id] = value;
	return '<button class="contentSelector" id="' + id +'">Show</button>';
}

function dbLoaded(idbData) {
	if (idbData && idbData.value) {
		setInput(idbData.value);
		json = getAndRememberCurrentJson(idbData.name); // TODO this save seems unnecessary
		createButtons();
	}
	if (idbData && idbData.name) {
		setFilename(idbData.name);
	}
}

function highlightBtn(className, btn) {
	var ccc = document.getElementsByClassName(className);
	for (i in ccc) {
		ccc[i].style && (ccc[i].style.backgroundColor = "");
	}
	btn.style.backgroundColor = "cyan";	
}

async function readText(processorFn, event) {
	if (isShowJsonText()) {
		document.getElementById("showJsonText").click();
	}
	const file = event.target.files.item(0);
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function (evt) {
		text = evt.target.result;
   		if (processorFn) {
			text = processorFn(text);
		}
		setFilename(file.name);

		setInput(text);
		json = getAndRememberCurrentJson(file.name);
		clearView();
		createButtons();
	}
}

function getAndRememberCurrentJson(name) {
	var input = getInput();
	try {
		idb.write(IDB_ID, name, input);
	} catch (e) {
		alert("Unable to store json: " + e.message);
	}
	return JSON.parse(input);
}

function inputFromTextArea() {
	var stripToJson = document.getElementById("stripToJson").checked
	setFilename("");
	setInput(getInputFieldText());
	var t = getInput();
	if (stripToJson) {
		t = t.substring(t.indexOf("{"), t.lastIndexOf("}") + 1)
		setInput(t);
	}
	json = getAndRememberCurrentJson();
	createButtons();
}

function getInput() {
	return text;
}

function setInput(value) {
	text = value;
	if (isShowJsonText()) {
		document.getElementById("input").value = value;
	}
}

function setFilename(value) {
	localStorage.armFilename = value;
	document.getElementById("filename").innerHTML = "Loaded file: " + value;
}

function isShowJsonText() {
	return document.getElementById("showJsonText").checked;
}

function getInputFieldText() {
	return document.getElementById("input").value;
}

window.onload = (event) => {
	document.getElementById("fileSelect").onchange = readText.bind(null, null);
	document.getElementById("fromText").onclick = inputFromTextArea.bind(null, null);
	document.getElementById("buttons").addEventListener('click', function(e) {
		if (e && e.target && e.target.tagName === "BUTTON" && e.target.id) {
			highlightBtn("tableSelector", e.target);
			generateFilterButtons(CONFIG[e.target.id]);
			generate(e.target.id);
		}
	}, false);
	document.getElementById("table").addEventListener('click', function(e) {
		if (e && e.target && e.target.id && contents[e.target.id]) {
			highlightBtn("contentSelector", e.target);
			document.getElementById("extraContent").innerHTML = contents[e.target.id];
		}
	}, false);
	document.getElementById("showJsonText").addEventListener("change", function(e) {
		var input = document.getElementById("input");
		input.style.display = e.target.checked ? "" : "none";
		if (e.target.checked) {
			input.value = text;
		}
	});
	
	idb.connect(IDB_NAME, IDB_STORE, () => {
		idb.read(IDB_ID, function(d) {
			dbLoaded(d)
		})
	});
};