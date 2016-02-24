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
    print       :   function print(x) { console.log($$root.str(x)); },
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
        return "isMacro" in f;
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
   $$TMP2=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["concat"]()),body)));
   return $$TMP2;
}
);
$$root["progn"];
$$root["setmac!"]($$root["progn"]);
$$root["when"]=(function(c,...body){
   var $$TMP3;
   $$TMP3=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"](c),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("progn"))),body)),$$root["list"](undefined));
   return $$TMP3;
}
);
$$root["when"];
$$root["setmac!"]($$root["when"]);
$$root["cond"]=(function(...pairs){
   var $$TMP4;
   var $$TMP5;
   if($$root["null?"](pairs)){
      $$TMP5=undefined;
   }
   else{
      $$TMP5=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](pairs)),$$root["list"]($$root["car"]($$root["cdr"](pairs))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["cdr"]($$root["cdr"](pairs)))));
   }
   $$TMP4=$$TMP5;
   return $$TMP4;
}
);
$$root["cond"];
$$root["setmac!"]($$root["cond"]);
$$root["and"]=(function(...args){
   var $$TMP6;
   var $$TMP7;
   if($$root["null?"](args)){
      $$TMP7=true;
   }
   else{
      $$TMP7=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"]($$root["cons"]((new $$root.Symbol("and")),$$root["cdr"](args))),$$root["list"](false));
   }
   $$TMP6=$$TMP7;
   return $$TMP6;
}
);
$$root["and"];
$$root["setmac!"]($$root["and"]);
$$root["or"]=(function(...args){
   var $$TMP8;
   var $$TMP9;
   if($$root["null?"](args)){
      $$TMP9=false;
   }
   else{
      $$TMP9=$$root["concat"]($$root["list"]((new $$root.Symbol("if"))),$$root["list"]($$root["car"](args)),$$root["list"](true),$$root["list"]($$root["cons"]((new $$root.Symbol("or")),$$root["cdr"](args))));
   }
   $$TMP8=$$TMP9;
   return $$TMP8;
}
);
$$root["or"];
$$root["setmac!"]($$root["or"]);
$$root["macroexpand"]=(function(expr){
   var $$TMP10;
   var $$TMP11;
   var $$TMP12;
   if($$root["list?"](expr)){
      var $$TMP13;
      if($$root["macro?"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)))){
         $$TMP13=true;
      }
      else{
         $$TMP13=false;
      }
      $$TMP12=$$TMP13;
   }
   else{
      $$TMP12=false;
   }
   if($$TMP12){
      $$TMP11=$$root["apply"]($$root["geti"]($$root["*ns*"],$$root["car"](expr)),$$root["cdr"](expr));
   }
   else{
      $$TMP11=expr;
   }
   $$TMP10=$$TMP11;
   return $$TMP10;
}
);
$$root["macroexpand"];
$$root["inc"]=(function(x){
   var $$TMP14;
   $$TMP14=$$root["+"](x,1);
   return $$TMP14;
}
);
$$root["inc"];
$$root["dec"]=(function(x){
   var $$TMP15;
   $$TMP15=$$root["-"](x,1);
   return $$TMP15;
}
);
$$root["dec"];
$$root["inc!"]=(function(name){
   var $$TMP16;
   $$TMP16=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("+"))),$$root["list"](name),$$root["list"](1))));
   return $$TMP16;
}
);
$$root["inc!"];
$$root["setmac!"]($$root["inc!"]);
$$root["dec!"]=(function(name){
   var $$TMP17;
   $$TMP17=$$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"](name),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("-"))),$$root["list"](name),$$root["list"](1))));
   return $$TMP17;
}
);
$$root["dec!"];
$$root["setmac!"]($$root["dec!"]);
$$root["first"]=$$root["car"];
$$root["first"];
$$root["second"]=(function(lst){
   var $$TMP18;
   $$TMP18=$$root["car"]($$root["cdr"](lst));
   return $$TMP18;
}
);
$$root["second"];
$$root["third"]=(function(lst){
   var $$TMP19;
   $$TMP19=$$root["car"]($$root["car"]($$root["cdr"](lst)));
   return $$TMP19;
}
);
$$root["third"];
$$root["fourth"]=(function(lst){
   var $$TMP20;
   $$TMP20=$$root["car"]($$root["car"]($$root["car"]($$root["cdr"](lst))));
   return $$TMP20;
}
);
$$root["fourth"];
$$root["fifth"]=(function(lst){
   var $$TMP21;
   $$TMP21=$$root["car"]($$root["car"]($$root["car"]($$root["car"]($$root["cdr"](lst)))));
   return $$TMP21;
}
);
$$root["fifth"];
$$root["reduce"]=(function(r,lst,accum){
   var $$TMP22;
   var $$TMP23;
   if($$root["null?"](lst)){
      $$TMP23=accum;
   }
   else{
      $$TMP23=$$root["reduce"](r,$$root["cdr"](lst),r(accum,$$root["car"](lst)));
   }
   $$TMP22=$$TMP23;
   return $$TMP22;
}
);
$$root["reduce"];
$$root["reverse"]=(function(lst){
   var $$TMP24;
   $$TMP24=$$root["reduce"]((function(accum,v){
      var $$TMP25;
      $$TMP25=$$root["cons"](v,accum);
      return $$TMP25;
   }
   ),lst,[]);
   return $$TMP24;
}
);
$$root["reverse"];
$$root["transform-list"]=(function(r,lst){
   var $$TMP26;
   $$TMP26=$$root["reverse"]($$root["reduce"](r,lst,[]));
   return $$TMP26;
}
);
$$root["transform-list"];
$$root["map"]=(function(f,lst){
   var $$TMP27;
   $$TMP27=$$root["transform-list"]((function(accum,v){
      var $$TMP28;
      $$TMP28=$$root["cons"](f(v),accum);
      return $$TMP28;
   }
   ),lst);
   return $$TMP27;
}
);
$$root["map"];
$$root["filter"]=(function(p,lst){
   var $$TMP29;
   $$TMP29=$$root["transform-list"]((function(accum,v){
      var $$TMP30;
      var $$TMP31;
      if(p(v)){
         $$TMP31=$$root["cons"](v,accum);
      }
      else{
         $$TMP31=accum;
      }
      $$TMP30=$$TMP31;
      return $$TMP30;
   }
   ),lst);
   return $$TMP29;
}
);
$$root["filter"];
$$root["take"]=(function(n,lst){
   var $$TMP32;
   $$TMP32=$$root["transform-list"]((function(accum,v){
      var $$TMP33;
      n=$$root["-"](n,1);
      n;
      var $$TMP34;
      if($$root[">="](n,0)){
         $$TMP34=$$root["cons"](v,accum);
      }
      else{
         $$TMP34=accum;
      }
      $$TMP33=$$TMP34;
      return $$TMP33;
   }
   ),lst);
   return $$TMP32;
}
);
$$root["take"];
$$root["drop"]=(function(n,lst){
   var $$TMP35;
   $$TMP35=$$root["transform-list"]((function(accum,v){
      var $$TMP36;
      n=$$root["-"](n,1);
      n;
      var $$TMP37;
      if($$root[">="](n,0)){
         $$TMP37=accum;
      }
      else{
         $$TMP37=$$root["cons"](v,accum);
      }
      $$TMP36=$$TMP37;
      return $$TMP36;
   }
   ),lst);
   return $$TMP35;
}
);
$$root["drop"];
$$root["every-nth"]=(function(n,lst){
   var $$TMP38;
   $$TMP38=(function(counter){
      var $$TMP39;
      $$TMP39=$$root["transform-list"]((function(accum,v){
         var $$TMP40;
         var $$TMP41;
         counter=$$root["+"](counter,1);
         if($$root["="]($$root["mod"](counter,n),0)){
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
   )(-1);
   return $$TMP38;
}
);
$$root["every-nth"];
$$root["nth"]=(function(n,lst){
   var $$TMP42;
   var $$TMP43;
   if($$root["="](n,0)){
      $$TMP43=$$root["car"](lst);
   }
   else{
      $$TMP43=$$root["nth"]($$root["dec"](n),$$root["cdr"](lst));
   }
   $$TMP42=$$TMP43;
   return $$TMP42;
}
);
$$root["nth"];
$$root["count"]=(function(lst){
   var $$TMP44;
   $$TMP44=$$root["reduce"]((function(accum,v){
      var $$TMP45;
      $$TMP45=$$root["inc"](accum);
      return $$TMP45;
   }
   ),lst,0);
   return $$TMP44;
}
);
$$root["count"];
$$root["zip"]=(function(a,...more){
   var $$TMP46;
   $$TMP46=(function(args){
      var $$TMP47;
      var $$TMP48;
      if($$root["reduce"]((function(accum,v){
         var $$TMP49;
         var $$TMP50;
         if(accum){
            $$TMP50=true;
         }
         else{
            var $$TMP51;
            if($$root["null?"](v)){
               $$TMP51=true;
            }
            else{
               $$TMP51=false;
            }
            $$TMP50=$$TMP51;
         }
         $$TMP49=$$TMP50;
         return $$TMP49;
      }
      ),args,false)){
         $$TMP48=[];
      }
      else{
         $$TMP48=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
      }
      $$TMP47=$$TMP48;
      return $$TMP47;
   }
   )($$root["cons"](a,more));
   return $$TMP46;
}
);
$$root["zip"];
$$root["let"]=(function(bindings,...body){
   var $$TMP52;
   $$TMP52=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
   return $$TMP52;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["find"]=(function(f,arg,lst){
   var $$TMP53;
   $$TMP53=(function(idx){
      var $$TMP54;
      $$TMP54=$$root["reduce"]((function(accum,v){
         var $$TMP55;
         idx=$$root["+"](idx,1);
         idx;
         var $$TMP56;
         if(f(arg,v)){
            $$TMP56=idx;
         }
         else{
            $$TMP56=accum;
         }
         $$TMP55=$$TMP56;
         return $$TMP55;
      }
      ),lst,-1);
      return $$TMP54;
   }
   )(-1);
   return $$TMP53;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP57;
   var $$TMP58;
   if($$root["atom?"](x)){
      $$TMP58=$$root["list"](x);
   }
   else{
      $$TMP58=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
   }
   $$TMP57=$$TMP58;
   return $$TMP57;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP59;
   $$TMP59=(function(idx){
      var $$TMP60;
      $$TMP60=$$root["transform-list"]((function(accum,v){
         var $$TMP61;
         idx=$$root["+"](idx,1);
         $$TMP61=$$root["cons"](f(v,idx),accum);
         return $$TMP61;
      }
      ),lst);
      return $$TMP60;
   }
   )(-1);
   return $$TMP59;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP62;
   $$TMP62=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
   return $$TMP62;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["partition"]=(function(n,lst){
   var $$TMP63;
   var $$TMP64;
   if($$root["null?"](lst)){
      $$TMP64=[];
   }
   else{
      $$TMP64=$$root["reverse"]((function(recur){
         var $$TMP65;
         recur=(function(accum,part,rem,counter){
            var $$TMP66;
            var $$TMP67;
            if($$root["null?"](rem)){
               $$TMP67=$$root["cons"]($$root["reverse"](part),accum);
            }
            else{
               var $$TMP68;
               if($$root["="]($$root["mod"](counter,n),0)){
                  $$TMP68=recur($$root["cons"]($$root["reverse"](part),accum),$$root["cons"]($$root["car"](rem),[]),$$root["cdr"](rem),$$root["inc"](counter));
               }
               else{
                  $$TMP68=recur(accum,$$root["cons"]($$root["car"](rem),part),$$root["cdr"](rem),$$root["inc"](counter));
               }
               $$TMP67=$$TMP68;
            }
            $$TMP66=$$TMP67;
            return $$TMP66;
         }
         );
         recur;
         $$TMP65=recur([],$$root["cons"]($$root["car"](lst),[]),$$root["cdr"](lst),1);
         return $$TMP65;
      }
      )([]));
   }
   $$TMP63=$$TMP64;
   return $$TMP63;
}
);
$$root["partition"];
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP69;
   var $$TMP70;
   if($$root["null?"](reversed__MINUSfields)){
      $$TMP70=obj__MINUSname;
   }
   else{
      $$TMP70=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
   }
   $$TMP69=$$TMP70;
   return $$TMP69;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP71;
   $$TMP71=(function(rev__MINUSfields){
      var $$TMP72;
      var $$TMP73;
      if($$root["list?"]($$root["car"](rev__MINUSfields))){
         $$TMP73=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
      }
      else{
         $$TMP73=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
      }
      $$TMP72=$$TMP73;
      return $$TMP72;
   }
   )($$root["reverse"](fields));
   return $$TMP71;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["equal?"]=(function(a,b){
   var $$TMP74;
   var $$TMP75;
   if($$root["null?"](a)){
      $$TMP75=$$root["null?"](b);
   }
   else{
      var $$TMP76;
      if($$root["symbol?"](a)){
         var $$TMP77;
         if($$root["symbol?"](b)){
            var $$TMP78;
            if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
               $$TMP78=true;
            }
            else{
               $$TMP78=false;
            }
            $$TMP77=$$TMP78;
         }
         else{
            $$TMP77=false;
         }
         $$TMP76=$$TMP77;
      }
      else{
         var $$TMP79;
         if($$root["atom?"](a)){
            $$TMP79=$$root["="](a,b);
         }
         else{
            var $$TMP80;
            if($$root["list?"](a)){
               var $$TMP81;
               if($$root["list?"](b)){
                  var $$TMP82;
                  if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
                     var $$TMP83;
                     if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
                        $$TMP83=true;
                     }
                     else{
                        $$TMP83=false;
                     }
                     $$TMP82=$$TMP83;
                  }
                  else{
                     $$TMP82=false;
                  }
                  $$TMP81=$$TMP82;
               }
               else{
                  $$TMP81=false;
               }
               $$TMP80=$$TMP81;
            }
            else{
               $$TMP80=undefined;
            }
            $$TMP79=$$TMP80;
         }
         $$TMP76=$$TMP79;
      }
      $$TMP75=$$TMP76;
   }
   $$TMP74=$$TMP75;
   return $$TMP74;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP84;
   $$TMP84=(function(res){
      var $$TMP90;
      $$TMP90=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
      return $$TMP90;
   }
   )((function(recur){
      var $$TMP85;
      recur=(function(l1,l2){
         var $$TMP86;
         var $$TMP87;
         var $$TMP88;
         if($$root["null?"](l2)){
            $$TMP88=true;
         }
         else{
            var $$TMP89;
            if(p($$root["car"](l2))){
               $$TMP89=true;
            }
            else{
               $$TMP89=false;
            }
            $$TMP88=$$TMP89;
         }
         if($$TMP88){
            $$TMP87=$$root["list"](l1,l2);
         }
         else{
            $$TMP87=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
         }
         $$TMP86=$$TMP87;
         return $$TMP86;
      }
      );
      recur;
      $$TMP85=recur([],lst);
      return $$TMP85;
   }
   )([]));
   return $$TMP84;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP91;
   var $$TMP92;
   if($$root["reduce"]((function(accum,v){
      var $$TMP93;
      var $$TMP94;
      if(accum){
         $$TMP94=accum;
      }
      else{
         $$TMP94=v;
      }
      $$TMP93=$$TMP94;
      return $$TMP93;
   }
   ),lst,false)){
      $$TMP92=true;
   }
   else{
      $$TMP92=false;
   }
   $$TMP91=$$TMP92;
   return $$TMP91;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP95;
   $$TMP95=$$root["any?"]($$root["map"]((function(sym){
      var $$TMP96;
      var $$TMP97;
      if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
         var $$TMP98;
         if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
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
      return $$TMP96;
   }
   ),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
   return $$TMP95;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP99;
   $$TMP99=(function(binding__MINUSnames){
      var $$TMP100;
      $$TMP100=(function(divs){
         var $$TMP102;
         var $$TMP103;
         if($$root["null?"]($$root["second"](divs))){
            $$TMP103=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
         }
         else{
            $$TMP103=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
         }
         $$TMP102=$$TMP103;
         return $$TMP102;
      }
      )($$root["split"]((function(pair){
         var $$TMP101;
         $$TMP101=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
         return $$TMP101;
      }
      ),binding__MINUSpairs));
      return $$TMP100;
   }
   )($$root["map"]($$root["first"],binding__MINUSpairs));
   return $$TMP99;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP104;
   $$TMP104=$$root["let-helper*"]([],$$root["partition"](2,bindings),body);
   return $$TMP104;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP105;
   $$TMP105=(function(expr__MINUSname){
      var $$TMP106;
      $$TMP106=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
         var $$TMP107;
         var $$TMP108;
         if($$root["symbol?"](v)){
            var $$TMP109;
            if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
               $$TMP109=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
                  var $$TMP110;
                  $$TMP110=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
                  return $$TMP110;
               }
               )($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
            }
            else{
               $$TMP109=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
            }
            $$TMP108=$$TMP109;
         }
         else{
            $$TMP108=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
         }
         $$TMP107=$$TMP108;
         return $$TMP107;
      }
      ),structure)));
      return $$TMP106;
   }
   )($$root["gensym"]());
   return $$TMP105;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP111;
   $$TMP111=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["destruct-helper"](structure,expr)),body);
   return $$TMP111;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["case"]=(function(e,...pairs){
   var $$TMP112;
   $$TMP112=(function(e__MINUSname,def__MINUSidx){
      var $$TMP113;
      var $$TMP114;
      if($$root["="](def__MINUSidx,-1)){
         $$TMP114=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
      }
      else{
         $$TMP114=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
      }
      $$TMP113=(function(def__MINUSexpr,zipped__MINUSpairs){
         var $$TMP115;
         $$TMP115=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
            var $$TMP116;
            $$TMP116=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("="))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
            return $$TMP116;
         }
         ),$$root["filter"]((function(pair){
            var $$TMP117;
            $$TMP117=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
            return $$TMP117;
         }
         ),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
         return $$TMP115;
      }
      )($$TMP114,$$root["partition"](2,pairs));
      return $$TMP113;
   }
   )($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
   return $$TMP112;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["list-matches?"]=(function(expr,patt){
   var $$TMP118;
   var $$TMP119;
   if($$root["equal?"]($$root["first"](patt),(new $$root.Symbol("quote")))){
      $$TMP119=$$root["equal?"]($$root["second"](patt),expr);
   }
   else{
      var $$TMP120;
      if($$root["="]($$root["geti"]($$root["geti"]($$root["first"](patt),(new $$root.Symbol("name"))),0),"&")){
         $$TMP120=$$root["list?"](expr);
      }
      else{
         var $$TMP121;
         if(true){
            var $$TMP122;
            var $$TMP123;
            if($$root["list?"](expr)){
               var $$TMP124;
               if($$root["not"]($$root["null?"](expr))){
                  $$TMP124=true;
               }
               else{
                  $$TMP124=false;
               }
               $$TMP123=$$TMP124;
            }
            else{
               $$TMP123=false;
            }
            if($$TMP123){
               var $$TMP125;
               if($$root["matches?"]($$root["car"](expr),$$root["car"](patt))){
                  var $$TMP126;
                  if($$root["matches?"]($$root["cdr"](expr),$$root["cdr"](patt))){
                     $$TMP126=true;
                  }
                  else{
                     $$TMP126=false;
                  }
                  $$TMP125=$$TMP126;
               }
               else{
                  $$TMP125=false;
               }
               $$TMP122=$$TMP125;
            }
            else{
               $$TMP122=false;
            }
            $$TMP121=$$TMP122;
         }
         else{
            $$TMP121=undefined;
         }
         $$TMP120=$$TMP121;
      }
      $$TMP119=$$TMP120;
   }
   $$TMP118=$$TMP119;
   return $$TMP118;
}
);
$$root["list-matches?"];
$$root["matches?"]=(function(expr,patt){
   var $$TMP127;
   var $$TMP128;
   if($$root["null?"](patt)){
      $$TMP128=$$root["null?"](expr);
   }
   else{
      var $$TMP129;
      if($$root["list?"](patt)){
         $$TMP129=$$root["list-matches?"](expr,patt);
      }
      else{
         var $$TMP130;
         if($$root["symbol?"](patt)){
            $$TMP130=true;
         }
         else{
            var $$TMP131;
            if(true){
               $$TMP131=$$root["error"]("Invalid pattern!");
            }
            else{
               $$TMP131=undefined;
            }
            $$TMP130=$$TMP131;
         }
         $$TMP129=$$TMP130;
      }
      $$TMP128=$$TMP129;
   }
   $$TMP127=$$TMP128;
   return $$TMP127;
}
);
$$root["matches?"];
$$root["make-enum"]=(function(...args){
   var $$TMP132;
   $$TMP132=(function(e,len){
      var $$TMP133;
      (function(recur){
         var $$TMP134;
         recur=(function(i){
            var $$TMP135;
            var $$TMP136;
            if($$root["<"](i,len)){
               $$TMP136=(function(){
                  var $$TMP137;
                  $$root["seti!"](e,$$root["geti"](args,i),i);
                  $$TMP137=recur($$root["inc"](i));
                  return $$TMP137;
               }
               )();
            }
            else{
               $$TMP136=undefined;
            }
            $$TMP135=$$TMP136;
            return $$TMP135;
         }
         );
         recur;
         $$TMP134=recur(0);
         return $$TMP134;
      }
      )([]);
      $$TMP133=e;
      return $$TMP133;
   }
   )($$root["object"](),$$root["count"](args));
   return $$TMP132;
}
);
$$root["make-enum"];
