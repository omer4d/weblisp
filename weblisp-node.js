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
$$TMP94=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](s),$$root["list"]($$root["symbol"]($$root["str"]("_",$$root["geti-safe"](s,(new $$root.Symbol("name")))))));
return $$TMP94;
}
),binding__MINUSnames),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("dumb-loop"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](true))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](res__MINUSsym),body)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"](done__MINUSflag__MINUSsym))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("continue"))))),$$root["list"](res__MINUSsym))))))));
return $$TMP93;
}
)($$root["every-nth"](2,bindings),$$root["map"]((function(s){
   var $$TMP92;
$$TMP92=$$root["symbol"]($$root["str"]("_",$$root["geti-safe"](s,(new $$root.Symbol("name")))));
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
$$root["geti-safe"]=(function(obj,name){
   var $$TMP112;
   var $$TMP113;
if($$root["in?"](name,obj)){
$$TMP113=$$root["geti"](obj,name);
}
else{
$$TMP113=$$root["error"]($$root["str"]("Property '",name,"' does not exist in ",obj));
}
$$TMP112=$$TMP113;
return $$TMP112;
}
);
$$root["geti-safe"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP115=2;
   $$TMP115<arguments.length;
   ++$$TMP115){
      args[$$TMP115-2]=arguments[$$TMP115];
   }
   var $$TMP114;
$$TMP114=$$root["apply-method"]($$root["geti-safe"](obj,name),obj,args);
return $$TMP114;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP116;
   var $$TMP117;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP117=obj__MINUSname;
}
else{
   var $$TMP118;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP118=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP118=$$root["concat"]($$root["list"]((new $$root.Symbol("geti-safe"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP117=$$TMP118;
}
$$TMP116=$$TMP117;
return $$TMP116;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP120=1;
   $$TMP120<arguments.length;
   ++$$TMP120){
      fields[$$TMP120-1]=arguments[$$TMP120];
   }
   var $$TMP119;
$$TMP119=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP119;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP121;
   var $$TMP122;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP122=obj__MINUSname;
}
else{
$$TMP122=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP121=$$TMP122;
return $$TMP121;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP124=1;
   $$TMP124<arguments.length;
   ++$$TMP124){
      fields[$$TMP124-1]=arguments[$$TMP124];
   }
   var $$TMP123;
$$TMP123=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP123;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP125;
$$TMP125=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP125;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP126;
   var $$TMP127;
if($$root["null?"](a)){
$$TMP127=$$root["null?"](b);
}
else{
   var $$TMP128;
if($$root["symbol?"](a)){
   var $$TMP129;
if($$root["symbol?"](b)){
   var $$TMP130;
if($$root["="]($$root["geti-safe"](a,(new $$root.Symbol("name"))),$$root["geti-safe"](b,(new $$root.Symbol("name"))))){
   $$TMP130=true;
}
else{
   $$TMP130=false;
}
$$TMP129=$$TMP130;
}
else{
   $$TMP129=false;
}
$$TMP128=$$TMP129;
}
else{
   var $$TMP131;
if($$root["atom?"](a)){
$$TMP131=$$root["="](a,b);
}
else{
   var $$TMP132;
if($$root["list?"](a)){
   var $$TMP133;
if($$root["list?"](b)){
   var $$TMP134;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP135;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
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
}
else{
   $$TMP133=false;
}
$$TMP132=$$TMP133;
}
else{
   $$TMP132=undefined;
}
$$TMP131=$$TMP132;
}
$$TMP128=$$TMP131;
}
$$TMP127=$$TMP128;
}
$$TMP126=$$TMP127;
return $$TMP126;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP136;
   $$TMP136=(function(res){
      var $$TMP145;
$$TMP145=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP145;
}
)((function(__GS3,__GS4,l1,l2){
   var $$TMP137;
   $$TMP137=(function(recur){
      var $$TMP139;
      var $$TMP140;
      while(true){
         __GS3=true;
         __GS3;
         var $$TMP141;
         if((function(c){
            var $$TMP142;
            var $$TMP143;
            if(c){
               $$TMP143=c;
            }
            else{
$$TMP143=p($$root["car"](l2));
}
$$TMP142=$$TMP143;
return $$TMP142;
}
)($$root["null?"](l2))){
$$TMP141=$$root["list"](l1,l2);
}
else{
$$TMP141=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
__GS4=$$TMP141;
__GS4;
var $$TMP144;
if($$root["not"](__GS3)){
   continue;
   $$TMP144=undefined;
}
else{
   $$TMP144=__GS4;
}
$$TMP140=$$TMP144;
break;
}
$$TMP139=$$TMP140;
return $$TMP139;
}
)((function(_l1,_l2){
   var $$TMP138;
   l1=_l1;
   l1;
   l2=_l2;
   l2;
   __GS3=false;
   $$TMP138=__GS3;
   return $$TMP138;
}
));
return $$TMP137;
}
)(false,undefined,[],lst));
return $$TMP136;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP146;
   var $$TMP147;
if($$root["reduce"]((function(accum,v){
   var $$TMP148;
   var $$TMP149;
   if(accum){
      $$TMP149=accum;
   }
   else{
      $$TMP149=v;
   }
   $$TMP148=$$TMP149;
   return $$TMP148;
}
),lst,false)){
   $$TMP147=true;
}
else{
   $$TMP147=false;
}
$$TMP146=$$TMP147;
return $$TMP146;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP150;
$$TMP150=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP151;
   var $$TMP152;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP153;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP153=true;
}
else{
   $$TMP153=false;
}
$$TMP152=$$TMP153;
}
else{
   $$TMP152=false;
}
$$TMP151=$$TMP152;
return $$TMP151;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP150;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP154;
   $$TMP154=(function(binding__MINUSnames){
      var $$TMP155;
      $$TMP155=(function(divs){
         var $$TMP157;
         var $$TMP158;
if($$root["null?"]($$root["second"](divs))){
$$TMP158=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP158=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP157=$$TMP158;
return $$TMP157;
}
)($$root["split"]((function(pair){
   var $$TMP156;
$$TMP156=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP156;
}
),binding__MINUSpairs));
return $$TMP155;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP154;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP160=1;
   $$TMP160<arguments.length;
   ++$$TMP160){
      body[$$TMP160-1]=arguments[$$TMP160];
   }
   var $$TMP159;
$$TMP159=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP159;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP161;
   $$TMP161=(function(x){
      var $$TMP162;
$$TMP162=$$root["not"](f(x));
return $$TMP162;
}
);
return $$TMP161;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP163;
   $$TMP163=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP165=0;
      $$TMP165<arguments.length;
      ++$$TMP165){
         args[$$TMP165-0]=arguments[$$TMP165];
      }
      var $$TMP164;
$$TMP164=f1($$root["apply"](f2,args));
return $$TMP164;
}
);
return $$TMP163;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP169=1;
   $$TMP169<arguments.length;
   ++$$TMP169){
      args1[$$TMP169-1]=arguments[$$TMP169];
   }
   var $$TMP166;
   $$TMP166=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP168=0;
      $$TMP168<arguments.length;
      ++$$TMP168){
         args2[$$TMP168-0]=arguments[$$TMP168];
      }
      var $$TMP167;
$$TMP167=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP167;
}
);
return $$TMP166;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP173=2;
   $$TMP173<arguments.length;
   ++$$TMP173){
      args1[$$TMP173-2]=arguments[$$TMP173];
   }
   var $$TMP170;
   $$TMP170=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP172=0;
      $$TMP172<arguments.length;
      ++$$TMP172){
         args2[$$TMP172-0]=arguments[$$TMP172];
      }
      var $$TMP171;
