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

$$root["defmacro"]=(function(name,args,...body){
   var $$TMP0;
$$TMP0=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setmac!"))),$$root["list"](name))))));
return $$TMP0;
}
);
$$root["defmacro"];
$$root["setmac!"]($$root["defmacro"]);
$$root["defun"]=(function(name,args,...body){
   var $$TMP1;
$$TMP1=$$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)));
return $$TMP1;
}
);
$$root["defun"];
$$root["setmac!"]($$root["defun"]);
$$root["progn"]=(function(...body){
   var $$TMP2;
   var $$TMP3;
if($$root["null?"](body)){
   $$TMP3=undefined;
}
else{
$$TMP3=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),body)));
}
$$TMP2=$$TMP3;
return $$TMP2;
}
);
$$root["progn"];
$$root["setmac!"]($$root["progn"]);
$$root["when"]=(function(c,...body){
   var $$TMP4;
$$TMP4=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)),$$root["list"](undefined));
return $$TMP4;
}
);
$$root["when"];
$$root["setmac!"]($$root["when"]);
$$root["cond"]=(function(...pairs){
   var $$TMP5;
   var $$TMP6;
if($$root["null?"](pairs)){
   $$TMP6=undefined;
}
else{
$$TMP6=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](pairs)),$$root["list"]($$root["car"]($$root["cdr"](pairs))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["cdr"]($$root["cdr"](pairs)))));
}
$$TMP5=$$TMP6;
return $$TMP5;
}
);
$$root["cond"];
$$root["setmac!"]($$root["cond"]);
$$root["and"]=(function(...args){
   var $$TMP7;
   var $$TMP8;
if($$root["null?"](args)){
   $$TMP8=true;
}
else{
$$TMP8=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["cdr"](args))),$$root["list"](false));
}
$$TMP7=$$TMP8;
return $$TMP7;
}
);
$$root["and"];
$$root["setmac!"]($$root["and"]);
$$root["or"]=(function(...args){
   var $$TMP9;
   var $$TMP10;
if($$root["null?"](args)){
   $$TMP10=false;
}
else{
   var $$TMP11;
if($$root["null?"]($$root["cdr"](args))){
$$TMP11=$$root["car"](args);
}
else{
$$TMP11=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP10=$$TMP11;
}
$$TMP9=$$TMP10;
return $$TMP9;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["macroexpand-1"]=(function(expr){
   var $$TMP12;
   var $$TMP13;
   var $$TMP14;
if($$root["list?"](expr)){
   var $$TMP15;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
   $$TMP15=true;
}
else{
   $$TMP15=false;
}
$$TMP14=$$TMP15;
}
else{
   $$TMP14=false;
}
if($$TMP14){
$$TMP13=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
}
else{
   $$TMP13=expr;
}
$$TMP12=$$TMP13;
return $$TMP12;
}
);
$$root["macroexpand-1"];
$$root["inc"]=(function(x){
   var $$TMP16;
$$TMP16=$$root["+"](x,1);
return $$TMP16;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP17;
$$TMP17=$$root["-"](x,1);
return $$TMP17;
}
);
$$root["dec"];
$$root["incv!"]=(function(name,amt){
   var $$TMP18;
   amt=(function(c){
      var $$TMP19;
      var $$TMP20;
      if(c){
         $$TMP20=c;
      }
      else{
         $$TMP20=1;
      }
      $$TMP19=$$TMP20;
      return $$TMP19;
   }
   )(amt);
   amt;
$$TMP18=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP18;
}
);
$$root["incv!"];
$$root["setmac!"]($$root["incv!"]);
$$root["decv!"]=(function(name,amt){
   var $$TMP21;
   amt=(function(c){
      var $$TMP22;
      var $$TMP23;
      if(c){
         $$TMP23=c;
      }
      else{
         $$TMP23=1;
      }
      $$TMP22=$$TMP23;
      return $$TMP22;
   }
   )(amt);
   amt;
$$TMP21=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP21;
}
);
$$root["decv!"];
$$root["setmac!"]($$root["decv!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP24;
$$TMP24=$$root["car"]($$root["cdr"](lst));
return $$TMP24;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP25;
$$TMP25=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP25;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP26;
$$TMP26=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP26;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP27;
$$TMP27=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP27;
}
);
$$root["fifth"];
$$root["rest"]=$$root["cdr"];
$$root["rest"];
$$root["getter"]=(function(field){
   var $$TMP28;
   $$TMP28=(function(obj){
      var $$TMP29;
$$TMP29=$$root["geti"](obj,field);
return $$TMP29;
}
);
return $$TMP28;
}
);
$$root["getter"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP30;
   var $$TMP31;
if($$root["null?"](lst)){
   $$TMP31=accum;
}
else{
$$TMP31=$$root["reduce"](r,$$root["cdr"](lst),r(accum,$$root["car"](lst)));
}
$$TMP30=$$TMP31;
return $$TMP30;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP32;
$$TMP32=$$root["reduce"]((function(accum,v){
   var $$TMP33;
$$TMP33=$$root["cons"](v,accum);
return $$TMP33;
}
),lst,[]);
return $$TMP32;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP34;
$$TMP34=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP34;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP35;
$$TMP35=$$root["transform-list"]((function(accum,v){
   var $$TMP36;
$$TMP36=$$root["cons"](f(v),accum);
return $$TMP36;
}
),lst);
return $$TMP35;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP37;
$$TMP37=$$root["transform-list"]((function(accum,v){
   var $$TMP38;
   var $$TMP39;
   if(p(v)){
$$TMP39=$$root["cons"](v,accum);
}
else{
   $$TMP39=accum;
}
$$TMP38=$$TMP39;
return $$TMP38;
}
),lst);
return $$TMP37;
}
);
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP40;
$$TMP40=$$root["transform-list"]((function(accum,v){
   var $$TMP41;
n=$$root["-"](n,1);
n;
var $$TMP42;
if($$root[">="](n,0)){
$$TMP42=$$root["cons"](v,accum);
}
else{
   $$TMP42=accum;
}
$$TMP41=$$TMP42;
return $$TMP41;
}
),lst);
return $$TMP40;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP43;
$$TMP43=$$root["transform-list"]((function(accum,v){
   var $$TMP44;
n=$$root["-"](n,1);
n;
var $$TMP45;
if($$root[">="](n,0)){
   $$TMP45=accum;
}
else{
$$TMP45=$$root["cons"](v,accum);
}
$$TMP44=$$TMP45;
return $$TMP44;
}
),lst);
return $$TMP43;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP46;
   $$TMP46=(function(counter){
      var $$TMP47;
$$TMP47=$$root["transform-list"]((function(accum,v){
   var $$TMP48;
   var $$TMP49;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
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
)(-1);
return $$TMP46;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP50;
   var $$TMP51;
if($$root["="](n,0)){
$$TMP51=$$root["car"](lst);
}
else{
$$TMP51=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP50=$$TMP51;
return $$TMP50;
}
);
$$root["nth"];
$$root["butlast"]=(function(n,lst){
   var $$TMP52;
$$TMP52=$$root["take"]($$root["-"]($$root["count"](lst),n),lst);
return $$TMP52;
}
);
$$root["butlast"];
$$root["last"]=(function(lst){
   var $$TMP53;
$$TMP53=$$root["reduce"]((function(accum,v){
   var $$TMP54;
   $$TMP54=v;
   return $$TMP54;
}
),lst,undefined);
return $$TMP53;
}
);
$$root["last"];
$$root["count"]=(function(lst){
   var $$TMP55;
$$TMP55=$$root["reduce"]((function(accum,v){
   var $$TMP56;
$$TMP56=$$root["inc"](accum);
return $$TMP56;
}
),lst,0);
return $$TMP55;
}
);
$$root["count"];
$$root["zip"]=(function(a,...more){
   var $$TMP57;
   $$TMP57=(function(args){
      var $$TMP58;
      var $$TMP59;
if($$root["reduce"]((function(accum,v){
   var $$TMP60;
   $$TMP60=(function(c){
      var $$TMP61;
      var $$TMP62;
      if(c){
         $$TMP62=c;
      }
      else{
$$TMP62=$$root["null?"](v);
}
$$TMP61=$$TMP62;
return $$TMP61;
}
)(accum);
return $$TMP60;
}
),args,false)){
   $$TMP59=[];
}
else{
$$TMP59=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP58=$$TMP59;
return $$TMP58;
}
)($$root["cons"](a,more));
return $$TMP57;
}
);
$$root["zip"];
$$root["let"]=(function(bindings,...body){
   var $$TMP63;
$$TMP63=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP63;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP64;
   $$TMP64=(function(fst){
      var $$TMP65;
$$TMP65=$$root["transform-list"]((function(accum,v){
   var $$TMP66;
   var $$TMP67;
   if(fst){
      $$TMP67=(function(){
         var $$TMP68;
         fst=false;
         fst;
$$TMP68=$$root["cons"](v,accum);
return $$TMP68;
}
)();
}
else{
$$TMP67=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP66=$$TMP67;
return $$TMP66;
}
),lst);
return $$TMP65;
}
)(true);
return $$TMP64;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP69;
$$TMP69=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP69;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP70;
   $$TMP70=(function(idx){
      var $$TMP71;
$$TMP71=$$root["reduce"]((function(accum,v){
   var $$TMP72;
idx=$$root["+"](idx,1);
idx;
var $$TMP73;
if(f(arg,v)){
   $$TMP73=idx;
}
else{
   $$TMP73=accum;
}
$$TMP72=$$TMP73;
return $$TMP72;
}
),lst,-1);
return $$TMP71;
}
)(-1);
return $$TMP70;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP74;
   var $$TMP75;
if($$root["atom?"](x)){
$$TMP75=$$root["list"](x);
}
else{
$$TMP75=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP74=$$TMP75;
return $$TMP74;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP76;
   $$TMP76=(function(idx){
      var $$TMP77;
$$TMP77=$$root["transform-list"]((function(accum,v){
   var $$TMP78;
idx=$$root["+"](idx,1);
$$TMP78=$$root["cons"](f(v,idx),accum);
return $$TMP78;
}
),lst);
return $$TMP77;
}
)(-1);
return $$TMP76;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP79;
$$TMP79=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP79;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP80;
   var $$TMP81;
if($$root["null?"](lst)){
   $$TMP81=[];
}
else{
$$TMP81=$$root["reverse"]((function(recur){
   var $$TMP82;
   recur=(function(accum,part,rem,counter){
      var $$TMP83;
      var $$TMP84;
if($$root["null?"](rem)){
$$TMP84=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP85;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP85=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP85=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP84=$$TMP85;
}
$$TMP83=$$TMP84;
return $$TMP83;
}
);
recur;
$$TMP82=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP82;
}
)([]));
}
$$TMP80=$$TMP81;
return $$TMP80;
}
);
$$root["partition"];
$$root["method"]=(function(args,...body){
   var $$TMP86;
$$TMP86=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP86;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args,...body){
   var $$TMP87;
$$TMP87=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP87;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto,...args){
   var $$TMP88;
   $$TMP88=(function(instance){
      var $$TMP89;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP89=instance;
return $$TMP89;
}
)($$root["object"](proto));
return $$TMP88;
}
);
$$root["make-instance"];
$$root["call-method-by-name"]=(function(obj,name,...args){
   var $$TMP90;
$$TMP90=$$root["apply-method"]($$root["geti"](obj,name),obj,args);
return $$TMP90;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP91;
   var $$TMP92;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP92=obj__MINUSname;
}
else{
   var $$TMP93;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP93=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP93=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP92=$$TMP93;
}
$$TMP91=$$TMP92;
return $$TMP91;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP94;
$$TMP94=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP94;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP95;
   var $$TMP96;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP96=obj__MINUSname;
}
else{
$$TMP96=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP95=$$TMP96;
return $$TMP95;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname,...fields){
   var $$TMP97;
$$TMP97=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP97;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP98;
$$TMP98=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP98;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP99;
   var $$TMP100;
if($$root["null?"](a)){
$$TMP100=$$root["null?"](b);
}
else{
   var $$TMP101;
if($$root["symbol?"](a)){
   var $$TMP102;
if($$root["symbol?"](b)){
   var $$TMP103;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP103=true;
}
else{
   $$TMP103=false;
}
$$TMP102=$$TMP103;
}
else{
   $$TMP102=false;
}
$$TMP101=$$TMP102;
}
else{
   var $$TMP104;
if($$root["atom?"](a)){
$$TMP104=$$root["="](a,b);
}
else{
   var $$TMP105;
if($$root["list?"](a)){
   var $$TMP106;
if($$root["list?"](b)){
   var $$TMP107;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP108;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP108=true;
}
else{
   $$TMP108=false;
}
$$TMP107=$$TMP108;
}
else{
   $$TMP107=false;
}
$$TMP106=$$TMP107;
}
else{
   $$TMP106=false;
}
$$TMP105=$$TMP106;
}
else{
   $$TMP105=undefined;
}
$$TMP104=$$TMP105;
}
$$TMP101=$$TMP104;
}
$$TMP100=$$TMP101;
}
$$TMP99=$$TMP100;
return $$TMP99;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP109;
   $$TMP109=(function(res){
      var $$TMP115;
$$TMP115=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP115;
}
)((function(recur){
   var $$TMP110;
   recur=(function(l1,l2){
      var $$TMP111;
      var $$TMP112;
      if((function(c){
         var $$TMP113;
         var $$TMP114;
         if(c){
            $$TMP114=c;
         }
         else{
$$TMP114=p($$root["car"](l2));
}
$$TMP113=$$TMP114;
return $$TMP113;
}
)($$root["null?"](l2))){
$$TMP112=$$root["list"](l1,l2);
}
else{
$$TMP112=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP111=$$TMP112;
return $$TMP111;
}
);
recur;
$$TMP110=recur([],lst);
return $$TMP110;
}
)([]));
return $$TMP109;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP116;
   var $$TMP117;
if($$root["reduce"]((function(accum,v){
   var $$TMP118;
   var $$TMP119;
   if(accum){
      $$TMP119=accum;
   }
   else{
      $$TMP119=v;
   }
   $$TMP118=$$TMP119;
   return $$TMP118;
}
),lst,false)){
   $$TMP117=true;
}
else{
   $$TMP117=false;
}
$$TMP116=$$TMP117;
return $$TMP116;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP120;
$$TMP120=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP121;
   var $$TMP122;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP123;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP123=true;
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
return $$TMP121;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP120;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP124;
   $$TMP124=(function(binding__MINUSnames){
      var $$TMP125;
      $$TMP125=(function(divs){
         var $$TMP127;
         var $$TMP128;
if($$root["null?"]($$root["second"](divs))){
$$TMP128=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP128=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP127=$$TMP128;
return $$TMP127;
}
)($$root["split"]((function(pair){
   var $$TMP126;
$$TMP126=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP126;
}
),binding__MINUSpairs));
return $$TMP125;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP124;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP129;
$$TMP129=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP129;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP130;
   $$TMP130=(function(x){
      var $$TMP131;
$$TMP131=$$root["not"](f(x));
return $$TMP131;
}
);
return $$TMP130;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP132;
   $$TMP132=(function(...args){
      var $$TMP133;
$$TMP133=f1($$root["apply"](f2,args));
return $$TMP133;
}
);
return $$TMP132;
}
);
$$root["compose"];
$$root["partial"]=(function(f,...args1){
   var $$TMP134;
   $$TMP134=(function(...args2){
      var $$TMP135;
$$TMP135=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP135;
}
);
return $$TMP134;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield,...args1){
   var $$TMP136;
   $$TMP136=(function(...args2){
      var $$TMP137;
$$TMP137=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP137;
}
);
return $$TMP136;
}
);
$$root["partial-method"];
$$root["format"]=(function(...args){
   var $$TMP138;
   $$TMP138=(function(rx){
      var $$TMP139;
$$TMP139=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP140;
$$TMP140=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP140;
}
));
return $$TMP139;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP138;
}
);
$$root["format"];
$$root["case"]=(function(e,...pairs){
   var $$TMP141;
   $$TMP141=(function(e__MINUSname,def__MINUSidx){
      var $$TMP142;
      var $$TMP143;
if($$root["="](def__MINUSidx,-1)){
$$TMP143=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
}
else{
$$TMP143=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP142=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP144;
$$TMP144=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP145;
$$TMP145=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP145;
}
),$$root["filter"]((function(pair){
   var $$TMP146;
$$TMP146=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP146;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP144;
}
)($$TMP143,$$root["partition"](2,pairs));
return $$TMP142;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP141;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP147;
   $$TMP147=(function(expr__MINUSname){
      var $$TMP148;
$$TMP148=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP149;
   var $$TMP150;
if($$root["symbol?"](v)){
   var $$TMP151;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP151=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP152;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP152=[];
}
else{
$$TMP152=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP151=$$TMP152;
}
$$TMP150=$$TMP151;
}
else{
$$TMP150=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP149=$$TMP150;
return $$TMP149;
}
),structure)));
return $$TMP148;
}
)($$root["gensym"]());
return $$TMP147;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP153;
   var $$TMP154;
if($$root["symbol?"](structure)){
$$TMP154=$$root["list"](structure,expr);
}
else{
$$TMP154=$$root["destruct-helper"](structure,expr);
}
$$TMP153=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP154),body);
return $$TMP153;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP155;
   var $$TMP156;
if($$root["list?"](expr)){
   var $$TMP157;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP157=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP157=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP156=$$TMP157;
}
else{
   $$TMP156=expr;
}
$$TMP155=$$TMP156;
return $$TMP155;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP158;
   var $$TMP159;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP159=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP160;
   var $$TMP161;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP162;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP162=true;
}
else{
   $$TMP162=false;
}
$$TMP161=$$TMP162;
}
else{
   $$TMP161=false;
}
if($$TMP161){
$$TMP160=$$root["list?"](expr);
}
else{
   var $$TMP163;
   if(true){
      var $$TMP164;
      var $$TMP165;
if($$root["list?"](expr)){
   var $$TMP166;
if($$root["not"]($$root["null?"](expr))){
   $$TMP166=true;
}
else{
   $$TMP166=false;
}
$$TMP165=$$TMP166;
}
else{
   $$TMP165=false;
}
if($$TMP165){
   var $$TMP167;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP168;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP168=true;
}
else{
   $$TMP168=false;
}
$$TMP167=$$TMP168;
}
else{
   $$TMP167=false;
}
$$TMP164=$$TMP167;
}
else{
   $$TMP164=false;
}
$$TMP163=$$TMP164;
}
else{
   $$TMP163=undefined;
}
$$TMP160=$$TMP163;
}
$$TMP159=$$TMP160;
}
$$TMP158=$$TMP159;
return $$TMP158;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP169;
   var $$TMP170;
