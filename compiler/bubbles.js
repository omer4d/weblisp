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
$$root["new"]=(function(constructor,...args){
   var $$TMP90;
   $$TMP90=(function(instance){
      var $$TMP91;
$$TMP91=$$root["apply-method"](constructor,instance,args);
return $$TMP91;
}
)($$root["object"]($$root["."]($$root["prototype"],constructor)));
return $$TMP90;
}
);
$$root["new"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP92;
   var $$TMP93;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP93=obj__MINUSname;
}
else{
$$TMP93=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP92=$$TMP93;
return $$TMP92;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP94;
   $$TMP94=(function(rev__MINUSfields){
      var $$TMP95;
      var $$TMP96;
if($$root["list?"]($$root["car"](rev__MINUSfields))){
$$TMP96=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
}
else{
$$TMP96=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
}
$$TMP95=$$TMP96;
return $$TMP95;
}
)($$root["reverse"](fields));
return $$TMP94;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["prototype?"]=(function(p,o){
   var $$TMP97;
   $$TMP97=(function(target){
      var $$TMP98;
$$TMP98=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("isPrototypeOf"))),target,o);
return $$TMP98;
}
)(p);
return $$TMP97;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP99;
   var $$TMP100;
if($$root["null?"](a)){
$$TMP100=$$root["null?"](b);
}
else{
   var $$TMP101;
if($$root["symbol?"](a)){
   var $$TMP102;
if($$root["symbol?"](b)){
   var $$TMP103;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP103=true;
}
else{
   $$TMP103=false;
}
$$TMP102=$$TMP103;
}
else{
   $$TMP102=false;
}
$$TMP101=$$TMP102;
}
else{
   var $$TMP104;
if($$root["atom?"](a)){
$$TMP104=$$root["="](a,b);
}
else{
   var $$TMP105;
if($$root["list?"](a)){
   var $$TMP106;
if($$root["list?"](b)){
   var $$TMP107;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP108;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP108=true;
}
else{
   $$TMP108=false;
}
$$TMP107=$$TMP108;
}
else{
   $$TMP107=false;
}
$$TMP106=$$TMP107;
}
else{
   $$TMP106=false;
}
$$TMP105=$$TMP106;
}
else{
   $$TMP105=undefined;
}
$$TMP104=$$TMP105;
}
$$TMP101=$$TMP104;
}
$$TMP100=$$TMP101;
}
$$TMP99=$$TMP100;
return $$TMP99;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP109;
   $$TMP109=(function(res){
      var $$TMP115;
$$TMP115=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP115;
}
)((function(recur){
   var $$TMP110;
   recur=(function(l1,l2){
      var $$TMP111;
      var $$TMP112;
      if((function(c){
         var $$TMP113;
         var $$TMP114;
         if(c){
            $$TMP114=c;
         }
         else{
$$TMP114=p($$root["car"](l2));
}
$$TMP113=$$TMP114;
return $$TMP113;
}
)($$root["null?"](l2))){
$$TMP112=$$root["list"](l1,l2);
}
else{
$$TMP112=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP111=$$TMP112;
return $$TMP111;
}
);
recur;
$$TMP110=recur([],lst);
return $$TMP110;
}
)([]));
return $$TMP109;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP116;
   var $$TMP117;
if($$root["reduce"]((function(accum,v){
   var $$TMP118;
   var $$TMP119;
   if(accum){
      $$TMP119=accum;
   }
   else{
      $$TMP119=v;
   }
   $$TMP118=$$TMP119;
   return $$TMP118;
}
),lst,false)){
   $$TMP117=true;
}
else{
   $$TMP117=false;
}
$$TMP116=$$TMP117;
return $$TMP116;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP120;
$$TMP120=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP121;
   var $$TMP122;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP123;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP123=true;
}
else{
   $$TMP123=false;
}
$$TMP122=$$TMP123;
}
else{
   $$TMP122=false;
}
$$TMP121=$$TMP122;
return $$TMP121;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP120;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP124;
   $$TMP124=(function(binding__MINUSnames){
      var $$TMP125;
      $$TMP125=(function(divs){
         var $$TMP127;
         var $$TMP128;
if($$root["null?"]($$root["second"](divs))){
$$TMP128=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP128=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP127=$$TMP128;
return $$TMP127;
}
)($$root["split"]((function(pair){
   var $$TMP126;
$$TMP126=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP126;
}
),binding__MINUSpairs));
return $$TMP125;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP124;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP129;
$$TMP129=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP129;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP130;
   $$TMP130=(function(x){
      var $$TMP131;
$$TMP131=$$root["not"](f(x));
return $$TMP131;
}
);
return $$TMP130;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP132;
   $$TMP132=(function(...args){
      var $$TMP133;
$$TMP133=f1($$root["apply"](f2,args));
return $$TMP133;
}
);
return $$TMP132;
}
);
$$root["compose"];
$$root["partial"]=(function(f,...args1){
   var $$TMP134;
   $$TMP134=(function(...args2){
      var $$TMP135;
$$TMP135=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP135;
}
);
return $$TMP134;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield,...args1){
   var $$TMP136;
   $$TMP136=(function(...args2){
      var $$TMP137;
$$TMP137=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP137;
}
);
return $$TMP136;
}
);
$$root["partial-method"];
$$root["format"]=(function(...args){
   var $$TMP138;
   $$TMP138=(function(rx){
      var $$TMP139;
      $$TMP139=(function(target){
         var $$TMP140;
$$TMP140=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,rx,(function(match){
   var $$TMP141;
$$TMP141=$$root["nth"]($$root["parseInt"]((function(target){
   var $$TMP142;
$$TMP142=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substring"))),target,1);
return $$TMP142;
}
)(match)),$$root["cdr"](args));
return $$TMP141;
}
));
return $$TMP140;
}
)($$root["car"](args));
return $$TMP139;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP138;
}
);
$$root["format"];
$$root["case"]=(function(e,...pairs){
   var $$TMP143;
   $$TMP143=(function(e__MINUSname,def__MINUSidx){
      var $$TMP144;
      var $$TMP145;
if($$root["="](def__MINUSidx,-1)){
$$TMP145=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
}
else{
$$TMP145=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP144=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP146;
$$TMP146=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP147;
$$TMP147=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP147;
}
),$$root["filter"]((function(pair){
   var $$TMP148;
$$TMP148=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP148;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP146;
}
)($$TMP145,$$root["partition"](2,pairs));
return $$TMP144;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP143;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP149;
   $$TMP149=(function(expr__MINUSname){
      var $$TMP150;
$$TMP150=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP151;
   var $$TMP152;
if($$root["symbol?"](v)){
   var $$TMP153;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP153=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
   var $$TMP154;
$$TMP154=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP154;
}
)($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP155;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP155=[];
}
else{
$$TMP155=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP153=$$TMP155;
}
$$TMP152=$$TMP153;
}
else{
$$TMP152=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP151=$$TMP152;
return $$TMP151;
}
),structure)));
return $$TMP150;
}
)($$root["gensym"]());
return $$TMP149;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP156;
   var $$TMP157;
