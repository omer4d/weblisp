function argReducer(name, r, initial) {
    return function(...args) {
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

    list: function list(...args) {
        return args;
    },

    concat: function concat(...args) {
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

    "=":  function __EQL(...args) {
        var v = args[0];

        for (var i = 1; i < args.length; ++i)
            if (args[i] !== v && !($$root["null?"](args[i]) && $$root["null?"](v)))
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
    print       :   function print(...args) { console.log(args.map(str1).join(" ")); },
    regex       :   function regex(str, flags) { return new RegExp(str, flags); },
    
    object      :   function object(proto) { return Object.create(proto || {}); },
	"hashmap"	:   function hashmap() { return Object.create(null); },
    geti        :   function geti(obj, idx) { return obj[idx]; },
    "seti!"     :   function seti__BANG(obj, idx, val) { obj[idx] = val },
    
    "apply-method"  :   function apply__MINUSmethod(method, target, args) {
        return method.apply(target, args);
    },
    "call-method"   :   function call__MINUSmethod(method, target, ...args) {
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
$$root["prototype?"]=(function(p,o){
   var $$TMP95;
$$TMP95=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP95;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP96;
   var $$TMP97;
if($$root["null?"](a)){
$$TMP97=$$root["null?"](b);
}
else{
   var $$TMP98;
if($$root["symbol?"](a)){
   var $$TMP99;
if($$root["symbol?"](b)){
   var $$TMP100;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP100=true;
}
else{
   $$TMP100=false;
}
$$TMP99=$$TMP100;
}
else{
   $$TMP99=false;
}
$$TMP98=$$TMP99;
}
else{
   var $$TMP101;
if($$root["atom?"](a)){
$$TMP101=$$root["="](a,b);
}
else{
   var $$TMP102;
if($$root["list?"](a)){
   var $$TMP103;
if($$root["list?"](b)){
   var $$TMP104;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP105;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP105=true;
}
else{
   $$TMP105=false;
}
$$TMP104=$$TMP105;
}
else{
   $$TMP104=false;
}
$$TMP103=$$TMP104;
}
else{
   $$TMP103=false;
}
$$TMP102=$$TMP103;
}
else{
   $$TMP102=undefined;
}
$$TMP101=$$TMP102;
}
$$TMP98=$$TMP101;
}
$$TMP97=$$TMP98;
}
$$TMP96=$$TMP97;
return $$TMP96;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP106;
   $$TMP106=(function(res){
      var $$TMP112;
$$TMP112=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP112;
}
)((function(recur){
   var $$TMP107;
   recur=(function(l1,l2){
      var $$TMP108;
      var $$TMP109;
      if((function(c){
         var $$TMP110;
         var $$TMP111;
         if(c){
            $$TMP111=c;
         }
         else{
$$TMP111=p($$root["car"](l2));
}
$$TMP110=$$TMP111;
return $$TMP110;
}
)($$root["null?"](l2))){
$$TMP109=$$root["list"](l1,l2);
}
else{
$$TMP109=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP108=$$TMP109;
return $$TMP108;
}
);
recur;
$$TMP107=recur([],lst);
return $$TMP107;
}
)([]));
return $$TMP106;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP113;
   var $$TMP114;
if($$root["reduce"]((function(accum,v){
   var $$TMP115;
   var $$TMP116;
   if(accum){
      $$TMP116=accum;
   }
   else{
      $$TMP116=v;
   }
   $$TMP115=$$TMP116;
   return $$TMP115;
}
),lst,false)){
   $$TMP114=true;
}
else{
   $$TMP114=false;
}
$$TMP113=$$TMP114;
return $$TMP113;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP117;
$$TMP117=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP118;
   var $$TMP119;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP120;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
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
return $$TMP118;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP117;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP121;
   $$TMP121=(function(binding__MINUSnames){
      var $$TMP122;
      $$TMP122=(function(divs){
         var $$TMP124;
         var $$TMP125;
if($$root["null?"]($$root["second"](divs))){
$$TMP125=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP125=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP124=$$TMP125;
return $$TMP124;
}
)($$root["split"]((function(pair){
   var $$TMP123;
$$TMP123=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP123;
}
),binding__MINUSpairs));
return $$TMP122;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP121;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP126;
$$TMP126=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP126;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP127;
   $$TMP127=(function(x){
      var $$TMP128;
$$TMP128=$$root["not"](f(x));
return $$TMP128;
}
);
return $$TMP127;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP129;
   $$TMP129=(function(...args){
      var $$TMP130;
$$TMP130=f1($$root["apply"](f2,args));
return $$TMP130;
}
);
return $$TMP129;
}
);
$$root["compose"];
$$root["partial"]=(function(f,...args1){
   var $$TMP131;
   $$TMP131=(function(...args2){
      var $$TMP132;
$$TMP132=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP132;
}
);
return $$TMP131;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield,...args1){
   var $$TMP133;
   $$TMP133=(function(...args2){
      var $$TMP134;
$$TMP134=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP134;
}
);
return $$TMP133;
}
);
$$root["partial-method"];
$$root["format"]=(function(...args){
   var $$TMP135;
   $$TMP135=(function(rx){
      var $$TMP136;
$$TMP136=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP137;
$$TMP137=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP137;
}
));
return $$TMP136;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP135;
}
);
$$root["format"];
$$root["case"]=(function(e,...pairs){
   var $$TMP138;
   $$TMP138=(function(e__MINUSname,def__MINUSidx){
      var $$TMP139;
      var $$TMP140;
if($$root["="](def__MINUSidx,-1)){
$$TMP140=$$root.list(((new $$root.Symbol("error")) ),("Fell out of case!" ));
}
else{
$$TMP140=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP139=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP141;
$$TMP141=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP142;
$$TMP142=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP142;
}
),$$root["filter"]((function(pair){
   var $$TMP143;
$$TMP143=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP143;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP141;
}
)($$TMP140,$$root["partition"](2,pairs));
return $$TMP139;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP138;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP144;
   $$TMP144=(function(expr__MINUSname){
      var $$TMP145;
$$TMP145=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP146;
   var $$TMP147;
if($$root["symbol?"](v)){
   var $$TMP148;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP148=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP149;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP149=[];
}
else{
$$TMP149=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP148=$$TMP149;
}
$$TMP147=$$TMP148;
}
else{
$$TMP147=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP146=$$TMP147;
return $$TMP146;
}
),structure)));
return $$TMP145;
}
)($$root["gensym"]());
return $$TMP144;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP150;
   var $$TMP151;
if($$root["symbol?"](structure)){
$$TMP151=$$root["list"](structure,expr);
}
else{
$$TMP151=$$root["destruct-helper"](structure,expr);
}
$$TMP150=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP151),body);
return $$TMP150;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP152;
   var $$TMP153;
if($$root["list?"](expr)){
   var $$TMP154;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP154=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP154=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP153=$$TMP154;
}
else{
   $$TMP153=expr;
}
$$TMP152=$$TMP153;
return $$TMP152;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP155;
   var $$TMP156;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP156=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP157;
   var $$TMP158;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP159;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
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
if($$TMP158){
$$TMP157=$$root["list?"](expr);
}
else{
   var $$TMP160;
   if(true){
      var $$TMP161;
      var $$TMP162;
if($$root["list?"](expr)){
   var $$TMP163;
if($$root["not"]($$root["null?"](expr))){
   $$TMP163=true;
}
else{
   $$TMP163=false;
}
$$TMP162=$$TMP163;
}
else{
   $$TMP162=false;
}
if($$TMP162){
   var $$TMP164;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP165;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP165=true;
}
else{
   $$TMP165=false;
}
$$TMP164=$$TMP165;
}
else{
   $$TMP164=false;
}
$$TMP161=$$TMP164;
}
else{
   $$TMP161=false;
}
$$TMP160=$$TMP161;
}
else{
   $$TMP160=undefined;
}
$$TMP157=$$TMP160;
}
$$TMP156=$$TMP157;
}
$$TMP155=$$TMP156;
return $$TMP155;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP166;
   var $$TMP167;
