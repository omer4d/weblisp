var fs = require("fs");

eval(fs.readFileSync("weblisp.js", "utf8"));

//$$root["jeval"] = eval;
//var global = $$root["jeval"]("this");
//global.$$root = $$root;

function defaultLexenv() {
	return {"this": true};
}

var compiler = $$root["make-instance"]($$root["compiler-proto"], $$root);

function evalisp(expr) {
	var tmp = compiler["compile"](defaultLexenv(), expr);
	
	console.log(tmp);
	
	//console.log($$root.second(tmp) + $$root.first(tmp));
	//$$root["jeval"]($$root.second(tmp) + $$root.first(tmp));
	
	return "BLAH!";
}

function replStep(s) {
	var forms = $$root.parse($$root.tokenize(s));
	for(var n = forms; !$$root["null?"](n); n = $$root.cdr(n))
		evalisp($$root.first(n));
}

replStep("(+ 1 2 3)");