if($$root["symbol?"](structure)){
$$TMP157=$$root["list"](structure,expr);
}
else{
$$TMP157=$$root["destruct-helper"](structure,expr);
}
$$TMP156=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP157),body);
return $$TMP156;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP158;
   var $$TMP159;
if($$root["list?"](expr)){
   var $$TMP160;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP160=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP160=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP159=$$TMP160;
}
else{
   $$TMP159=expr;
}
$$TMP158=$$TMP159;
return $$TMP158;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP161;
   var $$TMP162;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP162=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP163;
   var $$TMP164;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP165;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
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
if($$TMP164){
$$TMP163=$$root["list?"](expr);
}
else{
   var $$TMP166;
   if(true){
      var $$TMP167;
      var $$TMP168;
if($$root["list?"](expr)){
   var $$TMP169;
if($$root["not"]($$root["null?"](expr))){
   $$TMP169=true;
}
else{
   $$TMP169=false;
}
$$TMP168=$$TMP169;
}
else{
   $$TMP168=false;
}
if($$TMP168){
   var $$TMP170;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP171;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP171=true;
}
else{
   $$TMP171=false;
}
$$TMP170=$$TMP171;
}
else{
   $$TMP170=false;
}
$$TMP167=$$TMP170;
}
else{
   $$TMP167=false;
}
$$TMP166=$$TMP167;
}
else{
   $$TMP166=undefined;
}
$$TMP163=$$TMP166;
}
$$TMP162=$$TMP163;
}
$$TMP161=$$TMP162;
return $$TMP161;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP172;
   var $$TMP173;
if($$root["null?"](patt)){
$$TMP173=$$root["null?"](expr);
}
else{
   var $$TMP174;
if($$root["list?"](patt)){
$$TMP174=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP175;
if($$root["symbol?"](patt)){
   $$TMP175=true;
}
else{
   var $$TMP176;
   if(true){
$$TMP176=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP176=undefined;
}
$$TMP175=$$TMP176;
}
$$TMP174=$$TMP175;
}
$$TMP173=$$TMP174;
}
$$TMP172=$$TMP173;
return $$TMP172;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP177;
   var $$TMP178;
   var $$TMP179;
