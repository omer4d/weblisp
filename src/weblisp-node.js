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
   while(true){
      var $$TMP39;
if($$root["null?"](lst)){
   $$TMP39=accum;
}
else{
   var $$TMP40;
   {
accum=r(accum,$$root["car"](lst));
accum;
lst=$$root["cdr"](lst);
lst;
continue;
$$TMP40=undefined;
}
$$TMP39=$$TMP40;
}
$$TMP38=$$TMP39;
break;
}
$$TMP37=$$TMP38;
return $$TMP37;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP41;
$$TMP41=$$root["reduce"]((function(accum,v){
   var $$TMP42;
$$TMP42=$$root["cons"](v,accum);
return $$TMP42;
}
),lst,[]);
return $$TMP41;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP43;
$$TMP43=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP43;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP44;
$$TMP44=$$root["transform-list"]((function(accum,v){
   var $$TMP45;
$$TMP45=$$root["cons"](f(v),accum);
return $$TMP45;
}
),lst);
return $$TMP44;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP46;
$$TMP46=$$root["transform-list"]((function(accum,v){
   var $$TMP47;
   var $$TMP48;
   if(p(v)){
$$TMP48=$$root["cons"](v,accum);
}
else{
   $$TMP48=accum;
}
$$TMP47=$$TMP48;
return $$TMP47;
}
),lst);
return $$TMP46;
}
);
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP49;
$$TMP49=$$root["transform-list"]((function(accum,v){
   var $$TMP50;
n=$$root["-"](n,1);
n;
var $$TMP51;
if($$root[">="](n,0)){
$$TMP51=$$root["cons"](v,accum);
}
else{
   $$TMP51=accum;
}
$$TMP50=$$TMP51;
return $$TMP50;
}
),lst);
return $$TMP49;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP52;
$$TMP52=$$root["transform-list"]((function(accum,v){
   var $$TMP53;
n=$$root["-"](n,1);
n;
var $$TMP54;
if($$root[">="](n,0)){
   $$TMP54=accum;
}
else{
$$TMP54=$$root["cons"](v,accum);
}
$$TMP53=$$TMP54;
return $$TMP53;
}
),lst);
return $$TMP52;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP55;
   $$TMP55=(function(counter){
      var $$TMP56;
$$TMP56=$$root["transform-list"]((function(accum,v){
   var $$TMP57;
   var $$TMP58;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP58=$$root["cons"](v,accum);
}
else{
   $$TMP58=accum;
}
$$TMP57=$$TMP58;
return $$TMP57;
}
),lst);
return $$TMP56;
}
)(-1);
return $$TMP55;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP59;
   var $$TMP60;
if($$root["="](n,0)){
$$TMP60=$$root["car"](lst);
}
else{
$$TMP60=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP59=$$TMP60;
return $$TMP59;
}
);
$$root["nth"];
$$root["butlast"]=(function(n,lst){
   var $$TMP61;
$$TMP61=$$root["take"]($$root["-"]($$root["count"](lst),n),lst);
return $$TMP61;
}
);
$$root["butlast"];
$$root["last"]=(function(lst){
   var $$TMP62;
$$TMP62=$$root["reduce"]((function(accum,v){
   var $$TMP63;
   $$TMP63=v;
   return $$TMP63;
}
),lst,undefined);
return $$TMP62;
}
);
$$root["last"];
$$root["count"]=(function(lst){
   var $$TMP64;
$$TMP64=$$root["reduce"]((function(accum,v){
   var $$TMP65;
$$TMP65=$$root["inc"](accum);
return $$TMP65;
}
),lst,0);
return $$TMP64;
}
);
$$root["count"];
$$root["zip"]=(function(a){
   var more=Array(arguments.length-1);
   for(var $$TMP72=1;
   $$TMP72<arguments.length;
   ++$$TMP72){
      more[$$TMP72-1]=arguments[$$TMP72];
   }
   var $$TMP66;
   $$TMP66=(function(args){
      var $$TMP67;
      var $$TMP68;
if($$root["reduce"]((function(accum,v){
   var $$TMP69;
   $$TMP69=(function(c){
      var $$TMP70;
      var $$TMP71;
      if(c){
         $$TMP71=c;
      }
      else{
$$TMP71=$$root["null?"](v);
}
$$TMP70=$$TMP71;
return $$TMP70;
}
)(accum);
return $$TMP69;
}
),args,false)){
   $$TMP68=[];
}
else{
$$TMP68=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP67=$$TMP68;
return $$TMP67;
}
)($$root["cons"](a,more));
return $$TMP66;
}
);
$$root["zip"];
$$root["interleave"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP75=0;
   $$TMP75<arguments.length;
   ++$$TMP75){
      args[$$TMP75-0]=arguments[$$TMP75];
   }
   var $$TMP73;
   var $$TMP74;
if($$root["null?"](args)){
   $$TMP74=[];
}
else{
$$TMP74=$$root["apply"]($$root["concat"],$$root["apply"]($$root["zip"],args));
}
$$TMP73=$$TMP74;
return $$TMP73;
}
);
$$root["interleave"];
$$root["let"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP77=1;
   $$TMP77<arguments.length;
   ++$$TMP77){
      body[$$TMP77-1]=arguments[$$TMP77];
   }
   var $$TMP76;
$$TMP76=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP76;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP78;
   $$TMP78=(function(fst){
      var $$TMP79;
$$TMP79=$$root["transform-list"]((function(accum,v){
   var $$TMP80;
   var $$TMP81;
   if(fst){
      var $$TMP82;
      {
         fst=false;
         fst;
$$TMP82=$$root["cons"](v,accum);
}
$$TMP81=$$TMP82;
}
else{
$$TMP81=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP80=$$TMP81;
return $$TMP80;
}
),lst);
return $$TMP79;
}
)(true);
return $$TMP78;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP83;
$$TMP83=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP83;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP84;
   $$TMP84=(function(idx){
      var $$TMP85;
$$TMP85=$$root["reduce"]((function(accum,v){
   var $$TMP86;
idx=$$root["+"](idx,1);
idx;
var $$TMP87;
if(f(arg,v)){
   $$TMP87=idx;
}
else{
   $$TMP87=accum;
}
$$TMP86=$$TMP87;
return $$TMP86;
}
),lst,-1);
return $$TMP85;
}
)(-1);
return $$TMP84;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP88;
   var $$TMP89;
if($$root["atom?"](x)){
$$TMP89=$$root["list"](x);
}
else{
$$TMP89=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP88=$$TMP89;
return $$TMP88;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP90;
   $$TMP90=(function(idx){
      var $$TMP91;
$$TMP91=$$root["transform-list"]((function(accum,v){
   var $$TMP92;
idx=$$root["+"](idx,1);
$$TMP92=$$root["cons"](f(v,idx),accum);
return $$TMP92;
}
),lst);
return $$TMP91;
}
)(-1);
return $$TMP90;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP97=1;
   $$TMP97<arguments.length;
   ++$$TMP97){
      body[$$TMP97-1]=arguments[$$TMP97];
   }
   var $$TMP93;
   $$TMP93=(function(binding__MINUSnames,tmp__MINUSbinding__MINUSnames,done__MINUSflag__MINUSsym,res__MINUSsym){
      var $$TMP95;
$$TMP95=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false),$$root["list"](res__MINUSsym),$$root["list"](undefined),bindings)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](tmp__MINUSbinding__MINUSnames),$$root["map"]((function(s){
   var $$TMP96;
$$TMP96=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](s),$$root["list"]($$root["symbol"]($$root["str"]("_",$$root["geti-safe"](s,(new $$root.Symbol("name")))))));
return $$TMP96;
}
),binding__MINUSnames),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](false))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("dumb-loop"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](done__MINUSflag__MINUSsym),$$root["list"](true))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](res__MINUSsym),body)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"](done__MINUSflag__MINUSsym))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("continue"))))),$$root["list"](res__MINUSsym))))))));
return $$TMP95;
}
)($$root["every-nth"](2,bindings),$$root["map"]((function(s){
   var $$TMP94;
$$TMP94=$$root["symbol"]($$root["str"]("_",$$root["geti-safe"](s,(new $$root.Symbol("name")))));
return $$TMP94;
}
),$$root["every-nth"](2,bindings)),$$root["gensym"](),$$root["gensym"]());
return $$TMP93;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP98;
   var $$TMP99;
if($$root["null?"](lst)){
   $$TMP99=[];
}
else{
$$TMP99=$$root["reverse"]((function(__GS1,__GS2,accum,part,rem,counter){
   var $$TMP100;
   $$TMP100=(function(recur){
      var $$TMP102;
      var $$TMP103;
      while(true){
         __GS1=true;
         __GS1;
         var $$TMP104;
if($$root["null?"](rem)){
$$TMP104=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP105;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP105=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP105=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP104=$$TMP105;
}
__GS2=$$TMP104;
__GS2;
var $$TMP106;
if($$root["not"](__GS1)){
   continue;
   $$TMP106=undefined;
}
else{
   $$TMP106=__GS2;
}
$$TMP103=$$TMP106;
break;
}
$$TMP102=$$TMP103;
return $$TMP102;
}
)((function(_accum,_part,_rem,_counter){
   var $$TMP101;
   accum=_accum;
   accum;
   part=_part;
   part;
   rem=_rem;
   rem;
   counter=_counter;
   counter;
   __GS1=false;
   $$TMP101=__GS1;
   return $$TMP101;
}
));
return $$TMP100;
}
)(false,undefined,[],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1));
}
$$TMP98=$$TMP99;
return $$TMP98;
}
);
$$root["partition"];
$$root["method"]=(function(args){
   var body=Array(arguments.length-1);
   for(var $$TMP108=1;
   $$TMP108<arguments.length;
   ++$$TMP108){
      body[$$TMP108-1]=arguments[$$TMP108];
   }
   var $$TMP107;
$$TMP107=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP107;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP110=3;
   $$TMP110<arguments.length;
   ++$$TMP110){
      body[$$TMP110-3]=arguments[$$TMP110];
   }
   var $$TMP109;
$$TMP109=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP109;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP113=1;
   $$TMP113<arguments.length;
   ++$$TMP113){
      args[$$TMP113-1]=arguments[$$TMP113];
   }
   var $$TMP111;
   $$TMP111=(function(instance){
      var $$TMP112;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP112=instance;
return $$TMP112;
}
)($$root["object"](proto));
return $$TMP111;
}
);
$$root["make-instance"];
$$root["geti-safe"]=(function(obj,name){
   var $$TMP114;
   var $$TMP115;
if($$root["in?"](name,obj)){
$$TMP115=$$root["geti"](obj,name);
}
else{
$$TMP115=$$root["error"]($$root["str"]("Property '",name,"' does not exist in ",obj));
}
$$TMP114=$$TMP115;
return $$TMP114;
}
);
$$root["geti-safe"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP117=2;
   $$TMP117<arguments.length;
   ++$$TMP117){
      args[$$TMP117-2]=arguments[$$TMP117];
   }
   var $$TMP116;
