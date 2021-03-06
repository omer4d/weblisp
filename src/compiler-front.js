var VM = require('vm');
var Reflect = require('harmony-reflect');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var wl = require('./weblisp-node.js');

function formatCode1(str) {
    var toks = str.split(/(;|{|})/);
    var out = "";
    var ind = [];

    for(var i = 0; i < Math.floor(toks.length / 2); ++i) {
        if(toks[i * 2 + 1] === "}")
            ind.pop();
        
        out += ind.join("") + toks[i * 2] + toks[i * 2 + 1] + "\n";

        if(toks[i * 2 + 1] === "{")
            ind.push("   ");
    }
    
    return out + toks[toks.length - 1];
}

function formatCode(str) {
    var strPatt = /("(?:(?:\\.)|[^"])*?")/;
    var toks = str.split(strPatt);
    return toks.map(function(tok, idx) {
	return idx % 2 ? tok : formatCode1(tok);
    }).join("");
}

function replaceExt(s, ext) {
    return s.slice(0, s.indexOf(".")) + ext;
}

function readFile(p) {
	if(path.isAbsolute(p))
		return fs.readFileSync(p, "utf8");
	else
	{
		try {
			return fs.readFileSync(p, "utf8");
		}catch(e) {
			return fs.readFileSync(path.resolve(__dirname, p), "utf8");
		}
	}
}

if(argv._.length > 0) {
    var comp = wl.root["make-instance"](wl.root["static-compiler-proto"]);
    var files = argv._; //Array.isArray(argv.) ? argv.in : [argv.in];
	
    //var output = fs.readFileSync(path.resolve(__dirname, "bootstrap.js"), "utf8") + files.map(function(f) {
	//	return formatCode((comp["compile-unit"](readFile(f))).data);
    //}).join("");

	var debugInfo = {};
	var output = "";
	
	files.forEach(function(f) {
		var res = comp["compile-unit"](readFile(f));
		
		for(var i = 0; i < res.mappings.length; ++i) {
			res.mappings[i]["target-start"] += output.length;
			res.mappings[i]["target-end"] += output.length;
		}
		
		output += res.data;
		debugInfo[f] = res.mappings;
	});
	
	if(!argv.n)
		output = fs.readFileSync(path.resolve(__dirname, "bootstrap.js"), "utf8") + output;
	
    var outputName = argv.out ? argv.out : (files.length === 1 ? replaceExt(files[0], ".js") : undefined);

    if(outputName) {
		fs.writeFileSync(outputName, output);
		fs.writeFileSync(replaceExt(outputName, ".debug.js"), "$$DEBUG=" + JSON.stringify(debugInfo, null, 3));
	}
    else
		throw new Error("Output name unspecified!");
}