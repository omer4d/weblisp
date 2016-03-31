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
$$root["identity"]=(function(x){
   var $$TMP19;
   $$TMP19=x;
   return $$TMP19;
}
);
$$root["identity"];
$$root["even?"]=(function(x){
   var $$TMP20;
$$TMP20=$$root["="]($$root["mod"](x,2),0);
return $$TMP20;
}
);
$$root["even?"];
$$root["odd?"]=(function(x){
   var $$TMP21;
$$TMP21=$$root["="]($$root["mod"](x,2),1);
return $$TMP21;
}
);
$$root["odd?"];
$$root["macroexpand-1"]=(function(expr){
   var $$TMP22;
   var $$TMP23;
   var $$TMP24;
if($$root["list?"](expr)){
   var $$TMP25;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
   $$TMP25=true;
}
else{
   $$TMP25=false;
}
$$TMP24=$$TMP25;
}
else{
   $$TMP24=false;
}
if($$TMP24){
$$TMP23=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
}
else{
   $$TMP23=expr;
}
$$TMP22=$$TMP23;
return $$TMP22;
}
);
$$root["macroexpand-1"];
$$root["inc"]=(function(x){
   var $$TMP26;
$$TMP26=$$root["+"](x,1);
return $$TMP26;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP27;
$$TMP27=$$root["-"](x,1);
return $$TMP27;
}
);
$$root["dec"];
$$root["incv!"]=(function(name,amt){
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
$$TMP28=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP28;
}
);
$$root["incv!"];
$$root["setmac!"]($$root["incv!"]);
$$root["decv!"]=(function(name,amt){
   var $$TMP31;
   amt=(function(c){
      var $$TMP32;
      var $$TMP33;
      if(c){
         $$TMP33=c;
      }
      else{
         $$TMP33=1;
      }
      $$TMP32=$$TMP33;
      return $$TMP32;
   }
   )(amt);
   amt;
$$TMP31=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP31;
}
);
$$root["decv!"];
$$root["setmac!"]($$root["decv!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP34;
$$TMP34=$$root["car"]($$root["cdr"](lst));
return $$TMP34;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP35;
$$TMP35=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP35;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP36;
$$TMP36=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP36;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP37;
$$TMP37=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP37;
}
);
$$root["fifth"];
$$root["rest"]=$$root["cdr"];
$$root["rest"];
$$root["getter"]=(function(field){
   var $$TMP38;
   $$TMP38=(function(obj){
      var $$TMP39;
$$TMP39=$$root["geti"](obj,field);
return $$TMP39;
}
);
return $$TMP38;
}
);
$$root["getter"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP40;
   var $$TMP41;
if($$root["null?"](lst)){
   $$TMP41=accum;
}
else{
$$TMP41=$$root["reduce"](r,$$root["cdr"](lst),r(accum,$$root["car"](lst)));
}
$$TMP40=$$TMP41;
return $$TMP40;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP42;
$$TMP42=$$root["reduce"]((function(accum,v){
   var $$TMP43;
$$TMP43=$$root["cons"](v,accum);
return $$TMP43;
}
),lst,[]);
return $$TMP42;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP44;
$$TMP44=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP44;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP45;
$$TMP45=$$root["transform-list"]((function(accum,v){
   var $$TMP46;
$$TMP46=$$root["cons"](f(v),accum);
return $$TMP46;
}
),lst);
return $$TMP45;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP47;
$$TMP47=$$root["transform-list"]((function(accum,v){
   var $$TMP48;
   var $$TMP49;
   if(p(v)){
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
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP50;
$$TMP50=$$root["transform-list"]((function(accum,v){
   var $$TMP51;
n=$$root["-"](n,1);
n;
var $$TMP52;
if($$root[">="](n,0)){
$$TMP52=$$root["cons"](v,accum);
}
else{
   $$TMP52=accum;
}
$$TMP51=$$TMP52;
return $$TMP51;
}
),lst);
return $$TMP50;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP53;
$$TMP53=$$root["transform-list"]((function(accum,v){
   var $$TMP54;
n=$$root["-"](n,1);
n;
var $$TMP55;
if($$root[">="](n,0)){
   $$TMP55=accum;
}
else{
$$TMP55=$$root["cons"](v,accum);
}
$$TMP54=$$TMP55;
return $$TMP54;
}
),lst);
return $$TMP53;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP56;
   $$TMP56=(function(counter){
      var $$TMP57;
$$TMP57=$$root["transform-list"]((function(accum,v){
   var $$TMP58;
   var $$TMP59;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP59=$$root["cons"](v,accum);
}
else{
   $$TMP59=accum;
}
$$TMP58=$$TMP59;
return $$TMP58;
}
),lst);
return $$TMP57;
}
)(-1);
return $$TMP56;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP60;
   var $$TMP61;
if($$root["="](n,0)){
$$TMP61=$$root["car"](lst);
}
else{
$$TMP61=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP60=$$TMP61;
return $$TMP60;
}
);
$$root["nth"];
$$root["butlast"]=(function(n,lst){
   var $$TMP62;
$$TMP62=$$root["take"]($$root["-"]($$root["count"](lst),n),lst);
return $$TMP62;
}
);
$$root["butlast"];
$$root["last"]=(function(lst){
   var $$TMP63;
$$TMP63=$$root["reduce"]((function(accum,v){
   var $$TMP64;
   $$TMP64=v;
   return $$TMP64;
}
),lst,undefined);
return $$TMP63;
}
);
$$root["last"];
$$root["count"]=(function(lst){
   var $$TMP65;
$$TMP65=$$root["reduce"]((function(accum,v){
   var $$TMP66;
$$TMP66=$$root["inc"](accum);
return $$TMP66;
}
),lst,0);
return $$TMP65;
}
);
$$root["count"];
$$root["zip"]=(function(a){
   var more=Array(arguments.length-1);
   for(var $$TMP73=1;
   $$TMP73<arguments.length;
   ++$$TMP73){
      more[$$TMP73-1]=arguments[$$TMP73];
   }
   var $$TMP67;
   $$TMP67=(function(args){
      var $$TMP68;
      var $$TMP69;
if($$root["reduce"]((function(accum,v){
   var $$TMP70;
   $$TMP70=(function(c){
      var $$TMP71;
      var $$TMP72;
      if(c){
         $$TMP72=c;
      }
      else{
$$TMP72=$$root["null?"](v);
}
$$TMP71=$$TMP72;
return $$TMP71;
}
)(accum);
return $$TMP70;
}
),args,false)){
   $$TMP69=[];
}
else{
$$TMP69=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP68=$$TMP69;
return $$TMP68;
}
)($$root["cons"](a,more));
return $$TMP67;
}
);
$$root["zip"];
$$root["interleave"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP76=0;
   $$TMP76<arguments.length;
   ++$$TMP76){
      args[$$TMP76-0]=arguments[$$TMP76];
   }
   var $$TMP74;
   var $$TMP75;
if($$root["null?"](args)){
   $$TMP75=[];
}
else{
$$TMP75=$$root["apply"]($$root["concat"],$$root["apply"]($$root["zip"],args));
}
$$TMP74=$$TMP75;
return $$TMP74;
}
);
$$root["interleave"];
$$root["let"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP78=1;
   $$TMP78<arguments.length;
   ++$$TMP78){
      body[$$TMP78-1]=arguments[$$TMP78];
   }
   var $$TMP77;
$$TMP77=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP77;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP79;
   $$TMP79=(function(fst){
      var $$TMP80;
$$TMP80=$$root["transform-list"]((function(accum,v){
   var $$TMP81;
   var $$TMP82;
   if(fst){
      $$TMP82=(function(){
         var $$TMP83;
         fst=false;
         fst;
$$TMP83=$$root["cons"](v,accum);
return $$TMP83;
}
)();
}
else{
$$TMP82=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP81=$$TMP82;
return $$TMP81;
}
),lst);
return $$TMP80;
}
)(true);
return $$TMP79;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP84;
$$TMP84=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP84;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP85;
   $$TMP85=(function(idx){
      var $$TMP86;
$$TMP86=$$root["reduce"]((function(accum,v){
   var $$TMP87;
idx=$$root["+"](idx,1);
idx;
var $$TMP88;
if(f(arg,v)){
   $$TMP88=idx;
}
else{
   $$TMP88=accum;
}
$$TMP87=$$TMP88;
return $$TMP87;
}
),lst,-1);
return $$TMP86;
}
)(-1);
return $$TMP85;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP89;
   var $$TMP90;
if($$root["atom?"](x)){
$$TMP90=$$root["list"](x);
}
else{
$$TMP90=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP89=$$TMP90;
return $$TMP89;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP91;
   $$TMP91=(function(idx){
      var $$TMP92;
$$TMP92=$$root["transform-list"]((function(accum,v){
   var $$TMP93;
idx=$$root["+"](idx,1);
$$TMP93=$$root["cons"](f(v,idx),accum);
return $$TMP93;
}
),lst);
return $$TMP92;
}
)(-1);
return $$TMP91;
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
   var $$TMP94;
$$TMP94=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP94;
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
$$TMP97=$$root["reverse"]((function(recur){
   var $$TMP98;
   recur=(function(accum,part,rem,counter){
      var $$TMP99;
      var $$TMP100;
if($$root["null?"](rem)){
$$TMP100=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP101;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP101=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP101=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP100=$$TMP101;
}
$$TMP99=$$TMP100;
return $$TMP99;
}
);
recur;
$$TMP98=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP98;
}
)([]));
}
$$TMP96=$$TMP97;
return $$TMP96;
}
);
$$root["partition"];
$$root["method"]=(function(args){
   var body=Array(arguments.length-1);
   for(var $$TMP103=1;
   $$TMP103<arguments.length;
   ++$$TMP103){
      body[$$TMP103-1]=arguments[$$TMP103];
   }
   var $$TMP102;
$$TMP102=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP102;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args){
   var body=Array(arguments.length-3);
   for(var $$TMP105=3;
   $$TMP105<arguments.length;
   ++$$TMP105){
      body[$$TMP105-3]=arguments[$$TMP105];
   }
   var $$TMP104;
$$TMP104=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP104;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["make-instance"]=(function(proto){
   var args=Array(arguments.length-1);
   for(var $$TMP108=1;
   $$TMP108<arguments.length;
   ++$$TMP108){
      args[$$TMP108-1]=arguments[$$TMP108];
   }
   var $$TMP106;
   $$TMP106=(function(instance){
      var $$TMP107;
$$root["apply-method"]($$root["geti"](proto,(new $$root.Symbol("init"))),instance,args);
$$TMP107=instance;
return $$TMP107;
}
)($$root["object"](proto));
return $$TMP106;
}
);
$$root["make-instance"];
$$root["call-method-by-name"]=(function(obj,name){
   var args=Array(arguments.length-2);
   for(var $$TMP110=2;
   $$TMP110<arguments.length;
   ++$$TMP110){
      args[$$TMP110-2]=arguments[$$TMP110];
   }
   var $$TMP109;
$$TMP109=$$root["apply-method"]($$root["geti"](obj,name),obj,args);
return $$TMP109;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP111;
   var $$TMP112;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP112=obj__MINUSname;
}
else{
   var $$TMP113;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP113=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP113=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP112=$$TMP113;
}
$$TMP111=$$TMP112;
return $$TMP111;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP115=1;
   $$TMP115<arguments.length;
   ++$$TMP115){
      fields[$$TMP115-1]=arguments[$$TMP115];
   }
   var $$TMP114;
$$TMP114=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP114;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["at-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP116;
   var $$TMP117;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP117=obj__MINUSname;
}
else{
$$TMP117=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["at-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["car"](reversed__MINUSfields)));
}
$$TMP116=$$TMP117;
return $$TMP116;
}
);
$$root["at-helper"];
$$root["@"]=(function(obj__MINUSname){
   var fields=Array(arguments.length-1);
   for(var $$TMP119=1;
   $$TMP119<arguments.length;
   ++$$TMP119){
      fields[$$TMP119-1]=arguments[$$TMP119];
   }
   var $$TMP118;
$$TMP118=$$root["at-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP118;
}
);
$$root["@"];
$$root["setmac!"]($$root["@"]);
$$root["prototype?"]=(function(p,o){
   var $$TMP120;
$$TMP120=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP120;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP121;
   var $$TMP122;
if($$root["null?"](a)){
$$TMP122=$$root["null?"](b);
}
else{
   var $$TMP123;
if($$root["symbol?"](a)){
   var $$TMP124;
if($$root["symbol?"](b)){
   var $$TMP125;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP125=true;
}
else{
   $$TMP125=false;
}
$$TMP124=$$TMP125;
}
else{
   $$TMP124=false;
}
$$TMP123=$$TMP124;
}
else{
   var $$TMP126;
if($$root["atom?"](a)){
$$TMP126=$$root["="](a,b);
}
else{
   var $$TMP127;
if($$root["list?"](a)){
   var $$TMP128;
if($$root["list?"](b)){
   var $$TMP129;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP130;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
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
   $$TMP128=false;
}
$$TMP127=$$TMP128;
}
else{
   $$TMP127=undefined;
}
$$TMP126=$$TMP127;
}
$$TMP123=$$TMP126;
}
$$TMP122=$$TMP123;
}
$$TMP121=$$TMP122;
return $$TMP121;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP131;
   $$TMP131=(function(res){
      var $$TMP137;
$$TMP137=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP137;
}
)((function(recur){
   var $$TMP132;
   recur=(function(l1,l2){
      var $$TMP133;
      var $$TMP134;
      if((function(c){
         var $$TMP135;
         var $$TMP136;
         if(c){
            $$TMP136=c;
         }
         else{
$$TMP136=p($$root["car"](l2));
}
$$TMP135=$$TMP136;
return $$TMP135;
}
)($$root["null?"](l2))){
$$TMP134=$$root["list"](l1,l2);
}
else{
$$TMP134=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP133=$$TMP134;
return $$TMP133;
}
);
recur;
$$TMP132=recur([],lst);
return $$TMP132;
}
)([]));
return $$TMP131;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP138;
   var $$TMP139;
if($$root["reduce"]((function(accum,v){
   var $$TMP140;
   var $$TMP141;
   if(accum){
      $$TMP141=accum;
   }
   else{
      $$TMP141=v;
   }
   $$TMP140=$$TMP141;
   return $$TMP140;
}
),lst,false)){
   $$TMP139=true;
}
else{
   $$TMP139=false;
}
$$TMP138=$$TMP139;
return $$TMP138;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP142;
$$TMP142=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP143;
   var $$TMP144;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP145;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP145=true;
}
else{
   $$TMP145=false;
}
$$TMP144=$$TMP145;
}
else{
   $$TMP144=false;
}
$$TMP143=$$TMP144;
return $$TMP143;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP142;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP146;
   $$TMP146=(function(binding__MINUSnames){
      var $$TMP147;
      $$TMP147=(function(divs){
         var $$TMP149;
         var $$TMP150;
if($$root["null?"]($$root["second"](divs))){
$$TMP150=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP150=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP149=$$TMP150;
return $$TMP149;
}
)($$root["split"]((function(pair){
   var $$TMP148;
$$TMP148=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP148;
}
),binding__MINUSpairs));
return $$TMP147;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP146;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings){
   var body=Array(arguments.length-1);
   for(var $$TMP152=1;
   $$TMP152<arguments.length;
   ++$$TMP152){
      body[$$TMP152-1]=arguments[$$TMP152];
   }
   var $$TMP151;
$$TMP151=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP151;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP153;
   $$TMP153=(function(x){
      var $$TMP154;
$$TMP154=$$root["not"](f(x));
return $$TMP154;
}
);
return $$TMP153;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP155;
   $$TMP155=(function(){
      var args=Array(arguments.length-0);
      for(var $$TMP157=0;
      $$TMP157<arguments.length;
      ++$$TMP157){
         args[$$TMP157-0]=arguments[$$TMP157];
      }
      var $$TMP156;
$$TMP156=f1($$root["apply"](f2,args));
return $$TMP156;
}
);
return $$TMP155;
}
);
$$root["compose"];
$$root["partial"]=(function(f){
   var args1=Array(arguments.length-1);
   for(var $$TMP161=1;
   $$TMP161<arguments.length;
   ++$$TMP161){
      args1[$$TMP161-1]=arguments[$$TMP161];
   }
   var $$TMP158;
   $$TMP158=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP160=0;
      $$TMP160<arguments.length;
      ++$$TMP160){
         args2[$$TMP160-0]=arguments[$$TMP160];
      }
      var $$TMP159;
$$TMP159=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP159;
}
);
return $$TMP158;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield){
   var args1=Array(arguments.length-2);
   for(var $$TMP165=2;
   $$TMP165<arguments.length;
   ++$$TMP165){
      args1[$$TMP165-2]=arguments[$$TMP165];
   }
   var $$TMP162;
   $$TMP162=(function(){
      var args2=Array(arguments.length-0);
      for(var $$TMP164=0;
      $$TMP164<arguments.length;
      ++$$TMP164){
         args2[$$TMP164-0]=arguments[$$TMP164];
      }
      var $$TMP163;
$$TMP163=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP163;
}
);
return $$TMP162;
}
);
$$root["partial-method"];
$$root["format"]=(function(){
   var args=Array(arguments.length-0);
   for(var $$TMP169=0;
   $$TMP169<arguments.length;
   ++$$TMP169){
      args[$$TMP169-0]=arguments[$$TMP169];
   }
   var $$TMP166;
   $$TMP166=(function(rx){
      var $$TMP167;
$$TMP167=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP168;
$$TMP168=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP168;
}
));
return $$TMP167;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP166;
}
);
$$root["format"];
$$root["case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP176=1;
   $$TMP176<arguments.length;
   ++$$TMP176){
      pairs[$$TMP176-1]=arguments[$$TMP176];
   }
   var $$TMP170;
   $$TMP170=(function(e__MINUSname,def__MINUSidx){
      var $$TMP171;
      var $$TMP172;
if($$root["="](def__MINUSidx,-1)){
$$TMP172=$$root.list(((new $$root.Symbol("error")) ),("Fell out of case!" ));
}
else{
$$TMP172=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP171=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP173;
$$TMP173=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP174;
$$TMP174=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP174;
}
),$$root["filter"]((function(pair){
   var $$TMP175;
$$TMP175=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP175;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP173;
}
)($$TMP172,$$root["partition"](2,pairs));
return $$TMP171;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP170;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP177;
   $$TMP177=(function(expr__MINUSname){
      var $$TMP178;
$$TMP178=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP179;
   var $$TMP180;
if($$root["symbol?"](v)){
   var $$TMP181;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP181=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP182;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP182=[];
}
else{
$$TMP182=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP181=$$TMP182;
}
$$TMP180=$$TMP181;
}
else{
$$TMP180=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP179=$$TMP180;
return $$TMP179;
}
),structure)));
return $$TMP178;
}
)($$root["gensym"]());
return $$TMP177;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr){
   var body=Array(arguments.length-2);
   for(var $$TMP185=2;
   $$TMP185<arguments.length;
   ++$$TMP185){
      body[$$TMP185-2]=arguments[$$TMP185];
   }
   var $$TMP183;
   var $$TMP184;
if($$root["symbol?"](structure)){
$$TMP184=$$root["list"](structure,expr);
}
else{
$$TMP184=$$root["destruct-helper"](structure,expr);
}
$$TMP183=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP184),body);
return $$TMP183;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP186;
   var $$TMP187;
