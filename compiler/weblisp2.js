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
    }
};

$$root["*ns*"] = $$root;
$$root.__proto__ = global;

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
$$TMP12=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP11=$$TMP12;
return $$TMP11;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["macroexpand-1"]=(function(expr){
   var $$TMP13;
   var $$TMP14;
   var $$TMP15;
if($$root["list?"](expr)){
   var $$TMP16;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
   $$TMP16=true;
}
else{
   $$TMP16=false;
}
$$TMP15=$$TMP16;
}
else{
   $$TMP15=false;
}
if($$TMP15){
$$TMP14=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
}
else{
   $$TMP14=expr;
}
$$TMP13=$$TMP14;
return $$TMP13;
}
);
$$root["macroexpand-1"];
$$root["inc"]=(function(x){
   var $$TMP17;
$$TMP17=$$root["+"](x,1);
return $$TMP17;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP18;
$$TMP18=$$root["-"](x,1);
return $$TMP18;
}
);
$$root["dec"];
$$root["inc!"]=(function(name,amt){
   var $$TMP19;
   amt=(function(c){
      var $$TMP20;
      var $$TMP21;
      if(c){
         $$TMP21=c;
      }
      else{
         $$TMP21=(function(c){
            var $$TMP22;
            var $$TMP23;
            if(c){
               $$TMP23=c;
            }
            else{
               $$TMP23=false;
            }
            $$TMP22=$$TMP23;
            return $$TMP22;
         }
         )(1);
      }
      $$TMP20=$$TMP21;
      return $$TMP20;
   }
   )(amt);
   amt;
$$TMP19=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP19;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name,amt){
   var $$TMP24;
   amt=(function(c){
      var $$TMP25;
      var $$TMP26;
      if(c){
         $$TMP26=c;
      }
      else{
         $$TMP26=(function(c){
            var $$TMP27;
            var $$TMP28;
            if(c){
               $$TMP28=c;
            }
            else{
               $$TMP28=false;
            }
            $$TMP27=$$TMP28;
            return $$TMP27;
         }
         )(1);
      }
      $$TMP25=$$TMP26;
      return $$TMP25;
   }
   )(amt);
   amt;
$$TMP24=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](amt))));
return $$TMP24;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP29;
$$TMP29=$$root["car"]($$root["cdr"](lst));
return $$TMP29;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP30;
$$TMP30=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP30;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP31;
$$TMP31=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP31;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP32;
$$TMP32=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP32;
}
);
$$root["fifth"];
$$root["getter"]=(function(field){
   var $$TMP33;
   $$TMP33=(function(obj){
      var $$TMP34;
$$TMP34=$$root["geti"](obj,field);
return $$TMP34;
}
);
return $$TMP33;
}
);
$$root["getter"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP35;
   var $$TMP36;
if($$root["null?"](lst)){
   $$TMP36=accum;
}
else{
$$TMP36=$$root["reduce"](r,$$root["cdr"](lst),r(accum,$$root["car"](lst)));
}
$$TMP35=$$TMP36;
return $$TMP35;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP37;
$$TMP37=$$root["reduce"]((function(accum,v){
   var $$TMP38;
$$TMP38=$$root["cons"](v,accum);
return $$TMP38;
}
),lst,[]);
return $$TMP37;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP39;
$$TMP39=$$root["reverse"]($$root["reduce"](r,lst,[]));
return $$TMP39;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP40;
$$TMP40=$$root["transform-list"]((function(accum,v){
   var $$TMP41;
$$TMP41=$$root["cons"](f(v),accum);
return $$TMP41;
}
),lst);
return $$TMP40;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP42;
$$TMP42=$$root["transform-list"]((function(accum,v){
   var $$TMP43;
   var $$TMP44;
   if(p(v)){
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
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP45;
$$TMP45=$$root["transform-list"]((function(accum,v){
   var $$TMP46;
n=$$root["-"](n,1);
n;
var $$TMP47;
if($$root[">="](n,0)){
$$TMP47=$$root["cons"](v,accum);
}
else{
   $$TMP47=accum;
}
$$TMP46=$$TMP47;
return $$TMP46;
}
),lst);
return $$TMP45;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP48;
$$TMP48=$$root["transform-list"]((function(accum,v){
   var $$TMP49;
n=$$root["-"](n,1);
n;
var $$TMP50;
if($$root[">="](n,0)){
   $$TMP50=accum;
}
else{
$$TMP50=$$root["cons"](v,accum);
}
$$TMP49=$$TMP50;
return $$TMP49;
}
),lst);
return $$TMP48;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP51;
   $$TMP51=(function(counter){
      var $$TMP52;
$$TMP52=$$root["transform-list"]((function(accum,v){
   var $$TMP53;
   var $$TMP54;
counter=$$root["+"](counter,1);
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP54=$$root["cons"](v,accum);
}
else{
   $$TMP54=accum;
}
$$TMP53=$$TMP54;
return $$TMP53;
}
),lst);
return $$TMP52;
}
)(-1);
return $$TMP51;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP55;
   var $$TMP56;
if($$root["="](n,0)){
$$TMP56=$$root["car"](lst);
}
else{
$$TMP56=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
}
$$TMP55=$$TMP56;
return $$TMP55;
}
);
$$root["nth"];
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
         $$TMP64=(function(c){
            var $$TMP65;
            var $$TMP66;
            if(c){
               $$TMP66=c;
            }
            else{
               $$TMP66=false;
            }
            $$TMP65=$$TMP66;
            return $$TMP65;
         }
)($$root["null?"](v));
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
   var $$TMP67;
$$TMP67=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP67;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["find"]=(function(f,arg,lst){
   var $$TMP68;
   $$TMP68=(function(idx){
      var $$TMP69;
$$TMP69=$$root["reduce"]((function(accum,v){
   var $$TMP70;
idx=$$root["+"](idx,1);
idx;
var $$TMP71;
if(f(arg,v)){
   $$TMP71=idx;
}
else{
   $$TMP71=accum;
}
$$TMP70=$$TMP71;
return $$TMP70;
}
),lst,-1);
return $$TMP69;
}
)(-1);
return $$TMP68;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP72;
   var $$TMP73;
if($$root["atom?"](x)){
$$TMP73=$$root["list"](x);
}
else{
$$TMP73=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP72=$$TMP73;
return $$TMP72;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP74;
   $$TMP74=(function(idx){
      var $$TMP75;
$$TMP75=$$root["transform-list"]((function(accum,v){
   var $$TMP76;
idx=$$root["+"](idx,1);
$$TMP76=$$root["cons"](f(v,idx),accum);
return $$TMP76;
}
),lst);
return $$TMP75;
}
)(-1);
return $$TMP74;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP77;
$$TMP77=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP77;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP78;
   var $$TMP79;
if($$root["null?"](lst)){
   $$TMP79=[];
}
else{
$$TMP79=$$root["reverse"]((function(recur){
   var $$TMP80;
   recur=(function(accum,part,rem,counter){
      var $$TMP81;
      var $$TMP82;
if($$root["null?"](rem)){
$$TMP82=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP83;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP83=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP83=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP82=$$TMP83;
}
$$TMP81=$$TMP82;
return $$TMP81;
}
);
recur;
$$TMP80=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP80;
}
)([]));
}
$$TMP78=$$TMP79;
return $$TMP78;
}
);
$$root["partition"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP84;
   var $$TMP85;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP85=obj__MINUSname;
}
else{
$$TMP85=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP84=$$TMP85;
return $$TMP84;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP86;
   $$TMP86=(function(rev__MINUSfields){
      var $$TMP87;
      var $$TMP88;
if($$root["list?"]($$root["car"](rev__MINUSfields))){
$$TMP88=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
}
else{
$$TMP88=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
}
$$TMP87=$$TMP88;
return $$TMP87;
}
)($$root["reverse"](fields));
return $$TMP86;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["equal?"]=(function(a,b){
   var $$TMP89;
   var $$TMP90;
if($$root["null?"](a)){
$$TMP90=$$root["null?"](b);
}
else{
   var $$TMP91;
if($$root["symbol?"](a)){
   var $$TMP92;
if($$root["symbol?"](b)){
   var $$TMP93;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
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
   var $$TMP94;
if($$root["atom?"](a)){
$$TMP94=$$root["="](a,b);
}
else{
   var $$TMP95;
if($$root["list?"](a)){
   var $$TMP96;
if($$root["list?"](b)){
   var $$TMP97;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP98;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP98=true;
}
else{
   $$TMP98=false;
}
$$TMP97=$$TMP98;
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
   $$TMP95=undefined;
}
$$TMP94=$$TMP95;
}
$$TMP91=$$TMP94;
}
$$TMP90=$$TMP91;
}
$$TMP89=$$TMP90;
return $$TMP89;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP99;
   $$TMP99=(function(res){
      var $$TMP107;
$$TMP107=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP107;
}
)((function(recur){
   var $$TMP100;
   recur=(function(l1,l2){
      var $$TMP101;
      var $$TMP102;
      if((function(c){
         var $$TMP103;
         var $$TMP104;
         if(c){
            $$TMP104=c;
         }
         else{
            $$TMP104=(function(c){
               var $$TMP105;
               var $$TMP106;
               if(c){
                  $$TMP106=c;
               }
               else{
                  $$TMP106=false;
               }
               $$TMP105=$$TMP106;
               return $$TMP105;
            }
)(p($$root["car"](l2)));
}
$$TMP103=$$TMP104;
return $$TMP103;
}
)($$root["null?"](l2))){
$$TMP102=$$root["list"](l1,l2);
}
else{
$$TMP102=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP101=$$TMP102;
return $$TMP101;
}
);
recur;
$$TMP100=recur([],lst);
return $$TMP100;
}
)([]));
return $$TMP99;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP108;
   var $$TMP109;
if($$root["reduce"]((function(accum,v){
   var $$TMP110;
   var $$TMP111;
   if(accum){
      $$TMP111=accum;
   }
   else{
      $$TMP111=v;
   }
   $$TMP110=$$TMP111;
   return $$TMP110;
}
),lst,false)){
   $$TMP109=true;
}
else{
   $$TMP109=false;
}
$$TMP108=$$TMP109;
return $$TMP108;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP112;
$$TMP112=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP113;
   var $$TMP114;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP115;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP115=true;
}
else{
   $$TMP115=false;
}
$$TMP114=$$TMP115;
}
else{
   $$TMP114=false;
}
$$TMP113=$$TMP114;
return $$TMP113;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP112;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP116;
   $$TMP116=(function(binding__MINUSnames){
      var $$TMP117;
      $$TMP117=(function(divs){
         var $$TMP119;
         var $$TMP120;
if($$root["null?"]($$root["second"](divs))){
$$TMP120=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP120=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP119=$$TMP120;
return $$TMP119;
}
)($$root["split"]((function(pair){
   var $$TMP118;
$$TMP118=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP118;
}
),binding__MINUSpairs));
return $$TMP117;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP116;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP121;
$$TMP121=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP121;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP122;
   $$TMP122=(function(x){
      var $$TMP123;
$$TMP123=$$root["not"](f(x));
return $$TMP123;
}
);
return $$TMP122;
}
);
$$root["complement"];
$$root["case"]=(function(e,...pairs){
   var $$TMP124;
   $$TMP124=(function(e__MINUSname,def__MINUSidx){
      var $$TMP125;
      var $$TMP126;
if($$root["="](def__MINUSidx,-1)){
$$TMP126=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
}
else{
$$TMP126=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP125=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP127;
$$TMP127=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP128;
$$TMP128=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP128;
}
),$$root["filter"]((function(pair){
   var $$TMP129;
$$TMP129=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP129;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP127;
}
)($$TMP126,$$root["partition"](2,pairs));
return $$TMP125;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP124;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP130;
   $$TMP130=(function(expr__MINUSname){
      var $$TMP131;
$$TMP131=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP132;
   var $$TMP133;
if($$root["symbol?"](v)){
   var $$TMP134;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP134=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
   var $$TMP135;
$$TMP135=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP135;
}
)($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP136;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP136=[];
}
else{
$$TMP136=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP134=$$TMP136;
}
$$TMP133=$$TMP134;
}
else{
$$TMP133=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP132=$$TMP133;
return $$TMP132;
}
),structure)));
return $$TMP131;
}
)($$root["gensym"]());
return $$TMP130;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP137;
   var $$TMP138;
if($$root["symbol?"](structure)){
$$TMP138=$$root["list"](structure,expr);
}
else{
$$TMP138=$$root["destruct-helper"](structure,expr);
}
$$TMP137=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP138),body);
return $$TMP137;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP139;
   var $$TMP140;
if($$root["list?"](expr)){
   var $$TMP141;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP141=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP141=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP140=$$TMP141;
}
else{
   $$TMP140=expr;
}
$$TMP139=$$TMP140;
return $$TMP139;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP142;
   var $$TMP143;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP143=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP144;
   var $$TMP145;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP146;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
   $$TMP146=true;
}
else{
   $$TMP146=false;
}
$$TMP145=$$TMP146;
}
else{
   $$TMP145=false;
}
if($$TMP145){
$$TMP144=$$root["list?"](expr);
}
else{
   var $$TMP147;
   if(true){
      var $$TMP148;
      var $$TMP149;
if($$root["list?"](expr)){
   var $$TMP150;
if($$root["not"]($$root["null?"](expr))){
   $$TMP150=true;
}
else{
   $$TMP150=false;
}
$$TMP149=$$TMP150;
}
else{
   $$TMP149=false;
}
if($$TMP149){
   var $$TMP151;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP152;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP152=true;
}
else{
   $$TMP152=false;
}
$$TMP151=$$TMP152;
}
else{
   $$TMP151=false;
}
$$TMP148=$$TMP151;
}
else{
   $$TMP148=false;
}
$$TMP147=$$TMP148;
}
else{
   $$TMP147=undefined;
}
$$TMP144=$$TMP147;
}
$$TMP143=$$TMP144;
}
$$TMP142=$$TMP143;
return $$TMP142;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP153;
   var $$TMP154;
