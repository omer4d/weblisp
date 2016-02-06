var test = require('tape');
var wl = require('../weblisp.js');

var cons = wl.cons;
var list = wl.list;
var Symbol = wl.Symbol;

var ev = wl.evalispstr;

test( "Atoms (sans symbol)", function( assert ) {
	assert.deepEqual(ev("1"), 1);
	assert.deepEqual(ev("'baz"), new Symbol("baz"));
	assert.deepEqual(ev("null"), []);
	assert.deepEqual(ev("true"), true);
	assert.deepEqual(ev("false"), false);
	assert.deepEqual(ev("undefined"), undefined);
	
	assert.end();
});

test( "Quote", function( assert ) {
	assert.deepEqual(ev("'1"), 1);
	assert.deepEqual(ev("'baz"), new Symbol("baz"));

	assert.deepEqual(ev("'null"), []);
	assert.deepEqual(ev("'true"), true);
	assert.deepEqual(ev("'false"), false);
	assert.deepEqual(ev("'undefined"), undefined);
	
	assert.deepEqual(ev("'()"), []);
	assert.deepEqual(ev("'(1 2 3)"), list(1, 2, 3));
	assert.deepEqual(ev("'(1 baz 3)"), list(1, new Symbol("baz"), 3));
	assert.deepEqual(ev("'(1 (2 3) 4)"), list(1, list(2, 3), 4));
		
	assert.end();
});


test( "Simple calls", function( assert ) {
	assert.deepEqual(ev("(cons 1 null)"), cons(1, []));
	assert.deepEqual(ev("(cons 1 (cons 2 null))"), cons(1, cons(2, [])));	
	assert.end();
});

test( "Math", function( assert ) {
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
		
	assert.end();
});

test( "Comparison", function( assert ) {
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
		
	assert.end();
});



wl.sandbox.globalCounter = 0;
wl.sandbox.for__MINUSside__MINUSeffect = function(x) {
	wl.sandbox.globalCounter += x;
	return wl.sandbox.globalCounter;
};

/*
test( "Progn", function( assert ) {
	assert.deepEqual(ev("(progn 5)"), 5);
	assert.deepEqual(ev("(progn 1 2 3 4 5)"), 5);
	assert.deepEqual(ev("(progn (+ 1 2) (+ 3 4) (+ (* 2 3) 6))"), 2*3+6);
	
	globalCounter = 0;
	var tmp = ev("(progn (for-side-effect 1) (for-side-effect 2) (+ 5 5))");
	assert.ok(tmp === 10 && globalCounter === 3);
		
	assert.end();
});*/

test( "If", function( assert ) {
	assert.deepEqual(ev("(if true true false)"), true);
	assert.deepEqual(ev("(if false true false)"), false);
	assert.deepEqual(ev("(+ (if (> 1 0) 5 0) 5)"), 10);
	assert.deepEqual(ev("(+ (if (< 1 0) 5 0) 5)"), 5);
		
	wl.sandbox.globalCounter = 0;
	assert.deepEqual(ev(`(if (> 1 0) 
							 ((lambda () (for-side-effect 5) -6))
							 ((lambda () (for-side-effect 100) 6)))`), -6);
	assert.deepEqual(wl.sandbox.globalCounter, 5);
	
	wl.sandbox.globalCounter = 0;
	assert.deepEqual(ev(`(if (< 1 0) 
							 ((lambda () (for-side-effect 5) -6))
							 ((lambda () (for-side-effect 100) 6)))`), 6);
	assert.deepEqual(wl.sandbox.globalCounter, 100);
	
	assert.deepEqual(ev("(+ (if (if (> 1 0) false true) 0 (if (> 1 0) 5 0)) 5)"), 10);
		
	assert.end();
});

