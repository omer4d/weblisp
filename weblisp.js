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
   for(var $$TMP92=1;
   $$TMP92<arguments.length;
   ++$$TMP92){
      body[$$TMP92-1]=arguments[$$TMP92];
   }
   var $$TMP91;
$$TMP91=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP91;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP93;
   var $$TMP94;
if($$root["null?"](lst)){
   $$TMP94=[];
}
else{
$$TMP94=$$root["reverse"]((function(recur){
   var $$TMP95;
   recur=(function(accum,part,rem,counter){
      var $$TMP96;
      var $$TMP97;
if($$root["null?"](rem)){
$$TMP97=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP98;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP98=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP98=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP97=$$TMP98;
}
$$TMP96=$$TMP97;
return $$TMP96;
}
);
recur;
$$TMP95=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP95;
}
)([]));
}
$$TMP93=$$TMP94;
return $$TMP93;
}
);
$$root["partition"];
$$root["method"]=(function(args){
   var body=Array(arguments.length-1);
   for(var $$TMP100=1;
   $$TMP100<arguments.length;
   ++$$TMP100){
      body[$$TMP100-1]=arguments[$$TMP100];
   }
   var $$TMP99;
$$TMP99=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP99;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP102=3;
   $$TMP102<arguments.length;
   ++$$TMP102){
      body[$$TMP102-3]=arguments[$$TMP102];
   }
   var $$TMP101;
$$TMP101=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP101;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP105=1;
   $$TMP105<arguments.length;
   ++$$TMP105){
      args[$$TMP105-1]=arguments[$$TMP105];
   }
   var $$TMP103;
   $$TMP103=(function(instance){
      var $$TMP104;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP104=instance;
return $$TMP104;
}
)($$root["object"](proto));
return $$TMP103;
}
);
$$root["make-instance"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP107=2;
   $$TMP107<arguments.length;
   ++$$TMP107){
      args[$$TMP107-2]=arguments[$$TMP107];
   }
   var $$TMP106;
$$TMP106=$$root["apply-method"]($$root["geti"](obj,name),obj,args);
return $$TMP106;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP108;
   var $$TMP109;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP109=obj__MINUSname;
}
else{
   var $$TMP110;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP110=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP110=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP109=$$TMP110;
}
$$TMP108=$$TMP109;
return $$TMP108;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP112=1;
   $$TMP112<arguments.length;
   ++$$TMP112){
      fields[$$TMP112-1]=arguments[$$TMP112];
   }
   var $$TMP111;
$$TMP111=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP111;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP113;
   var $$TMP114;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP114=obj__MINUSname;
}
else{
$$TMP114=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP113=$$TMP114;
return $$TMP113;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP116=1;
   $$TMP116<arguments.length;
   ++$$TMP116){
      fields[$$TMP116-1]=arguments[$$TMP116];
   }
   var $$TMP115;
$$TMP115=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP115;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP117;
$$TMP117=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP117;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP118;
   var $$TMP119;
if($$root["null?"](a)){
$$TMP119=$$root["null?"](b);
}
else{
   var $$TMP120;
if($$root["symbol?"](a)){
   var $$TMP121;
if($$root["symbol?"](b)){
   var $$TMP122;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP122=true;
}
else{
   $$TMP122=false;
}
$$TMP121=$$TMP122;
}
else{
   $$TMP121=false;
}
$$TMP120=$$TMP121;
}
else{
   var $$TMP123;
if($$root["atom?"](a)){
$$TMP123=$$root["="](a,b);
}
else{
   var $$TMP124;
if($$root["list?"](a)){
   var $$TMP125;
if($$root["list?"](b)){
   var $$TMP126;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP127;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP127=true;
}
else{
   $$TMP127=false;
}
$$TMP126=$$TMP127;
}
else{
   $$TMP126=false;
}
$$TMP125=$$TMP126;
}
else{
   $$TMP125=false;
}
$$TMP124=$$TMP125;
}
else{
   $$TMP124=undefined;
}
$$TMP123=$$TMP124;
}
$$TMP120=$$TMP123;
}
$$TMP119=$$TMP120;
}
$$TMP118=$$TMP119;
return $$TMP118;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP128;
   $$TMP128=(function(res){
      var $$TMP134;
$$TMP134=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP134;
}
)((function(recur){
   var $$TMP129;
   recur=(function(l1,l2){
      var $$TMP130;
      var $$TMP131;
      if((function(c){
         var $$TMP132;
         var $$TMP133;
         if(c){
            $$TMP133=c;
         }
         else{
$$TMP133=p($$root["car"](l2));
}
$$TMP132=$$TMP133;
return $$TMP132;
}
)($$root["null?"](l2))){
$$TMP131=$$root["list"](l1,l2);
}
else{
$$TMP131=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP130=$$TMP131;
return $$TMP130;
}
);
recur;
$$TMP129=recur([],lst);
return $$TMP129;
}
)([]));
return $$TMP128;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP135;
   var $$TMP136;
if($$root["reduce"]((function(accum,v){
   var $$TMP137;
   var $$TMP138;
   if(accum){
      $$TMP138=accum;
   }
   else{
      $$TMP138=v;
   }
   $$TMP137=$$TMP138;
   return $$TMP137;
}
),lst,false)){
   $$TMP136=true;
}
else{
   $$TMP136=false;
}
$$TMP135=$$TMP136;
return $$TMP135;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP139;
$$TMP139=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP140;
   var $$TMP141;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP142;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP142=true;
}
else{
   $$TMP142=false;
}
$$TMP141=$$TMP142;
}
else{
   $$TMP141=false;
}
$$TMP140=$$TMP141;
return $$TMP140;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP139;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP143;
   $$TMP143=(function(binding__MINUSnames){
      var $$TMP144;
      $$TMP144=(function(divs){
         var $$TMP146;
         var $$TMP147;
if($$root["null?"]($$root["second"](divs))){
$$TMP147=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP147=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP146=$$TMP147;
return $$TMP146;
}
)($$root["split"]((function(pair){
   var $$TMP145;
$$TMP145=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP145;
}
),binding__MINUSpairs));
return $$TMP144;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP143;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP149=1;
   $$TMP149<arguments.length;
   ++$$TMP149){
      body[$$TMP149-1]=arguments[$$TMP149];
   }
   var $$TMP148;
$$TMP148=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP148;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP150;
   $$TMP150=(function(x){
      var $$TMP151;
$$TMP151=$$root["not"](f(x));
return $$TMP151;
}
);
return $$TMP150;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP152;
   $$TMP152=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP154=0;
      $$TMP154<arguments.length;
      ++$$TMP154){
         args[$$TMP154-0]=arguments[$$TMP154];
      }
      var $$TMP153;
$$TMP153=f1($$root["apply"](f2,args));
return $$TMP153;
}
);
return $$TMP152;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP158=1;
   $$TMP158<arguments.length;
   ++$$TMP158){
      args1[$$TMP158-1]=arguments[$$TMP158];
   }
   var $$TMP155;
   $$TMP155=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP157=0;
      $$TMP157<arguments.length;
      ++$$TMP157){
         args2[$$TMP157-0]=arguments[$$TMP157];
      }
      var $$TMP156;
