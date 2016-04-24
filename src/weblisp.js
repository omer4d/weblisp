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
		"sized-array": function(n, v) {
			var arr = new Array(n);
			for(var i = 0; i < n; ++i)
				arr[i] = v;
			return arr;
		},
		"array": function(n, v) {
			var arr = Array(arguments.length);
			for(var i = 0; i < arguments.length; ++i)
				arr[i] = arguments[i];
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
$$TMP0=$$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setmac!"))),$$root["list"](name))));
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
$$root["when-not"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP7=1;
   $$TMP7<arguments.length;
   ++$$TMP7){
      body[$$TMP7-1]=arguments[$$TMP7];
   }
   var $$TMP6;
$$TMP6=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"](undefined),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)));
return $$TMP6;
}
);
$$root["when-not"];
$$root["setmac!"]($$root["when-not"]);
$$root["cond"]=(function(){
   var pairs=Array(arguments.length-0);
   for(var $$TMP10=0;
   $$TMP10<arguments.length;
   ++$$TMP10){
      pairs[$$TMP10-0]=arguments[$$TMP10];
   }
   var $$TMP8;
   var $$TMP9;
if($$root["null?"](pairs)){
   $$TMP9=undefined;
}
else{
$$TMP9=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](pairs)),$$root["list"]($$root["car"]($$root["cdr"](pairs))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["cdr"]($$root["cdr"](pairs)))));
}
$$TMP8=$$TMP9;
return $$TMP8;
}
);
$$root["cond"];
$$root["setmac!"]($$root["cond"]);
$$root["and"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP13=0;
   $$TMP13<arguments.length;
   ++$$TMP13){
      args[$$TMP13-0]=arguments[$$TMP13];
   }
   var $$TMP11;
   var $$TMP12;
if($$root["null?"](args)){
   $$TMP12=true;
}
else{
$$TMP12=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["cdr"](args))),$$root["list"](false));
}
$$TMP11=$$TMP12;
return $$TMP11;
}
);
$$root["and"];
$$root["setmac!"]($$root["and"]);
$$root["or"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP17=0;
   $$TMP17<arguments.length;
   ++$$TMP17){
      args[$$TMP17-0]=arguments[$$TMP17];
   }
   var $$TMP14;
   var $$TMP15;
if($$root["null?"](args)){
   $$TMP15=false;
}
else{
   var $$TMP16;
if($$root["null?"]($$root["cdr"](args))){
$$TMP16=$$root["car"](args);
}
else{
$$TMP16=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP15=$$TMP16;
}
$$TMP14=$$TMP15;
return $$TMP14;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["identity"]=(function(x){
   var $$TMP18;
   $$TMP18=x;
   return $$TMP18;
}
);
$$root["identity"];
$$root["even?"]=(function(x){
   var $$TMP19;
$$TMP19=$$root["="]($$root["mod"](x,2),0);
return $$TMP19;
}
);
$$root["even?"];
$$root["odd?"]=(function(x){
   var $$TMP20;
$$TMP20=$$root["="]($$root["mod"](x,2),1);
return $$TMP20;
}
);
$$root["odd?"];
$$root["macroexpand-1"]=(function(expr){
   var $$TMP21;
   var $$TMP22;
   var $$TMP23;
if($$root["list?"](expr)){
   var $$TMP24;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
   $$TMP24=true;
}
else{
   $$TMP24=false;
}
$$TMP23=$$TMP24;
}
else{
   $$TMP23=false;
}
if($$TMP23){
$$TMP22=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
}
else{
   $$TMP22=expr;
}
$$TMP21=$$TMP22;
return $$TMP21;
}
);
$$root["macroexpand-1"];
$$root["inc"]=(function(x){
   var $$TMP25;
$$TMP25=$$root["+"](x,1);
return $$TMP25;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP26;
$$TMP26=$$root["-"](x,1);
return $$TMP26;
}
);
$$root["dec"];
$$root["incv!"]=(function(name,amt){
   var $$TMP27;
   amt=(function(c){
      var $$TMP28;
      var $$TMP29;
      if(c){
         $$TMP29=c;
      }
      else{
         $$TMP29=1;
      }
      $$TMP28=$$TMP29;
      return $$TMP28;
   }
   )(amt);
   amt;
$$TMP27=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP27;
}
);
$$root["incv!"];
$$root["setmac!"]($$root["incv!"]);
$$root["decv!"]=(function(name,amt){
   var $$TMP30;
   amt=(function(c){
      var $$TMP31;
      var $$TMP32;
      if(c){
         $$TMP32=c;
      }
      else{
         $$TMP32=1;
      }
      $$TMP31=$$TMP32;
      return $$TMP31;
   }
   )(amt);
   amt;
$$TMP30=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP30;
}
);
$$root["decv!"];
$$root["setmac!"]($$root["decv!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP33;
$$TMP33=$$root["car"]($$root["cdr"](lst));
return $$TMP33;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP34;
$$TMP34=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP34;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP35;
$$TMP35=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP35;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP36;
$$TMP36=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP36;
}
);
$$root["fifth"];
$$root["rest"]=$$root["cdr"];
$$root["rest"];
$$root["getter"]=(function(field){
   var $$TMP37;
   $$TMP37=(function(obj){
      var $$TMP38;
$$TMP38=$$root["geti"](obj,field);
return $$TMP38;
}
);
return $$TMP37;
}
);
$$root["getter"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP39;
   var $$TMP40;
   while(true){
      var $$TMP41;
if($$root["null?"](lst)){
   $$TMP41=accum;
}
else{
   var $$TMP42;
   {
accum=r(accum,$$root["car"](lst));
accum;
lst=$$root["cdr"](lst);
lst;
continue;
$$TMP42=undefined;
}
$$TMP41=$$TMP42;
}
$$TMP40=$$TMP41;
break;
}
$$TMP39=$$TMP40;
return $$TMP39;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP43;
$$TMP43=$$root["reduce"]((function(accum,v){
   var $$TMP44;
$$TMP44=$$root["cons"](v,accum);
return $$TMP44;
}
),lst,[]);
return $$TMP43;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP45;
$$TMP45=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP45;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP46;
$$TMP46=$$root["transform-list"]((function(accum,v){
   var $$TMP47;
$$TMP47=$$root["cons"](f(v),accum);
return $$TMP47;
}
),lst);
return $$TMP46;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP48;
$$TMP48=$$root["transform-list"]((function(accum,v){
   var $$TMP49;
   var $$TMP50;
   if(p(v)){
$$TMP50=$$root["cons"](v,accum);
}
else{
   $$TMP50=accum;
}
$$TMP49=$$TMP50;
return $$TMP49;
}
),lst);
return $$TMP48;
}
);
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP51;
$$TMP51=$$root["transform-list"]((function(accum,v){
   var $$TMP52;
n=$$root["-"](n,1);
n;
var $$TMP53;
if($$root[">="](n,0)){
$$TMP53=$$root["cons"](v,accum);
}
else{
   $$TMP53=accum;
}
$$TMP52=$$TMP53;
return $$TMP52;
}
),lst);
return $$TMP51;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP54;
$$TMP54=$$root["transform-list"]((function(accum,v){
   var $$TMP55;
n=$$root["-"](n,1);
n;
var $$TMP56;
if($$root[">="](n,0)){
   $$TMP56=accum;
}
else{
$$TMP56=$$root["cons"](v,accum);
}
$$TMP55=$$TMP56;
return $$TMP55;
}
),lst);
return $$TMP54;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP57;
   $$TMP57=(function(counter){
      var $$TMP58;
$$TMP58=$$root["transform-list"]((function(accum,v){
   var $$TMP59;
   var $$TMP60;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP60=$$root["cons"](v,accum);
}
else{
   $$TMP60=accum;
}
$$TMP59=$$TMP60;
return $$TMP59;
}
),lst);
return $$TMP58;
}
)(-1);
return $$TMP57;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP61;
   var $$TMP62;
if($$root["="](n,0)){
$$TMP62=$$root["car"](lst);
}
else{
$$TMP62=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP61=$$TMP62;
return $$TMP61;
}
);
$$root["nth"];
$$root["butlast"]=(function(n,lst){
   var $$TMP63;
$$TMP63=$$root["take"]($$root["-"]($$root["count"](lst),n),lst);
return $$TMP63;
}
);
$$root["butlast"];
$$root["last"]=(function(lst){
   var $$TMP64;
$$TMP64=$$root["reduce"]((function(accum,v){
   var $$TMP65;
   $$TMP65=v;
   return $$TMP65;
}
),lst,undefined);
return $$TMP64;
}
);
$$root["last"];
$$root["count"]=(function(lst){
   var $$TMP66;
$$TMP66=$$root["reduce"]((function(accum,v){
   var $$TMP67;
$$TMP67=$$root["inc"](accum);
return $$TMP67;
}
),lst,0);
return $$TMP66;
}
);
$$root["count"];
$$root["zip"]=(function(a){
   var more=Array(arguments.length-1);
   for(var $$TMP74=1;
   $$TMP74<arguments.length;
   ++$$TMP74){
      more[$$TMP74-1]=arguments[$$TMP74];
   }
   var $$TMP68;
   $$TMP68=(function(args){
      var $$TMP69;
      var $$TMP70;
if($$root["reduce"]((function(accum,v){
   var $$TMP71;
   $$TMP71=(function(c){
      var $$TMP72;
      var $$TMP73;
      if(c){
         $$TMP73=c;
      }
      else{
$$TMP73=$$root["null?"](v);
}
$$TMP72=$$TMP73;
return $$TMP72;
}
)(accum);
return $$TMP71;
}
),args,false)){
   $$TMP70=[];
}
else{
$$TMP70=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP69=$$TMP70;
return $$TMP69;
}
)($$root["cons"](a,more));
return $$TMP68;
}
);
$$root["zip"];
$$root["interleave"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP77=0;
   $$TMP77<arguments.length;
   ++$$TMP77){
      args[$$TMP77-0]=arguments[$$TMP77];
   }
   var $$TMP75;
   var $$TMP76;
if($$root["null?"](args)){
   $$TMP76=[];
}
else{
$$TMP76=$$root["apply"]($$root["concat"],$$root["apply"]($$root["zip"],args));
}
$$TMP75=$$TMP76;
return $$TMP75;
}
);
$$root["interleave"];
$$root["let"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP79=1;
   $$TMP79<arguments.length;
   ++$$TMP79){
      body[$$TMP79-1]=arguments[$$TMP79];
   }
   var $$TMP78;
