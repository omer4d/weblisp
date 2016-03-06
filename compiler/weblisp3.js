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
)($$root["object"]($$root["geti"](constructor,(new $$root.Symbol("prototype")))));
return $$TMP90;
}
);
$$root["new"];
$$root["call-method-by-name"]=(function(obj,name,...args){
   var $$TMP92;
$$TMP92=$$root["apply-method"]($$root["geti"](obj,name),obj,args);
return $$TMP92;
}
);
$$root["call-method-by-name"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP93;
   var $$TMP94;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP94=obj__MINUSname;
}
else{
   var $$TMP95;
if($$root["list?"]($$root["car"](reversed__MINUSfields))){
$$TMP95=$$root["concat"]($$root["list"]((new $$root.Symbol("call-method-by-name"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"]($$root["car"](reversed__MINUSfields))))),$$root["cdr"]($$root["car"](reversed__MINUSfields)));
}
else{
$$TMP95=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP94=$$TMP95;
}
$$TMP93=$$TMP94;
return $$TMP93;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP96;
$$TMP96=$$root["dot-helper"](obj__MINUSname,$$root["reverse"](fields));
return $$TMP96;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["prototype?"]=(function(p,o){
   var $$TMP97;
$$TMP97=$$root["call-method-by-name"](p,(new $$root.Symbol("isPrototypeOf")),o);
return $$TMP97;
}
);
$$root["prototype?"];
$$root["equal?"]=(function(a,b){
   var $$TMP98;
   var $$TMP99;
if($$root["null?"](a)){
$$TMP99=$$root["null?"](b);
}
else{
   var $$TMP100;
if($$root["symbol?"](a)){
   var $$TMP101;
if($$root["symbol?"](b)){
   var $$TMP102;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
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
   var $$TMP103;
if($$root["atom?"](a)){
$$TMP103=$$root["="](a,b);
}
else{
   var $$TMP104;
if($$root["list?"](a)){
   var $$TMP105;
if($$root["list?"](b)){
   var $$TMP106;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP107;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP107=true;
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
   $$TMP105=false;
}
$$TMP104=$$TMP105;
}
else{
   $$TMP104=undefined;
}
$$TMP103=$$TMP104;
}
$$TMP100=$$TMP103;
}
$$TMP99=$$TMP100;
}
$$TMP98=$$TMP99;
return $$TMP98;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP108;
   $$TMP108=(function(res){
      var $$TMP114;
$$TMP114=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP114;
}
)((function(recur){
   var $$TMP109;
   recur=(function(l1,l2){
      var $$TMP110;
      var $$TMP111;
      if((function(c){
         var $$TMP112;
         var $$TMP113;
         if(c){
            $$TMP113=c;
         }
         else{
$$TMP113=p($$root["car"](l2));
}
$$TMP112=$$TMP113;
return $$TMP112;
}
)($$root["null?"](l2))){
$$TMP111=$$root["list"](l1,l2);
}
else{
$$TMP111=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP110=$$TMP111;
return $$TMP110;
}
);
recur;
$$TMP109=recur([],lst);
return $$TMP109;
}
)([]));
return $$TMP108;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP115;
   var $$TMP116;
if($$root["reduce"]((function(accum,v){
   var $$TMP117;
   var $$TMP118;
   if(accum){
      $$TMP118=accum;
   }
   else{
      $$TMP118=v;
   }
   $$TMP117=$$TMP118;
   return $$TMP117;
}
),lst,false)){
   $$TMP116=true;
}
else{
   $$TMP116=false;
}
$$TMP115=$$TMP116;
return $$TMP115;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP119;
$$TMP119=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP120;
   var $$TMP121;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP122;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP122=true;
}
else{
   $$TMP122=false;
}
$$TMP121=$$TMP122;
}
else{
   $$TMP121=false;
}
$$TMP120=$$TMP121;
return $$TMP120;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP119;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP123;
   $$TMP123=(function(binding__MINUSnames){
      var $$TMP124;
      $$TMP124=(function(divs){
         var $$TMP126;
         var $$TMP127;
if($$root["null?"]($$root["second"](divs))){
$$TMP127=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP127=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP126=$$TMP127;
return $$TMP126;
}
)($$root["split"]((function(pair){
   var $$TMP125;
$$TMP125=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP125;
}
),binding__MINUSpairs));
return $$TMP124;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP123;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP128;
$$TMP128=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP128;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP129;
   $$TMP129=(function(x){
      var $$TMP130;
$$TMP130=$$root["not"](f(x));
return $$TMP130;
}
);
return $$TMP129;
}
);
$$root["complement"];
$$root["compose"]=(function(f1,f2){
   var $$TMP131;
   $$TMP131=(function(...args){
      var $$TMP132;
$$TMP132=f1($$root["apply"](f2,args));
return $$TMP132;
}
);
return $$TMP131;
}
);
$$root["compose"];
$$root["partial"]=(function(f,...args1){
   var $$TMP133;
   $$TMP133=(function(...args2){
      var $$TMP134;
$$TMP134=$$root["apply"](f,$$root["concat"](args1,args2));
return $$TMP134;
}
);
return $$TMP133;
}
);
$$root["partial"];
$$root["partial-method"]=(function(obj,method__MINUSfield,...args1){
   var $$TMP135;
   $$TMP135=(function(...args2){
      var $$TMP136;
$$TMP136=$$root["apply-method"]($$root["geti"](obj,method__MINUSfield),obj,$$root["concat"](args1,args2));
return $$TMP136;
}
);
return $$TMP135;
}
);
$$root["partial-method"];
$$root["format"]=(function(...args){
   var $$TMP137;
   $$TMP137=(function(rx){
      var $$TMP138;
$$TMP138=$$root["call-method-by-name"]($$root["car"](args),(new $$root.Symbol("replace")),rx,(function(match){
   var $$TMP139;
$$TMP139=$$root["nth"]($$root["parseInt"]($$root["call-method-by-name"](match,(new $$root.Symbol("substring")),1)),$$root["cdr"](args));
return $$TMP139;
}
));
return $$TMP138;
}
)($$root["regex"]("%[0-9]+","gi"));
return $$TMP137;
}
);
$$root["format"];
$$root["case"]=(function(e,...pairs){
   var $$TMP140;
   $$TMP140=(function(e__MINUSname,def__MINUSidx){
      var $$TMP141;
      var $$TMP142;
if($$root["="](def__MINUSidx,-1)){
$$TMP142=$$root.list(((new $$root.Symbol("error")) ),("Fell out of case!" ));
}
else{
$$TMP142=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP141=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP143;
$$TMP143=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP144;
$$TMP144=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP144;
}
),$$root["filter"]((function(pair){
   var $$TMP145;
$$TMP145=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP145;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP143;
}
)($$TMP142,$$root["partition"](2,pairs));
return $$TMP141;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP140;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP146;
   $$TMP146=(function(expr__MINUSname){
      var $$TMP147;
$$TMP147=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP148;
   var $$TMP149;
if($$root["symbol?"](v)){
   var $$TMP150;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP150=$$root["concat"]($$root["list"]($$root["symbol"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP151;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP151=[];
}
else{
$$TMP151=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP150=$$TMP151;
}
$$TMP149=$$TMP150;
}
else{
$$TMP149=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP148=$$TMP149;
return $$TMP148;
}
),structure)));
return $$TMP147;
}
)($$root["gensym"]());
return $$TMP146;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP152;
   var $$TMP153;
if($$root["symbol?"](structure)){
$$TMP153=$$root["list"](structure,expr);
}
else{
$$TMP153=$$root["destruct-helper"](structure,expr);
}
$$TMP152=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP153),body);
return $$TMP152;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP154;
   var $$TMP155;
if($$root["list?"](expr)){
   var $$TMP156;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP156=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP156=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP155=$$TMP156;
}
else{
   $$TMP155=expr;
}
$$TMP154=$$TMP155;
return $$TMP154;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP157;
   var $$TMP158;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP158=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP159;
   var $$TMP160;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP161;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP161=true;
}
else{
   $$TMP161=false;
}
$$TMP160=$$TMP161;
}
else{
   $$TMP160=false;
}
if($$TMP160){
$$TMP159=$$root["list?"](expr);
}
else{
   var $$TMP162;
   if(true){
      var $$TMP163;
      var $$TMP164;
if($$root["list?"](expr)){
   var $$TMP165;
if($$root["not"]($$root["null?"](expr))){
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
   var $$TMP166;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP167;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP167=true;
}
else{
   $$TMP167=false;
}
$$TMP166=$$TMP167;
}
else{
   $$TMP166=false;
}
$$TMP163=$$TMP166;
}
else{
   $$TMP163=false;
}
$$TMP162=$$TMP163;
}
else{
   $$TMP162=undefined;
}
$$TMP159=$$TMP162;
}
$$TMP158=$$TMP159;
}
$$TMP157=$$TMP158;
return $$TMP157;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP168;
   var $$TMP169;
if($$root["null?"](patt)){
$$TMP169=$$root["null?"](expr);
}
else{
   var $$TMP170;
if($$root["list?"](patt)){
$$TMP170=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP171;
if($$root["symbol?"](patt)){
   $$TMP171=true;
}
else{
   var $$TMP172;
   if(true){
$$TMP172=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP172=undefined;
}
$$TMP171=$$TMP172;
}
$$TMP170=$$TMP171;
}
$$TMP169=$$TMP170;
}
$$TMP168=$$TMP169;
return $$TMP168;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP173;
   var $$TMP174;
   var $$TMP175;
if($$root["list?"](patt)){
   var $$TMP176;
if($$root["not"]($$root["null?"](patt))){
   $$TMP176=true;
}
else{
   $$TMP176=false;
}
$$TMP175=$$TMP176;
}
else{
   $$TMP175=false;
}
if($$TMP175){
   var $$TMP177;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP177=(new $$root.Symbol("_"));
}
else{
$$TMP177=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP174=$$TMP177;
}
else{
   $$TMP174=patt;
}
$$TMP173=$$TMP174;
return $$TMP173;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP178;
   $$TMP178=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP179;
$$TMP179=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP180;
$$TMP180=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP180;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP179;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP178;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP181;
   $$TMP181=(function(__GS1){
      var $$TMP182;
      var $$TMP183;
if($$root["matches?"](__GS1,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("geti")) )) ),((new $$root.Symbol("obj")) ),((new $$root.Symbol("field")) )))){
   $$TMP183=(function(__GS2){
      var $$TMP184;
      $$TMP184=(function(obj,field){
         var $$TMP185;
$$TMP185=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP185;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP184;
}
)(__GS1);
}
else{
   var $$TMP186;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP186=(function(any){
      var $$TMP187;
      var $$TMP188;
if($$root["symbol?"](any)){
$$TMP188=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP188=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP187=$$TMP188;
return $$TMP187;
}
)(__GS1);
}
else{
   var $$TMP189;
   if(true){
$$TMP189=$$root["error"]("Fell out of case!");
}
else{
   $$TMP189=undefined;
}
$$TMP186=$$TMP189;
}
$$TMP183=$$TMP186;
}
$$TMP182=$$TMP183;
return $$TMP182;
}
)($$root["macroexpand"](place));
return $$TMP181;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["inc!"]=(function(name,amt){
   var $$TMP190;
   amt=(function(c){
      var $$TMP191;
      var $$TMP192;
      if(c){
         $$TMP192=c;
      }
      else{
         $$TMP192=1;
      }
      $$TMP191=$$TMP192;
      return $$TMP191;
   }
   )(amt);
   amt;
$$TMP190=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP190;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP193;
   amt=(function(c){
      var $$TMP194;
      var $$TMP195;
      if(c){
         $$TMP195=c;
      }
      else{
         $$TMP195=1;
      }
      $$TMP194=$$TMP195;
      return $$TMP194;
   }
   )(amt);
   amt;
$$TMP193=$$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP193;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["push"]=(function(x,lst){
   var $$TMP196;
$$TMP196=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP196;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP197;
   var $$TMP198;
if($$root["null?"](forms)){
   $$TMP198=x;
}
else{
$$TMP198=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP197=$$TMP198;
return $$TMP197;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["doto"]=(function(obj__MINUSexpr,...body){
   var $$TMP199;
   $$TMP199=(function(binding__MINUSname){
      var $$TMP200;
$$TMP200=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](obj__MINUSexpr))),$$root["map"]((function(v){
   var $$TMP201;
   $$TMP201=(function(__GS3){
      var $$TMP202;
      $$TMP202=(function(f,args){
         var $$TMP203;
$$TMP203=$$root["cons"](f,$$root["cons"](binding__MINUSname,args));
return $$TMP203;
}
)($$root["nth"](0,__GS3),$$root["drop"](1,__GS3));
return $$TMP202;
}
)(v);
return $$TMP201;
}
),body),$$root["list"](binding__MINUSname));
return $$TMP200;
}
)($$root["gensym"]());
return $$TMP199;
}
);
$$root["doto"];
$$root["setmac!"]($$root["doto"]);
$$root["while"]=(function(c,...body){
   var $$TMP204;
$$TMP204=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP204;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP205;
$$TMP205=$$root["call-method-by-name"](lst,(new $$root.Symbol("sort")),cmp);
return $$TMP205;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP206;
   step=(function(c){
      var $$TMP207;
      var $$TMP208;
      if(c){
         $$TMP208=c;
      }
      else{
         $$TMP208=1;
      }
      $$TMP207=$$TMP208;
      return $$TMP207;
   }
   )(step);
   step;
   $$TMP206=(function(data){
      var $$TMP209;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP209=data;
return $$TMP209;
}
)($$root["object"]([]));
return $$TMP206;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP210;
   $$TMP210=(function(len__MINUSname,data){
      var $$TMP211;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP211=data;
return $$TMP211;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP210;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP212;
   $$TMP212=(function(lst__MINUSname,data){
      var $$TMP213;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP213=data;
return $$TMP213;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP212;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP214;
   $$TMP214=(function(__GS4){
      var $$TMP215;
      $$TMP215=(function(binding__MINUSname,__GS5){
         var $$TMP216;
         $$TMP216=(function(func__MINUSname,args){
            var $$TMP217;
$$TMP217=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP217;
}
)($$root["nth"](0,__GS5),$$root["drop"](1,__GS5));
return $$TMP216;
}
)($$root["nth"](1,__GS4),$$root["nth"](2,__GS4));
return $$TMP215;
}
)(form);
return $$TMP214;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP218;
   $$TMP218=(function(data){
      var $$TMP219;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP219=data;
return $$TMP219;
}
)($$root["object"]([]));
return $$TMP218;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP220;
   $$TMP220=(function(data){
      var $$TMP221;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP221=data;
return $$TMP221;
}
)($$root["object"]([]));
return $$TMP220;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(res__MINUSname,form){
   var $$TMP222;
   $$TMP222=(function(data){
      var $$TMP223;
      (function(__GS6){
         var $$TMP224;
         $$TMP224=(function(binding__MINUSname,body){
            var $$TMP225;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,undefined));
$$TMP225=$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cons"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"](res__MINUSname)),$$root["cdr"]($$root["cdr"](form))));
return $$TMP225;
}
)($$root["nth"](1,__GS6),$$root["drop"](2,__GS6));
return $$TMP224;
}
)(form);
$$TMP223=data;
return $$TMP223;
}
)($$root["object"]([]));
return $$TMP222;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP226;
   $$TMP226=(function(data){
      var $$TMP227;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP227=data;
return $$TMP227;
}
)($$root["object"]([]));
return $$TMP226;
}
);
$$root["iterate-compile-let"];
$$root["iterate-compile-collecting"]=(function(form){
   var $$TMP228;
   $$TMP228=(function(data,accum__MINUSname){
      var $$TMP229;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](accum__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](accum__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cons"))),$$root["list"]($$root["second"](form)),$$root["list"](accum__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("reverse"))),$$root["list"](accum__MINUSname)))));
$$TMP229=data;
return $$TMP229;
}
)($$root["object"]([]),$$root["gensym"]());
return $$TMP228;
}
);
$$root["iterate-compile-collecting"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP230;
$$TMP230=$$root["filter"]((function(x){
   var $$TMP231;
$$TMP231=$$root["not="](x,undefined);
return $$TMP231;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP230;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP232;
   $$TMP232=(function(res__MINUSname){
      var $$TMP233;
      $$TMP233=(function(all){
         var $$TMP243;
         $$TMP243=(function(body__MINUSactions,final__MINUSactions){
            var $$TMP245;
            var $$TMP246;
if($$root["null?"](final__MINUSactions)){
$$TMP246=$$root["list"](res__MINUSname);
}
else{
   $$TMP246=final__MINUSactions;
}
$$TMP245=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["concat"]($$root["list"](res__MINUSname,undefined),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["butlast"](1,body__MINUSactions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](body__MINUSactions)))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$TMP246)))))));
return $$TMP245;
}
)($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["map"]((function(v){
   var $$TMP244;
$$TMP244=$$root["push"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](res__MINUSname),$$root["list"]($$root["last"](v))),$$root["butlast"](1,v));
return $$TMP244;
}
),$$root["collect-field"]((new $$root.Symbol("finally")),all))));
return $$TMP243;
}
)($$root["map"]((function(form){
   var $$TMP234;
   $$TMP234=(function(__GS7){
      var $$TMP235;
      var $$TMP236;
if($$root["equal?"](__GS7,(new $$root.Symbol("let")))){
$$TMP236=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP237;
if($$root["equal?"](__GS7,(new $$root.Symbol("for")))){
$$TMP237=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP238;
if($$root["equal?"](__GS7,(new $$root.Symbol("while")))){
$$TMP238=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP239;
if($$root["equal?"](__GS7,(new $$root.Symbol("do")))){
$$TMP239=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP240;
if($$root["equal?"](__GS7,(new $$root.Symbol("collecting")))){
$$TMP240=$$root["iterate-compile-collecting"](form);
}
else{
   var $$TMP241;
if($$root["equal?"](__GS7,(new $$root.Symbol("finally")))){
$$TMP241=$$root["iterate-compile-finally"](res__MINUSname,form);
}
else{
   var $$TMP242;
   if(true){
$$TMP242=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP242=undefined;
}
$$TMP241=$$TMP242;
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
return $$TMP235;
}
)($$root["car"](form));
return $$TMP234;
}
),forms));
return $$TMP233;
}
)($$root["gensym"]());
return $$TMP232;
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
   var $$TMP247;
   $$TMP247=(function(self){
      var $$TMP248;
      $$TMP248=(function(__GS8){
         var $$TMP249;
$$root["seti!"](__GS8,(new $$root.Symbol("src")),src);
$$root["seti!"](__GS8,(new $$root.Symbol("type")),type);
$$root["seti!"](__GS8,(new $$root.Symbol("start")),start);
$$root["seti!"](__GS8,(new $$root.Symbol("len")),len);
$$TMP249=__GS8;
return $$TMP249;
}
)(self);
return $$TMP248;
}
)(this);
return $$TMP247;
}
));
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP250;
   $$TMP250=(function(self){
      var $$TMP251;
$$TMP251=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("src"))),(new $$root.Symbol("substr")),$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP251;
}
)(this);
return $$TMP250;
}
));
$$root["lit"]=(function(s){
   var $$TMP252;
$$TMP252=$$root["regex"]($$root["str"]("^",$$root["call-method-by-name"](s,(new $$root.Symbol("replace")),$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&")));
return $$TMP252;
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
      (function(__GS9,res,i,__GS10,__GS11,entry,_){
         var $$TMP259;
         $$TMP259=(function(recur){
            var $$TMP260;
            recur=(function(){
               var $$TMP261;
               var $$TMP262;
               var $$TMP263;
if($$root["<"](i,__GS10)){
   var $$TMP264;
if($$root["not"]($$root["null?"](__GS11))){
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
entry=$$root["car"](__GS11);
entry;
res=$$root["call-method-by-name"](s,(new $$root.Symbol("match")),$$root["first"](entry));
__GS9=res;
__GS9;
i=$$root["+"](i,1);
i;
__GS11=$$root["cdr"](__GS11);
__GS11;
$$TMP266=recur();
return $$TMP266;
}
)();
}
else{
   $$TMP262=(function(){
      var $$TMP267;
      _=__GS9;
      _;
      var $$TMP268;
      if(res){
         $$TMP268=(function(){
            var $$TMP269;
s=$$root["call-method-by-name"](s,(new $$root.Symbol("substring")),$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
s;
var $$TMP270;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP270=(function(){
      var $$TMP271;
toks=$$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(function(c){
   var $$TMP272;
   var $$TMP273;
   if(c){
      $$TMP273=c;
   }
   else{
$$TMP273=$$root["second"](entry);
}
$$TMP272=$$TMP273;
return $$TMP272;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP271=toks;
return $$TMP271;
}
)();
}
else{
   $$TMP270=undefined;
}
$$TMP270;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP269=pos;
return $$TMP269;
}
)();
}
else{
$$TMP268=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
__GS9=$$TMP268;
$$TMP267=__GS9;
return $$TMP267;
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
$$TMP254=$$root["reverse"]($$root["cons"]($$root["make-instance"]($$root["token-proto"],src,(new $$root.Symbol("end-tok")),0,0),toks));
return $$TMP254;
}
)([],0,src);
return $$TMP253;
}
);
$$root["tokenize"];
$$root["parser-proto"]=$$root["object"]();
$$root["parser-proto"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("init")),(function(toks){
   var $$TMP274;
   $$TMP274=(function(self){
      var $$TMP275;
$$TMP275=$$root["seti!"](self,(new $$root.Symbol("pos")),toks);
return $$TMP275;
}
)(this);
return $$TMP274;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("peek-tok")),(function(){
   var $$TMP276;
   $$TMP276=(function(self){
      var $$TMP277;
$$TMP277=$$root["car"]($$root["geti"](self,(new $$root.Symbol("pos"))));
return $$TMP277;
}
)(this);
return $$TMP276;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("consume-tok")),(function(){
   var $$TMP278;
   $$TMP278=(function(self){
      var $$TMP279;
      $$TMP279=(function(curr){
         var $$TMP280;
$$root["seti!"](self,(new $$root.Symbol("pos")),$$root["cdr"]($$root["geti"](self,(new $$root.Symbol("pos")))));
$$TMP280=curr;
return $$TMP280;
}
)($$root["car"]($$root["geti"](self,(new $$root.Symbol("pos")))));
return $$TMP279;
}
)(this);
return $$TMP278;
}
));
$$root["escape-str"]=(function(s){
   var $$TMP281;
$$TMP281=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("stringify")),s);
return $$TMP281;
}
);
$$root["escape-str"];
$$root["unescape-str"]=(function(s){
   var $$TMP282;
$$TMP282=$$root["call-method-by-name"]($$root["JSON"],(new $$root.Symbol("parse")),s);
return $$TMP282;
}
);
$$root["unescape-str"];
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-expr")),(function(){
   var $$TMP283;
   $$TMP283=(function(self){
      var $$TMP284;
      $$TMP284=(function(tok){
         var $$TMP285;
         $$TMP285=(function(__GS12){
            var $$TMP286;
            var $$TMP287;
if($$root["equal?"](__GS12,(new $$root.Symbol("list-open-tok")))){
$$TMP287=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-list")));
}
else{
   var $$TMP288;
if($$root["equal?"](__GS12,(new $$root.Symbol("true-tok")))){
   $$TMP288=true;
}
else{
   var $$TMP289;
if($$root["equal?"](__GS12,(new $$root.Symbol("false-tok")))){
   $$TMP289=false;
}
else{
   var $$TMP290;
if($$root["equal?"](__GS12,(new $$root.Symbol("null-tok")))){
   $$TMP290=[];
}
else{
   var $$TMP291;
if($$root["equal?"](__GS12,(new $$root.Symbol("undef-tok")))){
   $$TMP291=undefined;
}
else{
   var $$TMP292;
if($$root["equal?"](__GS12,(new $$root.Symbol("num-tok")))){
$$TMP292=$$root["parseFloat"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP293;
if($$root["equal?"](__GS12,(new $$root.Symbol("str-tok")))){
$$TMP293=$$root["unescape-str"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP294;
if($$root["equal?"](__GS12,(new $$root.Symbol("quote-tok")))){
$$TMP294=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
else{
   var $$TMP295;
if($$root["equal?"](__GS12,(new $$root.Symbol("backquote-tok")))){
$$TMP295=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")));
}
else{
   var $$TMP296;
if($$root["equal?"](__GS12,(new $$root.Symbol("sym-tok")))){
$$TMP296=$$root["symbol"]($$root["call-method-by-name"](tok,(new $$root.Symbol("text"))));
}
else{
   var $$TMP297;
   if(true){
$$TMP297=$$root["error"]($$root["str"]("Unexpected token: ",$$root["geti"](tok,(new $$root.Symbol("type")))));
}
else{
   $$TMP297=undefined;
}
$$TMP296=$$TMP297;
}
$$TMP295=$$TMP296;
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
return $$TMP286;
}
)($$root["geti"](tok,(new $$root.Symbol("type"))));
return $$TMP285;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))));
return $$TMP284;
}
)(this);
return $$TMP283;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-list")),(function(){
   var $$TMP298;
   $$TMP298=(function(self){
      var $$TMP299;
      $$TMP299=(function(__GS13,__GS14,lst){
         var $$TMP300;
         $$TMP300=(function(recur){
            var $$TMP301;
            recur=(function(){
               var $$TMP302;
               var $$TMP303;
               var $$TMP304;
               var $$TMP305;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("list-close-tok"))))){
   var $$TMP306;
$$root["t"]=$$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")));
if($$root["not"]($$root["equal?"]($$root["t"],(new $$root.Symbol("end-tok"))))){
   $$TMP306=true;
}
else{
   $$TMP306=false;
}
$$TMP305=$$TMP306;
}
else{
   $$TMP305=false;
}
if($$TMP305){
   $$TMP304=true;
}
else{
   $$TMP304=false;
}
if($$TMP304){
   $$TMP303=(function(){
      var $$TMP307;
__GS14=$$root["cons"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr"))),__GS14);
__GS13=__GS14;
__GS13;
$$TMP307=recur();
return $$TMP307;
}
)();
}
else{
   $$TMP303=(function(){
      var $$TMP308;
__GS13=$$root["reverse"](__GS14);
__GS13;
lst=__GS13;
lst;
var $$TMP309;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
   $$TMP309=lst;
}
else{
$$TMP309=$$root["error"]("Unmatched paren!");
}
__GS13=$$TMP309;
$$TMP308=__GS13;
return $$TMP308;
}
)();
}
$$TMP302=$$TMP303;
return $$TMP302;
}
);
recur;
$$TMP301=recur();
return $$TMP301;
}
)([]);
return $$TMP300;
}
)(undefined,[],undefined);
return $$TMP299;
}
)(this);
return $$TMP298;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-list")),(function(){
   var $$TMP310;
   $$TMP310=(function(self){
      var $$TMP311;
      $$TMP311=(function(__GS15,__GS16,lst){
         var $$TMP312;
         $$TMP312=(function(recur){
            var $$TMP313;
            recur=(function(){
               var $$TMP314;
               var $$TMP315;
               var $$TMP316;
               var $$TMP317;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok"))))){
   var $$TMP318;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP318=true;
}
else{
   $$TMP318=false;
}
$$TMP317=$$TMP318;
}
else{
   $$TMP317=false;
}
if($$TMP317){
   $$TMP316=true;
}
else{
   $$TMP316=false;
}
if($$TMP316){
   $$TMP315=(function(){
      var $$TMP319;
__GS16=$$root["cons"]((function(__GS17){
   var $$TMP320;
   var $$TMP321;
if($$root["equal?"](__GS17,(new $$root.Symbol("unquote-tok")))){
   $$TMP321=(function(){
      var $$TMP322;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP322=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
return $$TMP322;
}
)();
}
else{
   var $$TMP323;
if($$root["equal?"](__GS17,(new $$root.Symbol("splice-tok")))){
   $$TMP323=(function(){
      var $$TMP324;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP324=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")));
return $$TMP324;
}
)();
}
else{
   var $$TMP325;
   if(true){
$$TMP325=$$root["concat"]($$root["list"]((new $$root.Symbol("list"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-expr")))));
}
else{
   $$TMP325=undefined;
}
$$TMP323=$$TMP325;
}
$$TMP321=$$TMP323;
}
$$TMP320=$$TMP321;
return $$TMP320;
}
)($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type")))),__GS16);
__GS15=__GS16;
__GS15;
$$TMP319=recur();
return $$TMP319;
}
)();
}
else{
   $$TMP315=(function(){
      var $$TMP326;
__GS15=$$root["reverse"](__GS16);
__GS15;
lst=__GS15;
lst;
var $$TMP327;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-close-tok")))){
$$TMP327=$$root["cons"]((new $$root.Symbol("concat")),lst);
}
else{
$$TMP327=$$root["error"]("Unmatched paren!");
}
__GS15=$$TMP327;
$$TMP326=__GS15;
return $$TMP326;
}
)();
}
$$TMP314=$$TMP315;
return $$TMP314;
}
);
recur;
$$TMP313=recur();
return $$TMP313;
}
)([]);
return $$TMP312;
}
)(undefined,[],undefined);
return $$TMP311;
}
)(this);
return $$TMP310;
}
));
$$root["seti!"]($$root["parser-proto"],(new $$root.Symbol("parse-backquoted-expr")),(function(){
   var $$TMP328;
   $$TMP328=(function(self){
      var $$TMP329;
      var $$TMP330;
if($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](self,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("list-open-tok")))){
   $$TMP330=(function(){
      var $$TMP331;
$$root["call-method-by-name"](self,(new $$root.Symbol("consume-tok")));
$$TMP331=$$root["call-method-by-name"](self,(new $$root.Symbol("parse-backquoted-list")));
return $$TMP331;
}
)();
}
else{
$$TMP330=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["call-method-by-name"](self,(new $$root.Symbol("parse-expr")))));
}
$$TMP329=$$TMP330;
return $$TMP329;
}
)(this);
return $$TMP328;
}
));
$$root["parse"]=(function(toks){
   var $$TMP332;
   $$TMP332=(function(p){
      var $$TMP333;
      $$TMP333=(function(__GS18,__GS19){
         var $$TMP334;
         $$TMP334=(function(recur){
            var $$TMP335;
            recur=(function(){
               var $$TMP336;
               var $$TMP337;
               var $$TMP338;
if($$root["not"]($$root["equal?"]($$root["geti"]($$root["call-method-by-name"](p,(new $$root.Symbol("peek-tok"))),(new $$root.Symbol("type"))),(new $$root.Symbol("end-tok"))))){
   $$TMP338=true;
}
else{
   $$TMP338=false;
}
if($$TMP338){
   $$TMP337=(function(){
      var $$TMP339;
__GS19=$$root["cons"]($$root["call-method-by-name"](p,(new $$root.Symbol("parse-expr"))),__GS19);
__GS18=__GS19;
__GS18;
$$TMP339=recur();
return $$TMP339;
}
)();
}
else{
   $$TMP337=(function(){
      var $$TMP340;
__GS18=$$root["reverse"](__GS19);
$$TMP340=__GS18;
return $$TMP340;
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
)(undefined,[]);
return $$TMP333;
}
)($$root["make-instance"]($$root["parser-proto"],toks));
return $$TMP332;
}
);
$$root["parse"];
$$root["mangling-table"]=$$root["hashmap"]();
$$root["mangling-table"];
(function(__GS20){
   var $$TMP341;
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
$$TMP341=__GS20;
return $$TMP341;
}
)($$root["mangling-table"]);
$$root["keys"]=(function(obj){
   var $$TMP342;
$$TMP342=$$root["call-method-by-name"]($$root["Object"],(new $$root.Symbol("keys")),obj);
return $$TMP342;
}
);
$$root["keys"];
$$root["mangling-rx"]=$$root["regex"]($$root["str"]("\\",$$root["call-method-by-name"]($$root["keys"]($$root["mangling-table"]),(new $$root.Symbol("join")),"|\\")),"gi");$$root["mangling-rx"];$$root["mangle"]=(function(x){var $$TMP343;$$TMP343=$$root["geti"]($$root["mangling-table"],x);return $$TMP343;});$$root["mangle"];$$root["mangle-name"]=(function(name){var $$TMP344;$$TMP344=$$root["call-method-by-name"](name,(new $$root.Symbol("replace")),$$root["mangling-rx"],$$root["mangle"]);return $$TMP344;});$$root["mangle-name"];$$root["compiler-proto"]=$$root["object"]();$$root["compiler-proto"];$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("init")),(function(root){var $$TMP345;$$TMP345=(function(self){var $$TMP346;$$TMP346=(function(__GS21){var $$TMP347;$$root["seti!"](__GS21,"root",root);$$root["seti!"](__GS21,"next-var-suffix",0);$$TMP347=__GS21;return $$TMP347;})(self);return $$TMP346;})(this);return $$TMP345;}));$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("gen-var-name")),(function(){var $$TMP348;$$TMP348=(function(self){var $$TMP349;$$TMP349=(function(out){var $$TMP350;$$root["seti!"](self,(new $$root.Symbol("next-var-suffix")),$$root["+"]($$root["geti"](self,(new $$root.Symbol("next-var-suffix"))),1));$$TMP350=out;return $$TMP350;})($$root["str"]("$$TMP",$$root["geti"](self,(new $$root.Symbol("next-var-suffix")))));return $$TMP349;})(this);return $$TMP348;}));$$root["compile-time-resolve"]=(function(lexenv,sym){var $$TMP351;var $$TMP352;if($$root["in"](lexenv,$$root["geti"](sym,(new $$root.Symbol("name"))))){$$TMP352=$$root["mangle-name"]($$root["geti"](sym,(new $$root.Symbol("name"))));}else{$$TMP352=$$root["str"]("$$root[\"",$$root["geti"](sym,(new $$root.Symbol("name"))),"\"]");
}
$$TMP351=$$TMP352;
return $$TMP351;
}
);
$$root["compile-time-resolve"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-atom")),(function(lexenv,x){
   var $$TMP353;
   $$TMP353=(function(self){
      var $$TMP354;
      var $$TMP355;
if($$root["="](x,true)){
$$TMP355=$$root["list"]("true","");
}
else{
   var $$TMP356;
if($$root["="](x,false)){
$$TMP356=$$root["list"]("false","");
}
else{
   var $$TMP357;
if($$root["null?"](x)){
$$TMP357=$$root["list"]("[]","");
}
else{
   var $$TMP358;
if($$root["="](x,undefined)){
$$TMP358=$$root["list"]("undefined","");
}
else{
   var $$TMP359;
if($$root["symbol?"](x)){
$$TMP359=$$root["list"]($$root["compile-time-resolve"](lexenv,x),"");
}
else{
   var $$TMP360;
if($$root["string?"](x)){
$$TMP360=$$root["list"]($$root["escape-str"](x),"");
}
else{
   var $$TMP361;
   if(true){
$$TMP361=$$root["list"]($$root["str"](x),"");
}
else{
   $$TMP361=undefined;
}
$$TMP360=$$TMP361;
}
$$TMP359=$$TMP360;
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
return $$TMP354;
}
)(this);
return $$TMP353;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-funcall")),(function(lexenv,lst){
   var $$TMP362;
   $$TMP362=(function(self){
      var $$TMP363;
      $$TMP363=(function(__GS22){
         var $$TMP364;
         $$TMP364=(function(fun,args){
            var $$TMP365;
            $$TMP365=(function(compiled__MINUSargs,compiled__MINUSfun){
               var $$TMP366;
$$TMP366=$$root["list"]($$root["format"]("%0(%1)",$$root["first"](compiled__MINUSfun),$$root["join"](",",$$root["map"]($$root["first"],compiled__MINUSargs))),$$root["str"]($$root["second"](compiled__MINUSfun),$$root["join"]("",$$root["map"]($$root["second"],compiled__MINUSargs))));
return $$TMP366;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),args),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,fun));
return $$TMP365;
}
)($$root["nth"](0,__GS22),$$root["drop"](1,__GS22));
return $$TMP364;
}
)(lst);
return $$TMP363;
}
)(this);
return $$TMP362;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-body-helper")),(function(lexenv,lst,target__MINUSvar__MINUSname){
   var $$TMP367;
   $$TMP367=(function(self){
      var $$TMP368;
      $$TMP368=(function(compiled__MINUSbody,reducer){
         var $$TMP370;
$$TMP370=$$root["str"]($$root["reduce"](reducer,$$root["butlast"](1,compiled__MINUSbody),""),$$root["second"]($$root["last"](compiled__MINUSbody)),target__MINUSvar__MINUSname,"=",$$root["first"]($$root["last"](compiled__MINUSbody)),";");
return $$TMP370;
}
)($$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile")),lexenv),lst),(function(accum,v){
   var $$TMP369;
$$TMP369=$$root["str"](accum,$$root["second"](v),$$root["first"](v),";");
return $$TMP369;
}
));
return $$TMP368;
}
)(this);
return $$TMP367;
}
));
$$root["process-args"]=(function(args){
   var $$TMP371;
$$TMP371=$$root["join"](",",$$root["reverse"]($$root["reduce"]((function(accum,v){
   var $$TMP372;
   var $$TMP373;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP373=$$root["str"]("...",$$root["mangle-name"]($$root["call-method-by-name"]($$root["geti"](v,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1)));
}
else{
$$TMP373=$$root["mangle-name"]($$root["geti"](v,(new $$root.Symbol("name"))));
}
$$TMP372=$$root["cons"]($$TMP373,accum);
return $$TMP372;
}
),args,[])));
return $$TMP371;
}
);
$$root["process-args"];
$$root["lexical-name"]=(function(sym){
   var $$TMP374;
   var $$TMP375;
if($$root["="]($$root["geti"]($$root["geti"](sym,(new $$root.Symbol("name"))),0),"&")){
$$TMP375=$$root["call-method-by-name"]($$root["geti"](sym,(new $$root.Symbol("name"))),(new $$root.Symbol("slice")),1);
}
else{
$$TMP375=$$root["geti"](sym,(new $$root.Symbol("name")));
}
$$TMP374=$$TMP375;
return $$TMP374;
}
);
$$root["lexical-name"];
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-lambda")),(function(lexenv,lst){
   var $$TMP376;
   $$TMP376=(function(self){
      var $$TMP377;
      $$TMP377=(function(__GS23){
         var $$TMP378;
         $$TMP378=(function(__GS24){
            var $$TMP379;
            $$TMP379=(function(args,body){
               var $$TMP380;
               $$TMP380=(function(lexenv2,ret__MINUSvar__MINUSname){
                  var $$TMP382;
                  $$TMP382=(function(compiled__MINUSbody){
                     var $$TMP383;
$$TMP383=$$root["list"]($$root["format"]($$root["str"]("(function(%0)","{","var %1;","%2","return %1;","})"),$$root["process-args"](args),ret__MINUSvar__MINUSname,compiled__MINUSbody),"");
return $$TMP383;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-body-helper")),lexenv2,body,ret__MINUSvar__MINUSname));
return $$TMP382;
}
)($$root["reduce"]((function(accum,v){
   var $$TMP381;
$$root["seti!"](accum,$$root["lexical-name"](v),true);
$$TMP381=accum;
return $$TMP381;
}
),args,$$root["object"](lexenv)),$$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))));
return $$TMP380;
}
)($$root["drop"](0,__GS24),$$root["drop"](2,__GS23));
return $$TMP379;
}
)($$root["nth"](1,__GS23));
return $$TMP378;
}
)(lst);
return $$TMP377;
}
)(this);
return $$TMP376;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-if")),(function(lexenv,lst){
   var $$TMP384;
   $$TMP384=(function(self){
      var $$TMP385;
      $$TMP385=(function(__GS25){
         var $$TMP386;
         $$TMP386=(function(c,t,f){
            var $$TMP387;
            $$TMP387=(function(value__MINUSvar__MINUSname,compiled__MINUSc,compiled__MINUSt,compiled__MINUSf){
               var $$TMP388;
$$TMP388=$$root["list"](value__MINUSvar__MINUSname,$$root["format"]($$root["str"]("var %0;","%1","if(%2){","%3","%0=%4;","}else{","%5","%0=%6;","}"),value__MINUSvar__MINUSname,$$root["second"](compiled__MINUSc),$$root["first"](compiled__MINUSc),$$root["second"](compiled__MINUSt),$$root["first"](compiled__MINUSt),$$root["second"](compiled__MINUSf),$$root["first"](compiled__MINUSf)));
return $$TMP388;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("gen-var-name"))),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,c),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,t),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,f));
return $$TMP387;
}
)($$root["nth"](1,__GS25),$$root["nth"](2,__GS25),$$root["nth"](3,__GS25));
return $$TMP386;
}
)(lst);
return $$TMP385;
}
)(this);
return $$TMP384;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-atom")),(function(lexenv,x){
   var $$TMP389;
   $$TMP389=(function(self){
      var $$TMP390;
      var $$TMP391;
if($$root["symbol?"](x)){
$$TMP391=$$root["list"]($$root["str"]("(new $$root.Symbol(\"",$$root["geti"](x,(new $$root.Symbol("name"))),"\"))"),"");
}
else{
$$TMP391=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,x);
}
$$TMP390=$$TMP391;
return $$TMP390;
}
)(this);
return $$TMP389;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted-list")),(function(lexenv,lst){
   var $$TMP392;
   $$TMP392=(function(self){
      var $$TMP393;
$$TMP393=$$root["list"]($$root["str"]("$$root.list(",$$root["join"](",",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-quoted")),lexenv),lst)),")"),"");
return $$TMP393;
}
)(this);
return $$TMP392;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-quoted")),(function(lexenv,x){
   var $$TMP394;
   $$TMP394=(function(self){
      var $$TMP395;
      var $$TMP396;
if($$root["atom?"](x)){
$$TMP396=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-atom")),lexenv,x);
}
else{
$$TMP396=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted-list")),lexenv,x);
}
$$TMP395=$$TMP396;
return $$TMP395;
}
)(this);
return $$TMP394;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile-setv")),(function(lexenv,lst){
   var $$TMP397;
   $$TMP397=(function(self){
      var $$TMP398;
      $$TMP398=(function(__GS26){
         var $$TMP399;
         $$TMP399=(function(name,value){
            var $$TMP400;
            $$TMP400=(function(var__MINUSname,compiled__MINUSval){
               var $$TMP401;
$$TMP401=$$root["list"](var__MINUSname,$$root["str"]($$root["second"](compiled__MINUSval),var__MINUSname,"=",$$root["first"](compiled__MINUSval),";"));
return $$TMP401;
}
)($$root["compile-time-resolve"](lexenv,name),$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,value));
return $$TMP400;
}
)($$root["nth"](1,__GS26),$$root["nth"](2,__GS26));
return $$TMP399;
}
)(lst);
return $$TMP398;
}
)(this);
return $$TMP397;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("macroexpand-unsafe")),(function(lexenv,expr){
   var $$TMP402;
   $$TMP402=(function(self){
      var $$TMP403;
      $$TMP403=(function(__GS27){
         var $$TMP404;
         $$TMP404=(function(name,args){
            var $$TMP405;
            $$TMP405=(function(tmp){
               var $$TMP407;
$$TMP407=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP407;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,$$root["cons"](name,$$root["map"]((function(v){
   var $$TMP406;
$$TMP406=$$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"](v));
return $$TMP406;
}
),args))));
return $$TMP405;
}
)($$root["nth"](0,__GS27),$$root["drop"](1,__GS27));
return $$TMP404;
}
)(expr);
return $$TMP403;
}
)(this);
return $$TMP402;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("is-macro")),(function(name){
   var $$TMP408;
   $$TMP408=(function(self){
      var $$TMP409;
      var $$TMP410;
if($$root["in"]($$root["geti"](self,(new $$root.Symbol("root"))),name)){
   var $$TMP411;
if($$root["geti"]($$root["geti"]($$root["geti"](self,(new $$root.Symbol("root"))),name),(new $$root.Symbol("isMacro")))){
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
return $$TMP409;
}
)(this);
return $$TMP408;
}
));
$$root["seti!"]($$root["compiler-proto"],(new $$root.Symbol("compile")),(function(lexenv,expr){
   var $$TMP412;
   $$TMP412=(function(self){
      var $$TMP413;
      var $$TMP414;
      var $$TMP415;
if($$root["list?"](expr)){
   var $$TMP416;
if($$root["not"]($$root["null?"](expr))){
   $$TMP416=true;
}
else{
   $$TMP416=false;
}
$$TMP415=$$TMP416;
}
else{
   $$TMP415=false;
}
if($$TMP415){
   $$TMP414=(function(first){
      var $$TMP417;
      var $$TMP418;
if($$root["symbol?"](first)){
   $$TMP418=(function(__GS28){
      var $$TMP419;
      var $$TMP420;
if($$root["equal?"](__GS28,(new $$root.Symbol("lambda")))){
$$TMP420=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-lambda")),lexenv,expr);
}
else{
   var $$TMP421;
if($$root["equal?"](__GS28,(new $$root.Symbol("if")))){
$$TMP421=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-if")),lexenv,expr);
}
else{
   var $$TMP422;
if($$root["equal?"](__GS28,(new $$root.Symbol("quote")))){
$$TMP422=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-quoted")),lexenv,$$root["second"](expr));
}
else{
   var $$TMP423;
if($$root["equal?"](__GS28,(new $$root.Symbol("setv!")))){
$$TMP423=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP424;
if($$root["equal?"](__GS28,(new $$root.Symbol("def")))){
$$TMP424=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-setv")),lexenv,expr);
}
else{
   var $$TMP425;
   if(true){
      var $$TMP426;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),$$root["geti"](first,(new $$root.Symbol("name"))))){
$$TMP426=$$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,expr));
}
else{
$$TMP426=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP425=$$TMP426;
}
else{
   $$TMP425=undefined;
}
$$TMP424=$$TMP425;
}
$$TMP423=$$TMP424;
}
$$TMP422=$$TMP423;
}
$$TMP421=$$TMP422;
}
$$TMP420=$$TMP421;
}
$$TMP419=$$TMP420;
return $$TMP419;
}
)(first);
}
else{
$$TMP418=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-funcall")),lexenv,expr);
}
$$TMP417=$$TMP418;
return $$TMP417;
}
)($$root["car"](expr));
}
else{
$$TMP414=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-atom")),lexenv,expr);
}
$$TMP413=$$TMP414;
return $$TMP413;
}
)(this);
return $$TMP412;
}
));
$$root["node-evaluator-proto"]=$$root["object"]();
$$root["node-evaluator-proto"];
$$root["default-lexenv"]=(function(){
   var $$TMP427;
   $$TMP427=(function(__GS29){
      var $$TMP428;
$$root["seti!"](__GS29,"this",true);
$$TMP428=__GS29;
return $$TMP428;
}
)($$root["object"]());
return $$TMP427;
}
);
$$root["default-lexenv"];
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP429;
   $$TMP429=(function(self){
      var $$TMP430;
      $$TMP430=(function(root,sandbox){
         var $$TMP431;
$$root["seti!"](sandbox,"$$root",root);
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(str){
   var $$TMP432;
$$TMP432=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),str,sandbox);
return $$TMP432;
}
));
$$TMP431=(function(__GS30){
   var $$TMP433;
$$root["seti!"](__GS30,"root",root);
$$root["seti!"](__GS30,"compiler",$$root["make-instance"]($$root["compiler-proto"],root));
$$TMP433=__GS30;
return $$TMP433;
}
)(self);
return $$TMP431;
}
)($$root["object"]($$root["*ns*"]),$$root["object"]());
return $$TMP430;
}
)(this);
return $$TMP429;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval")),(function(expr){
   var $$TMP434;
   $$TMP434=(function(self){
      var $$TMP435;
      $$TMP435=(function(tmp){
         var $$TMP436;
$$TMP436=$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
return $$TMP436;
}
)($$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("compiler"))),(new $$root.Symbol("compile")),$$root["default-lexenv"](),expr));
return $$TMP435;
}
)(this);
return $$TMP434;
}
));
$$root["seti!"]($$root["node-evaluator-proto"],(new $$root.Symbol("eval-str")),(function(s){
   var $$TMP437;
   $$TMP437=(function(self){
      var $$TMP438;
      $$TMP438=(function(forms){
         var $$TMP439;
         $$TMP439=(function(__GS31,__GS32,form){
            var $$TMP440;
            $$TMP440=(function(recur){
               var $$TMP441;
               recur=(function(){
                  var $$TMP442;
                  var $$TMP443;
                  var $$TMP444;
if($$root["not"]($$root["null?"](__GS32))){
   $$TMP444=true;
}
else{
   $$TMP444=false;
}
if($$TMP444){
   $$TMP443=(function(){
      var $$TMP445;
form=$$root["car"](__GS32);
form;
__GS31=$$root["call-method-by-name"](self,(new $$root.Symbol("eval")),form);
__GS31;
__GS32=$$root["cdr"](__GS32);
__GS32;
$$TMP445=recur();
return $$TMP445;
}
)();
}
else{
   $$TMP443=(function(){
      var $$TMP446;
      $$TMP446=__GS31;
      return $$TMP446;
   }
   )();
}
$$TMP442=$$TMP443;
return $$TMP442;
}
);
recur;
$$TMP441=recur();
return $$TMP441;
}
)([]);
return $$TMP440;
}
)(undefined,forms,[]);
return $$TMP439;
}
)($$root["parse"]($$root["tokenize"](s)));
return $$TMP438;
}
)(this);
return $$TMP437;
}
));
$$root["lazy-def-proto"]=$$root["object"]();
$$root["lazy-def-proto"];
$$root["seti!"]($$root["lazy-def-proto"],(new $$root.Symbol("init")),(function(compilation__MINUSresult){
   var $$TMP447;
   $$TMP447=(function(self){
      var $$TMP448;
$$TMP448=$$root["seti!"](self,(new $$root.Symbol("code")),$$root["str"]($$root["second"](compilation__MINUSresult),$$root["first"](compilation__MINUSresult)));
return $$TMP448;
}
)(this);
return $$TMP447;
}
));
$$root["static-compiler-proto"]=$$root["object"]($$root["compiler-proto"]);
$$root["static-compiler-proto"];
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("init")),(function(){
   var $$TMP449;
   $$TMP449=(function(self){
      var $$TMP450;
      $$TMP450=(function(root,sandbox,handler,next__MINUSgensym__MINUSsuffix){
         var $$TMP451;
$$root["seti!"](handler,(new $$root.Symbol("get")),(function(target,name){
   var $$TMP452;
   $$TMP452=(function(r){
      var $$TMP453;
      var $$TMP454;
if($$root["prototype?"]($$root["lazy-def-proto"],r)){
   $$TMP454=(function(){
      var $$TMP455;
r=$$root["call-method-by-name"](root,(new $$root.Symbol("jeval")),$$root["geti"](r,(new $$root.Symbol("code"))));
r;
$$TMP455=$$root["seti!"](target,name,r);
return $$TMP455;
}
)();
}
else{
   $$TMP454=undefined;
}
$$TMP454;
$$TMP453=r;
return $$TMP453;
}
)($$root["geti"](target,name));
return $$TMP452;
}
));
$$root["seti!"](sandbox,"$$root",$$root["new"]($$root["Proxy"],root,handler));
$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("createContext")),sandbox);
$$root["seti!"](root,"jeval",(function(s){
   var $$TMP456;
$$TMP456=$$root["call-method-by-name"]($$root["VM"],(new $$root.Symbol("runInContext")),s,sandbox);
return $$TMP456;
}
));
$$root["seti!"](root,"*ns*",$$root["geti"](sandbox,"$$root"));
$$root["seti!"](root,"gensym",(function(){
   var $$TMP457;
next__MINUSgensym__MINUSsuffix=$$root["+"](next__MINUSgensym__MINUSsuffix,1);
$$TMP457=$$root["symbol"]($$root["str"]("__GS",next__MINUSgensym__MINUSsuffix));
return $$TMP457;
}
));
$$TMP451=$$root["call-method"]($$root["geti"]($$root["compiler-proto"],(new $$root.Symbol("init"))),self,root);
return $$TMP451;
}
)($$root["object"]($$root["*ns*"]),$$root["object"](),$$root["object"](),0);
return $$TMP450;
}
)(this);
return $$TMP449;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-toplevel")),(function(e){
   var $$TMP458;
   $$TMP458=(function(self){
      var $$TMP459;
      $$TMP459=(function(lexenv){
         var $$TMP460;
         $$TMP460=(function(__GS33){
            var $$TMP461;
            var $$TMP462;
if($$root["matches?"](__GS33,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("def")) )) ),((new $$root.Symbol("name")) ),((new $$root.Symbol("val")) )))){
   $$TMP462=(function(__GS34){
      var $$TMP463;
      $$TMP463=(function(name,val){
         var $$TMP464;
         $$TMP464=(function(tmp){
            var $$TMP465;
$$root["seti!"]($$root["geti"](self,(new $$root.Symbol("root"))),name,$$root["make-instance"]($$root["lazy-def-proto"],tmp));
$$TMP465=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP465;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP464;
}
)($$root["nth"](1,__GS34),$$root["nth"](2,__GS34));
return $$TMP463;
}
)(__GS33);
}
else{
   var $$TMP466;
if($$root["matches?"](__GS33,$$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("setmac!")) )) ),((new $$root.Symbol("name")) )))){
   $$TMP466=(function(__GS35){
      var $$TMP467;
      $$TMP467=(function(name){
         var $$TMP468;
         $$TMP468=(function(tmp){
            var $$TMP469;
$$root["call-method-by-name"]($$root["geti"](self,(new $$root.Symbol("root"))),(new $$root.Symbol("jeval")),$$root["str"]($$root["second"](tmp),$$root["first"](tmp)));
$$TMP469=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP469;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP468;
}
)($$root["nth"](1,__GS35));
return $$TMP467;
}
)(__GS33);
}
else{
   var $$TMP470;
if($$root["matches?"](__GS33,$$root.list(($$root.list(($$root.list(((new $$root.Symbol("quote")) ),((new $$root.Symbol("lambda")) )) ),($$root.list(((new $$root.Symbol("&args")) )) ),((new $$root.Symbol("&body")) )) )))){
   $$TMP470=(function(__GS36){
      var $$TMP471;
      $$TMP471=(function(__GS37){
         var $$TMP472;
         $$TMP472=(function(__GS38){
            var $$TMP473;
            $$TMP473=(function(args,body){
               var $$TMP474;
$$TMP474=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),body));
return $$TMP474;
}
)($$root["drop"](0,__GS38),$$root["drop"](2,__GS37));
return $$TMP473;
}
)($$root["nth"](1,__GS37));
return $$TMP472;
}
)($$root["nth"](0,__GS36));
return $$TMP471;
}
)(__GS33);
}
else{
   var $$TMP475;
if($$root["matches?"](__GS33,$$root.list(((new $$root.Symbol("name")) ),((new $$root.Symbol("&args")) )))){
   $$TMP475=(function(__GS39){
      var $$TMP476;
      $$TMP476=(function(name,args){
         var $$TMP477;
         var $$TMP478;
if($$root["call-method-by-name"](self,(new $$root.Symbol("is-macro")),name)){
$$TMP478=$$root["call-method-by-name"](self,(new $$root.Symbol("compile-toplevel")),$$root["call-method-by-name"](self,(new $$root.Symbol("macroexpand-unsafe")),lexenv,e));
}
else{
   $$TMP478=(function(tmp){
      var $$TMP479;
$$TMP479=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP479;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
}
$$TMP477=$$TMP478;
return $$TMP477;
}
)($$root["nth"](0,__GS39),$$root["drop"](1,__GS39));
return $$TMP476;
}
)(__GS33);
}
else{
   var $$TMP480;
if($$root["matches?"](__GS33,(new $$root.Symbol("any")))){
   $$TMP480=(function(any){
      var $$TMP481;
      $$TMP481=(function(tmp){
         var $$TMP482;
$$TMP482=$$root["str"]($$root["second"](tmp),$$root["first"](tmp),";");
return $$TMP482;
}
)($$root["call-method-by-name"](self,(new $$root.Symbol("compile")),lexenv,e));
return $$TMP481;
}
)(__GS33);
}
else{
   var $$TMP483;
   if(true){
$$TMP483=$$root["error"]("Fell out of case!");
}
else{
   $$TMP483=undefined;
}
$$TMP480=$$TMP483;
}
$$TMP475=$$TMP480;
}
$$TMP470=$$TMP475;
}
$$TMP466=$$TMP470;
}
$$TMP462=$$TMP466;
}
$$TMP461=$$TMP462;
return $$TMP461;
}
)(e);
return $$TMP460;
}
)($$root["default-lexenv"]());
return $$TMP459;
}
)(this);
return $$TMP458;
}
));
$$root["seti!"]($$root["static-compiler-proto"],(new $$root.Symbol("compile-unit")),(function(s){
   var $$TMP484;
   $$TMP484=(function(self){
      var $$TMP485;
$$TMP485=$$root["join"]("",$$root["map"]($$root["partial-method"](self,(new $$root.Symbol("compile-toplevel"))),$$root["parse"]($$root["tokenize"](s))));
return $$TMP485;
}
)(this);
return $$TMP484;
}
));
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
