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
$$root["prototype?"]=(function(p,o){
   var $$TMP110;
$$TMP110=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP110;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP111;
   var $$TMP112;
if($$root["null?"](a)){
$$TMP112=$$root["null?"](b);
}
else{
   var $$TMP113;
if($$root["symbol?"](a)){
   var $$TMP114;
if($$root["symbol?"](b)){
   var $$TMP115;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP115=true;
}
else{
   $$TMP115=false;
}
$$TMP114=$$TMP115;
}
else{
   $$TMP114=false;
}
$$TMP113=$$TMP114;
}
else{
   var $$TMP116;
if($$root["atom?"](a)){
$$TMP116=$$root["="](a,b);
}
else{
   var $$TMP117;
if($$root["list?"](a)){
   var $$TMP118;
if($$root["list?"](b)){
   var $$TMP119;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP120;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP120=true;
}
else{
   $$TMP120=false;
}
$$TMP119=$$TMP120;
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
   $$TMP117=undefined;
}
$$TMP116=$$TMP117;
}
$$TMP113=$$TMP116;
}
$$TMP112=$$TMP113;
}
$$TMP111=$$TMP112;
return $$TMP111;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP121;
   $$TMP121=(function(res){
      var $$TMP127;
$$TMP127=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP127;
}
)((function(recur){
   var $$TMP122;
   recur=(function(l1,l2){
      var $$TMP123;
      var $$TMP124;
      if((function(c){
         var $$TMP125;
         var $$TMP126;
         if(c){
            $$TMP126=c;
         }
         else{
$$TMP126=p($$root["car"](l2));
}
$$TMP125=$$TMP126;
return $$TMP125;
}
)($$root["null?"](l2))){
$$TMP124=$$root["list"](l1,l2);
}
else{
$$TMP124=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP123=$$TMP124;
return $$TMP123;
}
);
recur;
$$TMP122=recur([],lst);
return $$TMP122;
}
)([]));
return $$TMP121;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP128;
   var $$TMP129;
if($$root["reduce"]((function(accum,v){
   var $$TMP130;
   var $$TMP131;
   if(accum){
      $$TMP131=accum;
   }
   else{
      $$TMP131=v;
   }
   $$TMP130=$$TMP131;
   return $$TMP130;
}
),lst,false)){
   $$TMP129=true;
}
else{
   $$TMP129=false;
}
$$TMP128=$$TMP129;
return $$TMP128;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP132;
$$TMP132=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP133;
   var $$TMP134;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP135;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP135=true;
}
else{
   $$TMP135=false;
}
$$TMP134=$$TMP135;
}
else{
   $$TMP134=false;
}
$$TMP133=$$TMP134;
return $$TMP133;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP132;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP136;
   $$TMP136=(function(binding__MINUSnames){
      var $$TMP137;
      $$TMP137=(function(divs){
         var $$TMP139;
         var $$TMP140;
if($$root["null?"]($$root["second"](divs))){
$$TMP140=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP140=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP139=$$TMP140;
return $$TMP139;
}
)($$root["split"]((function(pair){
   var $$TMP138;
$$TMP138=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP138;
}
),binding__MINUSpairs));
return $$TMP137;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP136;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP142=1;
   $$TMP142<arguments.length;
   ++$$TMP142){
      body[$$TMP142-1]=arguments[$$TMP142];
   }
   var $$TMP141;
$$TMP141=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP141;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP143;
   $$TMP143=(function(x){
      var $$TMP144;
$$TMP144=$$root["not"](f(x));
return $$TMP144;
}
);
return $$TMP143;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP145;
   $$TMP145=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP147=0;
      $$TMP147<arguments.length;
      ++$$TMP147){
         args[$$TMP147-0]=arguments[$$TMP147];
      }
      var $$TMP146;
$$TMP146=f1($$root["apply"](f2,args));
return $$TMP146;
}
);
return $$TMP145;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP151=1;
   $$TMP151<arguments.length;
   ++$$TMP151){
      args1[$$TMP151-1]=arguments[$$TMP151];
   }
   var $$TMP148;
   $$TMP148=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP150=0;
      $$TMP150<arguments.length;
      ++$$TMP150){
         args2[$$TMP150-0]=arguments[$$TMP150];
      }
      var $$TMP149;
