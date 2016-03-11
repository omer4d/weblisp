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
    "seti!"     :   function seti__BANG(obj, idx, val) { obj[idx] = val },
    
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
$$root["renderer"]=($$root["PIXI"]).autoDetectRenderer(480,800,(function(__GS8){
   var $$TMP278;
$$root["seti!"](__GS8,(new $$root.Symbol("backgroundColor")),1087931);
$$root["seti!"](__GS8,(new $$root.Symbol("resolution")),1);
$$TMP278=__GS8;
return $$TMP278;
}
)($$root["object"]()));
$$root["renderer"];
$$root["call-method-by-name"]($$root["geti"]($$root["get-document"](),(new $$root.Symbol("body"))),(new $$root.Symbol("appendChild")),$$root["geti"]($$root["renderer"],(new $$root.Symbol("view"))));
$$root["stage"]=(new ($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Container"))))());
$$root["stage"];
($$root["console"]).log($$root["stage"]);
$$root["texture"]=$$root["call-method-by-name"]($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Texture"))),(new $$root.Symbol("fromImage")),"res/char.png");
$$root["texture"];
$$root["sprite"]=(new ($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Sprite"))))($$root["texture"]));
$$root["sprite"];
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("anchor"))),(new $$root.Symbol("x")),0.5);
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("anchor"))),(new $$root.Symbol("y")),0.5);
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("position"))),(new $$root.Symbol("x")),200);
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("position"))),(new $$root.Symbol("y")),150);
($$root["stage"]).addChild($$root["sprite"]);
$$root["request-frame"]=(function(callback){
   var $$TMP279;
$$TMP279=$$root["call-method"]($$root["requestAnimationFrame"],$$root["get-window"](),callback);
return $$TMP279;
}
);
$$root["request-frame"];
$$root["animate"]=(function(){
   var $$TMP280;
$$root["seti!"]($$root["sprite"],(new $$root.Symbol("x")),$$root["+"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("x"))),2));
($$root["renderer"]).render($$root["stage"]);
$$TMP280=$$root["request-frame"]($$root["animate"]);
return $$TMP280;
}
);
$$root["animate"];
$$root["request-frame"]($$root["animate"]);
$$root["rgb->hex"]=(function(r,g,b){
   var $$TMP281;
$$TMP281=$$root["+"]($$root["shl"]($$root["*"](r,255),16),$$root["shl"]($$root["*"](g,255),8),$$root["*"](b,255));
return $$TMP281;
}
);
$$root["rgb->hex"];
$$root["random-int"]=(function(min,max){
   var $$TMP282;
$$TMP282=($$root["Math"]).floor($$root["+"](min,$$root["*"](($$root["Math"]).random(),$$root["-"](max,min))));
return $$TMP282;
}
);
$$root["random-int"];
$$root["defproto"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP285=1;
   $$TMP285<arguments.length;
   ++$$TMP285){
      fields[$$TMP285-1]=arguments[$$TMP285];
   }
   var $$TMP283;
