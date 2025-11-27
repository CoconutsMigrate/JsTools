var COUNT = 10;

function copyText(id) {
	var ta = document.getElementById("copy" + id);
	ta.select();
	document.execCommand("copy");
}

function save() {
	var c = {}
	for (var i = 0; i < COUNT; i++) {
		c["copy" + i] = document.getElementById("copy" + i).value
	}
	localStorage.copier = JSON.stringify(c);
}

function load() {
	var c = JSON.parse(localStorage.copier || "{}");
	for (var i = 0; i < COUNT; i++) {
		document.getElementById("copy" + i).value = c["copy" + i] || "";
	}
}

function clearAll() {
	if (confirm("Clear all?")) {
		localStorage.copier = "{}";
		load();
	}
}

window.onload = (event) => {
	load();
};
