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
$$root["push"]=(function(x,lst){
   var $$TMP250;
$$TMP250=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP250;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP251;
$$TMP251=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP251;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP252;
$$TMP252=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP252;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP253;
   var $$TMP254;
if($$root["="](pos,0)){
$$TMP254=$$root["cons"](x,lst);
}
else{
   var $$TMP255;
if($$root["null?"](lst)){
   $$TMP255=undefined;
}
else{
$$TMP255=$$root["car"](lst);
}
$$TMP254=$$root["cons"]($$TMP255,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP253=$$TMP254;
return $$TMP253;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP258=1;
   $$TMP258<arguments.length;
   ++$$TMP258){
      forms[$$TMP258-1]=arguments[$$TMP258];
   }
   var $$TMP256;
   var $$TMP257;
if($$root["null?"](forms)){
   $$TMP257=x;
}
else{
$$TMP257=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP256=$$TMP257;
return $$TMP256;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP261=1;
   $$TMP261<arguments.length;
   ++$$TMP261){
      forms[$$TMP261-1]=arguments[$$TMP261];
   }
   var $$TMP259;
   var $$TMP260;
if($$root["null?"](forms)){
   $$TMP260=x;
}
else{
$$TMP260=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP259=$$TMP260;
return $$TMP259;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP267=1;
   $$TMP267<arguments.length;
   ++$$TMP267){
      body[$$TMP267-1]=arguments[$$TMP267];
   }
   var $$TMP262;
   $$TMP262=(function(binding__MINUSname){
      var $$TMP263;
$$TMP263=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP264;
   $$TMP264=(function(__GS8){
      var $$TMP265;
      $$TMP265=(function(f,args){
         var $$TMP266;
$$TMP266=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP266;
}
)($$root["nth"](0,__GS8),$$root["drop"](1,__GS8));
return $$TMP265;
}
)(v);
return $$TMP264;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP263;
}
)($$root["gensym"]());
return $$TMP262;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP277=1;
   $$TMP277<arguments.length;
   ++$$TMP277){
      kvs[$$TMP277-1]=arguments[$$TMP277];
   }
   var $$TMP268;
   $$TMP268=(function(__GS9,__GS10,kvs){
      var $$TMP269;
      $$TMP269=(function(recur){
         var $$TMP271;
         var $$TMP272;
         while(true){
            __GS9=true;
            __GS9;
            var $$TMP273;
            {
               var $$TMP274;
if($$root["null?"](kvs)){
   $$TMP274=obj;
}
else{
   var $$TMP275;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP275=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP274=$$TMP275;
}
$$TMP273=$$TMP274;
}
__GS10=$$TMP273;
__GS10;
var $$TMP276;
if($$root["not"](__GS9)){
   continue;
   $$TMP276=undefined;
}
else{
   $$TMP276=__GS10;
}
$$TMP272=$$TMP276;
break;
}
$$TMP271=$$TMP272;
return $$TMP271;
}
)((function(_kvs){
   var $$TMP270;
   kvs=_kvs;
   kvs;
   __GS9=false;
   $$TMP270=__GS9;
   return $$TMP270;
}
));
return $$TMP269;
}
)(false,undefined,kvs);
return $$TMP268;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP287=2;
   $$TMP287<arguments.length;
   ++$$TMP287){
      kvs[$$TMP287-2]=arguments[$$TMP287];
   }
   var $$TMP278;
   (function(__GS11,__GS12,obj,path,kvs){
      var $$TMP279;
      $$TMP279=(function(recur){
         var $$TMP281;
         var $$TMP282;
         while(true){
            __GS11=true;
            __GS11;
            var $$TMP283;
            {
               var $$TMP284;
if($$root["null?"](path)){
$$TMP284=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP285;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP285=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP285=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP284=recur($$TMP285,$$root["cdr"](path),kvs);
}
$$TMP283=$$TMP284;
}
__GS12=$$TMP283;
__GS12;
var $$TMP286;
if($$root["not"](__GS11)){
   continue;
   $$TMP286=undefined;
}
else{
   $$TMP286=__GS12;
}
$$TMP282=$$TMP286;
break;
}
$$TMP281=$$TMP282;
return $$TMP281;
}
)((function(_obj,_path,_kvs){
   var $$TMP280;
   obj=_obj;
   obj;
   path=_path;
   path;
   kvs=_kvs;
   kvs;
   __GS11=false;
   $$TMP280=__GS11;
   return $$TMP280;
}
));
return $$TMP279;
}
)(false,undefined,obj,path,kvs);
$$TMP278=obj;
return $$TMP278;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP288;
   var $$TMP289;
if($$root["null?"](path)){
   $$TMP289=obj;
}
else{
   $$TMP289=(function(tmp){
      var $$TMP290;
      var $$TMP291;
      if(tmp){
$$TMP291=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP291=undefined;
}
$$TMP290=$$TMP291;
return $$TMP290;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP288=$$TMP289;
return $$TMP288;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP293=1;
   $$TMP293<arguments.length;
   ++$$TMP293){
      path[$$TMP293-1]=arguments[$$TMP293];
   }
   var $$TMP292;
$$TMP292=$$root["deep-geti*"](obj,path);
return $$TMP292;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP294;
$$TMP294=$$root["reduce"]((function(h2,key){
   var $$TMP295;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP295=h2;
return $$TMP295;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP294;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP297=1;
   $$TMP297<arguments.length;
   ++$$TMP297){
      kvs[$$TMP297-1]=arguments[$$TMP297];
   }
   var $$TMP296;
$$TMP296=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP296;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP307=1;
   $$TMP307<arguments.length;
   ++$$TMP307){
      kfs[$$TMP307-1]=arguments[$$TMP307];
   }
   var $$TMP298;
   $$TMP298=(function(__GS13,__GS14,kfs){
      var $$TMP299;
      $$TMP299=(function(recur){
         var $$TMP301;
         var $$TMP302;
         while(true){
            __GS13=true;
            __GS13;
            var $$TMP303;
            {
               var $$TMP304;
if($$root["null?"](kfs)){
   $$TMP304=h;
}
else{
   $$TMP304=(function(key){
      var $$TMP305;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP305=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP305;
}
)($$root["first"](kfs));
}
$$TMP303=$$TMP304;
}
__GS14=$$TMP303;
__GS14;
var $$TMP306;
if($$root["not"](__GS13)){
   continue;
   $$TMP306=undefined;
}
else{
   $$TMP306=__GS14;
}
$$TMP302=$$TMP306;
break;
}
$$TMP301=$$TMP302;
return $$TMP301;
}
)((function(_kfs){
   var $$TMP300;
   kfs=_kfs;
   kfs;
   __GS13=false;
   $$TMP300=__GS13;
   return $$TMP300;
}
));
return $$TMP299;
}
)(false,undefined,kfs);
return $$TMP298;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP309=1;
   $$TMP309<arguments.length;
   ++$$TMP309){
      kfs[$$TMP309-1]=arguments[$$TMP309];
   }
   var $$TMP308;
$$TMP308=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP308;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP311=1;
   $$TMP311<arguments.length;
   ++$$TMP311){
      body[$$TMP311-1]=arguments[$$TMP311];
   }
   var $$TMP310;
$$TMP310=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP310;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP312;
$$TMP312=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP312;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP313;
   step=(function(c){
      var $$TMP314;
      var $$TMP315;
      if(c){
         $$TMP315=c;
      }
      else{
         $$TMP315=1;
      }
      $$TMP314=$$TMP315;
      return $$TMP314;
   }
   )(step);
   step;
   $$TMP313=(function(data){
      var $$TMP316;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
var $$TMP317;
if($$root[">"](step,0)){
$$TMP317=(new $$root.Symbol("<"));
}
else{
$$TMP317=(new $$root.Symbol(">"));
}
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]($$TMP317),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP316=data;
return $$TMP316;
}
)($$root["object"]([]));
return $$TMP313;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP318;
   step=(function(c){
      var $$TMP319;
      var $$TMP320;
      if(c){
         $$TMP320=c;
      }
      else{
         $$TMP320=1;
      }
      $$TMP319=$$TMP320;
      return $$TMP319;
   }
   )(step);
   step;
   $$TMP318=(function(data){
      var $$TMP321;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP321=data;
return $$TMP321;
}
)($$root["object"]([]));
return $$TMP318;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP322;
   $$TMP322=(function(len__MINUSname,data){
      var $$TMP323;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP323=data;
return $$TMP323;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP322;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP324;
   $$TMP324=(function(lst__MINUSname,data){
      var $$TMP325;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP325=data;
return $$TMP325;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP324;
}
);
$$root["in-list"];
$$root["in-array"]=(function(binding__MINUSname,expr){
   var $$TMP326;
   $$TMP326=(function(arr__MINUSname,idx__MINUSname,data){
      var $$TMP327;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](arr__MINUSname,expr,idx__MINUSname,0,binding__MINUSname,undefined));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("@"))),$$root["list"](arr__MINUSname),$$root["list"](idx__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](idx__MINUSname)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](idx__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](arr__MINUSname),$$root["list"]((new $$root.Symbol("length")))))));
