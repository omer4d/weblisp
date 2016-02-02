var ev = evalispstr;

QUnit.module( "Compiler" );

QUnit.test( "Atoms (sans symbol)", function( assert ) {
	assert.deepEqual(ev("1"), 1);
	assert.deepEqual(ev("'baz"), new Symbol("baz"));
	assert.deepEqual(ev("null"), null);
	//assert.deepEqual(ev("true"), true);
	//assert.deepEqual(ev("false"), false);
	//assert.deepEqual(ev("undefined"), undefined);
});

QUnit.test( "Quote", function( assert ) {
	assert.deepEqual(ev("'1"), 1);
	assert.deepEqual(ev("'baz"), new Symbol("baz"));

	//assert.deepEqual(ev("'null"), null);
	//assert.deepEqual(ev("'true"), true);
	//assert.deepEqual(ev("'false"), false);
	//assert.deepEqual(ev("'undefined"), undefined);
	
	assert.deepEqual(ev("'()"), null);
	assert.deepEqual(ev("'(1 2 3)"), list(1, 2, 3));
	assert.deepEqual(ev("'(1 baz 3)"), list(1, new Symbol("baz"), 3));
	assert.deepEqual(ev("'(1 (2 3) 4)"), list(1, list(2, 3), 4));
});

QUnit.test( "Simple calls", function( assert ) {
	assert.deepEqual(ev("(cons 1 2)"), cons(1, 2));
	assert.deepEqual(ev("(cons 1 (cons 2 null))"), cons(1, cons(2, null)));
});

QUnit.test( "Math", function( assert ) {
	assert.deepEqual(ev("(+)"), 0);
	assert.deepEqual(ev("(+ 1)"), 1);
	assert.deepEqual(ev("(+ 1 2)"), 1+2);
	assert.deepEqual(ev("(+ 1 2 3)"), 1+2+3);
	
	assert.deepEqual(ev("(-)"), 0);
	assert.deepEqual(ev("(- 1)"), -1);
	assert.deepEqual(ev("(- 1 3)"), 1-3);
	assert.deepEqual(ev("(- 1 3 4)"), 1-3-4);
	
	assert.deepEqual(ev("(*)"), 1);
	assert.deepEqual(ev("(* 2)"), 2);
	assert.deepEqual(ev("(* 2 3)"), 2*3);
	assert.deepEqual(ev("(* 2 3 4)"), 2*3*4);
	
	assert.deepEqual(ev("(/)"), 1);
	assert.deepEqual(ev("(/ 2)"), 1/2);
	assert.deepEqual(ev("(/ 2 3)"), 2/3);
	assert.deepEqual(ev("(/ 2 3 4)"), 2/3/4);
	
	assert.deepEqual(ev("(/ (- (* 2 (+ 3 1)) 4) 10)"), (2 * (3 + 1) - 4) / 10);
});

QUnit.test( "Comparison", function( assert ) {
	assert.deepEqual(ev("(= 0 0)"), true);
	assert.deepEqual(ev("(= 0 1)"), false);
	assert.deepEqual(ev("(= 2 (+ 1 1) 2 (+ 1 1))"), true);
	assert.deepEqual(ev("(= '(1) '(1))"), false);
	
	assert.deepEqual(ev("(not= 0 0)"), false);
	assert.deepEqual(ev("(not= 0 1)"), true);
	assert.deepEqual(ev("(not= '(1) '(1))"), true);
	
	assert.deepEqual(ev("(> 1 0)"), true);
	assert.deepEqual(ev("(> 0 1)"), false);
	
	assert.deepEqual(ev("(< 1 0)"), false);
	assert.deepEqual(ev("(< 0 1)"), true);
	
	assert.deepEqual(ev("(>= 1 0)"), true);
	assert.deepEqual(ev("(>= 0 0)"), true);
	assert.deepEqual(ev("(>= 0 1)"), false);
	
	assert.deepEqual(ev("(<= 1 0)"), false);
	assert.deepEqual(ev("(<= 0 0)"), true);
	assert.deepEqual(ev("(<= 0 1)"), true);
});

var globalCounter = 0;

function for__MINUSside__MINUSeffect(x) {
	globalCounter += x;
	return globalCounter;
}

QUnit.test( "Progn", function( assert ) {
	assert.deepEqual(ev("(progn 5)"), 5);
	assert.deepEqual(ev("(progn 1 2 3 4 5)"), 5);
	assert.deepEqual(ev("(progn (+ 1 2) (+ 3 4) (+ (* 2 3) 6))"), 2*3+6);
	
	globalCounter = 0;
	var tmp = ev("(progn (for-side-effect 1) (for-side-effect 2) (+ 5 5))");
	assert.ok(tmp === 10 && globalCounter === 3);
});