$$TMP78=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP78;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP80;
   $$TMP80=(function(fst){
      var $$TMP81;
$$TMP81=$$root["transform-list"]((function(accum,v){
   var $$TMP82;
   var $$TMP83;
   if(fst){
      var $$TMP84;
      {
         fst=false;
         fst;
$$TMP84=$$root["cons"](v,accum);
}
$$TMP83=$$TMP84;
}
else{
$$TMP83=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP82=$$TMP83;
return $$TMP82;
}
),lst);
return $$TMP81;
}
)(true);
return $$TMP80;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP85;
$$TMP85=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP85;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP86;
   $$TMP86=(function(idx){
      var $$TMP87;
$$TMP87=$$root["reduce"]((function(accum,v){
   var $$TMP88;
idx=$$root["+"](idx,1);
idx;
var $$TMP89;
if(f(arg,v)){
   $$TMP89=idx;
}
else{
   $$TMP89=accum;
}
$$TMP88=$$TMP89;
return $$TMP88;
}
),lst,-1);
return $$TMP87;
}
)(-1);
return $$TMP86;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP90;
   var $$TMP91;
if($$root["atom?"](x)){
$$TMP91=$$root["list"](x);
}
else{
$$TMP91=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP90=$$TMP91;
return $$TMP90;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP92;
   $$TMP92=(function(idx){
      var $$TMP93;
$$TMP93=$$root["transform-list"]((function(accum,v){
   var $$TMP94;
idx=$$root["+"](idx,1);
$$TMP94=$$root["cons"](f(v,idx),accum);
return $$TMP94;
}
),lst);
return $$TMP93;
}
)(-1);
return $$TMP92;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP99=1;
   $$TMP99<arguments.length;
   ++$$TMP99){
      body[$$TMP99-1]=arguments[$$TMP99];
   }
   var $$TMP95;
   $$TMP95=(function(binding__MINUSnames,tmp__MINUSbinding__MINUSnames,done__MINUSflag__MINUSsym,res__MINUSsym){
      var $$TMP97;
$$TMP97=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false),$$root["list"](res__MINUSsym),$$root["list"](undefined),bindings)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](tmp__MINUSbinding__MINUSnames),$$root["map"]((function(s){
   var $$TMP98;
$$TMP98=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](s),$$root["list"]($$root["symbol"]($$root["str"]("_",$$root["geti"](s,(new $$root.Symbol("name")))))));
return $$TMP98;
}
),binding__MINUSnames),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("dumb-loop"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](true))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](res__MINUSsym),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"](done__MINUSflag__MINUSsym))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("continue"))))),$$root["list"](res__MINUSsym))))))));
return $$TMP97;
}
)($$root["every-nth"](2,bindings),$$root["map"]((function(s){
   var $$TMP96;
$$TMP96=$$root["symbol"]($$root["str"]("_",$$root["geti"](s,(new $$root.Symbol("name")))));
return $$TMP96;
}
),$$root["every-nth"](2,bindings)),$$root["gensym"](),$$root["gensym"]());
return $$TMP95;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP100;
   var $$TMP101;
if($$root["null?"](lst)){
   $$TMP101=[];
}
else{
$$TMP101=$$root["reverse"]((function(__GS1,__GS2,accum,part,rem,counter){
   var $$TMP102;
   $$TMP102=(function(recur){
      var $$TMP104;
      var $$TMP105;
      while(true){
         __GS1=true;
         __GS1;
         var $$TMP106;
         {
            var $$TMP107;
if($$root["null?"](rem)){
$$TMP107=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP108;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP108=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP108=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP107=$$TMP108;
}
$$TMP106=$$TMP107;
}
__GS2=$$TMP106;
__GS2;
var $$TMP109;
if($$root["not"](__GS1)){
   continue;
   $$TMP109=undefined;
}
else{
   $$TMP109=__GS2;
}
$$TMP105=$$TMP109;
break;
}
$$TMP104=$$TMP105;
return $$TMP104;
}
)((function(_accum,_part,_rem,_counter){
   var $$TMP103;
   accum=_accum;
   accum;
   part=_part;
   part;
   rem=_rem;
   rem;
   counter=_counter;
   counter;
   __GS1=false;
   $$TMP103=__GS1;
   return $$TMP103;
}
));
return $$TMP102;
}
)(false,undefined,[],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1));
}
$$TMP100=$$TMP101;
return $$TMP100;
}
);
$$root["partition"];
$$root["method"]=(function(args){
   var body=Array(arguments.length-1);
   for(var $$TMP111=1;
   $$TMP111<arguments.length;
   ++$$TMP111){
      body[$$TMP111-1]=arguments[$$TMP111];
   }
   var $$TMP110;
$$TMP110=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP110;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP113=3;
   $$TMP113<arguments.length;
   ++$$TMP113){
      body[$$TMP113-3]=arguments[$$TMP113];
   }
   var $$TMP112;
$$TMP112=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP112;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP116=1;
   $$TMP116<arguments.length;
   ++$$TMP116){
      args[$$TMP116-1]=arguments[$$TMP116];
   }
   var $$TMP114;
   $$TMP114=(function(instance){
      var $$TMP115;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP115=instance;
return $$TMP115;
}
)($$root["object"](proto));
return $$TMP114;
}
);
$$root["make-instance"];
$$root["geti-safe"]=(function(obj,name){
   var $$TMP117;
   var $$TMP118;
if($$root["in?"](name,obj)){
$$TMP118=$$root["geti"](obj,name);
}
else{
$$TMP118=$$root["error"]($$root["str"]("Property '",name,"' does not exist in ",obj));
}
$$TMP117=$$TMP118;
return $$TMP117;
}
);
$$root["geti-safe"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP120=2;
   $$TMP120<arguments.length;
   ++$$TMP120){
      args[$$TMP120-2]=arguments[$$TMP120];
   }
   var $$TMP119;
$$TMP119=$$root["apply-method"]($$root["geti-safe"](obj,name),obj,args);
return $$TMP119;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP121;
   var $$TMP122;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP122=obj__MINUSname;
}
else{
   var $$TMP123;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP123=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP123=$$root["concat"]($$root["list"]((new $$root.Symbol("geti-safe"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP122=$$TMP123;
}
$$TMP121=$$TMP122;
return $$TMP121;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP125=1;
   $$TMP125<arguments.length;
   ++$$TMP125){
      fields[$$TMP125-1]=arguments[$$TMP125];
   }
   var $$TMP124;
$$TMP124=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP124;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP126;
   var $$TMP127;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP127=obj__MINUSname;
}
else{
$$TMP127=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP126=$$TMP127;
return $$TMP126;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP129=1;
   $$TMP129<arguments.length;
   ++$$TMP129){
      fields[$$TMP129-1]=arguments[$$TMP129];
   }
   var $$TMP128;
$$TMP128=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP128;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP130;
$$TMP130=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP130;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP131;
   var $$TMP132;
if($$root["null?"](a)){
$$TMP132=$$root["null?"](b);
}
else{
   var $$TMP133;
if($$root["symbol?"](a)){
   var $$TMP134;
if($$root["symbol?"](b)){
   var $$TMP135;
if($$root["="]($$root["geti-safe"](a,(new $$root.Symbol("name"))),$$root["geti-safe"](b,(new $$root.Symbol("name"))))){
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
   var $$TMP136;
if($$root["atom?"](a)){
$$TMP136=$$root["="](a,b);
}
else{
   var $$TMP137;
if($$root["list?"](a)){
   var $$TMP138;
if($$root["list?"](b)){
   var $$TMP139;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP140;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP140=true;
}
else{
   $$TMP140=false;
}
$$TMP139=$$TMP140;
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
}
else{
   $$TMP137=undefined;
}
$$TMP136=$$TMP137;
}
$$TMP133=$$TMP136;
}
$$TMP132=$$TMP133;
}
$$TMP131=$$TMP132;
return $$TMP131;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP141;
   $$TMP141=(function(res){
      var $$TMP151;
$$TMP151=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP151;
}
)((function(__GS3,__GS4,l1,l2){
   var $$TMP142;
   $$TMP142=(function(recur){
      var $$TMP144;
      var $$TMP145;
      while(true){
         __GS3=true;
         __GS3;
         var $$TMP146;
         {
            var $$TMP147;
            if((function(c){
               var $$TMP148;
               var $$TMP149;
               if(c){
                  $$TMP149=c;
               }
               else{
$$TMP149=p($$root["car"](l2));
}
$$TMP148=$$TMP149;
return $$TMP148;
}
)($$root["null?"](l2))){
$$TMP147=$$root["list"](l1,l2);
}
else{
$$TMP147=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP146=$$TMP147;
}
__GS4=$$TMP146;
__GS4;
var $$TMP150;
if($$root["not"](__GS3)){
   continue;
   $$TMP150=undefined;
}
else{
   $$TMP150=__GS4;
}
$$TMP145=$$TMP150;
break;
}
$$TMP144=$$TMP145;
return $$TMP144;
}
)((function(_l1,_l2){
   var $$TMP143;
   l1=_l1;
   l1;
   l2=_l2;
   l2;
   __GS3=false;
   $$TMP143=__GS3;
   return $$TMP143;
}
));
return $$TMP142;
}
)(false,undefined,[],lst));
return $$TMP141;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP152;
   var $$TMP153;
if($$root["reduce"]((function(accum,v){
   var $$TMP154;
   var $$TMP155;
   if(accum){
      $$TMP155=accum;
   }
   else{
      $$TMP155=v;
   }
   $$TMP154=$$TMP155;
   return $$TMP154;
}
),lst,false)){
   $$TMP153=true;
}
else{
   $$TMP153=false;
}
$$TMP152=$$TMP153;
return $$TMP152;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP156;
$$TMP156=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP157;
   var $$TMP158;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP159;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP159=true;
}
else{
   $$TMP159=false;
}
$$TMP158=$$TMP159;
}
else{
   $$TMP158=false;
}
$$TMP157=$$TMP158;
return $$TMP157;
}
),$$root["filter"]((function(x){
   var $$TMP160;
   var $$TMP161;
if($$root["symbol?"](x)){
   var $$TMP162;
if($$root["not"]($$root["equal?"](x,$$root["first"](pair)))){
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
$$TMP160=$$TMP161;
return $$TMP160;
}
),$$root["flatten"]($$root["second"](pair)))));
return $$TMP156;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP163;
   $$TMP163=(function(binding__MINUSnames){
      var $$TMP164;
      $$TMP164=(function(divs){
         var $$TMP166;
         var $$TMP167;
if($$root["null?"]($$root["second"](divs))){
$$TMP167=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP167=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP166=$$TMP167;
return $$TMP166;
}
)($$root["split"]((function(pair){
   var $$TMP165;
$$TMP165=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP165;
}
),binding__MINUSpairs));
return $$TMP164;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP163;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP169=1;
   $$TMP169<arguments.length;
   ++$$TMP169){
      body[$$TMP169-1]=arguments[$$TMP169];
   }
   var $$TMP168;
$$TMP168=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP168;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP170;
   $$TMP170=(function(x){
      var $$TMP171;
$$TMP171=$$root["not"](f(x));
return $$TMP171;
}
);
return $$TMP170;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP172;
   $$TMP172=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP174=0;
      $$TMP174<arguments.length;
      ++$$TMP174){
         args[$$TMP174-0]=arguments[$$TMP174];
      }
      var $$TMP173;
$$TMP173=f1($$root["apply"](f2,args));
return $$TMP173;
}
);
return $$TMP172;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP178=1;
   $$TMP178<arguments.length;
   ++$$TMP178){
      args1[$$TMP178-1]=arguments[$$TMP178];
   }
   var $$TMP175;
   $$TMP175=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP177=0;
      $$TMP177<arguments.length;
      ++$$TMP177){
         args2[$$TMP177-0]=arguments[$$TMP177];
      }
      var $$TMP176;
