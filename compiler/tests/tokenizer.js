var _test = require('tape');

var test = function(title, f) {
	_test("[Tokenizer] " + title, f);
}

var wl = require('../weblisp.js');

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
    return Object.keys(wl.TokenType).filter(function(key) {
    	return wl.TokenType[key] === t;
    })[0];
}

function tk(str) {
	return wl.tokenize(str).map(function(tok) {
		return tokenTypeStr(tok.type);
	});
}

test("Numbers", function( assert ) {
	assert.deepEqual(tk("10"), ["NUM", "END"]);
	assert.deepEqual(tk("10."), ["NUM", "END"]);
	assert.deepEqual(tk("10.23"), ["NUM", "END"]);
	
	assert.deepEqual(tk("-10"), ["NUM", "END"]);
	assert.deepEqual(tk("-10."), ["NUM", "END"]);
	assert.deepEqual(tk("-10.23"), ["NUM", "END"]);
	
	assert.deepEqual(tk("+10"), ["NUM", "END"]);
	assert.deepEqual(tk("+10."), ["NUM", "END"]);
	assert.deepEqual(tk("+10.23"), ["NUM", "END"]);
	
	assert.deepEqual(tk(".3"), ["NUM", "END"]);
	assert.deepEqual(tk("+.3"), ["NUM", "END"]);
	assert.deepEqual(tk("-.3"), ["NUM", "END"]);
	
	assert.deepEqual(tk("003.000"), ["NUM", "END"]);
	assert.end();
});

test("Symbols", function( assert ) {
	assert.deepEqual(tk("a"), ["SYM", "END"]);
	assert.deepEqual(tk("+"), ["SYM", "END"]);
	assert.deepEqual(tk("baz"), ["SYM", "END"]);
	assert.deepEqual(tk("-baz"), ["SYM", "END"]);
	assert.deepEqual(tk("+baz"), ["SYM", "END"]);
	assert.deepEqual(tk("toStrng"), ["SYM", "END"]);
	assert.deepEqual(tk(".<>?+-=!@#$%^&*/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
					["SYM", "END"]);
	
	//pairs(["true", "false", "null", "undefined", "baz"]).forEach(function(pair) {
		//assert.deepEqual(tk(pair[0] + pair[1]), ["SYM", "END"]);
		//assert.deepEqual(tk(pair[0] + "123"), ["SYM", "END"]);
	//});
	
	assert.end();
});

test("Strings", function(assert) {
	assert.deepEqual(tk('""'), ["STR", "END"]);
	assert.deepEqual(tk('"abcd"'), ["STR", "END"]);
	assert.deepEqual(tk('"abcd\\n\\\\"'), ["STR", "END"]);
	assert.deepEqual(tk('"abcd\\""'), ["STR", "END"]);
	assert.deepEqual(tk('"abcd\\"efg"'), ["STR", "END"]);
	assert.end();
});

test("Other atoms", function( assert ) {
	assert.deepEqual(tk("true"), ["TRUE", "END"]);
	assert.deepEqual(tk("false"), ["FALSE", "END"]);
	assert.deepEqual(tk("null"), ["NULL", "END"]);
	assert.deepEqual(tk("undefined"), ["UNDEF", "END"]);
	
	assert.end();
});


test("Syntactic", function( assert ) {
	assert.deepEqual(tk("("), ["LIST_OPEN", "END"]);
	assert.deepEqual(tk(")"), ["LIST_CLOSE", "END"]);
	assert.deepEqual(tk("'"), ["QUOTE", "END"]);
	assert.deepEqual(tk("`"), ["BACKQUOTE", "END"]);
	assert.deepEqual(tk("~"), ["UNQUOTE", "END"]);
	assert.deepEqual(tk("~@"), ["SPLICE", "END"]);
	
	assert.end();
});

test("Compound", function( assert ) {
	assert.deepEqual(tk("`'((0 baz12 3)(~~@+.4)\"abcd\\\"\"true)"),
		["BACKQUOTE", "QUOTE", "LIST_OPEN", "LIST_OPEN", "NUM", "SYM",
		 "NUM", "LIST_CLOSE", "LIST_OPEN", "UNQUOTE", "SPLICE", "NUM",
		 "LIST_CLOSE", "STR", "TRUE", "LIST_CLOSE", "END"]);
	
	assert.end();
});