$$TMP116=$$root["apply-method"]($$root["geti-safe"](obj,name),obj,args);
return $$TMP116;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP118;
   var $$TMP119;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP119=obj__MINUSname;
}
else{
   var $$TMP120;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP120=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP120=$$root["concat"]($$root["list"]((new $$root.Symbol("geti-safe"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP119=$$TMP120;
}
$$TMP118=$$TMP119;
return $$TMP118;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP122=1;
   $$TMP122<arguments.length;
   ++$$TMP122){
      fields[$$TMP122-1]=arguments[$$TMP122];
   }
   var $$TMP121;
$$TMP121=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP121;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP123;
   var $$TMP124;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP124=obj__MINUSname;
}
else{
$$TMP124=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP123=$$TMP124;
return $$TMP123;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP126=1;
   $$TMP126<arguments.length;
   ++$$TMP126){
      fields[$$TMP126-1]=arguments[$$TMP126];
   }
   var $$TMP125;
$$TMP125=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP125;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP127;
$$TMP127=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP127;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP128;
   var $$TMP129;
if($$root["null?"](a)){
$$TMP129=$$root["null?"](b);
}
else{
   var $$TMP130;
if($$root["symbol?"](a)){
   var $$TMP131;
if($$root["symbol?"](b)){
   var $$TMP132;
if($$root["="]($$root["geti-safe"](a,(new $$root.Symbol("name"))),$$root["geti-safe"](b,(new $$root.Symbol("name"))))){
   $$TMP132=true;
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
   var $$TMP133;
if($$root["atom?"](a)){
$$TMP133=$$root["="](a,b);
}
else{
   var $$TMP134;
if($$root["list?"](a)){
   var $$TMP135;
if($$root["list?"](b)){
   var $$TMP136;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP137;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP137=true;
}
else{
   $$TMP137=false;
}
$$TMP136=$$TMP137;
}
else{
   $$TMP136=false;
}
$$TMP135=$$TMP136;
}
else{
   $$TMP135=false;
}
$$TMP134=$$TMP135;
}
else{
   $$TMP134=undefined;
}
$$TMP133=$$TMP134;
}
$$TMP130=$$TMP133;
}
$$TMP129=$$TMP130;
}
$$TMP128=$$TMP129;
return $$TMP128;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP138;
   $$TMP138=(function(res){
      var $$TMP147;
$$TMP147=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP147;
}
)((function(__GS3,__GS4,l1,l2){
   var $$TMP139;
   $$TMP139=(function(recur){
      var $$TMP141;
      var $$TMP142;
      while(true){
         __GS3=true;
         __GS3;
         var $$TMP143;
         if((function(c){
            var $$TMP144;
            var $$TMP145;
            if(c){
               $$TMP145=c;
            }
            else{
$$TMP145=p($$root["car"](l2));
}
$$TMP144=$$TMP145;
return $$TMP144;
}
)($$root["null?"](l2))){
$$TMP143=$$root["list"](l1,l2);
}
else{
$$TMP143=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
__GS4=$$TMP143;
__GS4;
var $$TMP146;
if($$root["not"](__GS3)){
   continue;
   $$TMP146=undefined;
}
else{
   $$TMP146=__GS4;
}
$$TMP142=$$TMP146;
break;
}
$$TMP141=$$TMP142;
return $$TMP141;
}
)((function(_l1,_l2){
   var $$TMP140;
   l1=_l1;
   l1;
   l2=_l2;
   l2;
   __GS3=false;
   $$TMP140=__GS3;
   return $$TMP140;
}
));
return $$TMP139;
}
)(false,undefined,[],lst));
return $$TMP138;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP148;
   var $$TMP149;
if($$root["reduce"]((function(accum,v){
   var $$TMP150;
   var $$TMP151;
   if(accum){
      $$TMP151=accum;
   }
   else{
      $$TMP151=v;
   }
   $$TMP150=$$TMP151;
   return $$TMP150;
}
),lst,false)){
   $$TMP149=true;
}
else{
   $$TMP149=false;
}
$$TMP148=$$TMP149;
return $$TMP148;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP152;
$$TMP152=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP153;
   var $$TMP154;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP155;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP155=true;
}
else{
   $$TMP155=false;
}
$$TMP154=$$TMP155;
}
else{
   $$TMP154=false;
}
$$TMP153=$$TMP154;
return $$TMP153;
}
),$$root["filter"]((function(x){
   var $$TMP156;
   var $$TMP157;
if($$root["symbol?"](x)){
   var $$TMP158;
if($$root["not"]($$root["equal?"](x,$$root["first"](pair)))){
   $$TMP158=true;
}
else{
   $$TMP158=false;
}
$$TMP157=$$TMP158;
}
else{
   $$TMP157=false;
}
$$TMP156=$$TMP157;
return $$TMP156;
}
),$$root["flatten"]($$root["second"](pair)))));
return $$TMP152;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP159;
   $$TMP159=(function(binding__MINUSnames){
      var $$TMP160;
      $$TMP160=(function(divs){
         var $$TMP162;
         var $$TMP163;
if($$root["null?"]($$root["second"](divs))){
$$TMP163=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP163=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP162=$$TMP163;
return $$TMP162;
}
)($$root["split"]((function(pair){
   var $$TMP161;
$$TMP161=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP161;
}
),binding__MINUSpairs));
return $$TMP160;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP159;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP165=1;
   $$TMP165<arguments.length;
   ++$$TMP165){
      body[$$TMP165-1]=arguments[$$TMP165];
   }
   var $$TMP164;
$$TMP164=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP164;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP166;
   $$TMP166=(function(x){
      var $$TMP167;
$$TMP167=$$root["not"](f(x));
return $$TMP167;
}
);
return $$TMP166;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP168;
   $$TMP168=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP170=0;
      $$TMP170<arguments.length;
      ++$$TMP170){
         args[$$TMP170-0]=arguments[$$TMP170];
      }
      var $$TMP169;
$$TMP169=f1($$root["apply"](f2,args));
return $$TMP169;
}
);
return $$TMP168;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP174=1;
   $$TMP174<arguments.length;
   ++$$TMP174){
      args1[$$TMP174-1]=arguments[$$TMP174];
   }
   var $$TMP171;
   $$TMP171=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP173=0;
      $$TMP173<arguments.length;
      ++$$TMP173){
         args2[$$TMP173-0]=arguments[$$TMP173];
      }
      var $$TMP172;
$$TMP172=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP172;
}
);
return $$TMP171;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP178=2;
   $$TMP178<arguments.length;
   ++$$TMP178){
      args1[$$TMP178-2]=arguments[$$TMP178];
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
$$TMP176=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP176;
}
);
return $$TMP175;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP182=0;
   $$TMP182<arguments.length;
   ++$$TMP182){
      args[$$TMP182-0]=arguments[$$TMP182];
   }
   var $$TMP179;
   $$TMP179=(function(rx){
      var $$TMP180;
$$TMP180=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP181;
$$TMP181=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP181;
}
));
return $$TMP180;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP179;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP189=1;
   $$TMP189<arguments.length;
   ++$$TMP189){
      pairs[$$TMP189-1]=arguments[$$TMP189];
   }
   var $$TMP183;
   $$TMP183=(function(e__MINUSname,def__MINUSidx){
      var $$TMP184;
      var $$TMP185;
if($$root["="](def__MINUSidx,-1)){
$$TMP185=$$root.list((new $$root.Symbol("error")),"Fell out of case!");
}
else{
$$TMP185=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP184=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP186;
$$TMP186=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP187;
$$TMP187=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP187;
}
),$$root["filter"]((function(pair){
   var $$TMP188;
$$TMP188=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP188;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP186;
}
)($$TMP185,$$root["partition"](2,pairs));
return $$TMP184;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP183;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP190;
   $$TMP190=(function(expr__MINUSname){
      var $$TMP191;
$$TMP191=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP192;
   var $$TMP193;
if($$root["symbol?"](v)){
   var $$TMP194;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP194=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP195;
if($$root["="]($$root["geti-safe"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP195=[];
}
else{
$$TMP195=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP194=$$TMP195;
}
$$TMP193=$$TMP194;
}
else{
$$TMP193=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP192=$$TMP193;
return $$TMP192;
}
),structure)));
return $$TMP191;
}
)($$root["gensym"]());
return $$TMP190;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP198=2;
   $$TMP198<arguments.length;
   ++$$TMP198){
      body[$$TMP198-2]=arguments[$$TMP198];
   }
   var $$TMP196;
   var $$TMP197;
if($$root["symbol?"](structure)){
$$TMP197=$$root["list"](structure,expr);
}
else{
$$TMP197=$$root["destruct-helper"](structure,expr);
}
$$TMP196=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP197),body);
return $$TMP196;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP199;
   var $$TMP200;
if($$root["list?"](expr)){
   var $$TMP201;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP201=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP201=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP200=$$TMP201;
}
else{
   $$TMP200=expr;
}
$$TMP199=$$TMP200;
return $$TMP199;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP202;
   var $$TMP203;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP203=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP204;
   var $$TMP205;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP206;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP206=true;
}
else{
   $$TMP206=false;
}
$$TMP205=$$TMP206;
}
else{
   $$TMP205=false;
}
if($$TMP205){
$$TMP204=$$root["list?"](expr);
}
else{
   var $$TMP207;
   if(true){
      var $$TMP208;
      var $$TMP209;
if($$root["list?"](expr)){
   var $$TMP210;
if($$root["not"]($$root["null?"](expr))){
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
   var $$TMP211;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP212;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
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
$$TMP208=$$TMP211;
}
else{
   $$TMP208=false;
}
$$TMP207=$$TMP208;
}
else{
   $$TMP207=undefined;
}
$$TMP204=$$TMP207;
}
$$TMP203=$$TMP204;
}
$$TMP202=$$TMP203;
return $$TMP202;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP213;
   var $$TMP214;
if($$root["null?"](patt)){
$$TMP214=$$root["null?"](expr);
}
else{
   var $$TMP215;
if($$root["list?"](patt)){
$$TMP215=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP216;
if($$root["symbol?"](patt)){
   $$TMP216=true;
}
else{
   var $$TMP217;
   if(true){
$$TMP217=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP217=undefined;
}
$$TMP216=$$TMP217;
}
$$TMP215=$$TMP216;
}
$$TMP214=$$TMP215;
}
$$TMP213=$$TMP214;
return $$TMP213;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP218;
   var $$TMP219;
   var $$TMP220;