$$TMP176=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP176;
}
);
return $$TMP175;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP182=2;
   $$TMP182<arguments.length;
   ++$$TMP182){
      args1[$$TMP182-2]=arguments[$$TMP182];
   }
   var $$TMP179;
   $$TMP179=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP181=0;
      $$TMP181<arguments.length;
      ++$$TMP181){
         args2[$$TMP181-0]=arguments[$$TMP181];
      }
      var $$TMP180;
$$TMP180=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP180;
}
);
return $$TMP179;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP186=0;
   $$TMP186<arguments.length;
   ++$$TMP186){
      args[$$TMP186-0]=arguments[$$TMP186];
   }
   var $$TMP183;
   $$TMP183=(function(rx){
      var $$TMP184;
$$TMP184=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP185;
$$TMP185=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP185;
}
));
return $$TMP184;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP183;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP193=1;
   $$TMP193<arguments.length;
   ++$$TMP193){
      pairs[$$TMP193-1]=arguments[$$TMP193];
   }
   var $$TMP187;
   $$TMP187=(function(e__MINUSname,def__MINUSidx){
      var $$TMP188;
      var $$TMP189;
if($$root["="](def__MINUSidx,-1)){
$$TMP189=$$root.list((new $$root.Symbol("error")),"Fell out of case!");
}
else{
$$TMP189=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP188=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP190;
$$TMP190=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP191;
$$TMP191=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP191;
}
),$$root["filter"]((function(pair){
   var $$TMP192;
$$TMP192=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP192;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP190;
}
)($$TMP189,$$root["partition"](2,pairs));
return $$TMP188;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP187;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP194;
   $$TMP194=(function(expr__MINUSname){
      var $$TMP195;
$$TMP195=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP196;
   var $$TMP197;
if($$root["symbol?"](v)){
   var $$TMP198;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP198=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP199;
if($$root["="]($$root["geti-safe"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP199=[];
}
else{
$$TMP199=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP198=$$TMP199;
}
$$TMP197=$$TMP198;
}
else{
$$TMP197=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP196=$$TMP197;
return $$TMP196;
}
),structure)));
return $$TMP195;
}
)($$root["gensym"]());
return $$TMP194;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP202=2;
   $$TMP202<arguments.length;
   ++$$TMP202){
      body[$$TMP202-2]=arguments[$$TMP202];
   }
   var $$TMP200;
   var $$TMP201;
if($$root["symbol?"](structure)){
$$TMP201=$$root["list"](structure,expr);
}
else{
$$TMP201=$$root["destruct-helper"](structure,expr);
}
$$TMP200=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP201),body);
return $$TMP200;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP203;
   var $$TMP204;
if($$root["list?"](expr)){
   var $$TMP205;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP205=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP205=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP204=$$TMP205;
}
else{
   $$TMP204=expr;
}
$$TMP203=$$TMP204;
return $$TMP203;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP206;
   var $$TMP207;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP207=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP208;
   var $$TMP209;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP210;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP210=true;
}
else{
   $$TMP210=false;
}
$$TMP209=$$TMP210;
}
else{
   $$TMP209=false;
}
if($$TMP209){
$$TMP208=$$root["list?"](expr);
}
else{
   var $$TMP211;
   if(true){
      var $$TMP212;
      var $$TMP213;
if($$root["list?"](expr)){
   var $$TMP214;
if($$root["not"]($$root["null?"](expr))){
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
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP216;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
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
$$TMP212=$$TMP215;
}
else{
   $$TMP212=false;
}
$$TMP211=$$TMP212;
}
else{
   $$TMP211=undefined;
}
$$TMP208=$$TMP211;
}
$$TMP207=$$TMP208;
}
$$TMP206=$$TMP207;
return $$TMP206;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP217;
   var $$TMP218;
if($$root["null?"](patt)){
$$TMP218=$$root["null?"](expr);
}
else{
   var $$TMP219;
if($$root["list?"](patt)){
$$TMP219=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP220;
if($$root["symbol?"](patt)){
   $$TMP220=true;
}
else{
   var $$TMP221;
   if(true){
$$TMP221=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP221=undefined;
}
$$TMP220=$$TMP221;
}
$$TMP219=$$TMP220;
}
$$TMP218=$$TMP219;
}
$$TMP217=$$TMP218;
return $$TMP217;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP222;
   var $$TMP223;
   var $$TMP224;
if($$root["list?"](patt)){
   var $$TMP225;
if($$root["not"]($$root["null?"](patt))){
   $$TMP225=true;
}
else{
   $$TMP225=false;
}
$$TMP224=$$TMP225;
}
else{
   $$TMP224=false;
}
if($$TMP224){
   var $$TMP226;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP226=(new $$root.Symbol("_"));
}
else{
$$TMP226=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP223=$$TMP226;
}
else{
   $$TMP223=patt;
}
$$TMP222=$$TMP223;
return $$TMP222;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP230=1;
   $$TMP230<arguments.length;
   ++$$TMP230){
      pairs[$$TMP230-1]=arguments[$$TMP230];
   }
   var $$TMP227;
   $$TMP227=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP228;
$$TMP228=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP229;
$$TMP229=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP229;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP228;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP227;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP231;
   $$TMP231=(function(__GS5){
      var $$TMP232;
      var $$TMP233;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP233=(function(__GS6){
      var $$TMP234;
      $$TMP234=(function(obj,field){
         var $$TMP235;
$$TMP235=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP235;
}
)($$root["nth"](1,__GS6),$$root["nth"](2,__GS6));
return $$TMP234;
}
)(__GS5);
}
else{
   var $$TMP236;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti-safe"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP236=(function(__GS7){
      var $$TMP237;
      $$TMP237=(function(obj,field){
         var $$TMP238;
$$TMP238=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP238;
}
)($$root["nth"](1,__GS7),$$root["nth"](2,__GS7));
return $$TMP237;
}
)(__GS5);
}
else{
   var $$TMP239;
if($$root["matches?"](__GS5,(new $$root.Symbol("any")))){
   $$TMP239=(function(any){
      var $$TMP240;
      var $$TMP241;
if($$root["symbol?"](any)){
$$TMP241=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP241=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP240=$$TMP241;
return $$TMP240;
}
)(__GS5);
}
else{
   var $$TMP242;
   if(true){
$$TMP242=$$root["error"]("Fell out of case!");
}
else{
   $$TMP242=undefined;
}
$$TMP239=$$TMP242;
}
$$TMP236=$$TMP239;
}
$$TMP233=$$TMP236;
}
$$TMP232=$$TMP233;
return $$TMP232;
}
)($$root["macroexpand"](place));
return $$TMP231;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP243;
   amt=(function(c){
      var $$TMP244;
      var $$TMP245;
      if(c){
         $$TMP245=c;
      }
      else{
         $$TMP245=1;
      }
      $$TMP244=$$TMP245;
      return $$TMP244;
   }
   )(amt);
   amt;
$$TMP243=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP243;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP246;
   amt=(function(c){
      var $$TMP247;
      var $$TMP248;
      if(c){
         $$TMP248=c;
      }
      else{
         $$TMP248=1;
      }
      $$TMP247=$$TMP248;
      return $$TMP247;
   }
   )(amt);
   amt;
