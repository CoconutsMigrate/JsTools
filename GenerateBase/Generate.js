// Contains all properties
var props;

// Contains loaded file text
var fileText;

var DEFAULT_CONFIG = {"importantField":"present"}
var CONST = CONST || {};
CONST.LS_ID = "Generate";
CONST.IDB_ID = "Generate";
CONST.IDB_NAME = "GenerateView";
CONST.IDB_STORE = "GenerateStore";


var json;

function generate() {
	var out = {};
	document.getElementById("output").value = JSON.stringify(out, null, "    ");
	return out;
}

function generateAndCopy() {
	generate();
	var ta = document.getElementById("output");
	ta.select();
	document.execCommand("copy");
}

function showFields() {
	
}

function validateFields() {
	clearWarn();
	allFields(field => field.id && verifyHasValue(field.id), "validateValuePresent");
}

async function readText(event) {
	const file = event.target.files.item(0);
	fileText = await file.text();
	setFilename(file.name);

	try {
		idb.write(CONST.IDB_ID, file.name, fileText);
	} catch (e) {
		alert("Unable to store content: " + e.message);
	}
}

function dbLoaded(idbData) {
	if (idbData && idbData.value) {
		fileText = idbData.value;
	}
	if (idbData && idbData.name) {
		setFilename(idbData.name);
	}
}

function setFilename(value) {
	if (value) {
		document.getElementById("filename").innerHTML = "Loaded file: " + value;
	} else {
		document.getElementById("filename").innerHTML = "";
		document.getElementById("fileSelect").value = null;
	}
}

function clearFile() {
	try {
		idb.write(CONST.IDB_ID, "", "");
		setFilename("");
		fileText = null;
	} catch (e) {
		alert("Unable to store content: " + e.message);
	}
}

window.onload = (event) => {
	propsToFields();
	initFieldEventHandlers();
	showFields();
	validateFields();
	
	document.getElementById("fileSelect").onchange = readText;
	idb.connect(CONST.IDB_NAME, CONST.IDB_STORE, () => {
		idb.read(CONST.IDB_ID, function(d) {
			dbLoaded(d);
		})
	});
};