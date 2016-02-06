const VM = require('vm');
const Reflect = require('harmony-reflect');

function format() {
    var rx = /%[0-9]+/gi;
    var args = arguments;
    
    return args[0].replace(rx, function(match) {
        return args[parseInt(match.substring(1)) + 1];
    });
}

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

function cons(e, lst) {
    return ((lst = lst.slice(0)).unshift(e), lst);
}

function car(lst) {
    return lst[0];
}

function cdr(lst) {
    return lst.slice(1);
}

function second(lst) {
    return lst[1];
}

function last(lst) {
    return lst[lst.length - 1];
}

function list(...args) {
    return args;
}

function concat(...args) {
    return args.reduce(function(accum, arr) {
        return accum.concat(arr);
    }, []);
}

function Symbol(name) {
    this.name = name;
}

Symbol.prototype.toString = function() {
    return this.name;
};

function symbol__QM(x) {
    return x instanceof Symbol;
}

function number__QM(x) {
    return typeof x === "number" || x instanceof Number;
}

function null__QM(x) {
    return Array.isArray(x) && x.length === 0;
}

function atom__QM(x) {
    return x === true || x === false || null__QM(x) || x === undefined || number__QM(x) || symbol__QM(x);
}

function list__QM(x) {
    return Array.isArray(x);
}

function makeEnum(...args) {
    var e = {};
    for (var i = 0; i < args.length; ++i)
        e[args[i]] = i;

    return e;
}

var TokenType = makeEnum("LIST_OPEN", "LIST_CLOSE", "TRUE", "FALSE", "NULL", "UNDEF", "NUM", "SYM",
    "QUOTE", "BACKQUOTE", "UNQUOTE", "SPLICE", "END");

function Token(src, type, start, len) {
    this.src = src;
    this.type = type;
    this.start = start;
    this.len = len;
}

Token.prototype.text = function() {
    return this.src.substr(this.start, this.len);
};

