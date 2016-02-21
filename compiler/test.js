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
$$root["zip"]=(function(a,...more){
   var $$TMP44;
   $$TMP44=(function(args){
      var $$TMP45;
      var $$TMP46;
      if($$root["reduce"]((function(accum,v){
         var $$TMP47;
         var $$TMP48;
         if(accum){
            $$TMP48=true;
         }
         else{
            var $$TMP49;
            if($$root["null?"](v)){
               $$TMP49=true;
            }
            else{
               $$TMP49=false;
            }
            $$TMP48=$$TMP49;
         }
         $$TMP47=$$TMP48;
         return $$TMP47;
      }
      ),args,false)){
         $$TMP46=[];
      }
      else{
         $$TMP46=$$root["cons"]($$root["map"]($$root["car"],args),$$root["apply"]($$root["zip"],$$root["map"]($$root["cdr"],args)));
      }
      $$TMP45=$$TMP46;
      return $$TMP45;
   }
   )($$root["cons"](a,more));
   return $$TMP44;
}
);
$$root["zip"];
$$root["let"]=(function(bindings,...body){
   var $$TMP50;
   $$TMP50=$$root["concat"]($$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)),$$root["every-nth"](2,$$root["cdr"](bindings)));
   return $$TMP50;
}
);
$$root["let"];
$$root["setmac!"]($$root["let"]);
$$root["find"]=(function(f,arg,lst){
   var $$TMP51;
   $$TMP51=(function(idx){
      var $$TMP52;
      $$TMP52=$$root["reduce"]((function(accum,v){
         var $$TMP53;
         idx=$$root["+"](idx,1);
         idx;
         var $$TMP54;
         if(f(arg,v)){
            $$TMP54=idx;
         }
         else{
            $$TMP54=accum;
         }
         $$TMP53=$$TMP54;
         return $$TMP53;
      }
      ),lst,-1);
      return $$TMP52;
   }
   )(-1);
   return $$TMP51;
}
);
$$root["find"];
$$root["flatten"]=(function(x){
   var $$TMP55;
   var $$TMP56;
   if($$root["atom?"](x)){
      $$TMP56=$$root["list"](x);
   }
   else{
      $$TMP56=$$root["apply"]($$root["concat"],$$root["map"]($$root["flatten"],x));
   }
   $$TMP55=$$TMP56;
   return $$TMP55;
}
);
$$root["flatten"];
$$root["map-indexed"]=(function(f,lst){
   var $$TMP57;
   $$TMP57=(function(idx){
      var $$TMP58;
      $$TMP58=$$root["transform-list"]((function(accum,v){
         var $$TMP59;
         idx=$$root["+"](idx,1);
         $$TMP59=$$root["cons"](f(v,idx),accum);
         return $$TMP59;
      }
      ),lst);
      return $$TMP58;
   }
   )(-1);
   return $$TMP57;
}
);
$$root["map-indexed"];
$$root["loop"]=(function(bindings,...body){
   var $$TMP60;
   $$TMP60=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["list"]([]))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("setv!"))),$$root["list"]((new $$root.Symbol("recur"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("lambda"))),$$root["list"]($$root["every-nth"](2,bindings)),body)))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("recur"))),$$root["every-nth"](2,$$root["cdr"](bindings)))));
   return $$TMP60;
}
);
$$root["loop"];
$$root["setmac!"]($$root["loop"]);
$$root["dot-helper"]=(function(obj__MINUSname,reversed__MINUSfields){
   var $$TMP61;
   var $$TMP62;
   if($$root["null?"](reversed__MINUSfields)){
      $$TMP62=obj__MINUSname;
   }
   else{
      $$TMP62=$$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"](reversed__MINUSfields))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["car"](reversed__MINUSfields)))));
   }
   $$TMP61=$$TMP62;
   return $$TMP61;
}
);
$$root["dot-helper"];
$$root["."]=(function(obj__MINUSname,...fields){
   var $$TMP63;
   $$TMP63=(function(rev__MINUSfields){
      var $$TMP64;
      var $$TMP65;
      if($$root["list?"]($$root["car"](rev__MINUSfields))){
         $$TMP65=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["dot-helper"](obj__MINUSname,$$root["cdr"]($$root["cdr"](rev__MINUSfields)))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("call-method"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("geti"))),$$root["list"]((new $$root.Symbol("target"))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["second"](rev__MINUSfields)))))),$$root["list"]((new $$root.Symbol("target"))),$$root["first"](rev__MINUSfields))));
      }
      else{
         $$TMP65=$$root["dot-helper"](obj__MINUSname,rev__MINUSfields);
      }
      $$TMP64=$$TMP65;
      return $$TMP64;
   }
   )($$root["reverse"](fields));
   return $$TMP63;
}
);
$$root["."];
$$root["setmac!"]($$root["."]);
$$root["equal?"]=(function(a,b){
   var $$TMP66;
   var $$TMP67;
   if($$root["null?"](a)){
      $$TMP67=$$root["null?"](b);
   }
   else{
      var $$TMP68;
      if($$root["symbol?"](a)){
         var $$TMP69;
         if($$root["symbol?"](b)){
            var $$TMP70;
            if($$root["="]($$root["geti"](a,(new $$root.Symbol("name"))),$$root["geti"](b,(new $$root.Symbol("name"))))){
               $$TMP70=true;
            }
            else{
               $$TMP70=false;
            }
            $$TMP69=$$TMP70;
         }
         else{
            $$TMP69=false;
         }
         $$TMP68=$$TMP69;
      }
      else{
         var $$TMP71;
         if($$root["atom?"](a)){
            $$TMP71=$$root["="](a,b);
         }
         else{
            var $$TMP72;
            if($$root["list?"](a)){
               var $$TMP73;
               if($$root["list?"](b)){
                  var $$TMP74;
                  if($$root["equal?"]($$root["car"](a),$$root["car"](b))){
                     var $$TMP75;
                     if($$root["equal?"]($$root["cdr"](a),$$root["cdr"](b))){
                        $$TMP75=true;
                     }
                     else{
                        $$TMP75=false;
                     }
                     $$TMP74=$$TMP75;
                  }
                  else{
                     $$TMP74=false;
                  }
                  $$TMP73=$$TMP74;
               }
               else{
                  $$TMP73=false;
               }
               $$TMP72=$$TMP73;
            }
            else{
               $$TMP72=undefined;
            }
            $$TMP71=$$TMP72;
         }
         $$TMP68=$$TMP71;
      }
      $$TMP67=$$TMP68;
   }
   $$TMP66=$$TMP67;
   return $$TMP66;
}
);
$$root["equal?"];
$$root["split"]=(function(p,lst){
   var $$TMP76;
   $$TMP76=(function(res){
      var $$TMP82;
      $$TMP82=$$root["list"]($$root["reverse"]($$root["first"](res)),$$root["second"](res));
      return $$TMP82;
   }
   )((function(recur){
      var $$TMP77;
      recur=(function(l1,l2){
         var $$TMP78;
         var $$TMP79;
         var $$TMP80;
         if($$root["null?"](l2)){
            $$TMP80=true;
         }
         else{
            var $$TMP81;
            if(p($$root["car"](l2))){
               $$TMP81=true;
            }
            else{
               $$TMP81=false;
            }
            $$TMP80=$$TMP81;
         }
         if($$TMP80){
            $$TMP79=$$root["list"](l1,l2);
         }
         else{
            $$TMP79=recur($$root["cons"]($$root["car"](l2),l1),$$root["cdr"](l2));
         }
         $$TMP78=$$TMP79;
         return $$TMP78;
      }
      );
      recur;
      $$TMP77=recur([],lst);
      return $$TMP77;
   }
   )([]));
   return $$TMP76;
}
);
$$root["split"];
$$root["any?"]=(function(lst){
   var $$TMP83;
   var $$TMP84;
   if($$root["reduce"]((function(accum,v){
      var $$TMP85;
      var $$TMP86;
      if(accum){
         $$TMP86=accum;
      }
      else{
         $$TMP86=v;
      }
      $$TMP85=$$TMP86;
      return $$TMP85;
   }
   ),lst,false)){
      $$TMP84=true;
   }
   else{
      $$TMP84=false;
   }
   $$TMP83=$$TMP84;
   return $$TMP83;
}
);
$$root["any?"];
$$root["splitting-pair"]=(function(binding__MINUSnames,outer,pair){
   var $$TMP87;
   $$TMP87=$$root["any?"]($$root["map"]((function(sym){
      var $$TMP88;
      var $$TMP89;
      if($$root["="]($$root["find"]($$root["equal?"],sym,outer),-1)){
         var $$TMP90;
         if($$root["not="]($$root["find"]($$root["equal?"],sym,binding__MINUSnames),-1)){
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
      return $$TMP88;
   }
   ),$$root["filter"]($$root["symbol?"],$$root["flatten"]($$root["second"](pair)))));
   return $$TMP87;
}
);
$$root["splitting-pair"];
$$root["let-helper*"]=(function(outer,binding__MINUSpairs,body){
   var $$TMP91;
   $$TMP91=(function(binding__MINUSnames){
      var $$TMP92;
      $$TMP92=(function(divs){
         var $$TMP94;
         var $$TMP95;
         if($$root["null?"]($$root["second"](divs))){
            $$TMP95=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),body);
         }
         else{
            $$TMP95=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["apply"]($$root["concat"],$$root["first"](divs))),$$root["list"]($$root["let-helper*"]($$root["concat"](binding__MINUSpairs,$$root["map"]($$root["first"],$$root["first"](divs))),$$root["second"](divs),body)));
         }
         $$TMP94=$$TMP95;
         return $$TMP94;
      }
      )($$root["split"]((function(pair){
         var $$TMP93;
         $$TMP93=$$root["splitting-pair"](binding__MINUSnames,outer,pair);
         return $$TMP93;
      }
      ),binding__MINUSpairs));
      return $$TMP92;
   }
   )($$root["map"]($$root["first"],binding__MINUSpairs));
   return $$TMP91;
}
);
$$root["let-helper*"];
$$root["let*"]=(function(bindings,...body){
   var $$TMP96;
   $$TMP96=$$root["let-helper*"]([],$$root["zip"]($$root["every-nth"](2,bindings),$$root["every-nth"](2,$$root["cdr"](bindings))),body);
   return $$TMP96;
}
);
$$root["let*"];
$$root["setmac!"]($$root["let*"]);
$$root["destruct-helper"]=(function(structure,expr){
   var $$TMP97;
   $$TMP97=(function(expr__MINUSname){
      var $$TMP98;
      $$TMP98=$$root["concat"]($$root["list"](expr__MINUSname),$$root["list"](expr),$$root["apply"]($$root["concat"],$$root["map-indexed"]((function(v,idx){
         var $$TMP99;
         var $$TMP100;
         if($$root["symbol?"](v)){
            var $$TMP101;
            if($$root["="]($$root["geti"]($$root["geti"](v,(new $$root.Symbol("name"))),0),"&")){
               $$TMP101=$$root["concat"]($$root["list"]($$root["symbol"]((function(target){
                  var $$TMP102;
                  $$TMP102=$$root["call-method"]($$root["geti"](target,(new $$root.Symbol("slice"))),target,1);
                  return $$TMP102;
               }
               )($$root["geti"](v,(new $$root.Symbol("name")))))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("drop"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
            }
            else{
               $$TMP101=$$root["concat"]($$root["list"](v),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname))));
            }
            $$TMP100=$$TMP101;
         }
         else{
            $$TMP100=$$root["destruct-helper"](v,$$root["concat"]($$root["list"]((new $$root.Symbol("nth"))),$$root["list"](idx),$$root["list"](expr__MINUSname)));
         }
         $$TMP99=$$TMP100;
         return $$TMP99;
      }
      ),structure)));
      return $$TMP98;
   }
   )($$root["gensym"]());
   return $$TMP97;
}
);
$$root["destruct-helper"];
$$root["destructuring-bind"]=(function(structure,expr,...body){
   var $$TMP103;
   $$TMP103=$$root["concat"]($$root["list"]((new $$root.Symbol("let*"))),$$root["list"]($$root["destruct-helper"](structure,expr)),body);
   return $$TMP103;
}
);
$$root["destructuring-bind"];
$$root["setmac!"]($$root["destructuring-bind"]);
$$root["case"]=(function(e,...pairs){
   var $$TMP104;
   $$TMP104=(function(e__MINUSname,def__MINUSidx){
      var $$TMP105;
      var $$TMP106;
      if($$root["="](def__MINUSidx,-1)){
         $$TMP106=$$root.cons((new $$root.Symbol("error")),$$root.cons("Fell out of case!",[]));
      }
      else{
         $$TMP106=$$root["nth"]($$root["inc"](def__MINUSidx),pairs);
      }
      $$TMP105=(function(def__MINUSexpr,zipped__MINUSpairs){
         var $$TMP107;
         $$TMP107=$$root["concat"]($$root["list"]((new $$root.Symbol("let"))),$$root["list"]($$root["concat"]($$root["list"](e__MINUSname),$$root["list"](e))),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("cond"))),$$root["apply"]($$root["concat"],$$root["map"]((function(pair){
            var $$TMP108;
            $$TMP108=$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("="))),$$root["list"](e__MINUSname),$$root["list"]($$root["concat"]($$root["list"]((new $$root.Symbol("quote"))),$$root["list"]($$root["first"](pair))))),$$root["second"](pair));
            return $$TMP108;
         }
         ),$$root["filter"]((function(pair){
            var $$TMP109;
            $$TMP109=$$root["not"]($$root["equal?"]($$root["car"](pair),(new $$root.Symbol("default"))));
            return $$TMP109;
         }
         ),zipped__MINUSpairs))),$$root["list"](true),$$root["list"](def__MINUSexpr))));
         return $$TMP107;
      }
      )($$TMP106,$$root["zip"]($$root["every-nth"](2,pairs),$$root["every-nth"](2,$$root["cdr"](pairs))));
      return $$TMP105;
   }
   )($$root["gensym"](),$$root["find"]($$root["equal?"],(new $$root.Symbol("default")),pairs));
   return $$TMP104;
}
);
$$root["case"];
$$root["setmac!"]($$root["case"]);
$$root["print"]((function(__GS1){
   var $$TMP110;
   $$TMP110=(function(a,__GS2){
      var $$TMP111;
      $$TMP111=(function(b,__GS3){
         var $$TMP112;
         $$TMP112=(function(c,more,etc){
            var $$TMP113;
            $$TMP113=$$root["+"]($$root["+"](a,b,c),$$root["apply"]($$root["+"],more),$$root["apply"]($$root["+"],etc));
            return $$TMP113;
         }
         )($$root["nth"](0,__GS3),$$root["drop"](1,__GS3),$$root["drop"](2,__GS1));
         return $$TMP112;
      }
      )($$root["nth"](0,__GS2),$$root["nth"](1,__GS2));
      return $$TMP111;
   }
   )($$root["nth"](0,__GS1),$$root["nth"](1,__GS1));
   return $$TMP110;
}
)($$root.cons(1,$$root.cons($$root.cons(2,$$root.cons($$root.cons(3,$$root.cons(4,$$root.cons(5,[]))),[])),$$root.cons(6,$$root.cons(7,[]))))));