if($$root["null?"](patt)){
$$TMP170=$$root["null?"](expr);
}
else{
   var $$TMP171;
if($$root["list?"](patt)){
$$TMP171=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP172;
if($$root["symbol?"](patt)){
   $$TMP172=true;
}
else{
   var $$TMP173;
   if(true){
$$TMP173=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP173=undefined;
}
$$TMP172=$$TMP173;
}
$$TMP171=$$TMP172;
}
$$TMP170=$$TMP171;
}
$$TMP169=$$TMP170;
return $$TMP169;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP174;
   var $$TMP175;
   var $$TMP176;
if($$root["list?"](patt)){
   var $$TMP177;
if($$root["not"]($$root["null?"](patt))){
   $$TMP177=true;
}
else{
   $$TMP177=false;
}
$$TMP176=$$TMP177;
}
else{
   $$TMP176=false;
}
if($$TMP176){
   var $$TMP178;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP178=(new $$root.Symbol("_"));
}
else{
$$TMP178=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP175=$$TMP178;
}
else{
   $$TMP175=patt;
}
$$TMP174=$$TMP175;
return $$TMP174;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP179;
   $$TMP179=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP180;
$$TMP180=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP181;
$$TMP181=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP181;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP180;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP179;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP182;
   $$TMP182=(function(__GS1){
      var $$TMP183;
      var $$TMP184;
if($$root["matches?"](__GS1,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("geti")),[])),$$root.cons((new $$root.Symbol("obj")),$$root.cons((new $$root.Symbol("field")),[]))))){
   $$TMP184=(function(__GS2){
      var $$TMP185;
      $$TMP185=(function(obj,field){
         var $$TMP186;
$$TMP186=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP186;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP185;
}
)(__GS1);
}
else{
   var $$TMP187;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP187=(function(any){
      var $$TMP188;
      var $$TMP189;
if($$root["symbol?"](any)){
$$TMP189=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP189=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP188=$$TMP189;
return $$TMP188;
}
)(__GS1);
}
else{
   var $$TMP190;
   if(true){
$$TMP190=$$root["error"]("Fell out of case!");
}
else{
   $$TMP190=undefined;
}
$$TMP187=$$TMP190;
}
$$TMP184=$$TMP187;
}
$$TMP183=$$TMP184;
return $$TMP183;
}
)($$root["macroexpand"](place));
return $$TMP182;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP191;
   amt=(function(c){
      var $$TMP192;
      var $$TMP193;
      if(c){
         $$TMP193=c;
      }
      else{
         $$TMP193=1;
      }
      $$TMP192=$$TMP193;
      return $$TMP192;
   }
   )(amt);
   amt;
