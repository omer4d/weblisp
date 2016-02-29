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
$$TMP4=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),body)));
return $$TMP4;
}
);
$$root["progn"];
$$root["setmac!"]($$root["progn"]);
$$root["when"]=(function(c,...body){
   var $$TMP5;
$$TMP5=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)),$$root["list"](undefined));
return $$TMP5;
}
);
$$root["when"];
$$root["setmac!"]($$root["when"]);
$$root["cond"]=(function(...pairs){
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
$$root["and"]=(function(...args){
   var $$TMP8;
   var $$TMP9;
if($$root["null?"](args)){
   $$TMP9=true;
}
else{
$$TMP9=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["cdr"](args))),$$root["list"](false));
}
$$TMP8=$$TMP9;
return $$TMP8;
}
);
$$root["and"];
$$root["setmac!"]($$root["and"]);
$$root["or"]=(function(...args){
   var $$TMP10;
   var $$TMP11;
if($$root["null?"](args)){
   $$TMP11=false;
}
else{
$$TMP11=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("c"))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]((new $$root.Symbol("c"))),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))))))),$$root["list"]($$root["car"](args)));
}
$$TMP10=$$TMP11;
return $$TMP10;
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
$$root["inc!"]=(function(name,amt){
   var $$TMP18;
   amt=(function(c){
      var $$TMP19;
      var $$TMP20;
      if(c){
         $$TMP20=c;
      }
      else{
         $$TMP20=(function(c){
            var $$TMP21;
            var $$TMP22;
            if(c){
               $$TMP22=c;
            }
            else{
               $$TMP22=false;
            }
            $$TMP21=$$TMP22;
            return $$TMP21;
         }
         )(1);
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
         $$TMP25=(function(c){
            var $$TMP26;
            var $$TMP27;
            if(c){
               $$TMP27=c;
            }
            else{
               $$TMP27=false;
            }
            $$TMP26=$$TMP27;
            return $$TMP26;
         }
         )(1);
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
   var $$TMP28;
$$TMP28=$$root["car"]($$root["cdr"](lst));
return $$TMP28;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP29;
$$TMP29=$$root["car"]($$root["cdr"]($$root["cdr"](lst)));
return $$TMP29;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP30;
$$TMP30=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst))));
return $$TMP30;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP31;
$$TMP31=$$root["car"]($$root["cdr"]($$root["cdr"]($$root["cdr"]($$root["cdr"](lst)))));
return $$TMP31;
}
);
$$root["fifth"];
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
         $$TMP61=(function(c){
            var $$TMP62;
            var $$TMP63;
            if(c){
               $$TMP63=c;
            }
            else{
               $$TMP63=false;
            }
            $$TMP62=$$TMP63;
            return $$TMP62;
         }
)($$root["null?"](v));
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
   var $$TMP64;
