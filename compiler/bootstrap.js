function argReducer(name, r, initial) {
    return function(...args) {
        if (args.length === 0)
            return initial;
        else if (args.length === 1)
            return r(initial, args[0]);
        else {
            var accum = r(args[0], args[1]);
            for (var i = 2; i < args.length; i++)
                accum = r(accum, args[i]);
            return accum;
        }
    };
}

function Symbol(name) {
    this.name = name;
}

Symbol.prototype.toString = function() {
    return this.name;
};

var $$root = {
    Symbol: Symbol,
    
    apply: function apply (fun, args) {
        return fun.apply(null, args);
    },
    
    cons: function cons(e, lst) {
        return ((lst = lst.slice(0)).unshift(e), lst);
    },

    car: function car(lst) {
        return lst[0];
    },

    cdr: function cdr(lst) {
        return lst.slice(1);
    },

    list: function list(...args) {
        return args;
    },

    concat: function concat(...args) {
        return args.reduce(function(accum, arr) {
            return accum.concat(arr);
        }, []);
    },
    
    symbol__QM: function symbol__QM(x) {
        return x instanceof Symbol;
    },

    number__QM: function number__QM(x) {
        return typeof x === "number" || x instanceof Number;
    },

    null__QM: function null__QM(x) {
        return Array.isArray(x) && x.length === 0;
    },

    atom__QM: function atom__QM(x) {
        return x === true || x === false || $$root.null__QM(x) || x === undefined || $$root.number__QM(x) || $$root.symbol__QM(x);
    },

    list__QM: function list__QM(x) {
        return Array.isArray(x);
    },

    __EQL:  function __EQL(...args) {
        var v = args[0];

        for (var i = 1; i < args.length; ++i)
            if (args[i] !== v && !($$root.null__QM(args[i]) && $$root.null__QM(v)))
                return false;

        return true;
    },
    
    __PLUS          :   argReducer("+", function(a, b) { return a + b; }, 0),
    __MINUS         :   argReducer("-", function(a, b) { return a - b; }, 0),
    __STAR          :   argReducer("*", function(a, b) { return a * b; }, 1),
    __SLASH         :   argReducer("/", function(a, b) { return a / b }, 1),
    not__EQL        :   function(x, y) { return x !== y; },
    __LT            :   function(x, y) { return x < y; },
    __GT            :   function(x, y) { return x > y; },
    __LT__EQL       :   function(x, y) { return x <= y; },
    __GT__EQL       :   function(x, y) { return x >= y; },
    mod             :   function(x, y) { return x % y; },
    setmac__BANG    :   function(x) { return x.isMacro = true; },
};