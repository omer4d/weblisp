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
$$TMP98=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](s),$$root["list"]($$root["symbol"]($$root["str"]("_",$$root["geti-safe"](s,(new $$root.Symbol("name")))))));
return $$TMP98;
}
),binding__MINUSnames),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("dumb-loop"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](true))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](res__MINUSsym),body)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"](done__MINUSflag__MINUSsym))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("continue"))))),$$root["list"](res__MINUSsym))))))));
return $$TMP97;
}
)($$root["every-nth"](2,bindings),$$root["map"]((function(s){
   var $$TMP96;
$$TMP96=$$root["symbol"]($$root["str"]("_",$$root["geti-safe"](s,(new $$root.Symbol("name")))));
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
if($$root["null?"](rem)){
$$TMP106=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP107;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP107=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP107=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP106=$$TMP107;
}
__GS2=$$TMP106;
__GS2;
var $$TMP108;
if($$root["not"](__GS1)){
   continue;
   $$TMP108=undefined;
}
else{
   $$TMP108=__GS2;
}
$$TMP105=$$TMP108;
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
   for(var $$TMP110=1;
   $$TMP110<arguments.length;
   ++$$TMP110){
      body[$$TMP110-1]=arguments[$$TMP110];
   }
   var $$TMP109;
$$TMP109=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP109;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP112=3;
   $$TMP112<arguments.length;
   ++$$TMP112){
      body[$$TMP112-3]=arguments[$$TMP112];
   }
   var $$TMP111;
$$TMP111=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP111;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP115=1;
   $$TMP115<arguments.length;
   ++$$TMP115){
      args[$$TMP115-1]=arguments[$$TMP115];
   }
   var $$TMP113;
   $$TMP113=(function(instance){
      var $$TMP114;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP114=instance;
return $$TMP114;
}
)($$root["object"](proto));
return $$TMP113;
}
);
$$root["make-instance"];
$$root["geti-safe"]=(function(obj,name){
   var $$TMP116;
   var $$TMP117;
if($$root["in?"](name,obj)){
$$TMP117=$$root["geti"](obj,name);
}
else{
$$TMP117=$$root["error"]($$root["str"]("Property '",name,"' does not exist in ",obj));
}
$$TMP116=$$TMP117;
return $$TMP116;
}
);
$$root["geti-safe"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP119=2;
   $$TMP119<arguments.length;
   ++$$TMP119){
      args[$$TMP119-2]=arguments[$$TMP119];
   }
   var $$TMP118;
$$TMP118=$$root["apply-method"]($$root["geti-safe"](obj,name),obj,args);
return $$TMP118;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP120;
   var $$TMP121;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP121=obj__MINUSname;
}
else{
   var $$TMP122;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP122=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP122=$$root["concat"]($$root["list"]((new $$root.Symbol("geti-safe"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP121=$$TMP122;
}
$$TMP120=$$TMP121;
return $$TMP120;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP124=1;
   $$TMP124<arguments.length;
   ++$$TMP124){
      fields[$$TMP124-1]=arguments[$$TMP124];
   }
   var $$TMP123;
$$TMP123=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP123;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP125;
   var $$TMP126;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP126=obj__MINUSname;
}
else{
$$TMP126=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP125=$$TMP126;
return $$TMP125;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP128=1;
   $$TMP128<arguments.length;
   ++$$TMP128){
      fields[$$TMP128-1]=arguments[$$TMP128];
   }
   var $$TMP127;
$$TMP127=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP127;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP129;
$$TMP129=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP129;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP130;
   var $$TMP131;
if($$root["null?"](a)){
$$TMP131=$$root["null?"](b);
}
else{
   var $$TMP132;
if($$root["symbol?"](a)){
   var $$TMP133;
if($$root["symbol?"](b)){
   var $$TMP134;
if($$root["="]($$root["geti-safe"](a,(new $$root.Symbol("name"))),$$root["geti-safe"](b,(new $$root.Symbol("name"))))){
   $$TMP134=true;
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
   var $$TMP135;
if($$root["atom?"](a)){
$$TMP135=$$root["="](a,b);
}
else{
   var $$TMP136;
if($$root["list?"](a)){
   var $$TMP137;
if($$root["list?"](b)){
   var $$TMP138;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP139;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
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
}
else{
   $$TMP137=false;
}
$$TMP136=$$TMP137;
}
else{
   $$TMP136=undefined;
}
$$TMP135=$$TMP136;
}
$$TMP132=$$TMP135;
}
$$TMP131=$$TMP132;
}
$$TMP130=$$TMP131;
return $$TMP130;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP140;
   $$TMP140=(function(res){
      var $$TMP149;
$$TMP149=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP149;
}
)((function(__GS3,__GS4,l1,l2){
   var $$TMP141;
   $$TMP141=(function(recur){
      var $$TMP143;
      var $$TMP144;
      while(true){
         __GS3=true;
         __GS3;
         var $$TMP145;
         if((function(c){
            var $$TMP146;
            var $$TMP147;
            if(c){
               $$TMP147=c;
            }
            else{
$$TMP147=p($$root["car"](l2));
}
$$TMP146=$$TMP147;
return $$TMP146;
}
)($$root["null?"](l2))){
$$TMP145=$$root["list"](l1,l2);
}
else{
$$TMP145=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
__GS4=$$TMP145;
__GS4;
var $$TMP148;
if($$root["not"](__GS3)){
   continue;
   $$TMP148=undefined;
}
else{
   $$TMP148=__GS4;
}
$$TMP144=$$TMP148;
break;
}
$$TMP143=$$TMP144;
return $$TMP143;
}
)((function(_l1,_l2){
   var $$TMP142;
   l1=_l1;
   l1;
   l2=_l2;
   l2;
   __GS3=false;
   $$TMP142=__GS3;
   return $$TMP142;
}
));
return $$TMP141;
}
)(false,undefined,[],lst));
return $$TMP140;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP150;
   var $$TMP151;
if($$root["reduce"]((function(accum,v){
   var $$TMP152;
   var $$TMP153;
   if(accum){
      $$TMP153=accum;
   }
   else{
      $$TMP153=v;
   }
   $$TMP152=$$TMP153;
   return $$TMP152;
}
),lst,false)){
   $$TMP151=true;
}
else{
   $$TMP151=false;
}
$$TMP150=$$TMP151;
return $$TMP150;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP154;
$$TMP154=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP155;
   var $$TMP156;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP157;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP157=true;
}
else{
   $$TMP157=false;
}
$$TMP156=$$TMP157;
}
else{
   $$TMP156=false;
}
$$TMP155=$$TMP156;
return $$TMP155;
}
),$$root["filter"]((function(x){
   var $$TMP158;
   var $$TMP159;
if($$root["symbol?"](x)){
   var $$TMP160;
if($$root["not"]($$root["equal?"](x,$$root["first"](pair)))){
   $$TMP160=true;
}
else{
   $$TMP160=false;
}
$$TMP159=$$TMP160;
}
else{
   $$TMP159=false;
}
$$TMP158=$$TMP159;
return $$TMP158;
}
),$$root["flatten"]($$root["second"](pair)))));
return $$TMP154;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP161;
   $$TMP161=(function(binding__MINUSnames){
      var $$TMP162;
      $$TMP162=(function(divs){
         var $$TMP164;
         var $$TMP165;
if($$root["null?"]($$root["second"](divs))){
$$TMP165=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP165=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP164=$$TMP165;
return $$TMP164;
}
)($$root["split"]((function(pair){
   var $$TMP163;
$$TMP163=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP163;
}
),binding__MINUSpairs));
return $$TMP162;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP161;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP167=1;
   $$TMP167<arguments.length;
   ++$$TMP167){
      body[$$TMP167-1]=arguments[$$TMP167];
   }
   var $$TMP166;
$$TMP166=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP166;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP168;
   $$TMP168=(function(x){
      var $$TMP169;
$$TMP169=$$root["not"](f(x));
return $$TMP169;
}
);
return $$TMP168;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP170;
   $$TMP170=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP172=0;
      $$TMP172<arguments.length;
      ++$$TMP172){
         args[$$TMP172-0]=arguments[$$TMP172];
      }
      var $$TMP171;
$$TMP171=f1($$root["apply"](f2,args));
return $$TMP171;
}
);
return $$TMP170;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP176=1;
   $$TMP176<arguments.length;
   ++$$TMP176){
      args1[$$TMP176-1]=arguments[$$TMP176];
   }
   var $$TMP173;
   $$TMP173=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP175=0;
      $$TMP175<arguments.length;
      ++$$TMP175){
         args2[$$TMP175-0]=arguments[$$TMP175];
      }
      var $$TMP174;
$$TMP174=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP174;
}
);
return $$TMP173;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP180=2;
   $$TMP180<arguments.length;
   ++$$TMP180){
      args1[$$TMP180-2]=arguments[$$TMP180];
   }
   var $$TMP177;
   $$TMP177=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP179=0;
      $$TMP179<arguments.length;
      ++$$TMP179){
         args2[$$TMP179-0]=arguments[$$TMP179];
      }
      var $$TMP178;
