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

var $$root = {
    Symbol: Symbol,
    
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
    
    symbol__QM: function symbol__QM(x) {
        return x instanceof Symbol;
    },

    number__QM: function number__QM(x) {
        return typeof x === "number" || x instanceof Number;
    },
    
    string__QM: function number__QM(x) {
        return typeof x === "string" || x instanceof String;
    },

    null__QM: function null__QM(x) {
        return Array.isArray(x) && x.length === 0;
    },

    atom__QM: function atom__QM(x) {
        return x === true || x === false || $$root.null__QM(x) || x === undefined || $$root.number__QM(x) || $$root.symbol__QM(x);
    },

    list__QM: function list__QM(x) {
        return Array.isArray(x);
    },

    __EQL:  function __EQL(...args) {
        var v = args[0];

        for (var i = 1; i < args.length; ++i)
            if (args[i] !== v && !($$root.null__QM(args[i]) && $$root.null__QM(v)))
                return false;

        return true;
    },
    
    __PLUS          :   argReducer("+", function(a, b) { return a + b; }, 0),
    __MINUS         :   argReducer("-", function(a, b) { return a - b; }, 0),
    __STAR          :   argReducer("*", function(a, b) { return a * b; }, 1),
    __SLASH         :   argReducer("/", function(a, b) { return a / b }, 1),
    not__EQL        :   function(x, y) { return x !== y; },
    __LT            :   function(x, y) { return x < y; },
    __GT            :   function(x, y) { return x > y; },
    __LT__EQL       :   function(x, y) { return x <= y; },
    __GT__EQL       :   function(x, y) { return x >= y; },
    mod             :   function(x, y) { return x % y; },
    setmac__BANG    :   function(x) { return x.isMacro = true; },
    str             :   argReducer("str", function(a, b) { return str1(a) + str1(b); }, ""),
    print           :   function print(x) { console.log($$root.str(x)); },
    regex           :   function regex(str, flags) { return new RegExp(str, flags); },
    
    object          :   function object(proto) { return Object.create(proto || {}); },
    geti            :   function geti(obj, idx) { return obj[idx]; },
    seti__BANG      :   function seti__BANG(obj, idx, val) { obj[idx] = val },
    
    apply__MINUSmethod  :   function apply__MINUSmethod(method, target, args) {
        return method.apply(target, args);
    },
    call__MINUSmethod   :   function call__MINUSmethod(method, target, ...args) {
        return method.apply(target, args);
    },
};

// *
// * 
// *

