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
        return x === true || x === false || $$root["null?"](x) || x === undefined || $$root["number?"](x) || $$root["symbol?"](x);
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
    error:  function(msg) {
        throw Error(msg);
    },
	export: function(s, v) {
		module.exports[s] = v;
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
$$root["inc!"]=(function(name,amt){
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
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
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
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
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
$$root["count"]=(function(lst){
   var $$TMP54;
$$TMP54=$$root["reduce"]((function(accum,v){
   var $$TMP55;
$$TMP55=$$root["inc"](accum);
return $$TMP55;
}
),lst,0);
return $$TMP54;
}
);
$$root["count"];
$$root["zip"]=(function(a,...more){
   var $$TMP56;
   $$TMP56=(function(args){
      var $$TMP57;
      var $$TMP58;
if($$root["reduce"]((function(accum,v){
   var $$TMP59;
   $$TMP59=(function(c){
      var $$TMP60;
      var $$TMP61;
      if(c){
         $$TMP61=c;
      }
      else{
$$TMP61=$$root["null?"](v);
}
$$TMP60=$$TMP61;
return $$TMP60;
}
)(accum);
return $$TMP59;
}
),args,false)){
   $$TMP58=[];
}
else{
$$TMP58=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
}
$$TMP57=$$TMP58;
return $$TMP57;
}
)($$root["cons"](a,more));
return $$TMP56;
}
);
$$root["zip"];
$$root["let"]=(function(bindings,...body){
   var $$TMP62;
$$TMP62=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP62;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["find"]=(function(f,arg,lst){
   var $$TMP63;
   $$TMP63=(function(idx){
      var $$TMP64;
$$TMP64=$$root["reduce"]((function(accum,v){
   var $$TMP65;
idx=$$root["+"](idx,1);
idx;
var $$TMP66;
if(f(arg,v)){
   $$TMP66=idx;
}
else{
   $$TMP66=accum;
}
$$TMP65=$$TMP66;
return $$TMP65;
}
),lst,-1);
return $$TMP64;
}
)(-1);
return $$TMP63;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP67;
   var $$TMP68;
if($$root["atom?"](x)){
$$TMP68=$$root["list"](x);
}
else{
$$TMP68=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP67=$$TMP68;
return $$TMP67;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP69;
   $$TMP69=(function(idx){
      var $$TMP70;
$$TMP70=$$root["transform-list"]((function(accum,v){
   var $$TMP71;
idx=$$root["+"](idx,1);
$$TMP71=$$root["cons"](f(v,idx),accum);
return $$TMP71;
}
),lst);
return $$TMP70;
}
)(-1);
return $$TMP69;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP72;
$$TMP72=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP72;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP73;
   var $$TMP74;
if($$root["null?"](lst)){
   $$TMP74=[];
}
else{
$$TMP74=$$root["reverse"]((function(recur){
   var $$TMP75;
   recur=(function(accum,part,rem,counter){
      var $$TMP76;
      var $$TMP77;
if($$root["null?"](rem)){
$$TMP77=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP78;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP78=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP78=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP77=$$TMP78;
}
$$TMP76=$$TMP77;
return $$TMP76;
}
);
recur;
$$TMP75=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP75;
}
)([]));
}
$$TMP73=$$TMP74;
return $$TMP73;
}
);
$$root["partition"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP79;
   var $$TMP80;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP80=obj__MINUSname;
}
else{
$$TMP80=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP79=$$TMP80;
return $$TMP79;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP81;
   $$TMP81=(function(rev__MINUSfields){
      var $$TMP82;
      var $$TMP83;
if($$root["list?"]($$root["car"](rev__MINUSfields))){
$$TMP83=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
}
else{
$$TMP83=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
}
$$TMP82=$$TMP83;
return $$TMP82;
}
)($$root["reverse"](fields));
return $$TMP81;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["equal?"]=(function(a,b){
   var $$TMP84;
   var $$TMP85;
if($$root["null?"](a)){
$$TMP85=$$root["null?"](b);
}
else{
   var $$TMP86;
if($$root["symbol?"](a)){
   var $$TMP87;
if($$root["symbol?"](b)){
   var $$TMP88;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP88=true;
}
else{
   $$TMP88=false;
}
$$TMP87=$$TMP88;
}
else{
   $$TMP87=false;
}
$$TMP86=$$TMP87;
}
else{
   var $$TMP89;
if($$root["atom?"](a)){
$$TMP89=$$root["="](a,b);
}
else{
   var $$TMP90;
if($$root["list?"](a)){
   var $$TMP91;
if($$root["list?"](b)){
   var $$TMP92;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP93;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP93=true;
}
else{
   $$TMP93=false;
}
$$TMP92=$$TMP93;
}
else{
   $$TMP92=false;
}
$$TMP91=$$TMP92;
}
else{
   $$TMP91=false;
}
$$TMP90=$$TMP91;
}
else{
   $$TMP90=undefined;
}
$$TMP89=$$TMP90;
}
$$TMP86=$$TMP89;
}
$$TMP85=$$TMP86;
}
$$TMP84=$$TMP85;
return $$TMP84;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP94;
   $$TMP94=(function(res){
      var $$TMP100;
$$TMP100=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP100;
}
)((function(recur){
   var $$TMP95;
   recur=(function(l1,l2){
      var $$TMP96;
      var $$TMP97;
      if((function(c){
         var $$TMP98;
         var $$TMP99;
         if(c){
            $$TMP99=c;
         }
         else{
$$TMP99=p($$root["car"](l2));
}
$$TMP98=$$TMP99;
return $$TMP98;
}
)($$root["null?"](l2))){
$$TMP97=$$root["list"](l1,l2);
}
else{
$$TMP97=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP96=$$TMP97;
return $$TMP96;
}
);
recur;
$$TMP95=recur([],lst);
return $$TMP95;
}
)([]));
return $$TMP94;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP101;
   var $$TMP102;
if($$root["reduce"]((function(accum,v){
   var $$TMP103;
   var $$TMP104;
   if(accum){
      $$TMP104=accum;
   }
   else{
      $$TMP104=v;
   }
   $$TMP103=$$TMP104;
   return $$TMP103;
}
),lst,false)){
   $$TMP102=true;
}
else{
   $$TMP102=false;
}
$$TMP101=$$TMP102;
return $$TMP101;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP105;
$$TMP105=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP106;
   var $$TMP107;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP108;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
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
return $$TMP106;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP105;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP109;
   $$TMP109=(function(binding__MINUSnames){
      var $$TMP110;
      $$TMP110=(function(divs){
         var $$TMP112;
         var $$TMP113;
if($$root["null?"]($$root["second"](divs))){
$$TMP113=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP113=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP112=$$TMP113;
return $$TMP112;
}
)($$root["split"]((function(pair){
   var $$TMP111;
$$TMP111=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP111;
}
),binding__MINUSpairs));
return $$TMP110;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP109;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP114;
$$TMP114=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP114;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP115;
   $$TMP115=(function(x){
      var $$TMP116;
$$TMP116=$$root["not"](f(x));
return $$TMP116;
}
);
return $$TMP115;
}
);
$$root["complement"];
$$root["case"]=(function(e,...pairs){
   var $$TMP117;
   $$TMP117=(function(e__MINUSname,def__MINUSidx){
      var $$TMP118;
      var $$TMP119;
if($$root["="](def__MINUSidx,-1)){
$$TMP119=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
}
else{
$$TMP119=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP118=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP120;
$$TMP120=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP121;
$$TMP121=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP121;
}
),$$root["filter"]((function(pair){
   var $$TMP122;
$$TMP122=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP122;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP120;
}
)($$TMP119,$$root["partition"](2,pairs));
return $$TMP118;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP117;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP123;
   $$TMP123=(function(expr__MINUSname){
      var $$TMP124;
$$TMP124=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP125;
   var $$TMP126;
if($$root["symbol?"](v)){
   var $$TMP127;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP127=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
   var $$TMP128;
$$TMP128=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP128;
}
)($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP129;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP129=[];
}
else{
$$TMP129=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP127=$$TMP129;
}
$$TMP126=$$TMP127;
}
else{
$$TMP126=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP125=$$TMP126;
return $$TMP125;
}
),structure)));
return $$TMP124;
}
)($$root["gensym"]());
return $$TMP123;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP130;
   var $$TMP131;
if($$root["symbol?"](structure)){
$$TMP131=$$root["list"](structure,expr);
}
else{
$$TMP131=$$root["destruct-helper"](structure,expr);
}
$$TMP130=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP131),body);
return $$TMP130;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP132;
   var $$TMP133;
if($$root["list?"](expr)){
   var $$TMP134;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP134=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP134=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP133=$$TMP134;
}
else{
   $$TMP133=expr;
}
$$TMP132=$$TMP133;
return $$TMP132;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP135;
   var $$TMP136;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP136=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP137;
   var $$TMP138;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP139;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
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
if($$TMP138){
$$TMP137=$$root["list?"](expr);
}
else{
   var $$TMP140;
   if(true){
      var $$TMP141;
      var $$TMP142;
if($$root["list?"](expr)){
   var $$TMP143;
if($$root["not"]($$root["null?"](expr))){
   $$TMP143=true;
}
else{
   $$TMP143=false;
}
$$TMP142=$$TMP143;
}
else{
   $$TMP142=false;
}
if($$TMP142){
   var $$TMP144;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP145;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
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
$$TMP141=$$TMP144;
}
else{
   $$TMP141=false;
}
$$TMP140=$$TMP141;
}
else{
   $$TMP140=undefined;
}
$$TMP137=$$TMP140;
}
$$TMP136=$$TMP137;
}
$$TMP135=$$TMP136;
return $$TMP135;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP146;
   var $$TMP147;
if($$root["null?"](patt)){
$$TMP147=$$root["null?"](expr);
}
else{
   var $$TMP148;
if($$root["list?"](patt)){
$$TMP148=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP149;
if($$root["symbol?"](patt)){
   $$TMP149=true;
}
else{
   var $$TMP150;
   if(true){
$$TMP150=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP150=undefined;
}
$$TMP149=$$TMP150;
}
$$TMP148=$$TMP149;
}
$$TMP147=$$TMP148;
}
$$TMP146=$$TMP147;
return $$TMP146;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP151;
   var $$TMP152;
   var $$TMP153;
if($$root["list?"](patt)){
   var $$TMP154;
if($$root["not"]($$root["null?"](patt))){
   $$TMP154=true;
}
else{
   $$TMP154=false;
}
$$TMP153=$$TMP154;
}
else{
   $$TMP153=false;
}
if($$TMP153){
   var $$TMP155;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP155=(new $$root.Symbol("_"));
}
else{
$$TMP155=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP152=$$TMP155;
}
else{
   $$TMP152=patt;
}
$$TMP151=$$TMP152;
return $$TMP151;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP156;
   $$TMP156=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP157;
$$TMP157=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP158;
$$TMP158=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP158;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP157;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP156;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP159;
   $$TMP159=(function(__GS1){
      var $$TMP160;
      var $$TMP161;
if($$root["matches?"](__GS1,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("geti")),[])),$$root.cons((new $$root.Symbol("obj")),$$root.cons((new $$root.Symbol("field")),[]))))){
   $$TMP161=(function(__GS2){
      var $$TMP162;
      $$TMP162=(function(obj,field){
         var $$TMP163;
$$TMP163=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP163;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP162;
}
)(__GS1);
}
else{
   var $$TMP164;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP164=(function(any){
      var $$TMP165;
      var $$TMP166;
if($$root["symbol?"](any)){
$$TMP166=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP166=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP165=$$TMP166;
return $$TMP165;
}
)(__GS1);
}
else{
   var $$TMP167;
   if(true){
$$TMP167=$$root["error"]("Fell out of case!");
}
else{
   $$TMP167=undefined;
}
$$TMP164=$$TMP167;
}
$$TMP161=$$TMP164;
}
$$TMP160=$$TMP161;
return $$TMP160;
}
)($$root["macroexpand"](place));
return $$TMP159;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["push"]=(function(x,lst){
   var $$TMP168;
$$TMP168=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP168;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP169;
   var $$TMP170;
if($$root["null?"](forms)){
   $$TMP170=x;
}
else{
$$TMP170=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP169=$$TMP170;
return $$TMP169;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["while"]=(function(c,...body){
   var $$TMP171;
$$TMP171=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP171;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP172;
   $$TMP172=(function(target){
      var $$TMP173;
$$TMP173=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("sort"))),target,cmp);
return $$TMP173;
}
)(lst);
return $$TMP172;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP174;
   step=(function(c){
      var $$TMP175;
      var $$TMP176;
      if(c){
         $$TMP176=c;
      }
      else{
         $$TMP176=1;
      }
      $$TMP175=$$TMP176;
      return $$TMP175;
   }
   )(step);
   step;
   $$TMP174=(function(data){
      var $$TMP177;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP177=data;
return $$TMP177;
}
)($$root["object"]([]));
return $$TMP174;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP178;
   $$TMP178=(function(len__MINUSname,data){
      var $$TMP179;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP179=data;
return $$TMP179;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP178;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP180;
   $$TMP180=(function(lst__MINUSname,data){
      var $$TMP181;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP181=data;
return $$TMP181;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP180;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP182;
   $$TMP182=(function(__GS3){
      var $$TMP183;
      $$TMP183=(function(binding__MINUSname,__GS4){
         var $$TMP184;
         $$TMP184=(function(func__MINUSname,args){
            var $$TMP185;
$$TMP185=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP185;
}
)($$root["nth"](0,__GS4),$$root["drop"](1,__GS4));
return $$TMP184;
}
)($$root["nth"](1,__GS3),$$root["nth"](2,__GS3));
return $$TMP183;
}
)(form);
return $$TMP182;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP186;
   $$TMP186=(function(data){
      var $$TMP187;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP187=data;
return $$TMP187;
}
)($$root["object"]([]));
return $$TMP186;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP188;
   $$TMP188=(function(data){
      var $$TMP189;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP189=data;
return $$TMP189;
}
)($$root["object"]([]));
return $$TMP188;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(form){
   var $$TMP190;
   $$TMP190=(function(data){
      var $$TMP191;
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cdr"](form));
$$TMP191=data;
return $$TMP191;
}
)($$root["object"]([]));
return $$TMP190;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP192;
   $$TMP192=(function(data){
      var $$TMP193;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP193=data;
return $$TMP193;
}
)($$root["object"]([]));
return $$TMP192;
}
);
$$root["iterate-compile-let"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP194;
$$TMP194=$$root["filter"]((function(x){
   var $$TMP195;
$$TMP195=$$root["not="](x,undefined);
return $$TMP195;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP194;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP196;
   $$TMP196=(function(all){
      var $$TMP205;
$$TMP205=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("finally")),all)))))))));
return $$TMP205;
}
)($$root["map"]((function(form){
   var $$TMP197;
   $$TMP197=(function(__GS5){
      var $$TMP198;
      var $$TMP199;
if($$root["equal?"](__GS5,(new $$root.Symbol("let")))){
$$TMP199=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP200;
if($$root["equal?"](__GS5,(new $$root.Symbol("for")))){
$$TMP200=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP201;
if($$root["equal?"](__GS5,(new $$root.Symbol("while")))){
$$TMP201=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP202;
if($$root["equal?"](__GS5,(new $$root.Symbol("do")))){
$$TMP202=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP203;
if($$root["equal?"](__GS5,(new $$root.Symbol("finally")))){
$$TMP203=$$root["iterate-compile-finally"](form);
}
else{
   var $$TMP204;
   if(true){
$$TMP204=$$root["error"]("Unknown iterate form");
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
}
$$TMP199=$$TMP200;
}
$$TMP198=$$TMP199;
return $$TMP198;
}
)($$root["car"](form));
return $$TMP197;
}
),forms));
return $$TMP196;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["make-enum"]=(function(...args){
   var $$TMP206;
   $$TMP206=(function(e,len){
      var $$TMP207;
      (function(recur){
         var $$TMP208;
         recur=(function(i){
            var $$TMP209;
            var $$TMP210;
if($$root["<"](i,len)){
   $$TMP210=(function(){
      var $$TMP211;
$$root["seti!"](e,$$root["geti"](args,i),i);
$$TMP211=recur($$root["inc"](i));
return $$TMP211;
}
)();
}
else{
   $$TMP210=undefined;
}
$$TMP209=$$TMP210;
return $$TMP209;
}
);
recur;
$$TMP208=recur(0);
return $$TMP208;
}
)([]);
$$TMP207=e;
return $$TMP207;
}
)($$root["object"](),$$root["count"](args));
return $$TMP206;
}
);
$$root["make-enum"];
$$root["gen-consts"]=(function(names,suffix){
   var $$TMP212;
$$TMP212=$$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["map-indexed"]((function(name,idx){
   var $$TMP213;
$$TMP213=$$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"]($$root["symbol"]($$root["str"](name,"-",suffix))),$$root["list"](idx));
return $$TMP213;
}
),names));
return $$TMP212;
}
);
$$root["gen-consts"];
$$root["setmac!"]($$root["gen-consts"]);
$$root["list-open-tok"]=0;
$$root["list-open-tok"];
$$root["list-close-tok"]=1;
$$root["list-close-tok"];
$$root["true-tok"]=2;
$$root["true-tok"];
$$root["false-tok"]=3;
$$root["false-tok"];
$$root["null-tok"]=4;
$$root["null-tok"];
$$root["undef-tok"]=5;
$$root["undef-tok"];
$$root["num-tok"]=6;
$$root["num-tok"];
$$root["sym-tok"]=7;
$$root["sym-tok"];
$$root["str-tok"]=8;
$$root["str-tok"];
$$root["quote-tok"]=9;
$$root["quote-tok"];
$$root["backquote-tok"]=10;
$$root["backquote-tok"];
$$root["unquote-tok"]=11;
$$root["unquote-tok"];
$$root["splice-tok"]=12;
$$root["splice-tok"];
$$root["end-tok"]=13;
$$root["end-tok"];
$$root["token-proto"]=$$root["object"]();
$$root["token-proto"];
$$root["make-token"]=(function(src,type,start,len){
   var $$TMP214;
   $$TMP214=(function(o){
      var $$TMP215;
$$root["seti!"](o,(new $$root.Symbol("src")),src);
$$root["seti!"](o,(new $$root.Symbol("type")),type);
$$root["seti!"](o,(new $$root.Symbol("start")),start);
$$root["seti!"](o,(new $$root.Symbol("len")),len);
$$TMP215=o;
return $$TMP215;
}
)($$root["object"]($$root["token-proto"]));
return $$TMP214;
}
);
$$root["make-token"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP216;
   $$TMP216=(function(self){
      var $$TMP217;
      $$TMP217=(function(target){
         var $$TMP218;
$$TMP218=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substr"))),target,$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP218;
}
)($$root["geti"](self,(new $$root.Symbol("src"))));
return $$TMP217;
}
)(this);
return $$TMP216;
}
));
$$root["lit"]=(function(s){
   var $$TMP219;
$$TMP219=$$root["regex"]($$root["str"]("^",(function(target){
   var $$TMP220;
$$TMP220=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&");
return $$TMP220;
}
)(s)));
return $$TMP219;
}
);
$$root["lit"];
$$root["space-patt"]=$$root["regex"]("^\\s+");
$$root["space-patt"];
$$root["number-patt"]=$$root["regex"]("^[+\\-]?\\d+(\\.\\d*)?|^[+\\-]?\\.\\d+");
$$root["number-patt"];
$$root["sym-patt"]=$$root["regex"]("^[_.<>?+\\-=!@#$%\\^&*/a-zA-Z][_.<>?+\\-=!@#$%\\^&*/a-zA-Z0-9]*");
$$root["sym-patt"];
$$root["str-patt"]=$$root["regex"]("^\"(?:(?:\\\\\")|[^\"])*\"");
$$root["str-patt"];
$$root["token-table"]=$$root["list"]($$root["list"]($$root["space-patt"],-1),$$root["list"]($$root["regex"]("^;[^\\n]*"),-1),$$root["list"]($$root["number-patt"],$$root["num-tok"]),$$root["list"]($$root["str-patt"],$$root["str-tok"]),$$root["list"]($$root["lit"]("("),$$root["list-open-tok"]),$$root["list"]($$root["lit"](")"),$$root["list-close-tok"]),$$root["list"]($$root["lit"]("'"),$$root["quote-tok"]),$$root["list"]($$root["lit"]("`"),$$root["backquote-tok"]),$$root["list"]($$root["lit"]("~@"),$$root["splice-tok"]),$$root["list"]($$root["lit"]("~"),$$root["unquote-tok"]),$$root["list"]($$root["sym-patt"],$$root["sym-tok"]));
$$root["token-table"];
$$root["keywords"]=$$root["object"]([]);
$$root["keywords"];
$$root["seti!"]($$root["keywords"],"true",$$root["true-tok"]);
$$root["seti!"]($$root["keywords"],"false",$$root["false-tok"]);
$$root["seti!"]($$root["keywords"],"undefined",$$root["undef-tok"]);
$$root["seti!"]($$root["keywords"],"null",$$root["null-tok"]);
$$root["tokenize"]=(function(src){
   var $$TMP221;
   $$TMP221=(function(toks,pos,s){
      var $$TMP222;
      (function(recur){
         var $$TMP223;
         recur=(function(){
            var $$TMP224;
            var $$TMP225;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP225=(function(){
      var $$TMP226;
      (function(res,i,__GS6,__GS7,entry){
         var $$TMP227;
         $$TMP227=(function(recur){
            var $$TMP228;
            recur=(function(){
               var $$TMP229;
               var $$TMP230;
               var $$TMP231;
if($$root["<"](i,__GS6)){
   var $$TMP232;
if($$root["not"]($$root["null?"](__GS7))){
   var $$TMP233;
if($$root["not"](res)){
   $$TMP233=true;
}
else{
   $$TMP233=false;
}
$$TMP232=$$TMP233;
}
else{
   $$TMP232=false;
}
$$TMP231=$$TMP232;
}
else{
   $$TMP231=false;
}
if($$TMP231){
   $$TMP230=(function(){
      var $$TMP234;
entry=$$root["car"](__GS7);
entry;
res=(function(target){
   var $$TMP235;
$$TMP235=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("match"))),target,$$root["first"](entry));
return $$TMP235;
}
)(s);
res;
i=$$root["+"](i,1);
i;
__GS7=$$root["cdr"](__GS7);
__GS7;
$$TMP234=recur();
return $$TMP234;
}
)();
}
else{
   $$TMP230=(function(){
      var $$TMP236;
      var $$TMP237;
      if(res){
         $$TMP237=(function(){
            var $$TMP238;
            s=(function(target){
               var $$TMP239;
$$TMP239=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substring"))),target,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
return $$TMP239;
}
)(s);
s;
var $$TMP240;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP240=(function(){
      var $$TMP241;
toks=$$root["cons"]($$root["make-token"](src,(function(c){
   var $$TMP242;
   var $$TMP243;
   if(c){
      $$TMP243=c;
   }
   else{
$$TMP243=$$root["second"](entry);
}
$$TMP242=$$TMP243;
return $$TMP242;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP241=toks;
return $$TMP241;
}
)();
}
else{
   $$TMP240=undefined;
}
$$TMP240;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP238=pos;
return $$TMP238;
}
)();
}
else{
$$TMP237=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
$$TMP236=$$TMP237;
return $$TMP236;
}
)();
}
$$TMP229=$$TMP230;
return $$TMP229;
}
);
recur;
$$TMP228=recur();
return $$TMP228;
}
)([]);
return $$TMP227;
}
)(false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[]);
$$TMP226=recur();
return $$TMP226;
}
)();
}
else{
   $$TMP225=undefined;
}
$$TMP224=$$TMP225;
return $$TMP224;
}
);
recur;
$$TMP223=recur();
return $$TMP223;
}
)([]);
$$TMP222=$$root["reverse"]($$root["cons"]($$root["make-token"](src,$$root["end-tok"],0,0),toks));
return $$TMP222;
}
)([],0,src);
return $$TMP221;
}
);
$$root["tokenize"];
$$root["export"]((new $$root.Symbol("root")),$$root["*ns*"]);