$$TMP171=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP171;
}
);
return $$TMP170;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP177=0;
   $$TMP177<arguments.length;
   ++$$TMP177){
      args[$$TMP177-0]=arguments[$$TMP177];
   }
   var $$TMP174;
   $$TMP174=(function(rx){
      var $$TMP175;
$$TMP175=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP176;
$$TMP176=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP176;
}
));
return $$TMP175;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP174;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP184=1;
   $$TMP184<arguments.length;
   ++$$TMP184){
      pairs[$$TMP184-1]=arguments[$$TMP184];
   }
   var $$TMP178;
   $$TMP178=(function(e__MINUSname,def__MINUSidx){
      var $$TMP179;
      var $$TMP180;
if($$root["="](def__MINUSidx,-1)){
$$TMP180=$$root.list((new $$root.Symbol("error")),"Fell out of case!");
}
else{
$$TMP180=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP179=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP181;
$$TMP181=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP182;
$$TMP182=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP182;
}
),$$root["filter"]((function(pair){
   var $$TMP183;
$$TMP183=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP183;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP181;
}
)($$TMP180,$$root["partition"](2,pairs));
return $$TMP179;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP178;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP185;
   $$TMP185=(function(expr__MINUSname){
      var $$TMP186;
$$TMP186=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP187;
   var $$TMP188;
if($$root["symbol?"](v)){
   var $$TMP189;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP189=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP190;
if($$root["="]($$root["geti-safe"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP190=[];
}
else{
$$TMP190=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP189=$$TMP190;
}
$$TMP188=$$TMP189;
}
else{
$$TMP188=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP187=$$TMP188;
return $$TMP187;
}
),structure)));
return $$TMP186;
}
)($$root["gensym"]());
return $$TMP185;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP193=2;
   $$TMP193<arguments.length;
   ++$$TMP193){
      body[$$TMP193-2]=arguments[$$TMP193];
   }
   var $$TMP191;
   var $$TMP192;
if($$root["symbol?"](structure)){
$$TMP192=$$root["list"](structure,expr);
}
else{
$$TMP192=$$root["destruct-helper"](structure,expr);
}
$$TMP191=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP192),body);
return $$TMP191;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP194;
   var $$TMP195;
if($$root["list?"](expr)){
   var $$TMP196;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP196=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP196=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP195=$$TMP196;
}
else{
   $$TMP195=expr;
}
$$TMP194=$$TMP195;
return $$TMP194;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP197;
   var $$TMP198;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP198=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP199;
   var $$TMP200;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP201;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP201=true;
}
else{
   $$TMP201=false;
}
$$TMP200=$$TMP201;
}
else{
   $$TMP200=false;
}
if($$TMP200){
$$TMP199=$$root["list?"](expr);
}
else{
   var $$TMP202;
   if(true){
      var $$TMP203;
      var $$TMP204;
if($$root["list?"](expr)){
   var $$TMP205;
if($$root["not"]($$root["null?"](expr))){
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
if($$TMP204){
   var $$TMP206;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP207;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP207=true;
}
else{
   $$TMP207=false;
}
$$TMP206=$$TMP207;
}
else{
   $$TMP206=false;
}
$$TMP203=$$TMP206;
}
else{
   $$TMP203=false;
}
$$TMP202=$$TMP203;
}
else{
   $$TMP202=undefined;
}
$$TMP199=$$TMP202;
}
$$TMP198=$$TMP199;
}
$$TMP197=$$TMP198;
return $$TMP197;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP208;
   var $$TMP209;
if($$root["null?"](patt)){
$$TMP209=$$root["null?"](expr);
}
else{
   var $$TMP210;
if($$root["list?"](patt)){
$$TMP210=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP211;
if($$root["symbol?"](patt)){
   $$TMP211=true;
}
else{
   var $$TMP212;
   if(true){
$$TMP212=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP212=undefined;
}
$$TMP211=$$TMP212;
}
$$TMP210=$$TMP211;
}
$$TMP209=$$TMP210;
}
$$TMP208=$$TMP209;
return $$TMP208;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP213;
   var $$TMP214;
   var $$TMP215;
if($$root["list?"](patt)){
   var $$TMP216;
if($$root["not"]($$root["null?"](patt))){
   $$TMP216=true;
}
else{
   $$TMP216=false;
}
$$TMP215=$$TMP216;
}
else{
   $$TMP215=false;
}
if($$TMP215){
   var $$TMP217;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP217=(new $$root.Symbol("_"));
}
else{
$$TMP217=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP214=$$TMP217;
}
else{
   $$TMP214=patt;
}
$$TMP213=$$TMP214;
return $$TMP213;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP221=1;
   $$TMP221<arguments.length;
   ++$$TMP221){
      pairs[$$TMP221-1]=arguments[$$TMP221];
   }
   var $$TMP218;
   $$TMP218=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP219;
$$TMP219=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP220;
$$TMP220=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP220;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP219;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP218;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP222;
   $$TMP222=(function(__GS5){
      var $$TMP223;
      var $$TMP224;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP224=(function(__GS6){
      var $$TMP225;
      $$TMP225=(function(obj,field){
         var $$TMP226;
$$TMP226=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP226;
}
)($$root["nth"](1,__GS6),$$root["nth"](2,__GS6));
return $$TMP225;
}
)(__GS5);
}
else{
   var $$TMP227;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti-safe"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP227=(function(__GS7){
      var $$TMP228;
      $$TMP228=(function(obj,field){
         var $$TMP229;
$$TMP229=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP229;
}
)($$root["nth"](1,__GS7),$$root["nth"](2,__GS7));
return $$TMP228;
}
)(__GS5);
}
else{
   var $$TMP230;
if($$root["matches?"](__GS5,(new $$root.Symbol("any")))){
   $$TMP230=(function(any){
      var $$TMP231;
      var $$TMP232;
if($$root["symbol?"](any)){
$$TMP232=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP232=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP231=$$TMP232;
return $$TMP231;
}
)(__GS5);
}
else{
   var $$TMP233;
   if(true){
$$TMP233=$$root["error"]("Fell out of case!");
}
else{
   $$TMP233=undefined;
}
$$TMP230=$$TMP233;
}
$$TMP227=$$TMP230;
}
$$TMP224=$$TMP227;
}
$$TMP223=$$TMP224;
return $$TMP223;
}
)($$root["macroexpand"](place));
return $$TMP222;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP234;
   amt=(function(c){
      var $$TMP235;
      var $$TMP236;
      if(c){
         $$TMP236=c;
      }
      else{
         $$TMP236=1;
      }
      $$TMP235=$$TMP236;
      return $$TMP235;
   }
   )(amt);
   amt;
$$TMP234=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP234;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP237;
   amt=(function(c){
      var $$TMP238;
      var $$TMP239;
      if(c){
         $$TMP239=c;
      }
      else{
         $$TMP239=1;
      }
      $$TMP238=$$TMP239;
      return $$TMP238;
   }
   )(amt);
   amt;
$$TMP237=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP237;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP240;
$$TMP240=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP240;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP241;
$$TMP241=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP241;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP242;
$$TMP242=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP242;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP243;
   var $$TMP244;
