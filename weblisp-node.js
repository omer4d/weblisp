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
    else if(typeof x.toString === "function")
    	return x.toString();
	else
		return "[Unprintable object]";
}

function Symbol(name) {
    this.name = name;
}

Symbol.prototype.toString = function() {
    return this.name;
};

function makeDefaultNamespace() {
	var nextGensymSuffix = 0;
	var root = {
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
			return x === true || x === false || root["null?"](x) || x === undefined || root["number?"](x) || root["symbol?"](x) || root["string?"](x);
		},

		"list?": function list__QM(x) {
			return Array.isArray(x);
		},

		"=":  function __EQL() {
			var v = arguments[0];

			for (var i = 1; i < arguments.length; ++i)
				if (arguments[i] !== v && !(root["null?"](arguments[i]) && root["null?"](v)))
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
		"typeof": function(x) {
			if(x === null)
				return "null";
			else
				return typeof x;
		},
		"in?": function(f, x) {
			if(x === null || x === undefined)
				return false;
			else if(root["typeof"](x) === "object")
				return f in x;
			else
				return x[f] !== undefined;
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
		},
		"make-default-ns": makeDefaultNamespace,
	};

	root["*ns*"] = root;
	root.__proto__ = Function('return this')();
	return root;
}

var $$root = makeDefaultNamespace();

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
$$root["when"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP5=1;
   $$TMP5<arguments.length;
   ++$$TMP5){
      body[$$TMP5-1]=arguments[$$TMP5];
   }
   var $$TMP4;
$$TMP4=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)),$$root["list"](undefined));
return $$TMP4;
}
);
$$root["when"];
$$root["setmac!"]($$root["when"]);
$$root["cond"]=(function(){
   var pairs=Array(arguments.length-0);
   for(var $$TMP8=0;
   $$TMP8<arguments.length;
   ++$$TMP8){
      pairs[$$TMP8-0]=arguments[$$TMP8];
   }
   var $$TMP6;
   var $$TMP7;
if($$root["null?"](pairs)){
   $$TMP7=undefined;
}
else{
$$TMP7=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](pairs)),$$root["list"]($$root["car"]($$root["cdr"](pairs))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["cdr"]($$root["cdr"](pairs)))));
}
$$TMP6=$$TMP7;
return $$TMP6;
}
);
$$root["cond"];
$$root["setmac!"]($$root["cond"]);
$$root["and"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP11=0;
   $$TMP11<arguments.length;
   ++$$TMP11){
      args[$$TMP11-0]=arguments[$$TMP11];
   }
   var $$TMP9;
   var $$TMP10;
if($$root["null?"](args)){
   $$TMP10=true;
}
else{
$$TMP10=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["cdr"](args))),$$root["list"](false));
}
$$TMP9=$$TMP10;
return $$TMP9;
}
);
$$root["and"];
$$root["setmac!"]($$root["and"]);
$$root["or"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP15=0;
   $$TMP15<arguments.length;
   ++$$TMP15){
      args[$$TMP15-0]=arguments[$$TMP15];
   }
   var $$TMP12;
   var $$TMP13;
if($$root["null?"](args)){
   $$TMP13=false;
}
else{
   var $$TMP14;
if($$root["null?"]($$root["cdr"](args))){
$$TMP14=$$root["car"](args);
}
else{
$$TMP14=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP13=$$TMP14;
}
$$TMP12=$$TMP13;
return $$TMP12;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["identity"]=(function(x){
   var $$TMP16;
   $$TMP16=x;
   return $$TMP16;
}
);
$$root["identity"];
$$root["even?"]=(function(x){
   var $$TMP17;
$$TMP17=$$root["="]($$root["mod"](x,2),0);
return $$TMP17;
}
);
$$root["even?"];
$$root["odd?"]=(function(x){
   var $$TMP18;
$$TMP18=$$root["="]($$root["mod"](x,2),1);
return $$TMP18;
}
);
$$root["odd?"];
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
$$root["interleave"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP73=0;
   $$TMP73<arguments.length;
   ++$$TMP73){
      args[$$TMP73-0]=arguments[$$TMP73];
   }
   var $$TMP71;
   var $$TMP72;
if($$root["null?"](args)){
   $$TMP72=[];
}
else{
$$TMP72=$$root["apply"]($$root["concat"],$$root["apply"]($$root["zip"],args));
}
$$TMP71=$$TMP72;
return $$TMP71;
}
);
$$root["interleave"];
$$root["let"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP75=1;
   $$TMP75<arguments.length;
   ++$$TMP75){
      body[$$TMP75-1]=arguments[$$TMP75];
   }
   var $$TMP74;
$$TMP74=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP74;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP76;
   $$TMP76=(function(fst){
      var $$TMP77;
$$TMP77=$$root["transform-list"]((function(accum,v){
   var $$TMP78;
   var $$TMP79;
   if(fst){
      var $$TMP80;
      {
         fst=false;
         fst;
$$TMP80=$$root["cons"](v,accum);
}
$$TMP79=$$TMP80;
}
else{
$$TMP79=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP78=$$TMP79;
return $$TMP78;
}
),lst);
return $$TMP77;
}
)(true);
return $$TMP76;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP81;
$$TMP81=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP81;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP82;
   $$TMP82=(function(idx){
      var $$TMP83;
$$TMP83=$$root["reduce"]((function(accum,v){
   var $$TMP84;
idx=$$root["+"](idx,1);
idx;
var $$TMP85;
if(f(arg,v)){
   $$TMP85=idx;
}
else{
   $$TMP85=accum;
}
$$TMP84=$$TMP85;
return $$TMP84;
}
),lst,-1);
return $$TMP83;
}
)(-1);
return $$TMP82;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP86;
   var $$TMP87;
if($$root["atom?"](x)){
$$TMP87=$$root["list"](x);
}
else{
$$TMP87=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP86=$$TMP87;
return $$TMP86;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP88;
   $$TMP88=(function(idx){
      var $$TMP89;
$$TMP89=$$root["transform-list"]((function(accum,v){
   var $$TMP90;
idx=$$root["+"](idx,1);
$$TMP90=$$root["cons"](f(v,idx),accum);
return $$TMP90;
}
),lst);
return $$TMP89;
}
)(-1);
return $$TMP88;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP95=1;
   $$TMP95<arguments.length;
   ++$$TMP95){
      body[$$TMP95-1]=arguments[$$TMP95];
   }
   var $$TMP91;
   $$TMP91=(function(binding__MINUSnames,tmp__MINUSbinding__MINUSnames,done__MINUSflag__MINUSsym,res__MINUSsym){
      var $$TMP93;
$$TMP93=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false),$$root["list"](res__MINUSsym),$$root["list"](undefined),bindings)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](tmp__MINUSbinding__MINUSnames),$$root["map"]((function(s){
   var $$TMP94;
$$TMP94=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](s),$$root["list"]($$root["symbol"]($$root["str"]("_",$$root["geti"](s,(new $$root.Symbol("name")))))));
return $$TMP94;
}
),binding__MINUSnames),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("dumb-loop"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](true))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](res__MINUSsym),body)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"](done__MINUSflag__MINUSsym))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("continue"))))),$$root["list"](res__MINUSsym))))))));
return $$TMP93;
}
)($$root["every-nth"](2,bindings),$$root["map"]((function(s){
   var $$TMP92;
$$TMP92=$$root["symbol"]($$root["str"]("_",$$root["geti"](s,(new $$root.Symbol("name")))));
return $$TMP92;
}
),$$root["every-nth"](2,bindings)),$$root["gensym"](),$$root["gensym"]());
return $$TMP91;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP96;
   var $$TMP97;
if($$root["null?"](lst)){
   $$TMP97=[];
}
else{
$$TMP97=$$root["reverse"]((function(__GS1,__GS2,accum,part,rem,counter){
   var $$TMP98;
   $$TMP98=(function(recur){
      var $$TMP100;
      var $$TMP101;
      while(true){
         __GS1=true;
         __GS1;
         var $$TMP102;
if($$root["null?"](rem)){
$$TMP102=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP103;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP103=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP103=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP102=$$TMP103;
}
__GS2=$$TMP102;
__GS2;
var $$TMP104;
if($$root["not"](__GS1)){
   continue;
   $$TMP104=undefined;
}
else{
   $$TMP104=__GS2;
}
$$TMP101=$$TMP104;
break;
}
$$TMP100=$$TMP101;
return $$TMP100;
}
)((function(_accum,_part,_rem,_counter){
   var $$TMP99;
   accum=_accum;
   accum;
   part=_part;
   part;
   rem=_rem;
   rem;
   counter=_counter;
   counter;
   __GS1=false;
   $$TMP99=__GS1;
   return $$TMP99;
}
));
return $$TMP98;
}
)(false,undefined,[],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1));
}
$$TMP96=$$TMP97;
return $$TMP96;
}
);
$$root["partition"];
$$root["method"]=(function(args){
   var body=Array(arguments.length-1);
   for(var $$TMP106=1;
   $$TMP106<arguments.length;
   ++$$TMP106){
      body[$$TMP106-1]=arguments[$$TMP106];
   }
   var $$TMP105;
$$TMP105=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP105;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP108=3;
   $$TMP108<arguments.length;
   ++$$TMP108){
      body[$$TMP108-3]=arguments[$$TMP108];
   }
   var $$TMP107;
$$TMP107=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP107;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP111=1;
   $$TMP111<arguments.length;
   ++$$TMP111){
      args[$$TMP111-1]=arguments[$$TMP111];
   }
   var $$TMP109;
   $$TMP109=(function(instance){
      var $$TMP110;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP110=instance;
return $$TMP110;
}
)($$root["object"](proto));
return $$TMP109;
}
);
$$root["make-instance"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP113=2;
   $$TMP113<arguments.length;
   ++$$TMP113){
      args[$$TMP113-2]=arguments[$$TMP113];
   }
   var $$TMP112;
