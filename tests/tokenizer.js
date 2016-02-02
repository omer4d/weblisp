function tk(str) {
	return tokenize(str).map(function(tok) {
		return tok.type;
	});
}

QUnit.module( "Tokenizer" );

QUnit.test("Numbers", function( assert ) {
	assert.deepEqual(tk("10"), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("10."), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("10.23"), [TokenType.NUM, TokenType.END]);
	
	assert.deepEqual(tk("-10"), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("-10."), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("-10.23"), [TokenType.NUM, TokenType.END]);
	
	assert.deepEqual(tk("+10"), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("+10."), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("+10.23"), [TokenType.NUM, TokenType.END]);
	
	assert.deepEqual(tk(".3"), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("+.3"), [TokenType.NUM, TokenType.END]);
	assert.deepEqual(tk("-.3"), [TokenType.NUM, TokenType.END]);
	
	assert.deepEqual(tk("003.000"), [TokenType.NUM, TokenType.END]);
});

QUnit.test("Symbols", function( assert ) {
	assert.deepEqual(tk("a"),
					[TokenType.SYM, TokenType.END]);
	assert.deepEqual(tk("+"),
					[TokenType.SYM, TokenType.END]);
	assert.deepEqual(tk("baz"),
					[TokenType.SYM, TokenType.END]);
	assert.deepEqual(tk("-baz"),
					[TokenType.SYM, TokenType.END]);
	assert.deepEqual(tk("+baz"),
					[TokenType.SYM, TokenType.END]);
	assert.deepEqual(tk("<>?+-=!@#$%^&*/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
					[TokenType.SYM, TokenType.END]);
	assert.deepEqual(tk("0baz"),
					[TokenType.NUM, TokenType.SYM, TokenType.END]);

});

QUnit.test("Other atoms", function( assert ) {
	assert.deepEqual(tk("true"), [TokenType.TRUE, TokenType.END]);
	assert.deepEqual(tk("123true"), [TokenType.NUM, TokenType.TRUE, TokenType.END]);
	assert.deepEqual(tk("true123"), [TokenType.SYM, TokenType.END]);
	
	assert.deepEqual(tk("false"), [TokenType.FALSE, TokenType.END]);
	assert.deepEqual(tk("123false"), [TokenType.NUM, TokenType.FALSE, TokenType.END]);
	assert.deepEqual(tk("false123"), [TokenType.SYM, TokenType.END]);
	
	assert.deepEqual(tk("null"), [TokenType.NULL, TokenType.END]);
	assert.deepEqual(tk("123null"), [TokenType.NUM, TokenType.NULL, TokenType.END]);
	assert.deepEqual(tk("null123"), [TokenType.SYM, TokenType.END]);
	
	assert.deepEqual(tk("undefined"), [TokenType.UNDEF, TokenType.END]);
	assert.deepEqual(tk("123undefined"), [TokenType.NUM, TokenType.UNDEF, TokenType.END]);
	assert.deepEqual(tk("undefined123"), [TokenType.SYM, TokenType.END]);
});


QUnit.test("Syntactic", function( assert ) {
	assert.deepEqual(tk("("), [TokenType.OBR, TokenType.END]);
	assert.deepEqual(tk(")"), [TokenType.CBR, TokenType.END]);
	assert.deepEqual(tk("'"), [TokenType.QUOTE, TokenType.END]);
	assert.deepEqual(tk("`"), [TokenType.BACKQUOTE, TokenType.END]);
	assert.deepEqual(tk("~"), [TokenType.UNQUOTE, TokenType.END]);
	assert.deepEqual(tk("~@"), [TokenType.SPLICE, TokenType.END]);
});

QUnit.test("Compound", function( assert ) {
	assert.deepEqual(tk("`'((0baz12 3)(~~@+.4))"),
		[TokenType.BACKQUOTE, TokenType.QUOTE, TokenType.OBR, TokenType.OBR, TokenType.NUM, TokenType.SYM,
		 TokenType.NUM, TokenType.CBR, TokenType.OBR, TokenType.UNQUOTE, TokenType.SPLICE, TokenType.NUM,
		 TokenType.CBR, TokenType.CBR, TokenType.END]);
});
