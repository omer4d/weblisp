function pt(str) {
	return parse(tokenize(str))[0];
}

QUnit.module( "Parser" );

QUnit.test( "Atoms", function( assert ) {
	assert.deepEqual(pt("10"), 10);
	assert.deepEqual(pt("baz"), new Symbol("baz"));
	assert.deepEqual(pt("true"), true);
	assert.deepEqual(pt("false"), false);
	assert.deepEqual(pt("null"), null);
	assert.deepEqual(pt("undefined"), undefined);
	
	//assert.deepEqual(pt("null"), null);
	//assert.deepEqual(pt("true"), true);
	//assert.deepEqual(pt("false"), false);
});

QUnit.test( "Lists", function( assert ) {
	var cell = cons(1, 2);
	
	assert.ok(cell.car === 1 && cell.cdr === 2);
	assert.deepEqual(list(1, 2, 3), cons(1, cons(2, cons(3, null))));
	assert.deepEqual(pt("()"), null);
	assert.deepEqual(pt("(())"), list(null));
	assert.deepEqual(pt("(1 2 3)"), list(1, 2, 3));
	assert.deepEqual(pt("(1 (2 3 4) 5 6)"), list(1, list(2, 3, 4), 5, 6));
	assert.deepEqual(pt("(foo bar 5)"), list(new Symbol("foo"), new Symbol("bar"), 5));
});

QUnit.test( "Quote", function( assert ) {
	assert.deepEqual(pt("'1"), pt("(quote 1)"));
	assert.deepEqual(pt("'foo"), pt("(quote foo)"));
	assert.deepEqual(pt("''1"), pt("(quote (quote 1))"));
	assert.deepEqual(pt("'(1 2 (3 4) 5)"), pt("(quote (1 2 (3 4) 5))"));
});

QUnit.test( "Backquote", function( assert ) {
	assert.deepEqual(pt("`1"), pt("(quote 1)"));
	assert.deepEqual(pt("`foo"), pt("(quote foo)"));
	assert.deepEqual(pt("``foo"), pt("(quote (quote foo))"));
	assert.deepEqual(pt("`()"), pt("(concat)"));
	assert.deepEqual(pt("`(1 baz)"), pt("(concat (list (quote 1)) (list (quote baz)))"));
	assert.deepEqual(pt("`('foo)"), pt("(concat (list (quote (quote foo))))"));
	assert.deepEqual(pt("`(foo (1 2))"), pt(`(concat (list (quote foo))
														(list (concat (list (quote 1)) (list (quote 2)))))`));
});

QUnit.test( "Unquote", function( assert ) {
	assert.deepEqual(pt("`(foo ~(+ 1 2))"), pt("(concat (list (quote foo)) (list (+ 1 2)))"));
	assert.deepEqual(pt("`(1 2 (3 ~(+ 2 2)))"), pt(`(concat (list (quote 1)) (list (quote 2))
															(list (concat (list (quote 3)) (list (+ 2 2)))))`));
	assert.deepEqual(pt("`(foo ~(cons 1 `(2 ~(+ 1 3))))"), pt(`(concat (list (quote foo))
																		(list (cons 1 (concat (list (quote 2))
																								(list (+ 1 3))))))`));
});

QUnit.test( "Splice", function( assert ) {
	assert.deepEqual(pt("`(1 ~@(cons 2 (cons 3 null)))"), pt("(concat (list (quote 1)) (cons 2 (cons 3 null)))"));
	assert.deepEqual(pt("`(1 ~@'(2 3))"), pt("(concat (list (quote 1)) (quote (2 3)))"));
});