QUnit.test( "If", function( assert ) {
	assert.deepEqual(ev("(if true true false)"), true);
	assert.deepEqual(ev("(if false true false)"), false);
	assert.deepEqual(ev("(+ (if (> 1 0) 5 0) 5)"), 10);
	assert.deepEqual(ev("(+ (if (< 1 0) 5 0) 5)"), 5);
		
	globalCounter = 0;
	assert.deepEqual(ev(`(if (> 1 0) 
							 (progn (for-side-effect 5) -6)
							 (progn (for-side-effect 100) 6))`), -6);
	assert.deepEqual(globalCounter, 5);
	
	globalCounter = 0;
	assert.deepEqual(ev(`(if (< 1 0) 
							 (progn (for-side-effect 5) -6)
							 (progn (for-side-effect 100) 6))`), 6);
	assert.deepEqual(globalCounter, 100);
	
	assert.deepEqual(ev("(+ (if (if (> 1 0) false true) 0 (if (> 1 0) 5 0)) 5)"), 10);
});

QUnit.test( "Lambda", function( assert ) {
	assert.deepEqual(ev("(apply (lambda () 5) '())"), 5);
	assert.deepEqual(ev("(apply (lambda (x) x) '(5))"), 5);
	assert.deepEqual(ev("(apply (lambda (x y) (+ x y)) '(5 4))"), 9);
	assert.deepEqual(ev("(apply (lambda (x y z) (+ x y z)) '(1 2 3))"), 6);
	assert.deepEqual(ev("(apply (lambda (&etc) (apply + etc)) '(1 2 3))"), 6);
	assert.deepEqual(ev("(apply (lambda (x &etc) (+ x (apply + etc))) '(1 2 3 4))"), 10);
	
	globalCounter = 0;
	assert.deepEqual(ev(`(apply (lambda (x) 
									(for-side-effect 2)
									(for-side-effect 3)
									x)
								'(111))`), 111);
	assert.deepEqual(globalCounter, 5);
});

QUnit.test( "Function expression call", function( assert ) {
	assert.deepEqual(ev("((lambda (x y) (+ x y)) 1 2)"), 3);
	assert.deepEqual(ev("((if (> 1 0) + *) 1 2)"), 3);
});

QUnit.test( "Defun", function( assert ) {
	
	assert.ok(ev("(defun testf1 () 5)"));
	assert.deepEqual(ev("(testf1)"), 5);
	
	assert.ok(ev("(defun testf2 (x) x)"));
	assert.deepEqual(ev("(testf2 5)"), 5);
	
	assert.ok(ev("(defun testf3 (x y) (+ x y))"));
	assert.deepEqual(ev("(testf3 5 4)"), 9);
	
	assert.ok(ev("(defun testf4 (x y z) (+ x y z))"));
	assert.deepEqual(ev("(testf4 1 2 3)"), 6);
	
	assert.ok(ev("(defun testf5 (&etc) (apply + etc))"));
	assert.deepEqual(ev("(testf5 1 2 3)"), 6);
	
	assert.ok(ev("(defun testf6 (x &etc) (+ x(apply + etc)))"));
	assert.deepEqual(ev("(testf6 1 2 3 4)"), 10);
	
	globalCounter = 0;
	assert.ok(ev(`(defun testf7 (x)
					(for-side-effect 2)
					(for-side-effect 3)
					x)`));
	assert.deepEqual(ev("(testf7 10)"), 10);
	assert.deepEqual(globalCounter, 5);
	
	assert.ok(ev(`(defun testf8 (n)
					(if (not= n 0)
						(* n (testf8 (- n 1)))
						1))`));
	
	assert.deepEqual(ev("(testf8 5)"), 1*2*3*4*5);
});

QUnit.test( "Defmacro", function( assert ) {
	assert.ok(ev("(defmacro testmac1 () 5)"));
	assert.deepEqual(ev("(+ (testmac1) 5)"), 10);
	
	assert.ok(ev("(defmacro testmac2 () 'baz)"));
	assert.deepEqual(ev("((lambda (baz) (+ (testmac2) 5)) 5)"), 10);
	
	assert.ok(ev("(defmacro testmac3 (x) (cons '+ x))"));
	assert.deepEqual(ev("(testmac3 (1 2 3 4))"), 10);
	
	assert.ok(ev(`(defmacro testmac4 (x) 
					 (if (atom? x)
						  x` +
						  "`(~(second x) (testmac4 ~(first x)) (testmac4 ~(third x)))))"));
	
	assert.deepEqual(ev("(testmac4 1)"), 1);
	assert.deepEqual(ev("(testmac4 (1 + 1))"), 2);
	assert.deepEqual(ev("(testmac4 ((2 * 3) + (4 * (5 + 6))))"), ((2 * 3) + (4 * (5 + 6))));
});
