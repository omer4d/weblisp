$$root["jeval"] = eval;

function defaultLexenv() {
	return {"this": true};
}

function findClosest(mappings, col) {
	var closestMapping = null;
	var closest = -1;
	
	mappings.forEach(function(m) {
		if(col > m["target-start"] && col < m["target-end"] && m["target-start"] > closest) {
			closestMapping = m;
			closest = m["target-start"];
		}
	});
	
	return closestMapping;
}

var compiler = $$root["make-instance"]($$root["compiler-proto"], $$root);
var evalCounter = 0;
var debugTable = {};

function evalisp(src, expr) {
	var res = compiler["compile"](defaultLexenv(), expr);
	res = $$root["concat-tc-str"]($$root.second(res), $$root.first(res));
	debugTable[evalCounter] = {src: src, mappings: res.mappings};
	return $$root["jeval"]("//# sourceURL=" + (evalCounter++) + "\n" + res.data);
}

function replStep(s) {
	var forms = $$root.parse($$root.tokenize(s));
	var output = "";
	
	for(var n = forms; !$$root["null?"](n); n = $$root.cdr(n))
		output += $$root.str(evalisp(s, $$root.car(n)), "\n");
	return output;
}

$(function () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
		throw new Error("WebSocket not supported!");
        return;
    }

    var connection = new WebSocket('ws://127.0.0.1:1337');

	window.onerror = function(msg, url, line, col, err) {
		var stackFrames = ErrorStackParser.parse(err);
		var output = msg + "\n";
	
		stackFrames.forEach(function(f) {
			if(f.fileName in debugTable) {
				var src = debugTable[f.fileName].src;
				var mapping = findClosest(debugTable[f.fileName].mappings, f.columnNumber);
				
				if(mapping !== null) {
					output += (src + "\n");
					output += (" ".repeat(mapping["source-start"]) + "^\n");
				}
			}
		});
		
		console.log(output);
		connection.send(output);
	};
	
    connection.onopen = function () {
		console.log("Connected!");
    };

    connection.onerror = function (error) {
		throw new Error("WebSocket connection error: " + error);
    };

    connection.onmessage = function (message) {
		console.log(">>" + message.data);
		var res = replStep(message.data);		
		console.log(res);
		connection.send(res);
    };
});