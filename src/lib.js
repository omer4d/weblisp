function format()
{
    var rx = /%[0-9]+/gi;
    var args = arguments;
    
    return args[0].replace(rx, function(match) {
        return args[parseInt(match.substring(1)) + 1];
    });
}

function argReducer(name, r, initial)
{
    var f = function() {
    	if(arguments.length === 0)
        	return initial;
        else if(arguments.length === 1)
        	return r(initial, arguments[0]);
        else
        {
    		var accum = r(arguments[0], arguments[1]);
        	for(var i = 2; i < arguments.length; i++)
        		accum = r(accum, arguments[i]);
        	return accum;
        }
    };

	return f;
}

function validName(x)
{
	return x !== null && x !== undefined && x !== "";
}

function str1(x)
{
	if(x === null)
   		return "null";
    else if(x === undefined)
    	return "undefined";
    else if(typeof(x) === "function")
    	return (x.isMacro ? "Macro " : "Function ") + (validName(x.namestr) ? x.namestr : "[Anonymous]");
    else if(Array.isArray(x))
        return "[" + x.map(str1).join(" ") + "]";
    else
    	return x.toString();
}

__PLUS = argReducer("+", function(a, b) { return a + b; }, 0);
__MINUS = argReducer("-", function(a, b) { return a - b; }, 0);
__STAR = argReducer("*", function(a, b) { return a * b; }, 1);
__SLASH = argReducer("/", function(a, b) { return a / b }, 1);
str = argReducer("str", function(a, b) { return str1(a) + str1(b); }, "");

function join(coll, sep)
{
    return reduce(interpose(coll, sep), str, "");
}

Cons.prototype.toString = function()
{
    if(list__QM(this))
        return format("(%0)", join(this, " "));
    else
        return format("(%0 . %1)", this.car, this.cdr);
};

function __EQL(...args) {
	var v = args[0];
	
	for(var i = 1; i < args.length; ++i)
		if(args[i] !== v)
			return false;
	
	return true;
}
function not__EQL(x, y) { return x !== y; }
function __LT(x, y) { return x < y; }
function __GT(x, y) { return x > y; }
function __LT__EQL(x, y) { return x <= y; }
function __GT__EQL(x, y) { return x >= y; }
function mod(x, y) { return x % y; }

function null__QM(x)
{
    return x === null;
}

function undefined__QM(x)
{
    return x === undefined;
}

function number__QM(x)
{
    return typeof x === "number" || x instanceof Number;
}

function symbol__QM(x)
{
    return x instanceof Symbol;
}

function bool__QM(x)
{
    return x === true || x === false;
}

function string__QM(x)
{
    return typeof x === "string" || x instanceof String;
}

function atom__QM(x)
{
    return null__QM(x) ||
           number__QM(x) ||
           symbol__QM(x) ||
           bool__QM(x) ||
           undefined__QM(x) ||
           string__QM(x);
}

function conj(coll, item)
{
    if(Array.isArray(coll))
    {
        coll.push(item);
        return coll;
    }
    else
        return cons(item, coll);
}

function listToArray(lst)
{
    return reduce(lst, conj, []);
}

function identity(x)
{
	return x;
}

function get(key, x)
{
    return x[key];
}

function getter(key)
{
    return function(x) {
        return x[key];
    };
}

function partial()
{
    var args1 = new Array(arguments.length);
    for(var i = 0; i < args1.length; ++i)
        args1[i] = arguments[i];
    
    return function() {
        var args2 = new Array(arguments.length);
        for(var i = 0; i < args2.length; ++i)
            args2[i] = arguments[i];
        
        return args1[0].apply(this, args1.slice(1).concat(args2));
    };
}

function apply(fun, args)
{
	return fun.apply(null, reduce(args, function(arr, x) {
		arr.push(x);
		return arr;
	}, []));
}

function dolist(f, lst)
{
    for(var node = lst; node != null; node = cdr(node))
        f(car(node));
}

function print(x)
{
    console.log(str1(x));
}

function equal__QM(a, b)
{
	if(symbol__QM(a))
		return symbol__QM(b) && a.name === b.name;
	else if(number__QM(a) || null__QM(a))
		return a === b;
	else if(a instanceof Cons)
	{
		if(b instanceof Cons)
		{
			do {
				if(!equal__QM(car(a), car(b)))
					return false;
				
				a = cdr(a);
				b = cdr(b);
			}while(a instanceof Cons && b instanceof Cons);
			
			return equal__QM(a, b);
		}
		
		else
			return false;
	}
	else
		return a === b;
}