$$TMP156=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP156;
}
);
return $$TMP155;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP162=2;
   $$TMP162<arguments.length;
   ++$$TMP162){
      args1[$$TMP162-2]=arguments[$$TMP162];
   }
   var $$TMP159;
   $$TMP159=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP161=0;
      $$TMP161<arguments.length;
      ++$$TMP161){
         args2[$$TMP161-0]=arguments[$$TMP161];
      }
      var $$TMP160;
$$TMP160=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP160;
}
);
return $$TMP159;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP166=0;
   $$TMP166<arguments.length;
   ++$$TMP166){
      args[$$TMP166-0]=arguments[$$TMP166];
   }
   var $$TMP163;
   $$TMP163=(function(rx){
      var $$TMP164;
$$TMP164=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP165;
$$TMP165=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP165;
}
));
return $$TMP164;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP163;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP173=1;
   $$TMP173<arguments.length;
   ++$$TMP173){
      pairs[$$TMP173-1]=arguments[$$TMP173];
   }
   var $$TMP167;
   $$TMP167=(function(e__MINUSname,def__MINUSidx){
      var $$TMP168;
      var $$TMP169;
if($$root["="](def__MINUSidx,-1)){
$$TMP169=$$root.list((new $$root.Symbol("error")),"Fell out of case!");
}
else{
$$TMP169=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP168=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP170;
$$TMP170=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP171;
$$TMP171=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP171;
}
),$$root["filter"]((function(pair){
   var $$TMP172;
$$TMP172=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP172;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP170;
}
)($$TMP169,$$root["partition"](2,pairs));
return $$TMP168;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP167;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP174;
   $$TMP174=(function(expr__MINUSname){
      var $$TMP175;
$$TMP175=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP176;
   var $$TMP177;
if($$root["symbol?"](v)){
   var $$TMP178;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP178=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP179;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP179=[];
}
else{
$$TMP179=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP178=$$TMP179;
}
$$TMP177=$$TMP178;
}
else{
$$TMP177=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP176=$$TMP177;
return $$TMP176;
}
),structure)));
return $$TMP175;
}
)($$root["gensym"]());
return $$TMP174;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP182=2;
   $$TMP182<arguments.length;
   ++$$TMP182){
      body[$$TMP182-2]=arguments[$$TMP182];
   }
   var $$TMP180;
   var $$TMP181;
if($$root["symbol?"](structure)){
$$TMP181=$$root["list"](structure,expr);
}
else{
$$TMP181=$$root["destruct-helper"](structure,expr);
}
$$TMP180=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP181),body);
return $$TMP180;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP183;
   var $$TMP184;
if($$root["list?"](expr)){
   var $$TMP185;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP185=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP185=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP184=$$TMP185;
}
else{
   $$TMP184=expr;
}
$$TMP183=$$TMP184;
return $$TMP183;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP186;
   var $$TMP187;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP187=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP188;
   var $$TMP189;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP190;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP190=true;
}
else{
   $$TMP190=false;
}
$$TMP189=$$TMP190;
}
else{
   $$TMP189=false;
}
if($$TMP189){
$$TMP188=$$root["list?"](expr);
}
else{
   var $$TMP191;
   if(true){
      var $$TMP192;
      var $$TMP193;
if($$root["list?"](expr)){
   var $$TMP194;
if($$root["not"]($$root["null?"](expr))){
   $$TMP194=true;
}
else{
   $$TMP194=false;
}
$$TMP193=$$TMP194;
}
else{
   $$TMP193=false;
}
if($$TMP193){
   var $$TMP195;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP196;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP196=true;
}
else{
   $$TMP196=false;
}
$$TMP195=$$TMP196;
}
else{
   $$TMP195=false;
}
$$TMP192=$$TMP195;
}
else{
   $$TMP192=false;
}
$$TMP191=$$TMP192;
}
else{
   $$TMP191=undefined;
}
$$TMP188=$$TMP191;
}
$$TMP187=$$TMP188;
}
$$TMP186=$$TMP187;
return $$TMP186;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP197;
   var $$TMP198;
if($$root["null?"](patt)){
$$TMP198=$$root["null?"](expr);
}
else{
   var $$TMP199;
if($$root["list?"](patt)){
$$TMP199=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP200;
if($$root["symbol?"](patt)){
   $$TMP200=true;
}
else{
   var $$TMP201;
   if(true){
$$TMP201=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP201=undefined;
}
$$TMP200=$$TMP201;
}
$$TMP199=$$TMP200;
}
$$TMP198=$$TMP199;
}
$$TMP197=$$TMP198;
return $$TMP197;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP202;
   var $$TMP203;
   var $$TMP204;
if($$root["list?"](patt)){
   var $$TMP205;
if($$root["not"]($$root["null?"](patt))){
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
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP206=(new $$root.Symbol("_"));
}
else{
$$TMP206=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP203=$$TMP206;
}
else{
   $$TMP203=patt;
}
$$TMP202=$$TMP203;
return $$TMP202;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP210=1;
   $$TMP210<arguments.length;
   ++$$TMP210){
      pairs[$$TMP210-1]=arguments[$$TMP210];
   }
   var $$TMP207;
   $$TMP207=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP208;