if($$root["list?"](expr)){
   var $$TMP188;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP188=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP188=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP187=$$TMP188;
}
else{
   $$TMP187=expr;
}
$$TMP186=$$TMP187;
return $$TMP186;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP189;
   var $$TMP190;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP190=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP191;
   var $$TMP192;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP193;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP193=true;
}
else{
   $$TMP193=false;
}
$$TMP192=$$TMP193;
}
else{
   $$TMP192=false;
}
if($$TMP192){
$$TMP191=$$root["list?"](expr);
}
else{
   var $$TMP194;
   if(true){
      var $$TMP195;
      var $$TMP196;
if($$root["list?"](expr)){
   var $$TMP197;
if($$root["not"]($$root["null?"](expr))){
   $$TMP197=true;
}
else{
   $$TMP197=false;
}
$$TMP196=$$TMP197;
}
else{
   $$TMP196=false;
}
if($$TMP196){
   var $$TMP198;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP199;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
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
$$TMP195=$$TMP198;
}
else{
   $$TMP195=false;
}
$$TMP194=$$TMP195;
}
else{
   $$TMP194=undefined;
}
$$TMP191=$$TMP194;
}
$$TMP190=$$TMP191;
}
$$TMP189=$$TMP190;
return $$TMP189;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP200;
   var $$TMP201;
