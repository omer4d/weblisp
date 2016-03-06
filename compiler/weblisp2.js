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
$$root["VM"]=$$root["require"]("vm");
$$root["VM"];
$$root["Reflect"]=$$root["require"]("harmony-reflect");
$$root["Reflect"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("init")),(function(src,type,start,len){
   var $$TMP252;
   $$TMP252=(function(self){
      var $$TMP253;
      $$TMP253=(function(__GS8){
         var $$TMP254;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP254=__GS8;
return $$TMP254;
}
)(self);
return $$TMP253;
}
)(this);
return $$TMP252;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP255;
   $$TMP255=(function(self){
      var $$TMP256;
      $$TMP256=(function(target){
         var $$TMP257;
$$TMP257=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substr"))),target,$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP257;
}
)($$root["geti"](self,(new $$root.Symbol("src"))));
return $$TMP256;
}
)(this);
return $$TMP255;
}
));
$$root["lit"]=(function(s){
   var $$TMP258;
$$TMP258=$$root["regex"]($$root["str"]("^",(function(target){
   var $$TMP259;
$$TMP259=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&");
return $$TMP259;
}
)(s)));
return $$TMP258;
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
   var $$TMP260;
   $$TMP260=(function(toks,pos,s){
      var $$TMP261;
      (function(recur){
         var $$TMP262;
         recur=(function(){
            var $$TMP263;
            var $$TMP264;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP264=(function(){
      var $$TMP265;
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP266;
         $$TMP266=(function(recur){
            var $$TMP267;
            recur=(function(){
               var $$TMP268;
               var $$TMP269;
               var $$TMP270;
if($$root["<"](i,__GS10)){
   var $$TMP271;
if($$root["not"]($$root["null?"](__GS11))){
   var $$TMP272;
if($$root["not"](res)){
   $$TMP272=true;
}
else{
   $$TMP272=false;
}
$$TMP271=$$TMP272;
}
else{
   $$TMP271=false;
}
$$TMP270=$$TMP271;
}
else{
   $$TMP270=false;
}
if($$TMP270){
   $$TMP269=(function(){
      var $$TMP273;
entry=$$root["car"](__GS11);
entry;
res=(function(target){
   var $$TMP274;
$$TMP274=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("match"))),target,$$root["first"](entry));
return $$TMP274;
}
)(s);
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP273=recur();
return $$TMP273;
}
)();
}
else{
   $$TMP269=(function(){
      var $$TMP275;
      _=__GS9;
      _;
      var $$TMP276;
      if(res){
         $$TMP276=(function(){
            var $$TMP277;
            s=(function(target){
               var $$TMP278;
$$TMP278=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substring"))),target,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
return $$TMP278;
}
)(s);
s;
var $$TMP279;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP279=(function(){
      var $$TMP280;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP281;
   var $$TMP282;
   if(c){
      $$TMP282=c;
   }
   else{
$$TMP282=$$root["second"](entry);
}
$$TMP281=$$TMP282;
return $$TMP281;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP280=toks;
return $$TMP280;
}
)();
}
else{
   $$TMP279=undefined;
}
$$TMP279;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP277=pos;
return $$TMP277;
}
)();
}
else{
$$TMP276=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP276;
$$TMP275=__GS9;
return $$TMP275;
}
)();
}
$$TMP268=$$TMP269;
return $$TMP268;
}
);
recur;
$$TMP267=recur();
return $$TMP267;
}
)([]);
return $$TMP266;
}
)(undefined,false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[],undefined);
$$TMP265=recur();
return $$TMP265;
}
)();
}
else{
   $$TMP264=undefined;
}
$$TMP263=$$TMP264;
return $$TMP263;
}
);
recur;
$$TMP262=recur();
return $$TMP262;
}
)([]);
$$TMP261=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP261;
}
)([],0,src);
return $$TMP260;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP283;
   $$TMP283=(function(self){
      var $$TMP284;
$$TMP284=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP284;
}
)(this);
return $$TMP283;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP285;
   $$TMP285=(function(self){
      var $$TMP286;
$$TMP286=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP286;
}
)(this);
return $$TMP285;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP287;
   $$TMP287=(function(self){
      var $$TMP288;
      $$TMP288=(function(curr){
         var $$TMP289;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP289=curr;
return $$TMP289;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP288;
}
)(this);
return $$TMP287;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP290;
   $$TMP290=(function(target){
      var $$TMP291;
$$TMP291=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("stringify"))),target,s);
return $$TMP291;
}
)($$root["JSON"]);
return $$TMP290;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP292;
   $$TMP292=(function(target){
      var $$TMP293;
$$TMP293=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse"))),target,s);
return $$TMP293;
}
)($$root["JSON"]);
return $$TMP292;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP294;
   $$TMP294=(function(self){
      var $$TMP295;
      $$TMP295=(function(tok){
         var $$TMP297;
         $$TMP297=(function(__GS12){
            var $$TMP298;
            var $$TMP299;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
   $$TMP299=(function(target){
      var $$TMP300;
$$TMP300=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-list"))),target);
return $$TMP300;
}
)(self);
}
else{
   var $$TMP301;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP301=true;
}
else{
   var $$TMP302;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP302=false;
}
else{
   var $$TMP303;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP303=[];
}
else{
   var $$TMP304;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP304=undefined;
}
else{
   var $$TMP305;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP305=$$root["parseFloat"]((function(target){
   var $$TMP306;
$$TMP306=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("text"))),target);
return $$TMP306;
}
)(tok));
}
else{
   var $$TMP307;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP307=$$root["unescape-str"]((function(target){
   var $$TMP308;
$$TMP308=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("text"))),target);
return $$TMP308;
}
)(tok));
}
else{
   var $$TMP309;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP309=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]((function(target){
   var $$TMP310;
$$TMP310=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP310;
}
)(self)));
}
else{
   var $$TMP311;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
   $$TMP311=(function(target){
      var $$TMP312;
$$TMP312=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-backquoted-expr"))),target);
return $$TMP312;
}
)(self);
}
else{
   var $$TMP313;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP313=$$root["symbol"]((function(target){
   var $$TMP314;
$$TMP314=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("text"))),target);
return $$TMP314;
}
)(tok));
}
else{
   var $$TMP315;
   if(true){
$$TMP315=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP315=undefined;
}
$$TMP313=$$TMP315;
}
$$TMP311=$$TMP313;
}
$$TMP309=$$TMP311;
}
$$TMP307=$$TMP309;
}
$$TMP305=$$TMP307;
}
$$TMP304=$$TMP305;
}
$$TMP303=$$TMP304;
}
$$TMP302=$$TMP303;
}
$$TMP301=$$TMP302;
}
$$TMP299=$$TMP301;
}
$$TMP298=$$TMP299;
return $$TMP298;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP297;
}
)((function(target){
   var $$TMP296;
$$TMP296=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP296;
}
)(self));
return $$TMP295;
}
)(this);
return $$TMP294;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP316;
   $$TMP316=(function(self){
      var $$TMP317;
      $$TMP317=(function(__GS13,__GS14,lst){
         var $$TMP318;
         $$TMP318=(function(recur){
            var $$TMP319;
            recur=(function(){
               var $$TMP320;
               var $$TMP321;
               var $$TMP322;
               var $$TMP323;
$$root["t"]=$$root["geti"]((function(target){
   var $$TMP324;
$$TMP324=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP324;
}
)(self),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP325;
$$root["t"]=$$root["geti"]((function(target){
   var $$TMP326;
$$TMP326=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP326;
}
)(self),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP325=true;
}
else{
   $$TMP325=false;
}
$$TMP323=$$TMP325;
}
else{
   $$TMP323=false;
}
if($$TMP323){
   $$TMP322=true;
}
else{
   $$TMP322=false;
}
if($$TMP322){
   $$TMP321=(function(){
      var $$TMP327;
__GS14=$$root["cons"]((function(target){
   var $$TMP328;
$$TMP328=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP328;
}
)(self),__GS14);
__GS13=__GS14;
__GS13;
$$TMP327=recur();
return $$TMP327;
}
)();
}
else{
   $$TMP321=(function(){
      var $$TMP329;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP330;
if($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP331;
$$TMP331=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP331;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP330=lst;
}
else{
$$TMP330=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP330;
$$TMP329=__GS13;
return $$TMP329;
}
)();
}
$$TMP320=$$TMP321;
return $$TMP320;
}
);
recur;
$$TMP319=recur();
return $$TMP319;
}
)([]);
return $$TMP318;
}
)(undefined,[],undefined);
return $$TMP317;
}
)(this);
return $$TMP316;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP332;
   $$TMP332=(function(self){
      var $$TMP333;
      $$TMP333=(function(__GS15,__GS16,lst){
         var $$TMP334;
         $$TMP334=(function(recur){
            var $$TMP335;
            recur=(function(){
               var $$TMP336;
               var $$TMP337;
               var $$TMP338;
               var $$TMP339;
if($$root["not"]($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP340;
$$TMP340=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP340;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP341;
if($$root["not"]($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP342;
$$TMP342=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP342;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP341=true;
}
else{
   $$TMP341=false;
}
$$TMP339=$$TMP341;
}
else{
   $$TMP339=false;
}
if($$TMP339){
   $$TMP338=true;
}
else{
   $$TMP338=false;
}
if($$TMP338){
   $$TMP337=(function(){
      var $$TMP343;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP345;
   var $$TMP346;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP346=(function(){
      var $$TMP347;
      (function(target){
         var $$TMP348;
$$TMP348=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP348;
}
)(self);
$$TMP347=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]((function(target){
   var $$TMP349;
$$TMP349=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP349;
}
)(self)));
return $$TMP347;
}
)();
}
else{
   var $$TMP350;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP350=(function(){
      var $$TMP351;
      (function(target){
         var $$TMP352;
$$TMP352=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP352;
}
)(self);
$$TMP351=(function(target){
   var $$TMP353;
$$TMP353=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP353;
}
)(self);
return $$TMP351;
}
)();
}
else{
   var $$TMP354;
   if(true){
$$TMP354=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]((function(target){
   var $$TMP355;
$$TMP355=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-backquoted-expr"))),target);
return $$TMP355;
}
)(self)));
}
else{
   $$TMP354=undefined;
}
$$TMP350=$$TMP354;
}
$$TMP346=$$TMP350;
}
$$TMP345=$$TMP346;
return $$TMP345;
}
)($$root["geti"]((function(target){
   var $$TMP344;
$$TMP344=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP344;
}
)(self),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP343=recur();
return $$TMP343;
}
)();
}
else{
   $$TMP337=(function(){
      var $$TMP356;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP357;
if($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP358;
$$TMP358=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP358;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP357=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP357=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP357;
$$TMP356=__GS15;
return $$TMP356;
}
)();
}
$$TMP336=$$TMP337;
return $$TMP336;
}
);
recur;
$$TMP335=recur();
return $$TMP335;
}
)([]);
return $$TMP334;
}
)(undefined,[],undefined);
return $$TMP333;
}
)(this);
return $$TMP332;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP359;
   $$TMP359=(function(self){
      var $$TMP360;
      var $$TMP361;
if($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP362;
$$TMP362=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP362;
}
)(self),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP361=(function(){
      var $$TMP363;
      (function(target){
         var $$TMP364;
$$TMP364=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("consume-tok"))),target);
return $$TMP364;
}
)(self);
$$TMP363=(function(target){
   var $$TMP365;
$$TMP365=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-backquoted-list"))),target);
return $$TMP365;
}
)(self);
return $$TMP363;
}
)();
}
else{
$$TMP361=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]((function(target){
   var $$TMP366;
$$TMP366=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP366;
}
)(self)));
}
$$TMP360=$$TMP361;
return $$TMP360;
}
)(this);
return $$TMP359;
}
));
$$root["parse"]=(function(toks){
   var $$TMP367;
   $$TMP367=(function(p){
      var $$TMP368;
      $$TMP368=(function(__GS18,__GS19){
         var $$TMP369;
         $$TMP369=(function(recur){
            var $$TMP370;
            recur=(function(){
               var $$TMP371;
               var $$TMP372;
               var $$TMP373;
if($$root["not"]($$root["equal?"]($$root["geti"]((function(target){
   var $$TMP374;
$$TMP374=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("peek-tok"))),target);
return $$TMP374;
}
)(p),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP373=true;
}
else{
   $$TMP373=false;
}
if($$TMP373){
   $$TMP372=(function(){
      var $$TMP375;
__GS19=$$root["cons"]((function(target){
   var $$TMP376;
$$TMP376=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("parse-expr"))),target);
return $$TMP376;
}
)(p),__GS19);
__GS18=__GS19;
__GS18;
$$TMP375=recur();
return $$TMP375;
}
)();
}
else{
   $$TMP372=(function(){
      var $$TMP377;
__GS18=$$root["reverse"](__GS19);
$$TMP377=__GS18;
return $$TMP377;
}
)();
}
$$TMP371=$$TMP372;
return $$TMP371;
}
);
recur;
$$TMP370=recur();
return $$TMP370;
}
)([]);
return $$TMP369;
}
)(undefined,[]);
return $$TMP368;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP367;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP378;
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
$$TMP378=__GS20;
return $$TMP378;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP379;
   $$TMP379=(function(target){
      var $$TMP380;
$$TMP380=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("keys"))),target,obj);
return $$TMP380;
}
)($$root["Object"]);
return $$TMP379;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",(function(target){var $$TMP381;$$TMP381=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("join"))),target,"|\\");return $$TMP381;})($$root["keys"]($$root["mangling-table"]))),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP382;$$TMP382=$$root["geti"]($$root["mangling-table"],x);return $$TMP382;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP383;$$TMP383=(function(target){var $$TMP384;$$TMP384=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["mangling-rx"],$$root["mangle"]);return $$TMP384;})(name);return $$TMP383;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){var $$TMP385;$$TMP385=(function(self){var $$TMP386;$$TMP386=(function(__GS21){var $$TMP387;$$root["seti!"](__GS21,"root",root);$$root["seti!"](__GS21,"next-var-suffix",0);$$TMP387=__GS21;return $$TMP387;})(self);return $$TMP386;})(this);return $$TMP385;}));$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP388;$$TMP388=(function(self){var $$TMP389;$$TMP389=(function(out){var $$TMP390;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP390=out;return $$TMP390;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP389;})(this);return $$TMP388;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP391;var $$TMP392;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP392=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP392=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP391=$$TMP392;
return $$TMP391;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP393;
   $$TMP393=(function(self){
      var $$TMP394;
      var $$TMP395;
if($$root["="](x,true)){
$$TMP395=$$root["list"]("true","");
}
else{
   var $$TMP396;
if($$root["="](x,false)){
$$TMP396=$$root["list"]("false","");
}
else{
   var $$TMP397;
if($$root["null?"](x)){
$$TMP397=$$root["list"]("[]","");
}
else{
   var $$TMP398;
if($$root["="](x,undefined)){
$$TMP398=$$root["list"]("undefined","");
}
else{
   var $$TMP399;
if($$root["symbol?"](x)){
$$TMP399=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP400;
if($$root["string?"](x)){
$$TMP400=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP401;
   if(true){
$$TMP401=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP401=undefined;
}
$$TMP400=$$TMP401;
}
$$TMP399=$$TMP400;
}
$$TMP398=$$TMP399;
}
$$TMP397=$$TMP398;
}
$$TMP396=$$TMP397;
}
$$TMP395=$$TMP396;
}
$$TMP394=$$TMP395;
return $$TMP394;
}
)(this);
return $$TMP393;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP402;
   $$TMP402=(function(self){
      var $$TMP403;
      $$TMP403=(function(__GS22){
         var $$TMP404;
         $$TMP404=(function(fun,args){
            var $$TMP405;
            $$TMP405=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP407;
$$TMP407=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP407;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),(function(target){
   var $$TMP406;
$$TMP406=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,fun);
return $$TMP406;
}
)(self));
return $$TMP405;
}
)($$root["nth"](0,__GS22),$$root["drop"](1,__GS22));
return $$TMP404;
}
)(lst);
return $$TMP403;
}
)(this);
return $$TMP402;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP408;
   $$TMP408=(function(self){
      var $$TMP409;
      $$TMP409=(function(compiled__MINUSbody,reducer){
         var $$TMP411;
$$TMP411=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP411;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP410;
$$TMP410=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP410;
}
));
return $$TMP409;
}
)(this);
return $$TMP408;
}
));
$$root["process-args"]=(function(args){
   var $$TMP412;
$$TMP412=$$root["join"](",",$$root["reverse"]($$root["reduce"]((function(accum,v){
   var $$TMP413;
   var $$TMP414;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP414=$$root["str"]("...",$$root["mangle-name"]((function(target){
   var $$TMP415;
$$TMP415=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP415;
}
)($$root["geti"](v,(new $$root.Symbol("name"))))));
}
else{
$$TMP414=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
}
$$TMP413=$$root["cons"]($$TMP414,accum);
return $$TMP413;
}
),args,[])));
return $$TMP412;
}
);
$$root["process-args"];
$$root["lexical-name"]=(function(sym){
   var $$TMP416;
   var $$TMP417;
if($$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&")){
$$TMP417=$$root["mangle-name"]((function(target){
   var $$TMP418;
$$TMP418=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP418;
}
)($$root["geti"](sym,(new $$root.Symbol("name")))));
}
else{
$$TMP417=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));
}
$$TMP416=$$TMP417;
return $$TMP416;
}
);
$$root["lexical-name"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP419;
   $$TMP419=(function(self){
      var $$TMP420;
      $$TMP420=(function(__GS23){
         var $$TMP421;
         $$TMP421=(function(__GS24){
            var $$TMP422;
            $$TMP422=(function(args,body){
               var $$TMP423;
               $$TMP423=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP426;
                  $$TMP426=(function(compiled__MINUSbody){
                     var $$TMP428;
$$TMP428=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{","var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP428;
}
)((function(target){
   var $$TMP427;
$$TMP427=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-body-helper"))),target,lexenv2,body,ret__MINUSvar__MINUSname);
return $$TMP427;
}
)(self));
return $$TMP426;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP424;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP424=accum;
return $$TMP424;
}
),args,$$root["object"](lexenv)),(function(target){
   var $$TMP425;
$$TMP425=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("gen-var-name"))),target);
return $$TMP425;
}
)(self));
return $$TMP423;
}
)($$root["drop"](0,__GS24),$$root["drop"](2,__GS23));
return $$TMP422;
}
)($$root["nth"](1,__GS23));
return $$TMP421;
}
)(lst);
return $$TMP420;
}
)(this);
return $$TMP419;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP429;
   $$TMP429=(function(self){
      var $$TMP430;
      $$TMP430=(function(__GS25){
         var $$TMP431;
         $$TMP431=(function(c,t,f){
            var $$TMP432;
            $$TMP432=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP437;
$$TMP437=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP437;
}
)((function(target){
   var $$TMP433;
$$TMP433=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("gen-var-name"))),target);
return $$TMP433;
}
)(self),(function(target){
   var $$TMP434;
$$TMP434=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,c);
return $$TMP434;
}
)(self),(function(target){
   var $$TMP435;
$$TMP435=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,t);
return $$TMP435;
}
)(self),(function(target){
   var $$TMP436;
$$TMP436=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,f);
return $$TMP436;
}
)(self));
return $$TMP432;
}
)($$root["nth"](1,__GS25),$$root["nth"](2,__GS25),$$root["nth"](3,__GS25));
return $$TMP431;
}
)(lst);
return $$TMP430;
}
)(this);
return $$TMP429;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP438;
   $$TMP438=(function(self){
      var $$TMP439;
      var $$TMP440;
if($$root["symbol?"](x)){
$$TMP440=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
   $$TMP440=(function(target){
      var $$TMP441;
$$TMP441=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-atom"))),target,lexenv,x);
return $$TMP441;
}
)(self);
}
$$TMP439=$$TMP440;
return $$TMP439;
}
)(this);
return $$TMP438;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP442;
   $$TMP442=(function(self){
      var $$TMP443;
$$TMP443=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP443;
}
)(this);
return $$TMP442;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP444;
   $$TMP444=(function(self){
      var $$TMP445;
      var $$TMP446;
if($$root["atom?"](x)){
   $$TMP446=(function(target){
      var $$TMP447;
$$TMP447=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-quoted-atom"))),target,lexenv,x);
return $$TMP447;
}
)(self);
}
else{
   $$TMP446=(function(target){
      var $$TMP448;
$$TMP448=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-quoted-list"))),target,lexenv,x);
return $$TMP448;
}
)(self);
}
$$TMP445=$$TMP446;
return $$TMP445;
}
)(this);
return $$TMP444;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP449;
   $$TMP449=(function(self){
      var $$TMP450;
      $$TMP450=(function(__GS26){
         var $$TMP451;
         $$TMP451=(function(name,value){
            var $$TMP452;
            $$TMP452=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP454;
$$TMP454=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP454;
}
)($$root["compile-time-resolve"](lexenv,name),(function(target){
   var $$TMP453;
$$TMP453=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,value);
return $$TMP453;
}
)(self));
return $$TMP452;
}
)($$root["nth"](1,__GS26),$$root["nth"](2,__GS26));
return $$TMP451;
}
)(lst);
return $$TMP450;
}
)(this);
return $$TMP449;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP455;
   $$TMP455=(function(self){
      var $$TMP456;
      $$TMP456=(function(__GS27){
         var $$TMP457;
         $$TMP457=(function(name,args){
            var $$TMP458;
            $$TMP458=(function(tmp){
               var $$TMP461;
               $$TMP461=(function(target){
                  var $$TMP462;
$$TMP462=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("jeval"))),target,$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP462;
}
)($$root["geti"](self,(new $$root.Symbol("root"))));
return $$TMP461;
}
)((function(target){
   var $$TMP459;
$$TMP459=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-funcall"))),target,lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP460;
$$TMP460=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP460;
}
),args)));
return $$TMP459;
}
)(self));
return $$TMP458;
}
)($$root["nth"](0,__GS27),$$root["drop"](1,__GS27));
return $$TMP457;
}
)(expr);
return $$TMP456;
}
)(this);
return $$TMP455;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP463;
   $$TMP463=(function(self){
      var $$TMP464;
      var $$TMP465;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP466;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
   $$TMP466=true;
}
else{
   $$TMP466=false;
}
$$TMP465=$$TMP466;
}
else{
   $$TMP465=false;
}
$$TMP464=$$TMP465;
return $$TMP464;
}
)(this);
return $$TMP463;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP467;
   $$TMP467=(function(self){
      var $$TMP468;
      var $$TMP469;
      var $$TMP470;
if($$root["list?"](expr)){
   var $$TMP471;
if($$root["not"]($$root["null?"](expr))){
   $$TMP471=true;
}
else{
   $$TMP471=false;
}
$$TMP470=$$TMP471;
}
else{
   $$TMP470=false;
}
if($$TMP470){
   $$TMP469=(function(first){
      var $$TMP472;
      var $$TMP473;
if($$root["symbol?"](first)){
   $$TMP473=(function(__GS28){
      var $$TMP474;
      var $$TMP475;
if($$root["equal?"](__GS28,(new $$root.Symbol("lambda")))){
   $$TMP475=(function(target){
      var $$TMP476;
$$TMP476=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-lambda"))),target,lexenv,expr);
return $$TMP476;
}
)(self);
}
else{
   var $$TMP477;
if($$root["equal?"](__GS28,(new $$root.Symbol("if")))){
   $$TMP477=(function(target){
      var $$TMP478;
$$TMP478=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-if"))),target,lexenv,expr);
return $$TMP478;
}
)(self);
}
else{
   var $$TMP479;
if($$root["equal?"](__GS28,(new $$root.Symbol("quote")))){
   $$TMP479=(function(target){
      var $$TMP480;
$$TMP480=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-quoted"))),target,lexenv,$$root["second"](expr));
return $$TMP480;
}
)(self);
}
else{
   var $$TMP481;
if($$root["equal?"](__GS28,(new $$root.Symbol("setv!")))){
   $$TMP481=(function(target){
      var $$TMP482;
$$TMP482=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-setv"))),target,lexenv,expr);
return $$TMP482;
}
)(self);
}
else{
   var $$TMP483;
if($$root["equal?"](__GS28,(new $$root.Symbol("def")))){
   $$TMP483=(function(target){
      var $$TMP484;
$$TMP484=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-setv"))),target,lexenv,expr);
return $$TMP484;
}
)(self);
}
else{
   var $$TMP485;
   if(true){
      var $$TMP486;
      if((function(target){
         var $$TMP487;
$$TMP487=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("is-macro"))),target,$$root["geti"](first,(new $$root.Symbol("name"))));
return $$TMP487;
}
)(self)){
   $$TMP486=(function(target){
      var $$TMP488;
$$TMP488=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,(function(target){
   var $$TMP489;
$$TMP489=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("macroexpand-unsafe"))),target,lexenv,expr);
return $$TMP489;
}
)(self));
return $$TMP488;
}
)(self);
}
else{
   $$TMP486=(function(target){
      var $$TMP490;
$$TMP490=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-funcall"))),target,lexenv,expr);
return $$TMP490;
}
)(self);
}
$$TMP485=$$TMP486;
}
else{
   $$TMP485=undefined;
}
$$TMP483=$$TMP485;
}
$$TMP481=$$TMP483;
}
$$TMP479=$$TMP481;
}
$$TMP477=$$TMP479;
}
$$TMP475=$$TMP477;
}
$$TMP474=$$TMP475;
return $$TMP474;
}
)(first);
}
else{
   $$TMP473=(function(target){
      var $$TMP491;
$$TMP491=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-funcall"))),target,lexenv,expr);
return $$TMP491;
}
)(self);
}
$$TMP472=$$TMP473;
return $$TMP472;
}
)($$root["car"](expr));
}
else{
   $$TMP469=(function(target){
      var $$TMP492;
$$TMP492=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-atom"))),target,lexenv,expr);
return $$TMP492;
}
)(self);
}
$$TMP468=$$TMP469;
return $$TMP468;
}
)(this);
return $$TMP467;
}
));
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP493;
   $$TMP493=(function(self){
      var $$TMP494;
      $$TMP494=(function(root,sandbox){
         var $$TMP495;
$$root["seti!"](sandbox,"$$root",root);
(function(target){
   var $$TMP496;
$$TMP496=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("createContext"))),target,sandbox);
return $$TMP496;
}
)($$root["VM"]);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP497;
   $$TMP497=(function(target){
      var $$TMP498;
$$TMP498=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("runInContext"))),target,str,sandbox);
return $$TMP498;
}
)($$root["VM"]);
return $$TMP497;
}
));
$$TMP495=(function(__GS29){
   var $$TMP499;
$$root["seti!"](__GS29,"root",root);
$$root["seti!"](__GS29,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP499=__GS29;
return $$TMP499;
}
)(self);
return $$TMP495;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP494;
}
)(this);
return $$TMP493;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP500;
   $$TMP500=(function(self){
      var $$TMP501;
      $$TMP501=(function(tmp){
         var $$TMP503;
         $$TMP503=(function(target){
            var $$TMP504;
$$TMP504=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("jeval"))),target,$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP504;
}
)($$root["geti"](self,(new $$root.Symbol("root"))));
return $$TMP503;
}
)((function(target){
   var $$TMP502;
$$TMP502=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,$$root["object"](),expr);
return $$TMP502;
}
)($$root["geti"](self,(new $$root.Symbol("compiler")))));
return $$TMP501;
}
)(this);
return $$TMP500;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP505;
   $$TMP505=(function(self){
      var $$TMP506;
      $$TMP506=(function(forms){
         var $$TMP507;
         $$TMP507=(function(__GS30,__GS31,form){
            var $$TMP508;
            $$TMP508=(function(recur){
               var $$TMP509;
               recur=(function(){
                  var $$TMP510;
                  var $$TMP511;
                  var $$TMP512;
if($$root["not"]($$root["null?"](__GS31))){
   $$TMP512=true;
}
else{
   $$TMP512=false;
}
if($$TMP512){
   $$TMP511=(function(){
      var $$TMP513;
form=$$root["car"](__GS31);
form;
__GS30=(function(target){
   var $$TMP514;
$$TMP514=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("eval"))),target,form);
return $$TMP514;
}
)(self);
__GS30;
__GS31=$$root["cdr"](__GS31);
__GS31;
$$TMP513=recur();
return $$TMP513;
}
)();
}
else{
   $$TMP511=(function(){
      var $$TMP515;
      $$TMP515=__GS30;
      return $$TMP515;
   }
   )();
}
$$TMP510=$$TMP511;
return $$TMP510;
}
);
recur;
$$TMP509=recur();
return $$TMP509;
}
)([]);
return $$TMP508;
}
)(undefined,forms,[]);
return $$TMP507;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP506;
}
)(this);
return $$TMP505;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP516;
   $$TMP516=(function(self){
      var $$TMP517;
$$TMP517=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["str"]($$root["second"](compilation__MINUSresult),$$root["first"](compilation__MINUSresult)));
return $$TMP517;
}
)(this);
return $$TMP516;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP518;
   $$TMP518=(function(self){
      var $$TMP519;
      $$TMP519=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP520;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP521;
   $$TMP521=(function(r){
      var $$TMP522;
      var $$TMP523;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   $$TMP523=(function(){
      var $$TMP524;
      r=(function(target){
         var $$TMP525;
$$TMP525=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("jeval"))),target,$$root["geti"](r,(new $$root.Symbol("code"))));
return $$TMP525;
}
)(root);
r;
$$TMP524=$$root["seti!"](target,name,r);
return $$TMP524;
}
)();
}
else{
   $$TMP523=undefined;
}
$$TMP523;
$$TMP522=r;
return $$TMP522;
}
)($$root["geti"](target,name));
return $$TMP521;
}
));
$$root["seti!"](sandbox,"$$root",$$root["new"]($$root["Proxy"],root,handler));
(function(target){
   var $$TMP526;
$$TMP526=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("createContext"))),target,sandbox);
return $$TMP526;
}
)($$root["VM"]);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP527;
   $$TMP527=(function(target){
      var $$TMP528;
$$TMP528=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("runInContext"))),target,str,sandbox);
return $$TMP528;
}
)($$root["VM"]);
return $$TMP527;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP529;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP529=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP529;
}
));
$$TMP520=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP520;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP519;
}
)(this);
return $$TMP518;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP530;
   $$TMP530=(function(self){
      var $$TMP531;
      $$TMP531=(function(lexenv){
         var $$TMP532;
         $$TMP532=(function(__GS32){
            var $$TMP533;
            var $$TMP534;
if($$root["matches?"](__GS32,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("def")),[])),$$root.cons((new $$root.Symbol("name")),$$root.cons((new $$root.Symbol("val")),[]))))){
   $$TMP534=(function(__GS33){
      var $$TMP535;
      $$TMP535=(function(name,val){
         var $$TMP536;
         $$TMP536=(function(tmp){
            var $$TMP538;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP538=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP538;
}
)((function(target){
   var $$TMP537;
$$TMP537=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,e);
return $$TMP537;
}
)(self));
return $$TMP536;
}
)($$root["nth"](1,__GS33),$$root["nth"](2,__GS33));
return $$TMP535;
}
)(__GS32);
}
else{
   var $$TMP539;
if($$root["matches?"](__GS32,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("setmac!")),[])),$$root.cons((new $$root.Symbol("name")),[])))){
   $$TMP539=(function(__GS34){
      var $$TMP540;
      $$TMP540=(function(name){
         var $$TMP541;
         $$TMP541=(function(tmp){
            var $$TMP543;
            (function(target){
               var $$TMP544;
$$TMP544=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("jeval"))),target,$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP544;
}
)($$root["geti"](self,(new $$root.Symbol("root"))));
$$TMP543=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP543;
}
)((function(target){
   var $$TMP542;
$$TMP542=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,e);
return $$TMP542;
}
)(self));
return $$TMP541;
}
)($$root["nth"](1,__GS34));
return $$TMP540;
}
)(__GS32);
}
else{
   var $$TMP545;
if($$root["matches?"](__GS32,$$root.cons($$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("lambda")),[])),$$root.cons($$root.cons((new $$root.Symbol("&args")),[]),$$root.cons((new $$root.Symbol("&body")),[]))),[]))){
   $$TMP545=(function(__GS35){
      var $$TMP546;
      $$TMP546=(function(__GS36){
         var $$TMP547;
         $$TMP547=(function(__GS37){
            var $$TMP548;
            $$TMP548=(function(args,body){
               var $$TMP549;
$$TMP549=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP549;
}
)($$root["drop"](0,__GS37),$$root["drop"](2,__GS36));
return $$TMP548;
}
)($$root["nth"](1,__GS36));
return $$TMP547;
}
)($$root["nth"](0,__GS35));
return $$TMP546;
}
)(__GS32);
}
else{
   var $$TMP550;
if($$root["matches?"](__GS32,$$root.cons((new $$root.Symbol("name")),$$root.cons((new $$root.Symbol("&args")),[])))){
   $$TMP550=(function(__GS38){
      var $$TMP551;
      $$TMP551=(function(name,args){
         var $$TMP552;
         var $$TMP553;
         if((function(target){
            var $$TMP554;
$$TMP554=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("is-macro"))),target,name);
return $$TMP554;
}
)(self)){
   $$TMP553=(function(target){
      var $$TMP555;
$$TMP555=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile-toplevel"))),target,(function(target){
   var $$TMP556;
$$TMP556=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("macroexpand-unsafe"))),target,lexenv,e);
return $$TMP556;
}
)(self));
return $$TMP555;
}
)(self);
}
else{
   $$TMP553=(function(tmp){
      var $$TMP558;
$$TMP558=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP558;
}
)((function(target){
   var $$TMP557;
$$TMP557=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,e);
return $$TMP557;
}
)(self));
}
$$TMP552=$$TMP553;
return $$TMP552;
}
)($$root["nth"](0,__GS38),$$root["drop"](1,__GS38));
return $$TMP551;
}
)(__GS32);
}
else{
   var $$TMP559;
if($$root["matches?"](__GS32,(new $$root.Symbol("any")))){
   $$TMP559=(function(any){
      var $$TMP560;
      $$TMP560=(function(tmp){
         var $$TMP562;
$$TMP562=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP562;
}
)((function(target){
   var $$TMP561;
$$TMP561=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("compile"))),target,lexenv,e);
return $$TMP561;
}
)(self));
return $$TMP560;
}
)(__GS32);
}
else{
   var $$TMP563;
   if(true){
$$TMP563=$$root["error"]("Fell out of case!");
}
else{
   $$TMP563=undefined;
}
$$TMP559=$$TMP563;
}
$$TMP550=$$TMP559;
}
$$TMP545=$$TMP550;
}
$$TMP539=$$TMP545;
}
$$TMP534=$$TMP539;
}
$$TMP533=$$TMP534;
return $$TMP533;
}
)(e);
return $$TMP532;
}
)($$root["object"]());
return $$TMP531;
}
)(this);
return $$TMP530;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP564;
   $$TMP564=(function(self){
      var $$TMP565;
$$TMP565=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP565;
}
)(this);
return $$TMP564;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
