var fs = require("fs");
var util = require("util");
var wl = require("./weblisp-node.js").root;

var ev = wl["make-instance"](wl["node-evaluator-proto"]);

function write(s) {
	process.stdout.write(util.format.apply(this, arguments));
}

function parenBalance(line) {
	var inString = false;
	var counter = 0;
	
	for(var i = 0, len = line.length; i < len; ++i) {
		if(inString) {
			if(line.charAt(i) === "\"" && line.charAt(i - 1) !== "\\")
				inString = false;
		}
		else {
			switch(line.charAt(i)) {
				case ";": 	return counter;
				case "\"": 	inString = true; break;
				case "(":	++counter; 		break;
				case ")":	--counter;		break;
			}
		}
	}
	return counter;
}

var currParenBalance = 0;
var currTextAccum = "";
var lastLine = "";

write(">");

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(text) {
	currParenBalance += parenBalance(text);
	currTextAccum += text;
	
	if(currParenBalance <= 0 || currTextAccum.charCodeAt(currTextAccum.length - 1) === 4) {
		try {
			if(currTextAccum.charCodeAt(currTextAccum.length - 1) === 4)
				currTextAccum = currTextAccum.slice(0, -1);
			write(wl.str(ev["eval-str"](currTextAccum)));
		} catch(e) {
			write(e.stack);
		}
		
		currParenBalance = 0;
		currTextAccum = "";
		lastLine = "";
		write("\n>");
	}
	else
		lastLine = text;
});