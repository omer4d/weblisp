var geval = eval;
var global = geval("this");

var manglingTable = {
    "<" : "__LT",
    ">" : "__GT",
    "?" : "__QM",
    "+" : "__PLUS",
    "-" : "__MINUS",
    "=" : "__EQL",
    "!" : "__BANG",
    "@" : "__AT",
    "#" : "__HASH",
    "$" : "__USD",
    "%" : "__PCNT",
    "^" : "__CARET",
    "&" : "__AMP",
    "*" : "__STAR",
    "/" : "__SLASH"
};

var manglingRx = new RegExp("\\" + Object.keys(manglingTable).join("|\\"), "gi");

function mangle(x)
{
    return manglingTable[x];
}

function mangleName(name)
{
    return name.replace(manglingRx, mangle);
}

var nextVarSuffix = 0;

function genVarName()
{
    var out = "$$TMP" + nextVarSuffix;
    ++nextVarSuffix;
    return out;
};

// Each compileXXXX function must return a pair [v:String, s:String] such that:
// - v is a javascript expression that yields the value of the source lisp expression
// - v does not contain any statements (and mustn't end on a semicolon)
// - s contains zero or more javascript statements to be executed before evaluating v
// - Given a result [_, s2] of another compilation, s+s2 must be valid javascript
//   i.e. do not rely on automatic semicolon insertion
///       do not rely on consumers to insert necessary separators before concat.


function compileAtom(x)
{
	if(symbol__QM(x))
    	return [mangleName(x.toString()), ""];
    else if(x === true)
        return ["true", ""];
    else if(x === false)
        return ["false", ""];
    else if(x === null)
        return ["null", ""];
    else if(x === undefined)
        return ["undefined", ""];
    else // string or number
    	return [x.toString(), ""];
}

function compileFuncall(lst)
{
    var compiledArgs = map(cdr(lst), compile);
    var compiledFun = compile(car(lst));
    
    return [format("%0(%1)",
                    compiledFun[0],
                    join(map(compiledArgs, getter(0)), ",")),
            compiledFun[1] + join(map(compiledArgs, getter(1)), "")];
}

function compileBodyHelper(lst, targetVarName)
{
    var compiledBody = map(lst, compile);
    
    var reducer = function(accum, v) {
        return accum + v[1] + v[0] + ";";
    };
    
    return reduce(butlast(compiledBody, 1), reducer, "") + 
            last(compiledBody)[1] + 
            targetVarName + "=" + last(compiledBody)[0] + ";";
}

function processArgs(args)
{
	var revArgs = reduce(args, function(accum, v) {
    	return cons(v.name[0] == "&" ?
        			"&" + mangleName(v.name.slice(1)) : mangleName(v.name),
                    accum);
    }, null);
    
    if(revArgs !== null && revArgs.car[0] == "&")
    {
    	var varargCompilerName = genVarName();
        
        return {
        	args: reverse__BANG(cons("..." + varargCompilerName, revArgs.cdr)),
        	varargUserName: revArgs.car.slice(1),
            varargCompilerName: varargCompilerName
        };
    }
    else
    	return {
        	args: reverse__BANG(revArgs),
        };
}

function compileDefun(lst)
{
    var name = mangleName(second(lst).toString());
    var retVarName = genVarName();
    var compiledBody = compileBodyHelper(lst.cdr.cdr.cdr, retVarName);
    var r = processArgs(lst.cdr.cdr.car);
    var argStr = join(r.args, ",");
    var varargInit = "";
    
    if("varargUserName" in r)
    	varargInit = format("var %0=arrayToList(%1);", r.varargUserName, r.varargCompilerName);
    
    return [name,
    		format("function %0(%1)"+
                    "{"+
                        "var %2;"+
						"%3"+
                        "%4"+
                        "return %5;"+
                    "}",
                    name, argStr, retVarName,
                    varargInit, compiledBody, retVarName)];
}

function compileLambda(lst)
{
    var retVarName = genVarName();
    var compiledBody = compileBodyHelper(lst.cdr.cdr, retVarName);
    var r = processArgs(lst.cdr.car);
    var argStr = join(r.args, ",");
    var varargInit = "";
    
    if("varargUserName" in r) 
    	varargInit = format("var %0=arrayToList(%1);", r.varargUserName, r.varargCompilerName);
    
    return [format("(function (%0)"+
                    "{"+
                        "var %1;"+
                        "%2" +
                        "%3" +
                        "return %4;"+
                    "})",
                    argStr,
                    retVarName,
                    varargInit,
                    compiledBody,
                    retVarName), ""];
}