if($$root["null?"](patt)){
$$TMP154=$$root["null?"](expr);
}
else{
   var $$TMP155;
if($$root["list?"](patt)){
$$TMP155=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP156;
if($$root["symbol?"](patt)){
   $$TMP156=true;
}
else{
   var $$TMP157;
   if(true){
$$TMP157=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP157=undefined;
}
$$TMP156=$$TMP157;
}
$$TMP155=$$TMP156;
}
$$TMP154=$$TMP155;
}
$$TMP153=$$TMP154;
return $$TMP153;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP158;
   var $$TMP159;
   var $$TMP160;
if($$root["list?"](patt)){
   var $$TMP161;
if($$root["not"]($$root["null?"](patt))){
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
   var $$TMP162;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP162=(new $$root.Symbol("_"));
}
else{
$$TMP162=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP159=$$TMP162;
}
else{
   $$TMP159=patt;
}
$$TMP158=$$TMP159;
return $$TMP158;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP163;
   $$TMP163=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP164;
$$TMP164=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP165;
$$TMP165=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP165;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP164;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP163;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP166;
   $$TMP166=(function(__GS1){
      var $$TMP167;
      var $$TMP168;
if($$root["matches?"](__GS1,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("geti")),[])),$$root.cons((new $$root.Symbol("obj")),$$root.cons((new $$root.Symbol("field")),[]))))){
   $$TMP168=(function(__GS2){
      var $$TMP169;
      $$TMP169=(function(obj,field){
         var $$TMP170;
$$TMP170=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP170;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP169;
}
)(__GS1);
}
else{
   var $$TMP171;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP171=(function(any){
      var $$TMP172;
      var $$TMP173;
if($$root["symbol?"](any)){
$$TMP173=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP173=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP172=$$TMP173;
return $$TMP172;
}
)(__GS1);
}
else{
   var $$TMP174;
   if(true){
$$TMP174=$$root["error"]("Fell out of case!");
}
else{
   $$TMP174=undefined;
}
$$TMP171=$$TMP174;
}
$$TMP168=$$TMP171;
}
$$TMP167=$$TMP168;
return $$TMP167;
}
)($$root["macroexpand"](place));
return $$TMP166;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["push"]=(function(x,lst){
   var $$TMP175;
$$TMP175=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP175;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP176;
   var $$TMP177;
if($$root["null?"](forms)){
   $$TMP177=x;
}
else{
$$TMP177=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP176=$$TMP177;
return $$TMP176;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["while"]=(function(c,...body){
   var $$TMP178;
$$TMP178=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP178;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP179;
   $$TMP179=(function(target){
      var $$TMP180;
$$TMP180=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("sort"))),target,cmp);
return $$TMP180;
}
)(lst);
return $$TMP179;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP181;
   step=(function(c){
      var $$TMP182;
      var $$TMP183;
      if(c){
         $$TMP183=c;
      }
      else{
         $$TMP183=(function(c){
            var $$TMP184;
            var $$TMP185;
            if(c){
               $$TMP185=c;
            }
            else{
               $$TMP185=false;
            }
            $$TMP184=$$TMP185;
            return $$TMP184;
         }
         )(1);
      }
      $$TMP182=$$TMP183;
      return $$TMP182;
   }
   )(step);
   step;
   $$TMP181=(function(data){
      var $$TMP186;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](binding__MINUSname,start));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
$$TMP186=data;
return $$TMP186;
}
)($$root["object"]([]));
return $$TMP181;
}
);
$$root["in-range"];
$$root["index-in"]=(function(binding__MINUSname,expr){
   var $$TMP187;
   $$TMP187=(function(len__MINUSname,data){
      var $$TMP188;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["concat"]($$root["list"](binding__MINUSname),$$root["list"](0),$$root["list"](len__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("count"))),$$root["list"](expr)))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](1)))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](len__MINUSname)));