$$TMP283=$$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("object"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](name),$$root["list"]($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("tag")) ))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("defmethod"))),$$root["list"]((new $$root.Symbol("init"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("self"))),fields)),$$root["map"]((function(field){
   var $$TMP284;
$$TMP284=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]((new $$root.Symbol("self"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP284;
}
),fields))));
return $$TMP283;
}
);
$$root["defproto"];
$$root["setmac!"]($$root["defproto"]);
$$root["bub-groups"]=$$root.list(((new $$root.Symbol("red")) ),((new $$root.Symbol("green")) ),((new $$root.Symbol("blue")) ),((new $$root.Symbol("cyan")) ),((new $$root.Symbol("magenta")) ),((new $$root.Symbol("yellow")) ));
$$root["bub-groups"];
$$root["*bubble*"]=$$root["object"]();
$$root["*bubble*"];
$$root["seti!"]($$root["*bubble*"],(new $$root.Symbol("tag")),(new $$root.Symbol("*bubble*")));
$$root["seti!"]($$root["*bubble*"],(new $$root.Symbol("init")),(function(group,graphic,x,y,vx,vy){
   var $$TMP286;
   $$TMP286=(function(self){
      var $$TMP287;
$$root["seti!"](self,(new $$root.Symbol("group")),group);
$$root["seti!"](self,(new $$root.Symbol("graphic")),graphic);
$$root["seti!"](self,(new $$root.Symbol("x")),x);
$$root["seti!"](self,(new $$root.Symbol("y")),y);
$$root["seti!"](self,(new $$root.Symbol("vx")),vx);
$$TMP287=$$root["seti!"](self,(new $$root.Symbol("vy")),vy);
return $$TMP287;
}
)(this);
return $$TMP286;
}
));
$$root["move"]=(function(bub,dt){
   var $$TMP288;
   $$TMP288=(function(__GS9){
      var $$TMP289;
__GS9=$$root["+"](__GS9,$$root["geti"](bub,(new $$root.Symbol("x"))));
__GS9;
$$root["int!"](__GS9,$$root["geti"](bub,(new $$root.Symbol("y"))),$$root["*"]($$root["geti"](bub,(new $$root.Symbol("vy"))),dt));
$$TMP289=__GS9;
return $$TMP289;
}
)(bub);
return $$TMP288;
}
);
$$root["move"];
$$root["bub-group->color"]=(function(g){
   var $$TMP290;
   $$TMP290=(function(__GS10){
      var $$TMP291;
      var $$TMP292;
if($$root["equal?"](__GS10,(new $$root.Symbol("red")))){
$$TMP292=$$root["rgb->hex"](1,0,0);
}
else{
   var $$TMP293;
if($$root["equal?"](__GS10,(new $$root.Symbol("green")))){
$$TMP293=$$root["rgb->hex"](0,1,0);
}
else{
   var $$TMP294;
if($$root["equal?"](__GS10,(new $$root.Symbol("blue")))){
$$TMP294=$$root["rgb->hex"](0,0,1);
}
else{
   var $$TMP295;
if($$root["equal?"](__GS10,(new $$root.Symbol("cyan")))){
$$TMP295=$$root["rgb->hex"](0,1,1);
}
else{
   var $$TMP296;
if($$root["equal?"](__GS10,(new $$root.Symbol("magenta")))){
$$TMP296=$$root["rgb->hex"](1,0,1);
}
else{
   var $$TMP297;
if($$root["equal?"](__GS10,(new $$root.Symbol("yellow")))){
$$TMP297=$$root["rgb->hex"](1,1,0);
}
else{
   var $$TMP298;
   if(true){
$$TMP298=$$root["error"]("Fell out of case!");
}
else{
   $$TMP298=undefined;
}
$$TMP297=$$TMP298;
}
$$TMP296=$$TMP297;
}
$$TMP295=$$TMP296;
}
$$TMP294=$$TMP295;
}
$$TMP293=$$TMP294;
}
$$TMP292=$$TMP293;
}
$$TMP291=$$TMP292;
return $$TMP291;
}
)(g);
return $$TMP290;
}
);
$$root["bub-group->color"];
$$root["make-random-bub"]=(function(x,y,rad){
   var $$TMP299;
   $$TMP299=(function(group){
      var $$TMP300;
$$TMP300=$$root["make-instance"]($$root["*bubble*"],group,(function(__GS11){
   var $$TMP301;
(__GS11).beginFill($$root["bub-group->color"](group));
(__GS11).drawCircle(0,0,rad);
(__GS11).endFill();
$$root["seti!"](__GS11,(new $$root.Symbol("x")),x);
$$root["seti!"](__GS11,(new $$root.Symbol("y")),y);
$$TMP301=__GS11;
return $$TMP301;
}
)((new ($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Graphics"))))())),x,y,0,0);
return $$TMP300;
}
)($$root["nth"]($$root["random-int"](0,$$root["count"]($$root["bub-groups"])),$$root["bub-groups"]));
return $$TMP299;
}
);
$$root["make-random-bub"];
$$root["*grid*"]=$$root["object"]();
$$root["*grid*"];
$$root["seti!"]($$root["*grid*"],(new $$root.Symbol("init")),(function(rows,cols){
   var $$TMP302;
   $$TMP302=(function(self){
      var $$TMP303;
      $$TMP303=(function(mat){
         var $$TMP304;
         (function(__GS12,i){
            var $$TMP305;
            $$TMP305=(function(recur){
               var $$TMP306;
               recur=(function(){
                  var $$TMP307;
                  var $$TMP308;
                  var $$TMP309;
if($$root["<"](i,rows)){
   $$TMP309=true;
}
else{
   $$TMP309=false;
}
if($$TMP309){
   $$TMP308=(function(){
      var $$TMP310;
$$root["seti!"](mat,i,$$root["array"](cols));
__GS12=(function(__GS13,j){
   var $$TMP311;
   $$TMP311=(function(recur){
      var $$TMP312;
      recur=(function(){
         var $$TMP313;
         var $$TMP314;
         var $$TMP315;
if($$root["<"](j,cols)){
   $$TMP315=true;
}
else{
   $$TMP315=false;
}
if($$TMP315){
   $$TMP314=(function(){
      var $$TMP316;
__GS13=$$root["seti!"]($$root["geti"](mat,i),j,[]);
__GS13;
j=$$root["+"](j,1);
j;
$$TMP316=recur();
return $$TMP316;
}
)();
}
else{
   $$TMP314=(function(){
      var $$TMP317;
      $$TMP317=__GS13;
      return $$TMP317;
   }
   )();
}
$$TMP313=$$TMP314;
return $$TMP313;
}
);
recur;
$$TMP312=recur();
return $$TMP312;
}
)([]);
return $$TMP311;
}
)(undefined,0);
__GS12;
i=$$root["+"](i,1);
i;
$$TMP310=recur();
return $$TMP310;
}
)();
}
else{
   $$TMP308=(function(){
      var $$TMP318;
      $$TMP318=__GS12;
      return $$TMP318;
   }
   )();
}
$$TMP307=$$TMP308;
return $$TMP307;
}
);
recur;
$$TMP306=recur();
return $$TMP306;
}
)([]);
return $$TMP305;
}
)(undefined,0);
(function(__GS14,i){
   var $$TMP319;
   $$TMP319=(function(recur){
      var $$TMP320;
      recur=(function(){
         var $$TMP321;
         var $$TMP322;
         var $$TMP323;
if($$root["<"](i,rows)){
   $$TMP323=true;
}
else{
   $$TMP323=false;
}
if($$TMP323){
   $$TMP322=(function(){
      var $$TMP324;
      __GS14=(function(__GS15,j){
         var $$TMP325;
         $$TMP325=(function(recur){
            var $$TMP326;
            recur=(function(){
               var $$TMP327;
               var $$TMP328;
               var $$TMP329;
if($$root["<"](j,cols)){
   $$TMP329=true;
}
else{
   $$TMP329=false;
}
if($$TMP329){
   $$TMP328=(function(){
      var $$TMP330;
__GS15=$$root["seti!"]($$root["geti"](mat,i),j,$$root["make-random-bub"](0,0,20));
__GS15;
j=$$root["+"](j,1);
j;
$$TMP330=recur();
return $$TMP330;
}
)();
}
else{
   $$TMP328=(function(){
      var $$TMP331;
      $$TMP331=__GS15;
      return $$TMP331;
   }
   )();
}
$$TMP327=$$TMP328;
return $$TMP327;
}
);
recur;
$$TMP326=recur();
return $$TMP326;
}
)([]);
return $$TMP325;
}
)(undefined,0);
__GS14;
i=$$root["+"](i,1);
i;
$$TMP324=recur();
return $$TMP324;
}
)();
}
else{
   $$TMP322=(function(){
      var $$TMP332;
      $$TMP332=__GS14;
      return $$TMP332;
   }
   )();
}
$$TMP321=$$TMP322;
return $$TMP321;
}
);
recur;
$$TMP320=recur();
return $$TMP320;
}
)([]);
return $$TMP319;
}
)(undefined,0);
$$TMP304=$$root["seti!"](self,(new $$root.Symbol("mat")),mat);
return $$TMP304;
}
)($$root["array"](rows));
return $$TMP303;
}
)(this);
return $$TMP302;
}
));
($$root["console"]).log($$root["make-instance"]($$root["*grid*"],4,3));