if($$root["null?"](patt)){
$$TMP167=$$root["null?"](expr);
}
else{
   var $$TMP168;
if($$root["list?"](patt)){
$$TMP168=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP169;
if($$root["symbol?"](patt)){
   $$TMP169=true;
}
else{
   var $$TMP170;
   if(true){
$$TMP170=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP170=undefined;
}
$$TMP169=$$TMP170;
}
$$TMP168=$$TMP169;
}
$$TMP167=$$TMP168;
}
$$TMP166=$$TMP167;
return $$TMP166;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP171;
   var $$TMP172;
   var $$TMP173;
if($$root["list?"](patt)){
   var $$TMP174;
if($$root["not"]($$root["null?"](patt))){
   $$TMP174=true;
}
else{
   $$TMP174=false;
}
$$TMP173=$$TMP174;
}
else{
   $$TMP173=false;
}
if($$TMP173){
   var $$TMP175;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP175=(new $$root.Symbol("_"));
}
else{
$$TMP175=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP172=$$TMP175;
}
else{
   $$TMP172=patt;
}
$$TMP171=$$TMP172;
return $$TMP171;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP176;
   $$TMP176=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP177;
$$TMP177=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP178;
$$TMP178=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP178;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP177;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP176;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP179;
   $$TMP179=(function(__GS1){
      var $$TMP180;
      var $$TMP181;
if($$root["matches?"](__GS1,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("geti")) )) ),((new $$root.Symbol("obj")) ),((new $$root.Symbol("field")) )))){
   $$TMP181=(function(__GS2){
      var $$TMP182;
      $$TMP182=(function(obj,field){
         var $$TMP183;
$$TMP183=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP183;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP182;
}
)(__GS1);
}
else{
   var $$TMP184;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP184=(function(any){
      var $$TMP185;
      var $$TMP186;
if($$root["symbol?"](any)){
$$TMP186=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP186=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP185=$$TMP186;
return $$TMP185;
}
)(__GS1);
}
else{
   var $$TMP187;
   if(true){
$$TMP187=$$root["error"]("Fell out of case!");
}
else{
   $$TMP187=undefined;
}
$$TMP184=$$TMP187;
}
$$TMP181=$$TMP184;
}
$$TMP180=$$TMP181;
return $$TMP180;
}
)($$root["macroexpand"](place));
return $$TMP179;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP188;
   amt=(function(c){
      var $$TMP189;
      var $$TMP190;
      if(c){
         $$TMP190=c;
      }
      else{
         $$TMP190=1;
      }
      $$TMP189=$$TMP190;
      return $$TMP189;
   }
   )(amt);
   amt;