if($$root["="](pos,0)){
$$TMP244=$$root["cons"](x,lst);
}
else{
   var $$TMP245;
if($$root["null?"](lst)){
   $$TMP245=undefined;
}
else{
$$TMP245=$$root["car"](lst);
}
$$TMP244=$$root["cons"]($$TMP245,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP243=$$TMP244;
return $$TMP243;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP248=1;
   $$TMP248<arguments.length;
   ++$$TMP248){
      forms[$$TMP248-1]=arguments[$$TMP248];
   }
   var $$TMP246;
   var $$TMP247;
if($$root["null?"](forms)){
   $$TMP247=x;
}
else{
$$TMP247=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP246=$$TMP247;
return $$TMP246;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP251=1;
   $$TMP251<arguments.length;
   ++$$TMP251){
      forms[$$TMP251-1]=arguments[$$TMP251];
   }
   var $$TMP249;
   var $$TMP250;
if($$root["null?"](forms)){
   $$TMP250=x;
}
else{
$$TMP250=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP249=$$TMP250;
return $$TMP249;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP257=1;
   $$TMP257<arguments.length;
   ++$$TMP257){
      body[$$TMP257-1]=arguments[$$TMP257];
   }
   var $$TMP252;
   $$TMP252=(function(binding__MINUSname){
      var $$TMP253;
$$TMP253=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP254;
   $$TMP254=(function(__GS8){
      var $$TMP255;
      $$TMP255=(function(f,args){
         var $$TMP256;
$$TMP256=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP256;
}
)($$root["nth"](0,__GS8),$$root["drop"](1,__GS8));
return $$TMP255;
}
)(v);
return $$TMP254;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP253;
}
)($$root["gensym"]());
return $$TMP252;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP266=1;
   $$TMP266<arguments.length;
   ++$$TMP266){
      kvs[$$TMP266-1]=arguments[$$TMP266];
   }
   var $$TMP258;
   $$TMP258=(function(__GS9,__GS10,kvs){
      var $$TMP259;
      $$TMP259=(function(recur){
         var $$TMP261;
         var $$TMP262;
         while(true){
            __GS9=true;
            __GS9;
            var $$TMP263;
if($$root["null?"](kvs)){
   $$TMP263=obj;
}
else{
   var $$TMP264;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP264=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP263=$$TMP264;
}
__GS10=$$TMP263;
__GS10;
var $$TMP265;
if($$root["not"](__GS9)){
   continue;
   $$TMP265=undefined;
}
else{
   $$TMP265=__GS10;
}
$$TMP262=$$TMP265;
break;
}
$$TMP261=$$TMP262;
return $$TMP261;
}
)((function(_kvs){
   var $$TMP260;
   kvs=_kvs;
   kvs;
   __GS9=false;
   $$TMP260=__GS9;
   return $$TMP260;
}
));
return $$TMP259;
}
)(false,undefined,kvs);
return $$TMP258;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP275=2;
   $$TMP275<arguments.length;
   ++$$TMP275){
      kvs[$$TMP275-2]=arguments[$$TMP275];
   }
   var $$TMP267;
   (function(__GS11,__GS12,obj,path,kvs){
      var $$TMP268;
      $$TMP268=(function(recur){
         var $$TMP270;
         var $$TMP271;
         while(true){
            __GS11=true;
            __GS11;
            var $$TMP272;
if($$root["null?"](path)){
$$TMP272=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP273;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP273=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP273=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP272=recur($$TMP273,$$root["cdr"](path),kvs);
}
__GS12=$$TMP272;
__GS12;
var $$TMP274;
if($$root["not"](__GS11)){
   continue;
   $$TMP274=undefined;
}
else{
   $$TMP274=__GS12;
}
$$TMP271=$$TMP274;
break;
}
$$TMP270=$$TMP271;
return $$TMP270;
}
)((function(_obj,_path,_kvs){
   var $$TMP269;
   obj=_obj;
   obj;
   path=_path;
   path;
   kvs=_kvs;
   kvs;
   __GS11=false;
   $$TMP269=__GS11;
   return $$TMP269;
}
));
return $$TMP268;
}
)(false,undefined,obj,path,kvs);
$$TMP267=obj;
return $$TMP267;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP276;
   var $$TMP277;
