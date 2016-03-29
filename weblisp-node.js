function argReducer(name, r, initial) {
    return function() {
	var args = Array(arguments.length);
	for(var i = 0; i < arguments.length; ++i)
	    args[i] = arguments[i];
		
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

function Symbol(name) {
    this.name = name;
}

Symbol.prototype.toString = function() {
    return this.name;
};

var nextGensymSuffix = 0;

var $$root = {
    Symbol: Symbol,
    
    symbol: function symbol(name) {
        return new Symbol(name);
    },
    
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

    list: function list() {
	var args = Array(arguments.length);
	for(var i = 0; i < arguments.length; ++i)
	    args[i] = arguments[i];

        return args;
    },

    concat: function concat() {
	var args = Array(arguments.length);
	for(var i = 0; i < arguments.length; ++i)
	    args[i] = arguments[i];

        return args.reduce(function(accum, arr) {
            return accum.concat(arr);
        }, []);
    },
    
    "symbol?": function symbol__QM(x) {
        return x instanceof Symbol;
    },

    "number?": function number__QM(x) {
        return typeof x === "number" || x instanceof Number;
    },
    
    "string?": function number__QM(x) {
        return typeof x === "string" || x instanceof String;
    },

    "null?": function null__QM(x) {
        return Array.isArray(x) && x.length === 0;
    },

    "atom?": function atom__QM(x) {
        return x === true || x === false || $$root["null?"](x) || x === undefined || $$root["number?"](x) || $$root["symbol?"](x) || $$root["string?"](x);
    },

    "list?": function list__QM(x) {
        return Array.isArray(x);
    },

    "=":  function __EQL() {
        var v = arguments[0];

        for (var i = 1; i < arguments.length; ++i)
            if (arguments[i] !== v && !($$root["null?"](arguments[i]) && $$root["null?"](v)))
                return false;

        return true;
    },
    
    "+"         :   argReducer("+", function(a, b) { return a + b; }, 0),
    "-"         :   argReducer("-", function(a, b) { return a - b; }, 0),
    "*"         :   argReducer("*", function(a, b) { return a * b; }, 1),
    "/"         :   argReducer("/", function(a, b) { return a / b }, 1),
    not         :   function(b) { return !b; },
    "not="      :   function(x, y) { return x !== y; },
    "<"         :   function(x, y) { return x < y; },
    ">"         :   function(x, y) { return x > y; },
    "<="        :   function(x, y) { return x <= y; },
    ">="        :   function(x, y) { return x >= y; },
    mod         :   function(x, y) { return x % y; },
    "setmac!"   :   function(x) { return x.isMacro = true; },
    str         :   argReducer("str", function(a, b) { return str1(a) + str1(b); }, ""),
    
    print: function print() {
		var args = Array(arguments.length);
		for(var i = 0; i < arguments.length; ++i)
			args[i] = arguments[i];

		console.log(args.map(str1).join(" "));
    },
    regex       :   function regex(str, flags) { return new RegExp(str, flags); },
    
    object      :   function object(proto) { return Object.create(proto || {}); },
	"hashmap"	:   function hashmap() { return Object.create(null); },
    geti        :   function geti(obj, idx) { return obj[idx]; },
    "seti!"     :   function seti__BANG(obj, idx, val) { obj[idx] = val; return val; },
    
    "apply-method"  :   function apply__MINUSmethod(method, target, args) {
        return method.apply(target, args);
    },
    "call-method"   :   function call__MINUSmethod(method, target) {
	var args = Array(arguments.length - 2);
	for(var i = 2; i < arguments.length; ++i)
	    args[i - 2] = arguments[i];

        return method.apply(target, args);
    },
    gensym : function() {
        return new Symbol("__GS" + (++nextGensymSuffix));
    },
    "macro?" : function(f) {
        return f && ("isMacro" in f);
    },
	"function?" : function(f) {
		return typeof f === "function";
	},
    error:  function(msg) {
        throw Error(msg);
    },
	export: function(s, v) {
		module.exports[s] = v;
	},
	require: function(mod) {
		return require(mod);
	},
	in: function(obj, f) {
		return f in obj;
	},
	"get-document": function() {
		return document;
	},
	"get-window": function() {
		return window;
	},
	array: function(n, v) {
		var arr = new Array(n);
		for(var i = 0; i < n; ++i)
			arr[i] = v;
		return arr;
	},
	shr: function(x, y) {
		return x >> y;
	},
	shl: function(x, y) {
		return x << y;
	}
};

$$root["*ns*"] = $$root;
$$root.__proto__ = Function('return this')();

// *
// * 
// *

$$root["defmacro"]=(function(name,args){
   var body=Array(arguments.length-2);
   for(var $$TMP1=2;
   $$TMP1<arguments.length;
   ++$$TMP1){
      body[$$TMP1-2]=arguments[$$TMP1];
   }
   var $$TMP0;
$$TMP0=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setmac!"))),$$root["list"](name))))));
return $$TMP0;
}
);
$$root["defmacro"];
$$root["setmac!"]($$root["defmacro"]);
$$root["defun"]=(function(name,args){
   var body=Array(arguments.length-2);
   for(var $$TMP3=2;
   $$TMP3<arguments.length;
   ++$$TMP3){
      body[$$TMP3-2]=arguments[$$TMP3];
   }
   var $$TMP2;
$$TMP2=$$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)));
return $$TMP2;
}
);
$$root["defun"];
$$root["setmac!"]($$root["defun"]);
$$root["progn"]=(function(){
   var body=Array(arguments.length-0);
   for(var $$TMP6=0;
   $$TMP6<arguments.length;
   ++$$TMP6){
      body[$$TMP6-0]=arguments[$$TMP6];
   }
   var $$TMP4;
   var $$TMP5;
if($$root["null?"](body)){
   $$TMP5=undefined;
}
else{
$$TMP5=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),body)));
}
$$TMP4=$$TMP5;
return $$TMP4;
}
);
$$root["progn"];
$$root["setmac!"]($$root["progn"]);
$$root["when"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP8=1;
   $$TMP8<arguments.length;
   ++$$TMP8){
      body[$$TMP8-1]=arguments[$$TMP8];
   }
   var $$TMP7;
$$TMP7=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)),$$root["list"](undefined));
return $$TMP7;
}
);
$$root["when"];
$$root["setmac!"]($$root["when"]);
$$root["cond"]=(function(){
   var pairs=Array(arguments.length-0);
   for(var $$TMP11=0;
   $$TMP11<arguments.length;
   ++$$TMP11){
      pairs[$$TMP11-0]=arguments[$$TMP11];
   }
   var $$TMP9;
   var $$TMP10;
if($$root["null?"](pairs)){
   $$TMP10=undefined;
}
else{
$$TMP10=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](pairs)),$$root["list"]($$root["car"]($$root["cdr"](pairs))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["cdr"]($$root["cdr"](pairs)))));
}
$$TMP9=$$TMP10;
return $$TMP9;
}
);
$$root["cond"];
$$root["setmac!"]($$root["cond"]);
$$root["and"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP14=0;
   $$TMP14<arguments.length;
   ++$$TMP14){
      args[$$TMP14-0]=arguments[$$TMP14];
   }
   var $$TMP12;
   var $$TMP13;
if($$root["null?"](args)){
   $$TMP13=true;
}
else{
$$TMP13=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["cdr"](args))),$$root["list"](false));
}
$$TMP12=$$TMP13;
return $$TMP12;
}
);
$$root["and"];
$$root["setmac!"]($$root["and"]);
$$root["or"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP18=0;
   $$TMP18<arguments.length;
   ++$$TMP18){
      args[$$TMP18-0]=arguments[$$TMP18];
   }
   var $$TMP15;
   var $$TMP16;