$$TMP64=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
return $$TMP64;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["find"]=(function(f,arg,lst){
   var $$TMP65;
   $$TMP65=(function(idx){
      var $$TMP66;
$$TMP66=$$root["reduce"]((function(accum,v){
   var $$TMP67;
idx=$$root["+"](idx,1);
idx;
var $$TMP68;
if(f(arg,v)){
   $$TMP68=idx;
}
else{
   $$TMP68=accum;
}
$$TMP67=$$TMP68;
return $$TMP67;
}
),lst,-1);
return $$TMP66;
}
)(-1);
return $$TMP65;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP69;
   var $$TMP70;
if($$root["atom?"](x)){
$$TMP70=$$root["list"](x);
}
else{
$$TMP70=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
}
$$TMP69=$$TMP70;
return $$TMP69;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP71;
   $$TMP71=(function(idx){
      var $$TMP72;
$$TMP72=$$root["transform-list"]((function(accum,v){
   var $$TMP73;
idx=$$root["+"](idx,1);
$$TMP73=$$root["cons"](f(v,idx),accum);
return $$TMP73;
}
),lst);
return $$TMP72;
}
)(-1);
return $$TMP71;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP74;
$$TMP74=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
return $$TMP74;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP75;
   var $$TMP76;
if($$root["null?"](lst)){
   $$TMP76=[];
}
else{
$$TMP76=$$root["reverse"]((function(recur){
   var $$TMP77;
   recur=(function(accum,part,rem,counter){
      var $$TMP78;
      var $$TMP79;
if($$root["null?"](rem)){
$$TMP79=$$root["cons"]($$root["reverse"](part),accum);
}
else{
   var $$TMP80;
if($$root["="]($$root["mod"](counter,n),0)){
$$TMP80=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
}
else{
$$TMP80=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
}
$$TMP79=$$TMP80;
}
$$TMP78=$$TMP79;
return $$TMP78;
}
);
recur;
$$TMP77=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
return $$TMP77;
}
)([]));
}
$$TMP75=$$TMP76;
return $$TMP75;
}
);
$$root["partition"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP81;
   var $$TMP82;
if($$root["null?"](reversed__MINUSfields)){
   $$TMP82=obj__MINUSname;
}
else{
$$TMP82=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
}
$$TMP81=$$TMP82;
return $$TMP81;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP83;
   $$TMP83=(function(rev__MINUSfields){
      var $$TMP84;
      var $$TMP85;
if($$root["list?"]($$root["car"](rev__MINUSfields))){
$$TMP85=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
}
else{
$$TMP85=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
}
$$TMP84=$$TMP85;
return $$TMP84;
}
)($$root["reverse"](fields));
return $$TMP83;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["equal?"]=(function(a,b){
   var $$TMP86;
   var $$TMP87;
if($$root["null?"](a)){
$$TMP87=$$root["null?"](b);
}
else{
   var $$TMP88;
if($$root["symbol?"](a)){
   var $$TMP89;
if($$root["symbol?"](b)){
   var $$TMP90;
if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
   $$TMP90=true;
}
else{
   $$TMP90=false;
}
$$TMP89=$$TMP90;
}
else{
   $$TMP89=false;
}
$$TMP88=$$TMP89;
}
else{
   var $$TMP91;
if($$root["atom?"](a)){
$$TMP91=$$root["="](a,b);
}
else{
   var $$TMP92;
if($$root["list?"](a)){
   var $$TMP93;
if($$root["list?"](b)){
   var $$TMP94;
if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
   var $$TMP95;
if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
   $$TMP95=true;
}
else{
   $$TMP95=false;
}
$$TMP94=$$TMP95;
}
else{
   $$TMP94=false;
}
$$TMP93=$$TMP94;
}
else{
   $$TMP93=false;
}
$$TMP92=$$TMP93;
}
else{
   $$TMP92=undefined;
}
$$TMP91=$$TMP92;
}
$$TMP88=$$TMP91;
}
$$TMP87=$$TMP88;
}
$$TMP86=$$TMP87;
return $$TMP86;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP96;
   $$TMP96=(function(res){
      var $$TMP104;
$$TMP104=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
return $$TMP104;
}
)((function(recur){
   var $$TMP97;
   recur=(function(l1,l2){
      var $$TMP98;
      var $$TMP99;
      if((function(c){
         var $$TMP100;
         var $$TMP101;
         if(c){
            $$TMP101=c;
         }
         else{
            $$TMP101=(function(c){
               var $$TMP102;
               var $$TMP103;
               if(c){
                  $$TMP103=c;
               }
               else{
                  $$TMP103=false;
               }
               $$TMP102=$$TMP103;
               return $$TMP102;
            }
)(p($$root["car"](l2)));
}
$$TMP100=$$TMP101;
return $$TMP100;
}
)($$root["null?"](l2))){
$$TMP99=$$root["list"](l1,l2);
}
else{
$$TMP99=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
}
$$TMP98=$$TMP99;
return $$TMP98;
}
);
recur;
$$TMP97=recur([],lst);
return $$TMP97;
}
)([]));
return $$TMP96;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP105;
   var $$TMP106;