function lit(str) {
    return new RegExp("^" + str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

var spacePatt = /^\s+/;
var numberPatt = /^[+\-]?\d+(\.\d*)?|^[+\-]?\.\d+/;
var symPatt = /^[<>?+\-=!@#$%\^&*/a-zA-Z][<>?+\-=!@#$%\^&*/a-zA-Z0-9]*/;

var tokenTable = [{patt: spacePatt, type: -1},
                  {patt: lit("true"), type: TokenType.TRUE},
                  {patt: lit("false"), type: TokenType.FALSE},
                  {patt: lit("null"), type: TokenType.NULL},
                  {patt: lit("undefined"), type: TokenType.UNDEF},
                  {patt: numberPatt, type: TokenType.NUM},
                  {patt: lit("("), type: TokenType.LIST_OPEN},
                  {patt: lit(")"), type: TokenType.LIST_CLOSE},
                  {patt: lit("'"), type: TokenType.QUOTE},
                  {patt: lit("`"), type: TokenType.BACKQUOTE},
                  {patt: lit("~@"), type: TokenType.SPLICE},
                  {patt: lit("~"), type: TokenType.UNQUOTE},
                  {patt: symPatt, type: TokenType.SYM}];

function tokenize(src) {
    var toks = [];
    var pos = 0;
    var str = src;

    while (str.length > 0) {
        for (var i = 0; i < tokenTable.length; ++i) {
            var res = str.match(tokenTable[i].patt);

            if (res !== null) {
                str = str.substring(res[0].length);

                if (tokenTable[i].type !== -1)
                    toks.push(new Token(src, tokenTable[i].type, pos, res[0].length));

                pos += res[0].length;
                break;
            }
        }

        if (i == tokenTable.length)
            throw "Unrecognized token: " + str;
    }

    toks.push({type: TokenType.END});

    return toks;
}

function Parser(toks) {
    this.toks = toks;
    this.curr = 0;
}

Parser.prototype.peekTok = function() {
    return this.toks[this.curr];
};

Parser.prototype.consumeTok = function() {
    var tok = this.toks[this.curr];
    ++this.curr;
    return tok;
};

Parser.prototype.parseExpr = function() {
    var tok = this.consumeTok();

    switch (tok.type) {
        case TokenType.LIST_OPEN:   return this.parseList();
        case TokenType.TRUE:        return true;
        case TokenType.FALSE:       return false;
        case TokenType.NULL:        return [];
        case TokenType.UNDEF:       return undefined;
        case TokenType.NUM:         return parseFloat(tok.text());
        case TokenType.QUOTE:       return cons(new Symbol("quote"), cons(this.parseExpr(), []));
        case TokenType.BACKQUOTE:   return this.parseBackquotedExpr();
        case TokenType.SYM:         return new Symbol(tok.text());
        default:
            throw "Unexpected token: " + this.peekTok().type;
    }
};

Parser.prototype.parseList = function() {
    var accum = [];
    
    while (this.peekTok().type != TokenType.LIST_CLOSE &&
        this.peekTok().type != TokenType.END) {
            accum = cons(this.parseExpr(), accum);
    }

    if (this.consumeTok().type == TokenType.LIST_CLOSE)
        return (accum.reverse(), accum);
    else
        throw "Unmatched paren!";
};

Parser.prototype.parseBackquotedList = function() {
    var accum = [];

    while (this.peekTok().type != TokenType.LIST_CLOSE &&
            this.peekTok().type != TokenType.END) {
        if (this.peekTok().type === TokenType.UNQUOTE) {
            this.consumeTok();
            accum = cons(list(new Symbol("list"), this.parseExpr()), accum);
        }

        else if (this.peekTok().type === TokenType.SPLICE) {
            this.consumeTok();
            accum = cons(this.parseExpr(), accum);
        }

        else {
            var quotedMember = this.parseBackquotedExpr();
            accum = cons(list(new Symbol("list"), quotedMember), accum);
        }
    }

    if (this.consumeTok().type == TokenType.LIST_CLOSE)
        return cons(new Symbol("concat"), (accum.reverse(), accum));
    else
        throw "Unclosed list!";
};


Parser.prototype.parseBackquotedExpr = function() {
    return this.peekTok().type === TokenType.LIST_OPEN ?
        (this.consumeTok(), this.parseBackquotedList()) :
        cons(new Symbol("quote"), cons(this.parseExpr(), []));
};

function parse(toks) {
    var p = new Parser(toks), forms = [];

    while (p.peekTok().type !== TokenType.END) {
        forms.push(p.parseExpr());
    }

    return forms;
}

var manglingTable = {
    "<": "__LT",
    ">": "__GT",
    "?": "__QM",
    "+": "__PLUS",
    "-": "__MINUS",
    "=": "__EQL",
    "!": "__BANG",
    "@": "__AT",
    "#": "__HASH",
    "$": "__USD",
    "%": "__PCNT",
    "^": "__CARET",
    "&": "__AMP",
    "*": "__STAR",
    "/": "__SLASH"
};

var manglingRx = new RegExp("\\" + Object.keys(manglingTable).join("|\\"), "gi");

function mangle(x) {
    return manglingTable[x];
}

function mangleName(name) {
    return name.replace(manglingRx, mangle);
}

var nextVarSuffix = 0;

function genVarName() {
    var out = "$$TMP" + nextVarSuffix;
    ++nextVarSuffix;
    return out;
};

function compileAtom(x) {
         if(x === true)         return ["true", ""];
    else if(x === false)        return ["false", ""];
    else if(null__QM(x))        return ["[]", ""];
    else if(x === undefined)    return ["undefined", ""];
    else                        return [symbol__QM(x) ? mangleName(x.name) : x.toString(), ""]
}

function compileFuncall(lst) {
    var compiledArgs = cdr(lst).map(compile);
    var compiledFun = compile(car(lst));

    return [format("%0(%1)",
            compiledFun[0],
            compiledArgs.map(car).join(",")),
            compiledFun[1] + compiledArgs.map(second).join("")];
}

function compileBodyHelper(lst, targetVarName) {
    var compiledBody = lst.map(compile);

    var reducer = function(accum, v) {
        return accum + v[1] + v[0] + ";";
    };

    return compiledBody.slice(0, -1).reduce(reducer, "") +
        last(compiledBody)[1] +
        targetVarName + "=" + last(compiledBody)[0] + ";";
}

function processArgs(args) {
    var revArgs = args.reduce(function(accum, v) {
        return cons(v.name[0] == "&" ?
            "..." + mangleName(v.name.slice(1)) : mangleName(v.name),
            accum);
    }, []);

    return (revArgs.reverse(), revArgs.join(","));
}

function compileLambda(lst) {
    var retVarName = genVarName();
    var compiledBody = compileBodyHelper(cdr(cdr(lst)), retVarName);

    return [format("(function (%0)" +
                    "{" +
                        "var %1;" +
                        "%2" +
                        "return %1;" +
                    "})",
        processArgs(car(cdr(lst))),
        retVarName,
        compiledBody), ""];
}

function compileIf(lst) {
    var valueVarName = genVarName();
    var compiledCond = compile(lst[1]);
    var compiledT = compile(lst[2]);
    var compiledF = compile(lst[3]);

    return [valueVarName,
            format("var %0;" +
                    "%1" +
                    "if(%2){" +
                        "%3" +
                        "%0=%4;" +
                    "}else{" +
                        "%5" +
                        "%0=%6;" +
                    "}",
            valueVarName,
            compiledCond[1],
            compiledCond[0],
            compiledT[1],
            compiledT[0],
            compiledF[1],
            compiledF[0])];
}

function compileQuotedAtom(x) {
    if (symbol__QM(x))
        return ["(new Symbol(\"" + x.name + "\"))", ""];
    else
        return compileAtom(x);
}

function compileQuotedList(x) {
    var r = function(accum, v) {
        return [accum[0] + "cons(" + compileQuoted(v)[0] + ",", accum[1] + ")"];
    };

    return [x.reduce(r, ["", "[]"]).join(""), ""];
}

function compileQuoted(x) {
    if (atom__QM(x))
        return compileQuotedAtom(x);
    else
        return compileQuotedList(x);
}

function compileSetv(lst) {
    var varName = mangleName(lst[1].toString());
    var compiledVal = compile(lst[2]);
    return [varName, compiledVal[1] + varName + "=" + compiledVal[0] + ";"];
}

function macroexpandUnsafe(expr) {
    var withQuotedArgs = cons(car(expr), cdr(expr).map(function(x) {
        return list(new Symbol("quote"), x);
    }));

    var tmp = compileFuncall(withQuotedArgs);
    return geval(tmp[1] + tmp[0]);
}

function macroexpand(expr) {
    if (list__QM(expr) && !null__QM(expr) && sandbox[car(expr)] !== undefined && sandbox[car(expr)].isMacro)
        return macroexpandUnsafe(expr);

    else
        throw "macroexpand argument is not a macro!";
}

function compile(expr) {
    if (list__QM(expr) && !null__QM(expr)) {
        var first = car(expr);

        if (first instanceof Symbol) {
            switch (first.name) {
                case "lambda":      return compileLambda(expr);
                case "if":          return compileIf(expr);
                case "quote":       return compileQuoted(car(cdr(expr)));
                case "setv!":       return compileSetv(expr);
                default:
                    if (sandbox[first.name] !== undefined && sandbox[first.name]["isMacro"])
                        return compile(macroexpandUnsafe(expr));
                    else
                        return compileFuncall(expr);
            }
        }

        else
            return compileFuncall(expr);
    }

    else
        return compileAtom(expr);
}

function __EQL(...args) {
    var v = args[0];

    for (var i = 1; i < args.length; ++i)
        if (args[i] !== v && !(null__QM(args[i]) && null__QM(v)))
            return false;

    return true;
}

var sandbox = {
    Symbol          :   Symbol,
    apply           :   function(fun, args) { return fun.apply(null, args); },
    cons            :   cons,
    car             :   car,
    cdr             :   cdr,
    list            :   list,
    concat          :   concat,
    symbol__QM      :   symbol__QM,
    null__QM        :   null__QM,
    number__QM      :   number__QM,
    atom__QM        :   atom__QM,
    list__QM        :   list__QM,
    __PLUS          :   argReducer("+", function(a, b) { return a + b; }, 0),
    __MINUS         :   argReducer("-", function(a, b) { return a - b; }, 0),
    __STAR          :   argReducer("*", function(a, b) { return a * b; }, 1),
    __SLASH         :   argReducer("/", function(a, b) { return a / b }, 1),
    __EQL           :   __EQL,
    not__EQL        :   function(x, y) { return x !== y; },
    __LT            :   function(x, y) { return x < y; },
    __GT            :   function(x, y) { return x > y; },
    __LT__EQL       :   function(x, y) { return x <= y; },
    __GT__EQL       :   function(x, y) { return x >= y; },
    mod             :   function(x, y) { return x % y; },
    setmac__BANG    :   function(x) { return x.isMacro = true; },
    macroexpand     :   macroexpand
};

VM.createContext(sandbox);

function geval(str) {
    return VM.runInContext(str, sandbox);
}

function evalisp(expr) {
    var tmp = compile(expr);
    return geval(tmp[1] + tmp[0]);
}

function evalispstr(str) {
    var forms = parse(tokenize(str)), r;

    for (var i = 0; i < forms.length; ++i) {
        r = evalisp(forms[i]);
    }

    return r;
}


module.exports.tokenize = tokenize;
module.exports.parse = parse;
module.exports.TokenType = TokenType;
module.exports.cons = cons;
module.exports.list = list;
module.exports.concat = concat;
module.exports.Symbol = Symbol;
module.exports.evalispstr = evalispstr;
module.exports.sandbox = sandbox;

console.log(evalispstr("'true"));

/*
var handler = {
    get: function(target, name){
        return name in target?
            target[name] :
            37;
    }
};

var p = new Proxy({}, handler);
var obj = {a: 1, b: 2};

vm.createContext(obj);

obj.__proto__ = p;

console.log(obj.a, obj.b); // 1, undefined
console.log('c' in obj, eval("obj.c")); // false, 37

vm.runInContext('function baz () { return 5; }', obj);

console.log("Hax: " + obj.baz());*/

//for (var i = 0; i < 10; ++i) {
//    vm.runInContext('globalVar *= 2;', sandbox);
//}

//console.log(util.inspect(sandbox));