$$root.defmacro=(function(name,args,...body){
   var $$TMP0;
   $$TMP0=$$root.concat($$root.list($$root.concat($$root.list((new $$root.Symbol("lambda"))),$$root.list($$root.concat()),$$root.list($$root.concat($$root.list((new $$root.Symbol("def"))),$$root.list(name),$$root.list($$root.concat($$root.list((new $$root.Symbol("lambda"))),$$root.list(args),body)))),$$root.list($$root.concat($$root.list((new $$root.Symbol("setmac!"))),$$root.list(name))))));
   return $$TMP0;
}
);
$$root.defmacro;
$$root.setmac__BANG($$root.defmacro);
$$root.defun=(function(name,args,...body){
   var $$TMP1;
   $$TMP1=$$root.concat($$root.list((new $$root.Symbol("def"))),$$root.list(name),$$root.list($$root.concat($$root.list((new $$root.Symbol("lambda"))),$$root.list(args),body)));
   return $$TMP1;
}
);
$$root.defun;
$$root.setmac__BANG($$root.defun);
$$root.progn=(function(...body){
   var $$TMP2;
   $$TMP2=$$root.concat($$root.list((new $$root.Symbol("lambda"))),$$root.list($$root.concat()),body);
   return $$TMP2;
}
);
$$root.progn;
$$root.setmac__BANG($$root.progn);
$$root.inc__BANG=(function(name){
   var $$TMP3;
   $$TMP3=$$root.concat($$root.list((new $$root.Symbol("setv!"))),$$root.list(name),$$root.list($$root.concat($$root.list((new $$root.Symbol("+"))),$$root.list(name),$$root.list(1))));
   return $$TMP3;
}
);
$$root.inc__BANG;
$$root.setmac__BANG($$root.inc__BANG);
$$root.reduce=(function(r,lst,accum){
   var $$TMP4;
   var $$TMP5;
   if($$root.null__QM(lst)){
      $$TMP5=accum;
   }
   else{
      $$TMP5=$$root.reduce(r,$$root.cdr(lst),r(accum,$$root.car(lst)));
   }
   $$TMP4=$$TMP5;
   return $$TMP4;
}
);
$$root.reduce;
$$root.reverse=(function(lst){
   var $$TMP6;
   $$TMP6=$$root.reduce((function(accum,v){
      var $$TMP7;
      $$TMP7=$$root.cons(v,accum);
      return $$TMP7;
   }
   ),lst,[]);
   return $$TMP6;
}
);
$$root.reverse;
$$root.transform__MINUSlist=(function(r,lst){
   var $$TMP8;
   $$TMP8=$$root.reverse($$root.reduce(r,lst,[]));
   return $$TMP8;
}
);
$$root.transform__MINUSlist;
$$root.map=(function(f,lst){
   var $$TMP9;
   $$TMP9=$$root.transform__MINUSlist((function(accum,v){
      var $$TMP10;
      $$TMP10=$$root.cons(f(v),accum);
      return $$TMP10;
   }
   ),lst);
   return $$TMP9;
}
);
$$root.map;
$$root.filter=(function(p,lst){
   var $$TMP11;
   $$TMP11=$$root.transform__MINUSlist((function(accum,v){
      var $$TMP12;
      var $$TMP13;
      if(p(v)){
         $$TMP13=$$root.cons(v,accum);
      }
      else{
         $$TMP13=accum;
      }
      $$TMP12=$$TMP13;
      return $$TMP12;
   }
   ),lst);
   return $$TMP11;
}
);
$$root.filter;
$$root.every__MINUSnth=(function(n,lst){
   var $$TMP14;
   $$TMP14=(function(counter){
      var $$TMP15;
      $$TMP15=$$root.transform__MINUSlist((function(accum,v){
         var $$TMP16;
         var $$TMP17;
         counter=$$root.__PLUS(counter,1);
         if($$root.__EQL($$root.mod(counter,n),0)){
            $$TMP17=$$root.cons(v,accum);
         }
         else{
            $$TMP17=accum;
         }
         $$TMP16=$$TMP17;
         return $$TMP16;
      }
      ),lst);
      return $$TMP15;
   }
   )(-1);
   return $$TMP14;
}
);
$$root.every__MINUSnth;
$$root.let=(function(bindings,...body){
   var $$TMP18;
   $$TMP18=$$root.concat($$root.list($$root.concat($$root.list((new $$root.Symbol("lambda"))),$$root.list($$root.every__MINUSnth(2,bindings)),body)),$$root.every__MINUSnth(2,$$root.cdr(bindings)));
   return $$TMP18;
}
);
$$root.let;
$$root.setmac__BANG($$root.let);
$$root.print($$root.every__MINUSnth(2,$$root.cdr($$root.cons(0,$$root.cons(1,$$root.cons(2,$$root.cons(3,$$root.cons(4,$$root.cons(5,$$root.cons(6,$$root.cons(7,$$root.cons(8,$$root.cons(9,[])))))))))))));
(function(x,y){
   var $$TMP19;
   $$TMP19=(function(z,w){
      var $$TMP20;
      $$TMP20=$$root.print($$root.__PLUS(x,y,z,w));
      return $$TMP20;
   }
   )(100,200);
   return $$TMP19;
}
)(10,$$root.__PLUS(10,10));
(function(o){
   var $$TMP21;
   $$root.seti__BANG(o,"baz",50);
   $$root.seti__BANG(o,"foo",20);
   $$TMP21=$$root.print($$root.__PLUS($$root.geti(o,"baz"),$$root.geti(o,"foo")));
   return $$TMP21;
}
)($$root.object());