if($$root["reduce"]((function(accum,v){
   var $$TMP107;
   var $$TMP108;
   if(accum){
      $$TMP108=accum;
   }
   else{
      $$TMP108=v;
   }
   $$TMP107=$$TMP108;
   return $$TMP107;
}
),lst,false)){
   $$TMP106=true;
}
else{
   $$TMP106=false;
}
$$TMP105=$$TMP106;
return $$TMP105;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP109;
$$TMP109=$$root["any?"]($$root["map"]((function(sym){
   var $$TMP110;
   var $$TMP111;
if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
   var $$TMP112;
if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
   $$TMP112=true;
}
else{
   $$TMP112=false;
}
$$TMP111=$$TMP112;
}
else{
   $$TMP111=false;
}
$$TMP110=$$TMP111;
return $$TMP110;
}
),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
return $$TMP109;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP113;
   $$TMP113=(function(binding__MINUSnames){
      var $$TMP114;
      $$TMP114=(function(divs){
         var $$TMP116;
         var $$TMP117;
if($$root["null?"]($$root["second"](divs))){
$$TMP117=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
}
else{
$$TMP117=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
}
$$TMP116=$$TMP117;
return $$TMP116;
}
)($$root["split"]((function(pair){
   var $$TMP115;
$$TMP115=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
return $$TMP115;
}
),binding__MINUSpairs));
return $$TMP114;
}
)($$root["map"]($$root["first"],binding__MINUSpairs));
return $$TMP113;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP118;
$$TMP118=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
return $$TMP118;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["complement"]=(function(f){
   var $$TMP119;
   $$TMP119=(function(x){
      var $$TMP120;
$$TMP120=$$root["not"](f(x));
return $$TMP120;
}
);
return $$TMP119;
}
);
$$root["complement"];
$$root["case"]=(function(e,...pairs){
   var $$TMP121;
   $$TMP121=(function(e__MINUSname,def__MINUSidx){
      var $$TMP122;
      var $$TMP123;
if($$root["="](def__MINUSidx,-1)){
$$TMP123=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
}
else{
$$TMP123=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
}
$$TMP122=(function(def__MINUSexpr,zipped__MINUSpairs){
   var $$TMP124;
$$TMP124=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP125;
$$TMP125=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("equal?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
return $$TMP125;
}
),$$root["filter"]((function(pair){
   var $$TMP126;
$$TMP126=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
return $$TMP126;
}
),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
return $$TMP124;
}
)($$TMP123,$$root["partition"](2,pairs));
return $$TMP122;
}
)($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
return $$TMP121;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP127;
   $$TMP127=(function(expr__MINUSname){
      var $$TMP128;
$$TMP128=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
   var $$TMP129;
   var $$TMP130;
if($$root["symbol?"](v)){
   var $$TMP131;
if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
$$TMP131=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
   var $$TMP132;
$$TMP132=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
return $$TMP132;
}
)($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
else{
   var $$TMP133;
if($$root["="]($$root["geti"](v,(new $$root.Symbol("name"))),"_")){
   $$TMP133=[];
}
else{
$$TMP133=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
}
$$TMP131=$$TMP133;
}
$$TMP130=$$TMP131;
}
else{
$$TMP130=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
}
$$TMP129=$$TMP130;
return $$TMP129;
}
),structure)));
return $$TMP128;
}
)($$root["gensym"]());
return $$TMP127;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP134;
   var $$TMP135;
if($$root["symbol?"](structure)){
$$TMP135=$$root["list"](structure,expr);
}
else{
$$TMP135=$$root["destruct-helper"](structure,expr);
}
$$TMP134=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$TMP135),body);
return $$TMP134;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP136;
   var $$TMP137;
