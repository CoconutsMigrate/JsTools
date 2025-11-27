var text = null;
var json = null;

function addHeader(headerItems) {
	return "<tr>" + headerItems.map(c => "<th>" + c + "</th>").join("") + "</tr>";
}

function addRow(rowItems) {
	return "<tr>" + rowItems.map(c => "<td>" + c + "</td>").join("") + "</tr>";
}

function addRowWithStyle(style, rowItems) {
	return "<tr>" + rowItems.map(c => "<td>" + c + "</td>").join("") + "</tr>";
}

function toBoolean(value) {
	return value ? '<span style="color:green">&#10004;</span>' : '<span style="color:red">&#10006;</span>';
}

function openTagStyle(tag, style) {
	return "<" + tag + (style[tag] ? "" : "") + ">";
}

function createQueryField(name) {
	return name + "&nbsp;" + '<input type="text" id="field' + name + '" style="width: 100">';
}

function spanCol(value, style) {
	if (typeof style == 'string') {
		return '<span style="' + styleCol(style) + '">' + value + '</span>';
	} else if (style === Object(style)) {
		return '<span style="' + styleCol(style.fg) + styleBgCol(style.bg) + '">' + value + '</span>';
	} else {
		return '<span>' + value + '</span>';
	}
}

function styleCol(colour) {
	return colour ? "color:" + colour + ";" : "";
}

function styleBgCol(colour) {
	return colour ? "background-color:" + colour + ";" : "";
}

function getQueryFieldValue(name, defaultValue) {
	var f = document.getElementById("field" + name);
	return f ? f.value : defaultValue;
}

function getQueryFieldNumberValue(name, defaultValue) {
	var f = document.getElementById("field" + name);
	return f && f.value ? parseFloat(f.value) : defaultValue;
}

function getSValue(obj, path) {
	if (path === "" || path === ".") {
		return obj;
	}
	var arr = path.split(".");
	for (var i in arr) {
		if (obj) {
			var origPathPart = arr[i];
			var camelPathPart = snakeToCamel(origPathPart);
			var snakePathPart = camelToSnake(origPathPart);
			if (isValid(obj[origPathPart])) {
				obj = obj[origPathPart];
			} else if (isValid(obj[camelPathPart])) {
				obj = obj[camelPathPart];
			} else if (isValid(obj[snakePathPart])) {
				obj = obj[snakePathPart];
			} else if (parseInt(origPathPart) < 0) { // Negative index
				var index = obj.length + parseInt(origPathPart);
				obj = obj[index];
			} else {
				obj = null;
			}
		}
	}
	return obj;
}

function snakeToCamel(snakeCase) {
    return snakeCase.toLowerCase().replace(/(_\w)/g, function(match) {
        return match[1].toUpperCase();
    });
}

function camelToSnake(camelCase) {
    return camelCase.replace(/([A-Z])/g, function(match) {
        return '_' + match.toLowerCase();
    });
}

function getSValueToFixed(obj, path, digits) {
	try {
		return getSValue(obj, path).toFixed(digits);
	} catch (e) {
		return "/";
	}
}

function getFirstSValue(obj, ...paths) {
	for (var i in paths) {
		var r = getSValue(obj, paths[i]);
		if (r !== null && r !== undefined) {
			return r;
		}
	}
	return null;
}

function isSValue(obj, path) {
	var value = getSValue(obj, path.replace(/ARRAYINDEX/, "0"));
	return value == 0 || value;
}

function isValid(value) {
	return value || value == 0;
}

function isValidOr(value, orElse) {
	return isValid(value) ? value : orElse;
}

function padzero(str, len) {
	return str ? str.toString().padStart(len, "0") : padzero("0", len);
}

function numberSep(str) {
	return str.replace(/\B(?=(\d{3})+(?!\d))/g, " "); /// "12345678" -> "12 345 678"
}

function isShowJsonText() {
	return document.getElementById("showJsonText").checked;
}

function getInputFieldText() {
	return document.getElementById("input").value;
}









