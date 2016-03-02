var _test = require('tape');

var test = function(title, f) {
	_test("[Parser] " + title, f);
}

var wl = require('../weblisp2.js');

var cons = wl.root.cons;
var list = wl.root.list;
var symbol = wl.root.symbol;

function pt(str) {
	return wl.root.car(wl.root.parse(wl.root.tokenize(str)));
}

test( "Atoms", function( assert ) {
	assert.deepEqual(pt("10"), 10);
	assert.deepEqual(pt("baz"), symbol("baz"));
	assert.deepEqual(pt("true"), true);
	assert.deepEqual(pt("false"), false);
	assert.deepEqual(pt("null"), []);
	assert.deepEqual(pt("undefined"), undefined);
	assert.deepEqual(pt('"zaza"'), "zaza");
	assert.deepEqual(pt('"za\\"za"'), 'za\"za');
	assert.end();
});

test( "Lists", function( assert ) {
	assert.deepEqual(list(1, 2, 3), cons(1, cons(2, cons(3, []))));
	assert.deepEqual(pt("()"), []);
	assert.deepEqual(pt("(())"), list([]));
	assert.deepEqual(pt("(1 2 3)"), list(1, 2, 3));
	assert.deepEqual(pt("(1 (2 3 4) 5 6)"), list(1, list(2, 3, 4), 5, 6));
	assert.deepEqual(pt("(foo bar 5)"), list(symbol("foo"), symbol("bar"), 5));
	assert.end();
});

test( "Quote", function( assert ) {
	assert.deepEqual(pt("'1"), pt("(quote 1)"));
	assert.deepEqual(pt("'foo"), pt("(quote foo)"));
	assert.deepEqual(pt("''1"), pt("(quote (quote 1))"));
	assert.deepEqual(pt("'(1 2 (3 4) 5)"), pt("(quote (1 2 (3 4) 5))"));
	assert.deepEqual(pt("'\"bazbaz\""), pt('(quote "bazbaz")'));
	assert.end();
});

test( "Backquote", function( assert ) {
	assert.deepEqual(pt("`1"), pt("(quote 1)"));
	assert.deepEqual(pt("`foo"), pt("(quote foo)"));
	assert.deepEqual(pt('`"foo"'), pt('(quote "foo")'));
	assert.deepEqual(pt("``foo"), pt("(quote (quote foo))"));
	assert.deepEqual(pt("`()"), pt("(concat)"));
	assert.deepEqual(pt("`(1 baz)"), pt("(concat (list (quote 1)) (list (quote baz)))"));
	assert.deepEqual(pt("`('foo)"), pt("(concat (list (quote (quote foo))))"));
	assert.deepEqual(pt("`(foo (1 2))"), pt(`(concat (list (quote foo))
														(list (concat (list (quote 1)) (list (quote 2)))))`));
	assert.end();
});

test( "Unquote", function( assert ) {
	assert.deepEqual(pt("`(foo ~(+ 1 2))"), pt("(concat (list (quote foo)) (list (+ 1 2)))"));
	assert.deepEqual(pt("`(1 2 (3 ~(+ 2 2)))"), pt(`(concat (list (quote 1)) (list (quote 2))
															(list (concat (list (quote 3)) (list (+ 2 2)))))`));
	assert.deepEqual(pt("`(foo ~(cons 1 `(2 ~(+ 1 3))))"), pt(`(concat (list (quote foo))
																		(list (cons 1 (concat (list (quote 2))
																								(list (+ 1 3))))))`));
	assert.end();
});

test( "Splice", function( assert ) {
	assert.deepEqual(pt("`(1 ~@(cons 2 (cons 3 null)))"), pt("(concat (list (quote 1)) (cons 2 (cons 3 null)))"));
	assert.deepEqual(pt("`(1 ~@'(2 3))"), pt("(concat (list (quote 1)) (quote (2 3)))"));
	assert.end();
});