$$TMP246=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP246;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["mul!"]=(function(name,amt){
   var $$TMP249;
$$TMP249=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("*"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP249;
}
);
$$root["mul!"];
$$root["setmac!"]($$root["mul!"]);
$$root["div!"]=(function(name,amt){
   var $$TMP250;
$$TMP250=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("/"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP250;
}
);
$$root["div!"];
$$root["setmac!"]($$root["div!"]);
$$root["push"]=(function(x,lst){
   var $$TMP251;
$$TMP251=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP251;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP252;
$$TMP252=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP252;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP253;
$$TMP253=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP253;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP254;
   var $$TMP255;
if($$root["="](pos,0)){
$$TMP255=$$root["cons"](x,lst);
}
else{
   var $$TMP256;
if($$root["null?"](lst)){
   $$TMP256=undefined;
}
else{
$$TMP256=$$root["car"](lst);
}
$$TMP255=$$root["cons"]($$TMP256,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP254=$$TMP255;
return $$TMP254;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP259=1;
   $$TMP259<arguments.length;
   ++$$TMP259){
      forms[$$TMP259-1]=arguments[$$TMP259];
   }
   var $$TMP257;
   var $$TMP258;
if($$root["null?"](forms)){
   $$TMP258=x;
}
else{
$$TMP258=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP257=$$TMP258;
return $$TMP257;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP262=1;
   $$TMP262<arguments.length;
   ++$$TMP262){
      forms[$$TMP262-1]=arguments[$$TMP262];
   }
   var $$TMP260;
   var $$TMP261;
if($$root["null?"](forms)){
   $$TMP261=x;
}
else{
$$TMP261=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP260=$$TMP261;
return $$TMP260;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP268=1;
   $$TMP268<arguments.length;
   ++$$TMP268){
      body[$$TMP268-1]=arguments[$$TMP268];
   }
   var $$TMP263;
   $$TMP263=(function(binding__MINUSname){
      var $$TMP264;
$$TMP264=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP265;
   $$TMP265=(function(__GS8){
      var $$TMP266;
      $$TMP266=(function(f,args){
         var $$TMP267;
$$TMP267=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP267;
}
)($$root["nth"](0,__GS8),$$root["drop"](1,__GS8));
return $$TMP266;
}
)(v);
return $$TMP265;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP264;
}
)($$root["gensym"]());
return $$TMP263;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP278=1;
   $$TMP278<arguments.length;
   ++$$TMP278){
      kvs[$$TMP278-1]=arguments[$$TMP278];
   }
   var $$TMP269;
   $$TMP269=(function(__GS9,__GS10,kvs){
      var $$TMP270;
      $$TMP270=(function(recur){
         var $$TMP272;
         var $$TMP273;
         while(true){
            __GS9=true;
            __GS9;
            var $$TMP274;
            {
               var $$TMP275;
if($$root["null?"](kvs)){
   $$TMP275=obj;
}
else{
   var $$TMP276;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP276=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP275=$$TMP276;
}
$$TMP274=$$TMP275;
}
__GS10=$$TMP274;
__GS10;
var $$TMP277;
if($$root["not"](__GS9)){
   continue;
   $$TMP277=undefined;
}
else{
   $$TMP277=__GS10;
}
$$TMP273=$$TMP277;
break;
}
$$TMP272=$$TMP273;
return $$TMP272;
}
)((function(_kvs){
   var $$TMP271;
   kvs=_kvs;
   kvs;
   __GS9=false;
   $$TMP271=__GS9;
   return $$TMP271;
}
));
return $$TMP270;
}
)(false,undefined,kvs);
return $$TMP269;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP288=2;
   $$TMP288<arguments.length;
   ++$$TMP288){
      kvs[$$TMP288-2]=arguments[$$TMP288];
   }
   var $$TMP279;
   (function(__GS11,__GS12,obj,path,kvs){
      var $$TMP280;
      $$TMP280=(function(recur){
         var $$TMP282;
         var $$TMP283;
         while(true){
            __GS11=true;
            __GS11;
            var $$TMP284;
            {
               var $$TMP285;
if($$root["null?"](path)){
$$TMP285=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP286;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP286=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP286=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP285=recur($$TMP286,$$root["cdr"](path),kvs);
}
$$TMP284=$$TMP285;
}
__GS12=$$TMP284;
__GS12;
var $$TMP287;
if($$root["not"](__GS11)){
   continue;
   $$TMP287=undefined;
}
else{
   $$TMP287=__GS12;
}
$$TMP283=$$TMP287;
break;
}
$$TMP282=$$TMP283;
return $$TMP282;
}
)((function(_obj,_path,_kvs){
   var $$TMP281;
   obj=_obj;
   obj;
   path=_path;
   path;
   kvs=_kvs;
   kvs;
   __GS11=false;
   $$TMP281=__GS11;
   return $$TMP281;
}
));
return $$TMP280;
}
)(false,undefined,obj,path,kvs);
$$TMP279=obj;
return $$TMP279;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP289;
   var $$TMP290;
if($$root["null?"](path)){
   $$TMP290=obj;
}
else{
   $$TMP290=(function(tmp){
      var $$TMP291;
      var $$TMP292;
      if(tmp){
$$TMP292=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP292=undefined;
}
$$TMP291=$$TMP292;
return $$TMP291;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP289=$$TMP290;
return $$TMP289;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP294=1;
   $$TMP294<arguments.length;
   ++$$TMP294){
      path[$$TMP294-1]=arguments[$$TMP294];
   }
   var $$TMP293;
$$TMP293=$$root["deep-geti*"](obj,path);
return $$TMP293;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP295;
$$TMP295=$$root["reduce"]((function(h2,key){
   var $$TMP296;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP296=h2;
return $$TMP296;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP295;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP298=1;
   $$TMP298<arguments.length;
   ++$$TMP298){
      kvs[$$TMP298-1]=arguments[$$TMP298];
   }
   var $$TMP297;
$$TMP297=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP297;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP308=1;
   $$TMP308<arguments.length;
   ++$$TMP308){
      kfs[$$TMP308-1]=arguments[$$TMP308];
   }
   var $$TMP299;
   $$TMP299=(function(__GS13,__GS14,kfs){
      var $$TMP300;
      $$TMP300=(function(recur){
         var $$TMP302;
         var $$TMP303;
         while(true){
            __GS13=true;
            __GS13;
            var $$TMP304;
            {
               var $$TMP305;
if($$root["null?"](kfs)){
   $$TMP305=h;
}
else{
   $$TMP305=(function(key){
      var $$TMP306;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP306=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP306;
}
)($$root["first"](kfs));
}
$$TMP304=$$TMP305;
}
__GS14=$$TMP304;
__GS14;
var $$TMP307;
if($$root["not"](__GS13)){
   continue;
   $$TMP307=undefined;
}
else{
   $$TMP307=__GS14;
}
$$TMP303=$$TMP307;
break;
}
$$TMP302=$$TMP303;
return $$TMP302;
}
)((function(_kfs){
   var $$TMP301;
   kfs=_kfs;
   kfs;
   __GS13=false;
   $$TMP301=__GS13;
   return $$TMP301;
}
));
return $$TMP300;
}
)(false,undefined,kfs);
return $$TMP299;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP310=1;
   $$TMP310<arguments.length;
   ++$$TMP310){
      kfs[$$TMP310-1]=arguments[$$TMP310];
   }
   var $$TMP309;
$$TMP309=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP309;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP312=1;
   $$TMP312<arguments.length;
   ++$$TMP312){
      body[$$TMP312-1]=arguments[$$TMP312];
   }
   var $$TMP311;
$$TMP311=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP311;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP313;
$$TMP313=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP313;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP314;
   step=(function(c){
      var $$TMP315;
      var $$TMP316;
      if(c){
         $$TMP316=c;
      }
      else{
         $$TMP316=1;
      }
      $$TMP315=$$TMP316;
      return $$TMP315;
   }
   )(step);
   step;
   $$TMP314=(function(data){
      var $$TMP317;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
var $$TMP318;
if($$root[">"](step,0)){
$$TMP318=(new $$root.Symbol("<"));
}
else{
$$TMP318=(new $$root.Symbol(">"));
}
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]($$TMP318),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP317=data;
return $$TMP317;
}
)($$root["object"]([]));
return $$TMP314;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP319;
   step=(function(c){
      var $$TMP320;
      var $$TMP321;
      if(c){
         $$TMP321=c;
      }
      else{
         $$TMP321=1;
      }
      $$TMP320=$$TMP321;
      return $$TMP320;
   }
   )(step);
   step;
   $$TMP319=(function(data){
      var $$TMP322;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP322=data;
return $$TMP322;
}
)($$root["object"]([]));
return $$TMP319;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP323;
   $$TMP323=(function(len__MINUSname,data){
      var $$TMP324;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP324=data;
return $$TMP324;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP323;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP325;
   $$TMP325=(function(lst__MINUSname,data){
      var $$TMP326;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP326=data;
return $$TMP326;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP325;
}
);
$$root["in-list"];
$$root["in-array"]=(function(binding__MINUSname,expr){
   var $$TMP327;
   $$TMP327=(function(arr__MINUSname,idx__MINUSname,data){
      var $$TMP328;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](arr__MINUSname,expr,idx__MINUSname,0,binding__MINUSname,undefined));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("@"))),$$root["list"](arr__MINUSname),$$root["list"](idx__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](idx__MINUSname)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](idx__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](arr__MINUSname),$$root["list"]((new $$root.Symbol("length")))))));