$$TMP327=data;
return $$TMP327;
}
)($$root["gensym"](),$$root["gensym"](),$$root["object"]([]));
return $$TMP326;
}
);
$$root["in-array"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP328;
   $$TMP328=(function(__GS15){
      var $$TMP329;
      $$TMP329=(function(binding__MINUSname,__GS16){
         var $$TMP330;
         $$TMP330=(function(func__MINUSname,args){
            var $$TMP331;
$$TMP331=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP331;
}
)($$root["nth"](0,__GS16),$$root["drop"](1,__GS16));
return $$TMP330;
}
)($$root["nth"](1,__GS15),$$root["nth"](2,__GS15));
return $$TMP329;
}
)(form);
return $$TMP328;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP332;
   $$TMP332=(function(data){
      var $$TMP333;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP333=data;
return $$TMP333;
}
)($$root["object"]([]));
return $$TMP332;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP334;
   $$TMP334=(function(data){
      var $$TMP335;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP335=data;
return $$TMP335;
}
)($$root["object"]([]));
return $$TMP334;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP336;
   $$TMP336=(function(data){
      var $$TMP337;
      (function(__GS17){
         var $$TMP338;
         $$TMP338=(function(binding__MINUSname,body){
            var $$TMP339;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP339=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP339;
}
)($$root["nth"](1,__GS17),$$root["drop"](2,__GS17));
return $$TMP338;
}
)(form);
$$TMP337=data;
return $$TMP337;
}
)($$root["object"]([]));
return $$TMP336;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP340;
   $$TMP340=(function(data){
      var $$TMP341;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP341=data;
return $$TMP341;
}
)($$root["object"]([]));
return $$TMP340;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP342;
   $$TMP342=(function(data,accum__MINUSname){
      var $$TMP343;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP343=data;
return $$TMP343;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP342;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP344;
$$TMP344=$$root["filter"]((function(x){
   var $$TMP345;
$$TMP345=$$root["not="](x,undefined);
return $$TMP345;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP344;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP361=0;
   $$TMP361<arguments.length;
   ++$$TMP361){
      forms[$$TMP361-0]=arguments[$$TMP361];
   }
   var $$TMP346;
   $$TMP346=(function(res__MINUSname){
      var $$TMP347;
      $$TMP347=(function(all){
         var $$TMP357;
         $$TMP357=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP359;
            var $$TMP360;
if($$root["null?"](final__MINUSactions)){
$$TMP360=$$root["list"](res__MINUSname);
}
else{
   $$TMP360=final__MINUSactions;
}
$$TMP359=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP360)))))));
return $$TMP359;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP358;
$$TMP358=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP358;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP357;
}
)($$root["map"]((function(form){
   var $$TMP348;
   $$TMP348=(function(__GS18){
      var $$TMP349;
      var $$TMP350;
if($$root["equal?"](__GS18,(new $$root.Symbol("let")))){
$$TMP350=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP351;
if($$root["equal?"](__GS18,(new $$root.Symbol("for")))){
$$TMP351=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP352;
if($$root["equal?"](__GS18,(new $$root.Symbol("while")))){
$$TMP352=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP353;
if($$root["equal?"](__GS18,(new $$root.Symbol("do")))){
$$TMP353=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP354;
if($$root["equal?"](__GS18,(new $$root.Symbol("collecting")))){
$$TMP354=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP355;
if($$root["equal?"](__GS18,(new $$root.Symbol("finally")))){
$$TMP355=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP356;
   if(true){
$$TMP356=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP356=undefined;
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
}
$$TMP349=$$TMP350;
return $$TMP349;
}
)($$root["car"](form));
return $$TMP348;
}
),forms));
return $$TMP347;
}
)($$root["gensym"]());
return $$TMP346;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP366=1;
   $$TMP366<arguments.length;
   ++$$TMP366){
      kvs[$$TMP366-1]=arguments[$$TMP366];
   }
   var $$TMP362;
   $$TMP362=(function(meta){
      var $$TMP363;
      var $$TMP364;
if($$root["not"](meta)){
   var $$TMP365;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP365=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP364=$$TMP365;
}
else{
   $$TMP364=undefined;
}
$$TMP364;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP363=obj;
return $$TMP363;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP362;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP367;
$$TMP367=$$root["print"](($$root["JSON"]).stringify($$root["geti-safe"](x,(new $$root.Symbol("meta")))));
return $$TMP367;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP370=1;
   $$TMP370<arguments.length;
   ++$$TMP370){
      fields[$$TMP370-1]=arguments[$$TMP370];
   }
   var $$TMP368;
$$TMP368=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP369;
$$TMP369=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP369;
}
),fields))));
return $$TMP368;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP371;
   $$TMP371=(s).slice(start,end);
   return $$TMP371;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP372;