if($$root["list?"](patt)){
   var $$TMP221;
if($$root["not"]($$root["null?"](patt))){
   $$TMP221=true;
}
else{
   $$TMP221=false;
}
$$TMP220=$$TMP221;
}
else{
   $$TMP220=false;
}
if($$TMP220){
   var $$TMP222;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP222=(new $$root.Symbol("_"));
}
else{
$$TMP222=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP219=$$TMP222;
}
else{
   $$TMP219=patt;
}
$$TMP218=$$TMP219;
return $$TMP218;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP226=1;
   $$TMP226<arguments.length;
   ++$$TMP226){
      pairs[$$TMP226-1]=arguments[$$TMP226];
   }
   var $$TMP223;
   $$TMP223=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP224;
$$TMP224=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP225;
$$TMP225=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP225;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP224;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP223;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP227;
   $$TMP227=(function(__GS5){
      var $$TMP228;
      var $$TMP229;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP229=(function(__GS6){
      var $$TMP230;
      $$TMP230=(function(obj,field){
         var $$TMP231;
$$TMP231=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP231;
}
)($$root["nth"](1,__GS6),$$root["nth"](2,__GS6));
return $$TMP230;
}
)(__GS5);
}
else{
   var $$TMP232;
if($$root["matches?"](__GS5,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("geti-safe"))),(new $$root.Symbol("obj")),(new $$root.Symbol("field"))))){
   $$TMP232=(function(__GS7){
      var $$TMP233;
      $$TMP233=(function(obj,field){
         var $$TMP234;
$$TMP234=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP234;
}
)($$root["nth"](1,__GS7),$$root["nth"](2,__GS7));
return $$TMP233;
}
)(__GS5);
}
else{
   var $$TMP235;
if($$root["matches?"](__GS5,(new $$root.Symbol("any")))){
   $$TMP235=(function(any){
      var $$TMP236;
      var $$TMP237;
if($$root["symbol?"](any)){
$$TMP237=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP237=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP236=$$TMP237;
return $$TMP236;
}
)(__GS5);
}
else{
   var $$TMP238;
   if(true){
$$TMP238=$$root["error"]("Fell out of case!");
}
else{
   $$TMP238=undefined;
}
$$TMP235=$$TMP238;
}
$$TMP232=$$TMP235;
}
$$TMP229=$$TMP232;
}
$$TMP228=$$TMP229;
return $$TMP228;
}
)($$root["macroexpand"](place));
return $$TMP227;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP239;
   amt=(function(c){
      var $$TMP240;
      var $$TMP241;
      if(c){
         $$TMP241=c;
      }
      else{
         $$TMP241=1;
      }
      $$TMP240=$$TMP241;
      return $$TMP240;
   }
   )(amt);
   amt;
$$TMP239=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP239;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP242;
   amt=(function(c){
      var $$TMP243;
      var $$TMP244;
      if(c){
         $$TMP244=c;
      }
      else{
         $$TMP244=1;
      }
      $$TMP243=$$TMP244;
      return $$TMP243;
   }
   )(amt);
   amt;
$$TMP242=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP242;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["mul!"]=(function(name,amt){
   var $$TMP245;
$$TMP245=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("*"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP245;
}
);
$$root["mul!"];
$$root["setmac!"]($$root["mul!"]);
$$root["push"]=(function(x,lst){
   var $$TMP246;
$$TMP246=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP246;
}
);
$$root["push"];
$$root["push!"]=(function(x,place){
   var $$TMP247;
$$TMP247=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("push"))),$$root["list"](x),$$root["list"](place))));
return $$TMP247;
}
);
$$root["push!"];
$$root["setmac!"]($$root["push!"]);
$$root["cons!"]=(function(x,place){
   var $$TMP248;
$$TMP248=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](place),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"](x),$$root["list"](place))));
return $$TMP248;
}
);
$$root["cons!"];
$$root["setmac!"]($$root["cons!"]);
$$root["insert"]=(function(x,pos,lst){
   var $$TMP249;
   var $$TMP250;
if($$root["="](pos,0)){
$$TMP250=$$root["cons"](x,lst);
}
else{
   var $$TMP251;
if($$root["null?"](lst)){
   $$TMP251=undefined;
}
else{
$$TMP251=$$root["car"](lst);
}
$$TMP250=$$root["cons"]($$TMP251,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP249=$$TMP250;
return $$TMP249;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP254=1;
   $$TMP254<arguments.length;
   ++$$TMP254){
      forms[$$TMP254-1]=arguments[$$TMP254];
   }
   var $$TMP252;
   var $$TMP253;
if($$root["null?"](forms)){
   $$TMP253=x;
}
else{
$$TMP253=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP252=$$TMP253;
return $$TMP252;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP257=1;
   $$TMP257<arguments.length;
   ++$$TMP257){
      forms[$$TMP257-1]=arguments[$$TMP257];
   }
   var $$TMP255;
   var $$TMP256;
if($$root["null?"](forms)){
   $$TMP256=x;
}
else{
$$TMP256=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP255=$$TMP256;
return $$TMP255;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP263=1;
   $$TMP263<arguments.length;
   ++$$TMP263){
      body[$$TMP263-1]=arguments[$$TMP263];
   }
   var $$TMP258;
   $$TMP258=(function(binding__MINUSname){
      var $$TMP259;
$$TMP259=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP260;
   $$TMP260=(function(__GS8){
      var $$TMP261;
      $$TMP261=(function(f,args){
         var $$TMP262;
$$TMP262=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP262;
}
)($$root["nth"](0,__GS8),$$root["drop"](1,__GS8));
return $$TMP261;
}
)(v);
return $$TMP260;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP259;
}
)($$root["gensym"]());
return $$TMP258;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP272=1;
   $$TMP272<arguments.length;
   ++$$TMP272){
      kvs[$$TMP272-1]=arguments[$$TMP272];
   }
   var $$TMP264;
   $$TMP264=(function(__GS9,__GS10,kvs){
      var $$TMP265;
      $$TMP265=(function(recur){
         var $$TMP267;
         var $$TMP268;
         while(true){
            __GS9=true;
            __GS9;
            var $$TMP269;
if($$root["null?"](kvs)){
   $$TMP269=obj;
}
else{
   var $$TMP270;
   {
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP270=recur($$root["cdr"]($$root["cdr"](kvs)));
}
$$TMP269=$$TMP270;
}
__GS10=$$TMP269;
__GS10;
var $$TMP271;
if($$root["not"](__GS9)){
   continue;
   $$TMP271=undefined;
}
else{
   $$TMP271=__GS10;
}
$$TMP268=$$TMP271;
break;
}
$$TMP267=$$TMP268;
return $$TMP267;
}
)((function(_kvs){
   var $$TMP266;
   kvs=_kvs;
   kvs;
   __GS9=false;
   $$TMP266=__GS9;
   return $$TMP266;
}
));
return $$TMP265;
}
)(false,undefined,kvs);
return $$TMP264;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP281=2;
   $$TMP281<arguments.length;
   ++$$TMP281){
      kvs[$$TMP281-2]=arguments[$$TMP281];
   }
   var $$TMP273;
   (function(__GS11,__GS12,obj,path,kvs){
      var $$TMP274;
      $$TMP274=(function(recur){
         var $$TMP276;
         var $$TMP277;
         while(true){
            __GS11=true;
            __GS11;
            var $$TMP278;
if($$root["null?"](path)){
$$TMP278=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP279;
if($$root["in?"]($$root["car"](path),obj)){
$$TMP279=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP279=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP278=recur($$TMP279,$$root["cdr"](path),kvs);
}
__GS12=$$TMP278;
__GS12;
var $$TMP280;
if($$root["not"](__GS11)){
   continue;
   $$TMP280=undefined;
}
else{
   $$TMP280=__GS12;
}
$$TMP277=$$TMP280;
break;
}
$$TMP276=$$TMP277;
return $$TMP276;
}
)((function(_obj,_path,_kvs){
   var $$TMP275;
   obj=_obj;
   obj;
   path=_path;
   path;
   kvs=_kvs;
   kvs;
   __GS11=false;
   $$TMP275=__GS11;
   return $$TMP275;
}
));
return $$TMP274;
}
)(false,undefined,obj,path,kvs);
$$TMP273=obj;
return $$TMP273;
}
);
$$root["deep-assoc!"];
$$root["deep-geti*"]=(function(obj,path){
   var $$TMP282;
   var $$TMP283;
if($$root["null?"](path)){
   $$TMP283=obj;
}
else{
   $$TMP283=(function(tmp){
      var $$TMP284;
      var $$TMP285;
      if(tmp){
$$TMP285=$$root["deep-geti*"](tmp,$$root["cdr"](path));
}
else{
   $$TMP285=undefined;
}
$$TMP284=$$TMP285;
return $$TMP284;
}
)($$root["geti"](obj,$$root["car"](path)));
}
$$TMP282=$$TMP283;
return $$TMP282;
}
);
$$root["deep-geti*"];
$$root["deep-geti"]=(function(obj){
   var path=Array(arguments.length-1);
   for(var $$TMP287=1;
   $$TMP287<arguments.length;
   ++$$TMP287){
      path[$$TMP287-1]=arguments[$$TMP287];
   }
   var $$TMP286;
$$TMP286=$$root["deep-geti*"](obj,path);
return $$TMP286;
}
);
$$root["deep-geti"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP288;
$$TMP288=$$root["reduce"]((function(h2,key){
   var $$TMP289;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP289=h2;
return $$TMP289;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP288;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP291=1;
   $$TMP291<arguments.length;
   ++$$TMP291){
      kvs[$$TMP291-1]=arguments[$$TMP291];
   }
   var $$TMP290;
$$TMP290=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP290;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP300=1;
   $$TMP300<arguments.length;
   ++$$TMP300){
      kfs[$$TMP300-1]=arguments[$$TMP300];
   }
   var $$TMP292;
   $$TMP292=(function(__GS13,__GS14,kfs){
      var $$TMP293;
      $$TMP293=(function(recur){
         var $$TMP295;
         var $$TMP296;
         while(true){
            __GS13=true;
            __GS13;
            var $$TMP297;
if($$root["null?"](kfs)){
   $$TMP297=h;
}
else{
   $$TMP297=(function(key){
      var $$TMP298;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP298=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP298;
}
)($$root["first"](kfs));
}
__GS14=$$TMP297;
__GS14;
var $$TMP299;
if($$root["not"](__GS13)){
   continue;
   $$TMP299=undefined;
}
else{
   $$TMP299=__GS14;
}
$$TMP296=$$TMP299;
break;
}
$$TMP295=$$TMP296;
return $$TMP295;
}
)((function(_kfs){
   var $$TMP294;
   kfs=_kfs;
   kfs;
   __GS13=false;
   $$TMP294=__GS13;
   return $$TMP294;
}
));
return $$TMP293;
}
)(false,undefined,kfs);
return $$TMP292;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP302=1;
   $$TMP302<arguments.length;
   ++$$TMP302){
      kfs[$$TMP302-1]=arguments[$$TMP302];
   }
   var $$TMP301;
$$TMP301=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP301;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP304=1;
   $$TMP304<arguments.length;
   ++$$TMP304){
      body[$$TMP304-1]=arguments[$$TMP304];
   }
   var $$TMP303;
