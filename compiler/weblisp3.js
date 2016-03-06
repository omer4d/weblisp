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
$$root["VM"]=$$root["require"]("vm");
$$root["VM"];
$$root["Reflect"]=$$root["require"]("harmony-reflect");
$$root["Reflect"];
$$root["fs"]=$$root["require"]("fs");
$$root["fs"];
$$root["argv"]=$$root["require"]("minimist")($$root["call-method-by-name"]($$root["geti"]($$root["process"],(new $$root.Symbol("argv"))),(new $$root.Symbol("slice")),2));
$$root["argv"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP274;
   $$TMP274=(function(self){
      var $$TMP275;
      $$TMP275=(function(__GS8){
         var $$TMP276;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP276=__GS8;
return $$TMP276;
}
)(self);
return $$TMP275;
}
)(this);
return $$TMP274;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP277;
   $$TMP277=(function(self){
      var $$TMP278;
$$TMP278=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP278;
}
)(this);
return $$TMP277;
}
));
$$root["lit"]=(function(s){
   var $$TMP279;
$$TMP279=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP279;
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
   var $$TMP280;
   $$TMP280=(function(toks,pos,s){
      var $$TMP281;
      (function(recur){
         var $$TMP282;
         recur=(function(){
            var $$TMP283;
            var $$TMP284;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP284=(function(){
      var $$TMP285;
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP286;
         $$TMP286=(function(recur){
            var $$TMP287;
            recur=(function(){
               var $$TMP288;
               var $$TMP289;
               var $$TMP290;
if($$root["<"](i,__GS10)){
   var $$TMP291;
if($$root["not"]($$root["null?"](__GS11))){
   var $$TMP292;
if($$root["not"](res)){
   $$TMP292=true;
}
else{
   $$TMP292=false;
}
$$TMP291=$$TMP292;
}
else{
   $$TMP291=false;
}
$$TMP290=$$TMP291;
}
else{
   $$TMP290=false;
}
if($$TMP290){
   $$TMP289=(function(){
      var $$TMP293;
entry=$$root["car"](__GS11);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP293=recur();
return $$TMP293;
}
)();
}
else{
   $$TMP289=(function(){
      var $$TMP294;
      _=__GS9;
      _;
      var $$TMP295;
      if(res){
         $$TMP295=(function(){
            var $$TMP296;
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP297;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP297=(function(){
      var $$TMP298;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP299;
   var $$TMP300;
   if(c){
      $$TMP300=c;
   }
   else{
$$TMP300=$$root["second"](entry);
}
$$TMP299=$$TMP300;
return $$TMP299;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP298=toks;
return $$TMP298;
}
)();
}
else{
   $$TMP297=undefined;
}
$$TMP297;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP296=pos;
return $$TMP296;
}
)();
}
else{
$$TMP295=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP295;
$$TMP294=__GS9;
return $$TMP294;
}
)();
}
$$TMP288=$$TMP289;
return $$TMP288;
}
);
recur;
$$TMP287=recur();
return $$TMP287;
}
)([]);
return $$TMP286;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP285=recur();
return $$TMP285;
}
)();
}
else{
   $$TMP284=undefined;
}
$$TMP283=$$TMP284;
return $$TMP283;
}
);
recur;
$$TMP282=recur();
return $$TMP282;
}
)([]);
$$TMP281=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP281;
}
)([],0,src);
return $$TMP280;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP301;
   $$TMP301=(function(self){
      var $$TMP302;
$$TMP302=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP302;
}
)(this);
return $$TMP301;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP303;
   $$TMP303=(function(self){
      var $$TMP304;
$$TMP304=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP304;
}
)(this);
return $$TMP303;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP305;
   $$TMP305=(function(self){
      var $$TMP306;
      $$TMP306=(function(curr){
         var $$TMP307;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP307=curr;
return $$TMP307;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP306;
}
)(this);
return $$TMP305;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP308;
$$TMP308=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP308;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP309;
$$TMP309=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP309;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP310;
   $$TMP310=(function(self){
      var $$TMP311;
      $$TMP311=(function(tok){
         var $$TMP312;
         $$TMP312=(function(__GS12){
            var $$TMP313;
            var $$TMP314;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
$$TMP314=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP315;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP315=true;
}
else{
   var $$TMP316;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP316=false;
}
else{
   var $$TMP317;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP317=[];
}
else{
   var $$TMP318;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP318=undefined;
}
else{
   var $$TMP319;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP319=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP320;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP320=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP321;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP321=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP322;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
$$TMP322=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP323;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP323=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP324;
   if(true){
$$TMP324=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP324=undefined;
}
$$TMP323=$$TMP324;
}
$$TMP322=$$TMP323;
}
$$TMP321=$$TMP322;
}
$$TMP320=$$TMP321;
}
$$TMP319=$$TMP320;
}
$$TMP318=$$TMP319;
}
$$TMP317=$$TMP318;
}
$$TMP316=$$TMP317;
}
$$TMP315=$$TMP316;
}
$$TMP314=$$TMP315;
}
$$TMP313=$$TMP314;
return $$TMP313;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP312;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP311;
}
)(this);
return $$TMP310;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP325;
   $$TMP325=(function(self){
      var $$TMP326;
      $$TMP326=(function(__GS13,__GS14,lst){
         var $$TMP327;
         $$TMP327=(function(recur){
            var $$TMP328;
            recur=(function(){
               var $$TMP329;
               var $$TMP330;
               var $$TMP331;
               var $$TMP332;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP333;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP333=true;
}
else{
   $$TMP333=false;
}
$$TMP332=$$TMP333;
}
else{
   $$TMP332=false;
}
if($$TMP332){
   $$TMP331=true;
}
else{
   $$TMP331=false;
}
if($$TMP331){
   $$TMP330=(function(){
      var $$TMP334;
__GS14=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS14);
__GS13=__GS14;
__GS13;
$$TMP334=recur();
return $$TMP334;
}
)();
}
else{
   $$TMP330=(function(){
      var $$TMP335;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP336;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP336=lst;
}
else{
$$TMP336=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP336;
$$TMP335=__GS13;
return $$TMP335;
}
)();
}
$$TMP329=$$TMP330;
return $$TMP329;
}
);
recur;
$$TMP328=recur();
return $$TMP328;
}
)([]);
return $$TMP327;
}
)(undefined,[],undefined);
return $$TMP326;
}
)(this);
return $$TMP325;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP337;
   $$TMP337=(function(self){
      var $$TMP338;
      $$TMP338=(function(__GS15,__GS16,lst){
         var $$TMP339;
         $$TMP339=(function(recur){
            var $$TMP340;
            recur=(function(){
               var $$TMP341;
               var $$TMP342;
               var $$TMP343;
               var $$TMP344;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP345;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP345=true;
}
else{
   $$TMP345=false;
}
$$TMP344=$$TMP345;
}
else{
   $$TMP344=false;
}
if($$TMP344){
   $$TMP343=true;
}
else{
   $$TMP343=false;
}
if($$TMP343){
   $$TMP342=(function(){
      var $$TMP346;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP347;
   var $$TMP348;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP348=(function(){
      var $$TMP349;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP349=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
return $$TMP349;
}
)();
}
else{
   var $$TMP350;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP350=(function(){
      var $$TMP351;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP351=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
return $$TMP351;
}
)();
}
else{
   var $$TMP352;
   if(true){
$$TMP352=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP352=undefined;
}
$$TMP350=$$TMP352;
}
$$TMP348=$$TMP350;
}
$$TMP347=$$TMP348;
return $$TMP347;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP346=recur();
return $$TMP346;
}
)();
}
else{
   $$TMP342=(function(){
      var $$TMP353;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP354;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP354=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP354=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP354;
$$TMP353=__GS15;
return $$TMP353;
}
)();
}
$$TMP341=$$TMP342;
return $$TMP341;
}
);
recur;
$$TMP340=recur();
return $$TMP340;
}
)([]);
return $$TMP339;
}
)(undefined,[],undefined);
return $$TMP338;
}
)(this);
return $$TMP337;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP355;
   $$TMP355=(function(self){
      var $$TMP356;
      var $$TMP357;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP357=(function(){
      var $$TMP358;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP358=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
return $$TMP358;
}
)();
}
else{
$$TMP357=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP356=$$TMP357;
return $$TMP356;
}
)(this);
return $$TMP355;
}
));
$$root["parse"]=(function(toks){
   var $$TMP359;
   $$TMP359=(function(p){
      var $$TMP360;
      $$TMP360=(function(__GS18,__GS19){
         var $$TMP361;
         $$TMP361=(function(recur){
            var $$TMP362;
            recur=(function(){
               var $$TMP363;
               var $$TMP364;
               var $$TMP365;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP365=true;
}
else{
   $$TMP365=false;
}
if($$TMP365){
   $$TMP364=(function(){
      var $$TMP366;
__GS19=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS19);
__GS18=__GS19;
__GS18;
$$TMP366=recur();
return $$TMP366;
}
)();
}
else{
   $$TMP364=(function(){
      var $$TMP367;
__GS18=$$root["reverse"](__GS19);
$$TMP367=__GS18;
return $$TMP367;
}
)();
}
$$TMP363=$$TMP364;
return $$TMP363;
}
);
recur;
$$TMP362=recur();
return $$TMP362;
}
)([]);
return $$TMP361;
}
)(undefined,[]);
return $$TMP360;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP359;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP368;
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
$$TMP368=__GS20;
return $$TMP368;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP369;
$$TMP369=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP369;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP370;$$TMP370=$$root["geti"]($$root["mangling-table"],x);return $$TMP370;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP371;$$TMP371=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);return $$TMP371;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){var $$TMP372;$$TMP372=(function(self){var $$TMP373;$$TMP373=(function(__GS21){var $$TMP374;$$root["seti!"](__GS21,"root",root);$$root["seti!"](__GS21,"next-var-suffix",0);$$TMP374=__GS21;return $$TMP374;})(self);return $$TMP373;})(this);return $$TMP372;}));$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP375;$$TMP375=(function(self){var $$TMP376;$$TMP376=(function(out){var $$TMP377;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP377=out;return $$TMP377;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP376;})(this);return $$TMP375;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP378;var $$TMP379;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP379=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP379=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP378=$$TMP379;
return $$TMP378;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP380;
   $$TMP380=(function(self){
      var $$TMP381;
      var $$TMP382;
if($$root["="](x,true)){
$$TMP382=$$root["list"]("true","");
}
else{
   var $$TMP383;
if($$root["="](x,false)){
$$TMP383=$$root["list"]("false","");
}
else{
   var $$TMP384;
if($$root["null?"](x)){
$$TMP384=$$root["list"]("[]","");
}
else{
   var $$TMP385;
if($$root["="](x,undefined)){
$$TMP385=$$root["list"]("undefined","");
}
else{
   var $$TMP386;
if($$root["symbol?"](x)){
$$TMP386=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP387;
if($$root["string?"](x)){
$$TMP387=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP388;
   if(true){
$$TMP388=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP388=undefined;
}
$$TMP387=$$TMP388;
}
$$TMP386=$$TMP387;
}
$$TMP385=$$TMP386;
}
$$TMP384=$$TMP385;
}
$$TMP383=$$TMP384;
}
$$TMP382=$$TMP383;
}
$$TMP381=$$TMP382;
return $$TMP381;
}
)(this);
return $$TMP380;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP389;
   $$TMP389=(function(self){
      var $$TMP390;
      $$TMP390=(function(__GS22){
         var $$TMP391;
         $$TMP391=(function(fun,args){
            var $$TMP392;
            $$TMP392=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP393;
$$TMP393=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP393;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP392;
}
)($$root["nth"](0,__GS22),$$root["drop"](1,__GS22));
return $$TMP391;
}
)(lst);
return $$TMP390;
}
)(this);
return $$TMP389;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP394;
   $$TMP394=(function(self){
      var $$TMP395;
      $$TMP395=(function(__GS23){
         var $$TMP396;
         $$TMP396=(function(fun,args){
            var $$TMP397;
            $$TMP397=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP398;
$$TMP398=$$root["list"]($$root["format"]("(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP398;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP397;
}
)($$root["nth"](1,__GS23),$$root["drop"](2,__GS23));
return $$TMP396;
}
)(lst);
return $$TMP395;
}
)(this);
return $$TMP394;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP399;
   $$TMP399=(function(self){
      var $$TMP400;
      $$TMP400=(function(__GS24){
         var $$TMP401;
         $$TMP401=(function(method,obj,args){
            var $$TMP402;
            $$TMP402=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP403;
$$TMP403=$$root["list"]($$root["format"]("(%0)%1(%2)",$$root["first"](compiled__MINUSobj),method,$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSobj),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP403;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP402;
}
)($$root["nth"](0,__GS24),$$root["nth"](1,__GS24),$$root["drop"](2,__GS24));
return $$TMP401;
}
)(lst);
return $$TMP400;
}
)(this);
return $$TMP399;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP404;
   $$TMP404=(function(self){
      var $$TMP405;
      $$TMP405=(function(compiled__MINUSbody,reducer){
         var $$TMP407;
$$TMP407=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP407;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP406;
$$TMP406=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP406;
}
));
return $$TMP405;
}
)(this);
return $$TMP404;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP408;
$$TMP408=$$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP408;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP409;
   var $$TMP410;
if($$root["is-vararg?"](sym)){
$$TMP410=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP410=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP409=$$TMP410;
return $$TMP409;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP411;
$$TMP411=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP412;
$$TMP412=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
return $$TMP412;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP411;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP413;
   $$TMP413=(function(self){
      var $$TMP414;
      var $$TMP415;
if($$root["not"]($$root["null?"](args))){
   $$TMP415=(function(){
      var $$TMP416;
$$TMP416=$$root["last"](args);
return $$TMP416;
}
)();
}
else{
   $$TMP415=undefined;
}
$$TMP414=(function(last__MINUSarg){
   var $$TMP417;
   var $$TMP418;
   var $$TMP419;
   if(last__MINUSarg){
      var $$TMP420;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP420=true;
}
else{
   $$TMP420=false;
}
$$TMP419=$$TMP420;
}
else{
   $$TMP419=false;
}
if($$TMP419){
$$TMP418=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP418="";
}
$$TMP417=$$TMP418;
return $$TMP417;
}
)($$TMP415);
return $$TMP414;
}
)(this);
return $$TMP413;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP421;
   $$TMP421=(function(self){
      var $$TMP422;
      $$TMP422=(function(__GS25){
         var $$TMP423;
         $$TMP423=(function(__GS26){
            var $$TMP424;
            $$TMP424=(function(args,body){
               var $$TMP425;
               $$TMP425=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP427;
                  $$TMP427=(function(compiled__MINUSbody){
                     var $$TMP428;
$$TMP428=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP428;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP427;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP426;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP426=accum;
return $$TMP426;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP425;
}
)($$root["drop"](0,__GS26),$$root["drop"](2,__GS25));
return $$TMP424;
}
)($$root["nth"](1,__GS25));
return $$TMP423;
}
)(lst);
return $$TMP422;
}
)(this);
return $$TMP421;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP429;
   $$TMP429=(function(self){
      var $$TMP430;
      $$TMP430=(function(__GS27){
         var $$TMP431;
         $$TMP431=(function(c,t,f){
            var $$TMP432;
            $$TMP432=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP433;
$$TMP433=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP433;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP432;
}
)($$root["nth"](1,__GS27),$$root["nth"](2,__GS27),$$root["nth"](3,__GS27));
return $$TMP431;
}
)(lst);
return $$TMP430;
}
)(this);
return $$TMP429;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP434;
   $$TMP434=(function(self){
      var $$TMP435;
      var $$TMP436;
if($$root["symbol?"](x)){
$$TMP436=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
$$TMP436=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP435=$$TMP436;
return $$TMP435;
}
)(this);
return $$TMP434;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP437;
   $$TMP437=(function(self){
      var $$TMP438;
$$TMP438=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP438;
}
)(this);
return $$TMP437;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP439;
   $$TMP439=(function(self){
      var $$TMP440;
      var $$TMP441;
if($$root["atom?"](x)){
$$TMP441=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP441=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP440=$$TMP441;
return $$TMP440;
}
)(this);
return $$TMP439;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP442;
   $$TMP442=(function(self){
      var $$TMP443;
      $$TMP443=(function(__GS28){
         var $$TMP444;
         $$TMP444=(function(name,value){
            var $$TMP445;
            $$TMP445=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP446;
$$TMP446=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP446;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP445;
}
)($$root["nth"](1,__GS28),$$root["nth"](2,__GS28));
return $$TMP444;
}
)(lst);
return $$TMP443;
}
)(this);
return $$TMP442;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP447;
   $$TMP447=(function(self){
      var $$TMP448;
      $$TMP448=(function(__GS29){
         var $$TMP449;
         $$TMP449=(function(name,args){
            var $$TMP450;
            $$TMP450=(function(tmp){
               var $$TMP452;
$$TMP452=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP452;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP451;
$$TMP451=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP451;
}
),args))));
return $$TMP450;
}
)($$root["nth"](0,__GS29),$$root["drop"](1,__GS29));
return $$TMP449;
}
)(expr);
return $$TMP448;
}
)(this);
return $$TMP447;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP453;
   $$TMP453=(function(self){
      var $$TMP454;
      var $$TMP455;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP456;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP456=true;
}
else{
   $$TMP456=false;
}
$$TMP455=$$TMP456;
}
else{
   $$TMP455=false;
}
$$TMP454=$$TMP455;
return $$TMP454;
}
)(this);
return $$TMP453;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP457;
   $$TMP457=(function(self){
      var $$TMP458;
      var $$TMP459;
      var $$TMP460;
if($$root["list?"](expr)){
   var $$TMP461;
if($$root["not"]($$root["null?"](expr))){
   $$TMP461=true;
}
else{
   $$TMP461=false;
}
$$TMP460=$$TMP461;
}
else{
   $$TMP460=false;
}
if($$TMP460){
   $$TMP459=(function(first){
      var $$TMP462;
      var $$TMP463;
if($$root["symbol?"](first)){
   $$TMP463=(function(__GS30){
      var $$TMP464;
      var $$TMP465;
if($$root["equal?"](__GS30,(new $$root.Symbol("lambda")))){
$$TMP465=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP466;
if($$root["equal?"](__GS30,(new $$root.Symbol("new")))){
$$TMP466=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP467;
if($$root["equal?"](__GS30,(new $$root.Symbol("if")))){
$$TMP467=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP468;
if($$root["equal?"](__GS30,(new $$root.Symbol("quote")))){
$$TMP468=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP469;
if($$root["equal?"](__GS30,(new $$root.Symbol("setv!")))){
$$TMP469=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP470;
if($$root["equal?"](__GS30,(new $$root.Symbol("def")))){
$$TMP470=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP471;
   if(true){
      var $$TMP472;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP472=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP473;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP473=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP474;
   if(true){
$$TMP474=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP474=undefined;
}
$$TMP473=$$TMP474;
}
$$TMP472=$$TMP473;
}
$$TMP471=$$TMP472;
}
else{
   $$TMP471=undefined;
}
$$TMP470=$$TMP471;
}
$$TMP469=$$TMP470;
}
$$TMP468=$$TMP469;
}
$$TMP467=$$TMP468;
}
$$TMP466=$$TMP467;
}
$$TMP465=$$TMP466;
}
$$TMP464=$$TMP465;
return $$TMP464;
}
)(first);
}
else{
$$TMP463=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP462=$$TMP463;
return $$TMP462;
}
)($$root["car"](expr));
}
else{
$$TMP459=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP458=$$TMP459;
return $$TMP458;
}
)(this);
return $$TMP457;
}
));
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["default-lexenv"]=(function(){
   var $$TMP475;
   $$TMP475=(function(__GS31){
      var $$TMP476;
$$root["seti!"](__GS31,"this",true);
$$TMP476=__GS31;
return $$TMP476;
}
)($$root["object"]());
return $$TMP475;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP477;
   $$TMP477=(function(self){
      var $$TMP478;
      $$TMP478=(function(root,sandbox){
         var $$TMP479;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP480;
$$TMP480=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP480;
}
));
$$TMP479=(function(__GS32){
   var $$TMP481;
$$root["seti!"](__GS32,"root",root);
$$root["seti!"](__GS32,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP481=__GS32;
return $$TMP481;
}
)(self);
return $$TMP479;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP478;
}
)(this);
return $$TMP477;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP482;
   $$TMP482=(function(self){
      var $$TMP483;
      $$TMP483=(function(tmp){
         var $$TMP484;
$$TMP484=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP484;
}
)($$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP483;
}
)(this);
return $$TMP482;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP485;
   $$TMP485=(function(self){
      var $$TMP486;
      $$TMP486=(function(forms){
         var $$TMP487;
         $$TMP487=(function(__GS33,__GS34,form){
            var $$TMP488;
            $$TMP488=(function(recur){
               var $$TMP489;
               recur=(function(){
                  var $$TMP490;
                  var $$TMP491;
                  var $$TMP492;
if($$root["not"]($$root["null?"](__GS34))){
   $$TMP492=true;
}
else{
   $$TMP492=false;
}
if($$TMP492){
   $$TMP491=(function(){
      var $$TMP493;
form=$$root["car"](__GS34);
form;
__GS33=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS33;
__GS34=$$root["cdr"](__GS34);
__GS34;
$$TMP493=recur();
return $$TMP493;
}
)();
}
else{
   $$TMP491=(function(){
      var $$TMP494;
      $$TMP494=__GS33;
      return $$TMP494;
   }
   )();
}
$$TMP490=$$TMP491;
return $$TMP490;
}
);
recur;
$$TMP489=recur();
return $$TMP489;
}
)([]);
return $$TMP488;
}
)(undefined,forms,[]);
return $$TMP487;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP486;
}
)(this);
return $$TMP485;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP495;
   $$TMP495=(function(self){
      var $$TMP496;
$$TMP496=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["str"]($$root["second"](compilation__MINUSresult),$$root["first"](compilation__MINUSresult)));
return $$TMP496;
}
)(this);
return $$TMP495;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP497;
   $$TMP497=(function(self){
      var $$TMP498;
      $$TMP498=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP499;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP500;
   $$TMP500=(function(r){
      var $$TMP501;
      var $$TMP502;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   $$TMP502=(function(){
      var $$TMP503;
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti"](r,(new $$root.Symbol("code"))));
r;
$$TMP503=$$root["seti!"](target,name,r);
return $$TMP503;
}
)();
}
else{
   $$TMP502=undefined;
}
$$TMP502;
$$TMP501=r;
return $$TMP501;
}
)($$root["geti"](target,name));
return $$TMP500;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP504;
$$TMP504=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP504;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP505;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP505=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP505;
}
));
$$TMP499=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP499;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP498;
}
)(this);
return $$TMP497;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP506;
   $$TMP506=(function(self){
      var $$TMP507;
      $$TMP507=(function(lexenv){
         var $$TMP508;
         $$TMP508=(function(__GS35){
            var $$TMP509;
            var $$TMP510;
if($$root["matches?"](__GS35,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("def")) )) ),((new $$root.Symbol("name")) ),((new $$root.Symbol("val")) )))){
   $$TMP510=(function(__GS36){
      var $$TMP511;
      $$TMP511=(function(name,val){
         var $$TMP512;
         $$TMP512=(function(tmp){
            var $$TMP513;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP513=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP513;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP512;
}
)($$root["nth"](1,__GS36),$$root["nth"](2,__GS36));
return $$TMP511;
}
)(__GS35);
}
else{
   var $$TMP514;
if($$root["matches?"](__GS35,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("setmac!")) )) ),((new $$root.Symbol("name")) )))){
   $$TMP514=(function(__GS37){
      var $$TMP515;
      $$TMP515=(function(name){
         var $$TMP516;
         $$TMP516=(function(tmp){
            var $$TMP517;
$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
$$TMP517=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP517;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP516;
}
)($$root["nth"](1,__GS37));
return $$TMP515;
}
)(__GS35);
}
else{
   var $$TMP518;
if($$root["matches?"](__GS35,$$root.list(($$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("lambda")) )) ),($$root.list(((new $$root.Symbol("&args")) )) ),((new $$root.Symbol("&body")) )) )))){
   $$TMP518=(function(__GS38){
      var $$TMP519;
      $$TMP519=(function(__GS39){
         var $$TMP520;
         $$TMP520=(function(__GS40){
            var $$TMP521;
            $$TMP521=(function(args,body){
               var $$TMP522;
$$TMP522=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP522;
}
)($$root["drop"](0,__GS40),$$root["drop"](2,__GS39));
return $$TMP521;
}
)($$root["nth"](1,__GS39));
return $$TMP520;
}
)($$root["nth"](0,__GS38));
return $$TMP519;
}
)(__GS35);
}
else{
   var $$TMP523;
if($$root["matches?"](__GS35,$$root.list(((new $$root.Symbol("name")) ),((new $$root.Symbol("&args")) )))){
   $$TMP523=(function(__GS41){
      var $$TMP524;
      $$TMP524=(function(name,args){
         var $$TMP525;
         var $$TMP526;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP526=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP526=(function(tmp){
      var $$TMP527;
$$TMP527=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP527;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP525=$$TMP526;
return $$TMP525;
}
)($$root["nth"](0,__GS41),$$root["drop"](1,__GS41));
return $$TMP524;
}
)(__GS35);
}
else{
   var $$TMP528;
if($$root["matches?"](__GS35,(new $$root.Symbol("any")))){
   $$TMP528=(function(any){
      var $$TMP529;
      $$TMP529=(function(tmp){
         var $$TMP530;
$$TMP530=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP530;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP529;
}
)(__GS35);
}
else{
   var $$TMP531;
   if(true){
$$TMP531=$$root["error"]("Fell out of case!");
}
else{
   $$TMP531=undefined;
}
$$TMP528=$$TMP531;
}
$$TMP523=$$TMP528;
}
$$TMP518=$$TMP523;
}
$$TMP514=$$TMP518;
}
$$TMP510=$$TMP514;
}
$$TMP509=$$TMP510;
return $$TMP509;
}
)(e);
return $$TMP508;
}
)($$root["default-lexenv"]());
return $$TMP507;
}
)(this);
return $$TMP506;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP532;
   $$TMP532=(function(self){
      var $$TMP533;
$$TMP533=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP533;
}
)(this);
return $$TMP532;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