$$TMP328=data;
return $$TMP328;
}
)($$root["gensym"](),$$root["gensym"](),$$root["object"]([]));
return $$TMP327;
}
);
$$root["in-array"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP329;
   $$TMP329=(function(__GS15){
      var $$TMP330;
      $$TMP330=(function(binding__MINUSname,__GS16){
         var $$TMP331;
         $$TMP331=(function(func__MINUSname,args){
            var $$TMP332;
$$TMP332=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP332;
}
)($$root["nth"](0,__GS16),$$root["drop"](1,__GS16));
return $$TMP331;
}
)($$root["nth"](1,__GS15),$$root["nth"](2,__GS15));
return $$TMP330;
}
)(form);
return $$TMP329;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP333;
   $$TMP333=(function(data){
      var $$TMP334;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP334=data;
return $$TMP334;
}
)($$root["object"]([]));
return $$TMP333;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP335;
   $$TMP335=(function(data){
      var $$TMP336;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP336=data;
return $$TMP336;
}
)($$root["object"]([]));
return $$TMP335;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP337;
   $$TMP337=(function(data){
      var $$TMP338;
      (function(__GS17){
         var $$TMP339;
         $$TMP339=(function(binding__MINUSname,body){
            var $$TMP340;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP340=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP340;
}
)($$root["nth"](1,__GS17),$$root["drop"](2,__GS17));
return $$TMP339;
}
)(form);
$$TMP338=data;
return $$TMP338;
}
)($$root["object"]([]));
return $$TMP337;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP341;
   $$TMP341=(function(data){
      var $$TMP342;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP342=data;
return $$TMP342;
}
)($$root["object"]([]));
return $$TMP341;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP343;
   $$TMP343=(function(data,accum__MINUSname){
      var $$TMP344;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP344=data;
return $$TMP344;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP343;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP345;
$$TMP345=$$root["filter"]((function(x){
   var $$TMP346;
$$TMP346=$$root["not="](x,undefined);
return $$TMP346;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP345;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP362=0;
   $$TMP362<arguments.length;
   ++$$TMP362){
      forms[$$TMP362-0]=arguments[$$TMP362];
   }
   var $$TMP347;
   $$TMP347=(function(res__MINUSname){
      var $$TMP348;
      $$TMP348=(function(all){
         var $$TMP358;
         $$TMP358=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP360;
            var $$TMP361;
if($$root["null?"](final__MINUSactions)){
$$TMP361=$$root["list"](res__MINUSname);
}
else{
   $$TMP361=final__MINUSactions;
}
$$TMP360=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP361)))))));
return $$TMP360;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP359;
$$TMP359=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP359;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP358;
}
)($$root["map"]((function(form){
   var $$TMP349;
   $$TMP349=(function(__GS18){
      var $$TMP350;
      var $$TMP351;
if($$root["equal?"](__GS18,(new $$root.Symbol("let")))){
$$TMP351=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP352;
if($$root["equal?"](__GS18,(new $$root.Symbol("for")))){
$$TMP352=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP353;
if($$root["equal?"](__GS18,(new $$root.Symbol("while")))){
$$TMP353=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP354;
if($$root["equal?"](__GS18,(new $$root.Symbol("do")))){
$$TMP354=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP355;
if($$root["equal?"](__GS18,(new $$root.Symbol("collecting")))){
$$TMP355=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP356;
if($$root["equal?"](__GS18,(new $$root.Symbol("finally")))){
$$TMP356=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP357;
   if(true){
$$TMP357=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP357=undefined;
}
$$TMP356=$$TMP357;
}
$$TMP355=$$TMP356;
}
$$TMP354=$$TMP355;
}
$$TMP353=$$TMP354;
}
$$TMP352=$$TMP353;
}
$$TMP351=$$TMP352;
}
$$TMP350=$$TMP351;
return $$TMP350;
}
)($$root["car"](form));
return $$TMP349;
}
),forms));
return $$TMP348;
}
)($$root["gensym"]());
return $$TMP347;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP367=1;
   $$TMP367<arguments.length;
   ++$$TMP367){
      kvs[$$TMP367-1]=arguments[$$TMP367];
   }
   var $$TMP363;
   $$TMP363=(function(meta){
      var $$TMP364;
      var $$TMP365;
if($$root["not"](meta)){
   var $$TMP366;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP366=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP365=$$TMP366;
}
else{
   $$TMP365=undefined;
}
$$TMP365;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP364=obj;
return $$TMP364;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP363;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP368;
$$TMP368=$$root["print"](($$root["JSON"]).stringify($$root["geti-safe"](x,(new $$root.Symbol("meta")))));
return $$TMP368;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP371=1;
   $$TMP371<arguments.length;
   ++$$TMP371){
      fields[$$TMP371-1]=arguments[$$TMP371];
   }
   var $$TMP369;
$$TMP369=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP370;
$$TMP370=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP370;
}
),fields))));
return $$TMP369;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP372;
   $$TMP372=(s).slice(start,end);
   return $$TMP372;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP373;
