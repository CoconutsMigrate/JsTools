var formatting = {
	"fixed": function(obj, path) {
		var value = getSValue(obj, path);
		return getSValueToFixed(obj, path, 0).replace(/(\.\d+?)0+/, "$1"); // Remove trailing 0s
	},
	
	"fixed0": function(obj, path) {
		return getSValueToFixed(obj, path, 0);
	},
	
	"fixed1": function(obj, path) {
		return getSValueToFixed(obj, path, 1);
	},
	
	"fixed3": function(obj, path) {
		return getSValueToFixed(obj, path, 3);
	},
	
	"fixed6": function(obj, path) {
		return getSValueToFixed(obj, path, 6);
	},
	
	"number1000": function(obj, path) {
		var value = Math.floor(getSValue(obj, path) || 0).toString();
		return value.substring(0, value.length - 3) + '<font color="7f7f7f" size="-1">' + value.substring(value.length - 3) + '</font>';
	},
	
	"sep1000": function(obj, path) {
		var value = getSValue(obj, path);
		var v = value ? value.toString() : "0";
		var di = v.indexOf(".");
		return di >= 0 ? numberSep(v.substr(0, di)) + v.substr(di) : numberSep(v);
	},
	
	"number": function(obj, path, fieldProperties) {
		var value = getSValue(obj, path);
		return value || "0";
	},
	
	"enum": function(obj, path, fieldProperties) {
		var value = getSValue(obj, path);
		return fieldProperties.parameters[value] || value || "0";
	},
	
	"array": function(obj, path) {
		var arr = [];
		var arraySize = getSValue(obj, path.replace(/.?ARRAYINDEX.*/, "")).length
		for (var index = 0; index < arraySize; index++) {
			var value = getSValue(obj, path.replace("ARRAYINDEX", index.toString()));
			arr.push(index + ". " + (value || ""));
		}
		return arr.join("<br>");
	},
	
	"hiddenText": function(obj, path) {
		var value = getSValue(obj, path) || "";
		return createContentButton("<pre>" + value + "</pre>");
	},
	
	"hiddenJson": function(obj, path) {
		var value = getSValue(obj, path);
		var formatted = value ? syntaxHighlight(value) : "";
		return createContentButton("<pre>" + formatted + "</pre>");
	},
	
	"json": function(obj, path) {
		var value = getSValue(obj, path);
		var formatted = value ? JSON.stringify(value) : "";
		return formatted;
	},
	
	"groupOnValue": function(obj, path) {
		var G_C = ["#b09020", "#2090b0"];
		document.groupOnValue = document.groupOnValue || {};
		document.groupOnValueColIndex = document.groupOnValueColIndex || {};
		var value = getSValue(obj, path);
		if (value && value != document.groupOnValue[path]) {
			document.groupOnValue[path] = value;
			document.groupOnValueColIndex[path] = ((document.groupOnValueColIndex[path] || 0) + 1) % G_C.length;
		}
		return spanCol(value, G_C[document.groupOnValueColIndex[path]]);
	},
	
	"boolean": function(obj, path) {
		return toBoolean(getSValue(obj, path));
	},
	
	"fn": function(obj, path, fieldProperties) {
		var value = getSValue(obj, path);
		if (fieldProperties && typeof fieldProperties.fn == "function") {
			value = fieldProperties.fn(value);
		}
		return value;
	},
	
	"": function(obj, path) {
		var value = getSValue(obj, path);
		return value || "";
	}
};

var FORMATTING = FORMATTING ? Object.assign(FORMATTING, formatting) : formatting;
