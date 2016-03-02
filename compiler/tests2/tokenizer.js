var _test = require('tape');

var test = function(title, f) {
	_test("[Tokenizer] " + title, f);
}

var wl = require('../weblisp2.js');

function pairs(arr)
{
    var res = [];
    
    for(var i = 0; i < arr.length; ++i)
        for(var j = i + 1; j < arr.length; ++j)
            res.push([arr[i], arr[j]]);
    
    return res;
}

function tokenTypeStr(t)
{
	var name = t.toString();
	return name.slice(0, name.indexOf("-tok"));
}

function tk(str) {
	return wl.root.tokenize(str).map(function(tok) {
		return tokenTypeStr(tok.type);
	});
}

test("Numbers", function( assert ) {
	assert.deepEqual(tk("10"), ["num", "end"]);
	assert.deepEqual(tk("10."), ["num", "end"]);
	assert.deepEqual(tk("10.23"), ["num", "end"]);
	
	assert.deepEqual(tk("-10"), ["num", "end"]);
	assert.deepEqual(tk("-10."), ["num", "end"]);
	assert.deepEqual(tk("-10.23"), ["num", "end"]);
	
	assert.deepEqual(tk("+10"), ["num", "end"]);
	assert.deepEqual(tk("+10."), ["num", "end"]);
	assert.deepEqual(tk("+10.23"), ["num", "end"]);
	
	assert.deepEqual(tk(".3"), ["num", "end"]);
	assert.deepEqual(tk("+.3"), ["num", "end"]);
	assert.deepEqual(tk("-.3"), ["num", "end"]);
	
	assert.deepEqual(tk("003.000"), ["num", "end"]);
	assert.end();
});

test("Symbols", function( assert ) {
	assert.deepEqual(tk("a"), ["sym", "end"]);
	assert.deepEqual(tk("+"), ["sym", "end"]);
	assert.deepEqual(tk("baz"), ["sym", "end"]);
	assert.deepEqual(tk("-baz"), ["sym", "end"]);
	assert.deepEqual(tk("+baz"), ["sym", "end"]);
	assert.deepEqual(tk("toStrng"), ["sym", "end"]);
	assert.deepEqual(tk(".<>?+-=!@#$%^&*/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
					["sym", "end"]);
	
	//pairs(["true", "false", "null", "undefined", "baz"]).forEach(function(pair) {
		//assert.deepEqual(tk(pair[0] + pair[1]), ["sym", "end"]);
		//assert.deepEqual(tk(pair[0] + "123"), ["sym", "end"]);
	//});
	
	assert.end();
});

test("Strings", function(assert) {
	assert.deepEqual(tk('""'), ["str", "end"]);
	assert.deepEqual(tk('"\\\\"'), ["str", "end"]);
	assert.deepEqual(tk('"\\\\" "xyz"'), ["str", "str", "end"]);
	assert.deepEqual(tk('"abcd"'), ["str", "end"]);
	assert.deepEqual(tk('"abcd\\n\\\\"'), ["str", "end"]);
	assert.deepEqual(tk('"abcd\\""'), ["str", "end"]);
	assert.deepEqual(tk('"abcd\\"efg"'), ["str", "end"]);
	assert.end();
});

test("Other atoms", function( assert ) {
	assert.deepEqual(tk("true"), ["true", "end"]);
	assert.deepEqual(tk("false"), ["false", "end"]);
	assert.deepEqual(tk("null"), ["null", "end"]);
	assert.deepEqual(tk("undefined"), ["undef", "end"]);
	
	assert.end();
});


test("Syntactic", function( assert ) {
	assert.deepEqual(tk("("), ["list-open", "end"]);
	assert.deepEqual(tk(")"), ["list-close", "end"]);
	assert.deepEqual(tk("'"), ["quote", "end"]);
	assert.deepEqual(tk("`"), ["backquote", "end"]);
	assert.deepEqual(tk("~"), ["unquote", "end"]);
	assert.deepEqual(tk("~@"), ["splice", "end"]);
	
	assert.end();
});

test("Compound", function( assert ) {
	assert.deepEqual(tk("`'((0 baz12 3)(~~@+.4)\"abcd\\\"\"true)"),
		["backquote", "quote", "list-open", "list-open", "num", "sym",
		 "num", "list-close", "list-open", "unquote", "splice", "num",
		 "list-close", "str", "true", "list-close", "end"]);
	
	assert.end();
});