if($$root["null?"](args)){
   $$TMP16=false;
}
else{
   var $$TMP17;
if($$root["null?"]($$root["cdr"](args))){
$$TMP17=$$root["car"](args);
}
else{
$$TMP17=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP16=$$TMP17;
}
$$TMP15=$$TMP16;
return $$TMP15;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["macroexpand-1"]=(function(expr){
   var $$TMP19;
   var $$TMP20;
   var $$TMP21;
if($$root["list?"](expr)){
   var $$TMP22;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
   $$TMP22=true;
}
else{
   $$TMP22=false;
}
$$TMP21=$$TMP22;
}
else{
   $$TMP21=false;
}
if($$TMP21){
$$TMP20=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
}
else{
   $$TMP20=expr;
}
$$TMP19=$$TMP20;
return $$TMP19;
}
);
$$root["macroexpand-1"];
$$root["inc"]=(function(x){
   var $$TMP23;
$$TMP23=$$root["+"](x,1);
return $$TMP23;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP24;
$$TMP24=$$root["-"](x,1);
return $$TMP24;
}
);
$$root["dec"];
$$root["incv!"]=(function(name,amt){
   var $$TMP25;
   amt=(function(c){
      var $$TMP26;
      var $$TMP27;
      if(c){
         $$TMP27=c;
      }
      else{
         $$TMP27=1;
      }
      $$TMP26=$$TMP27;
      return $$TMP26;
   }
   )(amt);
   amt;
$$TMP25=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP25;
}
);
$$root["incv!"];
$$root["setmac!"]($$root["incv!"]);
$$root["decv!"]=(function(name,amt){
   var $$TMP28;
   amt=(function(c){
      var $$TMP29;
      var $$TMP30;
      if(c){
         $$TMP30=c;
      }
      else{
         $$TMP30=1;
      }
      $$TMP29=$$TMP30;
      return $$TMP29;
   }
   )(amt);
   amt;
$$TMP28=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP28;
}
);
$$root["decv!"];
$$root["setmac!"]($$root["decv!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP31;
$$TMP31=$$root["car"]($$root["cdr"](lst));
return $$TMP31;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP32;
$$TMP32=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP32;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP33;
$$TMP33=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP33;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP34;
$$TMP34=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP34;
}
);
$$root["fifth"];
$$root["rest"]=$$root["cdr"];
$$root["rest"];
$$root["getter"]=(function(field){
   var $$TMP35;
   $$TMP35=(function(obj){
      var $$TMP36;
$$TMP36=$$root["geti"](obj,field);
return $$TMP36;
}
);
return $$TMP35;
}
);
$$root["getter"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP37;
   var $$TMP38;
if($$root["null?"](lst)){
   $$TMP38=accum;
}
else{
$$TMP38=$$root["reduce"](r,$$root["cdr"](lst),r(accum,$$root["car"](lst)));
}
$$TMP37=$$TMP38;
return $$TMP37;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP39;
$$TMP39=$$root["reduce"]((function(accum,v){
   var $$TMP40;
$$TMP40=$$root["cons"](v,accum);
return $$TMP40;
}
),lst,[]);
return $$TMP39;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP41;
$$TMP41=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP41;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP42;
$$TMP42=$$root["transform-list"]((function(accum,v){
   var $$TMP43;
$$TMP43=$$root["cons"](f(v),accum);
return $$TMP43;
}
),lst);
return $$TMP42;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP44;
$$TMP44=$$root["transform-list"]((function(accum,v){
   var $$TMP45;
   var $$TMP46;
   if(p(v)){
$$TMP46=$$root["cons"](v,accum);
}
else{
   $$TMP46=accum;
}
$$TMP45=$$TMP46;
return $$TMP45;
}
),lst);
return $$TMP44;
}
);
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP47;
$$TMP47=$$root["transform-list"]((function(accum,v){
   var $$TMP48;
n=$$root["-"](n,1);
n;
var $$TMP49;
if($$root[">="](n,0)){
$$TMP49=$$root["cons"](v,accum);
}
else{
   $$TMP49=accum;
}
$$TMP48=$$TMP49;
return $$TMP48;
}
),lst);
return $$TMP47;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP50;
$$TMP50=$$root["transform-list"]((function(accum,v){
   var $$TMP51;
n=$$root["-"](n,1);
n;
var $$TMP52;
if($$root[">="](n,0)){
   $$TMP52=accum;
}
else{
$$TMP52=$$root["cons"](v,accum);
}
$$TMP51=$$TMP52;
return $$TMP51;
}
),lst);
return $$TMP50;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP53;
   $$TMP53=(function(counter){
      var $$TMP54;
$$TMP54=$$root["transform-list"]((function(accum,v){
   var $$TMP55;
   var $$TMP56;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP56=$$root["cons"](v,accum);
}
else{
   $$TMP56=accum;
}
$$TMP55=$$TMP56;
return $$TMP55;
}
),lst);
return $$TMP54;
}
)(-1);
return $$TMP53;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP57;
   var $$TMP58;
if($$root["="](n,0)){
$$TMP58=$$root["car"](lst);
}
else{
$$TMP58=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP57=$$TMP58;
return $$TMP57;
}
);
$$root["nth"];
$$root["butlast"]=(function(n,lst){
   var $$TMP59;
$$TMP59=$$root["take"]($$root["-"]($$root["count"](lst),n),lst);
return $$TMP59;
}
);
$$root["butlast"];
$$root["last"]=(function(lst){
   var $$TMP60;
$$TMP60=$$root["reduce"]((function(accum,v){
   var $$TMP61;
   $$TMP61=v;
   return $$TMP61;
}
),lst,undefined);
return $$TMP60;
}
);
$$root["last"];
$$root["count"]=(function(lst){
   var $$TMP62;
$$TMP62=$$root["reduce"]((function(accum,v){
   var $$TMP63;
$$TMP63=$$root["inc"](accum);
return $$TMP63;
}
),lst,0);
return $$TMP62;
}
);
$$root["count"];
$$root["zip"]=(function(a){
   var more=Array(arguments.length-1);
   for(var $$TMP70=1;
   $$TMP70<arguments.length;
   ++$$TMP70){
      more[$$TMP70-1]=arguments[$$TMP70];
   }
   var $$TMP64;
   $$TMP64=(function(args){
      var $$TMP65;
      var $$TMP66;
if($$root["reduce"]((function(accum,v){
   var $$TMP67;
   $$TMP67=(function(c){
      var $$TMP68;
      var $$TMP69;
      if(c){
         $$TMP69=c;
      }
      else{
$$TMP69=$$root["null?"](v);
}
$$TMP68=$$TMP69;
return $$TMP68;
}
)(accum);
return $$TMP67;
}
),args,false)){
   $$TMP66=[];
}
else{
$$TMP66=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP65=$$TMP66;
return $$TMP65;
}
)($$root["cons"](a,more));
return $$TMP64;
}
);
$$root["zip"];
$$root["let"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP72=1;
   $$TMP72<arguments.length;
   ++$$TMP72){
      body[$$TMP72-1]=arguments[$$TMP72];
   }
   var $$TMP71;
$$TMP71=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP71;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP73;
   $$TMP73=(function(fst){
      var $$TMP74;
$$TMP74=$$root["transform-list"]((function(accum,v){
   var $$TMP75;
   var $$TMP76;
   if(fst){
      $$TMP76=(function(){
         var $$TMP77;
         fst=false;
         fst;
$$TMP77=$$root["cons"](v,accum);
return $$TMP77;
}
)();
}
else{
$$TMP76=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP75=$$TMP76;
return $$TMP75;
}
),lst);
return $$TMP74;
}
)(true);
return $$TMP73;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP78;
$$TMP78=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP78;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP79;
   $$TMP79=(function(idx){
      var $$TMP80;
$$TMP80=$$root["reduce"]((function(accum,v){
   var $$TMP81;
idx=$$root["+"](idx,1);
idx;
var $$TMP82;
if(f(arg,v)){
   $$TMP82=idx;
}
else{
   $$TMP82=accum;
}
$$TMP81=$$TMP82;
return $$TMP81;
}
),lst,-1);
return $$TMP80;
}
)(-1);
return $$TMP79;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP83;
   var $$TMP84;
if($$root["atom?"](x)){
$$TMP84=$$root["list"](x);
}
else{
$$TMP84=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP83=$$TMP84;
return $$TMP83;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP85;
   $$TMP85=(function(idx){
      var $$TMP86;
$$TMP86=$$root["transform-list"]((function(accum,v){
   var $$TMP87;
idx=$$root["+"](idx,1);
$$TMP87=$$root["cons"](f(v,idx),accum);
return $$TMP87;
}
),lst);
return $$TMP86;
}
)(-1);
return $$TMP85;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP89=1;
   $$TMP89<arguments.length;
   ++$$TMP89){
      body[$$TMP89-1]=arguments[$$TMP89];
   }
   var $$TMP88;
$$TMP88=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP88;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP90;
   var $$TMP91;
if($$root["null?"](lst)){
   $$TMP91=[];
}
else{
$$TMP91=$$root["reverse"]((function(recur){
   var $$TMP92;
   recur=(function(accum,part,rem,counter){
      var $$TMP93;
      var $$TMP94;
if($$root["null?"](rem)){
$$TMP94=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP95;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP95=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP95=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP94=$$TMP95;
}
$$TMP93=$$TMP94;
return $$TMP93;
}
);
recur;
$$TMP92=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP92;
}
)([]));
}
$$TMP90=$$TMP91;
return $$TMP90;
}
);
$$root["partition"];
$$root["method"]=(function(args){
   var body=Array(arguments.length-1);
   for(var $$TMP97=1;
   $$TMP97<arguments.length;
   ++$$TMP97){
      body[$$TMP97-1]=arguments[$$TMP97];
   }
   var $$TMP96;
$$TMP96=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP96;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP99=3;
   $$TMP99<arguments.length;
   ++$$TMP99){
      body[$$TMP99-3]=arguments[$$TMP99];
   }
   var $$TMP98;
$$TMP98=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP98;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP102=1;
   $$TMP102<arguments.length;
   ++$$TMP102){
      args[$$TMP102-1]=arguments[$$TMP102];
   }
   var $$TMP100;
   $$TMP100=(function(instance){
      var $$TMP101;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP101=instance;
return $$TMP101;
}
)($$root["object"](proto));
return $$TMP100;
}
);
$$root["make-instance"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP104=2;
   $$TMP104<arguments.length;
   ++$$TMP104){
      args[$$TMP104-2]=arguments[$$TMP104];
   }
   var $$TMP103;
