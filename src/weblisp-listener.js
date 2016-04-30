(function(WLListener) {
	var compiler;
	var evalCounter;
	var debugTable;
	
	function loadScripts(scripts, cb) {
		var counter = 0;
		var onload = function() {
			++counter;
			if(counter === scripts.length && cb) {
				cb();
			}
		};
		var first = document.getElementsByTagName("script")[0];
		
		for(var i = 0; i < scripts.length; ++i) {
			var script = document.createElement("script");
			script.src = scripts[i];
			script.onload = onload;
			first.parentNode.insertBefore(script, first);
		}
	}

	function defaultLexenv() {
		return {"this": true};
	}

	function translateStackFrame(f) {
		var col = f.columnNumber;
		var closestMapping = null;
		var closestMappingFileName = null;
		var closest = -1;
				
		for (var fileName in $$DEBUG) {
			if ($$DEBUG.hasOwnProperty(fileName)) {
				$$DEBUG[fileName].forEach(function(m) {
					if(col > m["target-start"] && col < m["target-end"] && m["target-start"] > closest) {
						closestMapping = m;
						closestMappingFileName = fileName;
						closest = m["target-start"];
					}
				});
			}
		}
		
		if(closestMapping !== null) {
			f.lineNumber = closestMapping["source-line"];
			f.columnNumber = closestMapping["source-col"];
			f.fileName = closestMappingFileName;
		}
				
		return f;
	}

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
	
	WLListener.init = function(cb) {
		loadScripts(["./error-stack-parser.min.js", "./weblisp.js"], function() {
			$$root["jeval"] = eval;
			compiler = $$root["make-instance"]($$root["compiler-proto"], $$root);
			evalCounter = 0;
			debugTable = {};
			
			window.WebSocket = window.WebSocket || window.MozWebSocket;

			if (!window.WebSocket) {
				throw new Error("WebSocket not supported!");
			}

			var connection = new WebSocket('ws://127.0.0.1:1337');

			window.onerror = function(msg, url, line, col, err) {
				var stackFrames = ErrorStackParser.parse(err);
				var output = '[[error ' + msg + "]]\n";

				stackFrames.forEach(function(f) {
					f = translateStackFrame(f);
					//var tmp = findClosest(f.columnNumber);
					output += '[[src ' + f.fileName + ':' + f.lineNumber + ':' + f.columnNumber + ']]\n';
				});
				
				console.log(output);
				connection.send(output);
			};

			connection.onopen = function () {
				if(cb) cb();
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
	};
})(window.WLListener = window.WLListener || {});