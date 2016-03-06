var VM = require('vm');
var Reflect = require('harmony-reflect');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var wl = require('./weblisp2.js');

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
    var strPatt = /("(?:(?:\\")|[^"])*")/;
    var toks = str.split(strPatt);
    return toks.map(function(tok, idx) {
	return idx % 2 ? tok : formatCode1(tok);
    }).join("");
}

function replaceExt(s, ext) {
    return s.slice(0, s.indexOf(".")) + ext;
}

if(argv._.length > 0) {
    var comp = wl.root["make-instance"](wl.root["static-compiler-proto"]);
    var files = argv._; //Array.isArray(argv.) ? argv.in : [argv.in];
    var output = fs.readFileSync("bootstrap.js", "utf8") + files.map(function(f) {
	return formatCode(comp["compile-unit"](fs.readFileSync(f, "utf8")));
    }).join("");

    var outputName = argv.out ? argv.out : (files.length === 1 ? replaceExt(files[0], ".js") : undefined);

    if(outputName)
	fs.writeFileSync(outputName, output);
    else
	throw new Error("Output name unspecified!");
}