$$TMP372=$$root["<"](x,0);
return $$TMP372;
}
);
$$root["neg?"];
$$root["int"]=(function(x){
   var $$TMP373;
   var $$TMP374;
if($$root["neg?"](x)){
$$TMP374=($$root["Math"]).ceil(x);
}
else{
$$TMP374=($$root["Math"]).floor(x);
}
$$TMP373=$$TMP374;
return $$TMP373;
}
);
$$root["int"];
$$root["idiv"]=(function(a,b){
   var $$TMP375;
$$TMP375=$$root["int"]($$root["/"](a,b));
return $$TMP375;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP376;
   var $$TMP377;
if($$root["string?"](x)){
$$TMP377=$$root["="]($$root["geti-safe"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP378;
if($$root["list?"](x)){
$$TMP378=$$root["null?"](x);
}
else{
   var $$TMP379;
   if(true){
$$TMP379=$$root["error"]("Type error in empty?");
}
else{
   $$TMP379=undefined;
}
$$TMP378=$$TMP379;
}
$$TMP377=$$TMP378;
}
$$TMP376=$$TMP377;
return $$TMP376;
}
);
$$root["empty?"];
$$root["with-fields"]=(function(fields,obj){
   var body=Array(arguments.length-2);
   for(var $$TMP383=2;
   $$TMP383<arguments.length;
   ++$$TMP383){
      body[$$TMP383-2]=arguments[$$TMP383];
   }
   var $$TMP380;
   $$TMP380=(function(obj__MINUSsym){
      var $$TMP381;
$$TMP381=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](obj__MINUSsym),$$root["list"](obj),$$root["interleave"](fields,$$root["map"]((function(field){
   var $$TMP382;
$$TMP382=$$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](obj__MINUSsym),$$root["list"](field));
return $$TMP382;
}
),fields)))),body);
return $$TMP381;
}
)($$root["gensym"]());
return $$TMP380;
}
);
$$root["with-fields"];
$$root["setmac!"]($$root["with-fields"]);
$$root["inside?"]=(function(x,x0,x1){
   var $$TMP384;
   var $$TMP385;
if($$root[">="](x,x0)){
   var $$TMP386;
if($$root["<="](x,x1)){
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
return $$TMP384;
}
);
$$root["inside?"];
$$root["clamp"]=(function(x,x0,x1){
   var $$TMP387;
   var $$TMP388;
if($$root["<"](x,x0)){
   $$TMP388=x0;
}
else{
   var $$TMP389;
if($$root[">"](x,x1)){
   $$TMP389=x1;
}
else{
   $$TMP389=x;
}
$$TMP388=$$TMP389;
}
$$TMP387=$$TMP388;
return $$TMP387;
}
);
$$root["clamp"];
$$root["randf"]=(function(min,max){
   var $$TMP390;
$$TMP390=$$root["+"](min,$$root["*"]($$root["-"](max,min),($$root["Math"]).random()));
return $$TMP390;
}
);
$$root["randf"];
$$root["randi"]=(function(min,max){
   var $$TMP391;
$$TMP391=$$root["int"]($$root["randf"](min,max));
return $$TMP391;
}
);
$$root["randi"];
$$root["random-element"]=(function(lst){
   var $$TMP392;
$$TMP392=$$root["nth"]($$root["randi"](0,$$root["count"](lst)),lst);
return $$TMP392;
}
);
$$root["random-element"];
$$root["sqrt"]=(function(x){
   var $$TMP393;
$$TMP393=$$root["call-method-by-name"]($$root["Math"],(new $$root.Symbol("sqrt")),x);
return $$TMP393;
}
);
$$root["sqrt"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP394;
   $$TMP394=(function(self){
      var $$TMP395;
      $$TMP395=(function(__GS19){
         var $$TMP396;
$$root["seti!"](__GS19,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS19,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS19,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS19,(new $$root.Symbol("len")),len);
$$TMP396=__GS19;
return $$TMP396;
}
)(self);
return $$TMP395;
}
)(this);
return $$TMP394;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP397;
   $$TMP397=(function(self){
      var $$TMP398;
$$TMP398=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti-safe"](self,(new $$root.Symbol("start"))),$$root["geti-safe"](self,(new $$root.Symbol("len"))));
return $$TMP398;
}
)(this);
return $$TMP397;
}
));
$$root["lit"]=(function(s){
   var $$TMP399;
$$TMP399=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP399;
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
   var $$TMP400;
   $$TMP400=(function(toks,pos,s){
      var $$TMP401;
      (function(__GS20,__GS21){
         var $$TMP402;
         $$TMP402=(function(recur){
            var $$TMP404;
            var $$TMP405;
            while(true){
               __GS20=true;
               __GS20;
               var $$TMP406;
               {
                  var $$TMP407;
if($$root[">"]($$root["geti-safe"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP408;
   {
      (function(__GS22,res,i,__GS23,__GS24,entry,_){
         var $$TMP409;
         $$TMP409=(function(__GS25,__GS26){
            var $$TMP410;
            $$TMP410=(function(recur){
               var $$TMP412;
               var $$TMP413;
               while(true){
                  __GS25=true;
                  __GS25;
                  var $$TMP414;
                  {
                     var $$TMP415;
                     var $$TMP416;
if($$root["<"](i,__GS23)){
   var $$TMP417;
if($$root["not"]($$root["null?"](__GS24))){
   var $$TMP418;
if($$root["not"](res)){
   $$TMP418=true;
}
else{
   $$TMP418=false;
}
$$TMP417=$$TMP418;
}
else{
   $$TMP417=false;
}
$$TMP416=$$TMP417;
}
else{
   $$TMP416=false;
}
if($$TMP416){
   var $$TMP419;
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
$$TMP419=recur();
}
$$TMP415=$$TMP419;
}
else{
   var $$TMP420;
   {
      _=__GS22;
      _;
      var $$TMP421;
      if(res){
         var $$TMP422;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP423;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP424;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP425;
   var $$TMP426;
   if(c){
      $$TMP426=c;
   }
   else{
$$TMP426=$$root["second"](entry);
}
$$TMP425=$$TMP426;
return $$TMP425;
}
)($$root["geti"]($$root["keywords"],$$root["geti-safe"](res,0))),pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP424=toks;
}
$$TMP423=$$TMP424;
}
else{
   $$TMP423=undefined;
}
$$TMP423;
pos=$$root["+"](pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
$$TMP422=pos;
}
$$TMP421=$$TMP422;
}
else{
$$TMP421=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS22=$$TMP421;
$$TMP420=__GS22;
}
$$TMP415=$$TMP420;
}
$$TMP414=$$TMP415;
}
__GS26=$$TMP414;
__GS26;
var $$TMP427;
if($$root["not"](__GS25)){
   continue;
   $$TMP427=undefined;
}
else{
   $$TMP427=__GS26;
}
$$TMP413=$$TMP427;
break;
}
$$TMP412=$$TMP413;
return $$TMP412;
}
)((function(){
   var $$TMP411;
   __GS25=false;
   $$TMP411=__GS25;
   return $$TMP411;
}
));
return $$TMP410;
}
)(false,undefined);
return $$TMP409;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP408=recur();
}
$$TMP407=$$TMP408;
}
else{
   $$TMP407=undefined;
}
$$TMP406=$$TMP407;
}
__GS21=$$TMP406;
__GS21;
var $$TMP428;
if($$root["not"](__GS20)){
   continue;
   $$TMP428=undefined;
}
else{
   $$TMP428=__GS21;
}
$$TMP405=$$TMP428;
break;
}
$$TMP404=$$TMP405;
return $$TMP404;
}
)((function(){
   var $$TMP403;
   __GS20=false;
   $$TMP403=__GS20;
   return $$TMP403;
}
));
return $$TMP402;
}
)(false,undefined);
$$TMP401=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP401;
}
)([],0,src);
return $$TMP400;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP429;
   $$TMP429=(function(self){
      var $$TMP430;
$$TMP430=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP430;
}
)(this);
return $$TMP429;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP431;
   $$TMP431=(function(self){
      var $$TMP432;
$$TMP432=$$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos"))));
return $$TMP432;
}
)(this);
return $$TMP431;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP433;
   $$TMP433=(function(self){
      var $$TMP434;
      $$TMP434=(function(curr){
         var $$TMP435;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
$$TMP435=curr;
return $$TMP435;
}
)($$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
return $$TMP434;
}
)(this);
return $$TMP433;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP436;
$$TMP436=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP436;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP437;
$$TMP437=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP437;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP438;
   $$TMP438=(function(self){
      var $$TMP439;
      $$TMP439=(function(tok){
         var $$TMP440;
         $$TMP440=(function(__GS27){
            var $$TMP441;
            var $$TMP442;
if($$root["equal?"](__GS27,(new $$root.Symbol("list-open-tok")))){
$$TMP442=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP443;
if($$root["equal?"](__GS27,(new $$root.Symbol("true-tok")))){
   $$TMP443=true;
}
else{
   var $$TMP444;
if($$root["equal?"](__GS27,(new $$root.Symbol("false-tok")))){
   $$TMP444=false;
}
else{
   var $$TMP445;
if($$root["equal?"](__GS27,(new $$root.Symbol("null-tok")))){
   $$TMP445=[];
}
else{
   var $$TMP446;
if($$root["equal?"](__GS27,(new $$root.Symbol("undef-tok")))){
   $$TMP446=undefined;
}
else{
   var $$TMP447;
if($$root["equal?"](__GS27,(new $$root.Symbol("num-tok")))){
$$TMP447=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP448;
if($$root["equal?"](__GS27,(new $$root.Symbol("str-tok")))){
$$TMP448=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP449;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote-tok")))){
$$TMP449=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP450;
if($$root["equal?"](__GS27,(new $$root.Symbol("backquote-tok")))){
$$TMP450=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP451;
if($$root["equal?"](__GS27,(new $$root.Symbol("sym-tok")))){
$$TMP451=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP452;
   if(true){
$$TMP452=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti-safe"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP452=undefined;
}
$$TMP451=$$TMP452;
}
$$TMP450=$$TMP451;
}
$$TMP449=$$TMP450;
}
$$TMP448=$$TMP449;
}
$$TMP447=$$TMP448;
}
$$TMP446=$$TMP447;
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
return $$TMP441;
}
)($$root["geti-safe"](tok,(new $$root.Symbol("type"))));
return $$TMP440;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP439;
}
)(this);
return $$TMP438;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP453;
   $$TMP453=(function(s){
      var $$TMP454;
$$TMP454=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP454;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP453;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP455;
$$TMP455=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP455;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP456;
   $$TMP456=(function(self){
      var $$TMP457;
      $$TMP457=(function(start__MINUSpos){
         var $$TMP458;
         $$TMP458=(function(__GS28,__GS29,lst){
            var $$TMP459;
            $$TMP459=(function(__GS30,__GS31){
               var $$TMP460;
               $$TMP460=(function(recur){
                  var $$TMP462;
                  var $$TMP463;
                  while(true){
                     __GS30=true;
                     __GS30;
                     var $$TMP464;
                     {
                        var $$TMP465;
                        var $$TMP466;
                        var $$TMP467;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP468;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP468=true;
}
else{
   $$TMP468=false;
}
$$TMP467=$$TMP468;
}
else{
   $$TMP467=false;
}
if($$TMP467){
   $$TMP466=true;
}
else{
   $$TMP466=false;
}
if($$TMP466){
   var $$TMP469;
   {
__GS29=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS29);
__GS28=__GS29;
__GS28;
$$TMP469=recur();
}
$$TMP465=$$TMP469;
}
else{
   var $$TMP470;
   {
__GS28=$$root["reverse"](__GS29);
__GS28;
lst=__GS28;
lst;
var $$TMP471;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP471=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP471=$$root["error"]("Unmatched paren!");
}
__GS28=$$TMP471;
$$TMP470=__GS28;
}
$$TMP465=$$TMP470;
}
$$TMP464=$$TMP465;
}
__GS31=$$TMP464;
__GS31;
var $$TMP472;
if($$root["not"](__GS30)){
   continue;
   $$TMP472=undefined;
}
else{
   $$TMP472=__GS31;
}
$$TMP463=$$TMP472;
break;
}
$$TMP462=$$TMP463;
return $$TMP462;
}
)((function(){
   var $$TMP461;
   __GS30=false;
   $$TMP461=__GS30;
   return $$TMP461;
}
));
return $$TMP460;
}
)(false,undefined);
return $$TMP459;
}
)(undefined,[],undefined);
return $$TMP458;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP457;
}
)(this);
return $$TMP456;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP473;
   $$TMP473=(function(self){
      var $$TMP474;
      $$TMP474=(function(__GS32,__GS33,lst){
         var $$TMP475;
         $$TMP475=(function(__GS34,__GS35){
            var $$TMP476;
            $$TMP476=(function(recur){
               var $$TMP478;
               var $$TMP479;
               while(true){
                  __GS34=true;
                  __GS34;
                  var $$TMP480;
                  {
                     var $$TMP481;
                     var $$TMP482;
                     var $$TMP483;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP484;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP484=true;
}
else{
   $$TMP484=false;
}
$$TMP483=$$TMP484;
}
else{
   $$TMP483=false;
}
if($$TMP483){
   $$TMP482=true;
}
else{
   $$TMP482=false;
}
if($$TMP482){
   var $$TMP485;
   {
__GS33=$$root["cons"]((function(__GS36){
   var $$TMP486;
   var $$TMP487;
if($$root["equal?"](__GS36,(new $$root.Symbol("unquote-tok")))){
   var $$TMP488;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP488=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP487=$$TMP488;
}
else{
   var $$TMP489;
if($$root["equal?"](__GS36,(new $$root.Symbol("splice-tok")))){
   var $$TMP490;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP490=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP489=$$TMP490;
}
else{
   var $$TMP491;
   if(true){
$$TMP491=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP491=undefined;
}
$$TMP489=$$TMP491;
}
$$TMP487=$$TMP489;
}
$$TMP486=$$TMP487;
return $$TMP486;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS33);
__GS32=__GS33;
__GS32;
$$TMP485=recur();
}
$$TMP481=$$TMP485;
}
else{
   var $$TMP492;
   {
__GS32=$$root["reverse"](__GS33);
__GS32;
lst=__GS32;
lst;
var $$TMP493;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP493=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP493=$$root["error"]("Unmatched paren!");
}
__GS32=$$TMP493;
$$TMP492=__GS32;
}
$$TMP481=$$TMP492;
}
$$TMP480=$$TMP481;
}
__GS35=$$TMP480;
__GS35;
var $$TMP494;
if($$root["not"](__GS34)){
   continue;
   $$TMP494=undefined;
}
else{
   $$TMP494=__GS35;
}
$$TMP479=$$TMP494;
break;
}
$$TMP478=$$TMP479;
return $$TMP478;
}
)((function(){
   var $$TMP477;
   __GS34=false;
   $$TMP477=__GS34;
   return $$TMP477;
}
));
return $$TMP476;
}
)(false,undefined);
return $$TMP475;
}
)(undefined,[],undefined);
return $$TMP474;
}
)(this);
return $$TMP473;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP495;
   $$TMP495=(function(self){
      var $$TMP496;
      var $$TMP497;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP498;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP498=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP497=$$TMP498;
}
else{
$$TMP497=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP496=$$TMP497;
return $$TMP496;
}
)(this);
return $$TMP495;
}
));
$$root["parse"]=(function(toks){
   var $$TMP499;
   $$TMP499=(function(p){
      var $$TMP500;
      $$TMP500=(function(__GS37,__GS38){
         var $$TMP501;
         $$TMP501=(function(__GS39,__GS40){
            var $$TMP502;
            $$TMP502=(function(recur){
               var $$TMP504;
               var $$TMP505;
               while(true){
                  __GS39=true;
                  __GS39;
                  var $$TMP506;
                  {
                     var $$TMP507;
                     var $$TMP508;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP508=true;
}
else{
   $$TMP508=false;
}
if($$TMP508){
   var $$TMP509;
   {
__GS38=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS38);
__GS37=__GS38;
__GS37;
$$TMP509=recur();
}
$$TMP507=$$TMP509;
}
else{
   var $$TMP510;
   {
__GS37=$$root["reverse"](__GS38);
$$TMP510=__GS37;
}
$$TMP507=$$TMP510;
}
$$TMP506=$$TMP507;
}
__GS40=$$TMP506;
__GS40;
var $$TMP511;
if($$root["not"](__GS39)){
   continue;
   $$TMP511=undefined;
}
else{
   $$TMP511=__GS40;
}
$$TMP505=$$TMP511;
break;
}
$$TMP504=$$TMP505;
return $$TMP504;
}
)((function(){
   var $$TMP503;
   __GS39=false;
   $$TMP503=__GS39;
   return $$TMP503;
}
));
return $$TMP502;
}
)(false,undefined);
return $$TMP501;
}
)(undefined,[]);
return $$TMP500;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP499;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS41){
   var $$TMP512;
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
$$TMP512=__GS41;
return $$TMP512;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP513;
$$TMP513=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP513;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP514;
$$TMP514=$$root["geti"]($$root["mangling-table"],x);
return $$TMP514;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP515;
$$TMP515=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP515;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP516;
   $$TMP516=(function(__GS42){
      var $$TMP517;
$$root["seti!"](__GS42,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS42,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP517=__GS42;
return $$TMP517;
}
)($$root["hashmap"]());
return $$TMP516;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP518;
   $$TMP518=(function(__GS43){
      var $$TMP519;
$$root["seti!"](__GS43,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS43,(new $$root.Symbol("mappings")),mappings);
$$TMP519=__GS43;
return $$TMP519;
}
)($$root["hashmap"]());
return $$TMP518;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP520;
$$TMP520=$$root["make-tc-str"](s,[]);
return $$TMP520;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP521;
   $$TMP521=(function(adder){
      var $$TMP523;
$$TMP523=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP523;
}
)((function(x){
   var $$TMP522;
$$TMP522=$$root["+"](x,n);
return $$TMP522;
}
));
return $$TMP521;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP524;
   var $$TMP525;
if($$root["string?"](b)){
$$TMP525=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),b),$$root["geti-safe"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP525=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),$$root["geti-safe"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti-safe"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP526;
$$TMP526=$$root["offset-source-mapping"](e,$$root["geti-safe"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP526;
}
),$$root["geti-safe"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP524=$$TMP525;
return $$TMP524;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP528=0;
   $$TMP528<arguments.length;
   ++$$TMP528){
      args[$$TMP528-0]=arguments[$$TMP528];
   }
   var $$TMP527;
$$TMP527=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP527;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP529;
$$TMP529=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP529;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP546=2;
   $$TMP546<arguments.length;
   ++$$TMP546){
      args[$$TMP546-2]=arguments[$$TMP546];
   }
   var $$TMP530;
   $$TMP530=(function(rx){
      var $$TMP531;
      $$TMP531=(function(__GS44,accum,__GS45,x,n,_){
         var $$TMP532;
         $$TMP532=(function(__GS46,__GS47){
            var $$TMP533;
            $$TMP533=(function(recur){
               var $$TMP535;
               var $$TMP536;
               while(true){
                  __GS46=true;
                  __GS46;
                  var $$TMP537;
                  {
                     var $$TMP538;
                     var $$TMP539;
if($$root["not"]($$root["null?"](__GS45))){
   $$TMP539=true;
}
else{
   $$TMP539=false;
}
if($$TMP539){
   var $$TMP540;
   {
x=$$root["car"](__GS45);
x;
var $$TMP541;
if($$root["even?"](n)){
   $$TMP541=x;
}
else{
$$TMP541=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP541);
__GS44=accum;
__GS44;
__GS45=$$root["cdr"](__GS45);
__GS45;
n=$$root["+"](n,1);
n;
$$TMP540=recur();
}
$$TMP538=$$TMP540;
}
else{
   var $$TMP542;
   {
      _=__GS44;
      _;
      var $$TMP543;
      if(source__MINUSpos){
         var $$TMP544;
         {
$$TMP544=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti-safe"]($$root["geti-safe"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti-safe"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP543=$$TMP544;
}
else{
   $$TMP543=undefined;
}
$$TMP543;
__GS44=accum;
$$TMP542=__GS44;
}
$$TMP538=$$TMP542;
}
$$TMP537=$$TMP538;
}
__GS47=$$TMP537;
__GS47;
var $$TMP545;
if($$root["not"](__GS46)){
   continue;
   $$TMP545=undefined;
}
else{
   $$TMP545=__GS47;
}
$$TMP536=$$TMP545;
break;
}
$$TMP535=$$TMP536;
return $$TMP535;
}
)((function(){
   var $$TMP534;
   __GS46=false;
   $$TMP534=__GS46;
   return $$TMP534;
}
));
return $$TMP533;
}
)(false,undefined);
return $$TMP532;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP531;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP530;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP547;
   $$TMP547=(function(self){
      var $$TMP548;
      $$TMP548=(function(__GS48){
         var $$TMP549;
$$root["seti!"](__GS48,"root",root);
$$root["seti!"](__GS48,"next-var-suffix",0);
$$TMP549=__GS48;
return $$TMP549;
}
)(self);
return $$TMP548;
}
)(this);
return $$TMP547;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP550;
   $$TMP550=(function(self){
      var $$TMP551;
      $$TMP551=(function(out){
         var $$TMP552;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP552=out;
return $$TMP552;
}
)($$root["str"]("$$TMP",$$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP551;
}
)(this);
return $$TMP550;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP553;
   var $$TMP554;
if($$root["in?"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP554=$$root["mangle-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP554=$$root["str"]("$$root[\"",$$root["geti-safe"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP553=$$TMP554;
return $$TMP553;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP555;
   $$TMP555=(function(self){
      var $$TMP556;
      var $$TMP557;
if($$root["="](x,true)){
$$TMP557=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP558;
if($$root["="](x,false)){
$$TMP558=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP559;
if($$root["null?"](x)){
$$TMP559=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP560;
if($$root["="](x,undefined)){
$$TMP560=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP561;
if($$root["symbol?"](x)){
$$TMP561=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP562;
if($$root["string?"](x)){
$$TMP562=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP563;
   if(true){
$$TMP563=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP563=undefined;
}
$$TMP562=$$TMP563;
}
$$TMP561=$$TMP562;
}
$$TMP560=$$TMP561;
}
$$TMP559=$$TMP560;
}
$$TMP558=$$TMP559;
}
$$TMP557=$$TMP558;
}
$$TMP556=$$TMP557;
return $$TMP556;
}
)(this);
return $$TMP555;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP564;
   $$TMP564=(function(self){
      var $$TMP565;
      $$TMP565=(function(__GS49){
         var $$TMP566;
         $$TMP566=(function(fun,args){
            var $$TMP567;
            $$TMP567=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP568;
$$TMP568=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP568;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP567;
}
)($$root["nth"](0,__GS49),$$root["drop"](1,__GS49));
return $$TMP566;
}
)(lst);
return $$TMP565;
}
)(this);
return $$TMP564;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP569;
   $$TMP569=(function(self){
      var $$TMP570;
      $$TMP570=(function(__GS50){
         var $$TMP571;
         $$TMP571=(function(fun,args){
            var $$TMP572;
            $$TMP572=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP573;
$$TMP573=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP573;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP572;
}
)($$root["nth"](1,__GS50),$$root["drop"](2,__GS50));
return $$TMP571;
}
)(lst);
return $$TMP570;
}
)(this);
return $$TMP569;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP574;
   $$TMP574=(function(self){
      var $$TMP575;
      $$TMP575=(function(__GS51){
         var $$TMP576;
         $$TMP576=(function(method,obj,args){
            var $$TMP577;
            $$TMP577=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP578;
$$TMP578=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP578;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP577;
}
)($$root["nth"](0,__GS51),$$root["nth"](1,__GS51),$$root["drop"](2,__GS51));
return $$TMP576;
}
)(lst);
return $$TMP575;
}
)(this);
return $$TMP574;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP579;
   $$TMP579=(function(self){
      var $$TMP580;
      $$TMP580=(function(compiled__MINUSbody,reducer){
         var $$TMP582;
$$TMP582=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP582;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP581;
$$TMP581=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP581;
}
));
return $$TMP580;
}
)(this);
return $$TMP579;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP583;
$$TMP583=$$root["="]($$root["geti-safe"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP583;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP584;
   var $$TMP585;
if($$root["is-vararg?"](sym)){
$$TMP585=$$root["call-method-by-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP585=$$root["geti-safe"](sym,(new $$root.Symbol("name")));
}
$$TMP584=$$TMP585;
return $$TMP584;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP586;
$$TMP586=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP587;
$$TMP587=$$root["mangle-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))));
return $$TMP587;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP586;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP588;
   $$TMP588=(function(self){
      var $$TMP589;
      var $$TMP590;
if($$root["not"]($$root["null?"](args))){
   var $$TMP591;
   {
$$TMP591=$$root["last"](args);
}
$$TMP590=$$TMP591;
}
else{
   $$TMP590=undefined;
}
$$TMP589=(function(last__MINUSarg){
   var $$TMP592;
   var $$TMP593;
   var $$TMP594;
   if(last__MINUSarg){
      var $$TMP595;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP595=true;
}
else{
   $$TMP595=false;
}
$$TMP594=$$TMP595;
}
else{
   $$TMP594=false;
}
if($$TMP594){
$$TMP593=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti-safe"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP593="";
}
$$TMP592=$$TMP593;
return $$TMP592;
}
)($$TMP590);
return $$TMP589;
}
)(this);
return $$TMP588;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP596;
   $$TMP596=(function(self){
      var $$TMP597;
      $$TMP597=(function(__GS52){
         var $$TMP598;
         $$TMP598=(function(__GS53){
            var $$TMP599;
            $$TMP599=(function(args,body){
               var $$TMP600;
               $$TMP600=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP602;
                  $$TMP602=(function(compiled__MINUSbody){
                     var $$TMP603;
$$TMP603=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP603;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP602;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP601;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP601=accum;
return $$TMP601;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP600;
}
)($$root["drop"](0,__GS53),$$root["drop"](2,__GS52));
return $$TMP599;
}
)($$root["nth"](1,__GS52));
return $$TMP598;
}
)(lst);
return $$TMP597;
}
)(this);
return $$TMP596;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP604;
   $$TMP604=(function(self){
      var $$TMP605;
      $$TMP605=(function(__GS54){
         var $$TMP606;
         $$TMP606=(function(body){
            var $$TMP607;
            $$TMP607=(function(value__MINUSvar__MINUSname){
               var $$TMP608;
               $$TMP608=(function(compiled__MINUSbody){
                  var $$TMP609;
$$TMP609=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP609;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP608;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP607;
}
)($$root["drop"](1,__GS54));
return $$TMP606;
}
)(lst);
return $$TMP605;
}
)(this);
return $$TMP604;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP610;
   $$TMP610=(function(self){
      var $$TMP611;
$$TMP611=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP611;
}
)(this);
return $$TMP610;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-break")),(function(lexenv,lst){
   var $$TMP612;
   $$TMP612=(function(self){
      var $$TMP613;
$$TMP613=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("break;"));
return $$TMP613;
}
)(this);
return $$TMP612;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-return")),(function(lexenv,lst){
   var $$TMP614;
   $$TMP614=(function(self){
      var $$TMP615;
      var $$TMP616;
if($$root["null?"]($$root["cdr"](lst))){
$$TMP616=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("return;"));
}
else{
   var $$TMP617;
if($$root["null?"]($$root["cdr"]($$root["cdr"](lst)))){
   $$TMP617=(function(compiled__MINUSret__MINUSval){
      var $$TMP618;
$$TMP618=$$root["list"]($$root["str->tc"]("undefined"),$$root["format-tc"](undefined,"%0return %1;",$$root["second"](compiled__MINUSret__MINUSval),$$root["first"](compiled__MINUSret__MINUSval)));
return $$TMP618;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["second"](lst)));
}
else{
   var $$TMP619;
   if(true){
$$TMP619=$$root["error"]("Can't return more than on value!");
}
else{
   $$TMP619=undefined;
}
$$TMP617=$$TMP619;
}
$$TMP616=$$TMP617;
}
$$TMP615=$$TMP616;
return $$TMP615;
}
)(this);
return $$TMP614;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP620;
   $$TMP620=(function(self){
      var $$TMP621;
      $$TMP621=(function(__GS55){
         var $$TMP622;
         $$TMP622=(function(body){
            var $$TMP623;
            $$TMP623=(function(value__MINUSvar__MINUSname){
               var $$TMP624;
               $$TMP624=(function(compiled__MINUSbody){
                  var $$TMP625;
$$TMP625=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP625;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP624;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP623;
}
)($$root["drop"](1,__GS55));
return $$TMP622;
}
)(lst);
return $$TMP621;
}
)(this);
return $$TMP620;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP626;
   $$TMP626=(function(self){
      var $$TMP627;
      $$TMP627=(function(__GS56){
         var $$TMP628;
         $$TMP628=(function(c,t,f){
            var $$TMP629;
            $$TMP629=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP630;
$$TMP630=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP630;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP629;
}
)($$root["nth"](1,__GS56),$$root["nth"](2,__GS56),$$root["nth"](3,__GS56));
return $$TMP628;
}
)(lst);
return $$TMP627;
}
)(this);
return $$TMP626;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP631;
   $$TMP631=(function(self){
      var $$TMP632;
      var $$TMP633;
if($$root["symbol?"](x)){
$$TMP633=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti-safe"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP633=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP632=$$TMP633;
return $$TMP632;
}
)(this);
return $$TMP631;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP634;
   $$TMP634=(function(self){
      var $$TMP635;
$$TMP635=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP635;
}
)(this);
return $$TMP634;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP636;
   $$TMP636=(function(self){
      var $$TMP637;
      var $$TMP638;
if($$root["atom?"](x)){
$$TMP638=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP638=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP637=$$TMP638;
return $$TMP637;
}
)(this);
return $$TMP636;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP639;
   $$TMP639=(function(self){
      var $$TMP640;
      $$TMP640=(function(__GS57){
         var $$TMP641;
         $$TMP641=(function(name,value){
            var $$TMP642;
            $$TMP642=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP643;
$$TMP643=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP643;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP642;
}
)($$root["nth"](1,__GS57),$$root["nth"](2,__GS57));
return $$TMP641;
}
)(lst);
return $$TMP640;
}
)(this);
return $$TMP639;
}
));
$$root["annotate-macroexpansion"]=(function(source__MINUSpos,x){
   var $$TMP644;
   var $$TMP645;
   var $$TMP646;
if($$root["list?"](x)){
   var $$TMP647;
if($$root["not"]($$root["null?"](x))){
   var $$TMP648;
if($$root["not"]($$root["equal?"]($$root["car"](x),(new $$root.Symbol("quote"))))){
   var $$TMP649;
if($$root["="]($$root["get-source-pos"](x),undefined)){
   $$TMP649=true;
}
else{
   $$TMP649=false;
}
$$TMP648=$$TMP649;
}
else{
   $$TMP648=false;
}
$$TMP647=$$TMP648;
}
else{
   $$TMP647=false;
}
$$TMP646=$$TMP647;
}
else{
   $$TMP646=false;
}
if($$TMP646){
$$TMP645=$$root["deep-assoc!"]($$root["map"]($$root["partial"]($$root["annotate-macroexpansion"],source__MINUSpos),x),$$root.list((new $$root.Symbol("meta"))),(new $$root.Symbol("source-pos")),source__MINUSpos);
}
else{
   $$TMP645=x;
}
$$TMP644=$$TMP645;
return $$TMP644;
}
);
$$root["annotate-macroexpansion"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP650;
   $$TMP650=(function(self){
      var $$TMP651;
      $$TMP651=(function(__GS58){
         var $$TMP652;
         $$TMP652=(function(name,args){
            var $$TMP653;
$$TMP653=$$root["annotate-macroexpansion"]($$root["get-source-pos"](expr),$$root["apply"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),args));
return $$TMP653;
}
)($$root["nth"](0,__GS58),$$root["drop"](1,__GS58));
return $$TMP652;
}
)(expr);
return $$TMP651;
}
)(this);
return $$TMP650;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP654;
   $$TMP654=(function(self){
      var $$TMP655;
      var $$TMP656;
if($$root["in?"](name,$$root["geti-safe"](self,(new $$root.Symbol("root"))))){
   var $$TMP657;
if($$root["geti"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP657=true;
}
else{
   $$TMP657=false;
}
$$TMP656=$$TMP657;
}
else{
   $$TMP656=false;
}
$$TMP655=$$TMP656;
return $$TMP655;
}
)(this);
return $$TMP654;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP658;
   $$TMP658=(function(self){
      var $$TMP659;
      var $$TMP660;
      var $$TMP661;
if($$root["list?"](expr)){
   var $$TMP662;
if($$root["not"]($$root["null?"](expr))){
   $$TMP662=true;
}
else{
   $$TMP662=false;
}
$$TMP661=$$TMP662;
}
else{
   $$TMP661=false;
}
if($$TMP661){
   $$TMP660=(function(first){
      var $$TMP663;
      var $$TMP664;
if($$root["symbol?"](first)){
   $$TMP664=(function(__GS59){
      var $$TMP665;
      var $$TMP666;
if($$root["equal?"](__GS59,(new $$root.Symbol("lambda")))){
$$TMP666=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP667;
if($$root["equal?"](__GS59,(new $$root.Symbol("progn")))){
$$TMP667=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP668;
if($$root["equal?"](__GS59,(new $$root.Symbol("dumb-loop")))){
$$TMP668=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP669;
if($$root["equal?"](__GS59,(new $$root.Symbol("continue")))){
$$TMP669=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP670;
if($$root["equal?"](__GS59,(new $$root.Symbol("break")))){
$$TMP670=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-break")),lexenv,expr);
}
else{
   var $$TMP671;
if($$root["equal?"](__GS59,(new $$root.Symbol("return")))){
$$TMP671=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-return")),lexenv,expr);
}
else{
   var $$TMP672;
if($$root["equal?"](__GS59,(new $$root.Symbol("new")))){
$$TMP672=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP673;
if($$root["equal?"](__GS59,(new $$root.Symbol("if")))){
$$TMP673=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP674;
if($$root["equal?"](__GS59,(new $$root.Symbol("quote")))){
$$TMP674=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP675;
if($$root["equal?"](__GS59,(new $$root.Symbol("setv!")))){
$$TMP675=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP676;
if($$root["equal?"](__GS59,(new $$root.Symbol("def")))){
$$TMP676=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP677;
   if(true){
      var $$TMP678;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti-safe"](first,(new $$root.Symbol("name"))))){
$$TMP678=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP679;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP679=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP680;
   if(true){
$$TMP680=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP680=undefined;
}
$$TMP679=$$TMP680;
}
$$TMP678=$$TMP679;
}
$$TMP677=$$TMP678;
}
else{
   $$TMP677=undefined;
}
$$TMP676=$$TMP677;
}
$$TMP675=$$TMP676;
}
$$TMP674=$$TMP675;
}
$$TMP673=$$TMP674;
}
$$TMP672=$$TMP673;
}
$$TMP671=$$TMP672;
}
$$TMP670=$$TMP671;
}
$$TMP669=$$TMP670;
}
$$TMP668=$$TMP669;
}
$$TMP667=$$TMP668;
}
$$TMP666=$$TMP667;
}
$$TMP665=$$TMP666;
return $$TMP665;
}
)(first);
}
else{
$$TMP664=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP663=$$TMP664;
return $$TMP663;
}
)($$root["car"](expr));
}
else{
$$TMP660=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP659=$$TMP660;
return $$TMP659;
}
)(this);
return $$TMP658;
}
));
$$root["compile"]=(function(expr){
   var $$TMP681;
   $$TMP681=(function(c){
      var $$TMP682;
      $$TMP682=(function(t){
         var $$TMP683;
$$TMP683=$$root["str"]($$root["geti-safe"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti-safe"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP683;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP682;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP681;
}
);
$$root["compile"];
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
   var $$TMP684;
$$TMP684=$$root["str"]($$root["geti-safe"]($$root["second"](pair),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](pair),(new $$root.Symbol("data"))));
return $$TMP684;
}
);
$$root["gen-jstr"];
$$root["default-lexenv"]=(function(){
   var $$TMP685;
   $$TMP685=(function(__GS60){
      var $$TMP686;
$$root["seti!"](__GS60,"this",true);
$$TMP686=__GS60;
return $$TMP686;
}
)($$root["object"]());
return $$TMP685;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP687;
   $$TMP687=(function(self){
      var $$TMP688;
      $$TMP688=(function(root,sandbox){
         var $$TMP689;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP690;
$$TMP690=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP690;
}
));
$$root["seti!"](root,"load-file",(function(path){
   var $$TMP691;
$$TMP691=$$root["call-method-by-name"](self,(new $$root.Symbol("load-file")),path);
return $$TMP691;
}
));
$$TMP689=(function(__GS61){
   var $$TMP692;
$$root["seti!"](__GS61,"root",root);
$$root["seti!"](__GS61,"dir-stack",$$root["list"](($$root["process"]).cwd()));
$$root["seti!"](__GS61,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP692=__GS61;
return $$TMP692;
}
)(self);
return $$TMP689;
}
)($$root["make-default-ns"](),$$root["object"]());
return $$TMP688;
}
)(this);
return $$TMP687;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP693;
   $$TMP693=(function(self){
      var $$TMP694;
      $$TMP694=(function(tmp){
         var $$TMP695;
$$TMP695=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
return $$TMP695;
}
)($$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP694;
}
)(this);
return $$TMP693;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP696;
   $$TMP696=(function(self){
      var $$TMP697;
      $$TMP697=(function(forms){
         var $$TMP698;
         $$TMP698=(function(__GS62,__GS63,form){
            var $$TMP699;
            $$TMP699=(function(__GS64,__GS65){
               var $$TMP700;
               $$TMP700=(function(recur){
                  var $$TMP702;
                  var $$TMP703;
                  while(true){
                     __GS64=true;
                     __GS64;
                     var $$TMP704;
                     {
                        var $$TMP705;
                        var $$TMP706;
if($$root["not"]($$root["null?"](__GS63))){
   $$TMP706=true;
}
else{
   $$TMP706=false;
}
if($$TMP706){
   var $$TMP707;
   {
form=$$root["car"](__GS63);
form;
__GS62=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS62;
__GS63=$$root["cdr"](__GS63);
__GS63;
$$TMP707=recur();
}
$$TMP705=$$TMP707;
}
else{
   var $$TMP708;
   {
      $$TMP708=__GS62;
   }
   $$TMP705=$$TMP708;
}
$$TMP704=$$TMP705;
}
__GS65=$$TMP704;
__GS65;
var $$TMP709;
if($$root["not"](__GS64)){
   continue;
   $$TMP709=undefined;
}
else{
   $$TMP709=__GS65;
}
$$TMP703=$$TMP709;
break;
}
$$TMP702=$$TMP703;
return $$TMP702;
}
)((function(){
   var $$TMP701;
   __GS64=false;
   $$TMP701=__GS64;
   return $$TMP701;
}
));
return $$TMP700;
}
)(false,undefined);
return $$TMP699;
}
)(undefined,forms,[]);
return $$TMP698;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP697;
}
)(this);
return $$TMP696;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("load-file")),(function(path){
   var $$TMP710;
   $$TMP710=(function(self){
      var $$TMP711;
      $$TMP711=undefined;
      return $$TMP711;
   }
   )(this);
   return $$TMP710;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP712;
   $$TMP712=(function(self){
      var $$TMP713;
$$TMP713=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["gen-jstr"](compilation__MINUSresult));
return $$TMP713;
}
)(this);
return $$TMP712;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP714;
   $$TMP714=(function(self){
      var $$TMP715;
      $$TMP715=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP716;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP717;
   $$TMP717=(function(r){
      var $$TMP718;
      var $$TMP719;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   var $$TMP720;
   {
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti-safe"](r,(new $$root.Symbol("code"))));
r;
$$TMP720=$$root["seti!"](target,name,r);
}
$$TMP719=$$TMP720;
}
else{
   $$TMP719=undefined;
}
$$TMP719;
$$TMP718=r;
return $$TMP718;
}
)($$root["geti"](target,name));
return $$TMP717;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP721;
$$TMP721=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP721;
}
));
$$root["seti!"](root,"*ns*",$$root["geti-safe"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP722;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP722=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP722;
}
));
$$TMP716=$$root["call-method"]($$root["geti-safe"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP716;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP715;
}
)(this);
return $$TMP714;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP723;
   $$TMP723=(function(self){
      var $$TMP724;
      $$TMP724=(function(lexenv){
         var $$TMP725;
         $$TMP725=(function(__GS66){
            var $$TMP726;
            var $$TMP727;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("def"))),(new $$root.Symbol("name")),(new $$root.Symbol("val"))))){
   $$TMP727=(function(__GS67){
      var $$TMP728;
      $$TMP728=(function(name,val){
         var $$TMP729;
         $$TMP729=(function(tmp){
            var $$TMP730;
$$root["seti!"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP730=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP730;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP729;
}
)($$root["nth"](1,__GS67),$$root["nth"](2,__GS67));
return $$TMP728;
}
)(__GS66);
}
else{
   var $$TMP731;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("setmac!"))),(new $$root.Symbol("name"))))){
   $$TMP731=(function(__GS68){
      var $$TMP732;
      $$TMP732=(function(name){
         var $$TMP733;
         $$TMP733=(function(tmp){
            var $$TMP734;
$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
$$TMP734=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP734;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP733;
}
)($$root["nth"](1,__GS68));
return $$TMP732;
}
)(__GS66);
}
else{
   var $$TMP735;
if($$root["matches?"](__GS66,$$root.list($$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("lambda"))),$$root.list((new $$root.Symbol("&args"))),(new $$root.Symbol("&body")))))){
   $$TMP735=(function(__GS69){
      var $$TMP736;
      $$TMP736=(function(__GS70){
         var $$TMP737;
         $$TMP737=(function(__GS71){
            var $$TMP738;
            $$TMP738=(function(args,body){
               var $$TMP739;
$$TMP739=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP739;
}
)($$root["drop"](0,__GS71),$$root["drop"](2,__GS70));
return $$TMP738;
}
)($$root["nth"](1,__GS70));
return $$TMP737;
}
)($$root["nth"](0,__GS69));
return $$TMP736;
}
)(__GS66);
}
else{
   var $$TMP740;
if($$root["matches?"](__GS66,$$root.list((new $$root.Symbol("name")),(new $$root.Symbol("&args"))))){
   $$TMP740=(function(__GS72){
      var $$TMP741;
      $$TMP741=(function(name,args){
         var $$TMP742;
         var $$TMP743;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP743=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP743=(function(tmp){
      var $$TMP744;
$$TMP744=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP744;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP742=$$TMP743;
return $$TMP742;
}
)($$root["nth"](0,__GS72),$$root["drop"](1,__GS72));
return $$TMP741;
}
)(__GS66);
}
else{
   var $$TMP745;
if($$root["matches?"](__GS66,(new $$root.Symbol("any")))){
   $$TMP745=(function(any){
      var $$TMP746;
      $$TMP746=(function(tmp){
         var $$TMP747;
$$TMP747=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP747;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP746;
}
)(__GS66);
}
else{
   var $$TMP748;
   if(true){
$$TMP748=$$root["error"]("Fell out of case!");
}
else{
   $$TMP748=undefined;
}
$$TMP745=$$TMP748;
}
$$TMP740=$$TMP745;
}
$$TMP735=$$TMP740;
}
$$TMP731=$$TMP735;
}
$$TMP727=$$TMP731;
}
$$TMP726=$$TMP727;
return $$TMP726;
}
)(e);
return $$TMP725;
}
)($$root["default-lexenv"]());
return $$TMP724;
}
)(this);
return $$TMP723;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP749;
   $$TMP749=(function(self){
      var $$TMP750;
$$TMP750=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP750;
}
)(this);
return $$TMP749;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