test( "Lambda", function( assert ) {
	assert.deepEqual(ev("(apply (lambda () 5) '())"), 5);
	assert.deepEqual(ev("(apply (lambda (x) x) '(5))"), 5);
	assert.deepEqual(ev("(apply (lambda (x y) (+ x y)) '(5 4))"), 9);
	assert.deepEqual(ev("(apply (lambda (x y z) (+ x y z)) '(1 2 3))"), 6);
	assert.deepEqual(ev("(apply (lambda (&etc) (apply + etc)) '(1 2 3))"), 6);
	assert.deepEqual(ev("(apply (lambda (x &etc) (+ x (apply + etc))) '(1 2 3 4))"), 10);
	
	wl.sandbox.globalCounter = 0;
	assert.deepEqual(ev(`(apply (lambda (x) 
									(for-side-effect 2)
									(for-side-effect 3)
									x)
								'(111))`), 111);
	assert.deepEqual(wl.sandbox.globalCounter, 5);
		
	assert.end();
});

test( "Function expression call", function( assert ) {
	assert.deepEqual(ev("((lambda (x y) (+ x y)) 1 2)"), 3);
	assert.deepEqual(ev("((if (> 1 0) + *) 1 2)"), 3);
		
	assert.end();
});


wl.sandbox.globalTestV = 0;

test( "Setv", function( assert ) {
	assert.deepEqual(ev("(setv! globalTestV 777)"), 777);
	assert.deepEqual(wl.sandbox.globalTestV, 777);
	
	assert.deepEqual(ev("(setv! globalTestV (+ 7 7))"), 14);
	assert.deepEqual(wl.sandbox.globalTestV, 14);
	
	assert.deepEqual(ev("(setv! globalTestV (if (> 0 1) 6 (+ 6 6)))"), 12);
	assert.deepEqual(wl.sandbox.globalTestV, 12);
	
	assert.deepEqual(ev("(setv! globalTestV (+ 7 7))"), 14);
	assert.deepEqual(wl.sandbox.globalTestV, 14);
	
	assert.deepEqual(ev("((lambda (x) (setv! x (+ 7 8)) x) 0)"), 15);
	
	assert.deepEqual(ev("((lambda (x) (if (> (setv! x 6) 0) x 0)) 0)"), 6);
	
	assert.deepEqual(ev("((lambda (x y z) (setv! z (setv! y (setv! x 3))) (+ x y z)) 0 0 0)"), 9);
		
	assert.end();
});


test( "Defun", function( assert ) {
	/*
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
	assert.deepEqual(globalCounter, 5);*/
	
	assert.ok(ev(`(setv! testf8 (lambda (n)
								  (if (not= n 0)
									  (* n (testf8 (- n 1)))
									  1)))`));
	
	assert.deepEqual(ev("(testf8 5)"), 1*2*3*4*5);
		
	assert.end();
});


test( "Defmacro", function( assert ) {
	assert.ok(ev("(setv! testmac1 (lambda () 5))"));
	assert.ok(ev("(setmac! testmac1)"));
	assert.deepEqual(ev("(+ (testmac1) 5)"), 10);
	
	assert.ok(ev("(setv! testmac2 (lambda () 'baz))"));
	assert.ok(ev("(setmac! testmac2)"));
	assert.deepEqual(ev("((lambda (baz) (+ (testmac2) 5)) 5)"), 10);
	
	assert.ok(ev("(setv! testmac3 (lambda (x) (cons '+ x)))"));
	assert.ok(ev("(setmac! testmac3)"));
	assert.deepEqual(ev("(testmac3 (1 2 3 4))"), 10);
	
	assert.ok(ev(`(setv! testmac4 
						(lambda (x) 
					 		(if (atom? x)
						  	x` +
						  	"`(~(car (cdr x)) (testmac4 ~(car x)) (testmac4 ~(car (cdr (cdr x))))))))"));
	assert.ok(ev("(setmac! testmac4)"));
	
	assert.deepEqual(ev("(testmac4 1)"), 1);
	assert.deepEqual(ev("(testmac4 (1 + 1))"), 2);
	assert.deepEqual(ev("(testmac4 ((2 * 3) + (4 * (5 + 6))))"), ((2 * 3) + (4 * (5 + 6))));
	assert.end();
});