$$TMP303=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP303;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP305;
$$TMP305=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP305;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP306;
   step=(function(c){
      var $$TMP307;
      var $$TMP308;
      if(c){
         $$TMP308=c;
      }
      else{
         $$TMP308=1;
      }
      $$TMP307=$$TMP308;
      return $$TMP307;
   }
   )(step);
   step;
   $$TMP306=(function(data){
      var $$TMP309;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
var $$TMP310;
if($$root[">"](step,0)){
$$TMP310=(new $$root.Symbol("<"));
}
else{
$$TMP310=(new $$root.Symbol(">"));
}
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]($$TMP310),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP309=data;
return $$TMP309;
}
)($$root["object"]([]));
return $$TMP306;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP311;
   step=(function(c){
      var $$TMP312;
      var $$TMP313;
      if(c){
         $$TMP313=c;
      }
      else{
         $$TMP313=1;
      }
      $$TMP312=$$TMP313;
      return $$TMP312;
   }
   )(step);
   step;
   $$TMP311=(function(data){
      var $$TMP314;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP314=data;
return $$TMP314;
}
)($$root["object"]([]));
return $$TMP311;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP315;
   $$TMP315=(function(len__MINUSname,data){
      var $$TMP316;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP316=data;
return $$TMP316;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP315;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP317;
   $$TMP317=(function(lst__MINUSname,data){
      var $$TMP318;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP318=data;
return $$TMP318;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP317;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP319;
   $$TMP319=(function(__GS15){
      var $$TMP320;
      $$TMP320=(function(binding__MINUSname,__GS16){
         var $$TMP321;
         $$TMP321=(function(func__MINUSname,args){
            var $$TMP322;
$$TMP322=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP322;
}
)($$root["nth"](0,__GS16),$$root["drop"](1,__GS16));
return $$TMP321;
}
)($$root["nth"](1,__GS15),$$root["nth"](2,__GS15));
return $$TMP320;
}
)(form);
return $$TMP319;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP323;
   $$TMP323=(function(data){
      var $$TMP324;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP324=data;
return $$TMP324;
}
)($$root["object"]([]));
return $$TMP323;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP325;
   $$TMP325=(function(data){
      var $$TMP326;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP326=data;
return $$TMP326;
}
)($$root["object"]([]));
return $$TMP325;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP327;
   $$TMP327=(function(data){
      var $$TMP328;
      (function(__GS17){
         var $$TMP329;
         $$TMP329=(function(binding__MINUSname,body){
            var $$TMP330;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP330=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP330;
}
)($$root["nth"](1,__GS17),$$root["drop"](2,__GS17));
return $$TMP329;
}
)(form);
$$TMP328=data;
return $$TMP328;
}
)($$root["object"]([]));
return $$TMP327;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP331;
   $$TMP331=(function(data){
      var $$TMP332;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP332=data;
return $$TMP332;
}
)($$root["object"]([]));
return $$TMP331;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP333;
   $$TMP333=(function(data,accum__MINUSname){
      var $$TMP334;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP334=data;
return $$TMP334;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP333;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP335;
$$TMP335=$$root["filter"]((function(x){
   var $$TMP336;
$$TMP336=$$root["not="](x,undefined);
return $$TMP336;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP335;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP352=0;
   $$TMP352<arguments.length;
   ++$$TMP352){
      forms[$$TMP352-0]=arguments[$$TMP352];
   }
   var $$TMP337;
   $$TMP337=(function(res__MINUSname){
      var $$TMP338;
      $$TMP338=(function(all){
         var $$TMP348;
         $$TMP348=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP350;
            var $$TMP351;
if($$root["null?"](final__MINUSactions)){
$$TMP351=$$root["list"](res__MINUSname);
}
else{
   $$TMP351=final__MINUSactions;
}
$$TMP350=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP351)))))));
return $$TMP350;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP349;
$$TMP349=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP349;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP348;
}
)($$root["map"]((function(form){
   var $$TMP339;
   $$TMP339=(function(__GS18){
      var $$TMP340;
      var $$TMP341;
if($$root["equal?"](__GS18,(new $$root.Symbol("let")))){
$$TMP341=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP342;
if($$root["equal?"](__GS18,(new $$root.Symbol("for")))){
$$TMP342=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP343;
if($$root["equal?"](__GS18,(new $$root.Symbol("while")))){
$$TMP343=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP344;
if($$root["equal?"](__GS18,(new $$root.Symbol("do")))){
$$TMP344=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP345;
if($$root["equal?"](__GS18,(new $$root.Symbol("collecting")))){
$$TMP345=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP346;
if($$root["equal?"](__GS18,(new $$root.Symbol("finally")))){
$$TMP346=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP347;
   if(true){
$$TMP347=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP347=undefined;
}
$$TMP346=$$TMP347;
}
$$TMP345=$$TMP346;
}
$$TMP344=$$TMP345;
}
$$TMP343=$$TMP344;
}
$$TMP342=$$TMP343;
}
$$TMP341=$$TMP342;
}
$$TMP340=$$TMP341;
return $$TMP340;
}
)($$root["car"](form));
return $$TMP339;
}
),forms));
return $$TMP338;
}
)($$root["gensym"]());
return $$TMP337;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP357=1;
   $$TMP357<arguments.length;
   ++$$TMP357){
      kvs[$$TMP357-1]=arguments[$$TMP357];
   }
   var $$TMP353;
   $$TMP353=(function(meta){
      var $$TMP354;
      var $$TMP355;
if($$root["not"](meta)){
   var $$TMP356;
   {
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP356=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
}
$$TMP355=$$TMP356;
}
else{
   $$TMP355=undefined;
}
$$TMP355;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP354=obj;
return $$TMP354;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP353;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP358;
$$TMP358=$$root["print"](($$root["JSON"]).stringify($$root["geti-safe"](x,(new $$root.Symbol("meta")))));
return $$TMP358;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP361=1;
   $$TMP361<arguments.length;
   ++$$TMP361){
      fields[$$TMP361-1]=arguments[$$TMP361];
   }
   var $$TMP359;
$$TMP359=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP360;
$$TMP360=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP360;
}
),fields))));
return $$TMP359;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP362;
   $$TMP362=(s).slice(start,end);
   return $$TMP362;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP363;