function compileDefmacro(lst)
{
	var name = mangleName(second(lst).toString());
	var t = compileDefun(lst);
    t[1] += format("%0.isMacro=true;", name);
    return t;
}

function compileIf(lst)
{
    var cond = lst.cdr.car;
    var t = lst.cdr.cdr.car;
    var f = lst.cdr.cdr.cdr.car;
    
    var valueVarName = genVarName();
    
    var compiledCond = compile(cond);
    var compiledT = compile(t);
    var compiledF = compile(f);
    
    return [valueVarName,
            format("var %0;"        +
                   "%1"             +
                    "if(%2){"       +
                        "%3"        +
                        "%0=%4;"    +
                    "}"             +
                    "else{"         +
                        "%5"        +
                        "%0=%6;"    +
                    "}",
                    valueVarName,
                    compiledCond[1],
                    compiledCond[0],
                    compiledT[1],
                    compiledT[0],
                    compiledF[1],
                    compiledF[0])];
}

function compileProgn(lst)
{
    var valueVarName = genVarName();
    
    return [valueVarName,
            "var " + valueVarName + ";" +
            compileBodyHelper(lst.cdr, valueVarName)];
}

function compileQuotedAtom(x)
{
    if(symbol__QM(x))
        return ["(new Symbol(\"" + x.name + "\"))", ""];
    else
        return compileAtom(x);
}

function compileQuotedList(x)
{
    var r = function(accum, v) {
        return [accum[0] + "cons(" + compileQuoted(v)[0] + ",", accum[1] + ")"];
    };
    
    return [reduce(x, r, ["", "null"]).join(""), ""];
}

function compileQuoted(x)
{
    if(atom__QM(x))
        return compileQuotedAtom(x);
    else
        return compileQuotedList(x);
}

function compileSetv(lst)
{
    var varName = mangleName(second(lst).toString());
    var compiledVal = compile(third(lst));
    return [varName, compiledVal[1] + varName + "=" + compiledVal[0] + ";"];
}

function compileSeti(lst)
{
    
}

function macroexpandUnsafe(expr)
{
	var withQuotedArgs = cons(expr.car, map(expr.cdr, function(x) {
    	return list(new Symbol("quote"), x);
    }));
    
    var tmp = compileFuncall(withQuotedArgs);
    return geval(tmp[1] + tmp[0]);
}

function macroexpand(expr)
{
	if(list__QM(expr) && expr != null && evalisp(car(expr))["isMacro"])
    	return macroexpandUnsafe(expr);
    
    else
    	throw "macroexpand argument is not a macro!";
}

function compile(expr)
{
    if(list__QM(expr) && expr != null)
    {
        var first = car(expr);
        
		if(first instanceof Symbol)
		{
		    switch(first.name)
		    {
		        case "defun":
				    return compileDefun(expr);
			    case "defmacro":
				    return compileDefmacro(expr);
			    case "lambda":
				    return compileLambda(expr);
			    case "if":
				    return compileIf(expr);
			    case "progn":
				    return compileProgn(expr);
			    case "quote":
				    return compileQuoted(second(expr));
			    case "setv":
			        return compileSetv(expr);
			    case "seti":
			        return compileSeti(expr);
			    default:
			        if(global[first.name] !== undefined && global[first.name]["isMacro"])
				        return compile(macroexpandUnsafe(expr));
			        else
				        return compileFuncall(expr);
		    }
		}
		
		else
			return compileFuncall(expr);
    }
    
    else
        return compileAtom(expr);
}

function evalisp(expr)
{
	var tmp = compile(expr);
    //console.log(tmp[1] + tmp[0]);
    return geval(tmp[1] + tmp[0]);
}

function evalispstr(str)
{
	var toks = tokenize(str);
    var forms = parse(toks);
	var r;

	for(var i = 0; i < forms.length; ++i)
	{
    	r = evalisp(forms[i]);
	}
	
	return r;
}