$$TMP208=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP209;
$$TMP209=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP209;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP208;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP207;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP211;
   $$TMP211=(function(__GS1){
      var $$TMP212;
      var $$TMP213;
if($$root["matches?"](__GS1,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP213=(function(__GS2){
      var $$TMP214;
      $$TMP214=(function(obj,field){
         var $$TMP215;
$$TMP215=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP215;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP214;
}
)(__GS1);
}
else{
   var $$TMP216;
if($$root["matches?"](__GS1,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti-safe"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP216=(function(__GS3){
      var $$TMP217;
      $$TMP217=(function(obj,field){
         var $$TMP218;
$$TMP218=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP218;
}
)($$root["nth"](1,__GS3),$$root["nth"](2,__GS3));
return $$TMP217;
}
)(__GS1);
}
else{
   var $$TMP219;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP219=(function(any){
      var $$TMP220;
      var $$TMP221;
if($$root["symbol?"](any)){
$$TMP221=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP221=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP220=$$TMP221;
return $$TMP220;
}
)(__GS1);
}
else{
   var $$TMP222;
   if(true){
$$TMP222=$$root["error"]("Fell out of case!");
}
else{
   $$TMP222=undefined;
}
$$TMP219=$$TMP222;
}
$$TMP216=$$TMP219;
}
$$TMP213=$$TMP216;
}
$$TMP212=$$TMP213;
return $$TMP212;
}
)($$root["macroexpand"](place));
return $$TMP211;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP223;
   amt=(function(c){
      var $$TMP224;
      var $$TMP225;
      if(c){
         $$TMP225=c;
      }
      else{
         $$TMP225=1;
      }
      $$TMP224=$$TMP225;
      return $$TMP224;
   }
   )(amt);
   amt;
$$TMP223=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP223;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP226;
   amt=(function(c){
      var $$TMP227;
      var $$TMP228;
      if(c){
         $$TMP228=c;
      }
      else{
         $$TMP228=1;
      }
      $$TMP227=$$TMP228;
      return $$TMP227;
   }
   )(amt);
   amt;
$$TMP226=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP226;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP229;
$$TMP229=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP229;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP230;
$$TMP230=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP230;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP231;
$$TMP231=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP231;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP232;
   var $$TMP233;
if($$root["="](pos,0)){
$$TMP233=$$root["cons"](x,lst);
}
else{
   var $$TMP234;
if($$root["null?"](lst)){
   $$TMP234=undefined;
}
else{
$$TMP234=$$root["car"](lst);
}
$$TMP233=$$root["cons"]($$TMP234,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP232=$$TMP233;
return $$TMP232;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP237=1;
   $$TMP237<arguments.length;
   ++$$TMP237){
      forms[$$TMP237-1]=arguments[$$TMP237];
   }
   var $$TMP235;
   var $$TMP236;
if($$root["null?"](forms)){
   $$TMP236=x;
}
else{
$$TMP236=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP235=$$TMP236;
return $$TMP235;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP240=1;
   $$TMP240<arguments.length;
   ++$$TMP240){
      forms[$$TMP240-1]=arguments[$$TMP240];
   }
   var $$TMP238;
   var $$TMP239;
if($$root["null?"](forms)){
   $$TMP239=x;
}
else{
$$TMP239=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP238=$$TMP239;
return $$TMP238;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP246=1;
   $$TMP246<arguments.length;
   ++$$TMP246){
      body[$$TMP246-1]=arguments[$$TMP246];
   }
   var $$TMP241;
   $$TMP241=(function(binding__MINUSname){
      var $$TMP242;
$$TMP242=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP243;
   $$TMP243=(function(__GS4){
      var $$TMP244;
      $$TMP244=(function(f,args){
         var $$TMP245;
$$TMP245=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP245;
}
)($$root["nth"](0,__GS4),$$root["drop"](1,__GS4));
return $$TMP244;
}
)(v);
return $$TMP243;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP242;
}
)($$root["gensym"]());
return $$TMP241;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP252=1;
   $$TMP252<arguments.length;
   ++$$TMP252){
      kvs[$$TMP252-1]=arguments[$$TMP252];
   }
   var $$TMP247;
   $$TMP247=(function(recur){
      var $$TMP248;
      recur=(function(kvs){
         var $$TMP249;
         var $$TMP250;
if($$root["null?"](kvs)){
   $$TMP250=obj;
}
else{
   var $$TMP251;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP251=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP250=$$TMP251;
}
$$TMP249=$$TMP250;
return $$TMP249;
}
);
recur;
$$TMP248=recur(kvs);
return $$TMP248;
}
)([]);
return $$TMP247;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP258=2;
   $$TMP258<arguments.length;
   ++$$TMP258){
      kvs[$$TMP258-2]=arguments[$$TMP258];
   }
   var $$TMP253;
   (function(recur){
      var $$TMP254;
      recur=(function(obj,path,kvs){
         var $$TMP255;
         var $$TMP256;
if($$root["null?"](path)){
$$TMP256=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP257;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP257=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP257=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP256=recur($$TMP257,$$root["cdr"](path),kvs);
}
$$TMP255=$$TMP256;
return $$TMP255;
}
);
recur;
$$TMP254=recur(obj,path,kvs);
return $$TMP254;
}
)([]);
$$TMP253=obj;
return $$TMP253;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP259;
   var $$TMP260;
if($$root["null?"](path)){
   $$TMP260=obj;
}
else{
   $$TMP260=(function(tmp){
      var $$TMP261;
      var $$TMP262;
      if(tmp){
$$TMP262=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP262=undefined;
}
$$TMP261=$$TMP262;
return $$TMP261;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP259=$$TMP260;
return $$TMP259;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP264=1;
   $$TMP264<arguments.length;
   ++$$TMP264){
      path[$$TMP264-1]=arguments[$$TMP264];
   }
   var $$TMP263;
$$TMP263=$$root["deep-geti*"](obj,path);
return $$TMP263;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP265;
$$TMP265=$$root["reduce"]((function(h2,key){
   var $$TMP266;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP266=h2;
return $$TMP266;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP265;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP268=1;
   $$TMP268<arguments.length;
   ++$$TMP268){
      kvs[$$TMP268-1]=arguments[$$TMP268];
   }
   var $$TMP267;
$$TMP267=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP267;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP274=1;
   $$TMP274<arguments.length;
   ++$$TMP274){
      kfs[$$TMP274-1]=arguments[$$TMP274];
   }
   var $$TMP269;
   $$TMP269=(function(recur){
      var $$TMP270;
      recur=(function(kfs){
         var $$TMP271;
         var $$TMP272;
if($$root["null?"](kfs)){
   $$TMP272=h;
}
else{
   $$TMP272=(function(key){
      var $$TMP273;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP273=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP273;
}
)($$root["first"](kfs));
}
$$TMP271=$$TMP272;
return $$TMP271;
}
);
recur;
$$TMP270=recur(kfs);
return $$TMP270;
}
)([]);
return $$TMP269;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP276=1;
   $$TMP276<arguments.length;
   ++$$TMP276){
      kfs[$$TMP276-1]=arguments[$$TMP276];
   }
   var $$TMP275;
$$TMP275=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP275;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP278=1;
   $$TMP278<arguments.length;
   ++$$TMP278){
      body[$$TMP278-1]=arguments[$$TMP278];
   }
   var $$TMP277;
$$TMP277=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP277;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP279;
$$TMP279=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP279;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP280;
   step=(function(c){
      var $$TMP281;
      var $$TMP282;
      if(c){
         $$TMP282=c;
      }
      else{
         $$TMP282=1;
      }
      $$TMP281=$$TMP282;
      return $$TMP281;
   }
   )(step);
   step;
   $$TMP280=(function(data){
      var $$TMP283;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP283=data;
return $$TMP283;
}
)($$root["object"]([]));
return $$TMP280;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP284;
   step=(function(c){
      var $$TMP285;
      var $$TMP286;
      if(c){
         $$TMP286=c;
      }
      else{
         $$TMP286=1;
      }
      $$TMP285=$$TMP286;
      return $$TMP285;
   }
   )(step);
   step;
   $$TMP284=(function(data){
      var $$TMP287;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP287=data;
return $$TMP287;
}
)($$root["object"]([]));
return $$TMP284;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP288;
   $$TMP288=(function(len__MINUSname,data){
      var $$TMP289;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP289=data;
return $$TMP289;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP288;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP290;
   $$TMP290=(function(lst__MINUSname,data){
      var $$TMP291;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP291=data;
return $$TMP291;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP290;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP292;
   $$TMP292=(function(__GS5){
      var $$TMP293;
      $$TMP293=(function(binding__MINUSname,__GS6){
         var $$TMP294;
         $$TMP294=(function(func__MINUSname,args){
            var $$TMP295;
$$TMP295=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP295;
}
)($$root["nth"](0,__GS6),$$root["drop"](1,__GS6));
return $$TMP294;
}
)($$root["nth"](1,__GS5),$$root["nth"](2,__GS5));
return $$TMP293;
}
)(form);
return $$TMP292;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP296;
   $$TMP296=(function(data){
      var $$TMP297;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP297=data;
return $$TMP297;
}
)($$root["object"]([]));
return $$TMP296;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP298;
   $$TMP298=(function(data){
      var $$TMP299;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP299=data;
return $$TMP299;
}
)($$root["object"]([]));
return $$TMP298;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP300;
   $$TMP300=(function(data){
      var $$TMP301;
      (function(__GS7){
         var $$TMP302;
         $$TMP302=(function(binding__MINUSname,body){
            var $$TMP303;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP303=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP303;
}
)($$root["nth"](1,__GS7),$$root["drop"](2,__GS7));
return $$TMP302;
}
)(form);
$$TMP301=data;
return $$TMP301;
}
)($$root["object"]([]));
return $$TMP300;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP304;
   $$TMP304=(function(data){
      var $$TMP305;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP305=data;
return $$TMP305;
}
)($$root["object"]([]));
return $$TMP304;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP306;
   $$TMP306=(function(data,accum__MINUSname){
      var $$TMP307;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP307=data;
return $$TMP307;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP306;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP308;
$$TMP308=$$root["filter"]((function(x){
   var $$TMP309;
$$TMP309=$$root["not="](x,undefined);
return $$TMP309;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP308;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP325=0;
   $$TMP325<arguments.length;
   ++$$TMP325){
      forms[$$TMP325-0]=arguments[$$TMP325];
   }
   var $$TMP310;
   $$TMP310=(function(res__MINUSname){
      var $$TMP311;
      $$TMP311=(function(all){
         var $$TMP321;
         $$TMP321=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP323;
            var $$TMP324;
if($$root["null?"](final__MINUSactions)){
$$TMP324=$$root["list"](res__MINUSname);
}
else{
   $$TMP324=final__MINUSactions;
}
$$TMP323=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP324)))))));
return $$TMP323;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP322;
$$TMP322=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP322;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP321;
}
)($$root["map"]((function(form){
   var $$TMP312;
   $$TMP312=(function(__GS8){
      var $$TMP313;
      var $$TMP314;
if($$root["equal?"](__GS8,(new $$root.Symbol("let")))){
$$TMP314=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP315;
if($$root["equal?"](__GS8,(new $$root.Symbol("for")))){
$$TMP315=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP316;
if($$root["equal?"](__GS8,(new $$root.Symbol("while")))){
$$TMP316=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP317;
if($$root["equal?"](__GS8,(new $$root.Symbol("do")))){
$$TMP317=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP318;
if($$root["equal?"](__GS8,(new $$root.Symbol("collecting")))){
$$TMP318=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP319;
if($$root["equal?"](__GS8,(new $$root.Symbol("finally")))){
$$TMP319=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP320;
   if(true){
$$TMP320=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP320=undefined;
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
)($$root["car"](form));
return $$TMP312;
}
),forms));
return $$TMP311;
}
)($$root["gensym"]());
return $$TMP310;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP330=1;
   $$TMP330<arguments.length;
   ++$$TMP330){
      kvs[$$TMP330-1]=arguments[$$TMP330];
   }
   var $$TMP326;
   $$TMP326=(function(meta){
      var $$TMP327;
      var $$TMP328;
if($$root["not"](meta)){
   var $$TMP329;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP329=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP328=$$TMP329;
}
else{
   $$TMP328=undefined;
}
$$TMP328;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP327=obj;
return $$TMP327;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP326;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP331;
$$TMP331=$$root["print"](($$root["JSON"]).stringify($$root["geti"](x,(new $$root.Symbol("meta")))));
return $$TMP331;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP334=1;
   $$TMP334<arguments.length;
   ++$$TMP334){
      fields[$$TMP334-1]=arguments[$$TMP334];
   }
   var $$TMP332;
$$TMP332=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP333;
$$TMP333=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP333;
}
),fields))));
return $$TMP332;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP335;
   $$TMP335=(s).slice(start,end);
   return $$TMP335;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP336;
$$TMP336=$$root["<"](x,0);
return $$TMP336;
}
);
$$root["neg?"];
$$root["idiv"]=(function(a,b){
   var $$TMP337;
   $$TMP337=(function(t){
      var $$TMP338;
      var $$TMP339;
if($$root["neg?"](t)){
$$TMP339=($$root["Math"]).ceil(t);
}
else{
$$TMP339=($$root["Math"]).floor(t);
}
$$TMP338=$$TMP339;
return $$TMP338;
}
)($$root["/"](a,b));
return $$TMP337;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP340;
   var $$TMP341;
if($$root["string?"](x)){
$$TMP341=$$root["="]($$root["geti"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP342;
if($$root["list?"](x)){
$$TMP342=$$root["null?"](x);
}
else{
   var $$TMP343;
   if(true){
$$TMP343=$$root["error"]("Type error in empty?");
}
else{
   $$TMP343=undefined;
}
$$TMP342=$$TMP343;
}
$$TMP341=$$TMP342;
}
$$TMP340=$$TMP341;
return $$TMP340;
}
);
$$root["empty?"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP344;
   $$TMP344=(function(self){
      var $$TMP345;
      $$TMP345=(function(__GS9){
         var $$TMP346;
$$root["seti!"](__GS9,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS9,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS9,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS9,(new $$root.Symbol("len")),len);
$$TMP346=__GS9;
return $$TMP346;
}
)(self);
return $$TMP345;
}
)(this);
return $$TMP344;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP347;
   $$TMP347=(function(self){
      var $$TMP348;
$$TMP348=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP348;
}
)(this);
return $$TMP347;
}
));
$$root["lit"]=(function(s){
   var $$TMP349;
$$TMP349=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP349;
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
   var $$TMP350;
   $$TMP350=(function(toks,pos,s){
      var $$TMP351;
      (function(recur){
         var $$TMP352;
         recur=(function(){
            var $$TMP353;
            var $$TMP354;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP355;
   {
      (function(__GS10,res,i,__GS11,__GS12,entry,_){
         var $$TMP356;
         $$TMP356=(function(recur){
            var $$TMP357;
            recur=(function(){
               var $$TMP358;
               var $$TMP359;
               var $$TMP360;
if($$root["<"](i,__GS11)){
   var $$TMP361;
if($$root["not"]($$root["null?"](__GS12))){
   var $$TMP362;
if($$root["not"](res)){
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
$$TMP360=$$TMP361;
}
else{
   $$TMP360=false;
}
if($$TMP360){
   var $$TMP363;
   {
entry=$$root["car"](__GS12);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS10=res;
__GS10;
i=$$root["+"](i,1);
i;
__GS12=$$root["cdr"](__GS12);
__GS12;
$$TMP363=recur();
}
$$TMP359=$$TMP363;
}
else{
   var $$TMP364;
   {
      _=__GS10;
      _;
      var $$TMP365;
      if(res){
         var $$TMP366;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP367;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP368;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP369;
   var $$TMP370;
   if(c){
      $$TMP370=c;
   }
   else{
$$TMP370=$$root["second"](entry);
}
$$TMP369=$$TMP370;
return $$TMP369;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP368=toks;
}
$$TMP367=$$TMP368;
}
else{
   $$TMP367=undefined;
}
$$TMP367;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP366=pos;
}
$$TMP365=$$TMP366;
}
else{
$$TMP365=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS10=$$TMP365;
$$TMP364=__GS10;
}
$$TMP359=$$TMP364;
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
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP355=recur();
}
$$TMP354=$$TMP355;
}
else{
   $$TMP354=undefined;
}
$$TMP353=$$TMP354;
return $$TMP353;
}
);
recur;
$$TMP352=recur();
return $$TMP352;
}
)([]);
$$TMP351=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP351;
}
)([],0,src);
return $$TMP350;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP371;
   $$TMP371=(function(self){
      var $$TMP372;
$$TMP372=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP372;
}
)(this);
return $$TMP371;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP373;
   $$TMP373=(function(self){
      var $$TMP374;
$$TMP374=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP374;
}
)(this);
return $$TMP373;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP375;
   $$TMP375=(function(self){
      var $$TMP376;
      $$TMP376=(function(curr){
         var $$TMP377;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP377=curr;
return $$TMP377;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP376;
}
)(this);
return $$TMP375;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP378;
$$TMP378=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP378;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP379;
$$TMP379=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP379;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP380;
   $$TMP380=(function(self){
      var $$TMP381;
      $$TMP381=(function(tok){
         var $$TMP382;
         $$TMP382=(function(__GS13){
            var $$TMP383;
            var $$TMP384;
if($$root["equal?"](__GS13,(new $$root.Symbol("list-open-tok")))){
$$TMP384=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP385;
if($$root["equal?"](__GS13,(new $$root.Symbol("true-tok")))){
   $$TMP385=true;
}
else{
   var $$TMP386;
if($$root["equal?"](__GS13,(new $$root.Symbol("false-tok")))){
   $$TMP386=false;
}
else{
   var $$TMP387;
if($$root["equal?"](__GS13,(new $$root.Symbol("null-tok")))){
   $$TMP387=[];
}
else{
   var $$TMP388;
if($$root["equal?"](__GS13,(new $$root.Symbol("undef-tok")))){
   $$TMP388=undefined;
}
else{
   var $$TMP389;
if($$root["equal?"](__GS13,(new $$root.Symbol("num-tok")))){
$$TMP389=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP390;
if($$root["equal?"](__GS13,(new $$root.Symbol("str-tok")))){
$$TMP390=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP391;
if($$root["equal?"](__GS13,(new $$root.Symbol("quote-tok")))){
$$TMP391=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP392;
if($$root["equal?"](__GS13,(new $$root.Symbol("backquote-tok")))){
$$TMP392=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP393;
if($$root["equal?"](__GS13,(new $$root.Symbol("sym-tok")))){
$$TMP393=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP394;
   if(true){
$$TMP394=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP394=undefined;
}
$$TMP393=$$TMP394;
}
$$TMP392=$$TMP393;
}
$$TMP391=$$TMP392;
}
$$TMP390=$$TMP391;
}
$$TMP389=$$TMP390;
}
$$TMP388=$$TMP389;
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
return $$TMP383;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP382;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP381;
}
)(this);
return $$TMP380;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP395;
   $$TMP395=(function(s){
      var $$TMP396;
$$TMP396=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP396;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP395;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP397;
$$TMP397=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP397;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP398;
   $$TMP398=(function(self){
      var $$TMP399;
      $$TMP399=(function(start__MINUSpos){
         var $$TMP400;
         $$TMP400=(function(__GS14,__GS15,lst){
            var $$TMP401;
            $$TMP401=(function(recur){
               var $$TMP402;
               recur=(function(){
                  var $$TMP403;
                  var $$TMP404;
                  var $$TMP405;
                  var $$TMP406;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP407;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP407=true;
}
else{
   $$TMP407=false;
}
$$TMP406=$$TMP407;
}
else{
   $$TMP406=false;
}
if($$TMP406){
   $$TMP405=true;
}
else{
   $$TMP405=false;
}
if($$TMP405){
   var $$TMP408;
   {
__GS15=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS15);
__GS14=__GS15;
__GS14;
$$TMP408=recur();
}
$$TMP404=$$TMP408;
}
else{
   var $$TMP409;
   {
__GS14=$$root["reverse"](__GS15);
__GS14;
lst=__GS14;
lst;
var $$TMP410;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP410=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP410=$$root["error"]("Unmatched paren!");
}
__GS14=$$TMP410;
$$TMP409=__GS14;
}
$$TMP404=$$TMP409;
}
$$TMP403=$$TMP404;
return $$TMP403;
}
);
recur;
$$TMP402=recur();
return $$TMP402;
}
)([]);
return $$TMP401;
}
)(undefined,[],undefined);
return $$TMP400;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP399;
}
)(this);
return $$TMP398;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP411;
   $$TMP411=(function(self){
      var $$TMP412;
      $$TMP412=(function(__GS16,__GS17,lst){
         var $$TMP413;
         $$TMP413=(function(recur){
            var $$TMP414;
            recur=(function(){
               var $$TMP415;
               var $$TMP416;
               var $$TMP417;
               var $$TMP418;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP419;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP419=true;
}
else{
   $$TMP419=false;
}
$$TMP418=$$TMP419;
}
else{
   $$TMP418=false;
}
if($$TMP418){
   $$TMP417=true;
}
else{
   $$TMP417=false;
}
if($$TMP417){
   var $$TMP420;
   {
__GS17=$$root["cons"]((function(__GS18){
   var $$TMP421;
   var $$TMP422;
if($$root["equal?"](__GS18,(new $$root.Symbol("unquote-tok")))){
   var $$TMP423;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP423=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP422=$$TMP423;
}
else{
   var $$TMP424;
if($$root["equal?"](__GS18,(new $$root.Symbol("splice-tok")))){
   var $$TMP425;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP425=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP424=$$TMP425;
}
else{
   var $$TMP426;
   if(true){
$$TMP426=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP426=undefined;
}
$$TMP424=$$TMP426;
}
$$TMP422=$$TMP424;
}
$$TMP421=$$TMP422;
return $$TMP421;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS17);
__GS16=__GS17;
__GS16;
$$TMP420=recur();
}
$$TMP416=$$TMP420;
}
else{
   var $$TMP427;
   {
__GS16=$$root["reverse"](__GS17);
__GS16;
lst=__GS16;
lst;
var $$TMP428;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP428=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP428=$$root["error"]("Unmatched paren!");
}
__GS16=$$TMP428;
$$TMP427=__GS16;
}
$$TMP416=$$TMP427;
}
$$TMP415=$$TMP416;
return $$TMP415;
}
);
recur;
$$TMP414=recur();
return $$TMP414;
}
)([]);
return $$TMP413;
}
)(undefined,[],undefined);
return $$TMP412;
}
)(this);
return $$TMP411;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP429;
   $$TMP429=(function(self){
      var $$TMP430;
      var $$TMP431;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP432;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP432=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP431=$$TMP432;
}
else{
$$TMP431=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP430=$$TMP431;
return $$TMP430;
}
)(this);
return $$TMP429;
}
));
$$root["parse"]=(function(toks){
   var $$TMP433;
   $$TMP433=(function(p){
      var $$TMP434;
      $$TMP434=(function(__GS19,__GS20){
         var $$TMP435;
         $$TMP435=(function(recur){
            var $$TMP436;
            recur=(function(){
               var $$TMP437;
               var $$TMP438;
               var $$TMP439;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP439=true;
}
else{
   $$TMP439=false;
}
if($$TMP439){
   var $$TMP440;
   {
__GS20=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS20);
__GS19=__GS20;
__GS19;
$$TMP440=recur();
}
$$TMP438=$$TMP440;
}
else{
   var $$TMP441;
   {
__GS19=$$root["reverse"](__GS20);
$$TMP441=__GS19;
}
$$TMP438=$$TMP441;
}
$$TMP437=$$TMP438;
return $$TMP437;
}
);
recur;
$$TMP436=recur();
return $$TMP436;
}
)([]);
return $$TMP435;
}
)(undefined,[]);
return $$TMP434;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP433;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS21){
   var $$TMP442;
$$root["seti!"](__GS21,".","__DOT");
$$root["seti!"](__GS21,"<","__LT");
$$root["seti!"](__GS21,">","__GT");
$$root["seti!"](__GS21,"?","__QM");
$$root["seti!"](__GS21,"+","__PLUS");
$$root["seti!"](__GS21,"-","__MINUS");
$$root["seti!"](__GS21,"=","__EQL");
$$root["seti!"](__GS21,"!","__BANG");
$$root["seti!"](__GS21,"@","__AT");
$$root["seti!"](__GS21,"#","__HASH");
$$root["seti!"](__GS21,"$","__USD");
$$root["seti!"](__GS21,"%","__PCNT");
$$root["seti!"](__GS21,"^","__CARET");
$$root["seti!"](__GS21,"&","__AMP");
$$root["seti!"](__GS21,"*","__STAR");
$$root["seti!"](__GS21,"/","__SLASH");
$$TMP442=__GS21;
return $$TMP442;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP443;
$$TMP443=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP443;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP444;
$$TMP444=$$root["geti"]($$root["mangling-table"],x);
return $$TMP444;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP445;
$$TMP445=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP445;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP446;
   $$TMP446=(function(__GS22){
      var $$TMP447;
$$root["seti!"](__GS22,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS22,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS22,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS22,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP447=__GS22;
return $$TMP447;
}
)($$root["hashmap"]());
return $$TMP446;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP448;
   $$TMP448=(function(__GS23){
      var $$TMP449;
$$root["seti!"](__GS23,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS23,(new $$root.Symbol("mappings")),mappings);
$$TMP449=__GS23;
return $$TMP449;
}
)($$root["hashmap"]());
return $$TMP448;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP450;
$$TMP450=$$root["make-tc-str"](s,[]);
return $$TMP450;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP451;
   $$TMP451=(function(adder){
      var $$TMP453;
$$TMP453=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP453;
}
)((function(x){
   var $$TMP452;
$$TMP452=$$root["+"](x,n);
return $$TMP452;
}
));
return $$TMP451;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP454;
   var $$TMP455;
if($$root["string?"](b)){
$$TMP455=$$root["make-tc-str"]($$root["str"]($$root["geti"](a,(new $$root.Symbol("data"))),b),$$root["geti"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP455=$$root["make-tc-str"]($$root["str"]($$root["geti"](a,(new $$root.Symbol("data"))),$$root["geti"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP456;
$$TMP456=$$root["offset-source-mapping"](e,$$root["geti"]($$root["geti"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP456;
}
),$$root["geti"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP454=$$TMP455;
return $$TMP454;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP458=0;
   $$TMP458<arguments.length;
   ++$$TMP458){
      args[$$TMP458-0]=arguments[$$TMP458];
   }
   var $$TMP457;
$$TMP457=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP457;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP459;
$$TMP459=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP459;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP472=2;
   $$TMP472<arguments.length;
   ++$$TMP472){
      args[$$TMP472-2]=arguments[$$TMP472];
   }
   var $$TMP460;
   $$TMP460=(function(rx){
      var $$TMP461;
      $$TMP461=(function(__GS24,accum,__GS25,x,n,_){
         var $$TMP462;
         $$TMP462=(function(recur){
            var $$TMP463;
            recur=(function(){
               var $$TMP464;
               var $$TMP465;
               var $$TMP466;
if($$root["not"]($$root["null?"](__GS25))){
   $$TMP466=true;
}
else{
   $$TMP466=false;
}
if($$TMP466){
   var $$TMP467;
   {
x=$$root["car"](__GS25);
x;
var $$TMP468;
if($$root["even?"](n)){
   $$TMP468=x;
}
else{
$$TMP468=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP468);
__GS24=accum;
__GS24;
__GS25=$$root["cdr"](__GS25);
__GS25;
n=$$root["+"](n,1);
n;
$$TMP467=recur();
}
$$TMP465=$$TMP467;
}
else{
   var $$TMP469;
   {
      _=__GS24;
      _;
      var $$TMP470;
      if(source__MINUSpos){
         var $$TMP471;
         {
$$TMP471=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti"]($$root["geti"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP470=$$TMP471;
}
else{
   $$TMP470=undefined;
}
$$TMP470;
__GS24=accum;
$$TMP469=__GS24;
}
$$TMP465=$$TMP469;
}
$$TMP464=$$TMP465;
return $$TMP464;
}
);
recur;
$$TMP463=recur();
return $$TMP463;
}
)([]);
return $$TMP462;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP461;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP460;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP473;
   $$TMP473=(function(self){
      var $$TMP474;
      $$TMP474=(function(__GS26){
         var $$TMP475;
$$root["seti!"](__GS26,"root",root);
$$root["seti!"](__GS26,"next-var-suffix",0);
$$TMP475=__GS26;
return $$TMP475;
}
)(self);
return $$TMP474;
}
)(this);
return $$TMP473;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP476;
   $$TMP476=(function(self){
      var $$TMP477;
      $$TMP477=(function(out){
         var $$TMP478;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP478=out;
return $$TMP478;
}
)($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP477;
}
)(this);
return $$TMP476;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP479;
   var $$TMP480;
if($$root["in?"]($$root["geti"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP480=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP480=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP479=$$TMP480;
return $$TMP479;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP481;
   $$TMP481=(function(self){
      var $$TMP482;
      var $$TMP483;
if($$root["="](x,true)){
$$TMP483=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP484;
if($$root["="](x,false)){
$$TMP484=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP485;
if($$root["null?"](x)){
$$TMP485=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP486;
if($$root["="](x,undefined)){
$$TMP486=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP487;
if($$root["symbol?"](x)){
$$TMP487=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP488;
if($$root["string?"](x)){
$$TMP488=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP489;
   if(true){
$$TMP489=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP489=undefined;
}
$$TMP488=$$TMP489;
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
return $$TMP482;
}
)(this);
return $$TMP481;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP490;
   $$TMP490=(function(self){
      var $$TMP491;
      $$TMP491=(function(__GS27){
         var $$TMP492;
         $$TMP492=(function(fun,args){
            var $$TMP493;
            $$TMP493=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP494;
$$TMP494=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP494;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP493;
}
)($$root["nth"](0,__GS27),$$root["drop"](1,__GS27));
return $$TMP492;
}
)(lst);
return $$TMP491;
}
)(this);
return $$TMP490;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP495;
   $$TMP495=(function(self){
      var $$TMP496;
      $$TMP496=(function(__GS28){
         var $$TMP497;
         $$TMP497=(function(fun,args){
            var $$TMP498;
            $$TMP498=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP499;
$$TMP499=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP499;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP498;
}
)($$root["nth"](1,__GS28),$$root["drop"](2,__GS28));
return $$TMP497;
}
)(lst);
return $$TMP496;
}
)(this);
return $$TMP495;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP500;
   $$TMP500=(function(self){
      var $$TMP501;
      $$TMP501=(function(__GS29){
         var $$TMP502;
         $$TMP502=(function(method,obj,args){
            var $$TMP503;
            $$TMP503=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP504;
$$TMP504=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP504;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP503;
}
)($$root["nth"](0,__GS29),$$root["nth"](1,__GS29),$$root["drop"](2,__GS29));
return $$TMP502;
}
)(lst);
return $$TMP501;
}
)(this);
return $$TMP500;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP505;
   $$TMP505=(function(self){
      var $$TMP506;
      $$TMP506=(function(compiled__MINUSbody,reducer){
         var $$TMP508;
$$TMP508=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP508;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP507;
$$TMP507=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP507;
}
));
return $$TMP506;
}
)(this);
return $$TMP505;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP509;
$$TMP509=$$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP509;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP510;
   var $$TMP511;
if($$root["is-vararg?"](sym)){
$$TMP511=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP511=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP510=$$TMP511;
return $$TMP510;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP512;
$$TMP512=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP513;
$$TMP513=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
return $$TMP513;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP512;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP514;
   $$TMP514=(function(self){
      var $$TMP515;
      var $$TMP516;
if($$root["not"]($$root["null?"](args))){
   var $$TMP517;
   {
$$TMP517=$$root["last"](args);
}
$$TMP516=$$TMP517;
}
else{
   $$TMP516=undefined;
}
$$TMP515=(function(last__MINUSarg){
   var $$TMP518;
   var $$TMP519;
   var $$TMP520;
   if(last__MINUSarg){
      var $$TMP521;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP521=true;
}
else{
   $$TMP521=false;
}
$$TMP520=$$TMP521;
}
else{
   $$TMP520=false;
}
if($$TMP520){
$$TMP519=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP519="";
}
$$TMP518=$$TMP519;
return $$TMP518;
}
)($$TMP516);
return $$TMP515;
}
)(this);
return $$TMP514;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP522;
   $$TMP522=(function(self){
      var $$TMP523;
      $$TMP523=(function(__GS30){
         var $$TMP524;
         $$TMP524=(function(__GS31){
            var $$TMP525;
            $$TMP525=(function(args,body){
               var $$TMP526;
               $$TMP526=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP528;
                  $$TMP528=(function(compiled__MINUSbody){
                     var $$TMP529;
$$TMP529=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP529;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP528;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP527;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP527=accum;
return $$TMP527;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP526;
}
)($$root["drop"](0,__GS31),$$root["drop"](2,__GS30));
return $$TMP525;
}
)($$root["nth"](1,__GS30));
return $$TMP524;
}
)(lst);
return $$TMP523;
}
)(this);
return $$TMP522;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP530;
   $$TMP530=(function(self){
      var $$TMP531;
      $$TMP531=(function(__GS32){
         var $$TMP532;
         $$TMP532=(function(body){
            var $$TMP533;
            $$TMP533=(function(value__MINUSvar__MINUSname){
               var $$TMP534;
               $$TMP534=(function(compiled__MINUSbody){
                  var $$TMP535;
$$TMP535=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP535;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP534;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP533;
}
)($$root["drop"](1,__GS32));
return $$TMP532;
}
)(lst);
return $$TMP531;
}
)(this);
return $$TMP530;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP536;
   $$TMP536=(function(self){
      var $$TMP537;
$$TMP537=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP537;
}
)(this);
return $$TMP536;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP538;
   $$TMP538=(function(self){
      var $$TMP539;
      $$TMP539=(function(__GS33){
         var $$TMP540;
         $$TMP540=(function(body){
            var $$TMP541;
            $$TMP541=(function(value__MINUSvar__MINUSname){
               var $$TMP542;
               $$TMP542=(function(compiled__MINUSbody){
                  var $$TMP543;
$$TMP543=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP543;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP542;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP541;
}
)($$root["drop"](1,__GS33));
return $$TMP540;
}
)(lst);
return $$TMP539;
}
)(this);
return $$TMP538;
}
));
$$root["compile"]=(function(expr){
   var $$TMP544;
   $$TMP544=(function(c){
      var $$TMP545;
      $$TMP545=(function(t){
         var $$TMP546;
$$TMP546=$$root["str"]($$root["geti"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP546;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP545;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP544;
}
);
$$root["compile"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP547;
   $$TMP547=(function(self){
      var $$TMP548;
      $$TMP548=(function(__GS34){
         var $$TMP549;
         $$TMP549=(function(c,t,f){
            var $$TMP550;
            $$TMP550=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP551;
$$TMP551=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP551;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP550;
}
)($$root["nth"](1,__GS34),$$root["nth"](2,__GS34),$$root["nth"](3,__GS34));
return $$TMP549;
}
)(lst);
return $$TMP548;
}
)(this);
return $$TMP547;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP552;
   $$TMP552=(function(self){
      var $$TMP553;
      var $$TMP554;
if($$root["symbol?"](x)){
$$TMP554=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP554=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP553=$$TMP554;
return $$TMP553;
}
)(this);
return $$TMP552;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP555;
   $$TMP555=(function(self){
      var $$TMP556;
$$TMP556=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP556;
}
)(this);
return $$TMP555;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP557;
   $$TMP557=(function(self){
      var $$TMP558;
      var $$TMP559;
if($$root["atom?"](x)){
$$TMP559=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP559=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP558=$$TMP559;
return $$TMP558;
}
)(this);
return $$TMP557;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP560;
   $$TMP560=(function(self){
      var $$TMP561;
      $$TMP561=(function(__GS35){
         var $$TMP562;
         $$TMP562=(function(name,value){
            var $$TMP563;
            $$TMP563=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP564;
$$TMP564=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP564;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP563;
}
)($$root["nth"](1,__GS35),$$root["nth"](2,__GS35));
return $$TMP562;
}
)(lst);
return $$TMP561;
}
)(this);
return $$TMP560;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP565;
   $$TMP565=(function(self){
      var $$TMP566;
      $$TMP566=(function(__GS36){
         var $$TMP567;
         $$TMP567=(function(name,args){
            var $$TMP568;
            $$TMP568=(function(tmp){
               var $$TMP570;
$$TMP570=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["geti"]($$root["second"](tmp),(new $$root.Symbol("data"))),$$root["geti"]($$root["first"](tmp),(new $$root.Symbol("data")))));
return $$TMP570;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP569;
$$TMP569=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP569;
}
),args))));
return $$TMP568;
}
)($$root["nth"](0,__GS36),$$root["drop"](1,__GS36));
return $$TMP567;
}
)(expr);
return $$TMP566;
}
)(this);
return $$TMP565;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP571;
   $$TMP571=(function(self){
      var $$TMP572;
      var $$TMP573;
if($$root["in?"](name,$$root["geti"](self,(new $$root.Symbol("root"))))){
   var $$TMP574;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP574=true;
}
else{
   $$TMP574=false;
}
$$TMP573=$$TMP574;
}
else{
   $$TMP573=false;
}
$$TMP572=$$TMP573;
return $$TMP572;
}
)(this);
return $$TMP571;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP575;
   $$TMP575=(function(self){
      var $$TMP576;
      var $$TMP577;
      var $$TMP578;
if($$root["list?"](expr)){
   var $$TMP579;
if($$root["not"]($$root["null?"](expr))){
   $$TMP579=true;
}
else{
   $$TMP579=false;
}
$$TMP578=$$TMP579;
}
else{
   $$TMP578=false;
}
if($$TMP578){
   $$TMP577=(function(first){
      var $$TMP580;
      var $$TMP581;
if($$root["symbol?"](first)){
   $$TMP581=(function(__GS37){
      var $$TMP582;
      var $$TMP583;
if($$root["equal?"](__GS37,(new $$root.Symbol("lambda")))){
$$TMP583=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP584;
if($$root["equal?"](__GS37,(new $$root.Symbol("progn")))){
$$TMP584=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP585;
if($$root["equal?"](__GS37,(new $$root.Symbol("dumb-loop")))){
$$TMP585=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP586;
if($$root["equal?"](__GS37,(new $$root.Symbol("continue")))){
$$TMP586=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP587;
if($$root["equal?"](__GS37,(new $$root.Symbol("new")))){
$$TMP587=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP588;
if($$root["equal?"](__GS37,(new $$root.Symbol("if")))){
$$TMP588=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP589;
if($$root["equal?"](__GS37,(new $$root.Symbol("quote")))){
$$TMP589=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP590;
if($$root["equal?"](__GS37,(new $$root.Symbol("setv!")))){
$$TMP590=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP591;
if($$root["equal?"](__GS37,(new $$root.Symbol("def")))){
$$TMP591=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP592;
   if(true){
      var $$TMP593;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP593=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP594;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP594=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP595;
   if(true){
$$TMP595=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP595=undefined;
}
$$TMP594=$$TMP595;
}
$$TMP593=$$TMP594;
}
$$TMP592=$$TMP593;
}
else{
   $$TMP592=undefined;
}
$$TMP591=$$TMP592;
}
$$TMP590=$$TMP591;
}
$$TMP589=$$TMP590;
}
$$TMP588=$$TMP589;
}
$$TMP587=$$TMP588;
}
$$TMP586=$$TMP587;
}
$$TMP585=$$TMP586;
}
$$TMP584=$$TMP585;
}
$$TMP583=$$TMP584;
}
$$TMP582=$$TMP583;
return $$TMP582;
}
)(first);
}
else{
$$TMP581=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP580=$$TMP581;
return $$TMP580;
}
)($$root["car"](expr));
}
else{
$$TMP577=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP576=$$TMP577;
return $$TMP576;
}
)(this);
return $$TMP575;
}
));