$$TMP149=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP149;
}
);
return $$TMP148;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP155=2;
   $$TMP155<arguments.length;
   ++$$TMP155){
      args1[$$TMP155-2]=arguments[$$TMP155];
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
$$TMP153=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP153;
}
);
return $$TMP152;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP159=0;
   $$TMP159<arguments.length;
   ++$$TMP159){
      args[$$TMP159-0]=arguments[$$TMP159];
   }
   var $$TMP156;
   $$TMP156=(function(rx){
      var $$TMP157;
$$TMP157=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP158;
$$TMP158=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP158;
}
));
return $$TMP157;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP156;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP166=1;
   $$TMP166<arguments.length;
   ++$$TMP166){
      pairs[$$TMP166-1]=arguments[$$TMP166];
   }
   var $$TMP160;
   $$TMP160=(function(e__MINUSname,def__MINUSidx){
      var $$TMP161;
      var $$TMP162;
if($$root["="](def__MINUSidx,-1)){
$$TMP162=$$root.list(((new $$root.Symbol("error")) ),("Fell out of case!" ));
}
else{
$$TMP162=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP161=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP163;
$$TMP163=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP164;
$$TMP164=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP164;
}
),$$root["filter"]((function(pair){
   var $$TMP165;
$$TMP165=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP165;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP163;
}
)($$TMP162,$$root["partition"](2,pairs));
return $$TMP161;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP160;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP167;
   $$TMP167=(function(expr__MINUSname){
      var $$TMP168;
$$TMP168=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP169;
   var $$TMP170;
if($$root["symbol?"](v)){
   var $$TMP171;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP171=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP172;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP172=[];
}
else{
$$TMP172=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP171=$$TMP172;
}
$$TMP170=$$TMP171;
}
else{
$$TMP170=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP169=$$TMP170;
return $$TMP169;
}
),structure)));
return $$TMP168;
}
)($$root["gensym"]());
return $$TMP167;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP175=2;
   $$TMP175<arguments.length;
   ++$$TMP175){
      body[$$TMP175-2]=arguments[$$TMP175];
   }
   var $$TMP173;
   var $$TMP174;
if($$root["symbol?"](structure)){
$$TMP174=$$root["list"](structure,expr);
}
else{
$$TMP174=$$root["destruct-helper"](structure,expr);
}
$$TMP173=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP174),body);
return $$TMP173;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP176;
   var $$TMP177;
if($$root["list?"](expr)){
   var $$TMP178;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP178=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP178=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP177=$$TMP178;
}
else{
   $$TMP177=expr;
}
$$TMP176=$$TMP177;
return $$TMP176;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP179;
   var $$TMP180;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP180=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP181;
   var $$TMP182;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP183;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP183=true;
}
else{
   $$TMP183=false;
}
$$TMP182=$$TMP183;
}
else{
   $$TMP182=false;
}
if($$TMP182){
$$TMP181=$$root["list?"](expr);
}
else{
   var $$TMP184;
   if(true){
      var $$TMP185;
      var $$TMP186;
if($$root["list?"](expr)){
   var $$TMP187;
if($$root["not"]($$root["null?"](expr))){
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
   var $$TMP188;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP189;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP189=true;
}
else{
   $$TMP189=false;
}
$$TMP188=$$TMP189;
}
else{
   $$TMP188=false;
}
$$TMP185=$$TMP188;
}
else{
   $$TMP185=false;
}
$$TMP184=$$TMP185;
}
else{
   $$TMP184=undefined;
}
$$TMP181=$$TMP184;
}
$$TMP180=$$TMP181;
}
$$TMP179=$$TMP180;
return $$TMP179;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP190;
   var $$TMP191;
if($$root["null?"](patt)){
$$TMP191=$$root["null?"](expr);
}
else{
   var $$TMP192;
if($$root["list?"](patt)){
$$TMP192=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP193;
if($$root["symbol?"](patt)){
   $$TMP193=true;
}
else{
   var $$TMP194;
   if(true){
$$TMP194=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP194=undefined;
}
$$TMP193=$$TMP194;
}
$$TMP192=$$TMP193;
}
$$TMP191=$$TMP192;
}
$$TMP190=$$TMP191;
return $$TMP190;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP195;
   var $$TMP196;
   var $$TMP197;
