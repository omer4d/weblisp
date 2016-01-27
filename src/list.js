function Cons(car, cdr)
{
    this.car = car;
    this.cdr = cdr;
}

function cons(car, cdr)
{
    return new Cons(car, cdr);
}

function car(lst)
{
    return lst.car;
}

function cdr(lst)
{
    return lst.cdr;
}

function cddr(lst)
{
    return lst.cdr.cdr;
}

function first(lst)
{
    return lst.car;
}

function second(lst)
{
    return lst.cdr.car;
}

function list__QM(lst)
{
    return lst === null || lst instanceof Cons && list__QM(cdr(lst));
}

function reverse__BANG(lst)
{
    var node = lst;
    var prev = null;
    
    while(node != null)
    {
        var next = cdr(node);
        node.cdr = prev;
        prev = node;
        node = next;
    }
    
    return prev;
}

function arrayToList(arr)
{
	var lst = null;
    
	for(var i = arr.length - 1; i >= 0; --i)
    	lst = cons(arr[i], lst);
    
    return lst;
}

function list(...args)
{
    return arrayToList(args);
}

function reduce(lst, rf, accum)
{
    var stop = false;
    var ctx = {
        reduced: function(x) {
            stop = true;
            return x;
        }
    };
    
    for(var node = lst; node !== null && !stop; node = cdr(node))
        accum = rf.call(ctx, accum, car(node));
    
    return accum; 
}


function map(lst, f)
{
    return reverse__BANG(reduce(lst, function(accum, v) {
        return cons(f(v), accum);
    }, null));
}

function filter(lst, pred)
{
    return reverse__BANG(reduce(lst, function(accum, v) {
        return pred(v) ? cons(v, accum) : accum;
    }, null));
}

function first(lst)
{
    return lst.car;
}

function last(lst)
{
    return reduce(lst, function(accum, v) {
        return v;
    }, undefined);
}

function count(lst)
{
    return reduce(lst, function(accum, v) {
        return accum + 1;
    }, 0);
}

function take(lst, n)
{
    return reverse__BANG(reduce(lst, function(accum, v) {
        --n;
        if(n >= 0)
            return cons(v, accum);
        else
            return this.reduced(accum);
    }, null));
}

function drop(lst, n)
{
    return reverse__BANG(reduce(lst, function(accum, v) {
        --n;
        if(n >= 0)
            return accum;
        else
            return cons(v, accum);
    }, null));
}

function rest(coll)
{
    return drop(coll, 1);
}

function interpose(lst, x)
{
    var fst = true;
                
    return reverse__BANG(reduce(lst, function(accum, v) {
        if(fst)
        {
            fst = false;
            return cons(v, accum);
        }
        else
            return cons(v, cons(x, accum));
    }, null));
}

function nth(lst, n)
{
    return reduce(lst, function(accum, v) {
        if(n === 0)
            return this.reduced(v);
        else
        {
            --n;
            return v;
        }
    }, undefined);
}

function every__MINUSnth(lst, n)
{
	var counter = 0;

	return reverse__BANG(reduce(lst, function(accum, v) {
        return (counter++) % n === 0 ? cons(v, accum) : accum;
    }, null));
}

function butlast(coll, n)
{
    return take(coll, count(coll) - n);
}

function join(coll, sep)
{
    return reduce(interpose(coll, sep), str, "");
}

function concat(...args)
{
	var i;
    
    for(i = 0; args[i] === null; ++i);
	
    if(args.length - i === 0)
    	return null;
    else if(args.length - i === 1)
    	return args[i];
    else
    {
    	var start = cons(null, null);
        var end = start;
        
		for(; i < args.length - 1; ++i)
    	{
    		for(var node = args[i]; node != null; node = node.cdr)
    		{
    			var tmp = cons(node.car, null);
    			end.cdr = tmp;
        		end = tmp;
    		}
        }
    
    	end.cdr = args[i];
    	return start.cdr;
	}
}