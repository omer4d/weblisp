function makeEnum(...args)
{
    var e = {};
    for(var i = 0; i < args.length; ++i)
        e[args[i]] = i;
    
    return e;
}