if($$root["list?"](patt)){
   var $$TMP198;
if($$root["not"]($$root["null?"](patt))){
   $$TMP198=true;
}
else{
   $$TMP198=false;
}
$$TMP197=$$TMP198;
}
else{
   $$TMP197=false;
}
if($$TMP197){
   var $$TMP199;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP199=(new $$root.Symbol("_"));
}
else{
$$TMP199=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP196=$$TMP199;
}
else{
   $$TMP196=patt;
}
$$TMP195=$$TMP196;
return $$TMP195;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP203=1;
   $$TMP203<arguments.length;
   ++$$TMP203){
      pairs[$$TMP203-1]=arguments[$$TMP203];
   }
   var $$TMP200;
   $$TMP200=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP201;
$$TMP201=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP202;
$$TMP202=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP202;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP201;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP200;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP204;
   $$TMP204=(function(__GS1){
      var $$TMP205;
      var $$TMP206;
if($$root["matches?"](__GS1,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("geti")) )) ),((new $$root.Symbol("obj")) ),((new $$root.Symbol("field")) )))){
   $$TMP206=(function(__GS2){
      var $$TMP207;
      $$TMP207=(function(obj,field){
         var $$TMP208;
$$TMP208=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP208;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP207;
}
)(__GS1);
}
else{
   var $$TMP209;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP209=(function(any){
      var $$TMP210;
      var $$TMP211;
if($$root["symbol?"](any)){
$$TMP211=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP211=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP210=$$TMP211;
return $$TMP210;
}
)(__GS1);
}
else{
   var $$TMP212;
   if(true){
$$TMP212=$$root["error"]("Fell out of case!");
}
else{
   $$TMP212=undefined;
}
$$TMP209=$$TMP212;
}
$$TMP206=$$TMP209;
}
$$TMP205=$$TMP206;
return $$TMP205;
}
)($$root["macroexpand"](place));
return $$TMP204;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP213;
   amt=(function(c){
      var $$TMP214;
      var $$TMP215;
      if(c){
         $$TMP215=c;
      }
      else{
         $$TMP215=1;
      }
      $$TMP214=$$TMP215;
      return $$TMP214;
   }
   )(amt);
   amt;
$$TMP213=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP213;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP216;
   amt=(function(c){
      var $$TMP217;
      var $$TMP218;
      if(c){
         $$TMP218=c;
      }
      else{
         $$TMP218=1;
      }
      $$TMP217=$$TMP218;
      return $$TMP217;
   }
   )(amt);
   amt;
$$TMP216=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP216;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP219;
$$TMP219=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP219;
}
);
$$root["push"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP222=1;
   $$TMP222<arguments.length;
   ++$$TMP222){
      forms[$$TMP222-1]=arguments[$$TMP222];
   }
   var $$TMP220;
   var $$TMP221;
