
var idb = (function() {
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
	var idb;
	var dbName;
	var storeName;
	
	function connect(db, store, fn) {
		console.log("Connecting to db: " + db + ", store: " + store);
		dbName = db;
		storeName = store;
		var dbopen = indexedDB.open(dbName, 1);
		dbopen.onupgradeneeded = function() {
			dbopen.result.createObjectStore(storeName, {keyPath: "id"});
		};

		dbopen.onsuccess = function() {
			idb = dbopen.result;
			fn && fn();
		}
	};
	
	function keys(callback) {
		var tx = idb.transaction(storeName, "readonly");
		var store = tx.objectStore(storeName);
		var query = store.getAllKeys();
		query.onsuccess = (event) => event.target.result && callback && callback(event.target.result);
	}
	
	function read(key, callback) {
		var tx = idb.transaction(storeName, "readonly");
		var store = tx.objectStore(storeName);
		var query = store.get(key);
		query.onsuccess = (event) => {
			event.target.result && callback && callback(event.target.result);
		}
	};
	
	function write(key, name, value) {
		var tx = idb.transaction(storeName, "readwrite");
		var store = tx.objectStore(storeName);
		store.put({ id: key, name: name, value: value});
	};
	
	function remove(key) {
		var tx = idb.transaction(storeName, "readwrite");
		var store = tx.objectStore(storeName);
		store.delete(key);
	};
	
	function removeAll() {
		var tx = idb.transaction(storeName, "readwrite");
		var store = tx.objectStore(storeName);
		store.clear();
	};
	
	function info() {
		keys((keyList) => {
			for (i in keyList) {
				var key = keyList[i];
				console.log(key);
				read(key, (obj) => {
					valueKeys = Object.keys(obj);
					for (var i in valueKeys) {
						console.log("    " + valueKeys[i].padStart(8, " ") + ": " + obj[valueKeys[i]].substring(0, 100).replaceAll("\n", "").replaceAll("\r", ""));
					}
				});
			}
		});
	}
	
	return {
		connect: connect,
		keys: keys,
		read: read,
		write: write,
		remove: remove,
		removeAll: removeAll,
		info: info
	};
})();