$$TMP103=$$root["apply-method"]($$root["geti"](obj,name),obj,args);
return $$TMP103;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP105;
   var $$TMP106;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP106=obj__MINUSname;
}
else{
   var $$TMP107;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP107=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP107=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP106=$$TMP107;
}
$$TMP105=$$TMP106;
return $$TMP105;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP109=1;
   $$TMP109<arguments.length;
   ++$$TMP109){
      fields[$$TMP109-1]=arguments[$$TMP109];
   }
   var $$TMP108;
$$TMP108=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP108;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP110;
   var $$TMP111;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP111=obj__MINUSname;
}
else{
$$TMP111=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP110=$$TMP111;
return $$TMP110;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP113=1;
   $$TMP113<arguments.length;
   ++$$TMP113){
      fields[$$TMP113-1]=arguments[$$TMP113];
   }
   var $$TMP112;
$$TMP112=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP112;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP114;
$$TMP114=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP114;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP115;
   var $$TMP116;
if($$root["null?"](a)){
$$TMP116=$$root["null?"](b);
}
else{
   var $$TMP117;
if($$root["symbol?"](a)){
   var $$TMP118;
if($$root["symbol?"](b)){
   var $$TMP119;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP119=true;
}
else{
   $$TMP119=false;
}
$$TMP118=$$TMP119;
}
else{
   $$TMP118=false;
}
$$TMP117=$$TMP118;
}
else{
   var $$TMP120;
if($$root["atom?"](a)){
$$TMP120=$$root["="](a,b);
}
else{
   var $$TMP121;
if($$root["list?"](a)){
   var $$TMP122;
if($$root["list?"](b)){
   var $$TMP123;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP124;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP124=true;
}
else{
   $$TMP124=false;
}
$$TMP123=$$TMP124;
}
else{
   $$TMP123=false;
}
$$TMP122=$$TMP123;
}
else{
   $$TMP122=false;
}
$$TMP121=$$TMP122;
}
else{
   $$TMP121=undefined;
}
$$TMP120=$$TMP121;
}
$$TMP117=$$TMP120;
}
$$TMP116=$$TMP117;
}
$$TMP115=$$TMP116;
return $$TMP115;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP125;
   $$TMP125=(function(res){
      var $$TMP131;
$$TMP131=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP131;
}
)((function(recur){
   var $$TMP126;
   recur=(function(l1,l2){
      var $$TMP127;
      var $$TMP128;
      if((function(c){
         var $$TMP129;
         var $$TMP130;
         if(c){
            $$TMP130=c;
         }
         else{
$$TMP130=p($$root["car"](l2));
}
$$TMP129=$$TMP130;
return $$TMP129;
}
)($$root["null?"](l2))){
$$TMP128=$$root["list"](l1,l2);
}
else{
$$TMP128=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP127=$$TMP128;
return $$TMP127;
}
);
recur;
$$TMP126=recur([],lst);
return $$TMP126;
}
)([]));
return $$TMP125;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP132;
   var $$TMP133;
if($$root["reduce"]((function(accum,v){
   var $$TMP134;
   var $$TMP135;
   if(accum){
      $$TMP135=accum;
   }
   else{
      $$TMP135=v;
   }
   $$TMP134=$$TMP135;
   return $$TMP134;
}
),lst,false)){
   $$TMP133=true;
}
else{
   $$TMP133=false;
}
$$TMP132=$$TMP133;
return $$TMP132;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP136;
$$TMP136=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP137;
   var $$TMP138;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP139;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP139=true;
}
else{
   $$TMP139=false;
}
$$TMP138=$$TMP139;
}
else{
   $$TMP138=false;
}
$$TMP137=$$TMP138;
return $$TMP137;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP136;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP140;
   $$TMP140=(function(binding__MINUSnames){
      var $$TMP141;
      $$TMP141=(function(divs){
         var $$TMP143;
         var $$TMP144;
if($$root["null?"]($$root["second"](divs))){
$$TMP144=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP144=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP143=$$TMP144;
return $$TMP143;
}
)($$root["split"]((function(pair){
   var $$TMP142;
$$TMP142=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP142;
}
),binding__MINUSpairs));
return $$TMP141;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP140;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP146=1;
   $$TMP146<arguments.length;
   ++$$TMP146){
      body[$$TMP146-1]=arguments[$$TMP146];
   }
   var $$TMP145;
$$TMP145=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP145;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP147;
   $$TMP147=(function(x){
      var $$TMP148;
$$TMP148=$$root["not"](f(x));
return $$TMP148;
}
);
return $$TMP147;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP149;
   $$TMP149=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP151=0;
      $$TMP151<arguments.length;
      ++$$TMP151){
         args[$$TMP151-0]=arguments[$$TMP151];
      }
      var $$TMP150;
$$TMP150=f1($$root["apply"](f2,args));
return $$TMP150;
}
);
return $$TMP149;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP155=1;
   $$TMP155<arguments.length;
   ++$$TMP155){
      args1[$$TMP155-1]=arguments[$$TMP155];
   }
   var $$TMP152;
   $$TMP152=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP154=0;
      $$TMP154<arguments.length;
      ++$$TMP154){
         args2[$$TMP154-0]=arguments[$$TMP154];
      }
      var $$TMP153;
$$TMP153=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP153;
}
);
return $$TMP152;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP159=2;
   $$TMP159<arguments.length;
   ++$$TMP159){
      args1[$$TMP159-2]=arguments[$$TMP159];
   }
   var $$TMP156;
   $$TMP156=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP158=0;
      $$TMP158<arguments.length;
      ++$$TMP158){
         args2[$$TMP158-0]=arguments[$$TMP158];
      }
      var $$TMP157;
$$TMP157=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP157;
}
);
return $$TMP156;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP163=0;
   $$TMP163<arguments.length;
   ++$$TMP163){
      args[$$TMP163-0]=arguments[$$TMP163];
   }
   var $$TMP160;
   $$TMP160=(function(rx){
      var $$TMP161;
$$TMP161=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP162;
$$TMP162=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP162;
}
));
return $$TMP161;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP160;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP170=1;
   $$TMP170<arguments.length;
   ++$$TMP170){
      pairs[$$TMP170-1]=arguments[$$TMP170];
   }
   var $$TMP164;
   $$TMP164=(function(e__MINUSname,def__MINUSidx){
      var $$TMP165;
      var $$TMP166;
if($$root["="](def__MINUSidx,-1)){
$$TMP166=$$root.list(((new $$root.Symbol("error")) ),("Fell out of case!" ));
}
else{
$$TMP166=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP165=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP167;
$$TMP167=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP168;
$$TMP168=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP168;
}
),$$root["filter"]((function(pair){
   var $$TMP169;
$$TMP169=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP169;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP167;
}
)($$TMP166,$$root["partition"](2,pairs));
return $$TMP165;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP164;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP171;
   $$TMP171=(function(expr__MINUSname){
      var $$TMP172;
$$TMP172=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP173;
   var $$TMP174;
if($$root["symbol?"](v)){
   var $$TMP175;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP175=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP176;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP176=[];
}
else{
$$TMP176=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP175=$$TMP176;
}
$$TMP174=$$TMP175;
}
else{
$$TMP174=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP173=$$TMP174;
return $$TMP173;
}
),structure)));
return $$TMP172;
}
)($$root["gensym"]());
return $$TMP171;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP179=2;
   $$TMP179<arguments.length;
   ++$$TMP179){
      body[$$TMP179-2]=arguments[$$TMP179];
   }
   var $$TMP177;
   var $$TMP178;
