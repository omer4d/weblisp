$$root["jeval"] = eval;

function defaultLexenv() {
	return {"this": true};
}

var compiler = $$root["make-instance"]($$root["compiler-proto"], $$root);

function evalisp(expr) {
	var tmp = compiler["compile"](defaultLexenv(), expr);
	return $$root["jeval"]($$root.second(tmp).data + $$root.first(tmp).data);
}

function replStep(s) {
	var forms = $$root.parse($$root.tokenize(s));
	var output = "";
	
	for(var n = forms; !$$root["null?"](n); n = $$root.cdr(n))
		output += $$root.str(evalisp($$root.car(n)), "\n");
	return output;
}

$(function () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
		throw new Error("WebSocket not supported!");
        return;
    }

    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
		console.log("Connected!");
    };

    connection.onerror = function (error) {
		throw new Error("WebSocket connection error: " + error);
    };

    connection.onmessage = function (message) {
		console.log(">>" + message.data);
		try {
			var res = replStep(message.data);
		}catch(e) {
			res = e.stack + "\n";
		}
		
		console.log(res);
		connection.send(res);
    };
});