$$TMP112=$$root["apply-method"]($$root["geti"](obj,name),obj,args);
return $$TMP112;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP114;
   var $$TMP115;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP115=obj__MINUSname;
}
else{
   var $$TMP116;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP116=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP116=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP115=$$TMP116;
}
$$TMP114=$$TMP115;
return $$TMP114;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP118=1;
   $$TMP118<arguments.length;
   ++$$TMP118){
      fields[$$TMP118-1]=arguments[$$TMP118];
   }
   var $$TMP117;
$$TMP117=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP117;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP119;
   var $$TMP120;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP120=obj__MINUSname;
}
else{
$$TMP120=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP119=$$TMP120;
return $$TMP119;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP122=1;
   $$TMP122<arguments.length;
   ++$$TMP122){
      fields[$$TMP122-1]=arguments[$$TMP122];
   }
   var $$TMP121;
$$TMP121=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP121;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP123;
$$TMP123=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP123;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP124;
   var $$TMP125;
if($$root["null?"](a)){
$$TMP125=$$root["null?"](b);
}
else{
   var $$TMP126;
if($$root["symbol?"](a)){
   var $$TMP127;
if($$root["symbol?"](b)){
   var $$TMP128;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP128=true;
}
else{
   $$TMP128=false;
}
$$TMP127=$$TMP128;
}
else{
   $$TMP127=false;
}
$$TMP126=$$TMP127;
}
else{
   var $$TMP129;
if($$root["atom?"](a)){
$$TMP129=$$root["="](a,b);
}
else{
   var $$TMP130;
if($$root["list?"](a)){
   var $$TMP131;
if($$root["list?"](b)){
   var $$TMP132;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP133;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP133=true;
}
else{
   $$TMP133=false;
}
$$TMP132=$$TMP133;
}
else{
   $$TMP132=false;
}
$$TMP131=$$TMP132;
}
else{
   $$TMP131=false;
}
$$TMP130=$$TMP131;
}
else{
   $$TMP130=undefined;
}
$$TMP129=$$TMP130;
}
$$TMP126=$$TMP129;
}
$$TMP125=$$TMP126;
}
$$TMP124=$$TMP125;
return $$TMP124;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP134;
   $$TMP134=(function(res){
      var $$TMP143;
$$TMP143=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP143;
}
)((function(__GS3,__GS4,l1,l2){
   var $$TMP135;
   $$TMP135=(function(recur){
      var $$TMP137;
      var $$TMP138;
      while(true){
         __GS3=true;
         __GS3;
         var $$TMP139;
         if((function(c){
            var $$TMP140;
            var $$TMP141;
            if(c){
               $$TMP141=c;
            }
            else{
$$TMP141=p($$root["car"](l2));
}
$$TMP140=$$TMP141;
return $$TMP140;
}
)($$root["null?"](l2))){
$$TMP139=$$root["list"](l1,l2);
}
else{
$$TMP139=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
__GS4=$$TMP139;
__GS4;
var $$TMP142;
if($$root["not"](__GS3)){
   continue;
   $$TMP142=undefined;
}
else{
   $$TMP142=__GS4;
}
$$TMP138=$$TMP142;
break;
}
$$TMP137=$$TMP138;
return $$TMP137;
}
)((function(_l1,_l2){
   var $$TMP136;
   l1=_l1;
   l1;
   l2=_l2;
   l2;
   __GS3=false;
   $$TMP136=__GS3;
   return $$TMP136;
}
));
return $$TMP135;
}
)(false,undefined,[],lst));
return $$TMP134;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP144;
   var $$TMP145;
if($$root["reduce"]((function(accum,v){
   var $$TMP146;
   var $$TMP147;
   if(accum){
      $$TMP147=accum;
   }
   else{
      $$TMP147=v;
   }
   $$TMP146=$$TMP147;
   return $$TMP146;
}
),lst,false)){
   $$TMP145=true;
}
else{
   $$TMP145=false;
}
$$TMP144=$$TMP145;
return $$TMP144;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP148;
$$TMP148=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP149;
   var $$TMP150;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP151;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP151=true;
}
else{
   $$TMP151=false;
}
$$TMP150=$$TMP151;
}
else{
   $$TMP150=false;
}
$$TMP149=$$TMP150;
return $$TMP149;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP148;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP152;
   $$TMP152=(function(binding__MINUSnames){
      var $$TMP153;
      $$TMP153=(function(divs){
         var $$TMP155;
         var $$TMP156;
if($$root["null?"]($$root["second"](divs))){
$$TMP156=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP156=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP155=$$TMP156;
return $$TMP155;
}
)($$root["split"]((function(pair){
   var $$TMP154;
$$TMP154=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP154;
}
),binding__MINUSpairs));
return $$TMP153;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP152;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP158=1;
   $$TMP158<arguments.length;
   ++$$TMP158){
      body[$$TMP158-1]=arguments[$$TMP158];
   }
   var $$TMP157;
$$TMP157=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP157;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP159;
   $$TMP159=(function(x){
      var $$TMP160;
$$TMP160=$$root["not"](f(x));
return $$TMP160;
}
);
return $$TMP159;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP161;
   $$TMP161=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP163=0;
      $$TMP163<arguments.length;
      ++$$TMP163){
         args[$$TMP163-0]=arguments[$$TMP163];
      }
      var $$TMP162;
$$TMP162=f1($$root["apply"](f2,args));
return $$TMP162;
}
);
return $$TMP161;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP167=1;
   $$TMP167<arguments.length;
   ++$$TMP167){
      args1[$$TMP167-1]=arguments[$$TMP167];
   }
   var $$TMP164;
   $$TMP164=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP166=0;
      $$TMP166<arguments.length;
      ++$$TMP166){
         args2[$$TMP166-0]=arguments[$$TMP166];
      }
      var $$TMP165;
$$TMP165=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP165;
}
);
return $$TMP164;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP171=2;
   $$TMP171<arguments.length;
   ++$$TMP171){
      args1[$$TMP171-2]=arguments[$$TMP171];
   }
   var $$TMP168;
   $$TMP168=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP170=0;
      $$TMP170<arguments.length;
      ++$$TMP170){
         args2[$$TMP170-0]=arguments[$$TMP170];
      }
      var $$TMP169;
$$TMP169=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP169;
}
);
return $$TMP168;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP175=0;
   $$TMP175<arguments.length;
   ++$$TMP175){
      args[$$TMP175-0]=arguments[$$TMP175];
   }
   var $$TMP172;
   $$TMP172=(function(rx){
      var $$TMP173;
$$TMP173=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP174;
$$TMP174=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP174;
}
));
return $$TMP173;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP172;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP182=1;
   $$TMP182<arguments.length;
   ++$$TMP182){
      pairs[$$TMP182-1]=arguments[$$TMP182];
   }
   var $$TMP176;
   $$TMP176=(function(e__MINUSname,def__MINUSidx){
      var $$TMP177;
      var $$TMP178;
if($$root["="](def__MINUSidx,-1)){
$$TMP178=$$root.list((new $$root.Symbol("error")),"Fell out of case!");
}
else{
$$TMP178=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP177=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP179;
$$TMP179=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP180;
$$TMP180=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP180;
}
),$$root["filter"]((function(pair){
   var $$TMP181;
$$TMP181=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP181;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP179;
}
)($$TMP178,$$root["partition"](2,pairs));
return $$TMP177;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP176;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP183;
   $$TMP183=(function(expr__MINUSname){
      var $$TMP184;
$$TMP184=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP185;
   var $$TMP186;
if($$root["symbol?"](v)){
   var $$TMP187;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP187=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP188;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP188=[];
}
else{
$$TMP188=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP187=$$TMP188;
}
$$TMP186=$$TMP187;
}
else{
$$TMP186=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP185=$$TMP186;
return $$TMP185;
}
),structure)));
return $$TMP184;
}
)($$root["gensym"]());
return $$TMP183;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP191=2;
   $$TMP191<arguments.length;
   ++$$TMP191){
      body[$$TMP191-2]=arguments[$$TMP191];
   }
   var $$TMP189;
   var $$TMP190;
if($$root["symbol?"](structure)){
$$TMP190=$$root["list"](structure,expr);
}
else{
$$TMP190=$$root["destruct-helper"](structure,expr);
}
$$TMP189=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP190),body);
return $$TMP189;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP192;
   var $$TMP193;