if($$root["symbol?"](structure)){
$$TMP178=$$root["list"](structure,expr);
}
else{
$$TMP178=$$root["destruct-helper"](structure,expr);
}
$$TMP177=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP178),body);
return $$TMP177;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP180;
   var $$TMP181;
if($$root["list?"](expr)){
   var $$TMP182;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP182=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP182=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP181=$$TMP182;
}
else{
   $$TMP181=expr;
}
$$TMP180=$$TMP181;
return $$TMP180;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP183;
   var $$TMP184;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP184=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP185;
   var $$TMP186;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP187;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP187=true;
}
else{
   $$TMP187=false;
}
$$TMP186=$$TMP187;
}
else{
   $$TMP186=false;
}
if($$TMP186){
$$TMP185=$$root["list?"](expr);
}
else{
   var $$TMP188;
   if(true){
      var $$TMP189;
      var $$TMP190;
if($$root["list?"](expr)){
   var $$TMP191;
if($$root["not"]($$root["null?"](expr))){
   $$TMP191=true;
}
else{
   $$TMP191=false;
}
$$TMP190=$$TMP191;
}
else{
   $$TMP190=false;
}
if($$TMP190){
   var $$TMP192;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP193;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP193=true;
}
else{
   $$TMP193=false;
}
$$TMP192=$$TMP193;
}
else{
   $$TMP192=false;
}
$$TMP189=$$TMP192;
}
else{
   $$TMP189=false;
}
$$TMP188=$$TMP189;
}
else{
   $$TMP188=undefined;
}
$$TMP185=$$TMP188;
}
$$TMP184=$$TMP185;
}
$$TMP183=$$TMP184;
return $$TMP183;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP194;
   var $$TMP195;
if($$root["null?"](patt)){
$$TMP195=$$root["null?"](expr);
}
else{
   var $$TMP196;
if($$root["list?"](patt)){
$$TMP196=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP197;
if($$root["symbol?"](patt)){
   $$TMP197=true;
}
else{
   var $$TMP198;
   if(true){
$$TMP198=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP198=undefined;
}
$$TMP197=$$TMP198;
}
$$TMP196=$$TMP197;
}
$$TMP195=$$TMP196;
}
$$TMP194=$$TMP195;
return $$TMP194;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP199;
   var $$TMP200;
   var $$TMP201;
if($$root["list?"](patt)){
   var $$TMP202;
if($$root["not"]($$root["null?"](patt))){
   $$TMP202=true;
}
else{
   $$TMP202=false;
}
$$TMP201=$$TMP202;
}
else{
   $$TMP201=false;
}
if($$TMP201){
   var $$TMP203;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP203=(new $$root.Symbol("_"));
}
else{
$$TMP203=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP200=$$TMP203;
}
else{
   $$TMP200=patt;
}
$$TMP199=$$TMP200;
return $$TMP199;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP207=1;
   $$TMP207<arguments.length;
   ++$$TMP207){
      pairs[$$TMP207-1]=arguments[$$TMP207];
   }
   var $$TMP204;
   $$TMP204=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP205;
$$TMP205=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP206;
$$TMP206=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP206;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP205;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP204;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP208;
   $$TMP208=(function(__GS1){
      var $$TMP209;
      var $$TMP210;
if($$root["matches?"](__GS1,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("geti")) )) ),((new $$root.Symbol("obj")) ),((new $$root.Symbol("field")) )))){
   $$TMP210=(function(__GS2){
      var $$TMP211;
      $$TMP211=(function(obj,field){
         var $$TMP212;
$$TMP212=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP212;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP211;
}
)(__GS1);
}
else{
   var $$TMP213;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP213=(function(any){
      var $$TMP214;
      var $$TMP215;
if($$root["symbol?"](any)){
$$TMP215=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP215=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP214=$$TMP215;
return $$TMP214;
}
)(__GS1);
}
else{
   var $$TMP216;
   if(true){
$$TMP216=$$root["error"]("Fell out of case!");
}
else{
   $$TMP216=undefined;
}
$$TMP213=$$TMP216;
}
$$TMP210=$$TMP213;
}
$$TMP209=$$TMP210;
return $$TMP209;
}
)($$root["macroexpand"](place));
return $$TMP208;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP217;
   amt=(function(c){
      var $$TMP218;
      var $$TMP219;
      if(c){
         $$TMP219=c;
      }
      else{
         $$TMP219=1;
      }
      $$TMP218=$$TMP219;
      return $$TMP218;
   }
   )(amt);
   amt;
$$TMP217=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP217;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP220;
   amt=(function(c){
      var $$TMP221;
      var $$TMP222;
      if(c){
         $$TMP222=c;
      }
      else{
         $$TMP222=1;
      }
      $$TMP221=$$TMP222;
      return $$TMP221;
   }
   )(amt);
   amt;
$$TMP220=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP220;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP223;
$$TMP223=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP223;
}
);
$$root["push"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP226=1;
   $$TMP226<arguments.length;
   ++$$TMP226){
      forms[$$TMP226-1]=arguments[$$TMP226];
   }
   var $$TMP224;
   var $$TMP225;
