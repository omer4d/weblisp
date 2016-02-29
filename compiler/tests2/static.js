var _test = require('tape');
const VM = require('vm');
var fs = require('fs');

var test = function(title, f) {
	_test("[Static Compiler] " + title, f);
}

var wl = require('../weblisp.js');
var sandbox = {};
var staticCompiler = new wl.StaticCompiler();

VM.createContext(sandbox);
  
function jeval(str) {
    return VM.runInContext(str, sandbox);
}

jeval(fs.readFileSync("./bootstrap.js", "utf8"));
    
sandbox.$$root.jeval = jeval;

function comp(str) {
    return staticCompiler.compileUnit(str);
}

test("Misc.", function( assert ) {
    var testCode1 =
    `(def fun1 (lambda (x) x))
     (def foo1 (throw-me-an-error))`;

    comp(testCode1);
    
    assert.ok(staticCompiler.root.fun1 instanceof wl.LazyDef);
    assert.ok(staticCompiler.root.foo1 instanceof wl.LazyDef);
    
    var testCode2 =
    `(def testmac1 
        (lambda (x) 
            (if (atom? x)
		        x` +
		        "`(~(car (cdr x)) (testmac1 ~(car x)) (testmac1 ~(car (cdr (cdr x))))))))" +
		        `(setmac! testmac1)
    (setv! foo2 (testmac1 (1 + (2 + (3 + 4)))))`;

    jeval(comp(testCode2));
    assert.equal(sandbox.$$root.foo2, 1 + 2 + 3 + 4);

    var testCode3 =
    `(def my-car car)
     (def my-cdr (lambda (lst) (cdr lst)))
     (def id (lambda (x) x))
     (def my-atom? (id atom?))
     
     (def lazyfoo (lambda (x) x))
     (setv! invisible 12345)
    
     (def testmac2 
        (lambda (x) 
            (if (my-atom? x)
		        x` +
		        "`(~(my-car (my-cdr x)) (testmac2 ~(my-car x)) (testmac2 ~(my-car (my-cdr (my-cdr x))))))))" +
		        `(setmac! testmac2)
    (setv! foo3 (testmac2 (5 + (5 + (5 + 5)))))`;

    jeval(comp(testCode3));
    assert.ok(typeof staticCompiler.root["my-car"] === "function");
    assert.ok(typeof staticCompiler.root["my-cdr"] === "function");
    assert.ok(typeof staticCompiler.root.id === "function");
    assert.ok(typeof staticCompiler.root["my-atom?"] === "function");
    assert.ok(staticCompiler.root.lazyfoo instanceof wl.LazyDef);
    assert.notOk(staticCompiler.root.invisible);
    assert.equal(sandbox.$$root.foo3, 5 + 5 + 5 + 5);
    assert.equal(sandbox.$$root.invisible, 12345);
    
    
    comp(`(def testmac3
                (lambda ()
                    '(def id2 (lambda (x) x))))
            (setmac! testmac3)
            (testmac3)`);
                     
    assert.ok(staticCompiler.root.testmac3);
    assert.ok(typeof staticCompiler.root.testmac3 === "function");
    assert.ok(staticCompiler.root.id2);
    assert.ok(staticCompiler.root.id2 instanceof wl.LazyDef);
    
    
    comp(`(def testmac4
                (lambda ()
                    '((lambda ()
                        (def id3 (lambda (x) x))
                        (def id4 (lambda (x) x))))))
            (setmac! testmac4)
            (testmac4)`);
                     
    assert.ok(staticCompiler.root.testmac4);
    assert.ok(typeof staticCompiler.root.testmac4 === "function");
    assert.ok(staticCompiler.root.id3);
    assert.ok(staticCompiler.root.id3 instanceof wl.LazyDef);
    assert.ok(staticCompiler.root.id4);
    assert.ok(staticCompiler.root.id4 instanceof wl.LazyDef);
    
	assert.end();
});