$$TMP178=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP178;
}
);
return $$TMP177;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP184=0;
   $$TMP184<arguments.length;
   ++$$TMP184){
      args[$$TMP184-0]=arguments[$$TMP184];
   }
   var $$TMP181;
   $$TMP181=(function(rx){
      var $$TMP182;
$$TMP182=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP183;
$$TMP183=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP183;
}
));
return $$TMP182;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP181;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP191=1;
   $$TMP191<arguments.length;
   ++$$TMP191){
      pairs[$$TMP191-1]=arguments[$$TMP191];
   }
   var $$TMP185;
   $$TMP185=(function(e__MINUSname,def__MINUSidx){
      var $$TMP186;
      var $$TMP187;
if($$root["="](def__MINUSidx,-1)){
$$TMP187=$$root.list((new $$root.Symbol("error")),"Fell out of case!");
}
else{
$$TMP187=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP186=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP188;
$$TMP188=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP189;
$$TMP189=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP189;
}
),$$root["filter"]((function(pair){
   var $$TMP190;
$$TMP190=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP190;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP188;
}
)($$TMP187,$$root["partition"](2,pairs));
return $$TMP186;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP185;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP192;
   $$TMP192=(function(expr__MINUSname){
      var $$TMP193;
$$TMP193=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP194;
   var $$TMP195;
if($$root["symbol?"](v)){
   var $$TMP196;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP196=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP197;
if($$root["="]($$root["geti-safe"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP197=[];
}
else{
$$TMP197=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP196=$$TMP197;
}
$$TMP195=$$TMP196;
}
else{
$$TMP195=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP194=$$TMP195;
return $$TMP194;
}
),structure)));
return $$TMP193;
}
)($$root["gensym"]());
return $$TMP192;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP200=2;
   $$TMP200<arguments.length;
   ++$$TMP200){
      body[$$TMP200-2]=arguments[$$TMP200];
   }
   var $$TMP198;
   var $$TMP199;
if($$root["symbol?"](structure)){
$$TMP199=$$root["list"](structure,expr);
}
else{
$$TMP199=$$root["destruct-helper"](structure,expr);
}
$$TMP198=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP199),body);
return $$TMP198;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP201;
   var $$TMP202;
if($$root["list?"](expr)){
   var $$TMP203;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP203=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP203=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP202=$$TMP203;
}
else{
   $$TMP202=expr;
}
$$TMP201=$$TMP202;
return $$TMP201;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP204;
   var $$TMP205;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP205=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP206;
   var $$TMP207;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP208;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP208=true;
}
else{
   $$TMP208=false;
}
$$TMP207=$$TMP208;
}
else{
   $$TMP207=false;
}
if($$TMP207){
$$TMP206=$$root["list?"](expr);
}
else{
   var $$TMP209;
   if(true){
      var $$TMP210;
      var $$TMP211;
if($$root["list?"](expr)){
   var $$TMP212;
if($$root["not"]($$root["null?"](expr))){
   $$TMP212=true;
}
else{
   $$TMP212=false;
}
$$TMP211=$$TMP212;
}
else{
   $$TMP211=false;
}
if($$TMP211){
   var $$TMP213;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP214;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
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
$$TMP210=$$TMP213;
}
else{
   $$TMP210=false;
}
$$TMP209=$$TMP210;
}
else{
   $$TMP209=undefined;
}
$$TMP206=$$TMP209;
}
$$TMP205=$$TMP206;
}
$$TMP204=$$TMP205;
return $$TMP204;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP215;
   var $$TMP216;
if($$root["null?"](patt)){
$$TMP216=$$root["null?"](expr);
}
else{
   var $$TMP217;
if($$root["list?"](patt)){
$$TMP217=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP218;
if($$root["symbol?"](patt)){
   $$TMP218=true;
}
else{
   var $$TMP219;
   if(true){
$$TMP219=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP219=undefined;
}
$$TMP218=$$TMP219;
}
$$TMP217=$$TMP218;
}
$$TMP216=$$TMP217;
}
$$TMP215=$$TMP216;
return $$TMP215;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP220;
   var $$TMP221;
   var $$TMP222;
if($$root["list?"](patt)){
   var $$TMP223;
if($$root["not"]($$root["null?"](patt))){
   $$TMP223=true;
}
else{
   $$TMP223=false;
}
$$TMP222=$$TMP223;
}
else{
   $$TMP222=false;
}
if($$TMP222){
   var $$TMP224;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP224=(new $$root.Symbol("_"));
}
else{
$$TMP224=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP221=$$TMP224;
}
else{
   $$TMP221=patt;
}
$$TMP220=$$TMP221;
return $$TMP220;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP228=1;
   $$TMP228<arguments.length;
   ++$$TMP228){
      pairs[$$TMP228-1]=arguments[$$TMP228];
   }
   var $$TMP225;
   $$TMP225=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP226;
$$TMP226=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP227;
$$TMP227=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP227;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP226;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP225;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP229;
   $$TMP229=(function(__GS5){
      var $$TMP230;
      var $$TMP231;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP231=(function(__GS6){
      var $$TMP232;
      $$TMP232=(function(obj,field){
         var $$TMP233;
$$TMP233=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP233;
}
)($$root["nth"](1,__GS6),$$root["nth"](2,__GS6));
return $$TMP232;
}
)(__GS5);
}
else{
   var $$TMP234;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti-safe"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP234=(function(__GS7){
      var $$TMP235;
      $$TMP235=(function(obj,field){
         var $$TMP236;
$$TMP236=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP236;
}
)($$root["nth"](1,__GS7),$$root["nth"](2,__GS7));
return $$TMP235;
}
)(__GS5);
}
else{
   var $$TMP237;
if($$root["matches?"](__GS5,(new $$root.Symbol("any")))){
   $$TMP237=(function(any){
      var $$TMP238;
      var $$TMP239;
if($$root["symbol?"](any)){
$$TMP239=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP239=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP238=$$TMP239;
return $$TMP238;
}
)(__GS5);
}
else{
   var $$TMP240;
   if(true){
$$TMP240=$$root["error"]("Fell out of case!");
}
else{
   $$TMP240=undefined;
}
$$TMP237=$$TMP240;
}
$$TMP234=$$TMP237;
}
$$TMP231=$$TMP234;
}
$$TMP230=$$TMP231;
return $$TMP230;
}
)($$root["macroexpand"](place));
return $$TMP229;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP241;
   amt=(function(c){
      var $$TMP242;
      var $$TMP243;
      if(c){
         $$TMP243=c;
      }
      else{
         $$TMP243=1;
      }
      $$TMP242=$$TMP243;
      return $$TMP242;
   }
   )(amt);
   amt;
$$TMP241=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP241;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP244;
   amt=(function(c){
      var $$TMP245;
      var $$TMP246;
      if(c){
         $$TMP246=c;
      }
      else{
         $$TMP246=1;
      }
      $$TMP245=$$TMP246;
      return $$TMP245;
   }
   )(amt);
   amt;