if($$root["list?"](expr)){
   var $$TMP138;
if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
$$TMP138=$$root["macroexpand"]($$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr)));
}
else{
$$TMP138=$$root["map"]($$root["macroexpand"],expr);
}
$$TMP137=$$TMP138;
}
else{
   $$TMP137=expr;
}
$$TMP136=$$TMP137;
return $$TMP136;
}
);
$$root["macroexpand"];
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP139;
   var $$TMP140;
if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
$$TMP140=$$root["equal?"]($$root["second"](patt),expr);
}
else{
   var $$TMP141;
   var $$TMP142;
if($$root["symbol?"]($$root["first"](patt))){
   var $$TMP143;
if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
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
$$TMP141=$$root["list?"](expr);
}
else{
   var $$TMP144;
   if(true){
      var $$TMP145;
      var $$TMP146;
if($$root["list?"](expr)){
   var $$TMP147;
if($$root["not"]($$root["null?"](expr))){
   $$TMP147=true;
}
else{
   $$TMP147=false;
}
$$TMP146=$$TMP147;
}
else{
   $$TMP146=false;
}
if($$TMP146){
   var $$TMP148;
if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
   var $$TMP149;
if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
   $$TMP149=true;
}
else{
   $$TMP149=false;
}
$$TMP148=$$TMP149;
}
else{
   $$TMP148=false;
}
$$TMP145=$$TMP148;
}
else{
   $$TMP145=false;
}
$$TMP144=$$TMP145;
}
else{
   $$TMP144=undefined;
}
$$TMP141=$$TMP144;
}
$$TMP140=$$TMP141;
}
$$TMP139=$$TMP140;
return $$TMP139;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP150;
   var $$TMP151;
