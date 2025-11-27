var config = {
	
 "Summary": {
	"paths": [ "." ],
	"default": true,
	"format": "array",
	"fields": [
		{
			"header": "key",
			"paths": "key"
		}, {
			"header": "value",
			"format": "fn",
			"fn": function(v) {
				if (v instanceof Array) {
					return JSON.stringify(v[0]).replace("}","").replace("{","").replace(",",", ").substring(0, 100)
				} else if (v instanceof Object) {
					return JSON.stringify(v).replace("}","").replace("{","").replace(",",", ").substring(0, 100)
				} else {
					return v;
				}
			},
			"paths": "value"
		}, {
			"header": "Show",
			"format": "hiddenJson",
			"paths": "value"
		}
	]}
};

var CONFIG = CONFIG ? Object.assign(CONFIG, config) : config;