if($$root["list?"](patt)){
   var $$TMP180;
if($$root["not"]($$root["null?"](patt))){
   $$TMP180=true;
}
else{
   $$TMP180=false;
}
$$TMP179=$$TMP180;
}
else{
   $$TMP179=false;
}
if($$TMP179){
   var $$TMP181;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP181=(new $$root.Symbol("_"));
}
else{
$$TMP181=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP178=$$TMP181;
}
else{
   $$TMP178=patt;
}
$$TMP177=$$TMP178;
return $$TMP177;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP182;
   $$TMP182=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP183;
$$TMP183=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP184;
$$TMP184=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP184;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP183;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP182;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP185;
   $$TMP185=(function(__GS1){
      var $$TMP186;
      var $$TMP187;
if($$root["matches?"](__GS1,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("geti")),[])),$$root.cons((new $$root.Symbol("obj")),$$root.cons((new $$root.Symbol("field")),[]))))){
   $$TMP187=(function(__GS2){
      var $$TMP188;
      $$TMP188=(function(obj,field){
         var $$TMP189;
$$TMP189=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP189;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP188;
}
)(__GS1);
}
else{
   var $$TMP190;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP190=(function(any){
      var $$TMP191;
      var $$TMP192;
if($$root["symbol?"](any)){
$$TMP192=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP192=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP191=$$TMP192;
return $$TMP191;
}
)(__GS1);
}
else{
   var $$TMP193;
   if(true){
$$TMP193=$$root["error"]("Fell out of case!");
}
else{
   $$TMP193=undefined;
}
$$TMP190=$$TMP193;
}
$$TMP187=$$TMP190;
}
$$TMP186=$$TMP187;
return $$TMP186;
}
)($$root["macroexpand"](place));
return $$TMP185;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP194;
   amt=(function(c){
      var $$TMP195;
      var $$TMP196;
      if(c){
         $$TMP196=c;
      }
      else{
         $$TMP196=1;
      }
      $$TMP195=$$TMP196;
      return $$TMP195;
   }
   )(amt);
   amt;
$$TMP194=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP194;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP197;
   amt=(function(c){
      var $$TMP198;
      var $$TMP199;
      if(c){
         $$TMP199=c;
      }
      else{
         $$TMP199=1;
      }
      $$TMP198=$$TMP199;
      return $$TMP198;
   }
   )(amt);
   amt;
$$TMP197=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP197;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP200;
$$TMP200=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP200;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP201;
   var $$TMP202;