if($$root["null?"](patt)){
$$TMP151=$$root["null?"](expr);
}
else{
   var $$TMP152;
if($$root["list?"](patt)){
$$TMP152=$$root["list-matches?"](expr,patt);
}
else{
   var $$TMP153;
if($$root["symbol?"](patt)){
   $$TMP153=true;
}
else{
   var $$TMP154;
   if(true){
$$TMP154=$$root["error"]("Invalid pattern!");
}
else{
   $$TMP154=undefined;
}
$$TMP153=$$TMP154;
}
$$TMP152=$$TMP153;
}
$$TMP151=$$TMP152;
}
$$TMP150=$$TMP151;
return $$TMP150;
}
);
$$root["matches?"];
$$root["pattern->structure"]=(function(patt){
   var $$TMP155;
   var $$TMP156;
   var $$TMP157;
if($$root["list?"](patt)){
   var $$TMP158;
if($$root["not"]($$root["null?"](patt))){
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
if($$TMP157){
   var $$TMP159;
if($$root["equal?"]($$root["car"](patt),(new $$root.Symbol("quote")))){
$$TMP159=(new $$root.Symbol("_"));
}
else{
$$TMP159=$$root["map"]($$root["pattern->structure"],patt);
}
$$TMP156=$$TMP159;
}
else{
   $$TMP156=patt;
}
$$TMP155=$$TMP156;
return $$TMP155;
}
);
$$root["pattern->structure"];
$$root["pattern-case"]=(function(e,...pairs){
   var $$TMP160;
   $$TMP160=(function(e__MINUSname,zipped__MINUSpairs){
      var $$TMP161;
$$TMP161=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
   var $$TMP162;
$$TMP162=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("matches?"))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["concat"]($$root["list"]((new $$root.Symbol("destructuring-bind"))),$$root["list"]($$root["pattern->structure"]($$root["first"](pair))),$$root["list"](e__MINUSname),$$root["list"]($$root["second"](pair))));
return $$TMP162;
}
),zipped__MINUSpairs)),$$root["list"](true),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Fell out of case!"))))));
return $$TMP161;
}
)($$root["gensym"](),$$root["partition"](2,pairs));
return $$TMP160;
}
);
$$root["pattern-case"];
$$root["setmac!"]($$root["pattern-case"]);
$$root["set!"]=(function(place,v){
   var $$TMP163;
   $$TMP163=(function(__GS1){
      var $$TMP164;
      var $$TMP165;
if($$root["matches?"](__GS1,$$root.cons($$root.cons((new $$root.Symbol("quote")),$$root.cons((new $$root.Symbol("geti")),[])),$$root.cons((new $$root.Symbol("obj")),$$root.cons((new $$root.Symbol("field")),[]))))){
   $$TMP165=(function(__GS2){
      var $$TMP166;
      $$TMP166=(function(obj,field){
         var $$TMP167;
$$TMP167=$$root["concat"]($$root["list"]((new $$root.Symbol("seti!"))),$$root["list"](obj),$$root["list"](field),$$root["list"](v));
return $$TMP167;
}
)($$root["nth"](1,__GS2),$$root["nth"](2,__GS2));
return $$TMP166;
}
)(__GS1);
}
else{
   var $$TMP168;
if($$root["matches?"](__GS1,(new $$root.Symbol("any")))){
   $$TMP168=(function(any){
      var $$TMP169;
      var $$TMP170;
if($$root["symbol?"](any)){
$$TMP170=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](any),$$root["list"](v));
}
else{
$$TMP170=$$root["concat"]($$root["list"]((new $$root.Symbol("error"))),$$root["list"]("Not a settable place!"));
}
$$TMP169=$$TMP170;
return $$TMP169;
}
)(__GS1);
}
else{
   var $$TMP171;
   if(true){
$$TMP171=$$root["error"]("Fell out of case!");
}
else{
   $$TMP171=undefined;
}
$$TMP168=$$TMP171;
}
$$TMP165=$$TMP168;
}
$$TMP164=$$TMP165;
return $$TMP164;
}
)($$root["macroexpand"](place));
return $$TMP163;
}
);
$$root["set!"];
$$root["setmac!"]($$root["set!"]);
$$root["push"]=(function(x,lst){
   var $$TMP172;
$$TMP172=$$root["reverse"]($$root["cons"](x,$$root["reverse"](lst)));
return $$TMP172;
}
);
$$root["push"];
$$root["->"]=(function(x,...forms){
   var $$TMP173;
   var $$TMP174;
if($$root["null?"](forms)){
   $$TMP174=x;
}
else{
$$TMP174=$$root["concat"]($$root["list"]((new $$root.Symbol("->"))),$$root["list"]($$root["push"](x,$$root["car"](forms))),$$root["cdr"](forms));
}
$$TMP173=$$TMP174;
return $$TMP173;
}
);
$$root["->"];
$$root["setmac!"]($$root["->"]);
$$root["while"]=(function(c,...body){
   var $$TMP175;
$$TMP175=$$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"](c),body,$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))));
return $$TMP175;
}
);
$$root["while"];
$$root["setmac!"]($$root["while"]);
$$root["sort"]=(function(cmp,lst){
   var $$TMP176;
   $$TMP176=(function(target){
      var $$TMP177;
$$TMP177=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("sort"))),target,cmp);
return $$TMP177;
}
)(lst);
return $$TMP176;
}
);
$$root["sort"];
$$root["in-range"]=(function(binding__MINUSname,start,end,step){
   var $$TMP178;
   step=(function(c){
      var $$TMP179;
      var $$TMP180;
      if(c){
         $$TMP180=c;
      }
      else{
         $$TMP180=(function(c){
            var $$TMP181;
            var $$TMP182;
            if(c){
               $$TMP182=c;
            }
            else{
               $$TMP182=false;
            }
            $$TMP181=$$TMP182;
            return $$TMP181;
         }
         )(1);
      }
      $$TMP179=$$TMP180;
      return $$TMP179;
   }
   )(step);
   step;
$$TMP178=$$root["list"]($$root["list"](binding__MINUSname,start),$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("inc!"))),$$root["list"](binding__MINUSname),$$root["list"](step)))),$$root["concat"]($$root["list"]((new $$root.Symbol("<"))),$$root["list"](binding__MINUSname),$$root["list"](end)));
return $$TMP178;
}
);
$$root["in-range"];
$$root["iterate-compile-for"]=(function(form){
   var $$TMP183;
   $$TMP183=(function(__GS3){
      var $$TMP184;
      $$TMP184=(function(binding__MINUSname,__GS4){
         var $$TMP185;
         $$TMP185=(function(func__MINUSname,args){
            var $$TMP186;
$$TMP186=$$root["apply"]($$root["geti"]($$root["*ns*"],func__MINUSname),$$root["cons"](binding__MINUSname,args));
return $$TMP186;
}
)($$root["nth"](0,__GS4),$$root["drop"](1,__GS4));
return $$TMP185;
}
)($$root["nth"](1,__GS3),$$root["nth"](2,__GS3));
return $$TMP184;
}
)(form);
return $$TMP183;
}
);
$$root["iterate-compile-for"];
$$root["iterate-compile-while"]=(function(form){
   var $$TMP187;
$$TMP187=$$root["list"]([],[],$$root["second"](form));
return $$TMP187;
}
);
$$root["iterate-compile-while"];
$$root["iterate-compile-do"]=(function(form){
   var $$TMP188;
$$TMP188=$$root["list"]([],$$root["cdr"](form),[]);
return $$TMP188;
}
);
$$root["iterate-compile-do"];
$$root["iterate-form-order"]=$$root.cons((new $$root.Symbol("do")),$$root.cons((new $$root.Symbol("while")),$$root.cons((new $$root.Symbol("for")),[])));
$$root["iterate-form-order"];
$$root["iterate"]=(function(...forms){
   var $$TMP189;
   $$TMP189=(function(trips){
      var $$TMP197;
      $$TMP197=(function(bindings,actions,conds){
         var $$TMP198;
$$TMP198=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["apply"]($$root["concat"],bindings)),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("loop"))),$$root["list"]($$root["concat"]()),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("when"))),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),conds)),$$root["apply"]($$root["concat"],actions),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))))))))));
return $$TMP198;
}
)($$root["map"]($$root["first"],trips),$$root["map"]($$root["second"],trips),$$root["filter"]($$root["complement"]($$root["null?"]),$$root["map"]($$root["third"],trips)));
return $$TMP197;
}
)($$root["map"]((function(form){
   var $$TMP190;
   $$TMP190=(function(__GS5){
      var $$TMP191;
      var $$TMP192;
if($$root["equal?"](__GS5,(new $$root.Symbol("for")))){
$$TMP192=$$root["iterate-compile-for"](form);
}
else{
   var $$TMP193;
if($$root["equal?"](__GS5,(new $$root.Symbol("while")))){
$$TMP193=$$root["iterate-compile-while"](form);
}
else{
   var $$TMP194;
if($$root["equal?"](__GS5,(new $$root.Symbol("do")))){
$$TMP194=$$root["iterate-compile-do"](form);
}
else{
   var $$TMP195;
   if(true){
$$TMP195=$$root["error"]("Unknown iterate form");
}
else{
   $$TMP195=undefined;
}
$$TMP194=$$TMP195;
}
$$TMP193=$$TMP194;
}
$$TMP192=$$TMP193;
}
$$TMP191=$$TMP192;
return $$TMP191;
}
)($$root["car"](form));
return $$TMP190;
}
),$$root["sort"]((function(a,b){
   var $$TMP196;
$$TMP196=$$root["-"]($$root["find"]($$root["equal?"],$$root["car"](a),$$root["iterate-form-order"]),$$root["find"]($$root["equal?"],$$root["car"](b),$$root["iterate-form-order"]));
return $$TMP196;
}
),forms)));
return $$TMP189;
}
);
$$root["iterate"];
$$root["setmac!"]($$root["iterate"]);
(function(i,j){
   var $$TMP199;
   $$TMP199=(function(recur){
      var $$TMP200;
      recur=(function(){
         var $$TMP201;
         var $$TMP202;
         var $$TMP203;
if($$root["<"]($$root["*"](i,j),100)){
   var $$TMP204;
if($$root["<"](i,10)){
   var $$TMP205;
if($$root["<"](j,100)){
   $$TMP205=true;
}
else{
   $$TMP205=false;
}
$$TMP204=$$TMP205;
}
else{
   $$TMP204=false;
}
$$TMP203=$$TMP204;
}
else{
   $$TMP203=false;
}
if($$TMP203){
   $$TMP202=(function(){
      var $$TMP206;
$$root["print"](i,j);
$$root["print"]($$root["*"](i,j));
i=$$root["+"](i,2);
i;
j=$$root["+"](j,10);
j;
$$TMP206=recur();
return $$TMP206;
}
)();
}
else{
   $$TMP202=undefined;
}
$$TMP201=$$TMP202;
return $$TMP201;
}
);
recur;
$$TMP200=recur();
return $$TMP200;
}
)([]);
return $$TMP199;
}
)(0,0);
$$root["make-enum"]=(function(...args){
   var $$TMP207;
   $$TMP207=(function(e,len){
      var $$TMP208;
      (function(recur){
         var $$TMP209;
         recur=(function(i){
            var $$TMP210;
            var $$TMP211;
if($$root["<"](i,len)){
   $$TMP211=(function(){
      var $$TMP212;
$$root["seti!"](e,$$root["geti"](args,i),i);
$$TMP212=recur($$root["inc"](i));
return $$TMP212;
}
)();
}
else{
   $$TMP211=undefined;
}
$$TMP210=$$TMP211;
return $$TMP210;
}
);
recur;
$$TMP209=recur(0);
return $$TMP209;
}
)([]);
$$TMP208=e;
return $$TMP208;
}
)($$root["object"](),$$root["count"](args));
return $$TMP207;
}
);
$$root["make-enum"];
$$root["gen-consts"]=(function(names,suffix){
   var $$TMP213;
$$TMP213=$$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),$$root["map-indexed"]((function(name,idx){
   var $$TMP214;
$$TMP214=$$root["concat"]($$root["list"]((new $$root.Symbol("def"))),$$root["list"]($$root["symbol"]($$root["str"](name,"-",suffix))),$$root["list"](idx));
return $$TMP214;
}
),names));
return $$TMP213;
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
   var $$TMP215;
   $$TMP215=(function(o){
      var $$TMP216;
$$root["seti!"](o,(new $$root.Symbol("src")),src);
$$root["seti!"](o,(new $$root.Symbol("type")),type);
$$root["seti!"](o,(new $$root.Symbol("start")),start);
$$root["seti!"](o,(new $$root.Symbol("len")),len);
$$TMP216=o;
return $$TMP216;
}
)($$root["object"]($$root["token-proto"]));
return $$TMP215;
}
);
$$root["make-token"];
$$root["seti!"]($$root["token-proto"],(new $$root.Symbol("text")),(function(){
   var $$TMP217;
   $$TMP217=(function(self){
      var $$TMP218;
      $$TMP218=(function(target){
         var $$TMP219;
$$TMP219=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("substr"))),target,$$root["geti"](self,(new $$root.Symbol("start"))),$$root["geti"](self,(new $$root.Symbol("len"))));
return $$TMP219;
}
)($$root["geti"](self,(new $$root.Symbol("src"))));
return $$TMP218;
}
)(this);
return $$TMP217;
}
));
$$root["lit"]=(function(s){
   var $$TMP220;
$$TMP220=$$root["regex"]($$root["str"]("^",(function(target){
   var $$TMP221;
$$TMP221=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("replace"))),target,$$root["regex"]("[.*+?^${}()|[\\]\\\\]","g"),"\\$&");
return $$TMP221;
}
)(s)));
return $$TMP220;
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