if($$root["list?"](expr)){
   var $$TMP194;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP194=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP194=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP193=$$TMP194;
}
else{
   $$TMP193=expr;
}
$$TMP192=$$TMP193;
return $$TMP192;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP195;
   var $$TMP196;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP196=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP197;
   var $$TMP198;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP199;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP199=true;
}
else{
   $$TMP199=false;
}
$$TMP198=$$TMP199;
}
else{
   $$TMP198=false;
}
if($$TMP198){
$$TMP197=$$root["list?"](expr);
}
else{
   var $$TMP200;
   if(true){
      var $$TMP201;
      var $$TMP202;
if($$root["list?"](expr)){
   var $$TMP203;
if($$root["not"]($$root["null?"](expr))){
   $$TMP203=true;
}
else{
   $$TMP203=false;
}
$$TMP202=$$TMP203;
}
else{
   $$TMP202=false;
}
if($$TMP202){
   var $$TMP204;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP205;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP205=true;
}
else{
   $$TMP205=false;
}
$$TMP204=$$TMP205;
}
else{
   $$TMP204=false;
}
$$TMP201=$$TMP204;
}
else{
   $$TMP201=false;
}
$$TMP200=$$TMP201;
}
else{
   $$TMP200=undefined;
}
$$TMP197=$$TMP200;
}
$$TMP196=$$TMP197;
}
$$TMP195=$$TMP196;
return $$TMP195;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP206;
   var $$TMP207;
if($$root["null?"](patt)){
$$TMP207=$$root["null?"](expr);
}
else{
   var $$TMP208;
if($$root["list?"](patt)){
$$TMP208=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP209;
if($$root["symbol?"](patt)){
   $$TMP209=true;
}
else{
   var $$TMP210;
   if(true){
$$TMP210=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP210=undefined;
}
$$TMP209=$$TMP210;
}
$$TMP208=$$TMP209;
}
$$TMP207=$$TMP208;
}
$$TMP206=$$TMP207;
return $$TMP206;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP211;
   var $$TMP212;
   var $$TMP213;
if($$root["list?"](patt)){
   var $$TMP214;
if($$root["not"]($$root["null?"](patt))){
   $$TMP214=true;
}
else{
   $$TMP214=false;
}
$$TMP213=$$TMP214;
}
else{
   $$TMP213=false;
}
if($$TMP213){
   var $$TMP215;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP215=(new $$root.Symbol("_"));
}
else{
$$TMP215=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP212=$$TMP215;
}
else{
   $$TMP212=patt;
}
$$TMP211=$$TMP212;
return $$TMP211;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP219=1;
   $$TMP219<arguments.length;
   ++$$TMP219){
      pairs[$$TMP219-1]=arguments[$$TMP219];
   }
   var $$TMP216;
   $$TMP216=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP217;
$$TMP217=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP218;
$$TMP218=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP218;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP217;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP216;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP220;
   $$TMP220=(function(__GS5){
      var $$TMP221;
      var $$TMP222;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP222=(function(__GS6){
      var $$TMP223;
      $$TMP223=(function(obj,field){
         var $$TMP224;
$$TMP224=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP224;
}
)($$root["nth"](1,__GS6),$$root["nth"](2,__GS6));
return $$TMP223;
}
)(__GS5);
}
else{
   var $$TMP225;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti-safe"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP225=(function(__GS7){
      var $$TMP226;
      $$TMP226=(function(obj,field){
         var $$TMP227;
$$TMP227=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP227;
}
)($$root["nth"](1,__GS7),$$root["nth"](2,__GS7));
return $$TMP226;
}
)(__GS5);
}
else{
   var $$TMP228;
if($$root["matches?"](__GS5,(new $$root.Symbol("any")))){
   $$TMP228=(function(any){
      var $$TMP229;
      var $$TMP230;
if($$root["symbol?"](any)){
$$TMP230=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP230=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP229=$$TMP230;
return $$TMP229;
}
)(__GS5);
}
else{
   var $$TMP231;
   if(true){
$$TMP231=$$root["error"]("Fell out of case!");
}
else{
   $$TMP231=undefined;
}
$$TMP228=$$TMP231;
}
$$TMP225=$$TMP228;
}
$$TMP222=$$TMP225;
}
$$TMP221=$$TMP222;
return $$TMP221;
}
)($$root["macroexpand"](place));
return $$TMP220;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP232;
   amt=(function(c){
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
   )(amt);
   amt;
$$TMP232=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP232;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP235;
   amt=(function(c){
      var $$TMP236;
      var $$TMP237;
      if(c){
         $$TMP237=c;
      }
      else{
         $$TMP237=1;
      }
      $$TMP236=$$TMP237;
      return $$TMP236;
   }
   )(amt);
   amt;
$$TMP235=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP235;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP238;
$$TMP238=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP238;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP239;
$$TMP239=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP239;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP240;
$$TMP240=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP240;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP241;
   var $$TMP242;
if($$root["="](pos,0)){
$$TMP242=$$root["cons"](x,lst);
}
else{
   var $$TMP243;
if($$root["null?"](lst)){
   $$TMP243=undefined;
}
else{
$$TMP243=$$root["car"](lst);
}
$$TMP242=$$root["cons"]($$TMP243,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP241=$$TMP242;
return $$TMP241;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP246=1;
   $$TMP246<arguments.length;
   ++$$TMP246){
      forms[$$TMP246-1]=arguments[$$TMP246];
   }
   var $$TMP244;
   var $$TMP245;
if($$root["null?"](forms)){
   $$TMP245=x;
}
else{
$$TMP245=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP244=$$TMP245;
return $$TMP244;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP249=1;
   $$TMP249<arguments.length;
   ++$$TMP249){
      forms[$$TMP249-1]=arguments[$$TMP249];
   }
   var $$TMP247;
   var $$TMP248;
if($$root["null?"](forms)){
   $$TMP248=x;
}
else{
$$TMP248=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP247=$$TMP248;
return $$TMP247;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP255=1;
   $$TMP255<arguments.length;
   ++$$TMP255){
      body[$$TMP255-1]=arguments[$$TMP255];
   }
   var $$TMP250;
   $$TMP250=(function(binding__MINUSname){
      var $$TMP251;
$$TMP251=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP252;
   $$TMP252=(function(__GS8){
      var $$TMP253;
      $$TMP253=(function(f,args){
         var $$TMP254;
$$TMP254=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP254;
}
)($$root["nth"](0,__GS8),$$root["drop"](1,__GS8));
return $$TMP253;
}
)(v);
return $$TMP252;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP251;
}
)($$root["gensym"]());
return $$TMP250;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP264=1;
   $$TMP264<arguments.length;
   ++$$TMP264){
      kvs[$$TMP264-1]=arguments[$$TMP264];
   }
   var $$TMP256;
   $$TMP256=(function(__GS9,__GS10,kvs){
      var $$TMP257;
      $$TMP257=(function(recur){
         var $$TMP259;
         var $$TMP260;
         while(true){
            __GS9=true;
            __GS9;
            var $$TMP261;
if($$root["null?"](kvs)){
   $$TMP261=obj;
}
else{
   var $$TMP262;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP262=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP261=$$TMP262;
}
__GS10=$$TMP261;
__GS10;
var $$TMP263;
if($$root["not"](__GS9)){
   continue;
   $$TMP263=undefined;
}
else{
   $$TMP263=__GS10;
}
$$TMP260=$$TMP263;
break;
}
$$TMP259=$$TMP260;
return $$TMP259;
}
)((function(_kvs){
   var $$TMP258;
   kvs=_kvs;
   kvs;
   __GS9=false;
   $$TMP258=__GS9;
   return $$TMP258;
}
));
return $$TMP257;
}
)(false,undefined,kvs);
return $$TMP256;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP273=2;
   $$TMP273<arguments.length;
   ++$$TMP273){
      kvs[$$TMP273-2]=arguments[$$TMP273];
   }
   var $$TMP265;
   (function(__GS11,__GS12,obj,path,kvs){
      var $$TMP266;
      $$TMP266=(function(recur){
         var $$TMP268;
         var $$TMP269;
         while(true){
            __GS11=true;
            __GS11;
            var $$TMP270;
if($$root["null?"](path)){
$$TMP270=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP271;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP271=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP271=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP270=recur($$TMP271,$$root["cdr"](path),kvs);
}
__GS12=$$TMP270;
__GS12;
var $$TMP272;
if($$root["not"](__GS11)){
   continue;
   $$TMP272=undefined;
}
else{
   $$TMP272=__GS12;
}
$$TMP269=$$TMP272;
break;
}
$$TMP268=$$TMP269;
return $$TMP268;
}
)((function(_obj,_path,_kvs){
   var $$TMP267;
   obj=_obj;
   obj;
   path=_path;
   path;
   kvs=_kvs;
   kvs;
   __GS11=false;
   $$TMP267=__GS11;
   return $$TMP267;
}
));
return $$TMP266;
}
)(false,undefined,obj,path,kvs);
$$TMP265=obj;
return $$TMP265;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP274;
   var $$TMP275;