$$TMP244=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP244;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["mul!"]=(function(name,amt){
   var $$TMP247;
$$TMP247=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("*"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP247;
}
);
$$root["mul!"];
$$root["setmac!"]($$root["mul!"]);
$$root["push"]=(function(x,lst){
   var $$TMP248;
$$TMP248=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP248;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP249;
$$TMP249=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP249;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP250;
$$TMP250=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP250;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP251;
   var $$TMP252;
if($$root["="](pos,0)){
$$TMP252=$$root["cons"](x,lst);
}
else{
   var $$TMP253;
if($$root["null?"](lst)){
   $$TMP253=undefined;
}
else{
$$TMP253=$$root["car"](lst);
}
$$TMP252=$$root["cons"]($$TMP253,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP251=$$TMP252;
return $$TMP251;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP256=1;
   $$TMP256<arguments.length;
   ++$$TMP256){
      forms[$$TMP256-1]=arguments[$$TMP256];
   }
   var $$TMP254;
   var $$TMP255;
if($$root["null?"](forms)){
   $$TMP255=x;
}
else{
$$TMP255=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP254=$$TMP255;
return $$TMP254;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
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
$$TMP258=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP257=$$TMP258;
return $$TMP257;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP265=1;
   $$TMP265<arguments.length;
   ++$$TMP265){
      body[$$TMP265-1]=arguments[$$TMP265];
   }
   var $$TMP260;
   $$TMP260=(function(binding__MINUSname){
      var $$TMP261;
$$TMP261=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP262;
   $$TMP262=(function(__GS8){
      var $$TMP263;
      $$TMP263=(function(f,args){
         var $$TMP264;
$$TMP264=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP264;
}
)($$root["nth"](0,__GS8),$$root["drop"](1,__GS8));
return $$TMP263;
}
)(v);
return $$TMP262;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP261;
}
)($$root["gensym"]());
return $$TMP260;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP274=1;
   $$TMP274<arguments.length;
   ++$$TMP274){
      kvs[$$TMP274-1]=arguments[$$TMP274];
   }
   var $$TMP266;
   $$TMP266=(function(__GS9,__GS10,kvs){
      var $$TMP267;
      $$TMP267=(function(recur){
         var $$TMP269;
         var $$TMP270;
         while(true){
            __GS9=true;
            __GS9;
            var $$TMP271;
if($$root["null?"](kvs)){
   $$TMP271=obj;
}
else{
   var $$TMP272;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP272=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP271=$$TMP272;
}
__GS10=$$TMP271;
__GS10;
var $$TMP273;
if($$root["not"](__GS9)){
   continue;
   $$TMP273=undefined;
}
else{
   $$TMP273=__GS10;
}
$$TMP270=$$TMP273;
break;
}
$$TMP269=$$TMP270;
return $$TMP269;
}
)((function(_kvs){
   var $$TMP268;
   kvs=_kvs;
   kvs;
   __GS9=false;
   $$TMP268=__GS9;
   return $$TMP268;
}
));
return $$TMP267;
}
)(false,undefined,kvs);
return $$TMP266;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP283=2;
   $$TMP283<arguments.length;
   ++$$TMP283){
      kvs[$$TMP283-2]=arguments[$$TMP283];
   }
   var $$TMP275;
   (function(__GS11,__GS12,obj,path,kvs){
      var $$TMP276;
      $$TMP276=(function(recur){
         var $$TMP278;
         var $$TMP279;
         while(true){
            __GS11=true;
            __GS11;
            var $$TMP280;
if($$root["null?"](path)){
$$TMP280=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP281;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP281=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP281=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP280=recur($$TMP281,$$root["cdr"](path),kvs);
}
__GS12=$$TMP280;
__GS12;
var $$TMP282;
if($$root["not"](__GS11)){
   continue;
   $$TMP282=undefined;
}
else{
   $$TMP282=__GS12;
}
$$TMP279=$$TMP282;
break;
}
$$TMP278=$$TMP279;
return $$TMP278;
}
)((function(_obj,_path,_kvs){
   var $$TMP277;
   obj=_obj;
   obj;
   path=_path;
   path;
   kvs=_kvs;
   kvs;
   __GS11=false;
   $$TMP277=__GS11;
   return $$TMP277;
}
));
return $$TMP276;
}
)(false,undefined,obj,path,kvs);
$$TMP275=obj;
return $$TMP275;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP284;
   var $$TMP285;
if($$root["null?"](path)){
   $$TMP285=obj;
}
else{
   $$TMP285=(function(tmp){
      var $$TMP286;
      var $$TMP287;
      if(tmp){
$$TMP287=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP287=undefined;
}
$$TMP286=$$TMP287;
return $$TMP286;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP284=$$TMP285;
return $$TMP284;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP289=1;
   $$TMP289<arguments.length;
   ++$$TMP289){
      path[$$TMP289-1]=arguments[$$TMP289];
   }
   var $$TMP288;
$$TMP288=$$root["deep-geti*"](obj,path);
return $$TMP288;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP290;
$$TMP290=$$root["reduce"]((function(h2,key){
   var $$TMP291;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP291=h2;
return $$TMP291;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP290;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP293=1;
   $$TMP293<arguments.length;
   ++$$TMP293){
      kvs[$$TMP293-1]=arguments[$$TMP293];
   }
   var $$TMP292;
$$TMP292=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP292;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP302=1;
   $$TMP302<arguments.length;
   ++$$TMP302){
      kfs[$$TMP302-1]=arguments[$$TMP302];
   }
   var $$TMP294;
   $$TMP294=(function(__GS13,__GS14,kfs){
      var $$TMP295;
      $$TMP295=(function(recur){
         var $$TMP297;
         var $$TMP298;
         while(true){
            __GS13=true;
            __GS13;
            var $$TMP299;
if($$root["null?"](kfs)){
   $$TMP299=h;
}
else{
   $$TMP299=(function(key){
      var $$TMP300;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP300=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP300;
}
)($$root["first"](kfs));
}
__GS14=$$TMP299;
__GS14;
var $$TMP301;
if($$root["not"](__GS13)){
   continue;
   $$TMP301=undefined;
}
else{
   $$TMP301=__GS14;
}
$$TMP298=$$TMP301;
break;
}
$$TMP297=$$TMP298;
return $$TMP297;
}
)((function(_kfs){
   var $$TMP296;
   kfs=_kfs;
   kfs;
   __GS13=false;
   $$TMP296=__GS13;
   return $$TMP296;
}
));
return $$TMP295;
}
)(false,undefined,kfs);
return $$TMP294;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP304=1;
   $$TMP304<arguments.length;
   ++$$TMP304){
      kfs[$$TMP304-1]=arguments[$$TMP304];
   }
   var $$TMP303;
$$TMP303=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP303;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP306=1;
   $$TMP306<arguments.length;
   ++$$TMP306){
      body[$$TMP306-1]=arguments[$$TMP306];
   }
   var $$TMP305;
$$TMP305=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP305;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP307;
$$TMP307=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP307;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP308;
   step=(function(c){
      var $$TMP309;
      var $$TMP310;
      if(c){
         $$TMP310=c;
      }
      else{
         $$TMP310=1;
      }
      $$TMP309=$$TMP310;
      return $$TMP309;
   }
   )(step);
   step;
   $$TMP308=(function(data){
      var $$TMP311;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
var $$TMP312;
if($$root[">"](step,0)){
$$TMP312=(new $$root.Symbol("<"));
}
else{
$$TMP312=(new $$root.Symbol(">"));
}
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]($$TMP312),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP311=data;
return $$TMP311;
}
)($$root["object"]([]));
return $$TMP308;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
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
$$TMP316=data;
return $$TMP316;
}
)($$root["object"]([]));
return $$TMP313;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP317;
   $$TMP317=(function(len__MINUSname,data){
      var $$TMP318;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP318=data;
return $$TMP318;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP317;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP319;
   $$TMP319=(function(lst__MINUSname,data){
      var $$TMP320;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP320=data;
return $$TMP320;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP319;
}
);
$$root["in-list"];
$$root["in-array"]=(function(binding__MINUSname,expr){
   var $$TMP321;
   $$TMP321=(function(arr__MINUSname,idx__MINUSname,data){
      var $$TMP322;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](arr__MINUSname,expr,idx__MINUSname,0,binding__MINUSname,undefined));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("@"))),$$root["list"](arr__MINUSname),$$root["list"](idx__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](idx__MINUSname)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](idx__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](arr__MINUSname),$$root["list"]((new $$root.Symbol("length")))))));