if($$root["null?"](forms)){
   $$TMP202=x;
}
else{
$$TMP202=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP201=$$TMP202;
return $$TMP201;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["doto"]=(function(obj__MINUSexpr,...body){
   var $$TMP203;
   $$TMP203=(function(binding__MINUSname){
      var $$TMP204;
$$TMP204=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP205;
   $$TMP205=(function(__GS3){
      var $$TMP206;
      $$TMP206=(function(f,args){
         var $$TMP207;
$$TMP207=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP207;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP206;
}
)(v);
return $$TMP205;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP204;
}
)($$root["gensym"]());
return $$TMP203;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["while"]=(function(c,...body){
   var $$TMP208;
$$TMP208=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP208;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP209;
   $$TMP209=(function(target){
      var $$TMP210;
$$TMP210=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("sort"))),target,cmp);
return $$TMP210;
}
)(lst);
return $$TMP209;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP211;
   step=(function(c){
      var $$TMP212;
      var $$TMP213;
      if(c){
         $$TMP213=c;
      }
      else{
         $$TMP213=1;
      }
      $$TMP212=$$TMP213;
      return $$TMP212;
   }
   )(step);
   step;
   $$TMP211=(function(data){
      var $$TMP214;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP214=data;
return $$TMP214;
}
)($$root["object"]([]));
return $$TMP211;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP215;
   $$TMP215=(function(len__MINUSname,data){
      var $$TMP216;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP216=data;
return $$TMP216;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP215;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP217;
   $$TMP217=(function(lst__MINUSname,data){
      var $$TMP218;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP218=data;
return $$TMP218;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP217;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP219;
   $$TMP219=(function(__GS4){
      var $$TMP220;
      $$TMP220=(function(binding__MINUSname,__GS5){
         var $$TMP221;
         $$TMP221=(function(func__MINUSname,args){
            var $$TMP222;
$$TMP222=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP222;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP221;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP220;
}
)(form);
return $$TMP219;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP223;
   $$TMP223=(function(data){
      var $$TMP224;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP224=data;
return $$TMP224;
}
)($$root["object"]([]));
return $$TMP223;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP225;
   $$TMP225=(function(data){
      var $$TMP226;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP226=data;
return $$TMP226;
}
)($$root["object"]([]));
return $$TMP225;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP227;
   $$TMP227=(function(data){
      var $$TMP228;
      (function(__GS6){
         var $$TMP229;
         $$TMP229=(function(binding__MINUSname,body){
            var $$TMP230;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP230=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP230;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP229;
}
)(form);
$$TMP228=data;
return $$TMP228;
}
)($$root["object"]([]));
return $$TMP227;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP231;
   $$TMP231=(function(data){
      var $$TMP232;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP232=data;
return $$TMP232;
}
)($$root["object"]([]));
return $$TMP231;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP233;
   $$TMP233=(function(data,accum__MINUSname){
      var $$TMP234;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP234=data;
return $$TMP234;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP233;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP235;
$$TMP235=$$root["filter"]((function(x){
   var $$TMP236;
$$TMP236=$$root["not="](x,undefined);
return $$TMP236;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP235;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP237;
   $$TMP237=(function(res__MINUSname){
      var $$TMP238;
      $$TMP238=(function(all){
         var $$TMP248;
         $$TMP248=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP250;
            var $$TMP251;
if($$root["null?"](final__MINUSactions)){
$$TMP251=$$root["list"](res__MINUSname);
}
else{
   $$TMP251=final__MINUSactions;
}
$$TMP250=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP251)))))));
return $$TMP250;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP249;
$$TMP249=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP249;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP248;
}
)($$root["map"]((function(form){
   var $$TMP239;
   $$TMP239=(function(__GS7){
      var $$TMP240;
      var $$TMP241;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP241=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP242;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP242=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP243;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP243=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP244;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP244=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP245;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP245=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP246;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP246=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP247;
   if(true){
$$TMP247=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP247=undefined;
}
$$TMP246=$$TMP247;
}
$$TMP245=$$TMP246;
}
$$TMP244=$$TMP245;
}
$$TMP243=$$TMP244;
}
$$TMP242=$$TMP243;
}
$$TMP241=$$TMP242;
}
$$TMP240=$$TMP241;
return $$TMP240;
}
)($$root["car"](form));
return $$TMP239;
}
),forms));
return $$TMP238;
}
)($$root["gensym"]());
return $$TMP237;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["request-frame"]=(function(c){
   var $$TMP252;
   var $$TMP253;
   if(c){
      $$TMP253=c;
   }
   else{
      $$TMP253=(function(c){
         var $$TMP254;
         var $$TMP255;
         if(c){
            $$TMP255=c;
         }
         else{
            $$TMP255=(function(c){
               var $$TMP256;
               var $$TMP257;
               if(c){
                  $$TMP257=c;
               }
               else{
                  $$TMP257=(function(c){
                     var $$TMP258;
                     var $$TMP259;
                     if(c){
                        $$TMP259=c;
                     }
                     else{
                        $$TMP259=(function(c){
                           var $$TMP260;
                           var $$TMP261;
                           if(c){
                              $$TMP261=c;
                           }
                           else{
                              $$TMP261=(function(callback){
                                 var $$TMP262;
                                 $$TMP262=(function(target){
                                    var $$TMP263;
$$TMP263=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("setTimeout"))),target,callback,$$root["/"](1000,60));
return $$TMP263;
}
)($$root["window"]);
return $$TMP262;
}
);
}
$$TMP260=$$TMP261;
return $$TMP260;
}
)($$root["geti"]($$root["window"],(new $$root.Symbol("msRequestAnimationFrame"))));
}
$$TMP258=$$TMP259;
return $$TMP258;
}
)($$root["geti"]($$root["window"],(new $$root.Symbol("oRequestAnimationFrame"))));
}
$$TMP256=$$TMP257;
return $$TMP256;
}
)($$root["geti"]($$root["window"],(new $$root.Symbol("mozRequestAnimationFrame"))));
}
$$TMP254=$$TMP255;
return $$TMP254;
}
)($$root["geti"]($$root["window"],(new $$root.Symbol("webkitRequestAnimationFrame"))));
}
$$TMP252=$$TMP253;
return $$TMP252;
}
)($$root["geti"]($$root["window"],(new $$root.Symbol("requestAnimationFrame"))));
$$root["request-frame"];