if($$root["null?"](forms)){
   $$TMP225=x;
}
else{
$$TMP225=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP224=$$TMP225;
return $$TMP224;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP232=1;
   $$TMP232<arguments.length;
   ++$$TMP232){
      body[$$TMP232-1]=arguments[$$TMP232];
   }
   var $$TMP227;
   $$TMP227=(function(binding__MINUSname){
      var $$TMP228;
$$TMP228=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP229;
   $$TMP229=(function(__GS3){
      var $$TMP230;
      $$TMP230=(function(f,args){
         var $$TMP231;
$$TMP231=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP231;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP230;
}
)(v);
return $$TMP229;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP228;
}
)($$root["gensym"]());
return $$TMP227;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP234=1;
   $$TMP234<arguments.length;
   ++$$TMP234){
      body[$$TMP234-1]=arguments[$$TMP234];
   }
   var $$TMP233;
$$TMP233=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP233;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP235;
$$TMP235=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP235;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP236;
   step=(function(c){
      var $$TMP237;
      var $$TMP238;
      if(c){
         $$TMP238=c;
      }
      else{
         $$TMP238=1;
      }
      $$TMP237=$$TMP238;
      return $$TMP237;
   }
   )(step);
   step;
   $$TMP236=(function(data){
      var $$TMP239;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP239=data;
return $$TMP239;
}
)($$root["object"]([]));
return $$TMP236;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP240;
   $$TMP240=(function(len__MINUSname,data){
      var $$TMP241;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP241=data;
return $$TMP241;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP240;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP242;
   $$TMP242=(function(lst__MINUSname,data){
      var $$TMP243;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP243=data;
return $$TMP243;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP242;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP244;
   $$TMP244=(function(__GS4){
      var $$TMP245;
      $$TMP245=(function(binding__MINUSname,__GS5){
         var $$TMP246;
         $$TMP246=(function(func__MINUSname,args){
            var $$TMP247;
$$TMP247=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP247;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP246;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP245;
}
)(form);
return $$TMP244;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP248;
   $$TMP248=(function(data){
      var $$TMP249;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP249=data;
return $$TMP249;
}
)($$root["object"]([]));
return $$TMP248;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP250;
   $$TMP250=(function(data){
      var $$TMP251;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP251=data;
return $$TMP251;
}
)($$root["object"]([]));
return $$TMP250;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP252;
   $$TMP252=(function(data){
      var $$TMP253;
      (function(__GS6){
         var $$TMP254;
         $$TMP254=(function(binding__MINUSname,body){
            var $$TMP255;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP255=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP255;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP254;
}
)(form);
$$TMP253=data;
return $$TMP253;
}
)($$root["object"]([]));
return $$TMP252;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP256;
   $$TMP256=(function(data){
      var $$TMP257;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP257=data;
return $$TMP257;
}
)($$root["object"]([]));
return $$TMP256;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP258;
   $$TMP258=(function(data,accum__MINUSname){
      var $$TMP259;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP259=data;
return $$TMP259;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP258;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP260;
$$TMP260=$$root["filter"]((function(x){
   var $$TMP261;
$$TMP261=$$root["not="](x,undefined);
return $$TMP261;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP260;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP277=0;
   $$TMP277<arguments.length;
   ++$$TMP277){
      forms[$$TMP277-0]=arguments[$$TMP277];
   }
   var $$TMP262;
   $$TMP262=(function(res__MINUSname){
      var $$TMP263;
      $$TMP263=(function(all){
         var $$TMP273;
         $$TMP273=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP275;
            var $$TMP276;
if($$root["null?"](final__MINUSactions)){
$$TMP276=$$root["list"](res__MINUSname);
}
else{
   $$TMP276=final__MINUSactions;
}
$$TMP275=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP276)))))));
return $$TMP275;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP274;
$$TMP274=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP274;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP273;
}
)($$root["map"]((function(form){
   var $$TMP264;
   $$TMP264=(function(__GS7){
      var $$TMP265;
      var $$TMP266;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP266=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP267;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP267=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP268;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP268=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP269;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP269=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP270;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP270=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP271;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP271=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP272;
   if(true){
$$TMP272=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP272=undefined;
}
$$TMP271=$$TMP272;
}
$$TMP270=$$TMP271;
}
$$TMP269=$$TMP270;
}
$$TMP268=$$TMP269;
}
$$TMP267=$$TMP268;
}
$$TMP266=$$TMP267;
}
$$TMP265=$$TMP266;
return $$TMP265;
}
)($$root["car"](form));
return $$TMP264;
}
),forms));
return $$TMP263;
}
)($$root["gensym"]());
return $$TMP262;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP278;
   $$TMP278=(function(self){
      var $$TMP279;
      $$TMP279=(function(__GS8){
         var $$TMP280;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP280=__GS8;
return $$TMP280;
}
)(self);
return $$TMP279;
}
)(this);
return $$TMP278;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP281;
   $$TMP281=(function(self){
      var $$TMP282;
$$TMP282=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP282;
}
)(this);
return $$TMP281;
}
));
$$root["lit"]=(function(s){
   var $$TMP283;
$$TMP283=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP283;
}
);
$$root["lit"];
$$root["space-patt"]=$$root["regex"]("^\\s+");
$$root["space-patt"];
$$root["number-patt"]=$$root["regex"]("^[+\\-]?\\d+(\\.\\d*)?|^[+\\-]?\\.\\d+");
$$root["number-patt"];
$$root["sym-patt"]=$$root["regex"]("^[_.<>?+\\-=!@#$%\\^&*/a-zA-Z][_.<>?+\\-=!@#$%\\^&*/a-zA-Z0-9]*");
$$root["sym-patt"];
$$root["str-patt"]=$$root["regex"]("^\"(?:(?:\\\\.)|[^\"])*\"");
$$root["str-patt"];
$$root["token-table"]=$$root["list"]($$root["list"]($$root["space-patt"],-1),$$root["list"]($$root["regex"]("^;[^\\n]*"),-1),$$root["list"]($$root["number-patt"],(new $$root.Symbol("num-tok"))),$$root["list"]($$root["str-patt"],(new $$root.Symbol("str-tok"))),$$root["list"]($$root["lit"]("("),(new $$root.Symbol("list-open-tok"))),$$root["list"]($$root["lit"](")"),(new $$root.Symbol("list-close-tok"))),$$root["list"]($$root["lit"]("'"),(new $$root.Symbol("quote-tok"))),$$root["list"]($$root["lit"]("`"),(new $$root.Symbol("backquote-tok"))),$$root["list"]($$root["lit"]("~@"),(new $$root.Symbol("splice-tok"))),$$root["list"]($$root["lit"]("~"),(new $$root.Symbol("unquote-tok"))),$$root["list"]($$root["sym-patt"],(new $$root.Symbol("sym-tok"))));
$$root["token-table"];
$$root["keywords"]=$$root["hashmap"]();
$$root["keywords"];
$$root["seti!"]($$root["keywords"],"true",(new $$root.Symbol("true-tok")));
$$root["seti!"]($$root["keywords"],"false",(new $$root.Symbol("false-tok")));
$$root["seti!"]($$root["keywords"],"undefined",(new $$root.Symbol("undef-tok")));
$$root["seti!"]($$root["keywords"],"null",(new $$root.Symbol("null-tok")));
$$root["tokenize"]=(function(src){
   var $$TMP284;
   $$TMP284=(function(toks,pos,s){
      var $$TMP285;
      (function(recur){
         var $$TMP286;
         recur=(function(){
            var $$TMP287;
            var $$TMP288;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP288=(function(){
      var $$TMP289;
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP290;
         $$TMP290=(function(recur){
            var $$TMP291;
            recur=(function(){
               var $$TMP292;
               var $$TMP293;
               var $$TMP294;
if($$root["<"](i,__GS10)){
   var $$TMP295;
if($$root["not"]($$root["null?"](__GS11))){
   var $$TMP296;
if($$root["not"](res)){
   $$TMP296=true;
}
else{
   $$TMP296=false;
}
$$TMP295=$$TMP296;
}
else{
   $$TMP295=false;
}
$$TMP294=$$TMP295;
}
else{
   $$TMP294=false;
}
if($$TMP294){
   $$TMP293=(function(){
      var $$TMP297;
entry=$$root["car"](__GS11);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP297=recur();
return $$TMP297;
}
)();
}
else{
   $$TMP293=(function(){
      var $$TMP298;
      _=__GS9;
      _;
      var $$TMP299;
      if(res){
         $$TMP299=(function(){
            var $$TMP300;
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP301;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP301=(function(){
      var $$TMP302;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP303;
   var $$TMP304;
   if(c){
      $$TMP304=c;
   }
   else{
$$TMP304=$$root["second"](entry);
}
$$TMP303=$$TMP304;
return $$TMP303;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP302=toks;
return $$TMP302;
}
)();
}
else{
   $$TMP301=undefined;
}
$$TMP301;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP300=pos;
return $$TMP300;
}
)();
}
else{
$$TMP299=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP299;
$$TMP298=__GS9;
return $$TMP298;
}
)();
}
$$TMP292=$$TMP293;
return $$TMP292;
}
);
recur;
$$TMP291=recur();
return $$TMP291;
}
)([]);
return $$TMP290;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP289=recur();
return $$TMP289;
}
)();
}
else{
   $$TMP288=undefined;
}
$$TMP287=$$TMP288;
return $$TMP287;
}
);
recur;
$$TMP286=recur();
return $$TMP286;
}
)([]);
$$TMP285=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP285;
}
)([],0,src);
return $$TMP284;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP305;
   $$TMP305=(function(self){
      var $$TMP306;
$$TMP306=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP306;
}
)(this);
return $$TMP305;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP307;
   $$TMP307=(function(self){
      var $$TMP308;
$$TMP308=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP308;
}
)(this);
return $$TMP307;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP309;
   $$TMP309=(function(self){
      var $$TMP310;
      $$TMP310=(function(curr){
         var $$TMP311;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP311=curr;
return $$TMP311;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP310;
}
)(this);
return $$TMP309;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP312;
$$TMP312=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP312;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP313;
$$TMP313=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP313;
}
);
$$root["unescape-str"];
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP319=1;
   $$TMP319<arguments.length;
   ++$$TMP319){
      kvs[$$TMP319-1]=arguments[$$TMP319];
   }
   var $$TMP314;
   $$TMP314=(function(recur){
      var $$TMP315;
      recur=(function(kvs){
         var $$TMP316;
         var $$TMP317;
if($$root["null?"](kvs)){
   $$TMP317=obj;
}
else{
   $$TMP317=(function(){
      var $$TMP318;
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP318=recur($$root["cdr"]($$root["cdr"](kvs)));
return $$TMP318;
}
)();
}
$$TMP316=$$TMP317;
return $$TMP316;
}
);
recur;
$$TMP315=recur(kvs);
return $$TMP315;
}
)([]);
return $$TMP314;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP325=2;
   $$TMP325<arguments.length;
   ++$$TMP325){
      kvs[$$TMP325-2]=arguments[$$TMP325];
   }
   var $$TMP320;
   (function(recur){
      var $$TMP321;
      recur=(function(obj,path,kvs){
         var $$TMP322;
         var $$TMP323;
if($$root["null?"](path)){
$$TMP323=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP324;
if($$root["in"](obj,$$root["car"](path))){
$$TMP324=$$root["call-method-by-name"](obj,(new $$root.Symbol("car")),path);
}
else{
$$TMP324=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP323=recur($$TMP324,$$root["cdr"](path),kvs);
}
$$TMP322=$$TMP323;
return $$TMP322;
}
);
recur;
$$TMP321=recur(obj,path,kvs);
return $$TMP321;
}
)([]);
$$TMP320=obj;
return $$TMP320;
}
);
$$root["deep-assoc!"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP326;
   $$TMP326=(function(self){
      var $$TMP327;
      $$TMP327=(function(tok){
         var $$TMP328;
         $$TMP328=(function(__GS12){
            var $$TMP329;
            var $$TMP330;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
$$TMP330=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP331;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP331=true;
}
else{
   var $$TMP332;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP332=false;
}
else{
   var $$TMP333;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP333=[];
}
else{
   var $$TMP334;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP334=undefined;
}
else{
   var $$TMP335;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP335=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP336;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP336=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP337;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP337=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP338;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
$$TMP338=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP339;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP339=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP340;
   if(true){
$$TMP340=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP340=undefined;
}
$$TMP339=$$TMP340;
}
$$TMP338=$$TMP339;
}
$$TMP337=$$TMP338;
}
$$TMP336=$$TMP337;
}
$$TMP335=$$TMP336;
}
$$TMP334=$$TMP335;
}
$$TMP333=$$TMP334;
}
$$TMP332=$$TMP333;
}
$$TMP331=$$TMP332;
}
$$TMP330=$$TMP331;
}
$$TMP329=$$TMP330;
return $$TMP329;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP328;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP327;
}
)(this);
return $$TMP326;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP341;
   $$TMP341=(function(self){
      var $$TMP342;
      $$TMP342=(function(start__MINUSpos){
         var $$TMP343;
         $$TMP343=(function(__GS13,__GS14,lst){
            var $$TMP344;
            $$TMP344=(function(recur){
               var $$TMP345;
               recur=(function(){
                  var $$TMP346;
                  var $$TMP347;
                  var $$TMP348;
                  var $$TMP349;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP350;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP350=true;
}
else{
   $$TMP350=false;
}
$$TMP349=$$TMP350;
}
else{
   $$TMP349=false;
}
if($$TMP349){
   $$TMP348=true;
}
else{
   $$TMP348=false;
}
if($$TMP348){
   $$TMP347=(function(){
      var $$TMP351;
__GS14=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS14);
__GS13=__GS14;
__GS13;
$$TMP351=recur();
return $$TMP351;
}
)();
}
else{
   $$TMP347=(function(){
      var $$TMP352;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP353;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP353=lst;
}
else{
$$TMP353=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP353;
$$TMP352=__GS13;
return $$TMP352;
}
)();
}
$$TMP346=$$TMP347;
return $$TMP346;
}
);
recur;
$$TMP345=recur();
return $$TMP345;
}
)([]);
return $$TMP344;
}
)(undefined,[],undefined);
return $$TMP343;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("pos"))));
return $$TMP342;
}
)(this);
return $$TMP341;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP354;
   $$TMP354=(function(self){
      var $$TMP355;
      $$TMP355=(function(__GS15,__GS16,lst){
         var $$TMP356;
         $$TMP356=(function(recur){
            var $$TMP357;
            recur=(function(){
               var $$TMP358;
               var $$TMP359;
               var $$TMP360;
               var $$TMP361;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP362;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP362=true;
}
else{
   $$TMP362=false;
}
$$TMP361=$$TMP362;
}
else{
   $$TMP361=false;
}
if($$TMP361){
   $$TMP360=true;
}
else{
   $$TMP360=false;
}
if($$TMP360){
   $$TMP359=(function(){
      var $$TMP363;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP364;
   var $$TMP365;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP365=(function(){
      var $$TMP366;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP366=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
return $$TMP366;
}
)();
}
else{
   var $$TMP367;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP367=(function(){
      var $$TMP368;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP368=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
return $$TMP368;
}
)();
}
else{
   var $$TMP369;
   if(true){
$$TMP369=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP369=undefined;
}
$$TMP367=$$TMP369;
}
$$TMP365=$$TMP367;
}
$$TMP364=$$TMP365;
return $$TMP364;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP363=recur();
return $$TMP363;
}
)();
}
else{
   $$TMP359=(function(){
      var $$TMP370;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP371;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP371=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP371=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP371;
$$TMP370=__GS15;
return $$TMP370;
}
)();
}
$$TMP358=$$TMP359;
return $$TMP358;
}
);
recur;
$$TMP357=recur();
return $$TMP357;
}
)([]);
return $$TMP356;
}
)(undefined,[],undefined);
return $$TMP355;
}
)(this);
return $$TMP354;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP372;
   $$TMP372=(function(self){
      var $$TMP373;
      var $$TMP374;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP374=(function(){
      var $$TMP375;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP375=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
return $$TMP375;
}
)();
}
else{
$$TMP374=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP373=$$TMP374;
return $$TMP373;
}
)(this);
return $$TMP372;
}
));
$$root["parse"]=(function(toks){
   var $$TMP376;
   $$TMP376=(function(p){
      var $$TMP377;
      $$TMP377=(function(__GS18,__GS19){
         var $$TMP378;
         $$TMP378=(function(recur){
            var $$TMP379;
            recur=(function(){
               var $$TMP380;
               var $$TMP381;
               var $$TMP382;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP382=true;
}
else{
   $$TMP382=false;
}
if($$TMP382){
   $$TMP381=(function(){
      var $$TMP383;
__GS19=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS19);
__GS18=__GS19;
__GS18;
$$TMP383=recur();
return $$TMP383;
}
)();
}
else{
   $$TMP381=(function(){
      var $$TMP384;
__GS18=$$root["reverse"](__GS19);
$$TMP384=__GS18;
return $$TMP384;
}
)();
}
$$TMP380=$$TMP381;
return $$TMP380;
}
);
recur;
$$TMP379=recur();
return $$TMP379;
}
)([]);
return $$TMP378;
}
)(undefined,[]);
return $$TMP377;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP376;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP385;
$$root["seti!"](__GS20,".","__DOT");
$$root["seti!"](__GS20,"<","__LT");
$$root["seti!"](__GS20,">","__GT");
$$root["seti!"](__GS20,"?","__QM");
$$root["seti!"](__GS20,"+","__PLUS");
$$root["seti!"](__GS20,"-","__MINUS");
$$root["seti!"](__GS20,"=","__EQL");
$$root["seti!"](__GS20,"!","__BANG");
$$root["seti!"](__GS20,"@","__AT");
$$root["seti!"](__GS20,"#","__HASH");
$$root["seti!"](__GS20,"$","__USD");
$$root["seti!"](__GS20,"%","__PCNT");
$$root["seti!"](__GS20,"^","__CARET");
$$root["seti!"](__GS20,"&","__AMP");
$$root["seti!"](__GS20,"*","__STAR");
$$root["seti!"](__GS20,"/","__SLASH");
$$TMP385=__GS20;
return $$TMP385;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP386;
$$TMP386=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP386;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP387;$$TMP387=$$root["geti"]($$root["mangling-table"],x);return $$TMP387;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP388;$$TMP388=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);return $$TMP388;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){var $$TMP389;$$TMP389=(function(self){var $$TMP390;$$TMP390=(function(__GS21){var $$TMP391;$$root["seti!"](__GS21,"root",root);$$root["seti!"](__GS21,"next-var-suffix",0);$$TMP391=__GS21;return $$TMP391;})(self);return $$TMP390;})(this);return $$TMP389;}));$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP392;$$TMP392=(function(self){var $$TMP393;$$TMP393=(function(out){var $$TMP394;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP394=out;return $$TMP394;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP393;})(this);return $$TMP392;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP395;var $$TMP396;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP396=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP396=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP395=$$TMP396;
return $$TMP395;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP397;
   $$TMP397=(function(self){
      var $$TMP398;
      var $$TMP399;
if($$root["="](x,true)){
$$TMP399=$$root["list"]("true","");
}
else{
   var $$TMP400;
if($$root["="](x,false)){
$$TMP400=$$root["list"]("false","");
}
else{
   var $$TMP401;
if($$root["null?"](x)){
$$TMP401=$$root["list"]("[]","");
}
else{
   var $$TMP402;
if($$root["="](x,undefined)){
$$TMP402=$$root["list"]("undefined","");
}
else{
   var $$TMP403;
if($$root["symbol?"](x)){
$$TMP403=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP404;
if($$root["string?"](x)){
$$TMP404=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP405;
   if(true){
$$TMP405=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP405=undefined;
}
$$TMP404=$$TMP405;
}
$$TMP403=$$TMP404;
}
$$TMP402=$$TMP403;
}
$$TMP401=$$TMP402;
}
$$TMP400=$$TMP401;
}
$$TMP399=$$TMP400;
}
$$TMP398=$$TMP399;
return $$TMP398;
}
)(this);
return $$TMP397;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP406;
   $$TMP406=(function(self){
      var $$TMP407;
      $$TMP407=(function(__GS22){
         var $$TMP408;
         $$TMP408=(function(fun,args){
            var $$TMP409;
            $$TMP409=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP410;
$$TMP410=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP410;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP409;
}
)($$root["nth"](0,__GS22),$$root["drop"](1,__GS22));
return $$TMP408;
}
)(lst);
return $$TMP407;
}
)(this);
return $$TMP406;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP411;
   $$TMP411=(function(self){
      var $$TMP412;
      $$TMP412=(function(__GS23){
         var $$TMP413;
         $$TMP413=(function(fun,args){
            var $$TMP414;
            $$TMP414=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP415;
$$TMP415=$$root["list"]($$root["format"]("(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP415;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP414;
}
)($$root["nth"](1,__GS23),$$root["drop"](2,__GS23));
return $$TMP413;
}
)(lst);
return $$TMP412;
}
)(this);
return $$TMP411;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP416;
   $$TMP416=(function(self){
      var $$TMP417;
      $$TMP417=(function(__GS24){
         var $$TMP418;
         $$TMP418=(function(method,obj,args){
            var $$TMP419;
            $$TMP419=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP420;
$$TMP420=$$root["list"]($$root["format"]("(%0)%1(%2)",$$root["first"](compiled__MINUSobj),method,$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSobj),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP420;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP419;
}
)($$root["nth"](0,__GS24),$$root["nth"](1,__GS24),$$root["drop"](2,__GS24));
return $$TMP418;
}
)(lst);
return $$TMP417;
}
)(this);
return $$TMP416;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP421;
   $$TMP421=(function(self){
      var $$TMP422;
      $$TMP422=(function(compiled__MINUSbody,reducer){
         var $$TMP424;
$$TMP424=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP424;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP423;
$$TMP423=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP423;
}
));
return $$TMP422;
}
)(this);
return $$TMP421;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP425;
$$TMP425=$$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP425;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP426;
   var $$TMP427;
if($$root["is-vararg?"](sym)){
$$TMP427=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP427=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP426=$$TMP427;
return $$TMP426;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP428;
$$TMP428=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP429;
$$TMP429=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
return $$TMP429;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP428;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP430;
   $$TMP430=(function(self){
      var $$TMP431;
      var $$TMP432;
if($$root["not"]($$root["null?"](args))){
   $$TMP432=(function(){
      var $$TMP433;
$$TMP433=$$root["last"](args);
return $$TMP433;
}
)();
}
else{
   $$TMP432=undefined;
}
$$TMP431=(function(last__MINUSarg){
   var $$TMP434;
   var $$TMP435;
   var $$TMP436;
   if(last__MINUSarg){
      var $$TMP437;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP437=true;
}
else{
   $$TMP437=false;
}
$$TMP436=$$TMP437;
}
else{
   $$TMP436=false;
}
if($$TMP436){
$$TMP435=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP435="";
}
$$TMP434=$$TMP435;
return $$TMP434;
}
)($$TMP432);
return $$TMP431;
}
)(this);
return $$TMP430;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP438;
   $$TMP438=(function(self){
      var $$TMP439;
      $$TMP439=(function(__GS25){
         var $$TMP440;
         $$TMP440=(function(__GS26){
            var $$TMP441;
            $$TMP441=(function(args,body){
               var $$TMP442;
               $$TMP442=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP444;
                  $$TMP444=(function(compiled__MINUSbody){
                     var $$TMP445;
$$TMP445=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP445;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP444;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP443;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP443=accum;
return $$TMP443;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP442;
}
)($$root["drop"](0,__GS26),$$root["drop"](2,__GS25));
return $$TMP441;
}
)($$root["nth"](1,__GS25));
return $$TMP440;
}
)(lst);
return $$TMP439;
}
)(this);
return $$TMP438;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP446;
   $$TMP446=(function(self){
      var $$TMP447;
      $$TMP447=(function(__GS27){
         var $$TMP448;
         $$TMP448=(function(c,t,f){
            var $$TMP449;
            $$TMP449=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP450;
$$TMP450=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP450;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP449;
}
)($$root["nth"](1,__GS27),$$root["nth"](2,__GS27),$$root["nth"](3,__GS27));
return $$TMP448;
}
)(lst);
return $$TMP447;
}
)(this);
return $$TMP446;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP451;
   $$TMP451=(function(self){
      var $$TMP452;
      var $$TMP453;
if($$root["symbol?"](x)){
$$TMP453=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
$$TMP453=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP452=$$TMP453;
return $$TMP452;
}
)(this);
return $$TMP451;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP454;
   $$TMP454=(function(self){
      var $$TMP455;
$$TMP455=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP455;
}
)(this);
return $$TMP454;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP456;
   $$TMP456=(function(self){
      var $$TMP457;
      var $$TMP458;
if($$root["atom?"](x)){
$$TMP458=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP458=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP457=$$TMP458;
return $$TMP457;
}
)(this);
return $$TMP456;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP459;
   $$TMP459=(function(self){
      var $$TMP460;
      $$TMP460=(function(__GS28){
         var $$TMP461;
         $$TMP461=(function(name,value){
            var $$TMP462;
            $$TMP462=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP463;
$$TMP463=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP463;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP462;
}
)($$root["nth"](1,__GS28),$$root["nth"](2,__GS28));
return $$TMP461;
}
)(lst);
return $$TMP460;
}
)(this);
return $$TMP459;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP464;
   $$TMP464=(function(self){
      var $$TMP465;
      $$TMP465=(function(__GS29){
         var $$TMP466;
         $$TMP466=(function(name,args){
            var $$TMP467;
            $$TMP467=(function(tmp){
               var $$TMP469;
$$TMP469=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP469;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP468;
$$TMP468=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP468;
}
),args))));
return $$TMP467;
}
)($$root["nth"](0,__GS29),$$root["drop"](1,__GS29));
return $$TMP466;
}
)(expr);
return $$TMP465;
}
)(this);
return $$TMP464;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP470;
   $$TMP470=(function(self){
      var $$TMP471;
      var $$TMP472;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP473;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP473=true;
}
else{
   $$TMP473=false;
}
$$TMP472=$$TMP473;
}
else{
   $$TMP472=false;
}
$$TMP471=$$TMP472;
return $$TMP471;
}
)(this);
return $$TMP470;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP474;
   $$TMP474=(function(self){
      var $$TMP475;
      var $$TMP476;
      var $$TMP477;
if($$root["list?"](expr)){
   var $$TMP478;
if($$root["not"]($$root["null?"](expr))){
   $$TMP478=true;
}
else{
   $$TMP478=false;
}
$$TMP477=$$TMP478;
}
else{
   $$TMP477=false;
}
if($$TMP477){
   $$TMP476=(function(first){
      var $$TMP479;
      var $$TMP480;
if($$root["symbol?"](first)){
   $$TMP480=(function(__GS30){
      var $$TMP481;
      var $$TMP482;
if($$root["equal?"](__GS30,(new $$root.Symbol("lambda")))){
$$TMP482=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP483;
if($$root["equal?"](__GS30,(new $$root.Symbol("new")))){
$$TMP483=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP484;
if($$root["equal?"](__GS30,(new $$root.Symbol("if")))){
$$TMP484=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP485;
if($$root["equal?"](__GS30,(new $$root.Symbol("quote")))){
$$TMP485=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP486;
if($$root["equal?"](__GS30,(new $$root.Symbol("setv!")))){
$$TMP486=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP487;
if($$root["equal?"](__GS30,(new $$root.Symbol("def")))){
$$TMP487=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP488;
   if(true){
      var $$TMP489;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP489=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP490;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP490=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP491;
   if(true){
$$TMP491=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP491=undefined;
}
$$TMP490=$$TMP491;
}
$$TMP489=$$TMP490;
}
$$TMP488=$$TMP489;
}
else{
   $$TMP488=undefined;
}
$$TMP487=$$TMP488;
}
$$TMP486=$$TMP487;
}
$$TMP485=$$TMP486;
}
$$TMP484=$$TMP485;
}
$$TMP483=$$TMP484;
}
$$TMP482=$$TMP483;
}
$$TMP481=$$TMP482;
return $$TMP481;
}
)(first);
}
else{
$$TMP480=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP479=$$TMP480;
return $$TMP479;
}
)($$root["car"](expr));
}
else{
$$TMP476=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP475=$$TMP476;
return $$TMP475;
}
)(this);
return $$TMP474;
}
));
$$root["VM"]=$$root["require"]("vm");
$$root["VM"];
$$root["Reflect"]=$$root["require"]("harmony-reflect");
$$root["Reflect"];
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["default-lexenv"]=(function(){
   var $$TMP492;
   $$TMP492=(function(__GS31){
      var $$TMP493;
$$root["seti!"](__GS31,"this",true);
$$TMP493=__GS31;
return $$TMP493;
}
)($$root["object"]());
return $$TMP492;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP494;
   $$TMP494=(function(self){
      var $$TMP495;
      $$TMP495=(function(root,sandbox){
         var $$TMP496;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP497;
$$TMP497=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP497;
}
));
$$TMP496=(function(__GS32){
   var $$TMP498;
$$root["seti!"](__GS32,"root",root);
$$root["seti!"](__GS32,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP498=__GS32;
return $$TMP498;
}
)(self);
return $$TMP496;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP495;
}
)(this);
return $$TMP494;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP499;
   $$TMP499=(function(self){
      var $$TMP500;
      $$TMP500=(function(tmp){
         var $$TMP501;
$$TMP501=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP501;
}
)($$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP500;
}
)(this);
return $$TMP499;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP502;
   $$TMP502=(function(self){
      var $$TMP503;
      $$TMP503=(function(forms){
         var $$TMP504;
         $$TMP504=(function(__GS33,__GS34,form){
            var $$TMP505;
            $$TMP505=(function(recur){
               var $$TMP506;
               recur=(function(){
                  var $$TMP507;
                  var $$TMP508;
                  var $$TMP509;
if($$root["not"]($$root["null?"](__GS34))){
   $$TMP509=true;
}
else{
   $$TMP509=false;
}
if($$TMP509){
   $$TMP508=(function(){
      var $$TMP510;
form=$$root["car"](__GS34);
form;
__GS33=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS33;
__GS34=$$root["cdr"](__GS34);
__GS34;
$$TMP510=recur();
return $$TMP510;
}
)();
}
else{
   $$TMP508=(function(){
      var $$TMP511;
      $$TMP511=__GS33;
      return $$TMP511;
   }
   )();
}
$$TMP507=$$TMP508;
return $$TMP507;
}
);
recur;
$$TMP506=recur();
return $$TMP506;
}
)([]);
return $$TMP505;
}
)(undefined,forms,[]);
return $$TMP504;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP503;
}
)(this);
return $$TMP502;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP512;
   $$TMP512=(function(self){
      var $$TMP513;
$$TMP513=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["str"]($$root["second"](compilation__MINUSresult),$$root["first"](compilation__MINUSresult)));
return $$TMP513;
}
)(this);
return $$TMP512;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP514;
   $$TMP514=(function(self){
      var $$TMP515;
      $$TMP515=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP516;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP517;
   $$TMP517=(function(r){
      var $$TMP518;
      var $$TMP519;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   $$TMP519=(function(){
      var $$TMP520;
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti"](r,(new $$root.Symbol("code"))));
r;
$$TMP520=$$root["seti!"](target,name,r);
return $$TMP520;
}
)();
}
else{
   $$TMP519=undefined;
}
$$TMP519;
$$TMP518=r;
return $$TMP518;
}
)($$root["geti"](target,name));
return $$TMP517;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP521;
$$TMP521=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP521;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP522;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP522=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP522;
}
));
$$TMP516=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP516;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP515;
}
)(this);
return $$TMP514;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP523;
   $$TMP523=(function(self){
      var $$TMP524;
      $$TMP524=(function(lexenv){
         var $$TMP525;
         $$TMP525=(function(__GS35){
            var $$TMP526;
            var $$TMP527;
if($$root["matches?"](__GS35,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("def")) )) ),((new $$root.Symbol("name")) ),((new $$root.Symbol("val")) )))){
   $$TMP527=(function(__GS36){
      var $$TMP528;
      $$TMP528=(function(name,val){
         var $$TMP529;
         $$TMP529=(function(tmp){
            var $$TMP530;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP530=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP530;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP529;
}
)($$root["nth"](1,__GS36),$$root["nth"](2,__GS36));
return $$TMP528;
}
)(__GS35);
}
else{
   var $$TMP531;
if($$root["matches?"](__GS35,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("setmac!")) )) ),((new $$root.Symbol("name")) )))){
   $$TMP531=(function(__GS37){
      var $$TMP532;
      $$TMP532=(function(name){
         var $$TMP533;
         $$TMP533=(function(tmp){
            var $$TMP534;
$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
$$TMP534=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP534;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP533;
}
)($$root["nth"](1,__GS37));
return $$TMP532;
}
)(__GS35);
}
else{
   var $$TMP535;
if($$root["matches?"](__GS35,$$root.list(($$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("lambda")) )) ),($$root.list(((new $$root.Symbol("&args")) )) ),((new $$root.Symbol("&body")) )) )))){
   $$TMP535=(function(__GS38){
      var $$TMP536;
      $$TMP536=(function(__GS39){
         var $$TMP537;
         $$TMP537=(function(__GS40){
            var $$TMP538;
            $$TMP538=(function(args,body){
               var $$TMP539;
$$TMP539=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP539;
}
)($$root["drop"](0,__GS40),$$root["drop"](2,__GS39));
return $$TMP538;
}
)($$root["nth"](1,__GS39));
return $$TMP537;
}
)($$root["nth"](0,__GS38));
return $$TMP536;
}
)(__GS35);
}
else{
   var $$TMP540;
if($$root["matches?"](__GS35,$$root.list(((new $$root.Symbol("name")) ),((new $$root.Symbol("&args")) )))){
   $$TMP540=(function(__GS41){
      var $$TMP541;
      $$TMP541=(function(name,args){
         var $$TMP542;
         var $$TMP543;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP543=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP543=(function(tmp){
      var $$TMP544;
$$TMP544=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP544;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP542=$$TMP543;
return $$TMP542;
}
)($$root["nth"](0,__GS41),$$root["drop"](1,__GS41));
return $$TMP541;
}
)(__GS35);
}
else{
   var $$TMP545;
if($$root["matches?"](__GS35,(new $$root.Symbol("any")))){
   $$TMP545=(function(any){
      var $$TMP546;
      $$TMP546=(function(tmp){
         var $$TMP547;
$$TMP547=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP547;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP546;
}
)(__GS35);
}
else{
   var $$TMP548;
   if(true){
$$TMP548=$$root["error"]("Fell out of case!");
}
else{
   $$TMP548=undefined;
}
$$TMP545=$$TMP548;
}
$$TMP540=$$TMP545;
}
$$TMP535=$$TMP540;
}
$$TMP531=$$TMP535;
}
$$TMP527=$$TMP531;
}
$$TMP526=$$TMP527;
return $$TMP526;
}
)(e);
return $$TMP525;
}
)($$root["default-lexenv"]());
return $$TMP524;
}
)(this);
return $$TMP523;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP549;
   $$TMP549=(function(self){
      var $$TMP550;
$$TMP550=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP550;
}
)(this);
return $$TMP549;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);