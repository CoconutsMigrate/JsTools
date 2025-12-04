var CONST = CONST || {};

// LocalStorage
function setFieldTo(id, value) {
	props[id] = value;
	propsToLocalStorage();
}

function getOrCreateLS() {
	try {
		var ls = JSON.parse(localStorage[CONST.LS_ID]);
	} catch (e) {
		localStorage[CONST.LS_ID] = JSON.stringify(DEFAULT_CONFIG);
		ls = DEFAULT_CONFIG;
	} finally {
		return ls;
	}
}

function propsToLocalStorage() {
	for (i in props) {
		if (!document.getElementById(i)) {
			console.log("Invalid field: " + i);
			delete props[i];
		}
	}
	localStorage[CONST.LS_ID] = JSON.stringify(props);
}

function propsToFields() {
	props = getOrCreateLS();
	allFields(function(field) {
		if (field.type === "checkbox") {
			field.checked = props[field.id] === "true";
		} else {
			field.value = props[field.id] || "";
		}
	});
}

function fieldToProps(field) {
	if (field.type === "checkbox") {
		var value = field.checked.toString();
	} else {
		var value = field.value;
	}
	console.log(field.id + " <= " + value);
	if (value === "") {
		delete props[field.id]
	} else {
		props[field.id] = value;
	}
	propsToLocalStorage();
	validateFields();
}

function clearAll() {
	if (confirm("Clear all properties?")) {
		localStorage.removeItem(CONST.LS_ID);
		propsToFields();
		showFields();
		validateFields();
	}
}


function verifyIncreaseIfPresent(fieldId1, fieldId2) {
	if (hasValue(fieldId1) && hasValue(fieldId2)) {
		if (!(parseInt(props[fieldId1]) < parseInt(props[fieldId2]))) {
			warnField(fieldId1);
			warnField(fieldId2);
		}
	}
}

function verifyHasValue(fieldId) {
	if (!hasValue(fieldId)) {
		warnField(fieldId);
	}
}

function clearWarn() {
	allFields(field => field.classList && field.classList.remove("warning"));
}

function warnField(fieldId) {
	document.getElementById(fieldId).classList.add("warning");
}

function initFieldEventHandlers() {
	allFields(function(field) {
		field.onchange = fieldToProps.bind(null, field);
	});
}

function allFields(fn, fieldClass) {
	var fields = document.getElementsByClassName(fieldClass || "field");
	for (var i in fields) {
		fn(fields[i]);
	}
}

function hasValue(fieldId) {
	return props[fieldId] !== null && props[fieldId] !== undefined && props[fieldId] !== "";
}

function isInt(fieldId) {
	return hasValue(fieldId) && props[fieldId].toString().match(/^[+-]?[0-9]+$/);
}

function isNegativeInt(fieldId) {
	return hasValue(fieldId) && props[fieldId].toString().match(/^-[0-9]+$/);
}

function toIntOr(fieldId, defVal) {
	return isInt(fieldId) ? parseInt(props[fieldId]) : defVal;
}

function padzero(str, len) {
	return str ? str.toString().padStart(len, "0") : padzero("0", len);
}

function configOut() {
	document.getElementById("output").value = localStorage[CONST.LS_ID];
}

function configIn() {
	try {
		var v = JSON.parse(document.getElementById("output").value);
		if (confirm("Overwrite current configuration?")) {
			for (var i in v) {
				props[i] = v[i];
			}
			propsToLocalStorage();
			propsToFields();
			validateFields();
			showFields();
		}
	} catch (e) {
		console.log("Invalid json");
	}
}