$$TMP191=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP191;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP194;
   amt=(function(c){
      var $$TMP195;
      var $$TMP196;
      if(c){
         $$TMP196=c;
      }
      else{
         $$TMP196=1;
      }
      $$TMP195=$$TMP196;
      return $$TMP195;
   }
   )(amt);
   amt;
$$TMP194=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP194;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP197;
$$TMP197=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP197;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP198;
   var $$TMP199;
if($$root["null?"](forms)){
   $$TMP199=x;
}
else{
$$TMP199=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP198=$$TMP199;
return $$TMP198;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["doto"]=(function(obj__MINUSexpr,...body){
   var $$TMP200;
   $$TMP200=(function(binding__MINUSname){
      var $$TMP201;
$$TMP201=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP202;
   $$TMP202=(function(__GS3){
      var $$TMP203;
      $$TMP203=(function(f,args){
         var $$TMP204;
$$TMP204=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP204;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP203;
}
)(v);
return $$TMP202;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP201;
}
)($$root["gensym"]());
return $$TMP200;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["while"]=(function(c,...body){
   var $$TMP205;
$$TMP205=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP205;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP206;
$$TMP206=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP206;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP207;
   step=(function(c){
      var $$TMP208;
      var $$TMP209;
      if(c){
         $$TMP209=c;
      }
      else{
         $$TMP209=1;
      }
      $$TMP208=$$TMP209;
      return $$TMP208;
   }
   )(step);
   step;
   $$TMP207=(function(data){
      var $$TMP210;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP210=data;
return $$TMP210;
}
)($$root["object"]([]));
return $$TMP207;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP211;
   $$TMP211=(function(len__MINUSname,data){
      var $$TMP212;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP212=data;
return $$TMP212;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP211;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP213;
   $$TMP213=(function(lst__MINUSname,data){
      var $$TMP214;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP214=data;
return $$TMP214;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP213;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP215;
   $$TMP215=(function(__GS4){
      var $$TMP216;
      $$TMP216=(function(binding__MINUSname,__GS5){
         var $$TMP217;
         $$TMP217=(function(func__MINUSname,args){
            var $$TMP218;
$$TMP218=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP218;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP217;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP216;
}
)(form);
return $$TMP215;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP219;
   $$TMP219=(function(data){
      var $$TMP220;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP220=data;
return $$TMP220;
}
)($$root["object"]([]));
return $$TMP219;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP221;
   $$TMP221=(function(data){
      var $$TMP222;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP222=data;
return $$TMP222;
}
)($$root["object"]([]));
return $$TMP221;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP223;
   $$TMP223=(function(data){
      var $$TMP224;
      (function(__GS6){
         var $$TMP225;
         $$TMP225=(function(binding__MINUSname,body){
            var $$TMP226;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP226=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP226;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP225;
}
)(form);
$$TMP224=data;
return $$TMP224;
}
)($$root["object"]([]));
return $$TMP223;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP227;
   $$TMP227=(function(data){
      var $$TMP228;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP228=data;
return $$TMP228;
}
)($$root["object"]([]));
return $$TMP227;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP229;
   $$TMP229=(function(data,accum__MINUSname){
      var $$TMP230;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP230=data;
return $$TMP230;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP229;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP231;
$$TMP231=$$root["filter"]((function(x){
   var $$TMP232;
$$TMP232=$$root["not="](x,undefined);
return $$TMP232;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP231;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP233;
   $$TMP233=(function(res__MINUSname){
      var $$TMP234;
      $$TMP234=(function(all){
         var $$TMP244;
         $$TMP244=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP246;
            var $$TMP247;
if($$root["null?"](final__MINUSactions)){
$$TMP247=$$root["list"](res__MINUSname);
}
else{
   $$TMP247=final__MINUSactions;
}
$$TMP246=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP247)))))));
return $$TMP246;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP245;
$$TMP245=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP245;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP244;
}
)($$root["map"]((function(form){
   var $$TMP235;
   $$TMP235=(function(__GS7){
      var $$TMP236;
      var $$TMP237;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP237=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP238;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP238=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP239;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP239=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP240;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP240=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP241;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP241=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP242;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP242=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP243;
   if(true){
$$TMP243=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP243=undefined;
}
$$TMP242=$$TMP243;
}
$$TMP241=$$TMP242;
}
$$TMP240=$$TMP241;
}
$$TMP239=$$TMP240;
}
$$TMP238=$$TMP239;
}
$$TMP237=$$TMP238;
}
$$TMP236=$$TMP237;
return $$TMP236;
}
)($$root["car"](form));
return $$TMP235;
}
),forms));
return $$TMP234;
}
)($$root["gensym"]());
return $$TMP233;
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
   var $$TMP248;
   $$TMP248=(function(self){
      var $$TMP249;
      $$TMP249=(function(__GS8){
         var $$TMP250;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP250=__GS8;
return $$TMP250;
}
)(self);
return $$TMP249;
}
)(this);
return $$TMP248;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP251;
   $$TMP251=(function(self){
      var $$TMP252;
$$TMP252=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP252;
}
)(this);
return $$TMP251;
}
));
$$root["lit"]=(function(s){
   var $$TMP253;
$$TMP253=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP253;
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
   var $$TMP254;
   $$TMP254=(function(toks,pos,s){
      var $$TMP255;
      (function(recur){
         var $$TMP256;
         recur=(function(){
            var $$TMP257;
            var $$TMP258;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP258=(function(){
      var $$TMP259;
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP260;
         $$TMP260=(function(recur){
            var $$TMP261;
            recur=(function(){
               var $$TMP262;
               var $$TMP263;
               var $$TMP264;
if($$root["<"](i,__GS10)){
   var $$TMP265;
if($$root["not"]($$root["null?"](__GS11))){
   var $$TMP266;
if($$root["not"](res)){
   $$TMP266=true;
}
else{
   $$TMP266=false;
}
$$TMP265=$$TMP266;
}
else{
   $$TMP265=false;
}
$$TMP264=$$TMP265;
}
else{
   $$TMP264=false;
}
if($$TMP264){
   $$TMP263=(function(){
      var $$TMP267;
entry=$$root["car"](__GS11);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP267=recur();
return $$TMP267;
}
)();
}
else{
   $$TMP263=(function(){
      var $$TMP268;
      _=__GS9;
      _;
      var $$TMP269;
      if(res){
         $$TMP269=(function(){
            var $$TMP270;
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP271;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP271=(function(){
      var $$TMP272;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP273;
   var $$TMP274;
   if(c){
      $$TMP274=c;
   }
   else{
$$TMP274=$$root["second"](entry);
}
$$TMP273=$$TMP274;
return $$TMP273;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP272=toks;
return $$TMP272;
}
)();
}
else{
   $$TMP271=undefined;
}
$$TMP271;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP270=pos;
return $$TMP270;
}
)();
}
else{
$$TMP269=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP269;
$$TMP268=__GS9;
return $$TMP268;
}
)();
}
$$TMP262=$$TMP263;
return $$TMP262;
}
);
recur;
$$TMP261=recur();
return $$TMP261;
}
)([]);
return $$TMP260;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP259=recur();
return $$TMP259;
}
)();
}
else{
   $$TMP258=undefined;
}
$$TMP257=$$TMP258;
return $$TMP257;
}
);
recur;
$$TMP256=recur();
return $$TMP256;
}
)([]);
$$TMP255=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP255;
}
)([],0,src);
return $$TMP254;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP275;
   $$TMP275=(function(self){
      var $$TMP276;
$$TMP276=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP276;
}
)(this);
return $$TMP275;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP277;
   $$TMP277=(function(self){
      var $$TMP278;
$$TMP278=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP278;
}
)(this);
return $$TMP277;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP279;
   $$TMP279=(function(self){
      var $$TMP280;
      $$TMP280=(function(curr){
         var $$TMP281;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP281=curr;
return $$TMP281;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP280;
}
)(this);
return $$TMP279;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP282;
$$TMP282=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP282;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP283;
$$TMP283=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP283;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP284;
   $$TMP284=(function(self){
      var $$TMP285;
      $$TMP285=(function(tok){
         var $$TMP286;
         $$TMP286=(function(__GS12){
            var $$TMP287;
            var $$TMP288;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
$$TMP288=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP289;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP289=true;
}
else{
   var $$TMP290;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP290=false;
}
else{
   var $$TMP291;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP291=[];
}
else{
   var $$TMP292;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP292=undefined;
}
else{
   var $$TMP293;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP293=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP294;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP294=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP295;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP295=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP296;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
$$TMP296=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP297;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP297=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP298;
   if(true){
$$TMP298=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
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
}
$$TMP290=$$TMP291;
}
$$TMP289=$$TMP290;
}
$$TMP288=$$TMP289;
}
$$TMP287=$$TMP288;
return $$TMP287;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP286;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP285;
}
)(this);
return $$TMP284;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP299;
   $$TMP299=(function(self){
      var $$TMP300;
      $$TMP300=(function(start__MINUSpos){
         var $$TMP301;
         $$TMP301=(function(__GS13,__GS14,lst){
            var $$TMP302;
            $$TMP302=(function(recur){
               var $$TMP303;
               recur=(function(){
                  var $$TMP304;
                  var $$TMP305;
                  var $$TMP306;
                  var $$TMP307;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP308;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP308=true;
}
else{
   $$TMP308=false;
}
$$TMP307=$$TMP308;
}
else{
   $$TMP307=false;
}
if($$TMP307){
   $$TMP306=true;
}
else{
   $$TMP306=false;
}
if($$TMP306){
   $$TMP305=(function(){
      var $$TMP309;
__GS14=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS14);
__GS13=__GS14;
__GS13;
$$TMP309=recur();
return $$TMP309;
}
)();
}
else{
   $$TMP305=(function(){
      var $$TMP310;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP311;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP311=lst;
}
else{
$$TMP311=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP311;
$$TMP310=__GS13;
return $$TMP310;
}
)();
}
$$TMP304=$$TMP305;
return $$TMP304;
}
);
recur;
$$TMP303=recur();
return $$TMP303;
}
)([]);
return $$TMP302;
}
)(undefined,[],undefined);
return $$TMP301;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("pos"))));
return $$TMP300;
}
)(this);
return $$TMP299;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP312;
   $$TMP312=(function(self){
      var $$TMP313;
      $$TMP313=(function(__GS15,__GS16,lst){
         var $$TMP314;
         $$TMP314=(function(recur){
            var $$TMP315;
            recur=(function(){
               var $$TMP316;
               var $$TMP317;
               var $$TMP318;
               var $$TMP319;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP320;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP320=true;
}
else{
   $$TMP320=false;
}
$$TMP319=$$TMP320;
}
else{
   $$TMP319=false;
}
if($$TMP319){
   $$TMP318=true;
}
else{
   $$TMP318=false;
}
if($$TMP318){
   $$TMP317=(function(){
      var $$TMP321;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP322;
   var $$TMP323;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP323=(function(){
      var $$TMP324;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP324=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
return $$TMP324;
}
)();
}
else{
   var $$TMP325;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP325=(function(){
      var $$TMP326;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP326=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
return $$TMP326;
}
)();
}
else{
   var $$TMP327;
   if(true){
$$TMP327=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP327=undefined;
}
$$TMP325=$$TMP327;
}
$$TMP323=$$TMP325;
}
$$TMP322=$$TMP323;
return $$TMP322;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP321=recur();
return $$TMP321;
}
)();
}
else{
   $$TMP317=(function(){
      var $$TMP328;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP329;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP329=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP329=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP329;
$$TMP328=__GS15;
return $$TMP328;
}
)();
}
$$TMP316=$$TMP317;
return $$TMP316;
}
);
recur;
$$TMP315=recur();
return $$TMP315;
}
)([]);
return $$TMP314;
}
)(undefined,[],undefined);
return $$TMP313;
}
)(this);
return $$TMP312;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP330;
   $$TMP330=(function(self){
      var $$TMP331;
      var $$TMP332;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP332=(function(){
      var $$TMP333;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP333=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
return $$TMP333;
}
)();
}
else{
$$TMP332=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP331=$$TMP332;
return $$TMP331;
}
)(this);
return $$TMP330;
}
));
$$root["parse"]=(function(toks){
   var $$TMP334;
   $$TMP334=(function(p){
      var $$TMP335;
      $$TMP335=(function(__GS18,__GS19){
         var $$TMP336;
         $$TMP336=(function(recur){
            var $$TMP337;
            recur=(function(){
               var $$TMP338;
               var $$TMP339;
               var $$TMP340;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP340=true;
}
else{
   $$TMP340=false;
}
if($$TMP340){
   $$TMP339=(function(){
      var $$TMP341;
__GS19=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS19);
__GS18=__GS19;
__GS18;
$$TMP341=recur();
return $$TMP341;
}
)();
}
else{
   $$TMP339=(function(){
      var $$TMP342;
__GS18=$$root["reverse"](__GS19);
$$TMP342=__GS18;
return $$TMP342;
}
)();
}
$$TMP338=$$TMP339;
return $$TMP338;
}
);
recur;
$$TMP337=recur();
return $$TMP337;
}
)([]);
return $$TMP336;
}
)(undefined,[]);
return $$TMP335;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP334;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP343;
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
$$TMP343=__GS20;
return $$TMP343;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP344;
$$TMP344=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP344;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP345;$$TMP345=$$root["geti"]($$root["mangling-table"],x);return $$TMP345;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP346;$$TMP346=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);return $$TMP346;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){var $$TMP347;$$TMP347=(function(self){var $$TMP348;$$TMP348=(function(__GS21){var $$TMP349;$$root["seti!"](__GS21,"root",root);$$root["seti!"](__GS21,"next-var-suffix",0);$$TMP349=__GS21;return $$TMP349;})(self);return $$TMP348;})(this);return $$TMP347;}));$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP350;$$TMP350=(function(self){var $$TMP351;$$TMP351=(function(out){var $$TMP352;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP352=out;return $$TMP352;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP351;})(this);return $$TMP350;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP353;var $$TMP354;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP354=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP354=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP353=$$TMP354;
return $$TMP353;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP355;
   $$TMP355=(function(self){
      var $$TMP356;
      var $$TMP357;
if($$root["="](x,true)){
$$TMP357=$$root["list"]("true","");
}
else{
   var $$TMP358;
if($$root["="](x,false)){
$$TMP358=$$root["list"]("false","");
}
else{
   var $$TMP359;
if($$root["null?"](x)){
$$TMP359=$$root["list"]("[]","");
}
else{
   var $$TMP360;
if($$root["="](x,undefined)){
$$TMP360=$$root["list"]("undefined","");
}
else{
   var $$TMP361;
if($$root["symbol?"](x)){
$$TMP361=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP362;
if($$root["string?"](x)){
$$TMP362=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP363;
   if(true){
$$TMP363=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP363=undefined;
}
$$TMP362=$$TMP363;
}
$$TMP361=$$TMP362;
}
$$TMP360=$$TMP361;
}
$$TMP359=$$TMP360;
}
$$TMP358=$$TMP359;
}
$$TMP357=$$TMP358;
}
$$TMP356=$$TMP357;
return $$TMP356;
}
)(this);
return $$TMP355;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP364;
   $$TMP364=(function(self){
      var $$TMP365;
      $$TMP365=(function(__GS22){
         var $$TMP366;
         $$TMP366=(function(fun,args){
            var $$TMP367;
            $$TMP367=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP368;
$$TMP368=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP368;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP367;
}
)($$root["nth"](0,__GS22),$$root["drop"](1,__GS22));
return $$TMP366;
}
)(lst);
return $$TMP365;
}
)(this);
return $$TMP364;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP369;
   $$TMP369=(function(self){
      var $$TMP370;
      $$TMP370=(function(__GS23){
         var $$TMP371;
         $$TMP371=(function(fun,args){
            var $$TMP372;
            $$TMP372=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP373;
$$TMP373=$$root["list"]($$root["format"]("(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP373;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP372;
}
)($$root["nth"](1,__GS23),$$root["drop"](2,__GS23));
return $$TMP371;
}
)(lst);
return $$TMP370;
}
)(this);
return $$TMP369;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP374;
   $$TMP374=(function(self){
      var $$TMP375;
      $$TMP375=(function(__GS24){
         var $$TMP376;
         $$TMP376=(function(method,obj,args){
            var $$TMP377;
            $$TMP377=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP378;
$$TMP378=$$root["list"]($$root["format"]("(%0)%1(%2)",$$root["first"](compiled__MINUSobj),method,$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSobj),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP378;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP377;
}
)($$root["nth"](0,__GS24),$$root["nth"](1,__GS24),$$root["drop"](2,__GS24));
return $$TMP376;
}
)(lst);
return $$TMP375;
}
)(this);
return $$TMP374;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP379;
   $$TMP379=(function(self){
      var $$TMP380;
      $$TMP380=(function(compiled__MINUSbody,reducer){
         var $$TMP382;
$$TMP382=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP382;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP381;
$$TMP381=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP381;
}
));
return $$TMP380;
}
)(this);
return $$TMP379;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP383;
$$TMP383=$$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP383;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP384;
   var $$TMP385;
if($$root["is-vararg?"](sym)){
$$TMP385=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP385=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP384=$$TMP385;
return $$TMP384;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP386;
$$TMP386=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP387;
$$TMP387=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
return $$TMP387;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP386;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP388;
   $$TMP388=(function(self){
      var $$TMP389;
      var $$TMP390;
if($$root["not"]($$root["null?"](args))){
   $$TMP390=(function(){
      var $$TMP391;
$$TMP391=$$root["last"](args);
return $$TMP391;
}
)();
}
else{
   $$TMP390=undefined;
}
$$TMP389=(function(last__MINUSarg){
   var $$TMP392;
   var $$TMP393;
   var $$TMP394;
   if(last__MINUSarg){
      var $$TMP395;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP395=true;
}
else{
   $$TMP395=false;
}
$$TMP394=$$TMP395;
}
else{
   $$TMP394=false;
}
if($$TMP394){
$$TMP393=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP393="";
}
$$TMP392=$$TMP393;
return $$TMP392;
}
)($$TMP390);
return $$TMP389;
}
)(this);
return $$TMP388;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP396;
   $$TMP396=(function(self){
      var $$TMP397;
      $$TMP397=(function(__GS25){
         var $$TMP398;
         $$TMP398=(function(__GS26){
            var $$TMP399;
            $$TMP399=(function(args,body){
               var $$TMP400;
               $$TMP400=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP402;
                  $$TMP402=(function(compiled__MINUSbody){
                     var $$TMP403;
$$TMP403=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP403;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP402;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP401;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP401=accum;
return $$TMP401;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP400;
}
)($$root["drop"](0,__GS26),$$root["drop"](2,__GS25));
return $$TMP399;
}
)($$root["nth"](1,__GS25));
return $$TMP398;
}
)(lst);
return $$TMP397;
}
)(this);
return $$TMP396;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP404;
   $$TMP404=(function(self){
      var $$TMP405;
      $$TMP405=(function(__GS27){
         var $$TMP406;
         $$TMP406=(function(c,t,f){
            var $$TMP407;
            $$TMP407=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP408;
$$TMP408=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP408;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP407;
}
)($$root["nth"](1,__GS27),$$root["nth"](2,__GS27),$$root["nth"](3,__GS27));
return $$TMP406;
}
)(lst);
return $$TMP405;
}
)(this);
return $$TMP404;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP409;
   $$TMP409=(function(self){
      var $$TMP410;
      var $$TMP411;
if($$root["symbol?"](x)){
$$TMP411=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
$$TMP411=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP410=$$TMP411;
return $$TMP410;
}
)(this);
return $$TMP409;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP412;
   $$TMP412=(function(self){
      var $$TMP413;
$$TMP413=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP413;
}
)(this);
return $$TMP412;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP414;
   $$TMP414=(function(self){
      var $$TMP415;
      var $$TMP416;
if($$root["atom?"](x)){
$$TMP416=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP416=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP415=$$TMP416;
return $$TMP415;
}
)(this);
return $$TMP414;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP417;
   $$TMP417=(function(self){
      var $$TMP418;
      $$TMP418=(function(__GS28){
         var $$TMP419;
         $$TMP419=(function(name,value){
            var $$TMP420;
            $$TMP420=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP421;
$$TMP421=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP421;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP420;
}
)($$root["nth"](1,__GS28),$$root["nth"](2,__GS28));
return $$TMP419;
}
)(lst);
return $$TMP418;
}
)(this);
return $$TMP417;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP422;
   $$TMP422=(function(self){
      var $$TMP423;
      $$TMP423=(function(__GS29){
         var $$TMP424;
         $$TMP424=(function(name,args){
            var $$TMP425;
            $$TMP425=(function(tmp){
               var $$TMP427;
$$TMP427=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP427;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP426;
$$TMP426=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP426;
}
),args))));
return $$TMP425;
}
)($$root["nth"](0,__GS29),$$root["drop"](1,__GS29));
return $$TMP424;
}
)(expr);
return $$TMP423;
}
)(this);
return $$TMP422;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP428;
   $$TMP428=(function(self){
      var $$TMP429;
      var $$TMP430;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP431;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP431=true;
}
else{
   $$TMP431=false;
}
$$TMP430=$$TMP431;
}
else{
   $$TMP430=false;
}
$$TMP429=$$TMP430;
return $$TMP429;
}
)(this);
return $$TMP428;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP432;
   $$TMP432=(function(self){
      var $$TMP433;
      var $$TMP434;
      var $$TMP435;
if($$root["list?"](expr)){
   var $$TMP436;
if($$root["not"]($$root["null?"](expr))){
   $$TMP436=true;
}
else{
   $$TMP436=false;
}
$$TMP435=$$TMP436;
}
else{
   $$TMP435=false;
}
if($$TMP435){
   $$TMP434=(function(first){
      var $$TMP437;
      var $$TMP438;
if($$root["symbol?"](first)){
   $$TMP438=(function(__GS30){
      var $$TMP439;
      var $$TMP440;
if($$root["equal?"](__GS30,(new $$root.Symbol("lambda")))){
$$TMP440=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP441;
if($$root["equal?"](__GS30,(new $$root.Symbol("new")))){
$$TMP441=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP442;
if($$root["equal?"](__GS30,(new $$root.Symbol("if")))){
$$TMP442=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP443;
if($$root["equal?"](__GS30,(new $$root.Symbol("quote")))){
$$TMP443=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP444;
if($$root["equal?"](__GS30,(new $$root.Symbol("setv!")))){
$$TMP444=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP445;
if($$root["equal?"](__GS30,(new $$root.Symbol("def")))){
$$TMP445=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP446;
   if(true){
      var $$TMP447;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP447=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP448;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP448=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP449;
   if(true){
$$TMP449=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP449=undefined;
}
$$TMP448=$$TMP449;
}
$$TMP447=$$TMP448;
}
$$TMP446=$$TMP447;
}
else{
   $$TMP446=undefined;
}
$$TMP445=$$TMP446;
}
$$TMP444=$$TMP445;
}
$$TMP443=$$TMP444;
}
$$TMP442=$$TMP443;
}
$$TMP441=$$TMP442;
}
$$TMP440=$$TMP441;
}
$$TMP439=$$TMP440;
return $$TMP439;
}
)(first);
}
else{
$$TMP438=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP437=$$TMP438;
return $$TMP437;
}
)($$root["car"](expr));
}
else{
$$TMP434=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP433=$$TMP434;
return $$TMP433;
}
)(this);
return $$TMP432;
}
));
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["default-lexenv"]=(function(){
   var $$TMP450;
   $$TMP450=(function(__GS31){
      var $$TMP451;
$$root["seti!"](__GS31,"this",true);
$$TMP451=__GS31;
return $$TMP451;
}
)($$root["object"]());
return $$TMP450;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP452;
   $$TMP452=(function(self){
      var $$TMP453;
      $$TMP453=(function(root,sandbox){
         var $$TMP454;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP455;
$$TMP455=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP455;
}
));
$$TMP454=(function(__GS32){
   var $$TMP456;
$$root["seti!"](__GS32,"root",root);
$$root["seti!"](__GS32,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP456=__GS32;
return $$TMP456;
}
)(self);
return $$TMP454;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP453;
}
)(this);
return $$TMP452;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP457;
   $$TMP457=(function(self){
      var $$TMP458;
      $$TMP458=(function(tmp){
         var $$TMP459;
$$TMP459=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP459;
}
)($$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP458;
}
)(this);
return $$TMP457;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP460;
   $$TMP460=(function(self){
      var $$TMP461;
      $$TMP461=(function(forms){
         var $$TMP462;
         $$TMP462=(function(__GS33,__GS34,form){
            var $$TMP463;
            $$TMP463=(function(recur){
               var $$TMP464;
               recur=(function(){
                  var $$TMP465;
                  var $$TMP466;
                  var $$TMP467;
if($$root["not"]($$root["null?"](__GS34))){
   $$TMP467=true;
}
else{
   $$TMP467=false;
}
if($$TMP467){
   $$TMP466=(function(){
      var $$TMP468;
form=$$root["car"](__GS34);
form;
__GS33=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS33;
__GS34=$$root["cdr"](__GS34);
__GS34;
$$TMP468=recur();
return $$TMP468;
}
)();
}
else{
   $$TMP466=(function(){
      var $$TMP469;
      $$TMP469=__GS33;
      return $$TMP469;
   }
   )();
}
$$TMP465=$$TMP466;
return $$TMP465;
}
);
recur;
$$TMP464=recur();
return $$TMP464;
}
)([]);
return $$TMP463;
}
)(undefined,forms,[]);
return $$TMP462;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP461;
}
)(this);
return $$TMP460;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP470;
   $$TMP470=(function(self){
      var $$TMP471;
$$TMP471=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["str"]($$root["second"](compilation__MINUSresult),$$root["first"](compilation__MINUSresult)));
return $$TMP471;
}
)(this);
return $$TMP470;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP472;
   $$TMP472=(function(self){
      var $$TMP473;
      $$TMP473=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP474;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP475;
   $$TMP475=(function(r){
      var $$TMP476;
      var $$TMP477;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   $$TMP477=(function(){
      var $$TMP478;
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti"](r,(new $$root.Symbol("code"))));
r;
$$TMP478=$$root["seti!"](target,name,r);
return $$TMP478;
}
)();
}
else{
   $$TMP477=undefined;
}
$$TMP477;
$$TMP476=r;
return $$TMP476;
}
)($$root["geti"](target,name));
return $$TMP475;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP479;
$$TMP479=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP479;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP480;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP480=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP480;
}
));
$$TMP474=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP474;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP473;
}
)(this);
return $$TMP472;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP481;
   $$TMP481=(function(self){
      var $$TMP482;
      $$TMP482=(function(lexenv){
         var $$TMP483;
         $$TMP483=(function(__GS35){
            var $$TMP484;
            var $$TMP485;
if($$root["matches?"](__GS35,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("def")),[])),$$root.cons((new $$root.Symbol("name")),$$root.cons((new $$root.Symbol("val")),[]))))){
   $$TMP485=(function(__GS36){
      var $$TMP486;
      $$TMP486=(function(name,val){
         var $$TMP487;
         $$TMP487=(function(tmp){
            var $$TMP488;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP488=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP488;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP487;
}
)($$root["nth"](1,__GS36),$$root["nth"](2,__GS36));
return $$TMP486;
}
)(__GS35);
}
else{
   var $$TMP489;
if($$root["matches?"](__GS35,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("setmac!")),[])),$$root.cons((new $$root.Symbol("name")),[])))){
   $$TMP489=(function(__GS37){
      var $$TMP490;
      $$TMP490=(function(name){
         var $$TMP491;
         $$TMP491=(function(tmp){
            var $$TMP492;
$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
$$TMP492=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP492;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP491;
}
)($$root["nth"](1,__GS37));
return $$TMP490;
}
)(__GS35);
}
else{
   var $$TMP493;
if($$root["matches?"](__GS35,$$root.cons($$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("lambda")),[])),$$root.cons($$root.cons((new $$root.Symbol("&args")),[]),$$root.cons((new $$root.Symbol("&body")),[]))),[]))){
   $$TMP493=(function(__GS38){
      var $$TMP494;
      $$TMP494=(function(__GS39){
         var $$TMP495;
         $$TMP495=(function(__GS40){
            var $$TMP496;
            $$TMP496=(function(args,body){
               var $$TMP497;
$$TMP497=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP497;
}
)($$root["drop"](0,__GS40),$$root["drop"](2,__GS39));
return $$TMP496;
}
)($$root["nth"](1,__GS39));
return $$TMP495;
}
)($$root["nth"](0,__GS38));
return $$TMP494;
}
)(__GS35);
}
else{
   var $$TMP498;
if($$root["matches?"](__GS35,$$root.cons((new $$root.Symbol("name")),$$root.cons((new $$root.Symbol("&args")),[])))){
   $$TMP498=(function(__GS41){
      var $$TMP499;
      $$TMP499=(function(name,args){
         var $$TMP500;
         var $$TMP501;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP501=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP501=(function(tmp){
      var $$TMP502;
$$TMP502=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP502;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP500=$$TMP501;
return $$TMP500;
}
)($$root["nth"](0,__GS41),$$root["drop"](1,__GS41));
return $$TMP499;
}
)(__GS35);
}
else{
   var $$TMP503;
if($$root["matches?"](__GS35,(new $$root.Symbol("any")))){
   $$TMP503=(function(any){
      var $$TMP504;
      $$TMP504=(function(tmp){
         var $$TMP505;
$$TMP505=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP505;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP504;
}
)(__GS35);
}
else{
   var $$TMP506;
   if(true){
$$TMP506=$$root["error"]("Fell out of case!");
}
else{
   $$TMP506=undefined;
}
$$TMP503=$$TMP506;
}
$$TMP498=$$TMP503;
}
$$TMP493=$$TMP498;
}
$$TMP489=$$TMP493;
}
$$TMP485=$$TMP489;
}
$$TMP484=$$TMP485;
return $$TMP484;
}
)(e);
return $$TMP483;
}
)($$root["default-lexenv"]());
return $$TMP482;
}
)(this);
return $$TMP481;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP507;
   $$TMP507=(function(self){
      var $$TMP508;
$$TMP508=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP508;
}
)(this);
return $$TMP507;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