$$TMP188=data;
return $$TMP188;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP187;
}
);
$$root["index-in"];
$$root["in-list"]=(function(binding__MINUSname,expr){
   var $$TMP189;
   $$TMP189=(function(lst__MINUSname,data){
      var $$TMP190;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["list"](lst__MINUSname,expr,binding__MINUSname,[]));
$$root["seti!"](data,(new $$root.Symbol("pre")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](binding__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("car"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("post")),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("set!"))),$$root["list"](lst__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cdr"))),$$root["list"](lst__MINUSname)))))));
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["concat"]($$root["list"]((new $$root.Symbol("not"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("null?"))),$$root["list"](lst__MINUSname)))));
$$TMP190=data;
return $$TMP190;
}
)($$root["gensym"](),$$root["object"]([]));
return $$TMP189;
}
);
$$root["in-list"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP191;
   $$TMP191=(function(__GS3){
      var $$TMP192;
      $$TMP192=(function(binding__MINUSname,__GS4){
         var $$TMP193;
         $$TMP193=(function(func__MINUSname,args){
            var $$TMP194;
$$TMP194=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP194;
}
)($$root["nth"](0,__GS4),$$root["drop"](1,__GS4));
return $$TMP193;
}
)($$root["nth"](1,__GS3),$$root["nth"](2,__GS3));
return $$TMP192;
}
)(form);
return $$TMP191;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP195;
   $$TMP195=(function(data){
      var $$TMP196;
$$root["seti!"](data,(new $$root.Symbol("cond")),$$root["second"](form));
$$TMP196=data;
return $$TMP196;
}
)($$root["object"]([]));
return $$TMP195;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP197;
   $$TMP197=(function(data){
      var $$TMP198;
$$root["seti!"](data,(new $$root.Symbol("body")),$$root["cdr"](form));
$$TMP198=data;
return $$TMP198;
}
)($$root["object"]([]));
return $$TMP197;
}
);
$$root["iterate-compile-do"];
$$root["iterate-compile-finally"]=(function(form){
   var $$TMP199;
   $$TMP199=(function(data){
      var $$TMP200;
$$root["seti!"](data,(new $$root.Symbol("finally")),$$root["cdr"](form));
$$TMP200=data;
return $$TMP200;
}
)($$root["object"]([]));
return $$TMP199;
}
);
$$root["iterate-compile-finally"];
$$root["iterate-compile-let"]=(function(form){
   var $$TMP201;
   $$TMP201=(function(data){
      var $$TMP202;
$$root["seti!"](data,(new $$root.Symbol("bind")),$$root["second"](form));
$$TMP202=data;
return $$TMP202;
}
)($$root["object"]([]));
return $$TMP201;
}
);
$$root["iterate-compile-let"];
$$root["collect-field"]=(function(field,objs){
   var $$TMP203;
$$TMP203=$$root["filter"]((function(x){
   var $$TMP204;
$$TMP204=$$root["not="](x,undefined);
return $$TMP204;
}
),$$root["map"]($$root["getter"](field),objs));
return $$TMP203;
}
);
$$root["collect-field"];
$$root["iterate"]=(function(...forms){
   var $$TMP205;
   $$TMP205=(function(all){
      var $$TMP214;
$$TMP214=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("bind")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["collect-field"]((new $$root.Symbol("cond")),all))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("pre")),all)),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("body")),all)),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("post")),all)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["apply"]($$root["concat"],$$root["collect-field"]((new $$root.Symbol("finally")),all)))))))));
return $$TMP214;
}
)($$root["map"]((function(form){
   var $$TMP206;
   $$TMP206=(function(__GS5){
      var $$TMP207;
      var $$TMP208;
if($$root["equal?"](__GS5,(new $$root.Symbol("let")))){
$$TMP208=$$root["iterate-compile-let"](form);
}
else{
   var $$TMP209;
if($$root["equal?"](__GS5,(new $$root.Symbol("for")))){
$$TMP209=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP210;
if($$root["equal?"](__GS5,(new $$root.Symbol("while")))){
$$TMP210=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP211;
if($$root["equal?"](__GS5,(new $$root.Symbol("do")))){
$$TMP211=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP212;
if($$root["equal?"](__GS5,(new $$root.Symbol("finally")))){
$$TMP212=$$root["iterate-compile-finally"](form);
}
else{
   var $$TMP213;
   if(true){
$$TMP213=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP213=undefined;
}
$$TMP212=$$TMP213;
}
$$TMP211=$$TMP212;
}
$$TMP210=$$TMP211;
}
$$TMP209=$$TMP210;
}
$$TMP208=$$TMP209;
}
$$TMP207=$$TMP208;
return $$TMP207;
}
)($$root["car"](form));
return $$TMP206;
}
),forms));
return $$TMP205;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
$$root["make-enum"]=(function(...args){
   var $$TMP215;
   $$TMP215=(function(e,len){
      var $$TMP216;
      (function(recur){
         var $$TMP217;
         recur=(function(i){
            var $$TMP218;
            var $$TMP219;
if($$root["<"](i,len)){
   $$TMP219=(function(){
      var $$TMP220;
$$root["seti!"](e,$$root["geti"](args,i),i);
$$TMP220=recur($$root["inc"](i));
return $$TMP220;
}
)();
}
else{
   $$TMP219=undefined;
}
$$TMP218=$$TMP219;
return $$TMP218;
}
);
recur;
$$TMP217=recur(0);
return $$TMP217;
}
)([]);
$$TMP216=e;
return $$TMP216;
}
)($$root["object"](),$$root["count"](args));
return $$TMP215;
}
);
$$root["make-enum"];
$$root["gen-consts"]=(function(names,suffix){
   var $$TMP221;
$$TMP221=$$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["map-indexed"]((function(name,idx){
   var $$TMP222;
$$TMP222=$$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"]($$root["symbol"]($$root["str"](name,"-",suffix))),$$root["list"](idx));
return $$TMP222;
}
),names));
return $$TMP221;
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
   var $$TMP223;
   $$TMP223=(function(o){
      var $$TMP224;
$$root["seti!"](o,(new $$root.Symbol("src")),src);
$$root["seti!"](o,(new $$root.Symbol("type")),type);
$$root["seti!"](o,(new $$root.Symbol("start")),start);
$$root["seti!"](o,(new $$root.Symbol("len")),len);
$$TMP224=o;
return $$TMP224;
}
)($$root["object"]($$root["token-proto"]));
return $$TMP223;
}
);
$$root["make-token"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP225;
   $$TMP225=(function(self){
      var $$TMP226;
      $$TMP226=(function(target){
         var $$TMP227;
$$TMP227=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substr"))),target,$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP227;
}
)($$root["geti"](self,(new $$root.Symbol("src"))));
return $$TMP226;
}
)(this);
return $$TMP225;
}
));
$$root["lit"]=(function(s){
   var $$TMP228;
$$TMP228=$$root["regex"]($$root["str"]("^",(function(target){
   var $$TMP229;
$$TMP229=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&");
return $$TMP229;
}
)(s)));
return $$TMP228;
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
$$root["seti!"]($$root["keywords"],"undefined",$$root["undefined-tok"]);
$$root["seti!"]($$root["keywords"],"null",$$root["null-tok"]);
$$root["tokenize"]=(function(src){
   var $$TMP230;
   $$TMP230=(function(toks,pos,s){
      var $$TMP231;
      (function(recur){
         var $$TMP232;
         recur=(function(){
            var $$TMP233;
            var $$TMP234;
if($$root[">"]($$root["geti"](s,(new $$root.Symbol("length"))),0)){
   $$TMP234=(function(){
      var $$TMP235;
      (function(res,i,__GS6,__GS7,entry){
         var $$TMP236;
         $$TMP236=(function(recur){
            var $$TMP237;
            recur=(function(){
               var $$TMP238;
               var $$TMP239;
               var $$TMP240;
if($$root["<"](i,__GS6)){
   var $$TMP241;
if($$root["not"]($$root["null?"](__GS7))){
   var $$TMP242;
if($$root["not"](res)){
   $$TMP242=true;
}
else{
   $$TMP242=false;
}
$$TMP241=$$TMP242;
}
else{
   $$TMP241=false;
}
$$TMP240=$$TMP241;
}
else{
   $$TMP240=false;
}
if($$TMP240){
   $$TMP239=(function(){
      var $$TMP243;
entry=$$root["car"](__GS7);
entry;
res=(function(target){
   var $$TMP244;
$$TMP244=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("match"))),target,$$root["first"](entry));
return $$TMP244;
}
)(s);
res;
i=$$root["+"](i,1);
i;
__GS7=$$root["cdr"](__GS7);
__GS7;
$$TMP243=recur();
return $$TMP243;
}
)();
}
else{
   $$TMP239=(function(){
      var $$TMP245;
      var $$TMP246;
      if(res){
         $$TMP246=(function(){
            var $$TMP247;
            s=(function(target){
               var $$TMP248;
$$TMP248=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substring"))),target,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
return $$TMP248;
}
)(s);
s;
var $$TMP249;
if($$root["not="]($$root["second"](entry),-1)){
   $$TMP249=(function(){
      var $$TMP250;
toks=$$root["cons"]($$root["make-token"](src,(function(c){
   var $$TMP251;
   var $$TMP252;
   if(c){
      $$TMP252=c;
   }
   else{
      $$TMP252=(function(c){
         var $$TMP253;
         var $$TMP254;
         if(c){
            $$TMP254=c;
         }
         else{
            $$TMP254=false;
         }
         $$TMP253=$$TMP254;
         return $$TMP253;
      }
)($$root["second"](entry));
}
$$TMP251=$$TMP252;
return $$TMP251;
}
)($$root["geti"]($$root["keywords"],$$root["geti"](res,0))),pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length")))),toks);
$$TMP250=toks;
return $$TMP250;
}
)();
}
else{
   $$TMP249=undefined;
}
$$TMP249;
pos=$$root["+"](pos,$$root["geti"]($$root["geti"](res,0),(new $$root.Symbol("length"))));
$$TMP247=pos;
return $$TMP247;
}
)();
}
else{
$$TMP246=$$root["error"]($$root["str"]("Unrecognized token: ",s));
}
$$TMP245=$$TMP246;
return $$TMP245;
}
)();
}
$$TMP238=$$TMP239;
return $$TMP238;
}
);
recur;
$$TMP237=recur();
return $$TMP237;
}
)([]);
return $$TMP236;
}
)(false,0,$$root["count"]($$root["token-table"]),$$root["token-table"],[]);
$$TMP235=recur();
return $$TMP235;
}
)();
}
else{
   $$TMP234=undefined;
}
$$TMP233=$$TMP234;
return $$TMP233;
}
);
recur;
$$TMP232=recur();
return $$TMP232;
}
)([]);
$$TMP231=$$root["reverse"]($$root["cons"]($$root["end-tok"],toks));
return $$TMP231;
}
)([],0,src);
return $$TMP230;
}
);
$$root["tokenize"];
