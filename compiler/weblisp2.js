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
$$TMP140=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
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
if($$root["matches?"](__GS1,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("geti")),[])),$$root.cons((new $$root.Symbol("obj")),$$root.cons((new $$root.Symbol("field")),[]))))){
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
   var $$TMP245;
   $$TMP245=(function(self){
      var $$TMP246;
      $$TMP246=(function(__GS8){
         var $$TMP247;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP247=__GS8;
return $$TMP247;
}
)(self);
return $$TMP246;
}
)(this);
return $$TMP245;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP248;
   $$TMP248=(function(self){
      var $$TMP249;
$$TMP249=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP249;
}
)(this);
return $$TMP248;
}
));
$$root["lit"]=(function(s){
   var $$TMP250;
$$TMP250=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP250;
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
   var $$TMP251;
   $$TMP251=(function(toks,pos,s){
      var $$TMP252;
      (function(recur){
         var $$TMP253;
         recur=(function(){
            var $$TMP254;
            var $$TMP255;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP255=(function(){
      var $$TMP256;
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP257;
         $$TMP257=(function(recur){
            var $$TMP258;
            recur=(function(){
               var $$TMP259;
               var $$TMP260;
               var $$TMP261;
if($$root["<"](i,__GS10)){
   var $$TMP262;
if($$root["not"]($$root["null?"](__GS11))){
   var $$TMP263;
if($$root["not"](res)){
   $$TMP263=true;
}
else{
   $$TMP263=false;
}
$$TMP262=$$TMP263;
}
else{
   $$TMP262=false;
}
$$TMP261=$$TMP262;
}
else{
   $$TMP261=false;
}
if($$TMP261){
   $$TMP260=(function(){
      var $$TMP264;
entry=$$root["car"](__GS11);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP264=recur();
return $$TMP264;
}
)();
}
else{
   $$TMP260=(function(){
      var $$TMP265;
      _=__GS9;
      _;
      var $$TMP266;
      if(res){
         $$TMP266=(function(){
            var $$TMP267;
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP268;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP268=(function(){
      var $$TMP269;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP270;
   var $$TMP271;
   if(c){
      $$TMP271=c;
   }
   else{
$$TMP271=$$root["second"](entry);
}
$$TMP270=$$TMP271;
return $$TMP270;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP269=toks;
return $$TMP269;
}
)();
}
else{
   $$TMP268=undefined;
}
$$TMP268;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP267=pos;
return $$TMP267;
}
)();
}
else{
$$TMP266=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP266;
$$TMP265=__GS9;
return $$TMP265;
}
)();
}
$$TMP259=$$TMP260;
return $$TMP259;
}
);
recur;
$$TMP258=recur();
return $$TMP258;
}
)([]);
return $$TMP257;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP256=recur();
return $$TMP256;
}
)();
}
else{
   $$TMP255=undefined;
}
$$TMP254=$$TMP255;
return $$TMP254;
}
);
recur;
$$TMP253=recur();
return $$TMP253;
}
)([]);
$$TMP252=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP252;
}
)([],0,src);
return $$TMP251;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP272;
   $$TMP272=(function(self){
      var $$TMP273;
$$TMP273=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP273;
}
)(this);
return $$TMP272;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP274;
   $$TMP274=(function(self){
      var $$TMP275;
$$TMP275=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP275;
}
)(this);
return $$TMP274;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP276;
   $$TMP276=(function(self){
      var $$TMP277;
      $$TMP277=(function(curr){
         var $$TMP278;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP278=curr;
return $$TMP278;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP277;
}
)(this);
return $$TMP276;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP279;
$$TMP279=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP279;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP280;
$$TMP280=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP280;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP281;
   $$TMP281=(function(self){
      var $$TMP282;
      $$TMP282=(function(tok){
         var $$TMP283;
         $$TMP283=(function(__GS12){
            var $$TMP284;
            var $$TMP285;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
$$TMP285=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP286;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP286=true;
}
else{
   var $$TMP287;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP287=false;
}
else{
   var $$TMP288;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP288=[];
}
else{
   var $$TMP289;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP289=undefined;
}
else{
   var $$TMP290;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP290=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP291;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP291=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP292;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP292=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP293;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
$$TMP293=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP294;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP294=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP295;
   if(true){
$$TMP295=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP295=undefined;
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
}
$$TMP286=$$TMP287;
}
$$TMP285=$$TMP286;
}
$$TMP284=$$TMP285;
return $$TMP284;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP283;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP282;
}
)(this);
return $$TMP281;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP296;
   $$TMP296=(function(self){
      var $$TMP297;
      $$TMP297=(function(__GS13,__GS14,lst){
         var $$TMP298;
         $$TMP298=(function(recur){
            var $$TMP299;
            recur=(function(){
               var $$TMP300;
               var $$TMP301;
               var $$TMP302;
               var $$TMP303;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP304;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP304=true;
}
else{
   $$TMP304=false;
}
$$TMP303=$$TMP304;
}
else{
   $$TMP303=false;
}
if($$TMP303){
   $$TMP302=true;
}
else{
   $$TMP302=false;
}
if($$TMP302){
   $$TMP301=(function(){
      var $$TMP305;
__GS14=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS14);
__GS13=__GS14;
__GS13;
$$TMP305=recur();
return $$TMP305;
}
)();
}
else{
   $$TMP301=(function(){
      var $$TMP306;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP307;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP307=lst;
}
else{
$$TMP307=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP307;
$$TMP306=__GS13;
return $$TMP306;
}
)();
}
$$TMP300=$$TMP301;
return $$TMP300;
}
);
recur;
$$TMP299=recur();
return $$TMP299;
}
)([]);
return $$TMP298;
}
)(undefined,[],undefined);
return $$TMP297;
}
)(this);
return $$TMP296;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP308;
   $$TMP308=(function(self){
      var $$TMP309;
      $$TMP309=(function(__GS15,__GS16,lst){
         var $$TMP310;
         $$TMP310=(function(recur){
            var $$TMP311;
            recur=(function(){
               var $$TMP312;
               var $$TMP313;
               var $$TMP314;
               var $$TMP315;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP316;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP316=true;
}
else{
   $$TMP316=false;
}
$$TMP315=$$TMP316;
}
else{
   $$TMP315=false;
}
if($$TMP315){
   $$TMP314=true;
}
else{
   $$TMP314=false;
}
if($$TMP314){
   $$TMP313=(function(){
      var $$TMP317;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP318;
   var $$TMP319;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP319=(function(){
      var $$TMP320;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP320=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
return $$TMP320;
}
)();
}
else{
   var $$TMP321;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP321=(function(){
      var $$TMP322;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP322=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
return $$TMP322;
}
)();
}
else{
   var $$TMP323;
   if(true){
$$TMP323=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP323=undefined;
}
$$TMP321=$$TMP323;
}
$$TMP319=$$TMP321;
}
$$TMP318=$$TMP319;
return $$TMP318;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP317=recur();
return $$TMP317;
}
)();
}
else{
   $$TMP313=(function(){
      var $$TMP324;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP325;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP325=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP325=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP325;
$$TMP324=__GS15;
return $$TMP324;
}
)();
}
$$TMP312=$$TMP313;
return $$TMP312;
}
);
recur;
$$TMP311=recur();
return $$TMP311;
}
)([]);
return $$TMP310;
}
)(undefined,[],undefined);
return $$TMP309;
}
)(this);
return $$TMP308;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP326;
   $$TMP326=(function(self){
      var $$TMP327;
      var $$TMP328;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP328=(function(){
      var $$TMP329;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP329=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
return $$TMP329;
}
)();
}
else{
$$TMP328=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP327=$$TMP328;
return $$TMP327;
}
)(this);
return $$TMP326;
}
));
$$root["parse"]=(function(toks){
   var $$TMP330;
   $$TMP330=(function(p){
      var $$TMP331;
      $$TMP331=(function(__GS18,__GS19){
         var $$TMP332;
         $$TMP332=(function(recur){
            var $$TMP333;
            recur=(function(){
               var $$TMP334;
               var $$TMP335;
               var $$TMP336;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP336=true;
}
else{
   $$TMP336=false;
}
if($$TMP336){
   $$TMP335=(function(){
      var $$TMP337;
__GS19=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS19);
__GS18=__GS19;
__GS18;
$$TMP337=recur();
return $$TMP337;
}
)();
}
else{
   $$TMP335=(function(){
      var $$TMP338;
__GS18=$$root["reverse"](__GS19);
$$TMP338=__GS18;
return $$TMP338;
}
)();
}
$$TMP334=$$TMP335;
return $$TMP334;
}
);
recur;
$$TMP333=recur();
return $$TMP333;
}
)([]);
return $$TMP332;
}
)(undefined,[]);
return $$TMP331;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP330;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP339;
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
$$TMP339=__GS20;
return $$TMP339;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP340;
$$TMP340=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP340;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP341;$$TMP341=$$root["geti"]($$root["mangling-table"],x);return $$TMP341;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP342;$$TMP342=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);return $$TMP342;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){var $$TMP343;$$TMP343=(function(self){var $$TMP344;$$TMP344=(function(__GS21){var $$TMP345;$$root["seti!"](__GS21,"root",root);$$root["seti!"](__GS21,"next-var-suffix",0);$$TMP345=__GS21;return $$TMP345;})(self);return $$TMP344;})(this);return $$TMP343;}));$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP346;$$TMP346=(function(self){var $$TMP347;$$TMP347=(function(out){var $$TMP348;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP348=out;return $$TMP348;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP347;})(this);return $$TMP346;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP349;var $$TMP350;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP350=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP350=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP349=$$TMP350;
return $$TMP349;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP351;
   $$TMP351=(function(self){
      var $$TMP352;
      var $$TMP353;
if($$root["="](x,true)){
$$TMP353=$$root["list"]("true","");
}
else{
   var $$TMP354;
if($$root["="](x,false)){
$$TMP354=$$root["list"]("false","");
}
else{
   var $$TMP355;
if($$root["null?"](x)){
$$TMP355=$$root["list"]("[]","");
}
else{
   var $$TMP356;
if($$root["="](x,undefined)){
$$TMP356=$$root["list"]("undefined","");
}
else{
   var $$TMP357;
if($$root["symbol?"](x)){
$$TMP357=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP358;
if($$root["string?"](x)){
$$TMP358=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP359;
   if(true){
$$TMP359=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP359=undefined;
}
$$TMP358=$$TMP359;
}
$$TMP357=$$TMP358;
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
return $$TMP352;
}
)(this);
return $$TMP351;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP360;
   $$TMP360=(function(self){
      var $$TMP361;
      $$TMP361=(function(__GS22){
         var $$TMP362;
         $$TMP362=(function(fun,args){
            var $$TMP363;
            $$TMP363=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP364;
$$TMP364=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP364;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP363;
}
)($$root["nth"](0,__GS22),$$root["drop"](1,__GS22));
return $$TMP362;
}
)(lst);
return $$TMP361;
}
)(this);
return $$TMP360;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-method-call")),(function(lexenv,lst){
   var $$TMP365;
   $$TMP365=(function(self){
      var $$TMP366;
      $$TMP366=(function(__GS23){
         var $$TMP367;
         $$TMP367=(function(method,obj,args){
            var $$TMP368;
            $$TMP368=(function(compiled__MINUSobj,compiled__MINUSargs){
               var $$TMP369;
$$TMP369=$$root["list"]($$root["format"]("(%0)%1(%2)",$$root["first"](compiled__MINUSobj),method,$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSobj),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP369;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,obj),$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args));
return $$TMP368;
}
)($$root["nth"](0,__GS23),$$root["nth"](1,__GS23),$$root["drop"](2,__GS23));
return $$TMP367;
}
)(lst);
return $$TMP366;
}
)(this);
return $$TMP365;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP370;
   $$TMP370=(function(self){
      var $$TMP371;
      $$TMP371=(function(compiled__MINUSbody,reducer){
         var $$TMP373;
$$TMP373=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP373;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP372;
$$TMP372=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP372;
}
));
return $$TMP371;
}
)(this);
return $$TMP370;
}
));
$$root["process-args"]=(function(args){
   var $$TMP374;
$$TMP374=$$root["join"](",",$$root["reverse"]($$root["reduce"]((function(accum,v){
   var $$TMP375;
   var $$TMP376;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP376=$$root["str"]("...",$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)));
}
else{
$$TMP376=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
}
$$TMP375=$$root["cons"]($$TMP376,accum);
return $$TMP375;
}
),args,[])));
return $$TMP374;
}
);
$$root["process-args"];
$$root["lexical-name"]=(function(sym){
   var $$TMP377;
   var $$TMP378;
if($$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&")){
$$TMP378=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP378=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP377=$$TMP378;
return $$TMP377;
}
);
$$root["lexical-name"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP379;
   $$TMP379=(function(self){
      var $$TMP380;
      $$TMP380=(function(__GS24){
         var $$TMP381;
         $$TMP381=(function(__GS25){
            var $$TMP382;
            $$TMP382=(function(args,body){
               var $$TMP383;
               $$TMP383=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP385;
                  $$TMP385=(function(compiled__MINUSbody){
                     var $$TMP386;
$$TMP386=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{","var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP386;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP385;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP384;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP384=accum;
return $$TMP384;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP383;
}
)($$root["drop"](0,__GS25),$$root["drop"](2,__GS24));
return $$TMP382;
}
)($$root["nth"](1,__GS24));
return $$TMP381;
}
)(lst);
return $$TMP380;
}
)(this);
return $$TMP379;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP387;
   $$TMP387=(function(self){
      var $$TMP388;
      $$TMP388=(function(__GS26){
         var $$TMP389;
         $$TMP389=(function(c,t,f){
            var $$TMP390;
            $$TMP390=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP391;
$$TMP391=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP391;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP390;
}
)($$root["nth"](1,__GS26),$$root["nth"](2,__GS26),$$root["nth"](3,__GS26));
return $$TMP389;
}
)(lst);
return $$TMP388;
}
)(this);
return $$TMP387;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP392;
   $$TMP392=(function(self){
      var $$TMP393;
      var $$TMP394;
if($$root["symbol?"](x)){
$$TMP394=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
$$TMP394=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP393=$$TMP394;
return $$TMP393;
}
)(this);
return $$TMP392;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP395;
   $$TMP395=(function(self){
      var $$TMP396;
$$TMP396=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP396;
}
)(this);
return $$TMP395;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP397;
   $$TMP397=(function(self){
      var $$TMP398;
      var $$TMP399;
if($$root["atom?"](x)){
$$TMP399=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP399=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP398=$$TMP399;
return $$TMP398;
}
)(this);
return $$TMP397;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP400;
   $$TMP400=(function(self){
      var $$TMP401;
      $$TMP401=(function(__GS27){
         var $$TMP402;
         $$TMP402=(function(name,value){
            var $$TMP403;
            $$TMP403=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP404;
$$TMP404=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP404;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP403;
}
)($$root["nth"](1,__GS27),$$root["nth"](2,__GS27));
return $$TMP402;
}
)(lst);
return $$TMP401;
}
)(this);
return $$TMP400;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP405;
   $$TMP405=(function(self){
      var $$TMP406;
      $$TMP406=(function(__GS28){
         var $$TMP407;
         $$TMP407=(function(name,args){
            var $$TMP408;
            $$TMP408=(function(tmp){
               var $$TMP410;
$$TMP410=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP410;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP409;
$$TMP409=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP409;
}
),args))));
return $$TMP408;
}
)($$root["nth"](0,__GS28),$$root["drop"](1,__GS28));
return $$TMP407;
}
)(expr);
return $$TMP406;
}
)(this);
return $$TMP405;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP411;
   $$TMP411=(function(self){
      var $$TMP412;
      var $$TMP413;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP414;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP414=true;
}
else{
   $$TMP414=false;
}
$$TMP413=$$TMP414;
}
else{
   $$TMP413=false;
}
$$TMP412=$$TMP413;
return $$TMP412;
}
)(this);
return $$TMP411;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP415;
   $$TMP415=(function(self){
      var $$TMP416;
      var $$TMP417;
      var $$TMP418;
if($$root["list?"](expr)){
   var $$TMP419;
if($$root["not"]($$root["null?"](expr))){
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
   $$TMP417=(function(first){
      var $$TMP420;
      var $$TMP421;
if($$root["symbol?"](first)){
   $$TMP421=(function(__GS29){
      var $$TMP422;
      var $$TMP423;
if($$root["equal?"](__GS29,(new $$root.Symbol("lambda")))){
$$TMP423=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP424;
if($$root["equal?"](__GS29,(new $$root.Symbol("if")))){
$$TMP424=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP425;
if($$root["equal?"](__GS29,(new $$root.Symbol("quote")))){
$$TMP425=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP426;
if($$root["equal?"](__GS29,(new $$root.Symbol("setv!")))){
$$TMP426=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP427;
if($$root["equal?"](__GS29,(new $$root.Symbol("def")))){
$$TMP427=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP428;
   if(true){
      var $$TMP429;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP429=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
   var $$TMP430;
if($$root["="]($$root["geti"]($$root["geti"](first,(new $$root.Symbol("name"))),0),".")){
$$TMP430=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-method-call")),lexenv,expr);
}
else{
   var $$TMP431;
   if(true){
$$TMP431=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
else{
   $$TMP431=undefined;
}
$$TMP430=$$TMP431;
}
$$TMP429=$$TMP430;
}
$$TMP428=$$TMP429;
}
else{
   $$TMP428=undefined;
}
$$TMP427=$$TMP428;
}
$$TMP426=$$TMP427;
}
$$TMP425=$$TMP426;
}
$$TMP424=$$TMP425;
}
$$TMP423=$$TMP424;
}
$$TMP422=$$TMP423;
return $$TMP422;
}
)(first);
}
else{
$$TMP421=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP420=$$TMP421;
return $$TMP420;
}
)($$root["car"](expr));
}
else{
$$TMP417=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP416=$$TMP417;
return $$TMP416;
}
)(this);
return $$TMP415;
}
));
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["default-lexenv"]=(function(){
   var $$TMP432;
   $$TMP432=(function(__GS30){
      var $$TMP433;
$$root["seti!"](__GS30,"this",true);
$$TMP433=__GS30;
return $$TMP433;
}
)($$root["object"]());
return $$TMP432;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP434;
   $$TMP434=(function(self){
      var $$TMP435;
      $$TMP435=(function(root,sandbox){
         var $$TMP436;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP437;
$$TMP437=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP437;
}
));
$$TMP436=(function(__GS31){
   var $$TMP438;
$$root["seti!"](__GS31,"root",root);
$$root["seti!"](__GS31,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP438=__GS31;
return $$TMP438;
}
)(self);
return $$TMP436;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP435;
}
)(this);
return $$TMP434;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP439;
   $$TMP439=(function(self){
      var $$TMP440;
      $$TMP440=(function(tmp){
         var $$TMP441;
$$TMP441=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP441;
}
)($$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP440;
}
)(this);
return $$TMP439;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP442;
   $$TMP442=(function(self){
      var $$TMP443;
      $$TMP443=(function(forms){
         var $$TMP444;
         $$TMP444=(function(__GS32,__GS33,form){
            var $$TMP445;
            $$TMP445=(function(recur){
               var $$TMP446;
               recur=(function(){
                  var $$TMP447;
                  var $$TMP448;
                  var $$TMP449;
if($$root["not"]($$root["null?"](__GS33))){
   $$TMP449=true;
}
else{
   $$TMP449=false;
}
if($$TMP449){
   $$TMP448=(function(){
      var $$TMP450;
form=$$root["car"](__GS33);
form;
__GS32=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS32;
__GS33=$$root["cdr"](__GS33);
__GS33;
$$TMP450=recur();
return $$TMP450;
}
)();
}
else{
   $$TMP448=(function(){
      var $$TMP451;
      $$TMP451=__GS32;
      return $$TMP451;
   }
   )();
}
$$TMP447=$$TMP448;
return $$TMP447;
}
);
recur;
$$TMP446=recur();
return $$TMP446;
}
)([]);
return $$TMP445;
}
)(undefined,forms,[]);
return $$TMP444;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP443;
}
)(this);
return $$TMP442;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP452;
   $$TMP452=(function(self){
      var $$TMP453;
$$TMP453=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["str"]($$root["second"](compilation__MINUSresult),$$root["first"](compilation__MINUSresult)));
return $$TMP453;
}
)(this);
return $$TMP452;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP454;
   $$TMP454=(function(self){
      var $$TMP455;
      $$TMP455=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP456;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP457;
   $$TMP457=(function(r){
      var $$TMP458;
      var $$TMP459;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   $$TMP459=(function(){
      var $$TMP460;
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti"](r,(new $$root.Symbol("code"))));
r;
$$TMP460=$$root["seti!"](target,name,r);
return $$TMP460;
}
)();
}
else{
   $$TMP459=undefined;
}
$$TMP459;
$$TMP458=r;
return $$TMP458;
}
)($$root["geti"](target,name));
return $$TMP457;
}
));
$$root["seti!"](sandbox,"$$root",$$root["Proxy"](root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP461;
$$TMP461=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP461;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP462;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP462=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP462;
}
));
$$TMP456=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP456;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP455;
}
)(this);
return $$TMP454;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP463;
   $$TMP463=(function(self){
      var $$TMP464;
      $$TMP464=(function(lexenv){
         var $$TMP465;
         $$TMP465=(function(__GS34){
            var $$TMP466;
            var $$TMP467;
if($$root["matches?"](__GS34,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("def")),[])),$$root.cons((new $$root.Symbol("name")),$$root.cons((new $$root.Symbol("val")),[]))))){
   $$TMP467=(function(__GS35){
      var $$TMP468;
      $$TMP468=(function(name,val){
         var $$TMP469;
         $$TMP469=(function(tmp){
            var $$TMP470;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP470=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP470;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP469;
}
)($$root["nth"](1,__GS35),$$root["nth"](2,__GS35));
return $$TMP468;
}
)(__GS34);
}
else{
   var $$TMP471;
if($$root["matches?"](__GS34,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("setmac!")),[])),$$root.cons((new $$root.Symbol("name")),[])))){
   $$TMP471=(function(__GS36){
      var $$TMP472;
      $$TMP472=(function(name){
         var $$TMP473;
         $$TMP473=(function(tmp){
            var $$TMP474;
$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
$$TMP474=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP474;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP473;
}
)($$root["nth"](1,__GS36));
return $$TMP472;
}
)(__GS34);
}
else{
   var $$TMP475;
if($$root["matches?"](__GS34,$$root.cons($$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("lambda")),[])),$$root.cons($$root.cons((new $$root.Symbol("&args")),[]),$$root.cons((new $$root.Symbol("&body")),[]))),[]))){
   $$TMP475=(function(__GS37){
      var $$TMP476;
      $$TMP476=(function(__GS38){
         var $$TMP477;
         $$TMP477=(function(__GS39){
            var $$TMP478;
            $$TMP478=(function(args,body){
               var $$TMP479;
$$TMP479=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP479;
}
)($$root["drop"](0,__GS39),$$root["drop"](2,__GS38));
return $$TMP478;
}
)($$root["nth"](1,__GS38));
return $$TMP477;
}
)($$root["nth"](0,__GS37));
return $$TMP476;
}
)(__GS34);
}
else{
   var $$TMP480;
if($$root["matches?"](__GS34,$$root.cons((new $$root.Symbol("name")),$$root.cons((new $$root.Symbol("&args")),[])))){
   $$TMP480=(function(__GS40){
      var $$TMP481;
      $$TMP481=(function(name,args){
         var $$TMP482;
         var $$TMP483;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP483=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP483=(function(tmp){
      var $$TMP484;
$$TMP484=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP484;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP482=$$TMP483;
return $$TMP482;
}
)($$root["nth"](0,__GS40),$$root["drop"](1,__GS40));
return $$TMP481;
}
)(__GS34);
}
else{
   var $$TMP485;
if($$root["matches?"](__GS34,(new $$root.Symbol("any")))){
   $$TMP485=(function(any){
      var $$TMP486;
      $$TMP486=(function(tmp){
         var $$TMP487;
$$TMP487=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP487;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP486;
}
)(__GS34);
}
else{
   var $$TMP488;
   if(true){
$$TMP488=$$root["error"]("Fell out of case!");
}
else{
   $$TMP488=undefined;
}
$$TMP485=$$TMP488;
}
$$TMP480=$$TMP485;
}
$$TMP475=$$TMP480;
}
$$TMP471=$$TMP475;
}
$$TMP467=$$TMP471;
}
$$TMP466=$$TMP467;
return $$TMP466;
}
)(e);
return $$TMP465;
}
)($$root["default-lexenv"]());
return $$TMP464;
}
)(this);
return $$TMP463;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP489;
   $$TMP489=(function(self){
      var $$TMP490;
$$TMP490=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP490;
}
)(this);
return $$TMP489;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