if($$root["null?"](forms)){
   $$TMP221=x;
}
else{
$$TMP221=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP220=$$TMP221;
return $$TMP220;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP228=1;
   $$TMP228<arguments.length;
   ++$$TMP228){
      body[$$TMP228-1]=arguments[$$TMP228];
   }
   var $$TMP223;
   $$TMP223=(function(binding__MINUSname){
      var $$TMP224;
$$TMP224=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP225;
   $$TMP225=(function(__GS3){
      var $$TMP226;
      $$TMP226=(function(f,args){
         var $$TMP227;
$$TMP227=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP227;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP226;
}
)(v);
return $$TMP225;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP224;
}
)($$root["gensym"]());
return $$TMP223;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP230=1;
   $$TMP230<arguments.length;
   ++$$TMP230){
      body[$$TMP230-1]=arguments[$$TMP230];
   }
   var $$TMP229;
$$TMP229=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP229;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP231;
$$TMP231=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP231;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP232;
   step=(function(c){
      var $$TMP233;
      var $$TMP234;
      if(c){
         $$TMP234=c;
      }
      else{
         $$TMP234=1;
      }
      $$TMP233=$$TMP234;
      return $$TMP233;
   }
   )(step);
   step;
   $$TMP232=(function(data){
      var $$TMP235;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP235=data;
return $$TMP235;
}
)($$root["object"]([]));
return $$TMP232;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP236;
   $$TMP236=(function(len__MINUSname,data){
      var $$TMP237;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP237=data;
return $$TMP237;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP236;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP238;
   $$TMP238=(function(lst__MINUSname,data){
      var $$TMP239;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP239=data;
return $$TMP239;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP238;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP240;
   $$TMP240=(function(__GS4){
      var $$TMP241;
      $$TMP241=(function(binding__MINUSname,__GS5){
         var $$TMP242;
         $$TMP242=(function(func__MINUSname,args){
            var $$TMP243;
$$TMP243=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP243;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP242;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP241;
}
)(form);
return $$TMP240;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP244;
   $$TMP244=(function(data){
      var $$TMP245;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP245=data;
return $$TMP245;
}
)($$root["object"]([]));
return $$TMP244;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP246;
   $$TMP246=(function(data){
      var $$TMP247;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP247=data;
return $$TMP247;
}
)($$root["object"]([]));
return $$TMP246;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP248;
   $$TMP248=(function(data){
      var $$TMP249;
      (function(__GS6){
         var $$TMP250;
         $$TMP250=(function(binding__MINUSname,body){
            var $$TMP251;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP251=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP251;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP250;
}
)(form);
$$TMP249=data;
return $$TMP249;
}
)($$root["object"]([]));
return $$TMP248;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP252;
   $$TMP252=(function(data){
      var $$TMP253;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP253=data;
return $$TMP253;
}
)($$root["object"]([]));
return $$TMP252;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP254;
   $$TMP254=(function(data,accum__MINUSname){
      var $$TMP255;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP255=data;
return $$TMP255;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP254;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP256;
$$TMP256=$$root["filter"]((function(x){
   var $$TMP257;
$$TMP257=$$root["not="](x,undefined);
return $$TMP257;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP256;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP273=0;
   $$TMP273<arguments.length;
   ++$$TMP273){
      forms[$$TMP273-0]=arguments[$$TMP273];
   }
   var $$TMP258;
   $$TMP258=(function(res__MINUSname){
      var $$TMP259;
      $$TMP259=(function(all){
         var $$TMP269;
         $$TMP269=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP271;
            var $$TMP272;
if($$root["null?"](final__MINUSactions)){
$$TMP272=$$root["list"](res__MINUSname);
}
else{
   $$TMP272=final__MINUSactions;
}
$$TMP271=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP272)))))));
return $$TMP271;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP270;
$$TMP270=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP270;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP269;
}
)($$root["map"]((function(form){
   var $$TMP260;
   $$TMP260=(function(__GS7){
      var $$TMP261;
      var $$TMP262;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP262=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP263;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP263=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP264;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP264=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP265;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP265=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP266;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP266=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP267;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP267=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP268;
   if(true){
$$TMP268=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP268=undefined;
}
$$TMP267=$$TMP268;
}
$$TMP266=$$TMP267;
}
$$TMP265=$$TMP266;
}
$$TMP264=$$TMP265;
}
$$TMP263=$$TMP264;
}
$$TMP262=$$TMP263;
}
$$TMP261=$$TMP262;
return $$TMP261;
}
)($$root["car"](form));
return $$TMP260;
}
),forms));
return $$TMP259;
}
)($$root["gensym"]());
return $$TMP258;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["renderer"]=($$root["PIXI"]).autoDetectRenderer(800,600);
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
   var $$TMP274;
$$TMP274=$$root["call-method"]($$root["requestAnimationFrame"],$$root["get-window"](),callback);
return $$TMP274;
}
);
$$root["request-frame"];
$$root["animate"]=(function(){
   var $$TMP275;
$$root["seti!"]($$root["sprite"],(new $$root.Symbol("x")),$$root["+"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("x"))),2));
($$root["renderer"]).render($$root["stage"]);
$$TMP275=$$root["request-frame"]($$root["animate"]);
return $$TMP275;
}
);
$$root["animate"];
$$root["request-frame"]($$root["animate"]);