$$TMP373=$$root["<"](x,0);
return $$TMP373;
}
);
$$root["neg?"];
$$root["truncate"]=(function(x){
   var $$TMP374;
   var $$TMP375;
if($$root["neg?"](x)){
$$TMP375=($$root["Math"]).ceil(x);
}
else{
$$TMP375=($$root["Math"]).floor(x);
}
$$TMP374=$$TMP375;
return $$TMP374;
}
);
$$root["truncate"];
$$root["byte"]=(function(x){
   var $$TMP376;
   $$TMP376=(function(y){
      var $$TMP377;
      var $$TMP378;
if($$root["neg?"](y)){
$$TMP378=$$root["+"](256,y);
}
else{
   $$TMP378=y;
}
$$TMP377=$$TMP378;
return $$TMP377;
}
)($$root["mod"]($$root["truncate"](x),256));
return $$TMP376;
}
);
$$root["byte"];
$$root["short"]=(function(x){
   var $$TMP379;
   $$TMP379=(function(y){
      var $$TMP380;
      var $$TMP381;
if($$root["neg?"](y)){
$$TMP381=$$root["+"](65536,y);
}
else{
   $$TMP381=y;
}
$$TMP380=$$TMP381;
return $$TMP380;
}
)($$root["mod"]($$root["truncate"](x),65536));
return $$TMP379;
}
);
$$root["short"];
$$root["int"]=(function(x){
   var $$TMP382;
   $$TMP382=(function(y){
      var $$TMP383;
      var $$TMP384;
if($$root["neg?"](y)){
$$TMP384=$$root["+"](4294967296,y);
}
else{
   $$TMP384=y;
}
$$TMP383=$$TMP384;
return $$TMP383;
}
)($$root["mod"]($$root["truncate"](x),4294967296));
return $$TMP382;
}
);
$$root["int"];
$$root["idiv"]=(function(a,b){
   var $$TMP385;
$$TMP385=$$root["truncate"]($$root["/"](a,b));
return $$TMP385;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP386;
   var $$TMP387;
if($$root["string?"](x)){
$$TMP387=$$root["="]($$root["geti-safe"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP388;
if($$root["list?"](x)){
$$TMP388=$$root["null?"](x);
}
else{
   var $$TMP389;
   if(true){
$$TMP389=$$root["error"]("Type error in empty?");
}
else{
   $$TMP389=undefined;
}
$$TMP388=$$TMP389;
}
$$TMP387=$$TMP388;
}
$$TMP386=$$TMP387;
return $$TMP386;
}
);
$$root["empty?"];
$$root["with-fields"]=(function(fields,obj){
   var body=Array(arguments.length-2);
   for(var $$TMP393=2;
   $$TMP393<arguments.length;
   ++$$TMP393){
      body[$$TMP393-2]=arguments[$$TMP393];
   }
   var $$TMP390;
   $$TMP390=(function(obj__MINUSsym){
      var $$TMP391;
$$TMP391=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](obj__MINUSsym),$$root["list"](obj),$$root["interleave"](fields,$$root["map"]((function(field){
   var $$TMP392;
$$TMP392=$$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](obj__MINUSsym),$$root["list"](field));
return $$TMP392;
}
),fields)))),body);
return $$TMP391;
}
)($$root["gensym"]());
return $$TMP390;
}
);
$$root["with-fields"];
$$root["setmac!"]($$root["with-fields"]);
$$root["inside?"]=(function(x,x0,x1){
   var $$TMP394;
   var $$TMP395;
if($$root[">="](x,x0)){
   var $$TMP396;
if($$root["<="](x,x1)){
   $$TMP396=true;
}
else{
   $$TMP396=false;
}
$$TMP395=$$TMP396;
}
else{
   $$TMP395=false;
}
$$TMP394=$$TMP395;
return $$TMP394;
}
);
$$root["inside?"];
$$root["clamp"]=(function(x,x0,x1){
   var $$TMP397;
   var $$TMP398;
if($$root["<"](x,x0)){
   $$TMP398=x0;
}
else{
   var $$TMP399;
if($$root[">"](x,x1)){
   $$TMP399=x1;
}
else{
   $$TMP399=x;
}
$$TMP398=$$TMP399;
}
$$TMP397=$$TMP398;
return $$TMP397;
}
);
$$root["clamp"];
$$root["randf"]=(function(min,max){
   var $$TMP400;
$$TMP400=$$root["+"](min,$$root["*"]($$root["-"](max,min),($$root["Math"]).random()));
return $$TMP400;
}
);
$$root["randf"];
$$root["randi"]=(function(min,max){
   var $$TMP401;
$$TMP401=$$root["int"]($$root["randf"](min,max));
return $$TMP401;
}
);
$$root["randi"];
$$root["random-element"]=(function(lst){
   var $$TMP402;
$$TMP402=$$root["nth"]($$root["randi"](0,$$root["count"](lst)),lst);
return $$TMP402;
}
);
$$root["random-element"];
$$root["sqrt"]=(function(x){
   var $$TMP403;
$$TMP403=$$root["call-method-by-name"]($$root["Math"],(new $$root.Symbol("sqrt")),x);
return $$TMP403;
}
);
$$root["sqrt"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP404;
   $$TMP404=(function(self){
      var $$TMP405;
      $$TMP405=(function(__GS19){
         var $$TMP406;
$$root["seti!"](__GS19,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS19,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS19,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS19,(new $$root.Symbol("len")),len);
$$TMP406=__GS19;
return $$TMP406;
}
)(self);
return $$TMP405;
}
)(this);
return $$TMP404;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP407;
   $$TMP407=(function(self){
      var $$TMP408;
$$TMP408=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti-safe"](self,(new $$root.Symbol("start"))),$$root["geti-safe"](self,(new $$root.Symbol("len"))));
return $$TMP408;
}
)(this);
return $$TMP407;
}
));
$$root["lit"]=(function(s){
   var $$TMP409;
$$TMP409=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP409;
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
   var $$TMP410;
   $$TMP410=(function(toks,pos,s){
      var $$TMP411;
      (function(__GS20,__GS21){
         var $$TMP412;
         $$TMP412=(function(recur){
            var $$TMP414;
            var $$TMP415;
            while(true){
               __GS20=true;
               __GS20;
               var $$TMP416;
               {
                  var $$TMP417;
if($$root[">"]($$root["geti-safe"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP418;
   {
      (function(__GS22,res,i,__GS23,__GS24,entry,_){
         var $$TMP419;
         $$TMP419=(function(__GS25,__GS26){
            var $$TMP420;
            $$TMP420=(function(recur){
               var $$TMP422;
               var $$TMP423;
               while(true){
                  __GS25=true;
                  __GS25;
                  var $$TMP424;
                  {
                     var $$TMP425;
                     var $$TMP426;
if($$root["<"](i,__GS23)){
   var $$TMP427;
if($$root["not"]($$root["null?"](__GS24))){
   var $$TMP428;
if($$root["not"](res)){
   $$TMP428=true;
}
else{
   $$TMP428=false;
}
$$TMP427=$$TMP428;
}
else{
   $$TMP427=false;
}
$$TMP426=$$TMP427;
}
else{
   $$TMP426=false;
}
if($$TMP426){
   var $$TMP429;
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
$$TMP429=recur();
}
$$TMP425=$$TMP429;
}
else{
   var $$TMP430;
   {
      _=__GS22;
      _;
      var $$TMP431;
      if(res){
         var $$TMP432;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP433;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP434;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP435;
   var $$TMP436;
   if(c){
      $$TMP436=c;
   }
   else{
$$TMP436=$$root["second"](entry);
}
$$TMP435=$$TMP436;
return $$TMP435;
}
)($$root["geti"]($$root["keywords"],$$root["geti-safe"](res,0))),pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP434=toks;
}
$$TMP433=$$TMP434;
}
else{
   $$TMP433=undefined;
}
$$TMP433;
pos=$$root["+"](pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
$$TMP432=pos;
}
$$TMP431=$$TMP432;
}
else{
$$TMP431=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS22=$$TMP431;
$$TMP430=__GS22;
}
$$TMP425=$$TMP430;
}
$$TMP424=$$TMP425;
}
__GS26=$$TMP424;
__GS26;
var $$TMP437;
if($$root["not"](__GS25)){
   continue;
   $$TMP437=undefined;
}
else{
   $$TMP437=__GS26;
}
$$TMP423=$$TMP437;
break;
}
$$TMP422=$$TMP423;
return $$TMP422;
}
)((function(){
   var $$TMP421;
   __GS25=false;
   $$TMP421=__GS25;
   return $$TMP421;
}
));
return $$TMP420;
}
)(false,undefined);
return $$TMP419;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP418=recur();
}
$$TMP417=$$TMP418;
}
else{
   $$TMP417=undefined;
}
$$TMP416=$$TMP417;
}
__GS21=$$TMP416;
__GS21;
var $$TMP438;
if($$root["not"](__GS20)){
   continue;
   $$TMP438=undefined;
}
else{
   $$TMP438=__GS21;
}
$$TMP415=$$TMP438;
break;
}
$$TMP414=$$TMP415;
return $$TMP414;
}
)((function(){
   var $$TMP413;
   __GS20=false;
   $$TMP413=__GS20;
   return $$TMP413;
}
));
return $$TMP412;
}
)(false,undefined);
$$TMP411=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP411;
}
)([],0,src);
return $$TMP410;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP439;
   $$TMP439=(function(self){
      var $$TMP440;
$$TMP440=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP440;
}
)(this);
return $$TMP439;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP441;
   $$TMP441=(function(self){
      var $$TMP442;
$$TMP442=$$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos"))));
return $$TMP442;
}
)(this);
return $$TMP441;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP443;
   $$TMP443=(function(self){
      var $$TMP444;
      $$TMP444=(function(curr){
         var $$TMP445;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
$$TMP445=curr;
return $$TMP445;
}
)($$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
return $$TMP444;
}
)(this);
return $$TMP443;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP446;
$$TMP446=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP446;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP447;
$$TMP447=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP447;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP448;
   $$TMP448=(function(self){
      var $$TMP449;
      $$TMP449=(function(tok){
         var $$TMP450;
         $$TMP450=(function(__GS27){
            var $$TMP451;
            var $$TMP452;
if($$root["equal?"](__GS27,(new $$root.Symbol("list-open-tok")))){
$$TMP452=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP453;
if($$root["equal?"](__GS27,(new $$root.Symbol("true-tok")))){
   $$TMP453=true;
}
else{
   var $$TMP454;
if($$root["equal?"](__GS27,(new $$root.Symbol("false-tok")))){
   $$TMP454=false;
}
else{
   var $$TMP455;
if($$root["equal?"](__GS27,(new $$root.Symbol("null-tok")))){
   $$TMP455=[];
}
else{
   var $$TMP456;
if($$root["equal?"](__GS27,(new $$root.Symbol("undef-tok")))){
   $$TMP456=undefined;
}
else{
   var $$TMP457;
if($$root["equal?"](__GS27,(new $$root.Symbol("num-tok")))){
$$TMP457=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP458;
if($$root["equal?"](__GS27,(new $$root.Symbol("str-tok")))){
$$TMP458=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP459;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote-tok")))){
$$TMP459=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP460;
if($$root["equal?"](__GS27,(new $$root.Symbol("backquote-tok")))){
$$TMP460=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP461;
if($$root["equal?"](__GS27,(new $$root.Symbol("sym-tok")))){
$$TMP461=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP462;
   if(true){
$$TMP462=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti-safe"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP462=undefined;
}
$$TMP461=$$TMP462;
}
$$TMP460=$$TMP461;
}
$$TMP459=$$TMP460;
}
$$TMP458=$$TMP459;
}
$$TMP457=$$TMP458;
}
$$TMP456=$$TMP457;
}
$$TMP455=$$TMP456;
}
$$TMP454=$$TMP455;
}
$$TMP453=$$TMP454;
}
$$TMP452=$$TMP453;
}
$$TMP451=$$TMP452;
return $$TMP451;
}
)($$root["geti-safe"](tok,(new $$root.Symbol("type"))));
return $$TMP450;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP449;
}
)(this);
return $$TMP448;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP463;
   $$TMP463=(function(s){
      var $$TMP464;
$$TMP464=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP464;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP463;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP465;
$$TMP465=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP465;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP466;
   $$TMP466=(function(self){
      var $$TMP467;
      $$TMP467=(function(start__MINUSpos){
         var $$TMP468;
         $$TMP468=(function(__GS28,__GS29,lst){
            var $$TMP469;
            $$TMP469=(function(__GS30,__GS31){
               var $$TMP470;
               $$TMP470=(function(recur){
                  var $$TMP472;
                  var $$TMP473;
                  while(true){
                     __GS30=true;
                     __GS30;
                     var $$TMP474;
                     {
                        var $$TMP475;
                        var $$TMP476;
                        var $$TMP477;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP478;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
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
   $$TMP476=true;
}
else{
   $$TMP476=false;
}
if($$TMP476){
   var $$TMP479;
   {
__GS29=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS29);
__GS28=__GS29;
__GS28;
$$TMP479=recur();
}
$$TMP475=$$TMP479;
}
else{
   var $$TMP480;
   {
__GS28=$$root["reverse"](__GS29);
__GS28;
lst=__GS28;
lst;
var $$TMP481;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP481=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP481=$$root["error"]("Unmatched paren!");
}
__GS28=$$TMP481;
$$TMP480=__GS28;
}
$$TMP475=$$TMP480;
}
$$TMP474=$$TMP475;
}
__GS31=$$TMP474;
__GS31;
var $$TMP482;
if($$root["not"](__GS30)){
   continue;
   $$TMP482=undefined;
}
else{
   $$TMP482=__GS31;
}
$$TMP473=$$TMP482;
break;
}
$$TMP472=$$TMP473;
return $$TMP472;
}
)((function(){
   var $$TMP471;
   __GS30=false;
   $$TMP471=__GS30;
   return $$TMP471;
}
));
return $$TMP470;
}
)(false,undefined);
return $$TMP469;
}
)(undefined,[],undefined);
return $$TMP468;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP467;
}
)(this);
return $$TMP466;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP483;
   $$TMP483=(function(self){
      var $$TMP484;
      $$TMP484=(function(__GS32,__GS33,lst){
         var $$TMP485;
         $$TMP485=(function(__GS34,__GS35){
            var $$TMP486;
            $$TMP486=(function(recur){
               var $$TMP488;
               var $$TMP489;
               while(true){
                  __GS34=true;
                  __GS34;
                  var $$TMP490;
                  {
                     var $$TMP491;
                     var $$TMP492;
                     var $$TMP493;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP494;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP494=true;
}
else{
   $$TMP494=false;
}
$$TMP493=$$TMP494;
}
else{
   $$TMP493=false;
}
if($$TMP493){
   $$TMP492=true;
}
else{
   $$TMP492=false;
}
if($$TMP492){
   var $$TMP495;
   {
__GS33=$$root["cons"]((function(__GS36){
   var $$TMP496;
   var $$TMP497;
if($$root["equal?"](__GS36,(new $$root.Symbol("unquote-tok")))){
   var $$TMP498;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP498=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP497=$$TMP498;
}
else{
   var $$TMP499;
if($$root["equal?"](__GS36,(new $$root.Symbol("splice-tok")))){
   var $$TMP500;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP500=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP499=$$TMP500;
}
else{
   var $$TMP501;
   if(true){
$$TMP501=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP501=undefined;
}
$$TMP499=$$TMP501;
}
$$TMP497=$$TMP499;
}
$$TMP496=$$TMP497;
return $$TMP496;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS33);
__GS32=__GS33;
__GS32;
$$TMP495=recur();
}
$$TMP491=$$TMP495;
}
else{
   var $$TMP502;
   {
__GS32=$$root["reverse"](__GS33);
__GS32;
lst=__GS32;
lst;
var $$TMP503;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP503=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP503=$$root["error"]("Unmatched paren!");
}
__GS32=$$TMP503;
$$TMP502=__GS32;
}
$$TMP491=$$TMP502;
}
$$TMP490=$$TMP491;
}
__GS35=$$TMP490;
__GS35;
var $$TMP504;
if($$root["not"](__GS34)){
   continue;
   $$TMP504=undefined;
}
else{
   $$TMP504=__GS35;
}
$$TMP489=$$TMP504;
break;
}
$$TMP488=$$TMP489;
return $$TMP488;
}
)((function(){
   var $$TMP487;
   __GS34=false;
   $$TMP487=__GS34;
   return $$TMP487;
}
));
return $$TMP486;
}
)(false,undefined);
return $$TMP485;
}
)(undefined,[],undefined);
return $$TMP484;
}
)(this);
return $$TMP483;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP505;
   $$TMP505=(function(self){
      var $$TMP506;
      var $$TMP507;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP508;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP508=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP507=$$TMP508;
}
else{
$$TMP507=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP506=$$TMP507;
return $$TMP506;
}
)(this);
return $$TMP505;
}
));
$$root["parse"]=(function(toks){
   var $$TMP509;
   $$TMP509=(function(p){
      var $$TMP510;
      $$TMP510=(function(__GS37,__GS38){
         var $$TMP511;
         $$TMP511=(function(__GS39,__GS40){
            var $$TMP512;
            $$TMP512=(function(recur){
               var $$TMP514;
               var $$TMP515;
               while(true){
                  __GS39=true;
                  __GS39;
                  var $$TMP516;
                  {
                     var $$TMP517;
                     var $$TMP518;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP518=true;
}
else{
   $$TMP518=false;
}
if($$TMP518){
   var $$TMP519;
   {
__GS38=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS38);
__GS37=__GS38;
__GS37;
$$TMP519=recur();
}
$$TMP517=$$TMP519;
}
else{
   var $$TMP520;
   {
__GS37=$$root["reverse"](__GS38);
$$TMP520=__GS37;
}
$$TMP517=$$TMP520;
}
$$TMP516=$$TMP517;
}
__GS40=$$TMP516;
__GS40;
var $$TMP521;
if($$root["not"](__GS39)){
   continue;
   $$TMP521=undefined;
}
else{
   $$TMP521=__GS40;
}
$$TMP515=$$TMP521;
break;
}
$$TMP514=$$TMP515;
return $$TMP514;
}
)((function(){
   var $$TMP513;
   __GS39=false;
   $$TMP513=__GS39;
   return $$TMP513;
}
));
return $$TMP512;
}
)(false,undefined);
return $$TMP511;
}
)(undefined,[]);
return $$TMP510;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP509;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS41){
   var $$TMP522;
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
$$TMP522=__GS41;
return $$TMP522;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP523;
$$TMP523=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP523;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP524;
$$TMP524=$$root["geti"]($$root["mangling-table"],x);
return $$TMP524;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP525;
$$TMP525=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP525;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP526;
   $$TMP526=(function(__GS42){
      var $$TMP527;
$$root["seti!"](__GS42,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS42,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP527=__GS42;
return $$TMP527;
}
)($$root["hashmap"]());
return $$TMP526;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP528;
   $$TMP528=(function(__GS43){
      var $$TMP529;
$$root["seti!"](__GS43,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS43,(new $$root.Symbol("mappings")),mappings);
$$TMP529=__GS43;
return $$TMP529;
}
)($$root["hashmap"]());
return $$TMP528;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP530;
$$TMP530=$$root["make-tc-str"](s,[]);
return $$TMP530;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP531;
   $$TMP531=(function(adder){
      var $$TMP533;
$$TMP533=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP533;
}
)((function(x){
   var $$TMP532;
$$TMP532=$$root["+"](x,n);
return $$TMP532;
}
));
return $$TMP531;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP534;
   var $$TMP535;
if($$root["string?"](b)){
$$TMP535=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),b),$$root["geti-safe"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP535=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),$$root["geti-safe"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti-safe"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP536;
$$TMP536=$$root["offset-source-mapping"](e,$$root["geti-safe"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP536;
}
),$$root["geti-safe"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP534=$$TMP535;
return $$TMP534;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP538=0;
   $$TMP538<arguments.length;
   ++$$TMP538){
      args[$$TMP538-0]=arguments[$$TMP538];
   }
   var $$TMP537;
$$TMP537=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP537;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP539;
$$TMP539=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP539;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP556=2;
   $$TMP556<arguments.length;
   ++$$TMP556){
      args[$$TMP556-2]=arguments[$$TMP556];
   }
   var $$TMP540;
   $$TMP540=(function(rx){
      var $$TMP541;
      $$TMP541=(function(__GS44,accum,__GS45,x,n,_){
         var $$TMP542;
         $$TMP542=(function(__GS46,__GS47){
            var $$TMP543;
            $$TMP543=(function(recur){
               var $$TMP545;
               var $$TMP546;
               while(true){
                  __GS46=true;
                  __GS46;
                  var $$TMP547;
                  {
                     var $$TMP548;
                     var $$TMP549;
if($$root["not"]($$root["null?"](__GS45))){
   $$TMP549=true;
}
else{
   $$TMP549=false;
}
if($$TMP549){
   var $$TMP550;
   {
x=$$root["car"](__GS45);
x;
var $$TMP551;
if($$root["even?"](n)){
   $$TMP551=x;
}
else{
$$TMP551=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP551);
__GS44=accum;
__GS44;
__GS45=$$root["cdr"](__GS45);
__GS45;
n=$$root["+"](n,1);
n;
$$TMP550=recur();
}
$$TMP548=$$TMP550;
}
else{
   var $$TMP552;
   {
      _=__GS44;
      _;
      var $$TMP553;
      if(source__MINUSpos){
         var $$TMP554;
         {
$$TMP554=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti-safe"]($$root["geti-safe"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti-safe"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP553=$$TMP554;
}
else{
   $$TMP553=undefined;
}
$$TMP553;
__GS44=accum;
$$TMP552=__GS44;
}
$$TMP548=$$TMP552;
}
$$TMP547=$$TMP548;
}
__GS47=$$TMP547;
__GS47;
var $$TMP555;
if($$root["not"](__GS46)){
   continue;
   $$TMP555=undefined;
}
else{
   $$TMP555=__GS47;
}
$$TMP546=$$TMP555;
break;
}
$$TMP545=$$TMP546;
return $$TMP545;
}
)((function(){
   var $$TMP544;
   __GS46=false;
   $$TMP544=__GS46;
   return $$TMP544;
}
));
return $$TMP543;
}
)(false,undefined);
return $$TMP542;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP541;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP540;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP557;
   $$TMP557=(function(self){
      var $$TMP558;
      $$TMP558=(function(__GS48){
         var $$TMP559;
$$root["seti!"](__GS48,"root",root);
$$root["seti!"](__GS48,"next-var-suffix",0);
$$TMP559=__GS48;
return $$TMP559;
}
)(self);
return $$TMP558;
}
)(this);
return $$TMP557;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP560;
   $$TMP560=(function(self){
      var $$TMP561;
      $$TMP561=(function(out){
         var $$TMP562;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP562=out;
return $$TMP562;
}
)($$root["str"]("$$TMP",$$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP561;
}
)(this);
return $$TMP560;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP563;
   var $$TMP564;
if($$root["in?"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP564=$$root["mangle-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP564=$$root["str"]("$$root[\"",$$root["geti-safe"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP563=$$TMP564;
return $$TMP563;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP565;
   $$TMP565=(function(self){
      var $$TMP566;
      var $$TMP567;
if($$root["="](x,true)){
$$TMP567=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP568;
if($$root["="](x,false)){
$$TMP568=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP569;
if($$root["null?"](x)){
$$TMP569=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP570;
if($$root["="](x,undefined)){
$$TMP570=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP571;
if($$root["symbol?"](x)){
$$TMP571=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP572;
if($$root["string?"](x)){
$$TMP572=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP573;
   if(true){
$$TMP573=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP573=undefined;
}
$$TMP572=$$TMP573;
}
$$TMP571=$$TMP572;
}
$$TMP570=$$TMP571;
}
$$TMP569=$$TMP570;
}
$$TMP568=$$TMP569;
}
$$TMP567=$$TMP568;
}
$$TMP566=$$TMP567;
return $$TMP566;
}
)(this);
return $$TMP565;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP574;
   $$TMP574=(function(self){
      var $$TMP575;
      $$TMP575=(function(__GS49){
         var $$TMP576;
         $$TMP576=(function(fun,args){
            var $$TMP577;
            $$TMP577=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP578;
$$TMP578=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP578;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP577;
}
)($$root["nth"](0,__GS49),$$root["drop"](1,__GS49));
return $$TMP576;
}
)(lst);
return $$TMP575;
}
)(this);
return $$TMP574;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP579;
   $$TMP579=(function(self){
      var $$TMP580;
      $$TMP580=(function(__GS50){
         var $$TMP581;
         $$TMP581=(function(fun,args){
            var $$TMP582;
            $$TMP582=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP583;
$$TMP583=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP583;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP582;
}
)($$root["nth"](1,__GS50),$$root["drop"](2,__GS50));
return $$TMP581;
}
)(lst);
return $$TMP580;
}
)(this);
return $$TMP579;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP584;
   $$TMP584=(function(self){
      var $$TMP585;
      $$TMP585=(function(__GS51){
         var $$TMP586;
         $$TMP586=(function(method,obj,args){
            var $$TMP587;
            $$TMP587=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP588;
$$TMP588=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP588;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP587;
}
)($$root["nth"](0,__GS51),$$root["nth"](1,__GS51),$$root["drop"](2,__GS51));
return $$TMP586;
}
)(lst);
return $$TMP585;
}
)(this);
return $$TMP584;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP589;
   $$TMP589=(function(self){
      var $$TMP590;
      $$TMP590=(function(compiled__MINUSbody,reducer){
         var $$TMP592;
$$TMP592=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP592;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP591;
$$TMP591=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP591;
}
));
return $$TMP590;
}
)(this);
return $$TMP589;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP593;
$$TMP593=$$root["="]($$root["geti-safe"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP593;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP594;
   var $$TMP595;
if($$root["is-vararg?"](sym)){
$$TMP595=$$root["call-method-by-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP595=$$root["geti-safe"](sym,(new $$root.Symbol("name")));
}
$$TMP594=$$TMP595;
return $$TMP594;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP596;
$$TMP596=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP597;
$$TMP597=$$root["mangle-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))));
return $$TMP597;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP596;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP598;
   $$TMP598=(function(self){
      var $$TMP599;
      var $$TMP600;
if($$root["not"]($$root["null?"](args))){
   var $$TMP601;
   {
$$TMP601=$$root["last"](args);
}
$$TMP600=$$TMP601;
}
else{
   $$TMP600=undefined;
}
$$TMP599=(function(last__MINUSarg){
   var $$TMP602;
   var $$TMP603;
   var $$TMP604;
   if(last__MINUSarg){
      var $$TMP605;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP605=true;
}
else{
   $$TMP605=false;
}
$$TMP604=$$TMP605;
}
else{
   $$TMP604=false;
}
if($$TMP604){
$$TMP603=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti-safe"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP603="";
}
$$TMP602=$$TMP603;
return $$TMP602;
}
)($$TMP600);
return $$TMP599;
}
)(this);
return $$TMP598;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP606;
   $$TMP606=(function(self){
      var $$TMP607;
      $$TMP607=(function(__GS52){
         var $$TMP608;
         $$TMP608=(function(__GS53){
            var $$TMP609;
            $$TMP609=(function(args,body){
               var $$TMP610;
               $$TMP610=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP612;
                  $$TMP612=(function(compiled__MINUSbody){
                     var $$TMP613;
$$TMP613=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP613;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP612;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP611;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP611=accum;
return $$TMP611;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP610;
}
)($$root["drop"](0,__GS53),$$root["drop"](2,__GS52));
return $$TMP609;
}
)($$root["nth"](1,__GS52));
return $$TMP608;
}
)(lst);
return $$TMP607;
}
)(this);
return $$TMP606;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP614;
   $$TMP614=(function(self){
      var $$TMP615;
      $$TMP615=(function(__GS54){
         var $$TMP616;
         $$TMP616=(function(body){
            var $$TMP617;
            $$TMP617=(function(value__MINUSvar__MINUSname){
               var $$TMP618;
               $$TMP618=(function(compiled__MINUSbody){
                  var $$TMP619;
$$TMP619=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP619;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP618;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP617;
}
)($$root["drop"](1,__GS54));
return $$TMP616;
}
)(lst);
return $$TMP615;
}
)(this);
return $$TMP614;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP620;
   $$TMP620=(function(self){
      var $$TMP621;
$$TMP621=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP621;
}
)(this);
return $$TMP620;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-break")),(function(lexenv,lst){
   var $$TMP622;
   $$TMP622=(function(self){
      var $$TMP623;
$$TMP623=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("break;"));
return $$TMP623;
}
)(this);
return $$TMP622;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-return")),(function(lexenv,lst){
   var $$TMP624;
   $$TMP624=(function(self){
      var $$TMP625;
      var $$TMP626;
if($$root["null?"]($$root["cdr"](lst))){
$$TMP626=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("return;"));
}
else{
   var $$TMP627;
if($$root["null?"]($$root["cdr"]($$root["cdr"](lst)))){
   $$TMP627=(function(compiled__MINUSret__MINUSval){
      var $$TMP628;
$$TMP628=$$root["list"]($$root["str->tc"]("undefined"),$$root["format-tc"](undefined,"%0return %1;",$$root["second"](compiled__MINUSret__MINUSval),$$root["first"](compiled__MINUSret__MINUSval)));
return $$TMP628;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["second"](lst)));
}
else{
   var $$TMP629;
   if(true){
$$TMP629=$$root["error"]("Can't return more than on value!");
}
else{
   $$TMP629=undefined;
}
$$TMP627=$$TMP629;
}
$$TMP626=$$TMP627;
}
$$TMP625=$$TMP626;
return $$TMP625;
}
)(this);
return $$TMP624;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP630;
   $$TMP630=(function(self){
      var $$TMP631;
      $$TMP631=(function(__GS55){
         var $$TMP632;
         $$TMP632=(function(body){
            var $$TMP633;
            $$TMP633=(function(value__MINUSvar__MINUSname){
               var $$TMP634;
               $$TMP634=(function(compiled__MINUSbody){
                  var $$TMP635;
$$TMP635=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP635;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP634;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP633;
}
)($$root["drop"](1,__GS55));
return $$TMP632;
}
)(lst);
return $$TMP631;
}
)(this);
return $$TMP630;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP636;
   $$TMP636=(function(self){
      var $$TMP637;
      $$TMP637=(function(__GS56){
         var $$TMP638;
         $$TMP638=(function(c,t,f){
            var $$TMP639;
            $$TMP639=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP640;
$$TMP640=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP640;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP639;
}
)($$root["nth"](1,__GS56),$$root["nth"](2,__GS56),$$root["nth"](3,__GS56));
return $$TMP638;
}
)(lst);
return $$TMP637;
}
)(this);
return $$TMP636;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP641;
   $$TMP641=(function(self){
      var $$TMP642;
      var $$TMP643;
if($$root["symbol?"](x)){
$$TMP643=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti-safe"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP643=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP642=$$TMP643;
return $$TMP642;
}
)(this);
return $$TMP641;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP644;
   $$TMP644=(function(self){
      var $$TMP645;
$$TMP645=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP645;
}
)(this);
return $$TMP644;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP646;
   $$TMP646=(function(self){
      var $$TMP647;
      var $$TMP648;
if($$root["atom?"](x)){
$$TMP648=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP648=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP647=$$TMP648;
return $$TMP647;
}
)(this);
return $$TMP646;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP649;
   $$TMP649=(function(self){
      var $$TMP650;
      $$TMP650=(function(__GS57){
         var $$TMP651;
         $$TMP651=(function(name,value){
            var $$TMP652;
            $$TMP652=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP653;
$$TMP653=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP653;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP652;
}
)($$root["nth"](1,__GS57),$$root["nth"](2,__GS57));
return $$TMP651;
}
)(lst);
return $$TMP650;
}
)(this);
return $$TMP649;
}
));
$$root["annotate-macroexpansion"]=(function(source__MINUSpos,x){
   var $$TMP654;
   var $$TMP655;
   var $$TMP656;
if($$root["list?"](x)){
   var $$TMP657;
if($$root["not"]($$root["null?"](x))){
   var $$TMP658;
if($$root["not"]($$root["equal?"]($$root["car"](x),(new $$root.Symbol("quote"))))){
   var $$TMP659;
if($$root["="]($$root["get-source-pos"](x),undefined)){
   $$TMP659=true;
}
else{
   $$TMP659=false;
}
$$TMP658=$$TMP659;
}
else{
   $$TMP658=false;
}
$$TMP657=$$TMP658;
}
else{
   $$TMP657=false;
}
$$TMP656=$$TMP657;
}
else{
   $$TMP656=false;
}
if($$TMP656){
$$TMP655=$$root["deep-assoc!"]($$root["map"]($$root["partial"]($$root["annotate-macroexpansion"],source__MINUSpos),x),$$root.list((new $$root.Symbol("meta"))),(new $$root.Symbol("source-pos")),source__MINUSpos);
}
else{
   $$TMP655=x;
}
$$TMP654=$$TMP655;
return $$TMP654;
}
);
$$root["annotate-macroexpansion"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP660;
   $$TMP660=(function(self){
      var $$TMP661;
      $$TMP661=(function(__GS58){
         var $$TMP662;
         $$TMP662=(function(name,args){
            var $$TMP663;
$$TMP663=$$root["annotate-macroexpansion"]($$root["get-source-pos"](expr),$$root["apply"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),args));
return $$TMP663;
}
)($$root["nth"](0,__GS58),$$root["drop"](1,__GS58));
return $$TMP662;
}
)(expr);
return $$TMP661;
}
)(this);
return $$TMP660;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP664;
   $$TMP664=(function(self){
      var $$TMP665;
      var $$TMP666;
if($$root["in?"](name,$$root["geti-safe"](self,(new $$root.Symbol("root"))))){
   var $$TMP667;
if($$root["geti"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP667=true;
}
else{
   $$TMP667=false;
}
$$TMP666=$$TMP667;
}
else{
   $$TMP666=false;
}
$$TMP665=$$TMP666;
return $$TMP665;
}
)(this);
return $$TMP664;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP668;
   $$TMP668=(function(self){
      var $$TMP669;
      var $$TMP670;
      var $$TMP671;
if($$root["list?"](expr)){
   var $$TMP672;
if($$root["not"]($$root["null?"](expr))){
   $$TMP672=true;
}
else{
   $$TMP672=false;
}
$$TMP671=$$TMP672;
}
else{
   $$TMP671=false;
}
if($$TMP671){
   $$TMP670=(function(first){
      var $$TMP673;
      var $$TMP674;
if($$root["symbol?"](first)){
   $$TMP674=(function(__GS59){
      var $$TMP675;
      var $$TMP676;
if($$root["equal?"](__GS59,(new $$root.Symbol("lambda")))){
$$TMP676=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP677;
if($$root["equal?"](__GS59,(new $$root.Symbol("dumb-loop")))){
$$TMP677=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP678;
if($$root["equal?"](__GS59,(new $$root.Symbol("continue")))){
$$TMP678=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP679;
if($$root["equal?"](__GS59,(new $$root.Symbol("break")))){
$$TMP679=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-break")),lexenv,expr);
}
else{
   var $$TMP680;
if($$root["equal?"](__GS59,(new $$root.Symbol("return")))){
$$TMP680=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-return")),lexenv,expr);
}
else{
   var $$TMP681;
if($$root["equal?"](__GS59,(new $$root.Symbol("new")))){
$$TMP681=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP682;
if($$root["equal?"](__GS59,(new $$root.Symbol("if")))){
$$TMP682=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP683;
if($$root["equal?"](__GS59,(new $$root.Symbol("quote")))){
$$TMP683=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP684;
if($$root["equal?"](__GS59,(new $$root.Symbol("setv!")))){
$$TMP684=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP685;
if($$root["equal?"](__GS59,(new $$root.Symbol("def")))){
$$TMP685=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP686;
if($$root["equal?"](__GS59,(new $$root.Symbol("progn")))){
$$TMP686=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP687;
   if(true){
      var $$TMP688;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti-safe"](first,(new $$root.Symbol("name"))))){
$$TMP688=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP689;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP689=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP690;
   if(true){
$$TMP690=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP690=undefined;
}
$$TMP689=$$TMP690;
}
$$TMP688=$$TMP689;
}
$$TMP687=$$TMP688;
}
else{
   $$TMP687=undefined;
}
$$TMP686=$$TMP687;
}
$$TMP685=$$TMP686;
}
$$TMP684=$$TMP685;
}
$$TMP683=$$TMP684;
}
$$TMP682=$$TMP683;
}
$$TMP681=$$TMP682;
}
$$TMP680=$$TMP681;
}
$$TMP679=$$TMP680;
}
$$TMP678=$$TMP679;
}
$$TMP677=$$TMP678;
}
$$TMP676=$$TMP677;
}
$$TMP675=$$TMP676;
return $$TMP675;
}
)(first);
}
else{
$$TMP674=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP673=$$TMP674;
return $$TMP673;
}
)($$root["car"](expr));
}
else{
$$TMP670=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP669=$$TMP670;
return $$TMP669;
}
)(this);
return $$TMP668;
}
));
$$root["compile"]=(function(expr){
   var $$TMP691;
   $$TMP691=(function(c){
      var $$TMP692;
      $$TMP692=(function(t){
         var $$TMP693;
$$TMP693=$$root["str"]($$root["geti-safe"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti-safe"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP693;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP692;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP691;
}
);
$$root["compile"];
