function makeEnum(...args)
{
    var e = {};
    for(var i = 0; i < args.length; ++i)
        e[args[i]] = i;
    
    return e;
}

function pairs(arr)
{
    var res = [];
    
    for(var i = 0; i < arr.length; ++i)
        for(var j = i + 1; j < arr.length; ++j)
            res.push([arr[i], arr[j]]);
    
    return res;
}