$$TMP188=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP188;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
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
$$TMP191=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP191;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP194;
$$TMP194=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP194;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP195;
   var $$TMP196;
if($$root["null?"](forms)){
   $$TMP196=x;
}
else{
$$TMP196=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP195=$$TMP196;
return $$TMP195;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["doto"]=(function(obj__MINUSexpr,...body){
   var $$TMP197;
   $$TMP197=(function(binding__MINUSname){
      var $$TMP198;
$$TMP198=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP199;
   $$TMP199=(function(__GS3){
      var $$TMP200;
      $$TMP200=(function(f,args){
         var $$TMP201;
$$TMP201=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP201;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP200;
}
)(v);
return $$TMP199;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP198;
}
)($$root["gensym"]());
return $$TMP197;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["while"]=(function(c,...body){
   var $$TMP202;
$$TMP202=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP202;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP203;
$$TMP203=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP203;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP204;
   step=(function(c){
      var $$TMP205;
      var $$TMP206;
      if(c){
         $$TMP206=c;
      }
      else{
         $$TMP206=1;
      }
      $$TMP205=$$TMP206;
      return $$TMP205;
   }
   )(step);
   step;
   $$TMP204=(function(data){
      var $$TMP207;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP207=data;
return $$TMP207;
}
)($$root["object"]([]));
return $$TMP204;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP208;
   $$TMP208=(function(len__MINUSname,data){
      var $$TMP209;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP209=data;
return $$TMP209;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP208;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP210;
   $$TMP210=(function(lst__MINUSname,data){
      var $$TMP211;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP211=data;
return $$TMP211;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP210;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP212;
   $$TMP212=(function(__GS4){
      var $$TMP213;
      $$TMP213=(function(binding__MINUSname,__GS5){
         var $$TMP214;
         $$TMP214=(function(func__MINUSname,args){
            var $$TMP215;
$$TMP215=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP215;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP214;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP213;
}
)(form);
return $$TMP212;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP216;
   $$TMP216=(function(data){
      var $$TMP217;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP217=data;
return $$TMP217;
}
)($$root["object"]([]));
return $$TMP216;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP218;
   $$TMP218=(function(data){
      var $$TMP219;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP219=data;
return $$TMP219;
}
)($$root["object"]([]));
return $$TMP218;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP220;
   $$TMP220=(function(data){
      var $$TMP221;
      (function(__GS6){
         var $$TMP222;
         $$TMP222=(function(binding__MINUSname,body){
            var $$TMP223;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP223=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP223;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP222;
}
)(form);
$$TMP221=data;
return $$TMP221;
}
)($$root["object"]([]));
return $$TMP220;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP224;
   $$TMP224=(function(data){
      var $$TMP225;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP225=data;
return $$TMP225;
}
)($$root["object"]([]));
return $$TMP224;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP226;
   $$TMP226=(function(data,accum__MINUSname){
      var $$TMP227;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP227=data;
return $$TMP227;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP226;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP228;
$$TMP228=$$root["filter"]((function(x){
   var $$TMP229;
$$TMP229=$$root["not="](x,undefined);
return $$TMP229;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP228;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP230;
   $$TMP230=(function(res__MINUSname){
      var $$TMP231;
      $$TMP231=(function(all){
         var $$TMP241;
         $$TMP241=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP243;
            var $$TMP244;
if($$root["null?"](final__MINUSactions)){
$$TMP244=$$root["list"](res__MINUSname);
}
else{
   $$TMP244=final__MINUSactions;
}
$$TMP243=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP244)))))));
return $$TMP243;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP242;
$$TMP242=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP242;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP241;
}
)($$root["map"]((function(form){
   var $$TMP232;
   $$TMP232=(function(__GS7){
      var $$TMP233;
      var $$TMP234;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP234=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP235;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP235=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP236;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP236=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP237;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP237=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP238;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP238=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP239;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP239=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP240;
   if(true){
$$TMP240=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP240=undefined;
}
$$TMP239=$$TMP240;
}
$$TMP238=$$TMP239;
}
$$TMP237=$$TMP238;
}
$$TMP236=$$TMP237;
}
$$TMP235=$$TMP236;
}
$$TMP234=$$TMP235;
}
$$TMP233=$$TMP234;
return $$TMP233;
}
)($$root["car"](form));
return $$TMP232;
}
),forms));
return $$TMP231;
}
)($$root["gensym"]());
return $$TMP230;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["renderer"]=($$root["PIXI"]).autoDetectRenderer(800,600);
$$root["renderer"];
$$root["call-method-by-name"]($$root["geti"]($$root["get-document"](),(new $$root.Symbol("body"))),(new $$root.Symbol("appendChild")),$$root["geti"]($$root["renderer"],(new $$root.Symbol("view"))));
$$root["stage"]=(new ($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Container"))))());
$$root["stage"];
($$root["console"]).log($$root["stage"]);
$$root["texture"]=$$root["call-method-by-name"]($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Texture"))),(new $$root.Symbol("fromImage")),"res/char.png");
$$root["texture"];
$$root["sprite"]=(new ($$root["geti"]($$root["PIXI"],(new $$root.Symbol("Sprite"))))($$root["texture"]));
$$root["sprite"];
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("anchor"))),(new $$root.Symbol("x")),0.5);
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("anchor"))),(new $$root.Symbol("y")),0.5);
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("position"))),(new $$root.Symbol("x")),200);
$$root["seti!"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("position"))),(new $$root.Symbol("y")),150);
($$root["stage"]).addChild($$root["sprite"]);
$$root["request-frame"]=(function(callback){
   var $$TMP245;
$$TMP245=$$root["call-method"]($$root["requestAnimationFrame"],$$root["get-window"](),callback);
return $$TMP245;
}
);
$$root["request-frame"];
$$root["animate"]=(function(){
   var $$TMP246;
$$root["seti!"]($$root["sprite"],(new $$root.Symbol("x")),$$root["+"]($$root["geti"]($$root["sprite"],(new $$root.Symbol("x"))),2));
($$root["renderer"]).render($$root["stage"]);
$$TMP246=$$root["request-frame"]($$root["animate"]);
return $$TMP246;
}
);
$$root["animate"];
$$root["request-frame"]($$root["animate"]);