$$TMP322=data;
return $$TMP322;
}
)($$root["gensym"](),$$root["gensym"](),$$root["object"]([]));
return $$TMP321;
}
);
$$root["in-array"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP323;
   $$TMP323=(function(__GS15){
      var $$TMP324;
      $$TMP324=(function(binding__MINUSname,__GS16){
         var $$TMP325;
         $$TMP325=(function(func__MINUSname,args){
            var $$TMP326;
$$TMP326=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP326;
}
)($$root["nth"](0,__GS16),$$root["drop"](1,__GS16));
return $$TMP325;
}
)($$root["nth"](1,__GS15),$$root["nth"](2,__GS15));
return $$TMP324;
}
)(form);
return $$TMP323;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP327;
   $$TMP327=(function(data){
      var $$TMP328;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP328=data;
return $$TMP328;
}
)($$root["object"]([]));
return $$TMP327;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP329;
   $$TMP329=(function(data){
      var $$TMP330;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP330=data;
return $$TMP330;
}
)($$root["object"]([]));
return $$TMP329;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP331;
   $$TMP331=(function(data){
      var $$TMP332;
      (function(__GS17){
         var $$TMP333;
         $$TMP333=(function(binding__MINUSname,body){
            var $$TMP334;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP334=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP334;
}
)($$root["nth"](1,__GS17),$$root["drop"](2,__GS17));
return $$TMP333;
}
)(form);
$$TMP332=data;
return $$TMP332;
}
)($$root["object"]([]));
return $$TMP331;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP335;
   $$TMP335=(function(data){
      var $$TMP336;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP336=data;
return $$TMP336;
}
)($$root["object"]([]));
return $$TMP335;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP337;
   $$TMP337=(function(data,accum__MINUSname){
      var $$TMP338;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP338=data;
return $$TMP338;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP337;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP339;
$$TMP339=$$root["filter"]((function(x){
   var $$TMP340;
$$TMP340=$$root["not="](x,undefined);
return $$TMP340;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP339;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP356=0;
   $$TMP356<arguments.length;
   ++$$TMP356){
      forms[$$TMP356-0]=arguments[$$TMP356];
   }
   var $$TMP341;
   $$TMP341=(function(res__MINUSname){
      var $$TMP342;
      $$TMP342=(function(all){
         var $$TMP352;
         $$TMP352=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP354;
            var $$TMP355;
if($$root["null?"](final__MINUSactions)){
$$TMP355=$$root["list"](res__MINUSname);
}
else{
   $$TMP355=final__MINUSactions;
}
$$TMP354=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP355)))))));
return $$TMP354;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP353;
$$TMP353=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP353;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP352;
}
)($$root["map"]((function(form){
   var $$TMP343;
   $$TMP343=(function(__GS18){
      var $$TMP344;
      var $$TMP345;
if($$root["equal?"](__GS18,(new $$root.Symbol("let")))){
$$TMP345=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP346;
if($$root["equal?"](__GS18,(new $$root.Symbol("for")))){
$$TMP346=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP347;
if($$root["equal?"](__GS18,(new $$root.Symbol("while")))){
$$TMP347=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP348;
if($$root["equal?"](__GS18,(new $$root.Symbol("do")))){
$$TMP348=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP349;
if($$root["equal?"](__GS18,(new $$root.Symbol("collecting")))){
$$TMP349=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP350;
if($$root["equal?"](__GS18,(new $$root.Symbol("finally")))){
$$TMP350=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP351;
   if(true){
$$TMP351=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP351=undefined;
}
$$TMP350=$$TMP351;
}
$$TMP349=$$TMP350;
}
$$TMP348=$$TMP349;
}
$$TMP347=$$TMP348;
}
$$TMP346=$$TMP347;
}
$$TMP345=$$TMP346;
}
$$TMP344=$$TMP345;
return $$TMP344;
}
)($$root["car"](form));
return $$TMP343;
}
),forms));
return $$TMP342;
}
)($$root["gensym"]());
return $$TMP341;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP361=1;
   $$TMP361<arguments.length;
   ++$$TMP361){
      kvs[$$TMP361-1]=arguments[$$TMP361];
   }
   var $$TMP357;
   $$TMP357=(function(meta){
      var $$TMP358;
      var $$TMP359;
if($$root["not"](meta)){
   var $$TMP360;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP360=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP359=$$TMP360;
}
else{
   $$TMP359=undefined;
}
$$TMP359;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP358=obj;
return $$TMP358;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP357;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP362;
$$TMP362=$$root["print"](($$root["JSON"]).stringify($$root["geti-safe"](x,(new $$root.Symbol("meta")))));
return $$TMP362;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP365=1;
   $$TMP365<arguments.length;
   ++$$TMP365){
      fields[$$TMP365-1]=arguments[$$TMP365];
   }
   var $$TMP363;
$$TMP363=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP364;
$$TMP364=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP364;
}
),fields))));
return $$TMP363;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP366;
   $$TMP366=(s).slice(start,end);
   return $$TMP366;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP367;
