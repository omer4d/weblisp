process.title = 'weblisp-web-repl-relay';

var webSocketsServerPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');
var util = require("util");

function write(s) {
	process.stdout.write(util.format.apply(this, arguments));
}

function infoLog(s) {
	write("---[" + s + "]---" + "\n>");
}

var server = http.createServer(function(request, response) {
});

server.listen(webSocketsServerPort, function() {
    infoLog("Listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
    httpServer: server
});

var lastConnection = undefined;

wsServer.on('request', function(request) {
	if(lastConnection)
	{
		lastConnection.close();
		lastConnection = undefined;
	}
	
    infoLog("Connection from " + request.origin);
    var connection = request.accept(null, request.origin); 
    infoLog("Connection accepted.");

    //connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
	
    connection.on('message', function(message) {
		write(message.utf8Data);
		process.stdin.resume();
		write(">");
    });

    connection.on('close', function(connection) {
        infoLog("Provider disconnected!");
    });
	
	lastConnection = connection;
});

// UI

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

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(text) {
	currParenBalance += parenBalance(text);
	currTextAccum += text;
	
	if(currParenBalance <= 0 || currTextAccum.charCodeAt(currTextAccum.length - 1) === 4) {
		if(currTextAccum.charCodeAt(currTextAccum.length - 1) === 4)
			currTextAccum = currTextAccum.slice(0, -1);
			
		if(lastConnection)
		{
			lastConnection.sendUTF(currTextAccum);
			process.stdin.pause();
		}
		else
		{
			infoLog("No provider connected.");
		}
			//write(wl.str(ev["eval-str"](currTextAccum)));
		
		currParenBalance = 0;
		currTextAccum = "";
		lastLine = "";
	}
	else
		lastLine = text;
});