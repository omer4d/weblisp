function tk(str) {
	return tokenize(str).map(function(tok) {
		return tokenTypeStr(tok.type);
	});
}

QUnit.module( "Tokenizer" );

QUnit.test("Numbers", function( assert ) {
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
});

QUnit.test("Symbols", function( assert ) {
	assert.deepEqual(tk("a"), ["SYM", "END"]);
	assert.deepEqual(tk("+"), ["SYM", "END"]);
	assert.deepEqual(tk("baz"), ["SYM", "END"]);
	assert.deepEqual(tk("-baz"), ["SYM", "END"]);
	assert.deepEqual(tk("+baz"), ["SYM", "END"]);
	assert.deepEqual(tk("<>?+-=!@#$%^&*/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
					["SYM", "END"]);
	
	pairs(["true", "false", "null", "undefined", "baz"]).forEach(function(pair) {
		assert.deepEqual(tk(pair[0] + pair[1]), ["SYM", "END"]);
		assert.deepEqual(tk(pair[0] + "123"), ["SYM", "END"]);
	});
});

QUnit.test("Other atoms", function( assert ) {
	assert.deepEqual(tk("true"), ["TRUE", "END"]);
	assert.deepEqual(tk("false"), ["FALSE", "END"]);
	assert.deepEqual(tk("null"), ["NULL", "END"]);
	assert.deepEqual(tk("undefined"), ["UNDEF", "END"]);
});


QUnit.test("Syntactic", function( assert ) {
	assert.deepEqual(tk("("), ["LIST_OPEN", "END"]);
	assert.deepEqual(tk(")"), ["LIST_CLOSE", "END"]);
	assert.deepEqual(tk("["), ["ARR_OPEN", "END"]);
	assert.deepEqual(tk("]"), ["ARR_CLOSE", "END"]);
	assert.deepEqual(tk("{"), ["OBJ_OPEN", "END"]);
	assert.deepEqual(tk("}"), ["OBJ_CLOSE", "END"]);
	assert.deepEqual(tk("'"), ["QUOTE", "END"]);
	assert.deepEqual(tk("`"), ["BACKQUOTE", "END"]);
	assert.deepEqual(tk("~"), ["UNQUOTE", "END"]);
	assert.deepEqual(tk("~@"), ["SPLICE", "END"]);
});

QUnit.test("Compound", function( assert ) {
	assert.deepEqual(tk("`'((0 baz12 3)(~~@+.4)true)"),
		["BACKQUOTE", "QUOTE", "LIST_OPEN", "LIST_OPEN", "NUM", "SYM",
		 "NUM", "LIST_CLOSE", "LIST_OPEN", "UNQUOTE", "SPLICE", "NUM",
		 "LIST_CLOSE", "TRUE", "LIST_CLOSE", "END"]);
});

QUnit.test("Invalid", function( assert ) {
	["true", "false", "null", "undefined", "baz"].forEach(function(x) {
	 	assert.throws(function() {
	 		tk("123" + x);
	 	}, /Unrecognized token/);
	});
});