$$TMP367=$$root["<"](x,0);
return $$TMP367;
}
);
$$root["neg?"];
$$root["int"]=(function(x){
   var $$TMP368;
   var $$TMP369;
if($$root["neg?"](x)){
$$TMP369=($$root["Math"]).ceil(x);
}
else{
$$TMP369=($$root["Math"]).floor(x);
}
$$TMP368=$$TMP369;
return $$TMP368;
}
);
$$root["int"];
$$root["idiv"]=(function(a,b){
   var $$TMP370;
$$TMP370=$$root["int"]($$root["/"](a,b));
return $$TMP370;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP371;
   var $$TMP372;
if($$root["string?"](x)){
$$TMP372=$$root["="]($$root["geti-safe"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP373;
if($$root["list?"](x)){
$$TMP373=$$root["null?"](x);
}
else{
   var $$TMP374;
   if(true){
$$TMP374=$$root["error"]("Type error in empty?");
}
else{
   $$TMP374=undefined;
}
$$TMP373=$$TMP374;
}
$$TMP372=$$TMP373;
}
$$TMP371=$$TMP372;
return $$TMP371;
}
);
$$root["empty?"];
$$root["with-fields"]=(function(fields,obj){
   var body=Array(arguments.length-2);
   for(var $$TMP378=2;
   $$TMP378<arguments.length;
   ++$$TMP378){
      body[$$TMP378-2]=arguments[$$TMP378];
   }
   var $$TMP375;
   $$TMP375=(function(obj__MINUSsym){
      var $$TMP376;
$$TMP376=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](obj__MINUSsym),$$root["list"](obj),$$root["interleave"](fields,$$root["map"]((function(field){
   var $$TMP377;
$$TMP377=$$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](obj__MINUSsym),$$root["list"](field));
return $$TMP377;
}
),fields)))),body);
return $$TMP376;
}
)($$root["gensym"]());
return $$TMP375;
}
);
$$root["with-fields"];
$$root["setmac!"]($$root["with-fields"]);
$$root["inside?"]=(function(x,x0,x1){
   var $$TMP379;
   var $$TMP380;
if($$root[">="](x,x0)){
   var $$TMP381;
if($$root["<="](x,x1)){
   $$TMP381=true;
}
else{
   $$TMP381=false;
}
$$TMP380=$$TMP381;
}
else{
   $$TMP380=false;
}
$$TMP379=$$TMP380;
return $$TMP379;
}
);
$$root["inside?"];
$$root["clamp"]=(function(x,x0,x1){
   var $$TMP382;
   var $$TMP383;
if($$root["<"](x,x0)){
   $$TMP383=x0;
}
else{
   var $$TMP384;
if($$root[">"](x,x1)){
   $$TMP384=x1;
}
else{
   $$TMP384=x;
}
$$TMP383=$$TMP384;
}
$$TMP382=$$TMP383;
return $$TMP382;
}
);
$$root["clamp"];
$$root["randf"]=(function(min,max){
   var $$TMP385;
$$TMP385=$$root["+"](min,$$root["*"]($$root["-"](max,min),($$root["Math"]).random()));
return $$TMP385;
}
);
$$root["randf"];
$$root["randi"]=(function(min,max){
   var $$TMP386;
$$TMP386=$$root["int"]($$root["randf"](min,max));
return $$TMP386;
}
);
$$root["randi"];
$$root["random-element"]=(function(lst){
   var $$TMP387;
$$TMP387=$$root["nth"]($$root["randi"](0,$$root["count"](lst)),lst);
return $$TMP387;
}
);
$$root["random-element"];
$$root["sqrt"]=(function(x){
   var $$TMP388;
$$TMP388=$$root["call-method-by-name"]($$root["Math"],(new $$root.Symbol("sqrt")),x);
return $$TMP388;
}
);
$$root["sqrt"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP389;
   $$TMP389=(function(self){
      var $$TMP390;
      $$TMP390=(function(__GS19){
         var $$TMP391;
$$root["seti!"](__GS19,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS19,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS19,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS19,(new $$root.Symbol("len")),len);
$$TMP391=__GS19;
return $$TMP391;
}
)(self);
return $$TMP390;
}
)(this);
return $$TMP389;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP392;
   $$TMP392=(function(self){
      var $$TMP393;
$$TMP393=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti-safe"](self,(new $$root.Symbol("start"))),$$root["geti-safe"](self,(new $$root.Symbol("len"))));
return $$TMP393;
}
)(this);
return $$TMP392;
}
));
$$root["lit"]=(function(s){
   var $$TMP394;
$$TMP394=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP394;
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
   var $$TMP395;
   $$TMP395=(function(toks,pos,s){
      var $$TMP396;
      (function(__GS20,__GS21){
         var $$TMP397;
         $$TMP397=(function(recur){
            var $$TMP399;
            var $$TMP400;
            while(true){
               __GS20=true;
               __GS20;
               var $$TMP401;
if($$root[">"]($$root["geti-safe"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP402;
   {
      (function(__GS22,res,i,__GS23,__GS24,entry,_){
         var $$TMP403;
         $$TMP403=(function(__GS25,__GS26){
            var $$TMP404;
            $$TMP404=(function(recur){
               var $$TMP406;
               var $$TMP407;
               while(true){
                  __GS25=true;
                  __GS25;
                  var $$TMP408;
                  var $$TMP409;
if($$root["<"](i,__GS23)){
   var $$TMP410;
if($$root["not"]($$root["null?"](__GS24))){
   var $$TMP411;
if($$root["not"](res)){
   $$TMP411=true;
}
else{
   $$TMP411=false;
}
$$TMP410=$$TMP411;
}
else{
   $$TMP410=false;
}
$$TMP409=$$TMP410;
}
else{
   $$TMP409=false;
}
if($$TMP409){
   var $$TMP412;
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
$$TMP412=recur();
}
$$TMP408=$$TMP412;
}
else{
   var $$TMP413;
   {
      _=__GS22;
      _;
      var $$TMP414;
      if(res){
         var $$TMP415;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP416;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP417;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP418;
   var $$TMP419;
   if(c){
      $$TMP419=c;
   }
   else{
$$TMP419=$$root["second"](entry);
}
$$TMP418=$$TMP419;
return $$TMP418;
}
)($$root["geti"]($$root["keywords"],$$root["geti-safe"](res,0))),pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP417=toks;
}
$$TMP416=$$TMP417;
}
else{
   $$TMP416=undefined;
}
$$TMP416;
pos=$$root["+"](pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
$$TMP415=pos;
}
$$TMP414=$$TMP415;
}
else{
$$TMP414=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS22=$$TMP414;
$$TMP413=__GS22;
}
$$TMP408=$$TMP413;
}
__GS26=$$TMP408;
__GS26;
var $$TMP420;
if($$root["not"](__GS25)){
   continue;
   $$TMP420=undefined;
}
else{
   $$TMP420=__GS26;
}
$$TMP407=$$TMP420;
break;
}
$$TMP406=$$TMP407;
return $$TMP406;
}
)((function(){
   var $$TMP405;
   __GS25=false;
   $$TMP405=__GS25;
   return $$TMP405;
}
));
return $$TMP404;
}
)(false,undefined);
return $$TMP403;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP402=recur();
}
$$TMP401=$$TMP402;
}
else{
   $$TMP401=undefined;
}
__GS21=$$TMP401;
__GS21;
var $$TMP421;
if($$root["not"](__GS20)){
   continue;
   $$TMP421=undefined;
}
else{
   $$TMP421=__GS21;
}
$$TMP400=$$TMP421;
break;
}
$$TMP399=$$TMP400;
return $$TMP399;
}
)((function(){
   var $$TMP398;
   __GS20=false;
   $$TMP398=__GS20;
   return $$TMP398;
}
));
return $$TMP397;
}
)(false,undefined);
$$TMP396=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP396;
}
)([],0,src);
return $$TMP395;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP422;
   $$TMP422=(function(self){
      var $$TMP423;
$$TMP423=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP423;
}
)(this);
return $$TMP422;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP424;
   $$TMP424=(function(self){
      var $$TMP425;
$$TMP425=$$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos"))));
return $$TMP425;
}
)(this);
return $$TMP424;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP426;
   $$TMP426=(function(self){
      var $$TMP427;
      $$TMP427=(function(curr){
         var $$TMP428;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
$$TMP428=curr;
return $$TMP428;
}
)($$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
return $$TMP427;
}
)(this);
return $$TMP426;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP429;
$$TMP429=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP429;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP430;
$$TMP430=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP430;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP431;
   $$TMP431=(function(self){
      var $$TMP432;
      $$TMP432=(function(tok){
         var $$TMP433;
         $$TMP433=(function(__GS27){
            var $$TMP434;
            var $$TMP435;
if($$root["equal?"](__GS27,(new $$root.Symbol("list-open-tok")))){
$$TMP435=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP436;
if($$root["equal?"](__GS27,(new $$root.Symbol("true-tok")))){
   $$TMP436=true;
}
else{
   var $$TMP437;
if($$root["equal?"](__GS27,(new $$root.Symbol("false-tok")))){
   $$TMP437=false;
}
else{
   var $$TMP438;
if($$root["equal?"](__GS27,(new $$root.Symbol("null-tok")))){
   $$TMP438=[];
}
else{
   var $$TMP439;
if($$root["equal?"](__GS27,(new $$root.Symbol("undef-tok")))){
   $$TMP439=undefined;
}
else{
   var $$TMP440;
if($$root["equal?"](__GS27,(new $$root.Symbol("num-tok")))){
$$TMP440=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP441;
if($$root["equal?"](__GS27,(new $$root.Symbol("str-tok")))){
$$TMP441=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP442;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote-tok")))){
$$TMP442=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP443;
if($$root["equal?"](__GS27,(new $$root.Symbol("backquote-tok")))){
$$TMP443=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP444;
if($$root["equal?"](__GS27,(new $$root.Symbol("sym-tok")))){
$$TMP444=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP445;
   if(true){
$$TMP445=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti-safe"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP445=undefined;
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
}
$$TMP438=$$TMP439;
}
$$TMP437=$$TMP438;
}
$$TMP436=$$TMP437;
}
$$TMP435=$$TMP436;
}
$$TMP434=$$TMP435;
return $$TMP434;
}
)($$root["geti-safe"](tok,(new $$root.Symbol("type"))));
return $$TMP433;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP432;
}
)(this);
return $$TMP431;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP446;
   $$TMP446=(function(s){
      var $$TMP447;
$$TMP447=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP447;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP446;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP448;
$$TMP448=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP448;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP449;
   $$TMP449=(function(self){
      var $$TMP450;
      $$TMP450=(function(start__MINUSpos){
         var $$TMP451;
         $$TMP451=(function(__GS28,__GS29,lst){
            var $$TMP452;
            $$TMP452=(function(__GS30,__GS31){
               var $$TMP453;
               $$TMP453=(function(recur){
                  var $$TMP455;
                  var $$TMP456;
                  while(true){
                     __GS30=true;
                     __GS30;
                     var $$TMP457;
                     var $$TMP458;
                     var $$TMP459;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP460;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP460=true;
}
else{
   $$TMP460=false;
}
$$TMP459=$$TMP460;
}
else{
   $$TMP459=false;
}
if($$TMP459){
   $$TMP458=true;
}
else{
   $$TMP458=false;
}
if($$TMP458){
   var $$TMP461;
   {
__GS29=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS29);
__GS28=__GS29;
__GS28;
$$TMP461=recur();
}
$$TMP457=$$TMP461;
}
else{
   var $$TMP462;
   {
__GS28=$$root["reverse"](__GS29);
__GS28;
lst=__GS28;
lst;
var $$TMP463;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP463=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP463=$$root["error"]("Unmatched paren!");
}
__GS28=$$TMP463;
$$TMP462=__GS28;
}
$$TMP457=$$TMP462;
}
__GS31=$$TMP457;
__GS31;
var $$TMP464;
if($$root["not"](__GS30)){
   continue;
   $$TMP464=undefined;
}
else{
   $$TMP464=__GS31;
}
$$TMP456=$$TMP464;
break;
}
$$TMP455=$$TMP456;
return $$TMP455;
}
)((function(){
   var $$TMP454;
   __GS30=false;
   $$TMP454=__GS30;
   return $$TMP454;
}
));
return $$TMP453;
}
)(false,undefined);
return $$TMP452;
}
)(undefined,[],undefined);
return $$TMP451;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP450;
}
)(this);
return $$TMP449;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP465;
   $$TMP465=(function(self){
      var $$TMP466;
      $$TMP466=(function(__GS32,__GS33,lst){
         var $$TMP467;
         $$TMP467=(function(__GS34,__GS35){
            var $$TMP468;
            $$TMP468=(function(recur){
               var $$TMP470;
               var $$TMP471;
               while(true){
                  __GS34=true;
                  __GS34;
                  var $$TMP472;
                  var $$TMP473;
                  var $$TMP474;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP475;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP475=true;
}
else{
   $$TMP475=false;
}
$$TMP474=$$TMP475;
}
else{
   $$TMP474=false;
}
if($$TMP474){
   $$TMP473=true;
}
else{
   $$TMP473=false;
}
if($$TMP473){
   var $$TMP476;
   {
__GS33=$$root["cons"]((function(__GS36){
   var $$TMP477;
   var $$TMP478;
if($$root["equal?"](__GS36,(new $$root.Symbol("unquote-tok")))){
   var $$TMP479;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP479=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP478=$$TMP479;
}
else{
   var $$TMP480;
if($$root["equal?"](__GS36,(new $$root.Symbol("splice-tok")))){
   var $$TMP481;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP481=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP480=$$TMP481;
}
else{
   var $$TMP482;
   if(true){
$$TMP482=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP482=undefined;
}
$$TMP480=$$TMP482;
}
$$TMP478=$$TMP480;
}
$$TMP477=$$TMP478;
return $$TMP477;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS33);
__GS32=__GS33;
__GS32;
$$TMP476=recur();
}
$$TMP472=$$TMP476;
}
else{
   var $$TMP483;
   {
__GS32=$$root["reverse"](__GS33);
__GS32;
lst=__GS32;
lst;
var $$TMP484;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP484=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP484=$$root["error"]("Unmatched paren!");
}
__GS32=$$TMP484;
$$TMP483=__GS32;
}
$$TMP472=$$TMP483;
}
__GS35=$$TMP472;
__GS35;
var $$TMP485;
if($$root["not"](__GS34)){
   continue;
   $$TMP485=undefined;
}
else{
   $$TMP485=__GS35;
}
$$TMP471=$$TMP485;
break;
}
$$TMP470=$$TMP471;
return $$TMP470;
}
)((function(){
   var $$TMP469;
   __GS34=false;
   $$TMP469=__GS34;
   return $$TMP469;
}
));
return $$TMP468;
}
)(false,undefined);
return $$TMP467;
}
)(undefined,[],undefined);
return $$TMP466;
}
)(this);
return $$TMP465;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP486;
   $$TMP486=(function(self){
      var $$TMP487;
      var $$TMP488;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP489;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP489=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP488=$$TMP489;
}
else{
$$TMP488=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP487=$$TMP488;
return $$TMP487;
}
)(this);
return $$TMP486;
}
));
$$root["parse"]=(function(toks){
   var $$TMP490;
   $$TMP490=(function(p){
      var $$TMP491;
      $$TMP491=(function(__GS37,__GS38){
         var $$TMP492;
         $$TMP492=(function(__GS39,__GS40){
            var $$TMP493;
            $$TMP493=(function(recur){
               var $$TMP495;
               var $$TMP496;
               while(true){
                  __GS39=true;
                  __GS39;
                  var $$TMP497;
                  var $$TMP498;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP498=true;
}
else{
   $$TMP498=false;
}
if($$TMP498){
   var $$TMP499;
   {
__GS38=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS38);
__GS37=__GS38;
__GS37;
$$TMP499=recur();
}
$$TMP497=$$TMP499;
}
else{
   var $$TMP500;
   {
__GS37=$$root["reverse"](__GS38);
$$TMP500=__GS37;
}
$$TMP497=$$TMP500;
}
__GS40=$$TMP497;
__GS40;
var $$TMP501;
if($$root["not"](__GS39)){
   continue;
   $$TMP501=undefined;
}
else{
   $$TMP501=__GS40;
}
$$TMP496=$$TMP501;
break;
}
$$TMP495=$$TMP496;
return $$TMP495;
}
)((function(){
   var $$TMP494;
   __GS39=false;
   $$TMP494=__GS39;
   return $$TMP494;
}
));
return $$TMP493;
}
)(false,undefined);
return $$TMP492;
}
)(undefined,[]);
return $$TMP491;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP490;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS41){
   var $$TMP502;
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
$$TMP502=__GS41;
return $$TMP502;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP503;
$$TMP503=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP503;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP504;
$$TMP504=$$root["geti"]($$root["mangling-table"],x);
return $$TMP504;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP505;
$$TMP505=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP505;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP506;
   $$TMP506=(function(__GS42){
      var $$TMP507;
$$root["seti!"](__GS42,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS42,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP507=__GS42;
return $$TMP507;
}
)($$root["hashmap"]());
return $$TMP506;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP508;
   $$TMP508=(function(__GS43){
      var $$TMP509;
$$root["seti!"](__GS43,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS43,(new $$root.Symbol("mappings")),mappings);
$$TMP509=__GS43;
return $$TMP509;
}
)($$root["hashmap"]());
return $$TMP508;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP510;
$$TMP510=$$root["make-tc-str"](s,[]);
return $$TMP510;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP511;
   $$TMP511=(function(adder){
      var $$TMP513;
$$TMP513=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP513;
}
)((function(x){
   var $$TMP512;
$$TMP512=$$root["+"](x,n);
return $$TMP512;
}
));
return $$TMP511;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP514;
   var $$TMP515;
if($$root["string?"](b)){
$$TMP515=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),b),$$root["geti-safe"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP515=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),$$root["geti-safe"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti-safe"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP516;
$$TMP516=$$root["offset-source-mapping"](e,$$root["geti-safe"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP516;
}
),$$root["geti-safe"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP514=$$TMP515;
return $$TMP514;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP518=0;
   $$TMP518<arguments.length;
   ++$$TMP518){
      args[$$TMP518-0]=arguments[$$TMP518];
   }
   var $$TMP517;
$$TMP517=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP517;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP519;
$$TMP519=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP519;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP535=2;
   $$TMP535<arguments.length;
   ++$$TMP535){
      args[$$TMP535-2]=arguments[$$TMP535];
   }
   var $$TMP520;
   $$TMP520=(function(rx){
      var $$TMP521;
      $$TMP521=(function(__GS44,accum,__GS45,x,n,_){
         var $$TMP522;
         $$TMP522=(function(__GS46,__GS47){
            var $$TMP523;
            $$TMP523=(function(recur){
               var $$TMP525;
               var $$TMP526;
               while(true){
                  __GS46=true;
                  __GS46;
                  var $$TMP527;
                  var $$TMP528;
if($$root["not"]($$root["null?"](__GS45))){
   $$TMP528=true;
}
else{
   $$TMP528=false;
}
if($$TMP528){
   var $$TMP529;
   {
x=$$root["car"](__GS45);
x;
var $$TMP530;
if($$root["even?"](n)){
   $$TMP530=x;
}
else{
$$TMP530=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP530);
__GS44=accum;
__GS44;
__GS45=$$root["cdr"](__GS45);
__GS45;
n=$$root["+"](n,1);
n;
$$TMP529=recur();
}
$$TMP527=$$TMP529;
}
else{
   var $$TMP531;
   {
      _=__GS44;
      _;
      var $$TMP532;
      if(source__MINUSpos){
         var $$TMP533;
         {
$$TMP533=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti-safe"]($$root["geti-safe"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti-safe"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP532=$$TMP533;
}
else{
   $$TMP532=undefined;
}
$$TMP532;
__GS44=accum;
$$TMP531=__GS44;
}
$$TMP527=$$TMP531;
}
__GS47=$$TMP527;
__GS47;
var $$TMP534;
if($$root["not"](__GS46)){
   continue;
   $$TMP534=undefined;
}
else{
   $$TMP534=__GS47;
}
$$TMP526=$$TMP534;
break;
}
$$TMP525=$$TMP526;
return $$TMP525;
}
)((function(){
   var $$TMP524;
   __GS46=false;
   $$TMP524=__GS46;
   return $$TMP524;
}
));
return $$TMP523;
}
)(false,undefined);
return $$TMP522;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP521;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP520;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP536;
   $$TMP536=(function(self){
      var $$TMP537;
      $$TMP537=(function(__GS48){
         var $$TMP538;
$$root["seti!"](__GS48,"root",root);
$$root["seti!"](__GS48,"next-var-suffix",0);
$$TMP538=__GS48;
return $$TMP538;
}
)(self);
return $$TMP537;
}
)(this);
return $$TMP536;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP539;
   $$TMP539=(function(self){
      var $$TMP540;
      $$TMP540=(function(out){
         var $$TMP541;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP541=out;
return $$TMP541;
}
)($$root["str"]("$$TMP",$$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP540;
}
)(this);
return $$TMP539;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP542;
   var $$TMP543;
if($$root["in?"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP543=$$root["mangle-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP543=$$root["str"]("$$root[\"",$$root["geti-safe"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP542=$$TMP543;
return $$TMP542;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP544;
   $$TMP544=(function(self){
      var $$TMP545;
      var $$TMP546;
if($$root["="](x,true)){
$$TMP546=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP547;
if($$root["="](x,false)){
$$TMP547=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP548;
if($$root["null?"](x)){
$$TMP548=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP549;
if($$root["="](x,undefined)){
$$TMP549=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP550;
if($$root["symbol?"](x)){
$$TMP550=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP551;
if($$root["string?"](x)){
$$TMP551=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP552;
   if(true){
$$TMP552=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP552=undefined;
}
$$TMP551=$$TMP552;
}
$$TMP550=$$TMP551;
}
$$TMP549=$$TMP550;
}
$$TMP548=$$TMP549;
}
$$TMP547=$$TMP548;
}
$$TMP546=$$TMP547;
}
$$TMP545=$$TMP546;
return $$TMP545;
}
)(this);
return $$TMP544;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP553;
   $$TMP553=(function(self){
      var $$TMP554;
      $$TMP554=(function(__GS49){
         var $$TMP555;
         $$TMP555=(function(fun,args){
            var $$TMP556;
            $$TMP556=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP557;
$$TMP557=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP557;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP556;
}
)($$root["nth"](0,__GS49),$$root["drop"](1,__GS49));
return $$TMP555;
}
)(lst);
return $$TMP554;
}
)(this);
return $$TMP553;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP558;
   $$TMP558=(function(self){
      var $$TMP559;
      $$TMP559=(function(__GS50){
         var $$TMP560;
         $$TMP560=(function(fun,args){
            var $$TMP561;
            $$TMP561=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP562;
$$TMP562=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP562;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP561;
}
)($$root["nth"](1,__GS50),$$root["drop"](2,__GS50));
return $$TMP560;
}
)(lst);
return $$TMP559;
}
)(this);
return $$TMP558;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP563;
   $$TMP563=(function(self){
      var $$TMP564;
      $$TMP564=(function(__GS51){
         var $$TMP565;
         $$TMP565=(function(method,obj,args){
            var $$TMP566;
            $$TMP566=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP567;
$$TMP567=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP567;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP566;
}
)($$root["nth"](0,__GS51),$$root["nth"](1,__GS51),$$root["drop"](2,__GS51));
return $$TMP565;
}
)(lst);
return $$TMP564;
}
)(this);
return $$TMP563;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP568;
   $$TMP568=(function(self){
      var $$TMP569;
      $$TMP569=(function(compiled__MINUSbody,reducer){
         var $$TMP571;
$$TMP571=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP571;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP570;
$$TMP570=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP570;
}
));
return $$TMP569;
}
)(this);
return $$TMP568;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP572;
$$TMP572=$$root["="]($$root["geti-safe"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP572;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP573;
   var $$TMP574;
if($$root["is-vararg?"](sym)){
$$TMP574=$$root["call-method-by-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP574=$$root["geti-safe"](sym,(new $$root.Symbol("name")));
}
$$TMP573=$$TMP574;
return $$TMP573;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP575;
$$TMP575=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP576;
$$TMP576=$$root["mangle-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))));
return $$TMP576;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP575;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP577;
   $$TMP577=(function(self){
      var $$TMP578;
      var $$TMP579;
if($$root["not"]($$root["null?"](args))){
   var $$TMP580;
   {
$$TMP580=$$root["last"](args);
}
$$TMP579=$$TMP580;
}
else{
   $$TMP579=undefined;
}
$$TMP578=(function(last__MINUSarg){
   var $$TMP581;
   var $$TMP582;
   var $$TMP583;
   if(last__MINUSarg){
      var $$TMP584;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP584=true;
}
else{
   $$TMP584=false;
}
$$TMP583=$$TMP584;
}
else{
   $$TMP583=false;
}
if($$TMP583){
$$TMP582=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti-safe"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP582="";
}
$$TMP581=$$TMP582;
return $$TMP581;
}
)($$TMP579);
return $$TMP578;
}
)(this);
return $$TMP577;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP585;
   $$TMP585=(function(self){
      var $$TMP586;
      $$TMP586=(function(__GS52){
         var $$TMP587;
         $$TMP587=(function(__GS53){
            var $$TMP588;
            $$TMP588=(function(args,body){
               var $$TMP589;
               $$TMP589=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP591;
                  $$TMP591=(function(compiled__MINUSbody){
                     var $$TMP592;
$$TMP592=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP592;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP591;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP590;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP590=accum;
return $$TMP590;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP589;
}
)($$root["drop"](0,__GS53),$$root["drop"](2,__GS52));
return $$TMP588;
}
)($$root["nth"](1,__GS52));
return $$TMP587;
}
)(lst);
return $$TMP586;
}
)(this);
return $$TMP585;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP593;
   $$TMP593=(function(self){
      var $$TMP594;
      $$TMP594=(function(__GS54){
         var $$TMP595;
         $$TMP595=(function(body){
            var $$TMP596;
            $$TMP596=(function(value__MINUSvar__MINUSname){
               var $$TMP597;
               $$TMP597=(function(compiled__MINUSbody){
                  var $$TMP598;
$$TMP598=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP598;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP597;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP596;
}
)($$root["drop"](1,__GS54));
return $$TMP595;
}
)(lst);
return $$TMP594;
}
)(this);
return $$TMP593;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP599;
   $$TMP599=(function(self){
      var $$TMP600;
$$TMP600=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP600;
}
)(this);
return $$TMP599;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP601;
   $$TMP601=(function(self){
      var $$TMP602;
      $$TMP602=(function(__GS55){
         var $$TMP603;
         $$TMP603=(function(body){
            var $$TMP604;
            $$TMP604=(function(value__MINUSvar__MINUSname){
               var $$TMP605;
               $$TMP605=(function(compiled__MINUSbody){
                  var $$TMP606;
$$TMP606=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP606;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP605;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP604;
}
)($$root["drop"](1,__GS55));
return $$TMP603;
}
)(lst);
return $$TMP602;
}
)(this);
return $$TMP601;
}
));
$$root["compile"]=(function(expr){
   var $$TMP607;
   $$TMP607=(function(c){
      var $$TMP608;
      $$TMP608=(function(t){
         var $$TMP609;
$$TMP609=$$root["str"]($$root["geti-safe"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti-safe"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP609;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP608;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP607;
}
);
$$root["compile"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP610;
   $$TMP610=(function(self){
      var $$TMP611;
      $$TMP611=(function(__GS56){
         var $$TMP612;
         $$TMP612=(function(c,t,f){
            var $$TMP613;
            $$TMP613=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP614;
$$TMP614=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP614;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP613;
}
)($$root["nth"](1,__GS56),$$root["nth"](2,__GS56),$$root["nth"](3,__GS56));
return $$TMP612;
}
)(lst);
return $$TMP611;
}
)(this);
return $$TMP610;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP615;
   $$TMP615=(function(self){
      var $$TMP616;
      var $$TMP617;
if($$root["symbol?"](x)){
$$TMP617=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti-safe"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP617=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP616=$$TMP617;
return $$TMP616;
}
)(this);
return $$TMP615;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP618;
   $$TMP618=(function(self){
      var $$TMP619;
$$TMP619=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP619;
}
)(this);
return $$TMP618;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP620;
   $$TMP620=(function(self){
      var $$TMP621;
      var $$TMP622;
if($$root["atom?"](x)){
$$TMP622=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP622=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP621=$$TMP622;
return $$TMP621;
}
)(this);
return $$TMP620;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP623;
   $$TMP623=(function(self){
      var $$TMP624;
      $$TMP624=(function(__GS57){
         var $$TMP625;
         $$TMP625=(function(name,value){
            var $$TMP626;
            $$TMP626=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP627;
$$TMP627=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP627;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP626;
}
)($$root["nth"](1,__GS57),$$root["nth"](2,__GS57));
return $$TMP625;
}
)(lst);
return $$TMP624;
}
)(this);
return $$TMP623;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP628;
   $$TMP628=(function(self){
      var $$TMP629;
      $$TMP629=(function(__GS58){
         var $$TMP630;
         $$TMP630=(function(name,args){
            var $$TMP631;
            $$TMP631=(function(tmp){
               var $$TMP633;
$$TMP633=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["geti-safe"]($$root["second"](tmp),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](tmp),(new $$root.Symbol("data")))));
return $$TMP633;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP632;
$$TMP632=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP632;
}
),args))));
return $$TMP631;
}
)($$root["nth"](0,__GS58),$$root["drop"](1,__GS58));
return $$TMP630;
}
)(expr);
return $$TMP629;
}
)(this);
return $$TMP628;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP634;
   $$TMP634=(function(self){
      var $$TMP635;
      var $$TMP636;
if($$root["in?"](name,$$root["geti-safe"](self,(new $$root.Symbol("root"))))){
   var $$TMP637;
if($$root["geti"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP637=true;
}
else{
   $$TMP637=false;
}
$$TMP636=$$TMP637;
}
else{
   $$TMP636=false;
}
$$TMP635=$$TMP636;
return $$TMP635;
}
)(this);
return $$TMP634;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP638;
   $$TMP638=(function(self){
      var $$TMP639;
      var $$TMP640;
      var $$TMP641;
if($$root["list?"](expr)){
   var $$TMP642;
if($$root["not"]($$root["null?"](expr))){
   $$TMP642=true;
}
else{
   $$TMP642=false;
}
$$TMP641=$$TMP642;
}
else{
   $$TMP641=false;
}
if($$TMP641){
   $$TMP640=(function(first){
      var $$TMP643;
      var $$TMP644;
if($$root["symbol?"](first)){
   $$TMP644=(function(__GS59){
      var $$TMP645;
      var $$TMP646;
if($$root["equal?"](__GS59,(new $$root.Symbol("lambda")))){
$$TMP646=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP647;
if($$root["equal?"](__GS59,(new $$root.Symbol("progn")))){
$$TMP647=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP648;
if($$root["equal?"](__GS59,(new $$root.Symbol("dumb-loop")))){
$$TMP648=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP649;
if($$root["equal?"](__GS59,(new $$root.Symbol("continue")))){
$$TMP649=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP650;
if($$root["equal?"](__GS59,(new $$root.Symbol("new")))){
$$TMP650=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP651;
if($$root["equal?"](__GS59,(new $$root.Symbol("if")))){
$$TMP651=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP652;
if($$root["equal?"](__GS59,(new $$root.Symbol("quote")))){
$$TMP652=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP653;
if($$root["equal?"](__GS59,(new $$root.Symbol("setv!")))){
$$TMP653=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP654;
if($$root["equal?"](__GS59,(new $$root.Symbol("def")))){
$$TMP654=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP655;
   if(true){
      var $$TMP656;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti-safe"](first,(new $$root.Symbol("name"))))){
$$TMP656=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP657;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP657=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP658;
   if(true){
$$TMP658=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP658=undefined;
}
$$TMP657=$$TMP658;
}
$$TMP656=$$TMP657;
}
$$TMP655=$$TMP656;
}
else{
   $$TMP655=undefined;
}
$$TMP654=$$TMP655;
}
$$TMP653=$$TMP654;
}
$$TMP652=$$TMP653;
}
$$TMP651=$$TMP652;
}
$$TMP650=$$TMP651;
}
$$TMP649=$$TMP650;
}
$$TMP648=$$TMP649;
}
$$TMP647=$$TMP648;
}
$$TMP646=$$TMP647;
}
$$TMP645=$$TMP646;
return $$TMP645;
}
)(first);
}
else{
$$TMP644=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP643=$$TMP644;
return $$TMP643;
}
)($$root["car"](expr));
}
else{
$$TMP640=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP639=$$TMP640;
return $$TMP639;
}
)(this);
return $$TMP638;
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
   var $$TMP659;
$$TMP659=$$root["str"]($$root["geti-safe"]($$root["second"](pair),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](pair),(new $$root.Symbol("data"))));
return $$TMP659;
}
);
$$root["gen-jstr"];
$$root["default-lexenv"]=(function(){
   var $$TMP660;
   $$TMP660=(function(__GS60){
      var $$TMP661;
$$root["seti!"](__GS60,"this",true);
$$TMP661=__GS60;
return $$TMP661;
}
)($$root["object"]());
return $$TMP660;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP662;
   $$TMP662=(function(self){
      var $$TMP663;
      $$TMP663=(function(root,sandbox){
         var $$TMP664;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP665;
$$TMP665=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP665;
}
));
$$root["seti!"](root,"load-file",(function(path){
   var $$TMP666;
$$TMP666=$$root["call-method-by-name"](self,(new $$root.Symbol("load-file")),path);
return $$TMP666;
}
));
$$TMP664=(function(__GS61){
   var $$TMP667;
$$root["seti!"](__GS61,"root",root);
$$root["seti!"](__GS61,"dir-stack",$$root["list"](($$root["process"]).cwd()));
$$root["seti!"](__GS61,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP667=__GS61;
return $$TMP667;
}
)(self);
return $$TMP664;
}
)($$root["make-default-ns"](),$$root["object"]());
return $$TMP663;
}
)(this);
return $$TMP662;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP668;
   $$TMP668=(function(self){
      var $$TMP669;
      $$TMP669=(function(tmp){
         var $$TMP670;
$$TMP670=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
return $$TMP670;
}
)($$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP669;
}
)(this);
return $$TMP668;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP671;
   $$TMP671=(function(self){
      var $$TMP672;
      $$TMP672=(function(forms){
         var $$TMP673;
         $$TMP673=(function(__GS62,__GS63,form){
            var $$TMP674;
            $$TMP674=(function(__GS64,__GS65){
               var $$TMP675;
               $$TMP675=(function(recur){
                  var $$TMP677;
                  var $$TMP678;
                  while(true){
                     __GS64=true;
                     __GS64;
                     var $$TMP679;
                     var $$TMP680;
if($$root["not"]($$root["null?"](__GS63))){
   $$TMP680=true;
}
else{
   $$TMP680=false;
}
if($$TMP680){
   var $$TMP681;
   {
form=$$root["car"](__GS63);
form;
__GS62=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS62;
__GS63=$$root["cdr"](__GS63);
__GS63;
$$TMP681=recur();
}
$$TMP679=$$TMP681;
}
else{
   var $$TMP682;
   {
      $$TMP682=__GS62;
   }
   $$TMP679=$$TMP682;
}
__GS65=$$TMP679;
__GS65;
var $$TMP683;
if($$root["not"](__GS64)){
   continue;
   $$TMP683=undefined;
}
else{
   $$TMP683=__GS65;
}
$$TMP678=$$TMP683;
break;
}
$$TMP677=$$TMP678;
return $$TMP677;
}
)((function(){
   var $$TMP676;
   __GS64=false;
   $$TMP676=__GS64;
   return $$TMP676;
}
));
return $$TMP675;
}
)(false,undefined);
return $$TMP674;
}
)(undefined,forms,[]);
return $$TMP673;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP672;
}
)(this);
return $$TMP671;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("load-file")),(function(path){
   var $$TMP684;
   $$TMP684=(function(self){
      var $$TMP685;
      $$TMP685=undefined;
      return $$TMP685;
   }
   )(this);
   return $$TMP684;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP686;
   $$TMP686=(function(self){
      var $$TMP687;
$$TMP687=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["gen-jstr"](compilation__MINUSresult));
return $$TMP687;
}
)(this);
return $$TMP686;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP688;
   $$TMP688=(function(self){
      var $$TMP689;
      $$TMP689=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP690;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP691;
   $$TMP691=(function(r){
      var $$TMP692;
      var $$TMP693;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   var $$TMP694;
   {
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti-safe"](r,(new $$root.Symbol("code"))));
r;
$$TMP694=$$root["seti!"](target,name,r);
}
$$TMP693=$$TMP694;
}
else{
   $$TMP693=undefined;
}
$$TMP693;
$$TMP692=r;
return $$TMP692;
}
)($$root["geti"](target,name));
return $$TMP691;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP695;
$$TMP695=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP695;
}
));
$$root["seti!"](root,"*ns*",$$root["geti-safe"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP696;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP696=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP696;
}
));
$$TMP690=$$root["call-method"]($$root["geti-safe"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP690;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP689;
}
)(this);
return $$TMP688;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP697;
   $$TMP697=(function(self){
      var $$TMP698;
      $$TMP698=(function(lexenv){
         var $$TMP699;
         $$TMP699=(function(__GS66){
            var $$TMP700;
            var $$TMP701;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("def"))),(new $$root.Symbol("name")),(new $$root.Symbol("val"))))){
   $$TMP701=(function(__GS67){
      var $$TMP702;
      $$TMP702=(function(name,val){
         var $$TMP703;
         $$TMP703=(function(tmp){
            var $$TMP704;
$$root["seti!"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP704=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP704;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP703;
}
)($$root["nth"](1,__GS67),$$root["nth"](2,__GS67));
return $$TMP702;
}
)(__GS66);
}
else{
   var $$TMP705;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("setmac!"))),(new $$root.Symbol("name"))))){
   $$TMP705=(function(__GS68){
      var $$TMP706;
      $$TMP706=(function(name){
         var $$TMP707;
         $$TMP707=(function(tmp){
            var $$TMP708;
$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
$$TMP708=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP708;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP707;
}
)($$root["nth"](1,__GS68));
return $$TMP706;
}
)(__GS66);
}
else{
   var $$TMP709;
if($$root["matches?"](__GS66,$$root.list($$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("lambda"))),$$root.list((new $$root.Symbol("&args"))),(new $$root.Symbol("&body")))))){
   $$TMP709=(function(__GS69){
      var $$TMP710;
      $$TMP710=(function(__GS70){
         var $$TMP711;
         $$TMP711=(function(__GS71){
            var $$TMP712;
            $$TMP712=(function(args,body){
               var $$TMP713;
$$TMP713=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP713;
}
)($$root["drop"](0,__GS71),$$root["drop"](2,__GS70));
return $$TMP712;
}
)($$root["nth"](1,__GS70));
return $$TMP711;
}
)($$root["nth"](0,__GS69));
return $$TMP710;
}
)(__GS66);
}
else{
   var $$TMP714;
if($$root["matches?"](__GS66,$$root.list((new $$root.Symbol("name")),(new $$root.Symbol("&args"))))){
   $$TMP714=(function(__GS72){
      var $$TMP715;
      $$TMP715=(function(name,args){
         var $$TMP716;
         var $$TMP717;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP717=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP717=(function(tmp){
      var $$TMP718;
$$TMP718=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP718;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP716=$$TMP717;
return $$TMP716;
}
)($$root["nth"](0,__GS72),$$root["drop"](1,__GS72));
return $$TMP715;
}
)(__GS66);
}
else{
   var $$TMP719;
if($$root["matches?"](__GS66,(new $$root.Symbol("any")))){
   $$TMP719=(function(any){
      var $$TMP720;
      $$TMP720=(function(tmp){
         var $$TMP721;
$$TMP721=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP721;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP720;
}
)(__GS66);
}
else{
   var $$TMP722;
   if(true){
$$TMP722=$$root["error"]("Fell out of case!");
}
else{
   $$TMP722=undefined;
}
$$TMP719=$$TMP722;
}
$$TMP714=$$TMP719;
}
$$TMP709=$$TMP714;
}
$$TMP705=$$TMP709;
}
$$TMP701=$$TMP705;
}
$$TMP700=$$TMP701;
return $$TMP700;
}
)(e);
return $$TMP699;
}
)($$root["default-lexenv"]());
return $$TMP698;
}
)(this);
return $$TMP697;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP723;
   $$TMP723=(function(self){
      var $$TMP724;
$$TMP724=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP724;
}
)(this);
return $$TMP723;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