if($$root["null?"](path)){
   $$TMP275=obj;
}
else{
   $$TMP275=(function(tmp){
      var $$TMP276;
      var $$TMP277;
      if(tmp){
$$TMP277=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP277=undefined;
}
$$TMP276=$$TMP277;
return $$TMP276;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP274=$$TMP275;
return $$TMP274;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP279=1;
   $$TMP279<arguments.length;
   ++$$TMP279){
      path[$$TMP279-1]=arguments[$$TMP279];
   }
   var $$TMP278;
$$TMP278=$$root["deep-geti*"](obj,path);
return $$TMP278;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP280;
$$TMP280=$$root["reduce"]((function(h2,key){
   var $$TMP281;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP281=h2;
return $$TMP281;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP280;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP283=1;
   $$TMP283<arguments.length;
   ++$$TMP283){
      kvs[$$TMP283-1]=arguments[$$TMP283];
   }
   var $$TMP282;
$$TMP282=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP282;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP292=1;
   $$TMP292<arguments.length;
   ++$$TMP292){
      kfs[$$TMP292-1]=arguments[$$TMP292];
   }
   var $$TMP284;
   $$TMP284=(function(__GS13,__GS14,kfs){
      var $$TMP285;
      $$TMP285=(function(recur){
         var $$TMP287;
         var $$TMP288;
         while(true){
            __GS13=true;
            __GS13;
            var $$TMP289;
if($$root["null?"](kfs)){
   $$TMP289=h;
}
else{
   $$TMP289=(function(key){
      var $$TMP290;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP290=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP290;
}
)($$root["first"](kfs));
}
__GS14=$$TMP289;
__GS14;
var $$TMP291;
if($$root["not"](__GS13)){
   continue;
   $$TMP291=undefined;
}
else{
   $$TMP291=__GS14;
}
$$TMP288=$$TMP291;
break;
}
$$TMP287=$$TMP288;
return $$TMP287;
}
)((function(_kfs){
   var $$TMP286;
   kfs=_kfs;
   kfs;
   __GS13=false;
   $$TMP286=__GS13;
   return $$TMP286;
}
));
return $$TMP285;
}
)(false,undefined,kfs);
return $$TMP284;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP294=1;
   $$TMP294<arguments.length;
   ++$$TMP294){
      kfs[$$TMP294-1]=arguments[$$TMP294];
   }
   var $$TMP293;
$$TMP293=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP293;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP296=1;
   $$TMP296<arguments.length;
   ++$$TMP296){
      body[$$TMP296-1]=arguments[$$TMP296];
   }
   var $$TMP295;
$$TMP295=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP295;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP297;
$$TMP297=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP297;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP298;
   step=(function(c){
      var $$TMP299;
      var $$TMP300;
      if(c){
         $$TMP300=c;
      }
      else{
         $$TMP300=1;
      }
      $$TMP299=$$TMP300;
      return $$TMP299;
   }
   )(step);
   step;
   $$TMP298=(function(data){
      var $$TMP301;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP301=data;
return $$TMP301;
}
)($$root["object"]([]));
return $$TMP298;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP302;
   step=(function(c){
      var $$TMP303;
      var $$TMP304;
      if(c){
         $$TMP304=c;
      }
      else{
         $$TMP304=1;
      }
      $$TMP303=$$TMP304;
      return $$TMP303;
   }
   )(step);
   step;
   $$TMP302=(function(data){
      var $$TMP305;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP305=data;
return $$TMP305;
}
)($$root["object"]([]));
return $$TMP302;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP306;
   $$TMP306=(function(len__MINUSname,data){
      var $$TMP307;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP307=data;
return $$TMP307;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP306;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP308;
   $$TMP308=(function(lst__MINUSname,data){
      var $$TMP309;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP309=data;
return $$TMP309;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP308;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP310;
   $$TMP310=(function(__GS15){
      var $$TMP311;
      $$TMP311=(function(binding__MINUSname,__GS16){
         var $$TMP312;
         $$TMP312=(function(func__MINUSname,args){
            var $$TMP313;
$$TMP313=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP313;
}
)($$root["nth"](0,__GS16),$$root["drop"](1,__GS16));
return $$TMP312;
}
)($$root["nth"](1,__GS15),$$root["nth"](2,__GS15));
return $$TMP311;
}
)(form);
return $$TMP310;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP314;
   $$TMP314=(function(data){
      var $$TMP315;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP315=data;
return $$TMP315;
}
)($$root["object"]([]));
return $$TMP314;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP316;
   $$TMP316=(function(data){
      var $$TMP317;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP317=data;
return $$TMP317;
}
)($$root["object"]([]));
return $$TMP316;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP318;
   $$TMP318=(function(data){
      var $$TMP319;
      (function(__GS17){
         var $$TMP320;
         $$TMP320=(function(binding__MINUSname,body){
            var $$TMP321;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP321=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP321;
}
)($$root["nth"](1,__GS17),$$root["drop"](2,__GS17));
return $$TMP320;
}
)(form);
$$TMP319=data;
return $$TMP319;
}
)($$root["object"]([]));
return $$TMP318;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP322;
   $$TMP322=(function(data){
      var $$TMP323;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP323=data;
return $$TMP323;
}
)($$root["object"]([]));
return $$TMP322;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP324;
   $$TMP324=(function(data,accum__MINUSname){
      var $$TMP325;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP325=data;
return $$TMP325;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP324;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP326;
$$TMP326=$$root["filter"]((function(x){
   var $$TMP327;
$$TMP327=$$root["not="](x,undefined);
return $$TMP327;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP326;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP343=0;
   $$TMP343<arguments.length;
   ++$$TMP343){
      forms[$$TMP343-0]=arguments[$$TMP343];
   }
   var $$TMP328;
   $$TMP328=(function(res__MINUSname){
      var $$TMP329;
      $$TMP329=(function(all){
         var $$TMP339;
         $$TMP339=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP341;
            var $$TMP342;
if($$root["null?"](final__MINUSactions)){
$$TMP342=$$root["list"](res__MINUSname);
}
else{
   $$TMP342=final__MINUSactions;
}
$$TMP341=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP342)))))));
return $$TMP341;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP340;
$$TMP340=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP340;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP339;
}
)($$root["map"]((function(form){
   var $$TMP330;
   $$TMP330=(function(__GS18){
      var $$TMP331;
      var $$TMP332;
if($$root["equal?"](__GS18,(new $$root.Symbol("let")))){
$$TMP332=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP333;
if($$root["equal?"](__GS18,(new $$root.Symbol("for")))){
$$TMP333=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP334;
if($$root["equal?"](__GS18,(new $$root.Symbol("while")))){
$$TMP334=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP335;
if($$root["equal?"](__GS18,(new $$root.Symbol("do")))){
$$TMP335=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP336;
if($$root["equal?"](__GS18,(new $$root.Symbol("collecting")))){
$$TMP336=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP337;
if($$root["equal?"](__GS18,(new $$root.Symbol("finally")))){
$$TMP337=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP338;
   if(true){
$$TMP338=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP338=undefined;
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
return $$TMP331;
}
)($$root["car"](form));
return $$TMP330;
}
),forms));
return $$TMP329;
}
)($$root["gensym"]());
return $$TMP328;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP348=1;
   $$TMP348<arguments.length;
   ++$$TMP348){
      kvs[$$TMP348-1]=arguments[$$TMP348];
   }
   var $$TMP344;
   $$TMP344=(function(meta){
      var $$TMP345;
      var $$TMP346;
if($$root["not"](meta)){
   var $$TMP347;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP347=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP346=$$TMP347;
}
else{
   $$TMP346=undefined;
}
$$TMP346;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP345=obj;
return $$TMP345;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP344;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP349;
$$TMP349=$$root["print"](($$root["JSON"]).stringify($$root["geti"](x,(new $$root.Symbol("meta")))));
return $$TMP349;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP352=1;
   $$TMP352<arguments.length;
   ++$$TMP352){
      fields[$$TMP352-1]=arguments[$$TMP352];
   }
   var $$TMP350;
$$TMP350=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP351;
$$TMP351=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP351;
}
),fields))));
return $$TMP350;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP353;
   $$TMP353=(s).slice(start,end);
   return $$TMP353;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP354;
$$TMP354=$$root["<"](x,0);
return $$TMP354;
}
);
$$root["neg?"];
$$root["idiv"]=(function(a,b){
   var $$TMP355;
   $$TMP355=(function(t){
      var $$TMP356;
      var $$TMP357;
if($$root["neg?"](t)){
$$TMP357=($$root["Math"]).ceil(t);
}
else{
$$TMP357=($$root["Math"]).floor(t);
}
$$TMP356=$$TMP357;
return $$TMP356;
}
)($$root["/"](a,b));
return $$TMP355;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP358;
   var $$TMP359;
if($$root["string?"](x)){
$$TMP359=$$root["="]($$root["geti"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP360;
if($$root["list?"](x)){
$$TMP360=$$root["null?"](x);
}
else{
   var $$TMP361;
   if(true){
$$TMP361=$$root["error"]("Type error in empty?");
}
else{
   $$TMP361=undefined;
}
$$TMP360=$$TMP361;
}
$$TMP359=$$TMP360;
}
$$TMP358=$$TMP359;
return $$TMP358;
}
);
$$root["empty?"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP362;
   $$TMP362=(function(self){
      var $$TMP363;
      $$TMP363=(function(__GS19){
         var $$TMP364;
$$root["seti!"](__GS19,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS19,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS19,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS19,(new $$root.Symbol("len")),len);
$$TMP364=__GS19;
return $$TMP364;
}
)(self);
return $$TMP363;
}
)(this);
return $$TMP362;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP365;
   $$TMP365=(function(self){
      var $$TMP366;
$$TMP366=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP366;
}
)(this);
return $$TMP365;
}
));
$$root["lit"]=(function(s){
   var $$TMP367;
$$TMP367=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP367;
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
   var $$TMP368;
   $$TMP368=(function(toks,pos,s){
      var $$TMP369;
      (function(__GS20,__GS21){
         var $$TMP370;
         $$TMP370=(function(recur){
            var $$TMP372;
            var $$TMP373;
            while(true){
               __GS20=true;
               __GS20;
               var $$TMP374;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP375;
   {
      (function(__GS22,res,i,__GS23,__GS24,entry,_){
         var $$TMP376;
         $$TMP376=(function(__GS25,__GS26){
            var $$TMP377;
            $$TMP377=(function(recur){
               var $$TMP379;
               var $$TMP380;
               while(true){
                  __GS25=true;
                  __GS25;
                  var $$TMP381;
                  var $$TMP382;
if($$root["<"](i,__GS23)){
   var $$TMP383;
if($$root["not"]($$root["null?"](__GS24))){
   var $$TMP384;
if($$root["not"](res)){
   $$TMP384=true;
}
else{
   $$TMP384=false;
}
$$TMP383=$$TMP384;
}
else{
   $$TMP383=false;
}
$$TMP382=$$TMP383;
}
else{
   $$TMP382=false;
}
if($$TMP382){
   var $$TMP385;
   {
entry=$$root["car"](__GS24);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS22=res;
__GS22;
i=$$root["+"](i,1);
i;
__GS24=$$root["cdr"](__GS24);
__GS24;
$$TMP385=recur();
}
$$TMP381=$$TMP385;
}
else{
   var $$TMP386;
   {
      _=__GS22;
      _;
      var $$TMP387;
      if(res){
         var $$TMP388;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP389;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP390;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP391;
   var $$TMP392;
   if(c){
      $$TMP392=c;
   }
   else{
$$TMP392=$$root["second"](entry);
}
$$TMP391=$$TMP392;
return $$TMP391;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP390=toks;
}
$$TMP389=$$TMP390;
}
else{
   $$TMP389=undefined;
}
$$TMP389;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP388=pos;
}
$$TMP387=$$TMP388;
}
else{
$$TMP387=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS22=$$TMP387;
$$TMP386=__GS22;
}
$$TMP381=$$TMP386;
}
__GS26=$$TMP381;
__GS26;
var $$TMP393;
if($$root["not"](__GS25)){
   continue;
   $$TMP393=undefined;
}
else{
   $$TMP393=__GS26;
}
$$TMP380=$$TMP393;
break;
}
$$TMP379=$$TMP380;
return $$TMP379;
}
)((function(){
   var $$TMP378;
   __GS25=false;
   $$TMP378=__GS25;
   return $$TMP378;
}
));
return $$TMP377;
}
)(false,undefined);
return $$TMP376;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP375=recur();
}
$$TMP374=$$TMP375;
}
else{
   $$TMP374=undefined;
}
__GS21=$$TMP374;
__GS21;
var $$TMP394;
if($$root["not"](__GS20)){
   continue;
   $$TMP394=undefined;
}
else{
   $$TMP394=__GS21;
}
$$TMP373=$$TMP394;
break;
}
$$TMP372=$$TMP373;
return $$TMP372;
}
)((function(){
   var $$TMP371;
   __GS20=false;
   $$TMP371=__GS20;
   return $$TMP371;
}
));
return $$TMP370;
}
)(false,undefined);
$$TMP369=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP369;
}
)([],0,src);
return $$TMP368;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP395;
   $$TMP395=(function(self){
      var $$TMP396;
$$TMP396=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP396;
}
)(this);
return $$TMP395;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP397;
   $$TMP397=(function(self){
      var $$TMP398;
$$TMP398=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP398;
}
)(this);
return $$TMP397;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP399;
   $$TMP399=(function(self){
      var $$TMP400;
      $$TMP400=(function(curr){
         var $$TMP401;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP401=curr;
return $$TMP401;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP400;
}
)(this);
return $$TMP399;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP402;
$$TMP402=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP402;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP403;
$$TMP403=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP403;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP404;
   $$TMP404=(function(self){
      var $$TMP405;
      $$TMP405=(function(tok){
         var $$TMP406;
         $$TMP406=(function(__GS27){
            var $$TMP407;
            var $$TMP408;
if($$root["equal?"](__GS27,(new $$root.Symbol("list-open-tok")))){
$$TMP408=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP409;
if($$root["equal?"](__GS27,(new $$root.Symbol("true-tok")))){
   $$TMP409=true;
}
else{
   var $$TMP410;
if($$root["equal?"](__GS27,(new $$root.Symbol("false-tok")))){
   $$TMP410=false;
}
else{
   var $$TMP411;
if($$root["equal?"](__GS27,(new $$root.Symbol("null-tok")))){
   $$TMP411=[];
}
else{
   var $$TMP412;
if($$root["equal?"](__GS27,(new $$root.Symbol("undef-tok")))){
   $$TMP412=undefined;
}
else{
   var $$TMP413;
if($$root["equal?"](__GS27,(new $$root.Symbol("num-tok")))){
$$TMP413=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP414;
if($$root["equal?"](__GS27,(new $$root.Symbol("str-tok")))){
$$TMP414=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP415;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote-tok")))){
$$TMP415=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP416;
if($$root["equal?"](__GS27,(new $$root.Symbol("backquote-tok")))){
$$TMP416=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP417;
if($$root["equal?"](__GS27,(new $$root.Symbol("sym-tok")))){
$$TMP417=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP418;
   if(true){
$$TMP418=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP418=undefined;
}
$$TMP417=$$TMP418;
}
$$TMP416=$$TMP417;
}
$$TMP415=$$TMP416;
}
$$TMP414=$$TMP415;
}
$$TMP413=$$TMP414;
}
$$TMP412=$$TMP413;
}
$$TMP411=$$TMP412;
}
$$TMP410=$$TMP411;
}
$$TMP409=$$TMP410;
}
$$TMP408=$$TMP409;
}
$$TMP407=$$TMP408;
return $$TMP407;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP406;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP405;
}
)(this);
return $$TMP404;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP419;
   $$TMP419=(function(s){
      var $$TMP420;
$$TMP420=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP420;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP419;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP421;
$$TMP421=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP421;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP422;
   $$TMP422=(function(self){
      var $$TMP423;
      $$TMP423=(function(start__MINUSpos){
         var $$TMP424;
         $$TMP424=(function(__GS28,__GS29,lst){
            var $$TMP425;
            $$TMP425=(function(__GS30,__GS31){
               var $$TMP426;
               $$TMP426=(function(recur){
                  var $$TMP428;
                  var $$TMP429;
                  while(true){
                     __GS30=true;
                     __GS30;
                     var $$TMP430;
                     var $$TMP431;
                     var $$TMP432;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP433;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP433=true;
}
else{
   $$TMP433=false;
}
$$TMP432=$$TMP433;
}
else{
   $$TMP432=false;
}
if($$TMP432){
   $$TMP431=true;
}
else{
   $$TMP431=false;
}
if($$TMP431){
   var $$TMP434;
   {
__GS29=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS29);
__GS28=__GS29;
__GS28;
$$TMP434=recur();
}
$$TMP430=$$TMP434;
}
else{
   var $$TMP435;
   {
__GS28=$$root["reverse"](__GS29);
__GS28;
lst=__GS28;
lst;
var $$TMP436;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP436=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP436=$$root["error"]("Unmatched paren!");
}
__GS28=$$TMP436;
$$TMP435=__GS28;
}
$$TMP430=$$TMP435;
}
__GS31=$$TMP430;
__GS31;
var $$TMP437;
if($$root["not"](__GS30)){
   continue;
   $$TMP437=undefined;
}
else{
   $$TMP437=__GS31;
}
$$TMP429=$$TMP437;
break;
}
$$TMP428=$$TMP429;
return $$TMP428;
}
)((function(){
   var $$TMP427;
   __GS30=false;
   $$TMP427=__GS30;
   return $$TMP427;
}
));
return $$TMP426;
}
)(false,undefined);
return $$TMP425;
}
)(undefined,[],undefined);
return $$TMP424;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP423;
}
)(this);
return $$TMP422;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP438;
   $$TMP438=(function(self){
      var $$TMP439;
      $$TMP439=(function(__GS32,__GS33,lst){
         var $$TMP440;
         $$TMP440=(function(__GS34,__GS35){
            var $$TMP441;
            $$TMP441=(function(recur){
               var $$TMP443;
               var $$TMP444;
               while(true){
                  __GS34=true;
                  __GS34;
                  var $$TMP445;
                  var $$TMP446;
                  var $$TMP447;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP448;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP448=true;
}
else{
   $$TMP448=false;
}
$$TMP447=$$TMP448;
}
else{
   $$TMP447=false;
}
if($$TMP447){
   $$TMP446=true;
}
else{
   $$TMP446=false;
}
if($$TMP446){
   var $$TMP449;
   {
__GS33=$$root["cons"]((function(__GS36){
   var $$TMP450;
   var $$TMP451;
if($$root["equal?"](__GS36,(new $$root.Symbol("unquote-tok")))){
   var $$TMP452;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP452=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP451=$$TMP452;
}
else{
   var $$TMP453;
if($$root["equal?"](__GS36,(new $$root.Symbol("splice-tok")))){
   var $$TMP454;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP454=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP453=$$TMP454;
}
else{
   var $$TMP455;
   if(true){
$$TMP455=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP455=undefined;
}
$$TMP453=$$TMP455;
}
$$TMP451=$$TMP453;
}
$$TMP450=$$TMP451;
return $$TMP450;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS33);
__GS32=__GS33;
__GS32;
$$TMP449=recur();
}
$$TMP445=$$TMP449;
}
else{
   var $$TMP456;
   {
__GS32=$$root["reverse"](__GS33);
__GS32;
lst=__GS32;
lst;
var $$TMP457;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP457=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP457=$$root["error"]("Unmatched paren!");
}
__GS32=$$TMP457;
$$TMP456=__GS32;
}
$$TMP445=$$TMP456;
}
__GS35=$$TMP445;
__GS35;
var $$TMP458;
if($$root["not"](__GS34)){
   continue;
   $$TMP458=undefined;
}
else{
   $$TMP458=__GS35;
}
$$TMP444=$$TMP458;
break;
}
$$TMP443=$$TMP444;
return $$TMP443;
}
)((function(){
   var $$TMP442;
   __GS34=false;
   $$TMP442=__GS34;
   return $$TMP442;
}
));
return $$TMP441;
}
)(false,undefined);
return $$TMP440;
}
)(undefined,[],undefined);
return $$TMP439;
}
)(this);
return $$TMP438;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP459;
   $$TMP459=(function(self){
      var $$TMP460;
      var $$TMP461;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP462;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP462=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP461=$$TMP462;
}
else{
$$TMP461=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP460=$$TMP461;
return $$TMP460;
}
)(this);
return $$TMP459;
}
));
$$root["parse"]=(function(toks){
   var $$TMP463;
   $$TMP463=(function(p){
      var $$TMP464;
      $$TMP464=(function(__GS37,__GS38){
         var $$TMP465;
         $$TMP465=(function(__GS39,__GS40){
            var $$TMP466;
            $$TMP466=(function(recur){
               var $$TMP468;
               var $$TMP469;
               while(true){
                  __GS39=true;
                  __GS39;
                  var $$TMP470;
                  var $$TMP471;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP471=true;
}
else{
   $$TMP471=false;
}
if($$TMP471){
   var $$TMP472;
   {
__GS38=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS38);
__GS37=__GS38;
__GS37;
$$TMP472=recur();
}
$$TMP470=$$TMP472;
}
else{
   var $$TMP473;
   {
__GS37=$$root["reverse"](__GS38);
$$TMP473=__GS37;
}
$$TMP470=$$TMP473;
}
__GS40=$$TMP470;
__GS40;
var $$TMP474;
if($$root["not"](__GS39)){
   continue;
   $$TMP474=undefined;
}
else{
   $$TMP474=__GS40;
}
$$TMP469=$$TMP474;
break;
}
$$TMP468=$$TMP469;
return $$TMP468;
}
)((function(){
   var $$TMP467;
   __GS39=false;
   $$TMP467=__GS39;
   return $$TMP467;
}
));
return $$TMP466;
}
)(false,undefined);
return $$TMP465;
}
)(undefined,[]);
return $$TMP464;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP463;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS41){
   var $$TMP475;
$$root["seti!"](__GS41,".","__DOT");
$$root["seti!"](__GS41,"<","__LT");
$$root["seti!"](__GS41,">","__GT");
$$root["seti!"](__GS41,"?","__QM");
$$root["seti!"](__GS41,"+","__PLUS");
$$root["seti!"](__GS41,"-","__MINUS");
$$root["seti!"](__GS41,"=","__EQL");
$$root["seti!"](__GS41,"!","__BANG");
$$root["seti!"](__GS41,"@","__AT");
$$root["seti!"](__GS41,"#","__HASH");
$$root["seti!"](__GS41,"$","__USD");
$$root["seti!"](__GS41,"%","__PCNT");
$$root["seti!"](__GS41,"^","__CARET");
$$root["seti!"](__GS41,"&","__AMP");
$$root["seti!"](__GS41,"*","__STAR");
$$root["seti!"](__GS41,"/","__SLASH");
$$TMP475=__GS41;
return $$TMP475;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP476;
$$TMP476=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP476;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP477;
$$TMP477=$$root["geti"]($$root["mangling-table"],x);
return $$TMP477;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP478;
$$TMP478=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP478;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP479;
   $$TMP479=(function(__GS42){
      var $$TMP480;
$$root["seti!"](__GS42,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS42,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP480=__GS42;
return $$TMP480;
}
)($$root["hashmap"]());
return $$TMP479;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP481;
   $$TMP481=(function(__GS43){
      var $$TMP482;
$$root["seti!"](__GS43,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS43,(new $$root.Symbol("mappings")),mappings);
$$TMP482=__GS43;
return $$TMP482;
}
)($$root["hashmap"]());
return $$TMP481;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP483;
$$TMP483=$$root["make-tc-str"](s,[]);
return $$TMP483;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP484;
   $$TMP484=(function(adder){
      var $$TMP486;
$$TMP486=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP486;
}
)((function(x){
   var $$TMP485;
$$TMP485=$$root["+"](x,n);
return $$TMP485;
}
));
return $$TMP484;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP487;
   var $$TMP488;
if($$root["string?"](b)){
$$TMP488=$$root["make-tc-str"]($$root["str"]($$root["geti"](a,(new $$root.Symbol("data"))),b),$$root["geti"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP488=$$root["make-tc-str"]($$root["str"]($$root["geti"](a,(new $$root.Symbol("data"))),$$root["geti"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP489;
$$TMP489=$$root["offset-source-mapping"](e,$$root["geti"]($$root["geti"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP489;
}
),$$root["geti"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP487=$$TMP488;
return $$TMP487;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP491=0;
   $$TMP491<arguments.length;
   ++$$TMP491){
      args[$$TMP491-0]=arguments[$$TMP491];
   }
   var $$TMP490;
$$TMP490=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP490;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP492;
$$TMP492=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP492;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP508=2;
   $$TMP508<arguments.length;
   ++$$TMP508){
      args[$$TMP508-2]=arguments[$$TMP508];
   }
   var $$TMP493;
   $$TMP493=(function(rx){
      var $$TMP494;
      $$TMP494=(function(__GS44,accum,__GS45,x,n,_){
         var $$TMP495;
         $$TMP495=(function(__GS46,__GS47){
            var $$TMP496;
            $$TMP496=(function(recur){
               var $$TMP498;
               var $$TMP499;
               while(true){
                  __GS46=true;
                  __GS46;
                  var $$TMP500;
                  var $$TMP501;
if($$root["not"]($$root["null?"](__GS45))){
   $$TMP501=true;
}
else{
   $$TMP501=false;
}
if($$TMP501){
   var $$TMP502;
   {
x=$$root["car"](__GS45);
x;
var $$TMP503;
if($$root["even?"](n)){
   $$TMP503=x;
}
else{
$$TMP503=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP503);
__GS44=accum;
__GS44;
__GS45=$$root["cdr"](__GS45);
__GS45;
n=$$root["+"](n,1);
n;
$$TMP502=recur();
}
$$TMP500=$$TMP502;
}
else{
   var $$TMP504;
   {
      _=__GS44;
      _;
      var $$TMP505;
      if(source__MINUSpos){
         var $$TMP506;
         {
$$TMP506=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti"]($$root["geti"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP505=$$TMP506;
}
else{
   $$TMP505=undefined;
}
$$TMP505;
__GS44=accum;
$$TMP504=__GS44;
}
$$TMP500=$$TMP504;
}
__GS47=$$TMP500;
__GS47;
var $$TMP507;
if($$root["not"](__GS46)){
   continue;
   $$TMP507=undefined;
}
else{
   $$TMP507=__GS47;
}
$$TMP499=$$TMP507;
break;
}
$$TMP498=$$TMP499;
return $$TMP498;
}
)((function(){
   var $$TMP497;
   __GS46=false;
   $$TMP497=__GS46;
   return $$TMP497;
}
));
return $$TMP496;
}
)(false,undefined);
return $$TMP495;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP494;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP493;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP509;
   $$TMP509=(function(self){
      var $$TMP510;
      $$TMP510=(function(__GS48){
         var $$TMP511;
$$root["seti!"](__GS48,"root",root);
$$root["seti!"](__GS48,"next-var-suffix",0);
$$TMP511=__GS48;
return $$TMP511;
}
)(self);
return $$TMP510;
}
)(this);
return $$TMP509;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP512;
   $$TMP512=(function(self){
      var $$TMP513;
      $$TMP513=(function(out){
         var $$TMP514;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP514=out;
return $$TMP514;
}
)($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP513;
}
)(this);
return $$TMP512;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP515;
   var $$TMP516;
if($$root["in?"]($$root["geti"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP516=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP516=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP515=$$TMP516;
return $$TMP515;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP517;
   $$TMP517=(function(self){
      var $$TMP518;
      var $$TMP519;
if($$root["="](x,true)){
$$TMP519=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP520;
if($$root["="](x,false)){
$$TMP520=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP521;
if($$root["null?"](x)){
$$TMP521=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP522;
if($$root["="](x,undefined)){
$$TMP522=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP523;
if($$root["symbol?"](x)){
$$TMP523=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP524;
if($$root["string?"](x)){
$$TMP524=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP525;
   if(true){
$$TMP525=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP525=undefined;
}
$$TMP524=$$TMP525;
}
$$TMP523=$$TMP524;
}
$$TMP522=$$TMP523;
}
$$TMP521=$$TMP522;
}
$$TMP520=$$TMP521;
}
$$TMP519=$$TMP520;
}
$$TMP518=$$TMP519;
return $$TMP518;
}
)(this);
return $$TMP517;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP526;
   $$TMP526=(function(self){
      var $$TMP527;
      $$TMP527=(function(__GS49){
         var $$TMP528;
         $$TMP528=(function(fun,args){
            var $$TMP529;
            $$TMP529=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP530;
$$TMP530=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP530;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP529;
}
)($$root["nth"](0,__GS49),$$root["drop"](1,__GS49));
return $$TMP528;
}
)(lst);
return $$TMP527;
}
)(this);
return $$TMP526;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP531;
   $$TMP531=(function(self){
      var $$TMP532;
      $$TMP532=(function(__GS50){
         var $$TMP533;
         $$TMP533=(function(fun,args){
            var $$TMP534;
            $$TMP534=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP535;
$$TMP535=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP535;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP534;
}
)($$root["nth"](1,__GS50),$$root["drop"](2,__GS50));
return $$TMP533;
}
)(lst);
return $$TMP532;
}
)(this);
return $$TMP531;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP536;
   $$TMP536=(function(self){
      var $$TMP537;
      $$TMP537=(function(__GS51){
         var $$TMP538;
         $$TMP538=(function(method,obj,args){
            var $$TMP539;
            $$TMP539=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP540;
$$TMP540=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP540;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP539;
}
)($$root["nth"](0,__GS51),$$root["nth"](1,__GS51),$$root["drop"](2,__GS51));
return $$TMP538;
}
)(lst);
return $$TMP537;
}
)(this);
return $$TMP536;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP541;
   $$TMP541=(function(self){
      var $$TMP542;
      $$TMP542=(function(compiled__MINUSbody,reducer){
         var $$TMP544;
$$TMP544=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP544;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP543;
$$TMP543=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP543;
}
));
return $$TMP542;
}
)(this);
return $$TMP541;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP545;
$$TMP545=$$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP545;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP546;
   var $$TMP547;
if($$root["is-vararg?"](sym)){
$$TMP547=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP547=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP546=$$TMP547;
return $$TMP546;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP548;
$$TMP548=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP549;
$$TMP549=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
return $$TMP549;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP548;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP550;
   $$TMP550=(function(self){
      var $$TMP551;
      var $$TMP552;
if($$root["not"]($$root["null?"](args))){
   var $$TMP553;
   {
$$TMP553=$$root["last"](args);
}
$$TMP552=$$TMP553;
}
else{
   $$TMP552=undefined;
}
$$TMP551=(function(last__MINUSarg){
   var $$TMP554;
   var $$TMP555;
   var $$TMP556;
   if(last__MINUSarg){
      var $$TMP557;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP557=true;
}
else{
   $$TMP557=false;
}
$$TMP556=$$TMP557;
}
else{
   $$TMP556=false;
}
if($$TMP556){
$$TMP555=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP555="";
}
$$TMP554=$$TMP555;
return $$TMP554;
}
)($$TMP552);
return $$TMP551;
}
)(this);
return $$TMP550;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP558;
   $$TMP558=(function(self){
      var $$TMP559;
      $$TMP559=(function(__GS52){
         var $$TMP560;
         $$TMP560=(function(__GS53){
            var $$TMP561;
            $$TMP561=(function(args,body){
               var $$TMP562;
               $$TMP562=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP564;
                  $$TMP564=(function(compiled__MINUSbody){
                     var $$TMP565;
$$TMP565=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP565;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP564;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP563;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP563=accum;
return $$TMP563;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP562;
}
)($$root["drop"](0,__GS53),$$root["drop"](2,__GS52));
return $$TMP561;
}
)($$root["nth"](1,__GS52));
return $$TMP560;
}
)(lst);
return $$TMP559;
}
)(this);
return $$TMP558;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP566;
   $$TMP566=(function(self){
      var $$TMP567;
      $$TMP567=(function(__GS54){
         var $$TMP568;
         $$TMP568=(function(body){
            var $$TMP569;
            $$TMP569=(function(value__MINUSvar__MINUSname){
               var $$TMP570;
               $$TMP570=(function(compiled__MINUSbody){
                  var $$TMP571;
$$TMP571=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP571;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP570;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP569;
}
)($$root["drop"](1,__GS54));
return $$TMP568;
}
)(lst);
return $$TMP567;
}
)(this);
return $$TMP566;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP572;
   $$TMP572=(function(self){
      var $$TMP573;
$$TMP573=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP573;
}
)(this);
return $$TMP572;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP574;
   $$TMP574=(function(self){
      var $$TMP575;
      $$TMP575=(function(__GS55){
         var $$TMP576;
         $$TMP576=(function(body){
            var $$TMP577;
            $$TMP577=(function(value__MINUSvar__MINUSname){
               var $$TMP578;
               $$TMP578=(function(compiled__MINUSbody){
                  var $$TMP579;
$$TMP579=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP579;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP578;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP577;
}
)($$root["drop"](1,__GS55));
return $$TMP576;
}
)(lst);
return $$TMP575;
}
)(this);
return $$TMP574;
}
));
$$root["compile"]=(function(expr){
   var $$TMP580;
   $$TMP580=(function(c){
      var $$TMP581;
      $$TMP581=(function(t){
         var $$TMP582;
$$TMP582=$$root["str"]($$root["geti"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP582;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP581;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP580;
}
);
$$root["compile"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP583;
   $$TMP583=(function(self){
      var $$TMP584;
      $$TMP584=(function(__GS56){
         var $$TMP585;
         $$TMP585=(function(c,t,f){
            var $$TMP586;
            $$TMP586=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP587;
$$TMP587=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP587;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP586;
}
)($$root["nth"](1,__GS56),$$root["nth"](2,__GS56),$$root["nth"](3,__GS56));
return $$TMP585;
}
)(lst);
return $$TMP584;
}
)(this);
return $$TMP583;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP588;
   $$TMP588=(function(self){
      var $$TMP589;
      var $$TMP590;
if($$root["symbol?"](x)){
$$TMP590=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP590=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP589=$$TMP590;
return $$TMP589;
}
)(this);
return $$TMP588;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP591;
   $$TMP591=(function(self){
      var $$TMP592;
$$TMP592=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP592;
}
)(this);
return $$TMP591;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP593;
   $$TMP593=(function(self){
      var $$TMP594;
      var $$TMP595;
if($$root["atom?"](x)){
$$TMP595=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP595=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP594=$$TMP595;
return $$TMP594;
}
)(this);
return $$TMP593;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP596;
   $$TMP596=(function(self){
      var $$TMP597;
      $$TMP597=(function(__GS57){
         var $$TMP598;
         $$TMP598=(function(name,value){
            var $$TMP599;
            $$TMP599=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP600;
$$TMP600=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP600;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP599;
}
)($$root["nth"](1,__GS57),$$root["nth"](2,__GS57));
return $$TMP598;
}
)(lst);
return $$TMP597;
}
)(this);
return $$TMP596;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP601;
   $$TMP601=(function(self){
      var $$TMP602;
      $$TMP602=(function(__GS58){
         var $$TMP603;
         $$TMP603=(function(name,args){
            var $$TMP604;
            $$TMP604=(function(tmp){
               var $$TMP606;
$$TMP606=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["geti"]($$root["second"](tmp),(new $$root.Symbol("data"))),$$root["geti"]($$root["first"](tmp),(new $$root.Symbol("data")))));
return $$TMP606;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP605;
$$TMP605=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP605;
}
),args))));
return $$TMP604;
}
)($$root["nth"](0,__GS58),$$root["drop"](1,__GS58));
return $$TMP603;
}
)(expr);
return $$TMP602;
}
)(this);
return $$TMP601;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP607;
   $$TMP607=(function(self){
      var $$TMP608;
      var $$TMP609;
if($$root["in?"](name,$$root["geti"](self,(new $$root.Symbol("root"))))){
   var $$TMP610;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP610=true;
}
else{
   $$TMP610=false;
}
$$TMP609=$$TMP610;
}
else{
   $$TMP609=false;
}
$$TMP608=$$TMP609;
return $$TMP608;
}
)(this);
return $$TMP607;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP611;
   $$TMP611=(function(self){
      var $$TMP612;
      var $$TMP613;
      var $$TMP614;
if($$root["list?"](expr)){
   var $$TMP615;
if($$root["not"]($$root["null?"](expr))){
   $$TMP615=true;
}
else{
   $$TMP615=false;
}
$$TMP614=$$TMP615;
}
else{
   $$TMP614=false;
}
if($$TMP614){
   $$TMP613=(function(first){
      var $$TMP616;
      var $$TMP617;
if($$root["symbol?"](first)){
   $$TMP617=(function(__GS59){
      var $$TMP618;
      var $$TMP619;
if($$root["equal?"](__GS59,(new $$root.Symbol("lambda")))){
$$TMP619=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP620;
if($$root["equal?"](__GS59,(new $$root.Symbol("progn")))){
$$TMP620=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP621;
if($$root["equal?"](__GS59,(new $$root.Symbol("dumb-loop")))){
$$TMP621=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP622;
if($$root["equal?"](__GS59,(new $$root.Symbol("continue")))){
$$TMP622=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP623;
if($$root["equal?"](__GS59,(new $$root.Symbol("new")))){
$$TMP623=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP624;
if($$root["equal?"](__GS59,(new $$root.Symbol("if")))){
$$TMP624=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP625;
if($$root["equal?"](__GS59,(new $$root.Symbol("quote")))){
$$TMP625=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP626;
if($$root["equal?"](__GS59,(new $$root.Symbol("setv!")))){
$$TMP626=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP627;
if($$root["equal?"](__GS59,(new $$root.Symbol("def")))){
$$TMP627=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP628;
   if(true){
      var $$TMP629;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP629=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP630;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP630=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP631;
   if(true){
$$TMP631=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP631=undefined;
}
$$TMP630=$$TMP631;
}
$$TMP629=$$TMP630;
}
$$TMP628=$$TMP629;
}
else{
   $$TMP628=undefined;
}
$$TMP627=$$TMP628;
}
$$TMP626=$$TMP627;
}
$$TMP625=$$TMP626;
}
$$TMP624=$$TMP625;
}
$$TMP623=$$TMP624;
}
$$TMP622=$$TMP623;
}
$$TMP621=$$TMP622;
}
$$TMP620=$$TMP621;
}
$$TMP619=$$TMP620;
}
$$TMP618=$$TMP619;
return $$TMP618;
}
)(first);
}
else{
$$TMP617=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP616=$$TMP617;
return $$TMP616;
}
)($$root["car"](expr));
}
else{
$$TMP613=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP612=$$TMP613;
return $$TMP612;
}
)(this);
return $$TMP611;
}
));
$$root["VM"]=$$root["require"]("vm");
$$root["VM"];
$$root["Reflect"]=$$root["require"]("harmony-reflect");
$$root["Reflect"];
$$root["path"]=$$root["require"]("path");
$$root["path"];
$$root["fs"]=$$root["require"]("fs");
$$root["fs"];
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["gen-jstr"]=(function(pair){
   var $$TMP632;
$$TMP632=$$root["str"]($$root["geti"]($$root["second"](pair),(new $$root.Symbol("data"))),$$root["geti"]($$root["first"](pair),(new $$root.Symbol("data"))));
return $$TMP632;
}
);
$$root["gen-jstr"];
$$root["default-lexenv"]=(function(){
   var $$TMP633;
   $$TMP633=(function(__GS60){
      var $$TMP634;
$$root["seti!"](__GS60,"this",true);
$$TMP634=__GS60;
return $$TMP634;
}
)($$root["object"]());
return $$TMP633;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP635;
   $$TMP635=(function(self){
      var $$TMP636;
      $$TMP636=(function(root,sandbox){
         var $$TMP637;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP638;
$$TMP638=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP638;
}
));
$$root["seti!"](root,"load-file",(function(path){
   var $$TMP639;
$$TMP639=$$root["call-method-by-name"](self,(new $$root.Symbol("load-file")),path);
return $$TMP639;
}
));
$$TMP637=(function(__GS61){
   var $$TMP640;
$$root["seti!"](__GS61,"root",root);
$$root["seti!"](__GS61,"dir-stack",$$root["list"](($$root["process"]).cwd()));
$$root["seti!"](__GS61,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP640=__GS61;
return $$TMP640;
}
)(self);
return $$TMP637;
}
)($$root["make-default-ns"](),$$root["object"]());
return $$TMP636;
}
)(this);
return $$TMP635;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP641;
   $$TMP641=(function(self){
      var $$TMP642;
      $$TMP642=(function(tmp){
         var $$TMP643;
$$TMP643=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
return $$TMP643;
}
)($$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP642;
}
)(this);
return $$TMP641;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP644;
   $$TMP644=(function(self){
      var $$TMP645;
      $$TMP645=(function(forms){
         var $$TMP646;
         $$TMP646=(function(__GS62,__GS63,form){
            var $$TMP647;
            $$TMP647=(function(__GS64,__GS65){
               var $$TMP648;
               $$TMP648=(function(recur){
                  var $$TMP650;
                  var $$TMP651;
                  while(true){
                     __GS64=true;
                     __GS64;
                     var $$TMP652;
                     var $$TMP653;
if($$root["not"]($$root["null?"](__GS63))){
   $$TMP653=true;
}
else{
   $$TMP653=false;
}
if($$TMP653){
   var $$TMP654;
   {
form=$$root["car"](__GS63);
form;
__GS62=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS62;
__GS63=$$root["cdr"](__GS63);
__GS63;
$$TMP654=recur();
}
$$TMP652=$$TMP654;
}
else{
   var $$TMP655;
   {
      $$TMP655=__GS62;
   }
   $$TMP652=$$TMP655;
}
__GS65=$$TMP652;
__GS65;
var $$TMP656;
if($$root["not"](__GS64)){
   continue;
   $$TMP656=undefined;
}
else{
   $$TMP656=__GS65;
}
$$TMP651=$$TMP656;
break;
}
$$TMP650=$$TMP651;
return $$TMP650;
}
)((function(){
   var $$TMP649;
   __GS64=false;
   $$TMP649=__GS64;
   return $$TMP649;
}
));
return $$TMP648;
}
)(false,undefined);
return $$TMP647;
}
)(undefined,forms,[]);
return $$TMP646;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP645;
}
)(this);
return $$TMP644;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("load-file")),(function(path){
   var $$TMP657;
   $$TMP657=(function(self){
      var $$TMP658;
      $$TMP658=undefined;
      return $$TMP658;
   }
   )(this);
   return $$TMP657;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP659;
   $$TMP659=(function(self){
      var $$TMP660;
$$TMP660=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["gen-jstr"](compilation__MINUSresult));
return $$TMP660;
}
)(this);
return $$TMP659;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP661;
   $$TMP661=(function(self){
      var $$TMP662;
      $$TMP662=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP663;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP664;
   $$TMP664=(function(r){
      var $$TMP665;
      var $$TMP666;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   var $$TMP667;
   {
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti"](r,(new $$root.Symbol("code"))));
r;
$$TMP667=$$root["seti!"](target,name,r);
}
$$TMP666=$$TMP667;
}
else{
   $$TMP666=undefined;
}
$$TMP666;
$$TMP665=r;
return $$TMP665;
}
)($$root["geti"](target,name));
return $$TMP664;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP668;
$$TMP668=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP668;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP669;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP669=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP669;
}
));
$$TMP663=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP663;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP662;
}
)(this);
return $$TMP661;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP670;
   $$TMP670=(function(self){
      var $$TMP671;
      $$TMP671=(function(lexenv){
         var $$TMP672;
         $$TMP672=(function(__GS66){
            var $$TMP673;
            var $$TMP674;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("def"))),(new $$root.Symbol("name")),(new $$root.Symbol("val"))))){
   $$TMP674=(function(__GS67){
      var $$TMP675;
      $$TMP675=(function(name,val){
         var $$TMP676;
         $$TMP676=(function(tmp){
            var $$TMP677;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP677=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP677;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP676;
}
)($$root["nth"](1,__GS67),$$root["nth"](2,__GS67));
return $$TMP675;
}
)(__GS66);
}
else{
   var $$TMP678;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("setmac!"))),(new $$root.Symbol("name"))))){
   $$TMP678=(function(__GS68){
      var $$TMP679;
      $$TMP679=(function(name){
         var $$TMP680;
         $$TMP680=(function(tmp){
            var $$TMP681;
$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
$$TMP681=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP681;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP680;
}
)($$root["nth"](1,__GS68));
return $$TMP679;
}
)(__GS66);
}
else{
   var $$TMP682;
if($$root["matches?"](__GS66,$$root.list($$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("lambda"))),$$root.list((new $$root.Symbol("&args"))),(new $$root.Symbol("&body")))))){
   $$TMP682=(function(__GS69){
      var $$TMP683;
      $$TMP683=(function(__GS70){
         var $$TMP684;
         $$TMP684=(function(__GS71){
            var $$TMP685;
            $$TMP685=(function(args,body){
               var $$TMP686;
$$TMP686=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP686;
}
)($$root["drop"](0,__GS71),$$root["drop"](2,__GS70));
return $$TMP685;
}
)($$root["nth"](1,__GS70));
return $$TMP684;
}
)($$root["nth"](0,__GS69));
return $$TMP683;
}
)(__GS66);
}
else{
   var $$TMP687;
if($$root["matches?"](__GS66,$$root.list((new $$root.Symbol("name")),(new $$root.Symbol("&args"))))){
   $$TMP687=(function(__GS72){
      var $$TMP688;
      $$TMP688=(function(name,args){
         var $$TMP689;
         var $$TMP690;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP690=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP690=(function(tmp){
      var $$TMP691;
$$TMP691=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP691;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP689=$$TMP690;
return $$TMP689;
}
)($$root["nth"](0,__GS72),$$root["drop"](1,__GS72));
return $$TMP688;
}
)(__GS66);
}
else{
   var $$TMP692;
if($$root["matches?"](__GS66,(new $$root.Symbol("any")))){
   $$TMP692=(function(any){
      var $$TMP693;
      $$TMP693=(function(tmp){
         var $$TMP694;
$$TMP694=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP694;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP693;
}
)(__GS66);
}
else{
   var $$TMP695;
   if(true){
$$TMP695=$$root["error"]("Fell out of case!");
}
else{
   $$TMP695=undefined;
}
$$TMP692=$$TMP695;
}
$$TMP687=$$TMP692;
}
$$TMP682=$$TMP687;
}
$$TMP678=$$TMP682;
}
$$TMP674=$$TMP678;
}
$$TMP673=$$TMP674;
return $$TMP673;
}
)(e);
return $$TMP672;
}
)($$root["default-lexenv"]());
return $$TMP671;
}
)(this);
return $$TMP670;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP696;
   $$TMP696=(function(self){
      var $$TMP697;
$$TMP697=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP697;
}
)(this);
return $$TMP696;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