if($$root["null?"](path)){
   $$TMP277=obj;
}
else{
   $$TMP277=(function(tmp){
      var $$TMP278;
      var $$TMP279;
      if(tmp){
$$TMP279=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP279=undefined;
}
$$TMP278=$$TMP279;
return $$TMP278;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP276=$$TMP277;
return $$TMP276;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP281=1;
   $$TMP281<arguments.length;
   ++$$TMP281){
      path[$$TMP281-1]=arguments[$$TMP281];
   }
   var $$TMP280;
$$TMP280=$$root["deep-geti*"](obj,path);
return $$TMP280;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP282;
$$TMP282=$$root["reduce"]((function(h2,key){
   var $$TMP283;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP283=h2;
return $$TMP283;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP282;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP285=1;
   $$TMP285<arguments.length;
   ++$$TMP285){
      kvs[$$TMP285-1]=arguments[$$TMP285];
   }
   var $$TMP284;
$$TMP284=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP284;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP294=1;
   $$TMP294<arguments.length;
   ++$$TMP294){
      kfs[$$TMP294-1]=arguments[$$TMP294];
   }
   var $$TMP286;
   $$TMP286=(function(__GS13,__GS14,kfs){
      var $$TMP287;
      $$TMP287=(function(recur){
         var $$TMP289;
         var $$TMP290;
         while(true){
            __GS13=true;
            __GS13;
            var $$TMP291;
if($$root["null?"](kfs)){
   $$TMP291=h;
}
else{
   $$TMP291=(function(key){
      var $$TMP292;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP292=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP292;
}
)($$root["first"](kfs));
}
__GS14=$$TMP291;
__GS14;
var $$TMP293;
if($$root["not"](__GS13)){
   continue;
   $$TMP293=undefined;
}
else{
   $$TMP293=__GS14;
}
$$TMP290=$$TMP293;
break;
}
$$TMP289=$$TMP290;
return $$TMP289;
}
)((function(_kfs){
   var $$TMP288;
   kfs=_kfs;
   kfs;
   __GS13=false;
   $$TMP288=__GS13;
   return $$TMP288;
}
));
return $$TMP287;
}
)(false,undefined,kfs);
return $$TMP286;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP296=1;
   $$TMP296<arguments.length;
   ++$$TMP296){
      kfs[$$TMP296-1]=arguments[$$TMP296];
   }
   var $$TMP295;
$$TMP295=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP295;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP298=1;
   $$TMP298<arguments.length;
   ++$$TMP298){
      body[$$TMP298-1]=arguments[$$TMP298];
   }
   var $$TMP297;
$$TMP297=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP297;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP299;
$$TMP299=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP299;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP300;
   step=(function(c){
      var $$TMP301;
      var $$TMP302;
      if(c){
         $$TMP302=c;
      }
      else{
         $$TMP302=1;
      }
      $$TMP301=$$TMP302;
      return $$TMP301;
   }
   )(step);
   step;
   $$TMP300=(function(data){
      var $$TMP303;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP303=data;
return $$TMP303;
}
)($$root["object"]([]));
return $$TMP300;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP304;
   step=(function(c){
      var $$TMP305;
      var $$TMP306;
      if(c){
         $$TMP306=c;
      }
      else{
         $$TMP306=1;
      }
      $$TMP305=$$TMP306;
      return $$TMP305;
   }
   )(step);
   step;
   $$TMP304=(function(data){
      var $$TMP307;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP307=data;
return $$TMP307;
}
)($$root["object"]([]));
return $$TMP304;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP308;
   $$TMP308=(function(len__MINUSname,data){
      var $$TMP309;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP309=data;
return $$TMP309;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP308;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP310;
   $$TMP310=(function(lst__MINUSname,data){
      var $$TMP311;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP311=data;
return $$TMP311;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP310;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP312;
   $$TMP312=(function(__GS15){
      var $$TMP313;
      $$TMP313=(function(binding__MINUSname,__GS16){
         var $$TMP314;
         $$TMP314=(function(func__MINUSname,args){
            var $$TMP315;
$$TMP315=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP315;
}
)($$root["nth"](0,__GS16),$$root["drop"](1,__GS16));
return $$TMP314;
}
)($$root["nth"](1,__GS15),$$root["nth"](2,__GS15));
return $$TMP313;
}
)(form);
return $$TMP312;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP316;
   $$TMP316=(function(data){
      var $$TMP317;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP317=data;
return $$TMP317;
}
)($$root["object"]([]));
return $$TMP316;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP318;
   $$TMP318=(function(data){
      var $$TMP319;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP319=data;
return $$TMP319;
}
)($$root["object"]([]));
return $$TMP318;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP320;
   $$TMP320=(function(data){
      var $$TMP321;
      (function(__GS17){
         var $$TMP322;
         $$TMP322=(function(binding__MINUSname,body){
            var $$TMP323;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP323=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP323;
}
)($$root["nth"](1,__GS17),$$root["drop"](2,__GS17));
return $$TMP322;
}
)(form);
$$TMP321=data;
return $$TMP321;
}
)($$root["object"]([]));
return $$TMP320;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP324;
   $$TMP324=(function(data){
      var $$TMP325;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP325=data;
return $$TMP325;
}
)($$root["object"]([]));
return $$TMP324;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP326;
   $$TMP326=(function(data,accum__MINUSname){
      var $$TMP327;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP327=data;
return $$TMP327;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP326;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP328;
$$TMP328=$$root["filter"]((function(x){
   var $$TMP329;
$$TMP329=$$root["not="](x,undefined);
return $$TMP329;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP328;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP345=0;
   $$TMP345<arguments.length;
   ++$$TMP345){
      forms[$$TMP345-0]=arguments[$$TMP345];
   }
   var $$TMP330;
   $$TMP330=(function(res__MINUSname){
      var $$TMP331;
      $$TMP331=(function(all){
         var $$TMP341;
         $$TMP341=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP343;
            var $$TMP344;
if($$root["null?"](final__MINUSactions)){
$$TMP344=$$root["list"](res__MINUSname);
}
else{
   $$TMP344=final__MINUSactions;
}
$$TMP343=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP344)))))));
return $$TMP343;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP342;
$$TMP342=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP342;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP341;
}
)($$root["map"]((function(form){
   var $$TMP332;
   $$TMP332=(function(__GS18){
      var $$TMP333;
      var $$TMP334;
if($$root["equal?"](__GS18,(new $$root.Symbol("let")))){
$$TMP334=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP335;
if($$root["equal?"](__GS18,(new $$root.Symbol("for")))){
$$TMP335=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP336;
if($$root["equal?"](__GS18,(new $$root.Symbol("while")))){
$$TMP336=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP337;
if($$root["equal?"](__GS18,(new $$root.Symbol("do")))){
$$TMP337=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP338;
if($$root["equal?"](__GS18,(new $$root.Symbol("collecting")))){
$$TMP338=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP339;
if($$root["equal?"](__GS18,(new $$root.Symbol("finally")))){
$$TMP339=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP340;
   if(true){
$$TMP340=$$root["error"]("Unknown iterate form");
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
return $$TMP333;
}
)($$root["car"](form));
return $$TMP332;
}
),forms));
return $$TMP331;
}
)($$root["gensym"]());
return $$TMP330;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP350=1;
   $$TMP350<arguments.length;
   ++$$TMP350){
      kvs[$$TMP350-1]=arguments[$$TMP350];
   }
   var $$TMP346;
   $$TMP346=(function(meta){
      var $$TMP347;
      var $$TMP348;
if($$root["not"](meta)){
   var $$TMP349;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP349=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP348=$$TMP349;
}
else{
   $$TMP348=undefined;
}
$$TMP348;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP347=obj;
return $$TMP347;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP346;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP351;
$$TMP351=$$root["print"](($$root["JSON"]).stringify($$root["geti-safe"](x,(new $$root.Symbol("meta")))));
return $$TMP351;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP354=1;
   $$TMP354<arguments.length;
   ++$$TMP354){
      fields[$$TMP354-1]=arguments[$$TMP354];
   }
   var $$TMP352;
$$TMP352=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP353;
$$TMP353=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP353;
}
),fields))));
return $$TMP352;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP355;
   $$TMP355=(s).slice(start,end);
   return $$TMP355;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP356;
$$TMP356=$$root["<"](x,0);
return $$TMP356;
}
);
$$root["neg?"];
$$root["idiv"]=(function(a,b){
   var $$TMP357;
   $$TMP357=(function(t){
      var $$TMP358;
      var $$TMP359;
if($$root["neg?"](t)){
$$TMP359=($$root["Math"]).ceil(t);
}
else{
$$TMP359=($$root["Math"]).floor(t);
}
$$TMP358=$$TMP359;
return $$TMP358;
}
)($$root["/"](a,b));
return $$TMP357;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP360;
   var $$TMP361;
if($$root["string?"](x)){
$$TMP361=$$root["="]($$root["geti-safe"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP362;
if($$root["list?"](x)){
$$TMP362=$$root["null?"](x);
}
else{
   var $$TMP363;
   if(true){
$$TMP363=$$root["error"]("Type error in empty?");
}
else{
   $$TMP363=undefined;
}
$$TMP362=$$TMP363;
}
$$TMP361=$$TMP362;
}
$$TMP360=$$TMP361;
return $$TMP360;
}
);
$$root["empty?"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP364;
   $$TMP364=(function(self){
      var $$TMP365;
      $$TMP365=(function(__GS19){
         var $$TMP366;
$$root["seti!"](__GS19,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS19,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS19,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS19,(new $$root.Symbol("len")),len);
$$TMP366=__GS19;
return $$TMP366;
}
)(self);
return $$TMP365;
}
)(this);
return $$TMP364;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP367;
   $$TMP367=(function(self){
      var $$TMP368;
$$TMP368=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti-safe"](self,(new $$root.Symbol("start"))),$$root["geti-safe"](self,(new $$root.Symbol("len"))));
return $$TMP368;
}
)(this);
return $$TMP367;
}
));
$$root["lit"]=(function(s){
   var $$TMP369;
$$TMP369=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP369;
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
   var $$TMP370;
   $$TMP370=(function(toks,pos,s){
      var $$TMP371;
      (function(__GS20,__GS21){
         var $$TMP372;
         $$TMP372=(function(recur){
            var $$TMP374;
            var $$TMP375;
            while(true){
               __GS20=true;
               __GS20;
               var $$TMP376;
if($$root[">"]($$root["geti-safe"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP377;
   {
      (function(__GS22,res,i,__GS23,__GS24,entry,_){
         var $$TMP378;
         $$TMP378=(function(__GS25,__GS26){
            var $$TMP379;
            $$TMP379=(function(recur){
               var $$TMP381;
               var $$TMP382;
               while(true){
                  __GS25=true;
                  __GS25;
                  var $$TMP383;
                  var $$TMP384;
if($$root["<"](i,__GS23)){
   var $$TMP385;
if($$root["not"]($$root["null?"](__GS24))){
   var $$TMP386;
if($$root["not"](res)){
   $$TMP386=true;
}
else{
   $$TMP386=false;
}
$$TMP385=$$TMP386;
}
else{
   $$TMP385=false;
}
$$TMP384=$$TMP385;
}
else{
   $$TMP384=false;
}
if($$TMP384){
   var $$TMP387;
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
$$TMP387=recur();
}
$$TMP383=$$TMP387;
}
else{
   var $$TMP388;
   {
      _=__GS22;
      _;
      var $$TMP389;
      if(res){
         var $$TMP390;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP391;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP392;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP393;
   var $$TMP394;
   if(c){
      $$TMP394=c;
   }
   else{
$$TMP394=$$root["second"](entry);
}
$$TMP393=$$TMP394;
return $$TMP393;
}
)($$root["geti"]($$root["keywords"],$$root["geti-safe"](res,0))),pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP392=toks;
}
$$TMP391=$$TMP392;
}
else{
   $$TMP391=undefined;
}
$$TMP391;
pos=$$root["+"](pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
$$TMP390=pos;
}
$$TMP389=$$TMP390;
}
else{
$$TMP389=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS22=$$TMP389;
$$TMP388=__GS22;
}
$$TMP383=$$TMP388;
}
__GS26=$$TMP383;
__GS26;
var $$TMP395;
if($$root["not"](__GS25)){
   continue;
   $$TMP395=undefined;
}
else{
   $$TMP395=__GS26;
}
$$TMP382=$$TMP395;
break;
}
$$TMP381=$$TMP382;
return $$TMP381;
}
)((function(){
   var $$TMP380;
   __GS25=false;
   $$TMP380=__GS25;
   return $$TMP380;
}
));
return $$TMP379;
}
)(false,undefined);
return $$TMP378;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP377=recur();
}
$$TMP376=$$TMP377;
}
else{
   $$TMP376=undefined;
}
__GS21=$$TMP376;
__GS21;
var $$TMP396;
if($$root["not"](__GS20)){
   continue;
   $$TMP396=undefined;
}
else{
   $$TMP396=__GS21;
}
$$TMP375=$$TMP396;
break;
}
$$TMP374=$$TMP375;
return $$TMP374;
}
)((function(){
   var $$TMP373;
   __GS20=false;
   $$TMP373=__GS20;
   return $$TMP373;
}
));
return $$TMP372;
}
)(false,undefined);
$$TMP371=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP371;
}
)([],0,src);
return $$TMP370;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP397;
   $$TMP397=(function(self){
      var $$TMP398;
$$TMP398=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP398;
}
)(this);
return $$TMP397;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP399;
   $$TMP399=(function(self){
      var $$TMP400;
$$TMP400=$$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos"))));
return $$TMP400;
}
)(this);
return $$TMP399;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP401;
   $$TMP401=(function(self){
      var $$TMP402;
      $$TMP402=(function(curr){
         var $$TMP403;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
$$TMP403=curr;
return $$TMP403;
}
)($$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
return $$TMP402;
}
)(this);
return $$TMP401;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP404;
$$TMP404=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP404;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP405;
$$TMP405=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP405;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP406;
   $$TMP406=(function(self){
      var $$TMP407;
      $$TMP407=(function(tok){
         var $$TMP408;
         $$TMP408=(function(__GS27){
            var $$TMP409;
            var $$TMP410;
if($$root["equal?"](__GS27,(new $$root.Symbol("list-open-tok")))){
$$TMP410=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP411;
if($$root["equal?"](__GS27,(new $$root.Symbol("true-tok")))){
   $$TMP411=true;
}
else{
   var $$TMP412;
if($$root["equal?"](__GS27,(new $$root.Symbol("false-tok")))){
   $$TMP412=false;
}
else{
   var $$TMP413;
if($$root["equal?"](__GS27,(new $$root.Symbol("null-tok")))){
   $$TMP413=[];
}
else{
   var $$TMP414;
if($$root["equal?"](__GS27,(new $$root.Symbol("undef-tok")))){
   $$TMP414=undefined;
}
else{
   var $$TMP415;
if($$root["equal?"](__GS27,(new $$root.Symbol("num-tok")))){
$$TMP415=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP416;
if($$root["equal?"](__GS27,(new $$root.Symbol("str-tok")))){
$$TMP416=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP417;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote-tok")))){
$$TMP417=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP418;
if($$root["equal?"](__GS27,(new $$root.Symbol("backquote-tok")))){
$$TMP418=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP419;
if($$root["equal?"](__GS27,(new $$root.Symbol("sym-tok")))){
$$TMP419=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP420;
   if(true){
$$TMP420=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti-safe"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP420=undefined;
}
$$TMP419=$$TMP420;
}
$$TMP418=$$TMP419;
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
return $$TMP409;
}
)($$root["geti-safe"](tok,(new $$root.Symbol("type"))));
return $$TMP408;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP407;
}
)(this);
return $$TMP406;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP421;
   $$TMP421=(function(s){
      var $$TMP422;
$$TMP422=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP422;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP421;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP423;
$$TMP423=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP423;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP424;
   $$TMP424=(function(self){
      var $$TMP425;
      $$TMP425=(function(start__MINUSpos){
         var $$TMP426;
         $$TMP426=(function(__GS28,__GS29,lst){
            var $$TMP427;
            $$TMP427=(function(__GS30,__GS31){
               var $$TMP428;
               $$TMP428=(function(recur){
                  var $$TMP430;
                  var $$TMP431;
                  while(true){
                     __GS30=true;
                     __GS30;
                     var $$TMP432;
                     var $$TMP433;
                     var $$TMP434;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP435;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP435=true;
}
else{
   $$TMP435=false;
}
$$TMP434=$$TMP435;
}
else{
   $$TMP434=false;
}
if($$TMP434){
   $$TMP433=true;
}
else{
   $$TMP433=false;
}
if($$TMP433){
   var $$TMP436;
   {
__GS29=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS29);
__GS28=__GS29;
__GS28;
$$TMP436=recur();
}
$$TMP432=$$TMP436;
}
else{
   var $$TMP437;
   {
__GS28=$$root["reverse"](__GS29);
__GS28;
lst=__GS28;
lst;
var $$TMP438;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP438=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP438=$$root["error"]("Unmatched paren!");
}
__GS28=$$TMP438;
$$TMP437=__GS28;
}
$$TMP432=$$TMP437;
}
__GS31=$$TMP432;
__GS31;
var $$TMP439;
if($$root["not"](__GS30)){
   continue;
   $$TMP439=undefined;
}
else{
   $$TMP439=__GS31;
}
$$TMP431=$$TMP439;
break;
}
$$TMP430=$$TMP431;
return $$TMP430;
}
)((function(){
   var $$TMP429;
   __GS30=false;
   $$TMP429=__GS30;
   return $$TMP429;
}
));
return $$TMP428;
}
)(false,undefined);
return $$TMP427;
}
)(undefined,[],undefined);
return $$TMP426;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP425;
}
)(this);
return $$TMP424;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP440;
   $$TMP440=(function(self){
      var $$TMP441;
      $$TMP441=(function(__GS32,__GS33,lst){
         var $$TMP442;
         $$TMP442=(function(__GS34,__GS35){
            var $$TMP443;
            $$TMP443=(function(recur){
               var $$TMP445;
               var $$TMP446;
               while(true){
                  __GS34=true;
                  __GS34;
                  var $$TMP447;
                  var $$TMP448;
                  var $$TMP449;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP450;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP450=true;
}
else{
   $$TMP450=false;
}
$$TMP449=$$TMP450;
}
else{
   $$TMP449=false;
}
if($$TMP449){
   $$TMP448=true;
}
else{
   $$TMP448=false;
}
if($$TMP448){
   var $$TMP451;
   {
__GS33=$$root["cons"]((function(__GS36){
   var $$TMP452;
   var $$TMP453;
if($$root["equal?"](__GS36,(new $$root.Symbol("unquote-tok")))){
   var $$TMP454;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP454=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP453=$$TMP454;
}
else{
   var $$TMP455;
if($$root["equal?"](__GS36,(new $$root.Symbol("splice-tok")))){
   var $$TMP456;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP456=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP455=$$TMP456;
}
else{
   var $$TMP457;
   if(true){
$$TMP457=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP457=undefined;
}
$$TMP455=$$TMP457;
}
$$TMP453=$$TMP455;
}
$$TMP452=$$TMP453;
return $$TMP452;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS33);
__GS32=__GS33;
__GS32;
$$TMP451=recur();
}
$$TMP447=$$TMP451;
}
else{
   var $$TMP458;
   {
__GS32=$$root["reverse"](__GS33);
__GS32;
lst=__GS32;
lst;
var $$TMP459;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP459=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP459=$$root["error"]("Unmatched paren!");
}
__GS32=$$TMP459;
$$TMP458=__GS32;
}
$$TMP447=$$TMP458;
}
__GS35=$$TMP447;
__GS35;
var $$TMP460;
if($$root["not"](__GS34)){
   continue;
   $$TMP460=undefined;
}
else{
   $$TMP460=__GS35;
}
$$TMP446=$$TMP460;
break;
}
$$TMP445=$$TMP446;
return $$TMP445;
}
)((function(){
   var $$TMP444;
   __GS34=false;
   $$TMP444=__GS34;
   return $$TMP444;
}
));
return $$TMP443;
}
)(false,undefined);
return $$TMP442;
}
)(undefined,[],undefined);
return $$TMP441;
}
)(this);
return $$TMP440;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP461;
   $$TMP461=(function(self){
      var $$TMP462;
      var $$TMP463;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP464;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP464=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP463=$$TMP464;
}
else{
$$TMP463=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP462=$$TMP463;
return $$TMP462;
}
)(this);
return $$TMP461;
}
));
$$root["parse"]=(function(toks){
   var $$TMP465;
   $$TMP465=(function(p){
      var $$TMP466;
      $$TMP466=(function(__GS37,__GS38){
         var $$TMP467;
         $$TMP467=(function(__GS39,__GS40){
            var $$TMP468;
            $$TMP468=(function(recur){
               var $$TMP470;
               var $$TMP471;
               while(true){
                  __GS39=true;
                  __GS39;
                  var $$TMP472;
                  var $$TMP473;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP473=true;
}
else{
   $$TMP473=false;
}
if($$TMP473){
   var $$TMP474;
   {
__GS38=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS38);
__GS37=__GS38;
__GS37;
$$TMP474=recur();
}
$$TMP472=$$TMP474;
}
else{
   var $$TMP475;
   {
__GS37=$$root["reverse"](__GS38);
$$TMP475=__GS37;
}
$$TMP472=$$TMP475;
}
__GS40=$$TMP472;
__GS40;
var $$TMP476;
if($$root["not"](__GS39)){
   continue;
   $$TMP476=undefined;
}
else{
   $$TMP476=__GS40;
}
$$TMP471=$$TMP476;
break;
}
$$TMP470=$$TMP471;
return $$TMP470;
}
)((function(){
   var $$TMP469;
   __GS39=false;
   $$TMP469=__GS39;
   return $$TMP469;
}
));
return $$TMP468;
}
)(false,undefined);
return $$TMP467;
}
)(undefined,[]);
return $$TMP466;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP465;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS41){
   var $$TMP477;
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
$$TMP477=__GS41;
return $$TMP477;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP478;
$$TMP478=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP478;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP479;
$$TMP479=$$root["geti"]($$root["mangling-table"],x);
return $$TMP479;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP480;
$$TMP480=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP480;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP481;
   $$TMP481=(function(__GS42){
      var $$TMP482;
$$root["seti!"](__GS42,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS42,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP482=__GS42;
return $$TMP482;
}
)($$root["hashmap"]());
return $$TMP481;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP483;
   $$TMP483=(function(__GS43){
      var $$TMP484;
$$root["seti!"](__GS43,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS43,(new $$root.Symbol("mappings")),mappings);
$$TMP484=__GS43;
return $$TMP484;
}
)($$root["hashmap"]());
return $$TMP483;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP485;
$$TMP485=$$root["make-tc-str"](s,[]);
return $$TMP485;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP486;
   $$TMP486=(function(adder){
      var $$TMP488;
$$TMP488=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP488;
}
)((function(x){
   var $$TMP487;
$$TMP487=$$root["+"](x,n);
return $$TMP487;
}
));
return $$TMP486;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP489;
   var $$TMP490;
if($$root["string?"](b)){
$$TMP490=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),b),$$root["geti-safe"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP490=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),$$root["geti-safe"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti-safe"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP491;
$$TMP491=$$root["offset-source-mapping"](e,$$root["geti-safe"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP491;
}
),$$root["geti-safe"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP489=$$TMP490;
return $$TMP489;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP493=0;
   $$TMP493<arguments.length;
   ++$$TMP493){
      args[$$TMP493-0]=arguments[$$TMP493];
   }
   var $$TMP492;
$$TMP492=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP492;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP494;
$$TMP494=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP494;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP510=2;
   $$TMP510<arguments.length;
   ++$$TMP510){
      args[$$TMP510-2]=arguments[$$TMP510];
   }
   var $$TMP495;
   $$TMP495=(function(rx){
      var $$TMP496;
      $$TMP496=(function(__GS44,accum,__GS45,x,n,_){
         var $$TMP497;
         $$TMP497=(function(__GS46,__GS47){
            var $$TMP498;
            $$TMP498=(function(recur){
               var $$TMP500;
               var $$TMP501;
               while(true){
                  __GS46=true;
                  __GS46;
                  var $$TMP502;
                  var $$TMP503;
if($$root["not"]($$root["null?"](__GS45))){
   $$TMP503=true;
}
else{
   $$TMP503=false;
}
if($$TMP503){
   var $$TMP504;
   {
x=$$root["car"](__GS45);
x;
var $$TMP505;
if($$root["even?"](n)){
   $$TMP505=x;
}
else{
$$TMP505=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP505);
__GS44=accum;
__GS44;
__GS45=$$root["cdr"](__GS45);
__GS45;
n=$$root["+"](n,1);
n;
$$TMP504=recur();
}
$$TMP502=$$TMP504;
}
else{
   var $$TMP506;
   {
      _=__GS44;
      _;
      var $$TMP507;
      if(source__MINUSpos){
         var $$TMP508;
         {
$$TMP508=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti-safe"]($$root["geti-safe"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti-safe"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP507=$$TMP508;
}
else{
   $$TMP507=undefined;
}
$$TMP507;
__GS44=accum;
$$TMP506=__GS44;
}
$$TMP502=$$TMP506;
}
__GS47=$$TMP502;
__GS47;
var $$TMP509;
if($$root["not"](__GS46)){
   continue;
   $$TMP509=undefined;
}
else{
   $$TMP509=__GS47;
}
$$TMP501=$$TMP509;
break;
}
$$TMP500=$$TMP501;
return $$TMP500;
}
)((function(){
   var $$TMP499;
   __GS46=false;
   $$TMP499=__GS46;
   return $$TMP499;
}
));
return $$TMP498;
}
)(false,undefined);
return $$TMP497;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP496;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP495;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP511;
   $$TMP511=(function(self){
      var $$TMP512;
      $$TMP512=(function(__GS48){
         var $$TMP513;
$$root["seti!"](__GS48,"root",root);
$$root["seti!"](__GS48,"next-var-suffix",0);
$$TMP513=__GS48;
return $$TMP513;
}
)(self);
return $$TMP512;
}
)(this);
return $$TMP511;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP514;
   $$TMP514=(function(self){
      var $$TMP515;
      $$TMP515=(function(out){
         var $$TMP516;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP516=out;
return $$TMP516;
}
)($$root["str"]("$$TMP",$$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP515;
}
)(this);
return $$TMP514;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP517;
   var $$TMP518;
if($$root["in?"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP518=$$root["mangle-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP518=$$root["str"]("$$root[\"",$$root["geti-safe"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP517=$$TMP518;
return $$TMP517;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP519;
   $$TMP519=(function(self){
      var $$TMP520;
      var $$TMP521;
if($$root["="](x,true)){
$$TMP521=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP522;
if($$root["="](x,false)){
$$TMP522=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP523;
if($$root["null?"](x)){
$$TMP523=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP524;
if($$root["="](x,undefined)){
$$TMP524=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP525;
if($$root["symbol?"](x)){
$$TMP525=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP526;
if($$root["string?"](x)){
$$TMP526=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP527;
   if(true){
$$TMP527=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP527=undefined;
}
$$TMP526=$$TMP527;
}
$$TMP525=$$TMP526;
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
return $$TMP520;
}
)(this);
return $$TMP519;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP528;
   $$TMP528=(function(self){
      var $$TMP529;
      $$TMP529=(function(__GS49){
         var $$TMP530;
         $$TMP530=(function(fun,args){
            var $$TMP531;
            $$TMP531=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP532;
$$TMP532=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP532;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP531;
}
)($$root["nth"](0,__GS49),$$root["drop"](1,__GS49));
return $$TMP530;
}
)(lst);
return $$TMP529;
}
)(this);
return $$TMP528;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP533;
   $$TMP533=(function(self){
      var $$TMP534;
      $$TMP534=(function(__GS50){
         var $$TMP535;
         $$TMP535=(function(fun,args){
            var $$TMP536;
            $$TMP536=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP537;
$$TMP537=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP537;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP536;
}
)($$root["nth"](1,__GS50),$$root["drop"](2,__GS50));
return $$TMP535;
}
)(lst);
return $$TMP534;
}
)(this);
return $$TMP533;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP538;
   $$TMP538=(function(self){
      var $$TMP539;
      $$TMP539=(function(__GS51){
         var $$TMP540;
         $$TMP540=(function(method,obj,args){
            var $$TMP541;
            $$TMP541=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP542;
$$TMP542=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP542;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP541;
}
)($$root["nth"](0,__GS51),$$root["nth"](1,__GS51),$$root["drop"](2,__GS51));
return $$TMP540;
}
)(lst);
return $$TMP539;
}
)(this);
return $$TMP538;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP543;
   $$TMP543=(function(self){
      var $$TMP544;
      $$TMP544=(function(compiled__MINUSbody,reducer){
         var $$TMP546;
$$TMP546=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP546;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP545;
$$TMP545=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP545;
}
));
return $$TMP544;
}
)(this);
return $$TMP543;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP547;
$$TMP547=$$root["="]($$root["geti-safe"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP547;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP548;
   var $$TMP549;
if($$root["is-vararg?"](sym)){
$$TMP549=$$root["call-method-by-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP549=$$root["geti-safe"](sym,(new $$root.Symbol("name")));
}
$$TMP548=$$TMP549;
return $$TMP548;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP550;
$$TMP550=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP551;
$$TMP551=$$root["mangle-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))));
return $$TMP551;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP550;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP552;
   $$TMP552=(function(self){
      var $$TMP553;
      var $$TMP554;
if($$root["not"]($$root["null?"](args))){
   var $$TMP555;
   {
$$TMP555=$$root["last"](args);
}
$$TMP554=$$TMP555;
}
else{
   $$TMP554=undefined;
}
$$TMP553=(function(last__MINUSarg){
   var $$TMP556;
   var $$TMP557;
   var $$TMP558;
   if(last__MINUSarg){
      var $$TMP559;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP559=true;
}
else{
   $$TMP559=false;
}
$$TMP558=$$TMP559;
}
else{
   $$TMP558=false;
}
if($$TMP558){
$$TMP557=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti-safe"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP557="";
}
$$TMP556=$$TMP557;
return $$TMP556;
}
)($$TMP554);
return $$TMP553;
}
)(this);
return $$TMP552;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP560;
   $$TMP560=(function(self){
      var $$TMP561;
      $$TMP561=(function(__GS52){
         var $$TMP562;
         $$TMP562=(function(__GS53){
            var $$TMP563;
            $$TMP563=(function(args,body){
               var $$TMP564;
               $$TMP564=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP566;
                  $$TMP566=(function(compiled__MINUSbody){
                     var $$TMP567;
$$TMP567=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP567;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP566;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP565;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP565=accum;
return $$TMP565;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP564;
}
)($$root["drop"](0,__GS53),$$root["drop"](2,__GS52));
return $$TMP563;
}
)($$root["nth"](1,__GS52));
return $$TMP562;
}
)(lst);
return $$TMP561;
}
)(this);
return $$TMP560;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP568;
   $$TMP568=(function(self){
      var $$TMP569;
      $$TMP569=(function(__GS54){
         var $$TMP570;
         $$TMP570=(function(body){
            var $$TMP571;
            $$TMP571=(function(value__MINUSvar__MINUSname){
               var $$TMP572;
               $$TMP572=(function(compiled__MINUSbody){
                  var $$TMP573;
$$TMP573=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP573;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP572;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP571;
}
)($$root["drop"](1,__GS54));
return $$TMP570;
}
)(lst);
return $$TMP569;
}
)(this);
return $$TMP568;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP574;
   $$TMP574=(function(self){
      var $$TMP575;
$$TMP575=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP575;
}
)(this);
return $$TMP574;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP576;
   $$TMP576=(function(self){
      var $$TMP577;
      $$TMP577=(function(__GS55){
         var $$TMP578;
         $$TMP578=(function(body){
            var $$TMP579;
            $$TMP579=(function(value__MINUSvar__MINUSname){
               var $$TMP580;
               $$TMP580=(function(compiled__MINUSbody){
                  var $$TMP581;
$$TMP581=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP581;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP580;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP579;
}
)($$root["drop"](1,__GS55));
return $$TMP578;
}
)(lst);
return $$TMP577;
}
)(this);
return $$TMP576;
}
));
$$root["compile"]=(function(expr){
   var $$TMP582;
   $$TMP582=(function(c){
      var $$TMP583;
      $$TMP583=(function(t){
         var $$TMP584;
$$TMP584=$$root["str"]($$root["geti-safe"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti-safe"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP584;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP583;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP582;
}
);
$$root["compile"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP585;
   $$TMP585=(function(self){
      var $$TMP586;
      $$TMP586=(function(__GS56){
         var $$TMP587;
         $$TMP587=(function(c,t,f){
            var $$TMP588;
            $$TMP588=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP589;
$$TMP589=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP589;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP588;
}
)($$root["nth"](1,__GS56),$$root["nth"](2,__GS56),$$root["nth"](3,__GS56));
return $$TMP587;
}
)(lst);
return $$TMP586;
}
)(this);
return $$TMP585;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP590;
   $$TMP590=(function(self){
      var $$TMP591;
      var $$TMP592;
if($$root["symbol?"](x)){
$$TMP592=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti-safe"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP592=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP591=$$TMP592;
return $$TMP591;
}
)(this);
return $$TMP590;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP593;
   $$TMP593=(function(self){
      var $$TMP594;
$$TMP594=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP594;
}
)(this);
return $$TMP593;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP595;
   $$TMP595=(function(self){
      var $$TMP596;
      var $$TMP597;
if($$root["atom?"](x)){
$$TMP597=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP597=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP596=$$TMP597;
return $$TMP596;
}
)(this);
return $$TMP595;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP598;
   $$TMP598=(function(self){
      var $$TMP599;
      $$TMP599=(function(__GS57){
         var $$TMP600;
         $$TMP600=(function(name,value){
            var $$TMP601;
            $$TMP601=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP602;
$$TMP602=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP602;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP601;
}
)($$root["nth"](1,__GS57),$$root["nth"](2,__GS57));
return $$TMP600;
}
)(lst);
return $$TMP599;
}
)(this);
return $$TMP598;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP603;
   $$TMP603=(function(self){
      var $$TMP604;
      $$TMP604=(function(__GS58){
         var $$TMP605;
         $$TMP605=(function(name,args){
            var $$TMP606;
            $$TMP606=(function(tmp){
               var $$TMP608;
$$TMP608=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["geti-safe"]($$root["second"](tmp),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](tmp),(new $$root.Symbol("data")))));
return $$TMP608;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP607;
$$TMP607=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP607;
}
),args))));
return $$TMP606;
}
)($$root["nth"](0,__GS58),$$root["drop"](1,__GS58));
return $$TMP605;
}
)(expr);
return $$TMP604;
}
)(this);
return $$TMP603;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP609;
   $$TMP609=(function(self){
      var $$TMP610;
      var $$TMP611;
if($$root["in?"](name,$$root["geti-safe"](self,(new $$root.Symbol("root"))))){
   var $$TMP612;
if($$root["geti"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP612=true;
}
else{
   $$TMP612=false;
}
$$TMP611=$$TMP612;
}
else{
   $$TMP611=false;
}
$$TMP610=$$TMP611;
return $$TMP610;
}
)(this);
return $$TMP609;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP613;
   $$TMP613=(function(self){
      var $$TMP614;
      var $$TMP615;
      var $$TMP616;
if($$root["list?"](expr)){
   var $$TMP617;
if($$root["not"]($$root["null?"](expr))){
   $$TMP617=true;
}
else{
   $$TMP617=false;
}
$$TMP616=$$TMP617;
}
else{
   $$TMP616=false;
}
if($$TMP616){
   $$TMP615=(function(first){
      var $$TMP618;
      var $$TMP619;
if($$root["symbol?"](first)){
   $$TMP619=(function(__GS59){
      var $$TMP620;
      var $$TMP621;
if($$root["equal?"](__GS59,(new $$root.Symbol("lambda")))){
$$TMP621=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP622;
if($$root["equal?"](__GS59,(new $$root.Symbol("progn")))){
$$TMP622=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP623;
if($$root["equal?"](__GS59,(new $$root.Symbol("dumb-loop")))){
$$TMP623=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP624;
if($$root["equal?"](__GS59,(new $$root.Symbol("continue")))){
$$TMP624=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP625;
if($$root["equal?"](__GS59,(new $$root.Symbol("new")))){
$$TMP625=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP626;
if($$root["equal?"](__GS59,(new $$root.Symbol("if")))){
$$TMP626=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP627;
if($$root["equal?"](__GS59,(new $$root.Symbol("quote")))){
$$TMP627=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP628;
if($$root["equal?"](__GS59,(new $$root.Symbol("setv!")))){
$$TMP628=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP629;
if($$root["equal?"](__GS59,(new $$root.Symbol("def")))){
$$TMP629=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP630;
   if(true){
      var $$TMP631;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti-safe"](first,(new $$root.Symbol("name"))))){
$$TMP631=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP632;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP632=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP633;
   if(true){
$$TMP633=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP633=undefined;
}
$$TMP632=$$TMP633;
}
$$TMP631=$$TMP632;
}
$$TMP630=$$TMP631;
}
else{
   $$TMP630=undefined;
}
$$TMP629=$$TMP630;
}
$$TMP628=$$TMP629;
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
return $$TMP620;
}
)(first);
}
else{
$$TMP619=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP618=$$TMP619;
return $$TMP618;
}
)($$root["car"](expr));
}
else{
$$TMP615=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP614=$$TMP615;
return $$TMP614;
}
)(this);
return $$TMP613;
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
   var $$TMP634;
$$TMP634=$$root["str"]($$root["geti-safe"]($$root["second"](pair),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](pair),(new $$root.Symbol("data"))));
return $$TMP634;
}
);
$$root["gen-jstr"];
$$root["default-lexenv"]=(function(){
   var $$TMP635;
   $$TMP635=(function(__GS60){
      var $$TMP636;
$$root["seti!"](__GS60,"this",true);
$$TMP636=__GS60;
return $$TMP636;
}
)($$root["object"]());
return $$TMP635;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP637;
   $$TMP637=(function(self){
      var $$TMP638;
      $$TMP638=(function(root,sandbox){
         var $$TMP639;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP640;
$$TMP640=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP640;
}
));
$$root["seti!"](root,"load-file",(function(path){
   var $$TMP641;
$$TMP641=$$root["call-method-by-name"](self,(new $$root.Symbol("load-file")),path);
return $$TMP641;
}
));
$$TMP639=(function(__GS61){
   var $$TMP642;
$$root["seti!"](__GS61,"root",root);
$$root["seti!"](__GS61,"dir-stack",$$root["list"](($$root["process"]).cwd()));
$$root["seti!"](__GS61,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP642=__GS61;
return $$TMP642;
}
)(self);
return $$TMP639;
}
)($$root["make-default-ns"](),$$root["object"]());
return $$TMP638;
}
)(this);
return $$TMP637;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP643;
   $$TMP643=(function(self){
      var $$TMP644;
      $$TMP644=(function(tmp){
         var $$TMP645;
$$TMP645=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
return $$TMP645;
}
)($$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP644;
}
)(this);
return $$TMP643;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP646;
   $$TMP646=(function(self){
      var $$TMP647;
      $$TMP647=(function(forms){
         var $$TMP648;
         $$TMP648=(function(__GS62,__GS63,form){
            var $$TMP649;
            $$TMP649=(function(__GS64,__GS65){
               var $$TMP650;
               $$TMP650=(function(recur){
                  var $$TMP652;
                  var $$TMP653;
                  while(true){
                     __GS64=true;
                     __GS64;
                     var $$TMP654;
                     var $$TMP655;
if($$root["not"]($$root["null?"](__GS63))){
   $$TMP655=true;
}
else{
   $$TMP655=false;
}
if($$TMP655){
   var $$TMP656;
   {
form=$$root["car"](__GS63);
form;
__GS62=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS62;
__GS63=$$root["cdr"](__GS63);
__GS63;
$$TMP656=recur();
}
$$TMP654=$$TMP656;
}
else{
   var $$TMP657;
   {
      $$TMP657=__GS62;
   }
   $$TMP654=$$TMP657;
}
__GS65=$$TMP654;
__GS65;
var $$TMP658;
if($$root["not"](__GS64)){
   continue;
   $$TMP658=undefined;
}
else{
   $$TMP658=__GS65;
}
$$TMP653=$$TMP658;
break;
}
$$TMP652=$$TMP653;
return $$TMP652;
}
)((function(){
   var $$TMP651;
   __GS64=false;
   $$TMP651=__GS64;
   return $$TMP651;
}
));
return $$TMP650;
}
)(false,undefined);
return $$TMP649;
}
)(undefined,forms,[]);
return $$TMP648;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP647;
}
)(this);
return $$TMP646;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("load-file")),(function(path){
   var $$TMP659;
   $$TMP659=(function(self){
      var $$TMP660;
      $$TMP660=undefined;
      return $$TMP660;
   }
   )(this);
   return $$TMP659;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP661;
   $$TMP661=(function(self){
      var $$TMP662;
$$TMP662=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["gen-jstr"](compilation__MINUSresult));
return $$TMP662;
}
)(this);
return $$TMP661;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP663;
   $$TMP663=(function(self){
      var $$TMP664;
      $$TMP664=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP665;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP666;
   $$TMP666=(function(r){
      var $$TMP667;
      var $$TMP668;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   var $$TMP669;
   {
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti-safe"](r,(new $$root.Symbol("code"))));
r;
$$TMP669=$$root["seti!"](target,name,r);
}
$$TMP668=$$TMP669;
}
else{
   $$TMP668=undefined;
}
$$TMP668;
$$TMP667=r;
return $$TMP667;
}
)($$root["geti"](target,name));
return $$TMP666;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP670;
$$TMP670=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP670;
}
));
$$root["seti!"](root,"*ns*",$$root["geti-safe"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP671;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP671=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP671;
}
));
$$TMP665=$$root["call-method"]($$root["geti-safe"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP665;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP664;
}
)(this);
return $$TMP663;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP672;
   $$TMP672=(function(self){
      var $$TMP673;
      $$TMP673=(function(lexenv){
         var $$TMP674;
         $$TMP674=(function(__GS66){
            var $$TMP675;
            var $$TMP676;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("def"))),(new $$root.Symbol("name")),(new $$root.Symbol("val"))))){
   $$TMP676=(function(__GS67){
      var $$TMP677;
      $$TMP677=(function(name,val){
         var $$TMP678;
         $$TMP678=(function(tmp){
            var $$TMP679;
$$root["seti!"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP679=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP679;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP678;
}
)($$root["nth"](1,__GS67),$$root["nth"](2,__GS67));
return $$TMP677;
}
)(__GS66);
}
else{
   var $$TMP680;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("setmac!"))),(new $$root.Symbol("name"))))){
   $$TMP680=(function(__GS68){
      var $$TMP681;
      $$TMP681=(function(name){
         var $$TMP682;
         $$TMP682=(function(tmp){
            var $$TMP683;
$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
$$TMP683=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP683;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP682;
}
)($$root["nth"](1,__GS68));
return $$TMP681;
}
)(__GS66);
}
else{
   var $$TMP684;
if($$root["matches?"](__GS66,$$root.list($$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("lambda"))),$$root.list((new $$root.Symbol("&args"))),(new $$root.Symbol("&body")))))){
   $$TMP684=(function(__GS69){
      var $$TMP685;
      $$TMP685=(function(__GS70){
         var $$TMP686;
         $$TMP686=(function(__GS71){
            var $$TMP687;
            $$TMP687=(function(args,body){
               var $$TMP688;
$$TMP688=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP688;
}
)($$root["drop"](0,__GS71),$$root["drop"](2,__GS70));
return $$TMP687;
}
)($$root["nth"](1,__GS70));
return $$TMP686;
}
)($$root["nth"](0,__GS69));
return $$TMP685;
}
)(__GS66);
}
else{
   var $$TMP689;
if($$root["matches?"](__GS66,$$root.list((new $$root.Symbol("name")),(new $$root.Symbol("&args"))))){
   $$TMP689=(function(__GS72){
      var $$TMP690;
      $$TMP690=(function(name,args){
         var $$TMP691;
         var $$TMP692;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP692=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP692=(function(tmp){
      var $$TMP693;
$$TMP693=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP693;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP691=$$TMP692;
return $$TMP691;
}
)($$root["nth"](0,__GS72),$$root["drop"](1,__GS72));
return $$TMP690;
}
)(__GS66);
}
else{
   var $$TMP694;
if($$root["matches?"](__GS66,(new $$root.Symbol("any")))){
   $$TMP694=(function(any){
      var $$TMP695;
      $$TMP695=(function(tmp){
         var $$TMP696;
$$TMP696=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP696;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP695;
}
)(__GS66);
}
else{
   var $$TMP697;
   if(true){
$$TMP697=$$root["error"]("Fell out of case!");
}
else{
   $$TMP697=undefined;
}
$$TMP694=$$TMP697;
}
$$TMP689=$$TMP694;
}
$$TMP684=$$TMP689;
}
$$TMP680=$$TMP684;
}
$$TMP676=$$TMP680;
}
$$TMP675=$$TMP676;
return $$TMP675;
}
)(e);
return $$TMP674;
}
)($$root["default-lexenv"]());
return $$TMP673;
}
)(this);
return $$TMP672;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP698;
   $$TMP698=(function(self){
      var $$TMP699;
$$TMP699=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP699;
}
)(this);
return $$TMP698;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
