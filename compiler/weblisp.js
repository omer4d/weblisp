const VM = require('vm');
const Reflect = require('harmony-reflect');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

function format(...args) {
    var rx = /%[0-9]+/gi;
    
    return args[0].replace(rx, function(match) {
        return args[parseInt(match.substring(1)) + 1];
    });
}

function escapeStr(str) {
    return JSON.stringify(str);
}

function unescapeStr(str) {
    return JSON.parse(str);
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

function partial(...stuff) {
    var target  =   (typeof stuff[0] === "function") ? null : stuff[0];
    var f       =   (typeof stuff[0] === "function") ? stuff[0] : stuff[1];
    var args1   =   (typeof stuff[0] === "function") ? stuff.slice(1) : stuff.slice(2);
    
    return function(...args2) {
        return f.apply(target, args1.concat(args2));
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

function string__QM(x) {
    return typeof x === "string" || x instanceof String;
}

function null__QM(x) {
    return Array.isArray(x) && x.length === 0;
}

function atom__QM(x) {
    return x === true || x === false || null__QM(x) || x === undefined ||
            number__QM(x) || string__QM(x) || symbol__QM(x);
}

function list__QM(x) {
    return Array.isArray(x);
}

function __EQL(...args) {
    var v = args[0];

    for (var i = 1; i < args.length; ++i)
        if (args[i] !== v && !(null__QM(args[i]) && null__QM(v)))
            return false;

    return true;
}

function makeEnum(...args) {
    var e = {};
    for (var i = 0; i < args.length; ++i)
        e[args[i]] = i;

    return e;
}

var TokenType = makeEnum("LIST_OPEN", "LIST_CLOSE", "TRUE", "FALSE", "NULL", "UNDEF", "NUM", "SYM", "STR",
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
var symPatt = /^[_.<>?+\-=!@#$%\^&*/a-zA-Z][_.<>?+\-=!@#$%\^&*/a-zA-Z0-9]*/;
var strPatt = /^"(?:\\.|[^"])*"/;

var tokenTable = [{patt: spacePatt, type: -1},
                  {patt: /^;[^\n]*/, type: -1},
                  {patt: numberPatt, type: TokenType.NUM},
                  {patt: strPatt, type: TokenType.STR},
                  {patt: lit("("), type: TokenType.LIST_OPEN},
                  {patt: lit(")"), type: TokenType.LIST_CLOSE},
                  {patt: lit("'"), type: TokenType.QUOTE},
                  {patt: lit("`"), type: TokenType.BACKQUOTE},
                  {patt: lit("~@"), type: TokenType.SPLICE},
                  {patt: lit("~"), type: TokenType.UNQUOTE},
                  {patt: symPatt, type: TokenType.SYM}];

var keywords = Object.create(null);
keywords["true"] = TokenType.TRUE;
keywords["false"] = TokenType.FALSE;
keywords["undefined"] = TokenType.UNDEF;
keywords["null"] = TokenType.NULL;

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
                    toks.push(new Token(src, keywords[res[0]] || tokenTable[i].type, pos, res[0].length));
    
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
        case TokenType.STR:         return unescapeStr(tok.text());
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
    ".": "__DOT",
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

function Compiler(root) {
    this.root = root;
    this.nextVarSuffix = 0;
}

Compiler.prototype.genVarName = function() {
    var out = "$$TMP" + this.nextVarSuffix;
    ++this.nextVarSuffix;
    return out;
};

Compiler.prototype.compileAtom = function(lexenv, x) { 
         if(x === true)         return ["true", ""];
    else if(x === false)        return ["false", ""];
    else if(null__QM(x))        return ["[]", ""];
    else if(x === undefined)    return ["undefined", ""];
    else if(symbol__QM(x))      return [(x.name in lexenv) ? mangleName(x.name) : '$$root["' + x.name + '"]', ""];
    else if(string__QM(x))      return [escapeStr(x), ""];
    else                        return [ x.toString(), ""];
};

Compiler.prototype.compileFuncall = function(lexenv, lst) {
    var compiledArgs = cdr(lst).map(partial(this, this.compile, lexenv));
    var compiledFun = this.compile(lexenv, car(lst));

    return [format("%0(%1)",
            compiledFun[0],
            compiledArgs.map(car).join(",")),
            compiledFun[1] + compiledArgs.map(second).join("")];
};

Compiler.prototype.compileBodyHelper = function(lexenv, lst, targetVarName) {
    var compiledBody = lst.map(partial(this, this.compile, lexenv));

    var reducer = function(accum, v) {
        return accum + v[1] + v[0] + ";";
    };

    return compiledBody.slice(0, -1).reduce(reducer, "") +
        last(compiledBody)[1] +
        targetVarName + "=" + last(compiledBody)[0] + ";";
};

function processArgs(args) {
    var revArgs = args.reduce(function(accum, v) {
        return cons(v.name[0] == "&" ?
            "..." + mangleName(v.name.slice(1)) : mangleName(v.name),
            accum);
    }, []);

    return (revArgs.reverse(), revArgs.join(","));
}

Compiler.prototype.compileLambda = function(lexenv, lst) {
    var args = car(cdr(lst));
    var lexenv2 = Object.create(lexenv, args.reduce(function(accum, v) {
        var name = v.name[0] === "&" ? v.name.slice(1) : v.name;
        return (accum[name] = {value: true}, accum);
    }, {}));
    var retVarName = this.genVarName();
    var compiledBody = this.compileBodyHelper(lexenv2, cdr(cdr(lst)), retVarName);

    return [format("(function(%0)" +
                    "{" +
                        "var %1;" +
                        "%2" +
                        "return %1;" +
                    "})",
        processArgs(args),
        retVarName,
        compiledBody), ""];
};

Compiler.prototype.compileIf = function(lexenv, lst) {
    var valueVarName = this.genVarName();
    var compiledCond = this.compile(lexenv, lst[1]);
    var compiledT = this.compile(lexenv, lst[2]);
    var compiledF = this.compile(lexenv, lst[3]);

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
};

Compiler.prototype.compileQuotedAtom = function(lexenv, x) {
    if (symbol__QM(x))
        return ["(new $$root.Symbol(\"" + x.name + "\"))", ""];
    else
        return this.compileAtom(lexenv, x);
};

Compiler.prototype.compileQuotedList = function(lexenv, x) {
    var self = this, r = function(accum, v) {
        return [accum[0] + "$$root.cons(" + self.compileQuoted(lexenv, v)[0] + ",", accum[1] + ")"];
    };

    return [x.reduce(r, ["", "[]"]).join(""), ""];
};

Compiler.prototype.compileQuoted = function(lexenv, x) {
    if (atom__QM(x))
        return this.compileQuotedAtom(lexenv, x);
    else
        return this.compileQuotedList(lexenv, x);
};

Compiler.prototype.compileSetv = function(lexenv, lst) {
    var varName = this.compileAtom(lexenv, lst[1])[0]; //(lst[1].name in lexenv ? "" : "$$root.") + mangleName(lst[1].name);
    var compiledVal = this.compile(lexenv, lst[2]);
    return [varName, compiledVal[1] + varName + "=" + compiledVal[0] + ";"];
};

Compiler.prototype.macroexpandUnsafe = function(lexenv, expr) {
    var withQuotedArgs = cons(car(expr), cdr(expr).map(function(x) {
        return list(new Symbol("quote"), x);
    }));

    var tmp = this.compileFuncall(lexenv, withQuotedArgs);
    return this.root.jeval(tmp[1] + tmp[0]);
};

Compiler.prototype.isMacro = function(name) {
    return name in this.root && this.root[name]["isMacro"];
}

Compiler.prototype.compile = function(lexenv, expr) {
    if (list__QM(expr) && !null__QM(expr)) {
        var first = car(expr);

        if (first instanceof Symbol) {
            switch (first.name) {
                case "lambda":      return this.compileLambda(lexenv, expr);
                case "if":          return this.compileIf(lexenv, expr);
                case "quote":       return this.compileQuoted(lexenv, car(cdr(expr)));
                case "setv!":       return this.compileSetv(lexenv, expr);
                case "def":         return this.compileSetv(lexenv, expr);
                default:
                    if (this.isMacro(first.name))
                        return this.compile(lexenv, this.macroexpandUnsafe(lexenv, expr));
                    else
                        return this.compileFuncall(lexenv, expr);
            }
        }

        else
            return this.compileFuncall(lexenv, expr);
    }

    else
        return this.compileAtom(lexenv, expr);
};

function str1(x) {
    if(Array.isArray(x) && x.length === 0)
   	return "null";
    else if(x === undefined)
    	return "undefined";
    else if(typeof(x) === "function")
    	return (x.isMacro ? "Macro " : "Function ") + (x.name || "[Anonymous]");
    else if(Array.isArray(x))
        return "(" + x.map(str1).join(" ") + ")";
    else
    	return x.toString();
}

var rootProto = {
    Symbol          :   Symbol,
    symbol          :   function(name) { return new Symbol(name); },
    apply           :   function(fun, args) { return fun.apply(null, args); },
    cons            :   cons,
    car             :   car,
    cdr             :   cdr,
    list            :   list,
    concat          :   concat,
    "symbol?"      :   symbol__QM,
    "null?"        :   null__QM,
    "number?"      :   number__QM,
    "atom?"        :   atom__QM,
    "list?"        :   list__QM,
    "+"          :   argReducer("+", function(a, b) { return a + b; }, 0),
    "-"         :   argReducer("-", function(a, b) { return a - b; }, 0),
    "*"          :   argReducer("*", function(a, b) { return a * b; }, 1),
    "/"         :   argReducer("/", function(a, b) { return a / b }, 1),
    not         :   function(b) { return !b; },
    "="           :   __EQL,
    "not="        :   function(x, y) { return x !== y; },
    "<"            :   function(x, y) { return x < y; },
    ">"            :   function(x, y) { return x > y; },
    "<="       :   function(x, y) { return x <= y; },
    ">="       :   function(x, y) { return x >= y; },
    mod             :   function(x, y) { return x % y; },
    "setmac!"    :   function(x) { return x.isMacro = true; },
    object      :   function object(proto) { return Object.create(proto || {}); },
    geti            :   function geti(obj, idx) { return obj[idx]; },
    "seti!"      :   function seti__BANG(obj, idx, val) { obj[idx] = val },
    "apply-method"  :   function apply__MINUSmethod(method, target, args) {
        return method.apply(target, args);
    },
    "call-method"   :   function call__MINUSmethod(method, target, ...args) {
        return method.apply(target, args);
    },
    "macro?" : function(f) {
        return f && ("isMacro" in f);
    },
    str      :   argReducer("str", function(a, b) { return str1(a) + str1(b); }, ""),
    print    :   function print(...args) { console.log(args.map(str1).join(" ")); },
    error    :   function(msg) {
        throw Error(msg);
    }
};

function NodeEvaluator() {
    this.root = Object.create(rootProto);
    this.compiler = new Compiler(this.root);
    
    var sandbox = {
        $$root: this.root
    };
    
    VM.createContext(sandbox);
    
    this.root.jeval = function(str) {
        return VM.runInContext(str, sandbox);
    };
}

NodeEvaluator.prototype.eval = function(expr) {
    var tmp = this.compiler.compile({"this": true}, expr);
    return this.root.jeval(tmp[1] + tmp[0]);
};

NodeEvaluator.prototype.evalStr = function(str) {
    var forms = parse(tokenize(str)), r;

    for (var i = 0; i < forms.length; ++i)
        r = this.eval(forms[i]);
        
    return r;
};

function LazyDef(initJstr, valJstr) {
    this.initJstr = initJstr;
    this.valJstr = valJstr;
}

function StaticCompiler() {
    var root = Object.create(rootProto);
    Compiler.call(this, root);
    
    var handler = {
        get: function(target, name) {
            var r = target[name];
        
            //console.log("Looking up: " + name);
        
            if(r instanceof LazyDef)
            {
                r = root.jeval(r.initJstr + r.valJstr);
                target[name] = r;
            }
        
            return r;
        }
    };

    var sandbox = {
        $$root: new Proxy(root, handler)
    };
    
    VM.createContext(sandbox);
    
    root.jeval = function(str) {
        return VM.runInContext(str, sandbox);
    };

    root["*ns*"] = sandbox.$$root;
    
    var nextGensymSuffix = 0;
    
    root.gensym = function gensym() {
        return new Symbol("__GS" + (++nextGensymSuffix));
    };
}

StaticCompiler.prototype = Object.create(Compiler.prototype);

function isIIFE(e) {
    if(list__QM(e) && !null__QM(e) && null__QM(cdr(e))) {
        var lam = car(e);
        return list__QM(lam) && !null__QM(lam) && car(lam).name === "lambda" && null__QM(car(cdr(lam)));
    }
    else
        return false;
}

StaticCompiler.prototype.compileToplevel = function(e) {
    var tmp, lexenv = {"this": true};
    
    if(list__QM(e) && !null__QM(e)) {
        if(car(e).name === "def") {
            tmp = this.compile(lexenv, e);
            var name = second(e).name;
            this.root[name] = new LazyDef(tmp[1], tmp[0]);
            return tmp[1] + tmp[0] + ";";
        }
        
        else if(car(e).name === "setmac!") {
            tmp = this.compile(lexenv, e);
            this.root.jeval(tmp[1] + tmp[0]);
            return tmp[1] + tmp[0] + ";";
        }
        
        else if(isIIFE(e)) {
            return cdr(cdr(car(e))).map(partial(this, this.compileToplevel)).join("");
        }
        
        else if(symbol__QM(car(e)) && this.isMacro(car(e).name)) {
            return this.compileToplevel(this.macroexpandUnsafe(lexenv, e));
        }
    }
    
    tmp = this.compile(lexenv, e);
    return tmp[1] + tmp[0] + ";";
};

StaticCompiler.prototype.compileUnit = function(str) {
    var forms = parse(tokenize(str)), r = "";

    for (var i = 0; i < forms.length; ++i) {
        r += this.compileToplevel(forms[i]);
    }

    return r;
};

function formatCode1(str) {
    var toks = str.split(/(;|{|})/);
    var out = "";
    var ind = [];

    for(var i = 0; i < Math.floor(toks.length / 2); ++i) {
        if(toks[i * 2 + 1] === "}")
            ind.pop();
        
        out += ind.join("") + toks[i * 2] + toks[i * 2 + 1] + "\n";

        if(toks[i * 2 + 1] === "{")
            ind.push("   ");
    }
    
    return out + toks[toks.length - 1];
}

function formatCode(str) {
    var strPatt = /("(?:(?:\\")|[^"])*")/;
    var toks = str.split(strPatt);
    return toks.map(function(tok, idx) {
	return idx % 2 ? tok : formatCode1(tok);
    }).join("");
}

function replaceExt(s, ext) {
    return s.slice(0, s.indexOf(".")) + ext;
}

if(argv._.length > 0) {
    var comp = new StaticCompiler();
    var files = argv._; //Array.isArray(argv.) ? argv.in : [argv.in];
    var output = fs.readFileSync("bootstrap.js", "utf8") + files.map(function(f) {
	return formatCode(comp.compileUnit(fs.readFileSync(f, "utf8")));
    }).join("");

    var outputName = argv.out ? argv.out : (files.length === 1 ? replaceExt(files[0], ".js") : undefined);

    if(outputName)
	fs.writeFileSync(outputName, output);
    else
	throw new Error("Output name unspecified!");
}

module.exports.tokenize = tokenize;
module.exports.parse = parse;
module.exports.TokenType = TokenType;
module.exports.cons = cons;
module.exports.list = list;
module.exports.concat = concat;
module.exports.Symbol = Symbol;
module.exports.Compiler = Compiler;
module.exports.StaticCompiler = StaticCompiler;
module.exports.NodeEvaluator = NodeEvaluator;
module.exports.LazyDef = LazyDef;