if($$root["null?"](patt)){
$$TMP201=$$root["null?"](expr);
}
else{
   var $$TMP202;
if($$root["list?"](patt)){
$$TMP202=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP203;
if($$root["symbol?"](patt)){
   $$TMP203=true;
}
else{
   var $$TMP204;
   if(true){
$$TMP204=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP204=undefined;
}
$$TMP203=$$TMP204;
}
$$TMP202=$$TMP203;
}
$$TMP201=$$TMP202;
}
$$TMP200=$$TMP201;
return $$TMP200;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP205;
   var $$TMP206;
   var $$TMP207;
if($$root["list?"](patt)){
   var $$TMP208;
if($$root["not"]($$root["null?"](patt))){
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
   var $$TMP209;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP209=(new $$root.Symbol("_"));
}
else{
$$TMP209=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP206=$$TMP209;
}
else{
   $$TMP206=patt;
}
$$TMP205=$$TMP206;
return $$TMP205;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e){
   var pairs=Array(arguments.length-1);
   for(var $$TMP213=1;
   $$TMP213<arguments.length;
   ++$$TMP213){
      pairs[$$TMP213-1]=arguments[$$TMP213];
   }
   var $$TMP210;
   $$TMP210=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP211;
$$TMP211=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP212;
$$TMP212=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP212;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP211;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP210;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP214;
   $$TMP214=(function(__GS1){
      var $$TMP215;
      var $$TMP216;
if($$root["matches?"](__GS1,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("geti")) )) ),((new $$root.Symbol("obj")) ),((new $$root.Symbol("field")) )))){
   $$TMP216=(function(__GS2){
      var $$TMP217;
      $$TMP217=(function(obj,field){
         var $$TMP218;
$$TMP218=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP218;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
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
$$TMP215=$$TMP216;
return $$TMP215;
}
)($$root["macroexpand"](place));
return $$TMP214;
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
$$root["insert"]=(function(x,pos,lst){
   var $$TMP230;
   var $$TMP231;
if($$root["="](pos,0)){
$$TMP231=$$root["cons"](x,lst);
}
else{
   var $$TMP232;
if($$root["null?"](lst)){
   $$TMP232=undefined;
}
else{
$$TMP232=$$root["car"](lst);
}
$$TMP231=$$root["cons"]($$TMP232,$$root["insert"](x,$$root["dec"](pos),$$root["cdr"](lst)));
}
$$TMP230=$$TMP231;
return $$TMP230;
}
);
$$root["insert"];
$$root["->"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP235=1;
   $$TMP235<arguments.length;
   ++$$TMP235){
      forms[$$TMP235-1]=arguments[$$TMP235];
   }
   var $$TMP233;
   var $$TMP234;
if($$root["null?"](forms)){
   $$TMP234=x;
}
else{
$$TMP234=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP233=$$TMP234;
return $$TMP233;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["->>"]=(function(x){
   var forms=Array(arguments.length-1);
   for(var $$TMP238=1;
   $$TMP238<arguments.length;
   ++$$TMP238){
      forms[$$TMP238-1]=arguments[$$TMP238];
   }
   var $$TMP236;
   var $$TMP237;
if($$root["null?"](forms)){
   $$TMP237=x;
}
else{
$$TMP237=$$root["concat"]($$root["list"]((new $$root.Symbol("->>"))),$$root["list"]($$root["insert"](x,1,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP236=$$TMP237;
return $$TMP236;
}
);
$$root["->>"];
$$root["setmac!"]($$root["->>"]);
$$root["doto"]=(function(obj__MINUSexpr){
   var body=Array(arguments.length-1);
   for(var $$TMP244=1;
   $$TMP244<arguments.length;
   ++$$TMP244){
      body[$$TMP244-1]=arguments[$$TMP244];
   }
   var $$TMP239;
   $$TMP239=(function(binding__MINUSname){
      var $$TMP240;
$$TMP240=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP241;
   $$TMP241=(function(__GS3){
      var $$TMP242;
      $$TMP242=(function(f,args){
         var $$TMP243;
$$TMP243=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP243;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP242;
}
)(v);
return $$TMP241;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP240;
}
)($$root["gensym"]());
return $$TMP239;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["assoc!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP250=1;
   $$TMP250<arguments.length;
   ++$$TMP250){
      kvs[$$TMP250-1]=arguments[$$TMP250];
   }
   var $$TMP245;
   $$TMP245=(function(recur){
      var $$TMP246;
      recur=(function(kvs){
         var $$TMP247;
         var $$TMP248;
if($$root["null?"](kvs)){
   $$TMP248=obj;
}
else{
   $$TMP248=(function(){
      var $$TMP249;
$$root["seti!"](obj,$$root["first"](kvs),$$root["second"](kvs));
$$TMP249=recur($$root["cdr"]($$root["cdr"](kvs)));
return $$TMP249;
}
)();
}
$$TMP247=$$TMP248;
return $$TMP247;
}
);
recur;
$$TMP246=recur(kvs);
return $$TMP246;
}
)([]);
return $$TMP245;
}
);
$$root["assoc!"];
$$root["deep-assoc!"]=(function(obj,path){
   var kvs=Array(arguments.length-2);
   for(var $$TMP256=2;
   $$TMP256<arguments.length;
   ++$$TMP256){
      kvs[$$TMP256-2]=arguments[$$TMP256];
   }
   var $$TMP251;
   (function(recur){
      var $$TMP252;
      recur=(function(obj,path,kvs){
         var $$TMP253;
         var $$TMP254;
if($$root["null?"](path)){
$$TMP254=$$root["apply"]($$root["assoc!"],$$root["cons"](obj,kvs));
}
else{
   var $$TMP255;
if($$root["in"](obj,$$root["car"](path))){
$$TMP255=$$root["geti"](obj,$$root["car"](path));
}
else{
$$TMP255=$$root["seti!"](obj,$$root["car"](path),$$root["hashmap"]());
}
$$TMP254=recur($$TMP255,$$root["cdr"](path),kvs);
}
$$TMP253=$$TMP254;
return $$TMP253;
}
);
recur;
$$TMP252=recur(obj,path,kvs);
return $$TMP252;
}
)([]);
$$TMP251=obj;
return $$TMP251;
}
);
$$root["deep-assoc!"];
$$root["hashmap-shallow-copy"]=(function(h1){
   var $$TMP257;
$$TMP257=$$root["reduce"]((function(h2,key){
   var $$TMP258;
$$root["seti!"](h2,key,$$root["geti"](h1,key));
$$TMP258=h2;
return $$TMP258;
}
),$$root["keys"](h1),$$root["hashmap"]());
return $$TMP257;
}
);
$$root["hashmap-shallow-copy"];
$$root["assoc"]=(function(h){
   var kvs=Array(arguments.length-1);
   for(var $$TMP260=1;
   $$TMP260<arguments.length;
   ++$$TMP260){
      kvs[$$TMP260-1]=arguments[$$TMP260];
   }
   var $$TMP259;
$$TMP259=$$root["apply"]($$root["assoc!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kvs));
return $$TMP259;
}
);
$$root["assoc"];
$$root["update!"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP266=1;
   $$TMP266<arguments.length;
   ++$$TMP266){
      kfs[$$TMP266-1]=arguments[$$TMP266];
   }
   var $$TMP261;
   $$TMP261=(function(recur){
      var $$TMP262;
      recur=(function(kfs){
         var $$TMP263;
         var $$TMP264;
if($$root["null?"](kfs)){
   $$TMP264=h;
}
else{
   $$TMP264=(function(key){
      var $$TMP265;
$$root["seti!"](h,key,$$root["second"](kfs)($$root["geti"](h,key)));
$$TMP265=recur($$root["cdr"]($$root["cdr"](kfs)));
return $$TMP265;
}
)($$root["first"](kfs));
}
$$TMP263=$$TMP264;
return $$TMP263;
}
);
recur;
$$TMP262=recur(kfs);
return $$TMP262;
}
)([]);
return $$TMP261;
}
);
$$root["update!"];
$$root["update"]=(function(h){
   var kfs=Array(arguments.length-1);
   for(var $$TMP268=1;
   $$TMP268<arguments.length;
   ++$$TMP268){
      kfs[$$TMP268-1]=arguments[$$TMP268];
   }
   var $$TMP267;
$$TMP267=$$root["apply"]($$root["update!"],$$root["cons"]($$root["hashmap-shallow-copy"](h),kfs));
return $$TMP267;
}
);
$$root["update"];
$$root["while"]=(function(c){
   var body=Array(arguments.length-1);
   for(var $$TMP270=1;
   $$TMP270<arguments.length;
   ++$$TMP270){
      body[$$TMP270-1]=arguments[$$TMP270];
   }
   var $$TMP269;
$$TMP269=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP269;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP271;
$$TMP271=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP271;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP272;
   step=(function(c){
      var $$TMP273;
      var $$TMP274;
      if(c){
         $$TMP274=c;
      }
      else{
         $$TMP274=1;
      }
      $$TMP273=$$TMP274;
      return $$TMP273;
   }
   )(step);
   step;
   $$TMP272=(function(data){
      var $$TMP275;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP275=data;
return $$TMP275;
}
)($$root["object"]([]));
return $$TMP272;
}
);
$$root["in-range"];
$$root["from"]=(function(binding__MINUSname,start,step){
   var $$TMP276;
   step=(function(c){
      var $$TMP277;
      var $$TMP278;
      if(c){
         $$TMP278=c;
      }
      else{
         $$TMP278=1;
      }
      $$TMP277=$$TMP278;
      return $$TMP277;
   }
   )(step);
   step;
   $$TMP276=(function(data){
      var $$TMP279;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$TMP279=data;
return $$TMP279;
}
)($$root["object"]([]));
return $$TMP276;
}
);
$$root["from"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP280;
   $$TMP280=(function(len__MINUSname,data){
      var $$TMP281;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP281=data;
return $$TMP281;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP280;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP282;
   $$TMP282=(function(lst__MINUSname,data){
      var $$TMP283;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP283=data;
return $$TMP283;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP282;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP284;
   $$TMP284=(function(__GS4){
      var $$TMP285;
      $$TMP285=(function(binding__MINUSname,__GS5){
         var $$TMP286;
         $$TMP286=(function(func__MINUSname,args){
            var $$TMP287;
$$TMP287=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP287;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP286;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP285;
}
)(form);
return $$TMP284;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP288;
   $$TMP288=(function(data){
      var $$TMP289;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP289=data;
return $$TMP289;
}
)($$root["object"]([]));
return $$TMP288;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP290;
   $$TMP290=(function(data){
      var $$TMP291;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP291=data;
return $$TMP291;
}
)($$root["object"]([]));
return $$TMP290;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP292;
   $$TMP292=(function(data){
      var $$TMP293;
      (function(__GS6){
         var $$TMP294;
         $$TMP294=(function(binding__MINUSname,body){
            var $$TMP295;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP295=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP295;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP294;
}
)(form);
$$TMP293=data;
return $$TMP293;
}
)($$root["object"]([]));
return $$TMP292;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP296;
   $$TMP296=(function(data){
      var $$TMP297;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP297=data;
return $$TMP297;
}
)($$root["object"]([]));
return $$TMP296;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP298;
   $$TMP298=(function(data,accum__MINUSname){
      var $$TMP299;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP299=data;
return $$TMP299;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP298;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP300;
$$TMP300=$$root["filter"]((function(x){
   var $$TMP301;
$$TMP301=$$root["not="](x,undefined);
return $$TMP301;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP300;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(){
   var forms=Array(arguments.length-0);
   for(var $$TMP317=0;
   $$TMP317<arguments.length;
   ++$$TMP317){
      forms[$$TMP317-0]=arguments[$$TMP317];
   }
   var $$TMP302;
   $$TMP302=(function(res__MINUSname){
      var $$TMP303;
      $$TMP303=(function(all){
         var $$TMP313;
         $$TMP313=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP315;
            var $$TMP316;
if($$root["null?"](final__MINUSactions)){
$$TMP316=$$root["list"](res__MINUSname);
}
else{
   $$TMP316=final__MINUSactions;
}
$$TMP315=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP316)))))));
return $$TMP315;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP314;
$$TMP314=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP314;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP313;
}
)($$root["map"]((function(form){
   var $$TMP304;
   $$TMP304=(function(__GS7){
      var $$TMP305;
      var $$TMP306;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP306=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP307;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP307=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP308;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP308=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP309;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP309=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP310;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP310=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP311;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP311=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP312;
   if(true){
$$TMP312=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP312=undefined;
}
$$TMP311=$$TMP312;
}
$$TMP310=$$TMP311;
}
$$TMP309=$$TMP310;
}
$$TMP308=$$TMP309;
}
$$TMP307=$$TMP308;
}
$$TMP306=$$TMP307;
}
$$TMP305=$$TMP306;
return $$TMP305;
}
)($$root["car"](form));
return $$TMP304;
}
),forms));
return $$TMP303;
}
)($$root["gensym"]());
return $$TMP302;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["add-meta!"]=(function(obj){
   var kvs=Array(arguments.length-1);
   for(var $$TMP322=1;
   $$TMP322<arguments.length;
   ++$$TMP322){
      kvs[$$TMP322-1]=arguments[$$TMP322];
   }
   var $$TMP318;
   $$TMP318=(function(meta){
      var $$TMP319;
      var $$TMP320;
if($$root["not"](meta)){
   $$TMP320=(function(){
      var $$TMP321;
meta=$$root["hashmap"]();
meta;
$$root["seti!"](obj,(new $$root.Symbol("meta")),meta);
$$TMP321=($$root["Object"]).defineProperty(obj,"meta",$$root["assoc!"]($$root["hashmap"](),"enumerable",false,"writable",true));
return $$TMP321;
}
)();
}
else{
   $$TMP320=undefined;
}
$$TMP320;
$$root["apply"]($$root["assoc!"],$$root["cons"](meta,kvs));
$$TMP319=obj;
return $$TMP319;
}
)($$root["geti"](obj,(new $$root.Symbol("meta"))));
return $$TMP318;
}
);
$$root["add-meta!"];
$$root["print-meta"]=(function(x){
   var $$TMP323;
$$TMP323=$$root["print"](($$root["JSON"]).stringify($$root["geti"](x,(new $$root.Symbol("meta")))));
return $$TMP323;
}
);
$$root["print-meta"];
$$root["defpod"]=(function(name){
   var fields=Array(arguments.length-1);
   for(var $$TMP326=1;
   $$TMP326<arguments.length;
   ++$$TMP326){
      fields[$$TMP326-1]=arguments[$$TMP326];
   }
   var $$TMP324;
$$TMP324=$$root["concat"]($$root["list"]((new $$root.Symbol("defun"))),$$root["list"]($$root["symbol"]($$root["str"]("make-",name))),$$root["list"](fields),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("doto"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("hashmap"))))),$$root["map"]((function(field){
   var $$TMP325;
$$TMP325=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](field))),$$root["list"](field));
return $$TMP325;
}
),fields))));
return $$TMP324;
}
);
$$root["defpod"];
$$root["setmac!"]($$root["defpod"]);
$$root["subs"]=(function(s,start,end){
   var $$TMP327;
   $$TMP327=(s).slice(start,end);
   return $$TMP327;
}
);
$$root["subs"];
$$root["neg?"]=(function(x){
   var $$TMP328;
$$TMP328=$$root["<"](x,0);
return $$TMP328;
}
);
$$root["neg?"];
$$root["idiv"]=(function(a,b){
   var $$TMP329;
   $$TMP329=(function(t){
      var $$TMP330;
      var $$TMP331;
if($$root["neg?"](t)){
$$TMP331=($$root["Math"]).ceil(t);
}
else{
$$TMP331=($$root["Math"]).floor(t);
}
$$TMP330=$$TMP331;
return $$TMP330;
}
)($$root["/"](a,b));
return $$TMP329;
}
);
$$root["idiv"];
$$root["empty?"]=(function(x){
   var $$TMP332;
   var $$TMP333;
if($$root["string?"](x)){
$$TMP333=$$root["="]($$root["geti"](x,(new $$root.Symbol("length"))),0);
}
else{
   var $$TMP334;
if($$root["list?"](x)){
$$TMP334=$$root["null?"](x);
}
else{
   var $$TMP335;
   if(true){
$$TMP335=$$root["error"]("Type error in empty?");
}
else{
   $$TMP335=undefined;
}
$$TMP334=$$TMP335;
}
$$TMP333=$$TMP334;
}
$$TMP332=$$TMP333;
return $$TMP332;
}
);
$$root["empty?"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP336;
   $$TMP336=(function(self){
      var $$TMP337;
      $$TMP337=(function(__GS8){
         var $$TMP338;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP338=__GS8;
return $$TMP338;
}
)(self);
return $$TMP337;
}
)(this);
return $$TMP336;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP339;
   $$TMP339=(function(self){
      var $$TMP340;
$$TMP340=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP340;
}
)(this);
return $$TMP339;
}
));
$$root["lit"]=(function(s){
   var $$TMP341;
$$TMP341=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP341;
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
   var $$TMP342;
   $$TMP342=(function(toks,pos,s){
      var $$TMP343;
      (function(recur){
         var $$TMP344;
         recur=(function(){
            var $$TMP345;
            var $$TMP346;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP346=(function(){
      var $$TMP347;
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP348;
         $$TMP348=(function(recur){
            var $$TMP349;
            recur=(function(){
               var $$TMP350;
               var $$TMP351;
               var $$TMP352;
if($$root["<"](i,__GS10)){
   var $$TMP353;
if($$root["not"]($$root["null?"](__GS11))){
   var $$TMP354;
if($$root["not"](res)){
   $$TMP354=true;
}
else{
   $$TMP354=false;
}
$$TMP353=$$TMP354;
}
else{
   $$TMP353=false;
}
$$TMP352=$$TMP353;
}
else{
   $$TMP352=false;
}
if($$TMP352){
   $$TMP351=(function(){
      var $$TMP355;
entry=$$root["car"](__GS11);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP355=recur();
return $$TMP355;
}
)();
}
else{
   $$TMP351=(function(){
      var $$TMP356;
      _=__GS9;
      _;
      var $$TMP357;
      if(res){
         $$TMP357=(function(){
            var $$TMP358;
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP359;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP359=(function(){
      var $$TMP360;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP361;
   var $$TMP362;
   if(c){
      $$TMP362=c;
   }
   else{
$$TMP362=$$root["second"](entry);
}
$$TMP361=$$TMP362;
return $$TMP361;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP360=toks;
return $$TMP360;
}
)();
}
else{
   $$TMP359=undefined;
}
$$TMP359;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP358=pos;
return $$TMP358;
}
)();
}
else{
$$TMP357=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP357;
$$TMP356=__GS9;
return $$TMP356;
}
)();
}
$$TMP350=$$TMP351;
return $$TMP350;
}
);
recur;
$$TMP349=recur();
return $$TMP349;
}
)([]);
return $$TMP348;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP347=recur();
return $$TMP347;
}
)();
}
else{
   $$TMP346=undefined;
}
$$TMP345=$$TMP346;
return $$TMP345;
}
);
recur;
$$TMP344=recur();
return $$TMP344;
}
)([]);
$$TMP343=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP343;
}
)([],0,src);
return $$TMP342;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP363;
   $$TMP363=(function(self){
      var $$TMP364;
$$TMP364=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP364;
}
)(this);
return $$TMP363;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP365;
   $$TMP365=(function(self){
      var $$TMP366;
$$TMP366=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP366;
}
)(this);
return $$TMP365;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP367;
   $$TMP367=(function(self){
      var $$TMP368;
      $$TMP368=(function(curr){
         var $$TMP369;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP369=curr;
return $$TMP369;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP368;
}
)(this);
return $$TMP367;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP370;
$$TMP370=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP370;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP371;
$$TMP371=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP371;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP372;
   $$TMP372=(function(self){
      var $$TMP373;
      $$TMP373=(function(tok){
         var $$TMP374;
         $$TMP374=(function(__GS12){
            var $$TMP375;
            var $$TMP376;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
$$TMP376=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP377;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP377=true;
}
else{
   var $$TMP378;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP378=false;
}
else{
   var $$TMP379;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP379=[];
}
else{
   var $$TMP380;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP380=undefined;
}
else{
   var $$TMP381;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP381=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP382;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP382=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP383;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP383=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP384;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
$$TMP384=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP385;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP385=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP386;
   if(true){
$$TMP386=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP386=undefined;
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
}
$$TMP380=$$TMP381;
}
$$TMP379=$$TMP380;
}
$$TMP378=$$TMP379;
}
$$TMP377=$$TMP378;
}
$$TMP376=$$TMP377;
}
$$TMP375=$$TMP376;
return $$TMP375;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP374;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP373;
}
)(this);
return $$TMP372;
}
));
$$root["set-source-pos!"]=(function(o,start,end){
   var $$TMP387;
   $$TMP387=(function(s){
      var $$TMP388;
$$TMP388=$$root["add-meta!"](o,(new $$root.Symbol("source-pos")),s);
return $$TMP388;
}
)($$root["assoc!"]($$root["hashmap"](),(new $$root.Symbol("start")),start,(new $$root.Symbol("end")),end));
return $$TMP387;
}
);
$$root["set-source-pos!"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP389;
   $$TMP389=(function(self){
      var $$TMP390;
      $$TMP390=(function(start__MINUSpos){
         var $$TMP391;
         $$TMP391=(function(__GS13,__GS14,lst){
            var $$TMP392;
            $$TMP392=(function(recur){
               var $$TMP393;
               recur=(function(){
                  var $$TMP394;
                  var $$TMP395;
                  var $$TMP396;
                  var $$TMP397;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP398;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP398=true;
}
else{
   $$TMP398=false;
}
$$TMP397=$$TMP398;
}
else{
   $$TMP397=false;
}
if($$TMP397){
   $$TMP396=true;
}
else{
   $$TMP396=false;
}
if($$TMP396){
   $$TMP395=(function(){
      var $$TMP399;
__GS14=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS14);
__GS13=__GS14;
__GS13;
$$TMP399=recur();
return $$TMP399;
}
)();
}
else{
   $$TMP395=(function(){
      var $$TMP400;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP401;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP401=$$root["set-source-pos!"](lst,start__MINUSpos,$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("start"))));
}
else{
$$TMP401=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP401;
$$TMP400=__GS13;
return $$TMP400;
}
)();
}
$$TMP394=$$TMP395;
return $$TMP394;
}
);
recur;
$$TMP393=recur();
return $$TMP393;
}
)([]);
return $$TMP392;
}
)(undefined,[],undefined);
return $$TMP391;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("start"))));
return $$TMP390;
}
)(this);
return $$TMP389;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP402;
   $$TMP402=(function(self){
      var $$TMP403;
      $$TMP403=(function(__GS15,__GS16,lst){
         var $$TMP404;
         $$TMP404=(function(recur){
            var $$TMP405;
            recur=(function(){
               var $$TMP406;
               var $$TMP407;
               var $$TMP408;
               var $$TMP409;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP410;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP410=true;
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
   $$TMP408=true;
}
else{
   $$TMP408=false;
}
if($$TMP408){
   $$TMP407=(function(){
      var $$TMP411;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP412;
   var $$TMP413;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP413=(function(){
      var $$TMP414;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP414=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
return $$TMP414;
}
)();
}
else{
   var $$TMP415;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP415=(function(){
      var $$TMP416;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP416=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
return $$TMP416;
}
)();
}
else{
   var $$TMP417;
   if(true){
$$TMP417=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP417=undefined;
}
$$TMP415=$$TMP417;
}
$$TMP413=$$TMP415;
}
$$TMP412=$$TMP413;
return $$TMP412;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP411=recur();
return $$TMP411;
}
)();
}
else{
   $$TMP407=(function(){
      var $$TMP418;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP419;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP419=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP419=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP419;
$$TMP418=__GS15;
return $$TMP418;
}
)();
}
$$TMP406=$$TMP407;
return $$TMP406;
}
);
recur;
$$TMP405=recur();
return $$TMP405;
}
)([]);
return $$TMP404;
}
)(undefined,[],undefined);
return $$TMP403;
}
)(this);
return $$TMP402;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP420;
   $$TMP420=(function(self){
      var $$TMP421;
      var $$TMP422;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP422=(function(){
      var $$TMP423;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP423=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
return $$TMP423;
}
)();
}
else{
$$TMP422=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP421=$$TMP422;
return $$TMP421;
}
)(this);
return $$TMP420;
}
));
$$root["parse"]=(function(toks){
   var $$TMP424;
   $$TMP424=(function(p){
      var $$TMP425;
      $$TMP425=(function(__GS18,__GS19){
         var $$TMP426;
         $$TMP426=(function(recur){
            var $$TMP427;
            recur=(function(){
               var $$TMP428;
               var $$TMP429;
               var $$TMP430;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP430=true;
}
else{
   $$TMP430=false;
}
if($$TMP430){
   $$TMP429=(function(){
      var $$TMP431;
__GS19=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS19);
__GS18=__GS19;
__GS18;
$$TMP431=recur();
return $$TMP431;
}
)();
}
else{
   $$TMP429=(function(){
      var $$TMP432;
__GS18=$$root["reverse"](__GS19);
$$TMP432=__GS18;
return $$TMP432;
}
)();
}
$$TMP428=$$TMP429;
return $$TMP428;
}
);
recur;
$$TMP427=recur();
return $$TMP427;
}
)([]);
return $$TMP426;
}
)(undefined,[]);
return $$TMP425;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP424;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP433;
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
$$TMP433=__GS20;
return $$TMP433;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP434;
$$TMP434=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP434;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");
$$root["mangling-rx"];
$$root["mangle"]=(function(x){
   var $$TMP435;
$$TMP435=$$root["geti"]($$root["mangling-table"],x);
return $$TMP435;
}
);
$$root["mangle"];
$$root["mangle-name"]=(function(name){
   var $$TMP436;
$$TMP436=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);
return $$TMP436;
}
);
$$root["mangle-name"];
$$root["make-source-mapping"]=(function(source__MINUSstart,source__MINUSend,target__MINUSstart,target__MINUSend){
   var $$TMP437;
   $$TMP437=(function(__GS21){
      var $$TMP438;
$$root["seti!"](__GS21,(new $$root.Symbol("source-start")),source__MINUSstart);
$$root["seti!"](__GS21,(new $$root.Symbol("source-end")),source__MINUSend);
$$root["seti!"](__GS21,(new $$root.Symbol("target-start")),target__MINUSstart);
$$root["seti!"](__GS21,(new $$root.Symbol("target-end")),target__MINUSend);
$$TMP438=__GS21;
return $$TMP438;
}
)($$root["hashmap"]());
return $$TMP437;
}
);
$$root["make-source-mapping"];
$$root["make-tc-str"]=(function(data,mappings){
   var $$TMP439;
   $$TMP439=(function(__GS22){
      var $$TMP440;
$$root["seti!"](__GS22,(new $$root.Symbol("data")),data);
$$root["seti!"](__GS22,(new $$root.Symbol("mappings")),mappings);
$$TMP440=__GS22;
return $$TMP440;
}
)($$root["hashmap"]());
return $$TMP439;
}
);
$$root["make-tc-str"];
$$root["make-tc-frag"]=(function(val,init){
   var $$TMP441;
   $$TMP441=(function(__GS23){
      var $$TMP442;
$$root["seti!"](__GS23,(new $$root.Symbol("val")),val);
$$root["seti!"](__GS23,(new $$root.Symbol("init")),init);
$$TMP442=__GS23;
return $$TMP442;
}
)($$root["hashmap"]());
return $$TMP441;
}
);
$$root["make-tc-frag"];
$$root["offset-source-mapping"]=(function(e,n){
   var $$TMP443;
   $$TMP443=(function(adder){
      var $$TMP445;
$$TMP445=$$root["update"](e,(new $$root.Symbol("target-start")),adder,(new $$root.Symbol("target-end")),adder);
return $$TMP445;
}
)((function(x){
   var $$TMP444;
$$TMP444=$$root["+"](x,n);
return $$TMP444;
}
));
return $$TMP443;
}
);
$$root["offset-source-mapping"];
$$root["concat-tc-str"]=(function(a,b){
   var $$TMP446;
   var $$TMP447;
if($$root["string?"](b)){
$$TMP447=$$root["make-tc-str"]($$root["str"]($$root["geti"](a,(new $$root.Symbol("data"))),b),$$root["geti"](a,(new $$root.Symbol("mappings"))));
}
else{
$$TMP447=$$root["make-tc-str"]($$root["str"]($$root["geti"](a,(new $$root.Symbol("data"))),$$root["geti"](b,(new $$root.Symbol("data")))),$$root["concat"]($$root["geti"](a,(new $$root.Symbol("mappings"))),$$root["map"]((function(e){
   var $$TMP448;
$$TMP448=$$root["offset-source-mapping"](e,$$root["geti"]($$root["geti"](a,(new $$root.Symbol("data"))),(new $$root.Symbol("length"))));
return $$TMP448;
}
),$$root["geti"](b,(new $$root.Symbol("mappings"))))));
}
$$TMP446=$$TMP447;
return $$TMP446;
}
);
$$root["concat-tc-str"];
$$root["join-tc-frags"]=(function(sep,frags){
   var $$TMP449;
   $$TMP449=(function(vals,inits){
      var $$TMP450;
$$TMP450=$$root["make-tc-frag"]($$root["reduce"]($$root["concat-tc-str"],$$root["cdr"](vals),$$root["car"](vals)),$$root["reduce"]($$root["concat-tc-str"],$$root["cdr"](inits),$$root["car"](inits)));
return $$TMP450;
}
)($$root["interpose"](sep,$$root["map"]($$root["getter"]((new $$root.Symbol("val"))),frags)),$$root["map"]($$root["getter"]((new $$root.Symbol("init"))),frags));
return $$TMP449;
}
);
$$root["join-tc-frags"];
$$root["concat-tc-frag"]=(function(a,b){
   var $$TMP451;
   var $$TMP452;
if($$root["string?"](b)){
$$TMP452=$$root["make-tc-frag"]($$root["concat-tc-str"]($$root["geti"](a,(new $$root.Symbol("val"))),b),$$root["geti"](a,(new $$root.Symbol("init"))));
}
else{
$$TMP452=$$root["make-tc-frag"]($$root["concat-tc-str"]($$root["geti"](a,(new $$root.Symbol("val"))),$$root["geti"](b,(new $$root.Symbol("val")))),$$root["concat-tc-str"]($$root["geti"](a,(new $$root.Symbol("init"))),$$root["geti"](b,(new $$root.Symbol("init")))));
}
$$TMP451=$$TMP452;
return $$TMP451;
}
);
$$root["concat-tc-frag"];
$$root["interpolate-tc-%c"]=(function(accum,fmt,idx,args){
   var $$TMP453;
   var $$TMP454;
if($$root["empty?"]($$root["subs"](fmt,2))){
$$TMP454=$$root["idiv"](idx,2);
}
else{
$$TMP454=$$root["parseInt"]($$root["subs"](fmt,2));
}
$$TMP453=$$root["concat-tc-frag"](accum,$$root["nth"]($$TMP454,args));
return $$TMP453;
}
);
$$root["interpolate-tc-%c"];
$$root["interpolate-tc-%e"]=(function(accum,fmt,idx,args){
   var $$TMP455;
   var $$TMP456;
if($$root["empty?"]($$root["subs"](fmt,2))){
$$TMP456=$$root["idiv"](idx,2);
}
else{
$$TMP456=$$root["parseInt"]($$root["subs"](fmt,2));
}
$$TMP455=(function(frags){
   var $$TMP457;
$$TMP457=$$root["update"](accum,(new $$root.Symbol("val")),(function(old__MINUSval){
   var $$TMP458;
$$TMP458=$$root["concat-tc-str"](old__MINUSval,$$root["reduce"]((function(accum,v){
   var $$TMP459;
$$TMP459=$$root["concat-tc-str"]($$root["concat-tc-str"]($$root["concat-tc-str"](accum,$$root["geti"](v,(new $$root.Symbol("init")))),$$root["geti"](v,(new $$root.Symbol("val")))),";");
return $$TMP459;
}
),frags,$$root["make-tc-str"]("",[])));
return $$TMP458;
}
));
return $$TMP457;
}
)($$root["nth"]($$TMP456,args));
return $$TMP455;
}
);
$$root["interpolate-tc-%e"];
$$root["interpolate-tc-frags"]=(function(fmt){
   var args=Array(arguments.length-1);
   for(var $$TMP474=1;
   $$TMP474<arguments.length;
   ++$$TMP474){
      args[$$TMP474-1]=arguments[$$TMP474];
   }
   var $$TMP460;
   $$TMP460=(function(rx){
      var $$TMP461;
      $$TMP461=(function(__GS24,accum,__GS25,x,n){
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
   $$TMP465=(function(){
      var $$TMP467;
x=$$root["car"](__GS25);
x;
var $$TMP468;
if($$root["even?"](n)){
accum=$$root["concat-tc-frag"](accum,x);
$$TMP468=accum;
}
else{
   $$TMP468=(function(__GS26){
      var $$TMP469;
      var $$TMP470;
if($$root["equal?"](__GS26,"%c")){
accum=$$root["interpolate-tc-%c"](accum,x,n,args);
$$TMP470=accum;
}
else{
   var $$TMP471;
if($$root["equal?"](__GS26,"%e")){
accum=$$root["interpolate-tc-%e"](accum,x,n,args);
$$TMP471=accum;
}
else{
   var $$TMP472;
   if(true){
$$TMP472=$$root["error"]("Unrecognized formatter!");
}
else{
   $$TMP472=undefined;
}
$$TMP471=$$TMP472;
}
$$TMP470=$$TMP471;
}
$$TMP469=$$TMP470;
return $$TMP469;
}
)($$root["subs"](x,0,2));
}
__GS24=$$TMP468;
__GS24;
__GS25=$$root["cdr"](__GS25);
__GS25;
n=$$root["+"](n,1);
n;
$$TMP467=recur();
return $$TMP467;
}
)();
}
else{
   $$TMP465=(function(){
      var $$TMP473;
      $$TMP473=__GS24;
      return $$TMP473;
   }
   )();
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
)(undefined,$$root["make-tc-frag"]($$root["make-tc-str"]("",[]),$$root["make-tc-str"]("",[])),(fmt).split(rx),[],0);
return $$TMP461;
}
)($$root["regex"]("(%[ce](?:[0-9]+)?)","gi"));
return $$TMP460;
}
);
$$root["interpolate-tc-frags"];
$$root["%inspect%"]=$$root["geti"]($$root["require"]("util"),(new $$root.Symbol("inspect")));
$$root["%inspect%"];
$$root["inspect"]=(function(obj){
   var $$TMP475;
$$TMP475=$$root["%inspect%"](obj,true,10);
return $$TMP475;
}
);
$$root["inspect"];
$$root["compiler-proto"]=$$root["object"]();
$$root["compiler-proto"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){
   var $$TMP476;
   $$TMP476=(function(self){
      var $$TMP477;
      $$TMP477=(function(__GS27){
         var $$TMP478;
$$root["seti!"](__GS27,"root",root);
$$root["seti!"](__GS27,"next-var-suffix",0);
$$TMP478=__GS27;
return $$TMP478;
}
)(self);
return $$TMP477;
}
)(this);
return $$TMP476;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){
   var $$TMP479;
   $$TMP479=(function(self){
      var $$TMP480;
      $$TMP480=(function(out){
         var $$TMP481;
$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));
$$TMP481=out;
return $$TMP481;
}
)($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));
return $$TMP480;
}
)(this);
return $$TMP479;
}
));
$$root["compile-time-resolve"]=(function(lexenv,sym){
   var $$TMP482;
   var $$TMP483;
if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){
$$TMP483=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));
}
else{
$$TMP483=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP482=$$TMP483;
return $$TMP482;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP484;
   $$TMP484=(function(self){
      var $$TMP485;
      var $$TMP486;
if($$root["="](x,true)){
$$TMP486=$$root["list"]("true","");
}
else{
   var $$TMP487;
if($$root["="](x,false)){
$$TMP487=$$root["list"]("false","");
}
else{
   var $$TMP488;
if($$root["null?"](x)){
$$TMP488=$$root["list"]("[]","");
}
else{
   var $$TMP489;
if($$root["="](x,undefined)){
$$TMP489=$$root["list"]("undefined","");
}
else{
   var $$TMP490;
if($$root["symbol?"](x)){
$$TMP490=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP491;
if($$root["string?"](x)){
$$TMP491=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP492;
   if(true){
$$TMP492=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP492=undefined;
}
$$TMP491=$$TMP492;
}
$$TMP490=$$TMP491;
}
$$TMP489=$$TMP490;
}
$$TMP488=$$TMP489;
}
$$TMP487=$$TMP488;
}
$$TMP486=$$TMP487;
}
$$TMP485=$$TMP486;
return $$TMP485;
}
)(this);
return $$TMP484;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP493;
   $$TMP493=(function(self){
      var $$TMP494;
      $$TMP494=(function(__GS28){
         var $$TMP495;
         $$TMP495=(function(fun,args){
            var $$TMP496;
            $$TMP496=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP497;
$$TMP497=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP497;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP496;
}
)($$root["nth"](0,__GS28),$$root["drop"](1,__GS28));
return $$TMP495;
}
)(lst);
return $$TMP494;
}
)(this);
return $$TMP493;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-new")),(function(lexenv,lst){
   var $$TMP498;
   $$TMP498=(function(self){
      var $$TMP499;
      $$TMP499=(function(__GS29){
         var $$TMP500;
         $$TMP500=(function(fun,args){
            var $$TMP501;
            $$TMP501=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP502;
$$TMP502=$$root["list"]($$root["format"]("(new (%0)(%1))",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP502;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP501;
}
)($$root["nth"](1,__GS29),$$root["drop"](2,__GS29));
return $$TMP500;
}
)(lst);
return $$TMP499;
}
)(this);
return $$TMP498;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP503;
   $$TMP503=(function(self){
      var $$TMP504;
      $$TMP504=(function(__GS30){
         var $$TMP505;
         $$TMP505=(function(method,obj,args){
            var $$TMP506;
            $$TMP506=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP507;
$$TMP507=$$root["list"]($$root["format"]("(%0)%1(%2)",$$root["first"](compiled__MINUSobj),method,$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSobj),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP507;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP506;
}
)($$root["nth"](0,__GS30),$$root["nth"](1,__GS30),$$root["drop"](2,__GS30));
return $$TMP505;
}
)(lst);
return $$TMP504;
}
)(this);
return $$TMP503;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP508;
   $$TMP508=(function(self){
      var $$TMP509;
      $$TMP509=(function(compiled__MINUSbody,reducer){
         var $$TMP511;
$$TMP511=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP511;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP510;
$$TMP510=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP510;
}
));
return $$TMP509;
}
)(this);
return $$TMP508;
}
));
$$root["is-vararg?"]=(function(sym){
   var $$TMP512;
$$TMP512=$$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&");
return $$TMP512;
}
);
$$root["is-vararg?"];
$$root["lexical-name"]=(function(sym){
   var $$TMP513;
   var $$TMP514;
if($$root["is-vararg?"](sym)){
$$TMP514=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP514=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP513=$$TMP514;
return $$TMP513;
}
);
$$root["lexical-name"];
$$root["process-args"]=(function(args){
   var $$TMP515;
$$TMP515=$$root["join"](",",$$root["map"]((function(v){
   var $$TMP516;
$$TMP516=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
return $$TMP516;
}
),$$root["filter"]($$root["complement"]($$root["is-vararg?"]),args)));
return $$TMP515;
}
);
$$root["process-args"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("vararg-helper")),(function(args){
   var $$TMP517;
   $$TMP517=(function(self){
      var $$TMP518;
      var $$TMP519;
if($$root["not"]($$root["null?"](args))){
   $$TMP519=(function(){
      var $$TMP520;
$$TMP520=$$root["last"](args);
return $$TMP520;
}
)();
}
else{
   $$TMP519=undefined;
}
$$TMP518=(function(last__MINUSarg){
   var $$TMP521;
   var $$TMP522;
   var $$TMP523;
   if(last__MINUSarg){
      var $$TMP524;
if($$root["is-vararg?"](last__MINUSarg)){
   $$TMP524=true;
}
else{
   $$TMP524=false;
}
$$TMP523=$$TMP524;
}
else{
   $$TMP523=false;
}
if($$TMP523){
$$TMP522=$$root["format"]($$root["str"]("var %0=Array(arguments.length-%1);","for(var %2=%1;%2<arguments.length;++%2)","{%0[%2-%1]=arguments[%2];}"),$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](last__MINUSarg,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)),$$root["dec"]($$root["count"](args)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
}
else{
$$TMP522="";
}
$$TMP521=$$TMP522;
return $$TMP521;
}
)($$TMP519);
return $$TMP518;
}
)(this);
return $$TMP517;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP525;
   $$TMP525=(function(self){
      var $$TMP526;
      $$TMP526=(function(__GS31){
         var $$TMP527;
         $$TMP527=(function(__GS32){
            var $$TMP528;
            $$TMP528=(function(args,body){
               var $$TMP529;
               $$TMP529=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP531;
                  $$TMP531=(function(compiled__MINUSbody){
                     var $$TMP532;
$$TMP532=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{",$$root["call-method-by-name"](self,(new $$root.Symbol("vararg-helper")),args),"var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP532;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP531;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP530;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP530=accum;
return $$TMP530;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP529;
}
)($$root["drop"](0,__GS32),$$root["drop"](2,__GS31));
return $$TMP528;
}
)($$root["nth"](1,__GS31));
return $$TMP527;
}
)(lst);
return $$TMP526;
}
)(this);
return $$TMP525;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP533;
   $$TMP533=(function(self){
      var $$TMP534;
      $$TMP534=(function(__GS33){
         var $$TMP535;
         $$TMP535=(function(c,t,f){
            var $$TMP536;
            $$TMP536=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP537;
$$TMP537=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP537;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP536;
}
)($$root["nth"](1,__GS33),$$root["nth"](2,__GS33),$$root["nth"](3,__GS33));
return $$TMP535;
}
)(lst);
return $$TMP534;
}
)(this);
return $$TMP533;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP538;
   $$TMP538=(function(self){
      var $$TMP539;
      var $$TMP540;
if($$root["symbol?"](x)){
$$TMP540=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
$$TMP540=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP539=$$TMP540;
return $$TMP539;
}
)(this);
return $$TMP538;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP541;
   $$TMP541=(function(self){
      var $$TMP542;
$$TMP542=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP542;
}
)(this);
return $$TMP541;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP543;
   $$TMP543=(function(self){
      var $$TMP544;
      var $$TMP545;
if($$root["atom?"](x)){
$$TMP545=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP545=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP544=$$TMP545;
return $$TMP544;
}
)(this);
return $$TMP543;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP546;
   $$TMP546=(function(self){
      var $$TMP547;
      $$TMP547=(function(__GS34){
         var $$TMP548;
         $$TMP548=(function(name,value){
            var $$TMP549;
            $$TMP549=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP550;
$$TMP550=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP550;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP549;
}
)($$root["nth"](1,__GS34),$$root["nth"](2,__GS34));
return $$TMP548;
}
)(lst);
return $$TMP547;
}
)(this);
return $$TMP546;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP551;
   $$TMP551=(function(self){
      var $$TMP552;
      $$TMP552=(function(__GS35){
         var $$TMP553;
         $$TMP553=(function(name,args){
            var $$TMP554;
            $$TMP554=(function(tmp){
               var $$TMP556;
$$TMP556=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP556;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP555;
$$TMP555=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP555;
}
),args))));
return $$TMP554;
}
)($$root["nth"](0,__GS35),$$root["drop"](1,__GS35));
return $$TMP553;
}
)(expr);
return $$TMP552;
}
)(this);
return $$TMP551;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP557;
   $$TMP557=(function(self){
      var $$TMP558;
      var $$TMP559;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP560;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP560=true;
}
else{
   $$TMP560=false;
}
$$TMP559=$$TMP560;
}
else{
   $$TMP559=false;
}
$$TMP558=$$TMP559;
return $$TMP558;
}
)(this);
return $$TMP557;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP561;
   $$TMP561=(function(self){
      var $$TMP562;
      var $$TMP563;
      var $$TMP564;
if($$root["list?"](expr)){
   var $$TMP565;
if($$root["not"]($$root["null?"](expr))){
   $$TMP565=true;
}
else{
   $$TMP565=false;
}
$$TMP564=$$TMP565;
}
else{
   $$TMP564=false;
}
if($$TMP564){
   $$TMP563=(function(first){
      var $$TMP566;
      var $$TMP567;
if($$root["symbol?"](first)){
   $$TMP567=(function(__GS36){
      var $$TMP568;
      var $$TMP569;
if($$root["equal?"](__GS36,(new $$root.Symbol("lambda")))){
$$TMP569=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP570;
if($$root["equal?"](__GS36,(new $$root.Symbol("new")))){
$$TMP570=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-new")),lexenv,expr);
}
else{
   var $$TMP571;
if($$root["equal?"](__GS36,(new $$root.Symbol("if")))){
$$TMP571=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP572;
if($$root["equal?"](__GS36,(new $$root.Symbol("quote")))){
$$TMP572=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP573;
if($$root["equal?"](__GS36,(new $$root.Symbol("setv!")))){
$$TMP573=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP574;
if($$root["equal?"](__GS36,(new $$root.Symbol("def")))){
$$TMP574=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP575;
   if(true){
      var $$TMP576;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP576=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP577;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP577=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP578;
   if(true){
$$TMP578=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP578=undefined;
}
$$TMP577=$$TMP578;
}
$$TMP576=$$TMP577;
}
$$TMP575=$$TMP576;
}
else{
   $$TMP575=undefined;
}
$$TMP574=$$TMP575;
}
$$TMP573=$$TMP574;
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
return $$TMP568;
}
)(first);
}
else{
$$TMP567=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP566=$$TMP567;
return $$TMP566;
}
)($$root["car"](expr));
}
else{
$$TMP563=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP562=$$TMP563;
return $$TMP562;
}
)(this);
return $$TMP561;
}
));
