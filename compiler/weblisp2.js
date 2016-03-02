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
};

$$root["*ns*"] = $$root;
$$root.__proto__ = Function('return this')();

// *
// * 
// *

$$root["VM"]=$$root["require"]("vm");
$$root["VM"];
$$root["defmacro"]=(function(name,args,...body){
   var $$TMP0;
$$TMP0=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setmac!"))),$$root["list"](name))))));
return $$TMP0;
}
);
$$root["defmacro"];
$$root["setmac!"]($$root["defmacro"]);
$$root["method"]=(function(args,...body){
   var $$TMP1;
$$TMP1=$$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))));
return $$TMP1;
}
);
$$root["method"];
$$root["setmac!"]($$root["method"]);
$$root["defmethod"]=(function(name,obj,args,...body){
   var $$TMP2;
$$TMP2=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](name))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["cdr"](args)),$$root["list"]($$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]($$root["car"](args)))),body)),$$root["list"]((new $$root.Symbol("this"))))))));
return $$TMP2;
}
);
$$root["defmethod"];
$$root["setmac!"]($$root["defmethod"]);
$$root["defun"]=(function(name,args,...body){
   var $$TMP3;
$$TMP3=$$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"](args),body)));
return $$TMP3;
}
);
$$root["defun"];
$$root["setmac!"]($$root["defun"]);
$$root["progn"]=(function(...body){
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
$$root["when"]=(function(c,...body){
   var $$TMP6;
$$TMP6=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)),$$root["list"](undefined));
return $$TMP6;
}
);
$$root["when"];
$$root["setmac!"]($$root["when"]);
$$root["cond"]=(function(...pairs){
   var $$TMP7;
   var $$TMP8;
if($$root["null?"](pairs)){
   $$TMP8=undefined;
}
else{
$$TMP8=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](pairs)),$$root["list"]($$root["car"]($$root["cdr"](pairs))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["cdr"]($$root["cdr"](pairs)))));
}
$$TMP7=$$TMP8;
return $$TMP7;
}
);
$$root["cond"];
$$root["setmac!"]($$root["cond"]);
$$root["and"]=(function(...args){
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
$$root["or"]=(function(...args){
   var $$TMP11;
   var $$TMP12;
if($$root["null?"](args)){
   $$TMP12=false;
}
else{
   var $$TMP13;
if($$root["null?"]($$root["cdr"](args))){
$$TMP13=$$root["car"](args);
}
else{
$$TMP13=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP12=$$TMP13;
}
$$TMP11=$$TMP12;
return $$TMP11;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["macroexpand-1"]=(function(expr){
   var $$TMP14;
   var $$TMP15;
   var $$TMP16;
if($$root["list?"](expr)){
   var $$TMP17;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
   $$TMP17=true;
}
else{
   $$TMP17=false;
}
$$TMP16=$$TMP17;
}
else{
   $$TMP16=false;
}
if($$TMP16){
$$TMP15=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
}
else{
   $$TMP15=expr;
}
$$TMP14=$$TMP15;
return $$TMP14;
}
);
$$root["macroexpand-1"];
$$root["inc"]=(function(x){
   var $$TMP18;
$$TMP18=$$root["+"](x,1);
return $$TMP18;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP19;
$$TMP19=$$root["-"](x,1);
return $$TMP19;
}
);
$$root["dec"];
$$root["incv!"]=(function(name,amt){
   var $$TMP20;
   amt=(function(c){
      var $$TMP21;
      var $$TMP22;
      if(c){
         $$TMP22=c;
      }
      else{
         $$TMP22=1;
      }
      $$TMP21=$$TMP22;
      return $$TMP21;
   }
   )(amt);
   amt;
$$TMP20=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP20;
}
);
$$root["incv!"];
$$root["setmac!"]($$root["incv!"]);
$$root["decv!"]=(function(name,amt){
   var $$TMP23;
   amt=(function(c){
      var $$TMP24;
      var $$TMP25;
      if(c){
         $$TMP25=c;
      }
      else{
         $$TMP25=1;
      }
      $$TMP24=$$TMP25;
      return $$TMP24;
   }
   )(amt);
   amt;
$$TMP23=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP23;
}
);
$$root["decv!"];
$$root["setmac!"]($$root["decv!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP26;
$$TMP26=$$root["car"]($$root["cdr"](lst));
return $$TMP26;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP27;
$$TMP27=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP27;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP28;
$$TMP28=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP28;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP29;
$$TMP29=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP29;
}
);
$$root["fifth"];
$$root["rest"]=$$root["cdr"];
$$root["rest"];
$$root["getter"]=(function(field){
   var $$TMP30;
   $$TMP30=(function(obj){
      var $$TMP31;
$$TMP31=$$root["geti"](obj,field);
return $$TMP31;
}
);
return $$TMP30;
}
);
$$root["getter"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP32;
   var $$TMP33;
if($$root["null?"](lst)){
   $$TMP33=accum;
}
else{
$$TMP33=$$root["reduce"](r,$$root["cdr"](lst),r(accum,$$root["car"](lst)));
}
$$TMP32=$$TMP33;
return $$TMP32;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP34;
$$TMP34=$$root["reduce"]((function(accum,v){
   var $$TMP35;
$$TMP35=$$root["cons"](v,accum);
return $$TMP35;
}
),lst,[]);
return $$TMP34;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP36;
$$TMP36=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP36;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP37;
$$TMP37=$$root["transform-list"]((function(accum,v){
   var $$TMP38;
$$TMP38=$$root["cons"](f(v),accum);
return $$TMP38;
}
),lst);
return $$TMP37;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP39;
$$TMP39=$$root["transform-list"]((function(accum,v){
   var $$TMP40;
   var $$TMP41;
   if(p(v)){
$$TMP41=$$root["cons"](v,accum);
}
else{
   $$TMP41=accum;
}
$$TMP40=$$TMP41;
return $$TMP40;
}
),lst);
return $$TMP39;
}
);
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP42;
$$TMP42=$$root["transform-list"]((function(accum,v){
   var $$TMP43;
n=$$root["-"](n,1);
n;
var $$TMP44;
if($$root[">="](n,0)){
$$TMP44=$$root["cons"](v,accum);
}
else{
   $$TMP44=accum;
}
$$TMP43=$$TMP44;
return $$TMP43;
}
),lst);
return $$TMP42;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP45;
$$TMP45=$$root["transform-list"]((function(accum,v){
   var $$TMP46;
n=$$root["-"](n,1);
n;
var $$TMP47;
if($$root[">="](n,0)){
   $$TMP47=accum;
}
else{
$$TMP47=$$root["cons"](v,accum);
}
$$TMP46=$$TMP47;
return $$TMP46;
}
),lst);
return $$TMP45;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP48;
   $$TMP48=(function(counter){
      var $$TMP49;
$$TMP49=$$root["transform-list"]((function(accum,v){
   var $$TMP50;
   var $$TMP51;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
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
)(-1);
return $$TMP48;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP52;
   var $$TMP53;
if($$root["="](n,0)){
$$TMP53=$$root["car"](lst);
}
else{
$$TMP53=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP52=$$TMP53;
return $$TMP52;
}
);
$$root["nth"];
$$root["butlast"]=(function(n,lst){
   var $$TMP54;
$$TMP54=$$root["take"]($$root["-"]($$root["count"](lst),n),lst);
return $$TMP54;
}
);
$$root["butlast"];
$$root["last"]=(function(lst){
   var $$TMP55;
$$TMP55=$$root["reduce"]((function(accum,v){
   var $$TMP56;
   $$TMP56=v;
   return $$TMP56;
}
),lst,undefined);
return $$TMP55;
}
);
$$root["last"];
$$root["count"]=(function(lst){
   var $$TMP57;
$$TMP57=$$root["reduce"]((function(accum,v){
   var $$TMP58;
$$TMP58=$$root["inc"](accum);
return $$TMP58;
}
),lst,0);
return $$TMP57;
}
);
$$root["count"];
$$root["zip"]=(function(a,...more){
   var $$TMP59;
   $$TMP59=(function(args){
      var $$TMP60;
      var $$TMP61;
if($$root["reduce"]((function(accum,v){
   var $$TMP62;
   $$TMP62=(function(c){
      var $$TMP63;
      var $$TMP64;
      if(c){
         $$TMP64=c;
      }
      else{
$$TMP64=$$root["null?"](v);
}
$$TMP63=$$TMP64;
return $$TMP63;
}
)(accum);
return $$TMP62;
}
),args,false)){
   $$TMP61=[];
}
else{
$$TMP61=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP60=$$TMP61;
return $$TMP60;
}
)($$root["cons"](a,more));
return $$TMP59;
}
);
$$root["zip"];
$$root["let"]=(function(bindings,...body){
   var $$TMP65;
$$TMP65=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP65;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["interpose"]=(function(x,lst){
   var $$TMP66;
   $$TMP66=(function(fst){
      var $$TMP67;
$$TMP67=$$root["transform-list"]((function(accum,v){
   var $$TMP68;
   var $$TMP69;
   if(fst){
      $$TMP69=(function(){
         var $$TMP70;
         fst=false;
         fst;
$$TMP70=$$root["cons"](v,accum);
return $$TMP70;
}
)();
}
else{
$$TMP69=$$root["cons"](v,$$root["cons"](x,accum));
}
$$TMP68=$$TMP69;
return $$TMP68;
}
),lst);
return $$TMP67;
}
)(true);
return $$TMP66;
}
);
$$root["interpose"];
$$root["join"]=(function(sep,lst){
   var $$TMP71;
$$TMP71=$$root["reduce"]($$root["str"],$$root["interpose"](sep,lst),"");
return $$TMP71;
}
);
$$root["join"];
$$root["find"]=(function(f,arg,lst){
   var $$TMP72;
   $$TMP72=(function(idx){
      var $$TMP73;
$$TMP73=$$root["reduce"]((function(accum,v){
   var $$TMP74;
idx=$$root["+"](idx,1);
idx;
var $$TMP75;
if(f(arg,v)){
   $$TMP75=idx;
}
else{
   $$TMP75=accum;
}
$$TMP74=$$TMP75;
return $$TMP74;
}
),lst,-1);
return $$TMP73;
}
)(-1);
return $$TMP72;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP76;
   var $$TMP77;
if($$root["atom?"](x)){
$$TMP77=$$root["list"](x);
}
else{
$$TMP77=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP76=$$TMP77;
return $$TMP76;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP78;
   $$TMP78=(function(idx){
      var $$TMP79;
$$TMP79=$$root["transform-list"]((function(accum,v){
   var $$TMP80;
idx=$$root["+"](idx,1);
$$TMP80=$$root["cons"](f(v,idx),accum);
return $$TMP80;
}
),lst);
return $$TMP79;
}
)(-1);
return $$TMP78;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP81;
$$TMP81=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP81;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP82;
   var $$TMP83;
if($$root["null?"](lst)){
   $$TMP83=[];
}
else{
$$TMP83=$$root["reverse"]((function(recur){
   var $$TMP84;
   recur=(function(accum,part,rem,counter){
      var $$TMP85;
      var $$TMP86;
if($$root["null?"](rem)){
$$TMP86=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP87;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP87=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP87=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP86=$$TMP87;
}
$$TMP85=$$TMP86;
return $$TMP85;
}
);
recur;
$$TMP84=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP84;
}
)([]));
}
$$TMP82=$$TMP83;
return $$TMP82;
}
);
$$root["partition"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP88;
   var $$TMP89;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP89=obj__MINUSname;
}
else{
$$TMP89=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP88=$$TMP89;
return $$TMP88;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP90;
   $$TMP90=(function(rev__MINUSfields){
      var $$TMP91;
      var $$TMP92;
if($$root["list?"]($$root["car"](rev__MINUSfields))){
$$TMP92=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
}
else{
$$TMP92=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
}
$$TMP91=$$TMP92;
return $$TMP91;
}
)($$root["reverse"](fields));
return $$TMP90;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["equal?"]=(function(a,b){
   var $$TMP93;
   var $$TMP94;
if($$root["null?"](a)){
$$TMP94=$$root["null?"](b);
}
else{
   var $$TMP95;
if($$root["symbol?"](a)){
   var $$TMP96;
if($$root["symbol?"](b)){
   var $$TMP97;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP97=true;
}
else{
   $$TMP97=false;
}
$$TMP96=$$TMP97;
}
else{
   $$TMP96=false;
}
$$TMP95=$$TMP96;
}
else{
   var $$TMP98;
if($$root["atom?"](a)){
$$TMP98=$$root["="](a,b);
}
else{
   var $$TMP99;
if($$root["list?"](a)){
   var $$TMP100;
if($$root["list?"](b)){
   var $$TMP101;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP102;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP102=true;
}
else{
   $$TMP102=false;
}
$$TMP101=$$TMP102;
}
else{
   $$TMP101=false;
}
$$TMP100=$$TMP101;
}
else{
   $$TMP100=false;
}
$$TMP99=$$TMP100;
}
else{
   $$TMP99=undefined;
}
$$TMP98=$$TMP99;
}
$$TMP95=$$TMP98;
}
$$TMP94=$$TMP95;
}
$$TMP93=$$TMP94;
return $$TMP93;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP103;
   $$TMP103=(function(res){
      var $$TMP109;
$$TMP109=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP109;
}
)((function(recur){
   var $$TMP104;
   recur=(function(l1,l2){
      var $$TMP105;
      var $$TMP106;
      if((function(c){
         var $$TMP107;
         var $$TMP108;
         if(c){
            $$TMP108=c;
         }
         else{
$$TMP108=p($$root["car"](l2));
}
$$TMP107=$$TMP108;
return $$TMP107;
}
)($$root["null?"](l2))){
$$TMP106=$$root["list"](l1,l2);
}
else{
$$TMP106=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP105=$$TMP106;
return $$TMP105;
}
);
recur;
$$TMP104=recur([],lst);
return $$TMP104;
}
)([]));
return $$TMP103;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP110;
   var $$TMP111;
if($$root["reduce"]((function(accum,v){
   var $$TMP112;
   var $$TMP113;
   if(accum){
      $$TMP113=accum;
   }
   else{
      $$TMP113=v;
   }
   $$TMP112=$$TMP113;
   return $$TMP112;
}
),lst,false)){
   $$TMP111=true;
}
else{
   $$TMP111=false;
}
$$TMP110=$$TMP111;
return $$TMP110;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP114;
$$TMP114=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP115;
   var $$TMP116;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP117;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP117=true;
}
else{
   $$TMP117=false;
}
$$TMP116=$$TMP117;
}
else{
   $$TMP116=false;
}
$$TMP115=$$TMP116;
return $$TMP115;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP114;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP118;
   $$TMP118=(function(binding__MINUSnames){
      var $$TMP119;
      $$TMP119=(function(divs){
         var $$TMP121;
         var $$TMP122;
if($$root["null?"]($$root["second"](divs))){
$$TMP122=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP122=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP121=$$TMP122;
return $$TMP121;
}
)($$root["split"]((function(pair){
   var $$TMP120;
$$TMP120=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP120;
}
),binding__MINUSpairs));
return $$TMP119;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP118;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP123;
$$TMP123=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP123;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP124;
   $$TMP124=(function(x){
      var $$TMP125;
$$TMP125=$$root["not"](f(x));
return $$TMP125;
}
);
return $$TMP124;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP126;
   $$TMP126=(function(...args){
      var $$TMP127;
$$TMP127=f1($$root["apply"](f2,args));
return $$TMP127;
}
);
return $$TMP126;
}
);
$$root["compose"];
$$root["partial"]=(function(f,...args1){
   var $$TMP128;
   $$TMP128=(function(...args2){
      var $$TMP129;
$$TMP129=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP129;
}
);
return $$TMP128;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield,...args1){
   var $$TMP130;
   $$TMP130=(function(...args2){
      var $$TMP131;
$$TMP131=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP131;
}
);
return $$TMP130;
}
);
$$root["partial-method"];
$$root["format"]=(function(...args){
   var $$TMP132;
   $$TMP132=(function(rx){
      var $$TMP133;
      $$TMP133=(function(target){
         var $$TMP134;
$$TMP134=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,rx,(function(match){
   var $$TMP135;
$$TMP135=$$root["nth"]($$root["parseInt"]((function(target){
   var $$TMP136;
$$TMP136=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substring"))),target,1);
return $$TMP136;
}
)(match)),$$root["cdr"](args));
return $$TMP135;
}
));
return $$TMP134;
}
)($$root["car"](args));
return $$TMP133;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP132;
}
);
$$root["format"];
$$root["case"]=(function(e,...pairs){
   var $$TMP137;
   $$TMP137=(function(e__MINUSname,def__MINUSidx){
      var $$TMP138;
      var $$TMP139;
if($$root["="](def__MINUSidx,-1)){
$$TMP139=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
}
else{
$$TMP139=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP138=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP140;
$$TMP140=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP141;
$$TMP141=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP141;
}
),$$root["filter"]((function(pair){
   var $$TMP142;
$$TMP142=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP142;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP140;
}
)($$TMP139,$$root["partition"](2,pairs));
return $$TMP138;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP137;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP143;
   $$TMP143=(function(expr__MINUSname){
      var $$TMP144;
$$TMP144=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP145;
   var $$TMP146;
if($$root["symbol?"](v)){
   var $$TMP147;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP147=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
   var $$TMP148;
$$TMP148=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP148;
}
)($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP149;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP149=[];
}
else{
$$TMP149=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP147=$$TMP149;
}
$$TMP146=$$TMP147;
}
else{
$$TMP146=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP145=$$TMP146;
return $$TMP145;
}
),structure)));
return $$TMP144;
}
)($$root["gensym"]());
return $$TMP143;
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
   $$TMP203=(function(target){
      var $$TMP204;
$$TMP204=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("sort"))),target,cmp);
return $$TMP204;
}
)(lst);
return $$TMP203;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP205;
   step=(function(c){
      var $$TMP206;
      var $$TMP207;
      if(c){
         $$TMP207=c;
      }
      else{
         $$TMP207=1;
      }
      $$TMP206=$$TMP207;
      return $$TMP206;
   }
   )(step);
   step;
   $$TMP205=(function(data){
      var $$TMP208;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP208=data;
return $$TMP208;
}
)($$root["object"]([]));
return $$TMP205;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP209;
   $$TMP209=(function(len__MINUSname,data){
      var $$TMP210;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP210=data;
return $$TMP210;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP209;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP211;
   $$TMP211=(function(lst__MINUSname,data){
      var $$TMP212;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP212=data;
return $$TMP212;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP211;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP213;
   $$TMP213=(function(__GS4){
      var $$TMP214;
      $$TMP214=(function(binding__MINUSname,__GS5){
         var $$TMP215;
         $$TMP215=(function(func__MINUSname,args){
            var $$TMP216;
$$TMP216=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP216;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP215;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP214;
}
)(form);
return $$TMP213;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP217;
   $$TMP217=(function(data){
      var $$TMP218;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP218=data;
return $$TMP218;
}
)($$root["object"]([]));
return $$TMP217;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP219;
   $$TMP219=(function(data){
      var $$TMP220;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP220=data;
return $$TMP220;
}
)($$root["object"]([]));
return $$TMP219;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP221;
   $$TMP221=(function(data){
      var $$TMP222;
      (function(__GS6){
         var $$TMP223;
         $$TMP223=(function(binding__MINUSname,body){
            var $$TMP224;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP224=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP224;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP223;
}
)(form);
$$TMP222=data;
return $$TMP222;
}
)($$root["object"]([]));
return $$TMP221;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP225;
   $$TMP225=(function(data){
      var $$TMP226;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP226=data;
return $$TMP226;
}
)($$root["object"]([]));
return $$TMP225;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP227;
   $$TMP227=(function(data,accum__MINUSname){
      var $$TMP228;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP228=data;
return $$TMP228;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP227;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP229;
$$TMP229=$$root["filter"]((function(x){
   var $$TMP230;
$$TMP230=$$root["not="](x,undefined);
return $$TMP230;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP229;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP231;
   $$TMP231=(function(res__MINUSname){
      var $$TMP232;
      $$TMP232=(function(all){
         var $$TMP242;
         $$TMP242=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP244;
            var $$TMP245;
if($$root["null?"](final__MINUSactions)){
$$TMP245=$$root["list"](res__MINUSname);
}
else{
   $$TMP245=final__MINUSactions;
}
$$TMP244=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP245)))))));
return $$TMP244;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP243;
$$TMP243=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP243;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP242;
}
)($$root["map"]((function(form){
   var $$TMP233;
   $$TMP233=(function(__GS7){
      var $$TMP234;
      var $$TMP235;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP235=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP236;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP236=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP237;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP237=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP238;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP238=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP239;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP239=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP240;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP240=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP241;
   if(true){
$$TMP241=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP241=undefined;
}
$$TMP240=$$TMP241;
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
return $$TMP234;
}
)($$root["car"](form));
return $$TMP233;
}
),forms));
return $$TMP232;
}
)($$root["gensym"]());
return $$TMP231;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["make-token"]=(function(src,type,start,len){
   var $$TMP246;
   $$TMP246=(function(o){
      var $$TMP247;
$$root["seti!"](o,(new $$root.Symbol("src")),src);
$$root["seti!"](o,(new $$root.Symbol("type")),type);
$$root["seti!"](o,(new $$root.Symbol("start")),start);
$$root["seti!"](o,(new $$root.Symbol("len")),len);
$$TMP247=o;
return $$TMP247;
}
)($$root["object"]($$root["token-proto"]));
return $$TMP246;
}
);
$$root["make-token"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP248;
   $$TMP248=(function(self){
      var $$TMP249;
      $$TMP249=(function(target){
         var $$TMP250;
$$TMP250=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substr"))),target,$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP250;
}
)($$root["geti"](self,(new $$root.Symbol("src"))));
return $$TMP249;
}
)(this);
return $$TMP248;
}
));
$$root["lit"]=(function(s){
   var $$TMP251;
$$TMP251=$$root["regex"]($$root["str"]("^",(function(target){
   var $$TMP252;
$$TMP252=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&");
return $$TMP252;
}
)(s)));
return $$TMP251;
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
   var $$TMP253;
   $$TMP253=(function(toks,pos,s){
      var $$TMP254;
      (function(recur){
         var $$TMP255;
         recur=(function(){
            var $$TMP256;
            var $$TMP257;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP257=(function(){
      var $$TMP258;
      (function(__GS8,res,i,__GS9,__GS10,entry,_){
         var $$TMP259;
         $$TMP259=(function(recur){
            var $$TMP260;
            recur=(function(){
               var $$TMP261;
               var $$TMP262;
               var $$TMP263;
if($$root["<"](i,__GS9)){
   var $$TMP264;
if($$root["not"]($$root["null?"](__GS10))){
   var $$TMP265;
if($$root["not"](res)){
   $$TMP265=true;
}
else{
   $$TMP265=false;
}
$$TMP264=$$TMP265;
}
else{
   $$TMP264=false;
}
$$TMP263=$$TMP264;
}
else{
   $$TMP263=false;
}
if($$TMP263){
   $$TMP262=(function(){
      var $$TMP266;
entry=$$root["car"](__GS10);
entry;
res=(function(target){
   var $$TMP267;
$$TMP267=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("match"))),target,$$root["first"](entry));
return $$TMP267;
}
)(s);
__GS8=res;
__GS8;
i=$$root["+"](i,1);
i;
__GS10=$$root["cdr"](__GS10);
__GS10;
$$TMP266=recur();
return $$TMP266;
}
)();
}
else{
   $$TMP262=(function(){
      var $$TMP268;
      _=__GS8;
      _;
      var $$TMP269;
      if(res){
         $$TMP269=(function(){
            var $$TMP270;
            s=(function(target){
               var $$TMP271;
$$TMP271=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substring"))),target,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
return $$TMP271;
}
)(s);
s;
var $$TMP272;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP272=(function(){
      var $$TMP273;
toks=$$root["cons"]($$root["make-token"](src,(function(c){
   var $$TMP274;
   var $$TMP275;
   if(c){
      $$TMP275=c;
   }
   else{
$$TMP275=$$root["second"](entry);
}
$$TMP274=$$TMP275;
return $$TMP274;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP273=toks;
return $$TMP273;
}
)();
}
else{
   $$TMP272=undefined;
}
$$TMP272;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP270=pos;
return $$TMP270;
}
)();
}
else{
$$TMP269=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS8=$$TMP269;
$$TMP268=__GS8;
return $$TMP268;
}
)();
}
$$TMP261=$$TMP262;
return $$TMP261;
}
);
recur;
$$TMP260=recur();
return $$TMP260;
}
)([]);
return $$TMP259;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP258=recur();
return $$TMP258;
}
)();
}
else{
   $$TMP257=undefined;
}
$$TMP256=$$TMP257;
return $$TMP256;
}
);
recur;
$$TMP255=recur();
return $$TMP255;
}
)([]);
$$TMP254=$$root["reverse"]($$root["cons"]($$root["make-token"](src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP254;
}
)([],0,src);
return $$TMP253;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["make-parser"]=(function(toks){
   var $$TMP276;
   $$TMP276=(function(o){
      var $$TMP277;
$$root["seti!"](o,(new $$root.Symbol("pos")),toks);
$$TMP277=o;
return $$TMP277;
}
)($$root["object"]($$root["parser-proto"]));
return $$TMP276;
}
);
$$root["make-parser"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP278;
   $$TMP278=(function(self){
      var $$TMP279;
$$TMP279=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP279;
}
)(this);
return $$TMP278;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP280;
   $$TMP280=(function(self){
      var $$TMP281;
      $$TMP281=(function(curr){
         var $$TMP282;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP282=curr;
return $$TMP282;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP281;
}
)(this);
return $$TMP280;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP283;
   $$TMP283=(function(target){
      var $$TMP284;
$$TMP284=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("stringify"))),target,s);
return $$TMP284;
}
)($$root["JSON"]);
return $$TMP283;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP285;
   $$TMP285=(function(target){
      var $$TMP286;
$$TMP286=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse"))),target,s);
return $$TMP286;
}
)($$root["JSON"]);
return $$TMP285;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP287;
   $$TMP287=(function(self){
      var $$TMP288;
      $$TMP288=(function(tok){
         var $$TMP290;
         $$TMP290=(function(__GS11){
            var $$TMP291;
            var $$TMP292;
if($$root["equal?"](__GS11,(new $$root.Symbol("list-open-tok")))){
   $$TMP292=(function(target){
      var $$TMP293;
$$TMP293=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-list"))),target);
return $$TMP293;
}
)(self);
}
else{
   var $$TMP294;
if($$root["equal?"](__GS11,(new $$root.Symbol("true-tok")))){
   $$TMP294=true;
}
else{
   var $$TMP295;
if($$root["equal?"](__GS11,(new $$root.Symbol("false-tok")))){
   $$TMP295=false;
}
else{
   var $$TMP296;
if($$root["equal?"](__GS11,(new $$root.Symbol("null-tok")))){
   $$TMP296=[];
}
else{
   var $$TMP297;
if($$root["equal?"](__GS11,(new $$root.Symbol("undef-tok")))){
   $$TMP297=undefined;
}
else{
   var $$TMP298;
if($$root["equal?"](__GS11,(new $$root.Symbol("num-tok")))){
$$TMP298=$$root["parseFloat"]((function(target){
   var $$TMP299;
$$TMP299=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("text"))),target);
return $$TMP299;
}
)(tok));
}
else{
   var $$TMP300;
if($$root["equal?"](__GS11,(new $$root.Symbol("str-tok")))){
$$TMP300=$$root["unescape-str"]((function(target){
   var $$TMP301;
$$TMP301=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("text"))),target);
return $$TMP301;
}
)(tok));
}
else{
   var $$TMP302;
if($$root["equal?"](__GS11,(new $$root.Symbol("quote-tok")))){
$$TMP302=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]((function(target){
   var $$TMP303;
$$TMP303=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP303;
}
)(self)));
}
else{
   var $$TMP304;
if($$root["equal?"](__GS11,(new $$root.Symbol("backquote-tok")))){
   $$TMP304=(function(target){
      var $$TMP305;
$$TMP305=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-backquoted-expr"))),target);
return $$TMP305;
}
)(self);
}
else{
   var $$TMP306;
if($$root["equal?"](__GS11,(new $$root.Symbol("sym-tok")))){
$$TMP306=$$root["symbol"]((function(target){
   var $$TMP307;
$$TMP307=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("text"))),target);
return $$TMP307;
}
)(tok));
}
else{
   var $$TMP308;
   if(true){
$$TMP308=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP308=undefined;
}
$$TMP306=$$TMP308;
}
$$TMP304=$$TMP306;
}
$$TMP302=$$TMP304;
}
$$TMP300=$$TMP302;
}
$$TMP298=$$TMP300;
}
$$TMP297=$$TMP298;
}
$$TMP296=$$TMP297;
}
$$TMP295=$$TMP296;
}
$$TMP294=$$TMP295;
}
$$TMP292=$$TMP294;
}
$$TMP291=$$TMP292;
return $$TMP291;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP290;
}
)((function(target){
   var $$TMP289;
$$TMP289=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP289;
}
)(self));
return $$TMP288;
}
)(this);
return $$TMP287;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP309;
   $$TMP309=(function(self){
      var $$TMP310;
      $$TMP310=(function(__GS12,__GS13,lst){
         var $$TMP311;
         $$TMP311=(function(recur){
            var $$TMP312;
            recur=(function(){
               var $$TMP313;
               var $$TMP314;
               var $$TMP315;
               var $$TMP316;
$$root["t"]=$$root["geti"]((function(target){
   var $$TMP317;
$$TMP317=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP317;
}
)(self),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP318;
$$root["t"]=$$root["geti"]((function(target){
   var $$TMP319;
$$TMP319=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP319;
}
)(self),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP318=true;
}
else{
   $$TMP318=false;
}
$$TMP316=$$TMP318;
}
else{
   $$TMP316=false;
}
if($$TMP316){
   $$TMP315=true;
}
else{
   $$TMP315=false;
}
if($$TMP315){
   $$TMP314=(function(){
      var $$TMP320;
__GS13=$$root["cons"]((function(target){
   var $$TMP321;
$$TMP321=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP321;
}
)(self),__GS13);
__GS12=__GS13;
__GS12;
$$TMP320=recur();
return $$TMP320;
}
)();
}
else{
   $$TMP314=(function(){
      var $$TMP322;
__GS12=$$root["reverse"](__GS13);
__GS12;
lst=__GS12;
lst;
var $$TMP323;
if($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP324;
$$TMP324=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP324;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP323=lst;
}
else{
$$TMP323=$$root["error"]("Unmatched paren!");
}
__GS12=$$TMP323;
$$TMP322=__GS12;
return $$TMP322;
}
)();
}
$$TMP313=$$TMP314;
return $$TMP313;
}
);
recur;
$$TMP312=recur();
return $$TMP312;
}
)([]);
return $$TMP311;
}
)(undefined,[],undefined);
return $$TMP310;
}
)(this);
return $$TMP309;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP325;
   $$TMP325=(function(self){
      var $$TMP326;
      $$TMP326=(function(__GS14,__GS15,lst){
         var $$TMP327;
         $$TMP327=(function(recur){
            var $$TMP328;
            recur=(function(){
               var $$TMP329;
               var $$TMP330;
               var $$TMP331;
               var $$TMP332;
if($$root["not"]($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP333;
$$TMP333=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP333;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP334;
if($$root["not"]($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP335;
$$TMP335=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP335;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP334=true;
}
else{
   $$TMP334=false;
}
$$TMP332=$$TMP334;
}
else{
   $$TMP332=false;
}
if($$TMP332){
   $$TMP331=true;
}
else{
   $$TMP331=false;
}
if($$TMP331){
   $$TMP330=(function(){
      var $$TMP336;
__GS15=$$root["cons"]((function(__GS16){
   var $$TMP338;
   var $$TMP339;
if($$root["equal?"](__GS16,(new $$root.Symbol("unquote-tok")))){
   $$TMP339=(function(){
      var $$TMP340;
      (function(target){
         var $$TMP341;
$$TMP341=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP341;
}
)(self);
$$TMP340=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]((function(target){
   var $$TMP342;
$$TMP342=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP342;
}
)(self)));
return $$TMP340;
}
)();
}
else{
   var $$TMP343;
if($$root["equal?"](__GS16,(new $$root.Symbol("splice-tok")))){
   $$TMP343=(function(){
      var $$TMP344;
      (function(target){
         var $$TMP345;
$$TMP345=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP345;
}
)(self);
$$TMP344=(function(target){
   var $$TMP346;
$$TMP346=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP346;
}
)(self);
return $$TMP344;
}
)();
}
else{
   var $$TMP347;
   if(true){
$$TMP347=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]((function(target){
   var $$TMP348;
$$TMP348=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-backquoted-expr"))),target);
return $$TMP348;
}
)(self)));
}
else{
   $$TMP347=undefined;
}
$$TMP343=$$TMP347;
}
$$TMP339=$$TMP343;
}
$$TMP338=$$TMP339;
return $$TMP338;
}
)($$root["geti"]((function(target){
   var $$TMP337;
$$TMP337=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP337;
}
)(self),(new $$root.Symbol("type")))),__GS15);
__GS14=__GS15;
__GS14;
$$TMP336=recur();
return $$TMP336;
}
)();
}
else{
   $$TMP330=(function(){
      var $$TMP349;
__GS14=$$root["reverse"](__GS15);
__GS14;
lst=__GS14;
lst;
var $$TMP350;
if($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP351;
$$TMP351=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP351;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP350=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP350=$$root["error"]("Unmatched paren!");
}
__GS14=$$TMP350;
$$TMP349=__GS14;
return $$TMP349;
}
)();
}
$$TMP329=$$TMP330;
return $$TMP329;
}
);
recur;
$$TMP328=recur();
return $$TMP328;
}
)([]);
return $$TMP327;
}
)(undefined,[],undefined);
return $$TMP326;
}
)(this);
return $$TMP325;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP352;
   $$TMP352=(function(self){
      var $$TMP353;
      var $$TMP354;
if($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP355;
$$TMP355=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP355;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP354=(function(){
      var $$TMP356;
      (function(target){
         var $$TMP357;
$$TMP357=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP357;
}
)(self);
$$TMP356=(function(target){
   var $$TMP358;
$$TMP358=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-backquoted-list"))),target);
return $$TMP358;
}
)(self);
return $$TMP356;
}
)();
}
else{
$$TMP354=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]((function(target){
   var $$TMP359;
$$TMP359=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP359;
}
)(self)));
}
$$TMP353=$$TMP354;
return $$TMP353;
}
)(this);
return $$TMP352;
}
));
$$root["parse"]=(function(toks){
   var $$TMP360;
   $$TMP360=(function(p){
      var $$TMP361;
      $$TMP361=(function(__GS17,__GS18){
         var $$TMP362;
         $$TMP362=(function(recur){
            var $$TMP363;
            recur=(function(){
               var $$TMP364;
               var $$TMP365;
               var $$TMP366;
if($$root["not"]($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP367;
$$TMP367=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP367;
}
)(p),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP366=true;
}
else{
   $$TMP366=false;
}
if($$TMP366){
   $$TMP365=(function(){
      var $$TMP368;
__GS18=$$root["cons"]((function(target){
   var $$TMP369;
$$TMP369=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP369;
}
)(p),__GS18);
__GS17=__GS18;
__GS17;
$$TMP368=recur();
return $$TMP368;
}
)();
}
else{
   $$TMP365=(function(){
      var $$TMP370;
__GS17=$$root["reverse"](__GS18);
$$TMP370=__GS17;
return $$TMP370;
}
)();
}
$$TMP364=$$TMP365;
return $$TMP364;
}
);
recur;
$$TMP363=recur();
return $$TMP363;
}
)([]);
return $$TMP362;
}
)(undefined,[]);
return $$TMP361;
}
)($$root["make-parser"](toks));
return $$TMP360;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS19){
   var $$TMP371;
$$root["seti!"](__GS19,".","__DOT");
$$root["seti!"](__GS19,"<","__LT");
$$root["seti!"](__GS19,">","__GT");
$$root["seti!"](__GS19,"?","__QM");
$$root["seti!"](__GS19,"+","__PLUS");
$$root["seti!"](__GS19,"-","__MINUS");
$$root["seti!"](__GS19,"=","__EQL");
$$root["seti!"](__GS19,"!","__BANG");
$$root["seti!"](__GS19,"@","__AT");
$$root["seti!"](__GS19,"#","__HASH");
$$root["seti!"](__GS19,"$","__USD");
$$root["seti!"](__GS19,"%","__PCNT");
$$root["seti!"](__GS19,"^","__CARET");
$$root["seti!"](__GS19,"&","__AMP");
$$root["seti!"](__GS19,"*","__STAR");
$$root["seti!"](__GS19,"/","__SLASH");
$$TMP371=__GS19;
return $$TMP371;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP372;
   $$TMP372=(function(target){
      var $$TMP373;
$$TMP373=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("keys"))),target,obj);
return $$TMP373;
}
)($$root["Object"]);
return $$TMP372;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",(function(target){var $$TMP374;$$TMP374=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("join"))),target,"|\\");return $$TMP374;})($$root["keys"]($$root["mangling-table"]))),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP375;$$TMP375=$$root["geti"]($$root["mangling-table"],x);return $$TMP375;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP376;$$TMP376=(function(target){var $$TMP377;$$TMP377=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["mangling-rx"],$$root["mangle"]);return $$TMP377;})(name);return $$TMP376;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["make-compiler"]=(function(root){var $$TMP378;$$TMP378=(function(__GS20){var $$TMP379;$$root["seti!"](__GS20,"root",root);$$root["seti!"](__GS20,"next-var-suffix",0);$$TMP379=__GS20;return $$TMP379;})($$root["object"]($$root["compiler-proto"]));return $$TMP378;});$$root["make-compiler"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP380;$$TMP380=(function(self){var $$TMP381;$$TMP381=(function(out){var $$TMP382;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP382=out;return $$TMP382;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP381;})(this);return $$TMP380;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP383;var $$TMP384;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP384=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP384=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP383=$$TMP384;
return $$TMP383;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP385;
   $$TMP385=(function(self){
      var $$TMP386;
      var $$TMP387;
if($$root["="](x,true)){
$$TMP387=$$root["list"]("true","");
}
else{
   var $$TMP388;
if($$root["="](x,false)){
$$TMP388=$$root["list"]("false","");
}
else{
   var $$TMP389;
if($$root["null?"](x)){
$$TMP389=$$root["list"]("[]","");
}
else{
   var $$TMP390;
if($$root["="](x,undefined)){
$$TMP390=$$root["list"]("undefined","");
}
else{
   var $$TMP391;
if($$root["symbol?"](x)){
$$TMP391=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP392;
if($$root["string?"](x)){
$$TMP392=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP393;
   if(true){
$$TMP393=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP393=undefined;
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
return $$TMP386;
}
)(this);
return $$TMP385;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP394;
   $$TMP394=(function(self){
      var $$TMP395;
      $$TMP395=(function(__GS21){
         var $$TMP396;
         $$TMP396=(function(fun,args){
            var $$TMP397;
            $$TMP397=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP399;
$$TMP399=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP399;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),(function(target){
   var $$TMP398;
$$TMP398=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,fun);
return $$TMP398;
}
)(self));
return $$TMP397;
}
)($$root["nth"](0,__GS21),$$root["drop"](1,__GS21));
return $$TMP396;
}
)(lst);
return $$TMP395;
}
)(this);
return $$TMP394;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP400;
   $$TMP400=(function(self){
      var $$TMP401;
      $$TMP401=(function(compiled__MINUSbody,reducer){
         var $$TMP403;
$$TMP403=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP403;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP402;
$$TMP402=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP402;
}
));
return $$TMP401;
}
)(this);
return $$TMP400;
}
));
$$root["process-args"]=(function(args){
   var $$TMP404;
$$TMP404=$$root["join"](",",$$root["reverse"]($$root["reduce"]((function(accum,v){
   var $$TMP405;
   var $$TMP406;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP406=$$root["str"]("...",$$root["mangle-name"]((function(target){
   var $$TMP407;
$$TMP407=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP407;
}
)($$root["geti"](v,(new $$root.Symbol("name"))))));
}
else{
$$TMP406=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
}
$$TMP405=$$root["cons"]($$TMP406,accum);
return $$TMP405;
}
),args,[])));
return $$TMP404;
}
);
$$root["process-args"];
$$root["lexical-name"]=(function(sym){
   var $$TMP408;
   var $$TMP409;
if($$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&")){
$$TMP409=$$root["mangle-name"]((function(target){
   var $$TMP410;
$$TMP410=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP410;
}
)($$root["geti"](sym,(new $$root.Symbol("name")))));
}
else{
$$TMP409=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));
}
$$TMP408=$$TMP409;
return $$TMP408;
}
);
$$root["lexical-name"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP411;
   $$TMP411=(function(self){
      var $$TMP412;
      $$TMP412=(function(__GS22){
         var $$TMP413;
         $$TMP413=(function(__GS23){
            var $$TMP414;
            $$TMP414=(function(args,body){
               var $$TMP415;
               $$TMP415=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP418;
                  $$TMP418=(function(compiled__MINUSbody){
                     var $$TMP420;
$$TMP420=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{","var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP420;
}
)((function(target){
   var $$TMP419;
$$TMP419=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-body-helper"))),target,lexenv2,body,ret__MINUSvar__MINUSname);
return $$TMP419;
}
)(self));
return $$TMP418;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP416;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP416=accum;
return $$TMP416;
}
),args,$$root["object"](lexenv)),(function(target){
   var $$TMP417;
$$TMP417=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("gen-var-name"))),target);
return $$TMP417;
}
)(self));
return $$TMP415;
}
)($$root["drop"](0,__GS23),$$root["drop"](2,__GS22));
return $$TMP414;
}
)($$root["nth"](1,__GS22));
return $$TMP413;
}
)(lst);
return $$TMP412;
}
)(this);
return $$TMP411;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP421;
   $$TMP421=(function(self){
      var $$TMP422;
      $$TMP422=(function(__GS24){
         var $$TMP423;
         $$TMP423=(function(c,t,f){
            var $$TMP424;
            $$TMP424=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP429;
$$TMP429=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP429;
}
)((function(target){
   var $$TMP425;
$$TMP425=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("gen-var-name"))),target);
return $$TMP425;
}
)(self),(function(target){
   var $$TMP426;
$$TMP426=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,c);
return $$TMP426;
}
)(self),(function(target){
   var $$TMP427;
$$TMP427=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,t);
return $$TMP427;
}
)(self),(function(target){
   var $$TMP428;
$$TMP428=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,f);
return $$TMP428;
}
)(self));
return $$TMP424;
}
)($$root["nth"](1,__GS24),$$root["nth"](2,__GS24),$$root["nth"](3,__GS24));
return $$TMP423;
}
)(lst);
return $$TMP422;
}
)(this);
return $$TMP421;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP430;
   $$TMP430=(function(self){
      var $$TMP431;
      var $$TMP432;
if($$root["symbol?"](x)){
$$TMP432=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
   $$TMP432=(function(target){
      var $$TMP433;
$$TMP433=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-atom"))),target,lexenv,x);
return $$TMP433;
}
)(self);
}
$$TMP431=$$TMP432;
return $$TMP431;
}
)(this);
return $$TMP430;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP434;
   $$TMP434=(function(self){
      var $$TMP435;
$$TMP435=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP435;
}
)(this);
return $$TMP434;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP436;
   $$TMP436=(function(self){
      var $$TMP437;
      var $$TMP438;
if($$root["atom?"](x)){
   $$TMP438=(function(target){
      var $$TMP439;
$$TMP439=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-quoted-atom"))),target,lexenv,x);
return $$TMP439;
}
)(self);
}
else{
   $$TMP438=(function(target){
      var $$TMP440;
$$TMP440=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-quoted-list"))),target,lexenv,x);
return $$TMP440;
}
)(self);
}
$$TMP437=$$TMP438;
return $$TMP437;
}
)(this);
return $$TMP436;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP441;
   $$TMP441=(function(self){
      var $$TMP442;
      $$TMP442=(function(__GS25){
         var $$TMP443;
         $$TMP443=(function(name,value){
            var $$TMP444;
            $$TMP444=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP446;
$$TMP446=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP446;
}
)($$root["compile-time-resolve"](lexenv,name),(function(target){
   var $$TMP445;
$$TMP445=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,value);
return $$TMP445;
}
)(self));
return $$TMP444;
}
)($$root["nth"](1,__GS25),$$root["nth"](2,__GS25));
return $$TMP443;
}
)(lst);
return $$TMP442;
}
)(this);
return $$TMP441;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP447;
   $$TMP447=(function(self){
      var $$TMP448;
      $$TMP448=(function(__GS26){
         var $$TMP449;
         $$TMP449=(function(name,args){
            var $$TMP450;
            $$TMP450=(function(tmp){
               var $$TMP453;
               $$TMP453=(function(target){
                  var $$TMP454;
$$TMP454=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("jeval"))),target,$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP454;
}
)($$root["geti"](self,(new $$root.Symbol("root"))));
return $$TMP453;
}
)((function(target){
   var $$TMP451;
$$TMP451=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-funcall"))),target,lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP452;
$$TMP452=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP452;
}
),args)));
return $$TMP451;
}
)(self));
return $$TMP450;
}
)($$root["nth"](0,__GS26),$$root["drop"](1,__GS26));
return $$TMP449;
}
)(expr);
return $$TMP448;
}
)(this);
return $$TMP447;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP455;
   $$TMP455=(function(self){
      var $$TMP456;
      var $$TMP457;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP458;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP458=true;
}
else{
   $$TMP458=false;
}
$$TMP457=$$TMP458;
}
else{
   $$TMP457=false;
}
$$TMP456=$$TMP457;
return $$TMP456;
}
)(this);
return $$TMP455;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP459;
   $$TMP459=(function(self){
      var $$TMP460;
      var $$TMP461;
      var $$TMP462;
if($$root["list?"](expr)){
   var $$TMP463;
if($$root["not"]($$root["null?"](expr))){
   $$TMP463=true;
}
else{
   $$TMP463=false;
}
$$TMP462=$$TMP463;
}
else{
   $$TMP462=false;
}
if($$TMP462){
   $$TMP461=(function(first){
      var $$TMP464;
      var $$TMP465;
if($$root["symbol?"](first)){
   $$TMP465=(function(__GS27){
      var $$TMP466;
      var $$TMP467;
if($$root["equal?"](__GS27,(new $$root.Symbol("lambda")))){
   $$TMP467=(function(target){
      var $$TMP468;
$$TMP468=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-lambda"))),target,lexenv,expr);
return $$TMP468;
}
)(self);
}
else{
   var $$TMP469;
if($$root["equal?"](__GS27,(new $$root.Symbol("if")))){
   $$TMP469=(function(target){
      var $$TMP470;
$$TMP470=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-if"))),target,lexenv,expr);
return $$TMP470;
}
)(self);
}
else{
   var $$TMP471;
if($$root["equal?"](__GS27,(new $$root.Symbol("quote")))){
   $$TMP471=(function(target){
      var $$TMP472;
$$TMP472=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-quoted"))),target,lexenv,$$root["second"](expr));
return $$TMP472;
}
)(self);
}
else{
   var $$TMP473;
if($$root["equal?"](__GS27,(new $$root.Symbol("setv!")))){
   $$TMP473=(function(target){
      var $$TMP474;
$$TMP474=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-setv"))),target,lexenv,expr);
return $$TMP474;
}
)(self);
}
else{
   var $$TMP475;
if($$root["equal?"](__GS27,(new $$root.Symbol("def")))){
   $$TMP475=(function(target){
      var $$TMP476;
$$TMP476=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-setv"))),target,lexenv,expr);
return $$TMP476;
}
)(self);
}
else{
   var $$TMP477;
   if(true){
      var $$TMP478;
      if((function(target){
         var $$TMP479;
$$TMP479=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("is-macro"))),target,$$root["geti"](first,(new $$root.Symbol("name"))));
return $$TMP479;
}
)(self)){
   $$TMP478=(function(target){
      var $$TMP480;
$$TMP480=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,(function(target){
   var $$TMP481;
$$TMP481=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("macroexpand-unsafe"))),target,lexenv,expr);
return $$TMP481;
}
)(self));
return $$TMP480;
}
)(self);
}
else{
   $$TMP478=(function(target){
      var $$TMP482;
$$TMP482=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-funcall"))),target,lexenv,expr);
return $$TMP482;
}
)(self);
}
$$TMP477=$$TMP478;
}
else{
   $$TMP477=undefined;
}
$$TMP475=$$TMP477;
}
$$TMP473=$$TMP475;
}
$$TMP471=$$TMP473;
}
$$TMP469=$$TMP471;
}
$$TMP467=$$TMP469;
}
$$TMP466=$$TMP467;
return $$TMP466;
}
)(first);
}
else{
   $$TMP465=(function(target){
      var $$TMP483;
$$TMP483=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-funcall"))),target,lexenv,expr);
return $$TMP483;
}
)(self);
}
$$TMP464=$$TMP465;
return $$TMP464;
}
)($$root["car"](expr));
}
else{
   $$TMP461=(function(target){
      var $$TMP484;
$$TMP484=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-atom"))),target,lexenv,expr);
return $$TMP484;
}
)(self);
}
$$TMP460=$$TMP461;
return $$TMP460;
}
)(this);
return $$TMP459;
}
));
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["make-node-evaluator"]=(function(){
   var $$TMP485;
   $$TMP485=(function(root,sandbox){
      var $$TMP486;
$$root["seti!"](sandbox,"$$root",root);
(function(target){
   var $$TMP487;
$$TMP487=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("createContext"))),target,sandbox);
return $$TMP487;
}
)($$root["VM"]);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP488;
   $$TMP488=(function(target){
      var $$TMP489;
$$TMP489=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("runInContext"))),target,str,sandbox);
return $$TMP489;
}
)($$root["VM"]);
return $$TMP488;
}
));
$$TMP486=(function(__GS28){
   var $$TMP490;
$$root["seti!"](__GS28,"root",root);
$$root["seti!"](__GS28,"compiler",$$root["make-compiler"](root));
$$TMP490=__GS28;
return $$TMP490;
}
)($$root["object"]($$root["node-evaluator-proto"]));
return $$TMP486;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP485;
}
);
$$root["make-node-evaluator"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP491;
   $$TMP491=(function(self){
      var $$TMP492;
      $$TMP492=(function(tmp){
         var $$TMP494;
         $$TMP494=(function(target){
            var $$TMP495;
$$TMP495=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("jeval"))),target,$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP495;
}
)($$root["geti"](self,(new $$root.Symbol("root"))));
return $$TMP494;
}
)((function(target){
   var $$TMP493;
$$TMP493=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,$$root["object"](),expr);
return $$TMP493;
}
)($$root["geti"](self,(new $$root.Symbol("compiler")))));
return $$TMP492;
}
)(this);
return $$TMP491;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP496;
   $$TMP496=(function(self){
      var $$TMP497;
      $$TMP497=(function(forms){
         var $$TMP498;
         $$TMP498=(function(__GS29,__GS30,form){
            var $$TMP499;
            $$TMP499=(function(recur){
               var $$TMP500;
               recur=(function(){
                  var $$TMP501;
                  var $$TMP502;
                  var $$TMP503;
if($$root["not"]($$root["null?"](__GS30))){
   $$TMP503=true;
}
else{
   $$TMP503=false;
}
if($$TMP503){
   $$TMP502=(function(){
      var $$TMP504;
form=$$root["car"](__GS30);
form;
__GS29=(function(target){
   var $$TMP505;
$$TMP505=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("eval"))),target,form);
return $$TMP505;
}
)(self);
__GS29;
__GS30=$$root["cdr"](__GS30);
__GS30;
$$TMP504=recur();
return $$TMP504;
}
)();
}
else{
   $$TMP502=(function(){
      var $$TMP506;
      $$TMP506=__GS29;
      return $$TMP506;
   }
   )();
}
$$TMP501=$$TMP502;
return $$TMP501;
}
);
recur;
$$TMP500=recur();
return $$TMP500;
}
)([]);
return $$TMP499;
}
)(undefined,forms,[]);
return $$TMP498;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP497;
}
)(this);
return $$TMP496;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