$$TMP363=$$root["<"](x,0);
return $$TMP363;
}
);
$$root["neg?"];
$$root["int"]=(function(x){
   var $$TMP364;
   var $$TMP365;
if($$root["neg?"](x)){
$$TMP365=($$root["Math"]).ceil(x);
}
else{
$$TMP365=($$root["Math"]).floor(x);
}
$$TMP364=$$TMP365;
return $$TMP364;
}
);
$$root["int"];
$$root["idiv"]=(function(a,b){
   var $$TMP366;
$$TMP366=$$root["int"]($$root["/"](a,b));
return $$TMP366;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP367;
   var $$TMP368;
if($$root["string?"](x)){
$$TMP368=$$root["="]($$root["geti-safe"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP369;
if($$root["list?"](x)){
$$TMP369=$$root["null?"](x);
}
else{
   var $$TMP370;
   if(true){
$$TMP370=$$root["error"]("Type error in empty?");
}
else{
   $$TMP370=undefined;
}
$$TMP369=$$TMP370;
}
$$TMP368=$$TMP369;
}
$$TMP367=$$TMP368;
return $$TMP367;
}
);
$$root["empty?"];
$$root["with-fields"]=(function(fields,obj){
   var body=Array(arguments.length-2);
   for(var $$TMP374=2;
   $$TMP374<arguments.length;
   ++$$TMP374){
      body[$$TMP374-2]=arguments[$$TMP374];
   }
   var $$TMP371;
   $$TMP371=(function(obj__MINUSsym){
      var $$TMP372;
$$TMP372=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](obj__MINUSsym),$$root["list"](obj),$$root["interleave"](fields,$$root["map"]((function(field){
   var $$TMP373;
$$TMP373=$$root["concat"]($$root["list"]((new $$root.Symbol("."))),$$root["list"](obj__MINUSsym),$$root["list"](field));
return $$TMP373;
}
),fields)))),body);
return $$TMP372;
}
)($$root["gensym"]());
return $$TMP371;
}
);
$$root["with-fields"];
$$root["setmac!"]($$root["with-fields"]);
$$root["inside?"]=(function(x,x0,x1){
   var $$TMP375;
   var $$TMP376;
if($$root[">="](x,x0)){
   var $$TMP377;
if($$root["<="](x,x1)){
   $$TMP377=true;
}
else{
   $$TMP377=false;
}
$$TMP376=$$TMP377;
}
else{
   $$TMP376=false;
}
$$TMP375=$$TMP376;
return $$TMP375;
}
);
$$root["inside?"];
$$root["clamp"]=(function(x,x0,x1){
   var $$TMP378;
   var $$TMP379;
if($$root["<"](x,x0)){
   $$TMP379=x0;
}
else{
   var $$TMP380;
if($$root[">"](x,x1)){
   $$TMP380=x1;
}
else{
   $$TMP380=x;
}
$$TMP379=$$TMP380;
}
$$TMP378=$$TMP379;
return $$TMP378;
}
);
$$root["clamp"];
$$root["randf"]=(function(min,max){
   var $$TMP381;
$$TMP381=$$root["+"](min,$$root["*"]($$root["-"](max,min),($$root["Math"]).random()));
return $$TMP381;
}
);
$$root["randf"];
$$root["randi"]=(function(min,max){
   var $$TMP382;
$$TMP382=$$root["int"]($$root["randf"](min,max));
return $$TMP382;
}
);
$$root["randi"];
$$root["random-element"]=(function(lst){
   var $$TMP383;
$$TMP383=$$root["nth"]($$root["randi"](0,$$root["count"](lst)),lst);
return $$TMP383;
}
);
$$root["random-element"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP384;
   $$TMP384=(function(self){
      var $$TMP385;
      $$TMP385=(function(__GS19){
         var $$TMP386;
$$root["seti!"](__GS19,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS19,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS19,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS19,(new $$root.Symbol("len")),len);
$$TMP386=__GS19;
return $$TMP386;
}
)(self);
return $$TMP385;
}
)(this);
return $$TMP384;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP387;
   $$TMP387=(function(self){
      var $$TMP388;
$$TMP388=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti-safe"](self,(new $$root.Symbol("start"))),$$root["geti-safe"](self,(new $$root.Symbol("len"))));
return $$TMP388;
}
)(this);
return $$TMP387;
}
));
$$root["lit"]=(function(s){
   var $$TMP389;
$$TMP389=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP389;
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
   var $$TMP390;
   $$TMP390=(function(toks,pos,s){
      var $$TMP391;
      (function(__GS20,__GS21){
         var $$TMP392;
         $$TMP392=(function(recur){
            var $$TMP394;
            var $$TMP395;
            while(true){
               __GS20=true;
               __GS20;
               var $$TMP396;
if($$root[">"]($$root["geti-safe"](s,(new $$root.Symbol("length"))),0)){
   var $$TMP397;
   {
      (function(__GS22,res,i,__GS23,__GS24,entry,_){
         var $$TMP398;
         $$TMP398=(function(__GS25,__GS26){
            var $$TMP399;
            $$TMP399=(function(recur){
               var $$TMP401;
               var $$TMP402;
               while(true){
                  __GS25=true;
                  __GS25;
                  var $$TMP403;
                  var $$TMP404;
if($$root["<"](i,__GS23)){
   var $$TMP405;
if($$root["not"]($$root["null?"](__GS24))){
   var $$TMP406;
if($$root["not"](res)){
   $$TMP406=true;
}
else{
   $$TMP406=false;
}
$$TMP405=$$TMP406;
}
else{
   $$TMP405=false;
}
$$TMP404=$$TMP405;
}
else{
   $$TMP404=false;
}
if($$TMP404){
   var $$TMP407;
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
$$TMP407=recur();
}
$$TMP403=$$TMP407;
}
else{
   var $$TMP408;
   {
      _=__GS22;
      _;
      var $$TMP409;
      if(res){
         var $$TMP410;
         {
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP411;
if($$root["not="]($$root["second"](entry),-1)){
   var $$TMP412;
   {
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP413;
   var $$TMP414;
   if(c){
      $$TMP414=c;
   }
   else{
$$TMP414=$$root["second"](entry);
}
$$TMP413=$$TMP414;
return $$TMP413;
}
)($$root["geti"]($$root["keywords"],$$root["geti-safe"](res,0))),pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP412=toks;
}
$$TMP411=$$TMP412;
}
else{
   $$TMP411=undefined;
}
$$TMP411;
pos=$$root["+"](pos,$$root["geti-safe"]($$root["geti-safe"](res,0),(new $$root.Symbol("length"))));
$$TMP410=pos;
}
$$TMP409=$$TMP410;
}
else{
$$TMP409=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS22=$$TMP409;
$$TMP408=__GS22;
}
$$TMP403=$$TMP408;
}
__GS26=$$TMP403;
__GS26;
var $$TMP415;
if($$root["not"](__GS25)){
   continue;
   $$TMP415=undefined;
}
else{
   $$TMP415=__GS26;
}
$$TMP402=$$TMP415;
break;
}
$$TMP401=$$TMP402;
return $$TMP401;
}
)((function(){
   var $$TMP400;
   __GS25=false;
   $$TMP400=__GS25;
   return $$TMP400;
}
));
return $$TMP399;
}
)(false,undefined);
return $$TMP398;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP397=recur();
}
$$TMP396=$$TMP397;
}
else{
   $$TMP396=undefined;
}
__GS21=$$TMP396;
__GS21;
var $$TMP416;
if($$root["not"](__GS20)){
   continue;
   $$TMP416=undefined;
}
else{
   $$TMP416=__GS21;
}
$$TMP395=$$TMP416;
break;
}
$$TMP394=$$TMP395;
return $$TMP394;
}
)((function(){
   var $$TMP393;
   __GS20=false;
   $$TMP393=__GS20;
   return $$TMP393;
}
));
return $$TMP392;
}
)(false,undefined);
$$TMP391=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP391;
}
)([],0,src);
return $$TMP390;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP417;
   $$TMP417=(function(self){
      var $$TMP418;
$$TMP418=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP418;
}
)(this);
return $$TMP417;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP419;
   $$TMP419=(function(self){
      var $$TMP420;
$$TMP420=$$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos"))));
return $$TMP420;
}
)(this);
return $$TMP419;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP421;
   $$TMP421=(function(self){
      var $$TMP422;
      $$TMP422=(function(curr){
         var $$TMP423;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
$$TMP423=curr;
return $$TMP423;
}
)($$root["car"]($$root["geti-safe"](self,(new $$root.Symbol("pos")))));
return $$TMP422;
}
)(this);
return $$TMP421;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP424;
$$TMP424=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP424;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP425;
$$TMP425=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP425;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP426;
   $$TMP426=(function(self){
      var $$TMP427;
      $$TMP427=(function(tok){
         var $$TMP428;
         $$TMP428=(function(__GS27){
            var $$TMP429;
            var $$TMP430;
if($$root["equal?"](__GS27,(new $$root.Symbol("list-open-tok")))){
$$TMP430=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP431;
if($$root["equal?"](__GS27,(new $$root.Symbol("true-tok")))){
   $$TMP431=true;
}
else{
   var $$TMP432;
if($$root["equal?"](__GS27,(new $$root.Symbol("false-tok")))){
   $$TMP432=false;
}
else{
   var $$TMP433;
if($$root["equal?"](__GS27,(new $$root.Symbol("null-tok")))){
   $$TMP433=[];
}
else{
   var $$TMP434;
if($$root["equal?"](__GS27,(new $$root.Symbol("undef-tok")))){
   $$TMP434=undefined;
}
else{
   var $$TMP435;
if($$root["equal?"](__GS27,(new $$root.Symbol("num-tok")))){
$$TMP435=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP436;
if($$root["equal?"](__GS27,(new $$root.Symbol("str-tok")))){
$$TMP436=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP437;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote-tok")))){
$$TMP437=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP438;
if($$root["equal?"](__GS27,(new $$root.Symbol("backquote-tok")))){
$$TMP438=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP439;
if($$root["equal?"](__GS27,(new $$root.Symbol("sym-tok")))){
$$TMP439=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP440;
   if(true){
$$TMP440=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti-safe"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP440=undefined;
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
}
$$TMP433=$$TMP434;
}
$$TMP432=$$TMP433;
}
$$TMP431=$$TMP432;
}
$$TMP430=$$TMP431;
}
$$TMP429=$$TMP430;
return $$TMP429;
}
)($$root["geti-safe"](tok,(new $$root.Symbol("type"))));
return $$TMP428;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP427;
}
)(this);
return $$TMP426;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP441;
   $$TMP441=(function(s){
      var $$TMP442;
$$TMP442=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP442;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP441;
}
);
$$root["set-source-pos!"];
$$root["get-source-pos"]=(function(o){
   var $$TMP443;
$$TMP443=$$root["deep-geti"](o,(new $$root.Symbol("meta")),(new $$root.Symbol("source-pos")));
return $$TMP443;
}
);
$$root["get-source-pos"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP444;
   $$TMP444=(function(self){
      var $$TMP445;
      $$TMP445=(function(start__MINUSpos){
         var $$TMP446;
         $$TMP446=(function(__GS28,__GS29,lst){
            var $$TMP447;
            $$TMP447=(function(__GS30,__GS31){
               var $$TMP448;
               $$TMP448=(function(recur){
                  var $$TMP450;
                  var $$TMP451;
                  while(true){
                     __GS30=true;
                     __GS30;
                     var $$TMP452;
                     var $$TMP453;
                     var $$TMP454;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP455;
$$root["t"]=$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP455=true;
}
else{
   $$TMP455=false;
}
$$TMP454=$$TMP455;
}
else{
   $$TMP454=false;
}
if($$TMP454){
   $$TMP453=true;
}
else{
   $$TMP453=false;
}
if($$TMP453){
   var $$TMP456;
   {
__GS29=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS29);
__GS28=__GS29;
__GS28;
$$TMP456=recur();
}
$$TMP452=$$TMP456;
}
else{
   var $$TMP457;
   {
__GS28=$$root["reverse"](__GS29);
__GS28;
lst=__GS28;
lst;
var $$TMP458;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP458=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP458=$$root["error"]("Unmatched paren!");
}
__GS28=$$TMP458;
$$TMP457=__GS28;
}
$$TMP452=$$TMP457;
}
__GS31=$$TMP452;
__GS31;
var $$TMP459;
if($$root["not"](__GS30)){
   continue;
   $$TMP459=undefined;
}
else{
   $$TMP459=__GS31;
}
$$TMP451=$$TMP459;
break;
}
$$TMP450=$$TMP451;
return $$TMP450;
}
)((function(){
   var $$TMP449;
   __GS30=false;
   $$TMP449=__GS30;
   return $$TMP449;
}
));
return $$TMP448;
}
)(false,undefined);
return $$TMP447;
}
)(undefined,[],undefined);
return $$TMP446;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP445;
}
)(this);
return $$TMP444;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP460;
   $$TMP460=(function(self){
      var $$TMP461;
      $$TMP461=(function(__GS32,__GS33,lst){
         var $$TMP462;
         $$TMP462=(function(__GS34,__GS35){
            var $$TMP463;
            $$TMP463=(function(recur){
               var $$TMP465;
               var $$TMP466;
               while(true){
                  __GS34=true;
                  __GS34;
                  var $$TMP467;
                  var $$TMP468;
                  var $$TMP469;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP470;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP470=true;
}
else{
   $$TMP470=false;
}
$$TMP469=$$TMP470;
}
else{
   $$TMP469=false;
}
if($$TMP469){
   $$TMP468=true;
}
else{
   $$TMP468=false;
}
if($$TMP468){
   var $$TMP471;
   {
__GS33=$$root["cons"]((function(__GS36){
   var $$TMP472;
   var $$TMP473;
if($$root["equal?"](__GS36,(new $$root.Symbol("unquote-tok")))){
   var $$TMP474;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP474=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP473=$$TMP474;
}
else{
   var $$TMP475;
if($$root["equal?"](__GS36,(new $$root.Symbol("splice-tok")))){
   var $$TMP476;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP476=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
}
$$TMP475=$$TMP476;
}
else{
   var $$TMP477;
   if(true){
$$TMP477=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP477=undefined;
}
$$TMP475=$$TMP477;
}
$$TMP473=$$TMP475;
}
$$TMP472=$$TMP473;
return $$TMP472;
}
)($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS33);
__GS32=__GS33;
__GS32;
$$TMP471=recur();
}
$$TMP467=$$TMP471;
}
else{
   var $$TMP478;
   {
__GS32=$$root["reverse"](__GS33);
__GS32;
lst=__GS32;
lst;
var $$TMP479;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP479=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP479=$$root["error"]("Unmatched paren!");
}
__GS32=$$TMP479;
$$TMP478=__GS32;
}
$$TMP467=$$TMP478;
}
__GS35=$$TMP467;
__GS35;
var $$TMP480;
if($$root["not"](__GS34)){
   continue;
   $$TMP480=undefined;
}
else{
   $$TMP480=__GS35;
}
$$TMP466=$$TMP480;
break;
}
$$TMP465=$$TMP466;
return $$TMP465;
}
)((function(){
   var $$TMP464;
   __GS34=false;
   $$TMP464=__GS34;
   return $$TMP464;
}
));
return $$TMP463;
}
)(false,undefined);
return $$TMP462;
}
)(undefined,[],undefined);
return $$TMP461;
}
)(this);
return $$TMP460;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP481;
   $$TMP481=(function(self){
      var $$TMP482;
      var $$TMP483;
if($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   var $$TMP484;
   {
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP484=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
}
$$TMP483=$$TMP484;
}
else{
$$TMP483=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP482=$$TMP483;
return $$TMP482;
}
)(this);
return $$TMP481;
}
));
$$root["parse"]=(function(toks){
   var $$TMP485;
   $$TMP485=(function(p){
      var $$TMP486;
      $$TMP486=(function(__GS37,__GS38){
         var $$TMP487;
         $$TMP487=(function(__GS39,__GS40){
            var $$TMP488;
            $$TMP488=(function(recur){
               var $$TMP490;
               var $$TMP491;
               while(true){
                  __GS39=true;
                  __GS39;
                  var $$TMP492;
                  var $$TMP493;
if($$root["not"]($$root["equal?"]($$root["geti-safe"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP493=true;
}
else{
   $$TMP493=false;
}
if($$TMP493){
   var $$TMP494;
   {
__GS38=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS38);
__GS37=__GS38;
__GS37;
$$TMP494=recur();
}
$$TMP492=$$TMP494;
}
else{
   var $$TMP495;
   {
__GS37=$$root["reverse"](__GS38);
$$TMP495=__GS37;
}
$$TMP492=$$TMP495;
}
__GS40=$$TMP492;
__GS40;
var $$TMP496;
if($$root["not"](__GS39)){
   continue;
   $$TMP496=undefined;
}
else{
   $$TMP496=__GS40;
}
$$TMP491=$$TMP496;
break;
}
$$TMP490=$$TMP491;
return $$TMP490;
}
)((function(){
   var $$TMP489;
   __GS39=false;
   $$TMP489=__GS39;
   return $$TMP489;
}
));
return $$TMP488;
}
)(false,undefined);
return $$TMP487;
}
)(undefined,[]);
return $$TMP486;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP485;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS41){
   var $$TMP497;
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
$$TMP497=__GS41;
return $$TMP497;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP498;
$$TMP498=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP498;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP499;
$$TMP499=$$root["geti"]($$root["mangling-table"],x);
return $$TMP499;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP500;
$$TMP500=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP500;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP501;
   $$TMP501=(function(__GS42){
      var $$TMP502;
$$root["seti!"](__GS42,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS42,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS42,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP502=__GS42;
return $$TMP502;
}
)($$root["hashmap"]());
return $$TMP501;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP503;
   $$TMP503=(function(__GS43){
      var $$TMP504;
$$root["seti!"](__GS43,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS43,(new $$root.Symbol("mappings")),mappings);
$$TMP504=__GS43;
return $$TMP504;
}
)($$root["hashmap"]());
return $$TMP503;
}
);
$$root["make-tc-str"];
$$root["str->tc"]=(function(s){
   var $$TMP505;
$$TMP505=$$root["make-tc-str"](s,[]);
return $$TMP505;
}
);
$$root["str->tc"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP506;
   $$TMP506=(function(adder){
      var $$TMP508;
$$TMP508=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP508;
}
)((function(x){
   var $$TMP507;
$$TMP507=$$root["+"](x,n);
return $$TMP507;
}
));
return $$TMP506;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-strs1"]=(function(a,b){
   var $$TMP509;
   var $$TMP510;
if($$root["string?"](b)){
$$TMP510=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),b),$$root["geti-safe"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP510=$$root["make-tc-str"]($$root["str"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),$$root["geti-safe"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti-safe"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP511;
$$TMP511=$$root["offset-source-mapping"](e,$$root["geti-safe"]($$root["geti-safe"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP511;
}
),$$root["geti-safe"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP509=$$TMP510;
return $$TMP509;
}
);
$$root["concat-tc-strs1"];
$$root["concat-tc-str"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP513=0;
   $$TMP513<arguments.length;
   ++$$TMP513){
      args[$$TMP513-0]=arguments[$$TMP513];
   }
   var $$TMP512;
$$TMP512=$$root["reduce"]($$root["concat-tc-strs1"],args,$$root["make-tc-str"]("",[]));
return $$TMP512;
}
);
$$root["concat-tc-str"];
$$root["join-tc-strs"]=(function(sep,xs){
   var $$TMP514;
$$TMP514=$$root["reduce"]($$root["concat-tc-str"],$$root["interpose"](sep,xs),$$root["make-tc-str"]("",[]));
return $$TMP514;
}
);
$$root["join-tc-strs"];
$$root["format-tc"]=(function(source__MINUSpos,fmt){
   var args=Array(arguments.length-2);
   for(var $$TMP530=2;
   $$TMP530<arguments.length;
   ++$$TMP530){
      args[$$TMP530-2]=arguments[$$TMP530];
   }
   var $$TMP515;
   $$TMP515=(function(rx){
      var $$TMP516;
      $$TMP516=(function(__GS44,accum,__GS45,x,n,_){
         var $$TMP517;
         $$TMP517=(function(__GS46,__GS47){
            var $$TMP518;
            $$TMP518=(function(recur){
               var $$TMP520;
               var $$TMP521;
               while(true){
                  __GS46=true;
                  __GS46;
                  var $$TMP522;
                  var $$TMP523;
if($$root["not"]($$root["null?"](__GS45))){
   $$TMP523=true;
}
else{
   $$TMP523=false;
}
if($$TMP523){
   var $$TMP524;
   {
x=$$root["car"](__GS45);
x;
var $$TMP525;
if($$root["even?"](n)){
   $$TMP525=x;
}
else{
$$TMP525=$$root["nth"]($$root["parseInt"](x),args);
}
accum=$$root["concat-tc-str"](accum,$$TMP525);
__GS44=accum;
__GS44;
__GS45=$$root["cdr"](__GS45);
__GS45;
n=$$root["+"](n,1);
n;
$$TMP524=recur();
}
$$TMP522=$$TMP524;
}
else{
   var $$TMP526;
   {
      _=__GS44;
      _;
      var $$TMP527;
      if(source__MINUSpos){
         var $$TMP528;
         {
$$TMP528=$$root["seti!"](accum,(new $$root.Symbol("mappings")),$$root["cons"]($$root["make-source-mapping"]($$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("start"))),$$root["geti-safe"](source__MINUSpos,(new $$root.Symbol("end"))),0,$$root["geti-safe"]($$root["geti-safe"](accum,(new $$root.Symbol("data"))),(new $$root.Symbol("length")))),$$root["geti-safe"](accum,(new $$root.Symbol("mappings")))));
}
$$TMP527=$$TMP528;
}
else{
   $$TMP527=undefined;
}
$$TMP527;
__GS44=accum;
$$TMP526=__GS44;
}
$$TMP522=$$TMP526;
}
__GS47=$$TMP522;
__GS47;
var $$TMP529;
if($$root["not"](__GS46)){
   continue;
   $$TMP529=undefined;
}
else{
   $$TMP529=__GS47;
}
$$TMP521=$$TMP529;
break;
}
$$TMP520=$$TMP521;
return $$TMP520;
}
)((function(){
   var $$TMP519;
   __GS46=false;
   $$TMP519=__GS46;
   return $$TMP519;
}
));
return $$TMP518;
}
)(false,undefined);
return $$TMP517;
}
)(undefined,$$root["make-tc-str"]("",[]),(fmt).split(rx),[],0,undefined);
return $$TMP516;
}
)($$root["regex"]("%([0-9]+)","gi"));
return $$TMP515;
}
);
$$root["format-tc"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP531;
   $$TMP531=(function(self){
      var $$TMP532;
      $$TMP532=(function(__GS48){
         var $$TMP533;
$$root["seti!"](__GS48,"root",root);
$$root["seti!"](__GS48,"next-var-suffix",0);
$$TMP533=__GS48;
return $$TMP533;
}
)(self);
return $$TMP532;
}
)(this);
return $$TMP531;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP534;
   $$TMP534=(function(self){
      var $$TMP535;
      $$TMP535=(function(out){
         var $$TMP536;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP536=out;
return $$TMP536;
}
)($$root["str"]("$$TMP",$$root["geti-safe"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP535;
}
)(this);
return $$TMP534;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP537;
   var $$TMP538;
if($$root["in?"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),lexenv)){
$$TMP538=$$root["mangle-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP538=$$root["str"]("$$root[\"",$$root["geti-safe"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP537=$$TMP538;
return $$TMP537;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP539;
   $$TMP539=(function(self){
      var $$TMP540;
      var $$TMP541;
if($$root["="](x,true)){
$$TMP541=$$root["list"]($$root["str->tc"]("true"),$$root["str->tc"](""));
}
else{
   var $$TMP542;
if($$root["="](x,false)){
$$TMP542=$$root["list"]($$root["str->tc"]("false"),$$root["str->tc"](""));
}
else{
   var $$TMP543;
if($$root["null?"](x)){
$$TMP543=$$root["list"]($$root["str->tc"]("[]"),$$root["str->tc"](""));
}
else{
   var $$TMP544;
if($$root["="](x,undefined)){
$$TMP544=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"](""));
}
else{
   var $$TMP545;
if($$root["symbol?"](x)){
$$TMP545=$$root["list"]($$root["str->tc"]($$root["compile-time-resolve"](lexenv,x)),$$root["str->tc"](""));
}
else{
   var $$TMP546;
if($$root["string?"](x)){
$$TMP546=$$root["list"]($$root["str->tc"]($$root["escape-str"](x)),$$root["str->tc"](""));
}
else{
   var $$TMP547;
   if(true){
$$TMP547=$$root["list"]($$root["str->tc"]($$root["str"](x)),$$root["str->tc"](""));
}
else{
   $$TMP547=undefined;
}
$$TMP546=$$TMP547;
}
$$TMP545=$$TMP546;
}
$$TMP544=$$TMP545;
}
$$TMP543=$$TMP544;
}
$$TMP542=$$TMP543;
}
$$TMP541=$$TMP542;
}
$$TMP540=$$TMP541;
return $$TMP540;
}
)(this);
return $$TMP539;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP548;
   $$TMP548=(function(self){
      var $$TMP549;
      $$TMP549=(function(__GS49){
         var $$TMP550;
         $$TMP550=(function(fun,args){
            var $$TMP551;
            $$TMP551=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP552;
$$TMP552=$$root["list"]($$root["format-tc"]($$root["get-source-pos"](lst),"%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP552;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP551;
}
)($$root["nth"](0,__GS49),$$root["drop"](1,__GS49));
return $$TMP550;
}
)(lst);
return $$TMP549;
}
)(this);
return $$TMP548;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP553;
   $$TMP553=(function(self){
      var $$TMP554;
      $$TMP554=(function(__GS50){
         var $$TMP555;
         $$TMP555=(function(fun,args){
            var $$TMP556;
            $$TMP556=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP557;
$$TMP557=$$root["list"]($$root["format-tc"](undefined,"(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSfun),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP557;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP556;
}
)($$root["nth"](1,__GS50),$$root["drop"](2,__GS50));
return $$TMP555;
}
)(lst);
return $$TMP554;
}
)(this);
return $$TMP553;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP558;
   $$TMP558=(function(self){
      var $$TMP559;
      $$TMP559=(function(__GS51){
         var $$TMP560;
         $$TMP560=(function(method,obj,args){
            var $$TMP561;
            $$TMP561=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP562;
$$TMP562=$$root["list"]($$root["format-tc"](undefined,"(%0)%1(%2)",$$root["first"](compiled__MINUSobj),$$root["str"](method),$$root["join-tc-strs"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["concat-tc-str"]($$root["second"](compiled__MINUSobj),$$root["join-tc-strs"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP562;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP561;
}
)($$root["nth"](0,__GS51),$$root["nth"](1,__GS51),$$root["drop"](2,__GS51));
return $$TMP560;
}
)(lst);
return $$TMP559;
}
)(this);
return $$TMP558;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP563;
   $$TMP563=(function(self){
      var $$TMP564;
      $$TMP564=(function(compiled__MINUSbody,reducer){
         var $$TMP566;
$$TMP566=$$root["concat-tc-str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP566;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP565;
$$TMP565=$$root["concat-tc-str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP565;
}
));
return $$TMP564;
}
)(this);
return $$TMP563;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP567;
$$TMP567=$$root["="]($$root["geti-safe"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP567;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP568;
   var $$TMP569;
if($$root["is-vararg?"](sym)){
$$TMP569=$$root["call-method-by-name"]($$root["geti-safe"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP569=$$root["geti-safe"](sym,(new $$root.Symbol("name")));
}
$$TMP568=$$TMP569;
return $$TMP568;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP570;
$$TMP570=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP571;
$$TMP571=$$root["mangle-name"]($$root["geti-safe"](v,(new $$root.Symbol("name"))));
return $$TMP571;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP570;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP572;
   $$TMP572=(function(self){
      var $$TMP573;
      var $$TMP574;
if($$root["not"]($$root["null?"](args))){
   var $$TMP575;
   {
$$TMP575=$$root["last"](args);
}
$$TMP574=$$TMP575;
}
else{
   $$TMP574=undefined;
}
$$TMP573=(function(last__MINUSarg){
   var $$TMP576;
   var $$TMP577;
   var $$TMP578;
   if(last__MINUSarg){
      var $$TMP579;
if($$root["is-vararg?"](last__MINUSarg)){
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
$$TMP577=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti-safe"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP577="";
}
$$TMP576=$$TMP577;
return $$TMP576;
}
)($$TMP574);
return $$TMP573;
}
)(this);
return $$TMP572;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP580;
   $$TMP580=(function(self){
      var $$TMP581;
      $$TMP581=(function(__GS52){
         var $$TMP582;
         $$TMP582=(function(__GS53){
            var $$TMP583;
            $$TMP583=(function(args,body){
               var $$TMP584;
               $$TMP584=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP586;
                  $$TMP586=(function(compiled__MINUSbody){
                     var $$TMP587;
$$TMP587=$$root["list"]($$root["format-tc"](undefined,$$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),$$root["str->tc"](""));
return $$TMP587;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP586;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP585;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP585=accum;
return $$TMP585;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP584;
}
)($$root["drop"](0,__GS53),$$root["drop"](2,__GS52));
return $$TMP583;
}
)($$root["nth"](1,__GS52));
return $$TMP582;
}
)(lst);
return $$TMP581;
}
)(this);
return $$TMP580;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-dumb-loop")),(function(lexenv,lst){
   var $$TMP588;
   $$TMP588=(function(self){
      var $$TMP589;
      $$TMP589=(function(__GS54){
         var $$TMP590;
         $$TMP590=(function(body){
            var $$TMP591;
            $$TMP591=(function(value__MINUSvar__MINUSname){
               var $$TMP592;
               $$TMP592=(function(compiled__MINUSbody){
                  var $$TMP593;
$$TMP593=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;while(true){%1break;}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP593;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP592;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP591;
}
)($$root["drop"](1,__GS54));
return $$TMP590;
}
)(lst);
return $$TMP589;
}
)(this);
return $$TMP588;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-continue")),(function(lexenv,lst){
   var $$TMP594;
   $$TMP594=(function(self){
      var $$TMP595;
$$TMP595=$$root["list"]($$root["str->tc"]("undefined"),$$root["str->tc"]("continue;"));
return $$TMP595;
}
)(this);
return $$TMP594;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-progn")),(function(lexenv,lst){
   var $$TMP596;
   $$TMP596=(function(self){
      var $$TMP597;
      $$TMP597=(function(__GS55){
         var $$TMP598;
         $$TMP598=(function(body){
            var $$TMP599;
            $$TMP599=(function(value__MINUSvar__MINUSname){
               var $$TMP600;
               $$TMP600=(function(compiled__MINUSbody){
                  var $$TMP601;
$$TMP601=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,"var %0;{%1}",value__MINUSvar__MINUSname,compiled__MINUSbody));
return $$TMP601;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv,body,value__MINUSvar__MINUSname));
return $$TMP600;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP599;
}
)($$root["drop"](1,__GS55));
return $$TMP598;
}
)(lst);
return $$TMP597;
}
)(this);
return $$TMP596;
}
));
$$root["compile"]=(function(expr){
   var $$TMP602;
   $$TMP602=(function(c){
      var $$TMP603;
      $$TMP603=(function(t){
         var $$TMP604;
$$TMP604=$$root["str"]($$root["geti-safe"]($$root["second"](t),(new $$root.Symbol("data")))," -> ",$$root["geti-safe"]($$root["first"](t),(new $$root.Symbol("data"))));
return $$TMP604;
}
)((c).compile($$root["hashmap"](),expr));
return $$TMP603;
}
)($$root["make-instance"]($$root["compiler-proto"],$$root["object"]($$root["*ns*"])));
return $$TMP602;
}
);
$$root["compile"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP605;
   $$TMP605=(function(self){
      var $$TMP606;
      $$TMP606=(function(__GS56){
         var $$TMP607;
         $$TMP607=(function(c,t,f){
            var $$TMP608;
            $$TMP608=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP609;
$$TMP609=$$root["list"]($$root["str->tc"](value__MINUSvar__MINUSname),$$root["format-tc"](undefined,$$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP609;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP608;
}
)($$root["nth"](1,__GS56),$$root["nth"](2,__GS56),$$root["nth"](3,__GS56));
return $$TMP607;
}
)(lst);
return $$TMP606;
}
)(this);
return $$TMP605;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP610;
   $$TMP610=(function(self){
      var $$TMP611;
      var $$TMP612;
if($$root["symbol?"](x)){
$$TMP612=$$root["list"]($$root["str->tc"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti-safe"](x,(new $$root.Symbol("name"))),"\"))")),$$root["str->tc"](""));
}
else{
$$TMP612=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP611=$$TMP612;
return $$TMP611;
}
)(this);
return $$TMP610;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP613;
   $$TMP613=(function(self){
      var $$TMP614;
$$TMP614=$$root["list"]($$root["concat-tc-str"]("$$root.list(",$$root["join-tc-strs"](",",$$root["map"]($$root["compose"]($$root["first"],$$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv)),lst)),")"),$$root["str->tc"](""));
return $$TMP614;
}
)(this);
return $$TMP613;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP615;
   $$TMP615=(function(self){
      var $$TMP616;
      var $$TMP617;
if($$root["atom?"](x)){
$$TMP617=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP617=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP616=$$TMP617;
return $$TMP616;
}
)(this);
return $$TMP615;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP618;
   $$TMP618=(function(self){
      var $$TMP619;
      $$TMP619=(function(__GS57){
         var $$TMP620;
         $$TMP620=(function(name,value){
            var $$TMP621;
            $$TMP621=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP622;
$$TMP622=$$root["list"]($$root["str->tc"](var__MINUSname),$$root["concat-tc-str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP622;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP621;
}
)($$root["nth"](1,__GS57),$$root["nth"](2,__GS57));
return $$TMP620;
}
)(lst);
return $$TMP619;
}
)(this);
return $$TMP618;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP623;
   $$TMP623=(function(self){
      var $$TMP624;
      $$TMP624=(function(__GS58){
         var $$TMP625;
         $$TMP625=(function(name,args){
            var $$TMP626;
            $$TMP626=(function(tmp){
               var $$TMP628;
$$TMP628=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["geti-safe"]($$root["second"](tmp),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](tmp),(new $$root.Symbol("data")))));
return $$TMP628;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP627;
$$TMP627=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP627;
}
),args))));
return $$TMP626;
}
)($$root["nth"](0,__GS58),$$root["drop"](1,__GS58));
return $$TMP625;
}
)(expr);
return $$TMP624;
}
)(this);
return $$TMP623;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP629;
   $$TMP629=(function(self){
      var $$TMP630;
      var $$TMP631;
if($$root["in?"](name,$$root["geti-safe"](self,(new $$root.Symbol("root"))))){
   var $$TMP632;
if($$root["geti"]($$root["geti"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP632=true;
}
else{
   $$TMP632=false;
}
$$TMP631=$$TMP632;
}
else{
   $$TMP631=false;
}
$$TMP630=$$TMP631;
return $$TMP630;
}
)(this);
return $$TMP629;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP633;
   $$TMP633=(function(self){
      var $$TMP634;
      var $$TMP635;
      var $$TMP636;
if($$root["list?"](expr)){
   var $$TMP637;
if($$root["not"]($$root["null?"](expr))){
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
if($$TMP636){
   $$TMP635=(function(first){
      var $$TMP638;
      var $$TMP639;
if($$root["symbol?"](first)){
   $$TMP639=(function(__GS59){
      var $$TMP640;
      var $$TMP641;
if($$root["equal?"](__GS59,(new $$root.Symbol("lambda")))){
$$TMP641=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP642;
if($$root["equal?"](__GS59,(new $$root.Symbol("progn")))){
$$TMP642=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-progn")),lexenv,expr);
}
else{
   var $$TMP643;
if($$root["equal?"](__GS59,(new $$root.Symbol("dumb-loop")))){
$$TMP643=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-dumb-loop")),lexenv,expr);
}
else{
   var $$TMP644;
if($$root["equal?"](__GS59,(new $$root.Symbol("continue")))){
$$TMP644=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-continue")),lexenv,expr);
}
else{
   var $$TMP645;
if($$root["equal?"](__GS59,(new $$root.Symbol("new")))){
$$TMP645=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP646;
if($$root["equal?"](__GS59,(new $$root.Symbol("if")))){
$$TMP646=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP647;
if($$root["equal?"](__GS59,(new $$root.Symbol("quote")))){
$$TMP647=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP648;
if($$root["equal?"](__GS59,(new $$root.Symbol("setv!")))){
$$TMP648=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP649;
if($$root["equal?"](__GS59,(new $$root.Symbol("def")))){
$$TMP649=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP650;
   if(true){
      var $$TMP651;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti-safe"](first,(new $$root.Symbol("name"))))){
$$TMP651=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP652;
if($$root["="]($$root["geti-safe"]($$root["geti-safe"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP652=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP653;
   if(true){
$$TMP653=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP653=undefined;
}
$$TMP652=$$TMP653;
}
$$TMP651=$$TMP652;
}
$$TMP650=$$TMP651;
}
else{
   $$TMP650=undefined;
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
}
$$TMP644=$$TMP645;
}
$$TMP643=$$TMP644;
}
$$TMP642=$$TMP643;
}
$$TMP641=$$TMP642;
}
$$TMP640=$$TMP641;
return $$TMP640;
}
)(first);
}
else{
$$TMP639=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP638=$$TMP639;
return $$TMP638;
}
)($$root["car"](expr));
}
else{
$$TMP635=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP634=$$TMP635;
return $$TMP634;
}
)(this);
return $$TMP633;
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
   var $$TMP654;
$$TMP654=$$root["str"]($$root["geti-safe"]($$root["second"](pair),(new $$root.Symbol("data"))),$$root["geti-safe"]($$root["first"](pair),(new $$root.Symbol("data"))));
return $$TMP654;
}
);
$$root["gen-jstr"];
$$root["default-lexenv"]=(function(){
   var $$TMP655;
   $$TMP655=(function(__GS60){
      var $$TMP656;
$$root["seti!"](__GS60,"this",true);
$$TMP656=__GS60;
return $$TMP656;
}
)($$root["object"]());
return $$TMP655;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP657;
   $$TMP657=(function(self){
      var $$TMP658;
      $$TMP658=(function(root,sandbox){
         var $$TMP659;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP660;
$$TMP660=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP660;
}
));
$$root["seti!"](root,"load-file",(function(path){
   var $$TMP661;
$$TMP661=$$root["call-method-by-name"](self,(new $$root.Symbol("load-file")),path);
return $$TMP661;
}
));
$$TMP659=(function(__GS61){
   var $$TMP662;
$$root["seti!"](__GS61,"root",root);
$$root["seti!"](__GS61,"dir-stack",$$root["list"](($$root["process"]).cwd()));
$$root["seti!"](__GS61,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP662=__GS61;
return $$TMP662;
}
)(self);
return $$TMP659;
}
)($$root["make-default-ns"](),$$root["object"]());
return $$TMP658;
}
)(this);
return $$TMP657;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP663;
   $$TMP663=(function(self){
      var $$TMP664;
      $$TMP664=(function(tmp){
         var $$TMP665;
$$TMP665=$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
return $$TMP665;
}
)($$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP664;
}
)(this);
return $$TMP663;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP666;
   $$TMP666=(function(self){
      var $$TMP667;
      $$TMP667=(function(forms){
         var $$TMP668;
         $$TMP668=(function(__GS62,__GS63,form){
            var $$TMP669;
            $$TMP669=(function(__GS64,__GS65){
               var $$TMP670;
               $$TMP670=(function(recur){
                  var $$TMP672;
                  var $$TMP673;
                  while(true){
                     __GS64=true;
                     __GS64;
                     var $$TMP674;
                     var $$TMP675;
if($$root["not"]($$root["null?"](__GS63))){
   $$TMP675=true;
}
else{
   $$TMP675=false;
}
if($$TMP675){
   var $$TMP676;
   {
form=$$root["car"](__GS63);
form;
__GS62=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS62;
__GS63=$$root["cdr"](__GS63);
__GS63;
$$TMP676=recur();
}
$$TMP674=$$TMP676;
}
else{
   var $$TMP677;
   {
      $$TMP677=__GS62;
   }
   $$TMP674=$$TMP677;
}
__GS65=$$TMP674;
__GS65;
var $$TMP678;
if($$root["not"](__GS64)){
   continue;
   $$TMP678=undefined;
}
else{
   $$TMP678=__GS65;
}
$$TMP673=$$TMP678;
break;
}
$$TMP672=$$TMP673;
return $$TMP672;
}
)((function(){
   var $$TMP671;
   __GS64=false;
   $$TMP671=__GS64;
   return $$TMP671;
}
));
return $$TMP670;
}
)(false,undefined);
return $$TMP669;
}
)(undefined,forms,[]);
return $$TMP668;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP667;
}
)(this);
return $$TMP666;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("load-file")),(function(path){
   var $$TMP679;
   $$TMP679=(function(self){
      var $$TMP680;
      $$TMP680=undefined;
      return $$TMP680;
   }
   )(this);
   return $$TMP679;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP681;
   $$TMP681=(function(self){
      var $$TMP682;
$$TMP682=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["gen-jstr"](compilation__MINUSresult));
return $$TMP682;
}
)(this);
return $$TMP681;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP683;
   $$TMP683=(function(self){
      var $$TMP684;
      $$TMP684=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP685;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP686;
   $$TMP686=(function(r){
      var $$TMP687;
      var $$TMP688;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   var $$TMP689;
   {
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti-safe"](r,(new $$root.Symbol("code"))));
r;
$$TMP689=$$root["seti!"](target,name,r);
}
$$TMP688=$$TMP689;
}
else{
   $$TMP688=undefined;
}
$$TMP688;
$$TMP687=r;
return $$TMP687;
}
)($$root["geti"](target,name));
return $$TMP686;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP690;
$$TMP690=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP690;
}
));
$$root["seti!"](root,"*ns*",$$root["geti-safe"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP691;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP691=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP691;
}
));
$$TMP685=$$root["call-method"]($$root["geti-safe"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP685;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP684;
}
)(this);
return $$TMP683;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP692;
   $$TMP692=(function(self){
      var $$TMP693;
      $$TMP693=(function(lexenv){
         var $$TMP694;
         $$TMP694=(function(__GS66){
            var $$TMP695;
            var $$TMP696;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("def"))),(new $$root.Symbol("name")),(new $$root.Symbol("val"))))){
   $$TMP696=(function(__GS67){
      var $$TMP697;
      $$TMP697=(function(name,val){
         var $$TMP698;
         $$TMP698=(function(tmp){
            var $$TMP699;
$$root["seti!"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP699=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP699;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP698;
}
)($$root["nth"](1,__GS67),$$root["nth"](2,__GS67));
return $$TMP697;
}
)(__GS66);
}
else{
   var $$TMP700;
if($$root["matches?"](__GS66,$$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("setmac!"))),(new $$root.Symbol("name"))))){
   $$TMP700=(function(__GS68){
      var $$TMP701;
      $$TMP701=(function(name){
         var $$TMP702;
         $$TMP702=(function(tmp){
            var $$TMP703;
$$root["call-method-by-name"]($$root["geti-safe"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["gen-jstr"](tmp));
$$TMP703=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP703;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP702;
}
)($$root["nth"](1,__GS68));
return $$TMP701;
}
)(__GS66);
}
else{
   var $$TMP704;
if($$root["matches?"](__GS66,$$root.list($$root.list($$root.list((new $$root.Symbol("quote")),(new $$root.Symbol("lambda"))),$$root.list((new $$root.Symbol("&args"))),(new $$root.Symbol("&body")))))){
   $$TMP704=(function(__GS69){
      var $$TMP705;
      $$TMP705=(function(__GS70){
         var $$TMP706;
         $$TMP706=(function(__GS71){
            var $$TMP707;
            $$TMP707=(function(args,body){
               var $$TMP708;
$$TMP708=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP708;
}
)($$root["drop"](0,__GS71),$$root["drop"](2,__GS70));
return $$TMP707;
}
)($$root["nth"](1,__GS70));
return $$TMP706;
}
)($$root["nth"](0,__GS69));
return $$TMP705;
}
)(__GS66);
}
else{
   var $$TMP709;
if($$root["matches?"](__GS66,$$root.list((new $$root.Symbol("name")),(new $$root.Symbol("&args"))))){
   $$TMP709=(function(__GS72){
      var $$TMP710;
      $$TMP710=(function(name,args){
         var $$TMP711;
         var $$TMP712;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP712=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP712=(function(tmp){
      var $$TMP713;
$$TMP713=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP713;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP711=$$TMP712;
return $$TMP711;
}
)($$root["nth"](0,__GS72),$$root["drop"](1,__GS72));
return $$TMP710;
}
)(__GS66);
}
else{
   var $$TMP714;
if($$root["matches?"](__GS66,(new $$root.Symbol("any")))){
   $$TMP714=(function(any){
      var $$TMP715;
      $$TMP715=(function(tmp){
         var $$TMP716;
$$TMP716=$$root["str"]($$root["gen-jstr"](tmp),";");
return $$TMP716;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP715;
}
)(__GS66);
}
else{
   var $$TMP717;
   if(true){
$$TMP717=$$root["error"]("Fell out of case!");
}
else{
   $$TMP717=undefined;
}
$$TMP714=$$TMP717;
}
$$TMP709=$$TMP714;
}
$$TMP704=$$TMP709;
}
$$TMP700=$$TMP704;
}
$$TMP696=$$TMP700;
}
$$TMP695=$$TMP696;
return $$TMP695;
}
)(e);
return $$TMP694;
}
)($$root["default-lexenv"]());
return $$TMP693;
}
)(this);
return $$TMP692;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP718;
   $$TMP718=(function(self){
      var $$TMP719;
$$TMP719=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP719;
}
)(this);
return $$TMP718;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
