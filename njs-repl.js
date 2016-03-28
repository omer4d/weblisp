var fs = require("fs");
var util = require("util");
var wl = require("./weblisp-node.js").root;

var ev = wl["make-instance"](wl["node-evaluator-proto"]);

function write(s) {
	process.stdout.write(util.format.apply(this, arguments));
}

function parenBalance(str) {
	var counter = 0;
	for (var i = 0, len = str.length; i < len; i++) {
		if(str.charAt(i) == "(") ++counter;
		else if(str.charAt(i) == ")") --counter;
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
		
	if(currParenBalance <= 0) {
		try {
			write(ev["eval-str"](currTextAccum));
		} catch(e) {
			write(e);
		}
		
		currParenBalance = 0;
		currTextAccum = "";
		lastLine = "";
		write("\n>");
	}
	else
		lastLine = text;
});