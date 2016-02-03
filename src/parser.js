function Parser(toks)
{
    this.toks = toks;
    this.curr = 0;
}

Parser.prototype.peekTok = function()
{
    return this.toks[this.curr];
};

Parser.prototype.consumeTok = function()
{
    var tok = this.toks[this.curr];
    ++this.curr;
    return tok;
};

Parser.prototype.parseExpr = function()
{
    var tok = this.consumeTok();
    
    switch(tok.type)
    {
        case TokenType.LIST_OPEN:
            return this.parseList();
        case TokenType.ARR_OPEN:
            return this.parseArrayLiteral();
        case TokenType.TRUE:
            return true;
        case TokenType.FALSE:
            return false;
        case TokenType.NULL:
            return null;
        case TokenType.UNDEF:
            return undefined;
        case TokenType.NUM:
            return parseFloat(tok.text());
        case TokenType.QUOTE:
            return cons(new Symbol("quote"), cons(this.parseExpr(), null));
        case TokenType.BACKQUOTE:
        	return this.parseBackquotedExpr();
        case TokenType.SYM:
            return new Symbol(tok.text());
        //case TokenType.END:
            //return null;
        default:
            throw "Unexpected token: " + this.peekTok().type;
    }
};

function reduceExprSequence(p, terminator, accum, r)
{
    while(p.peekTok().type != terminator && 
          p.peekTok().type != TokenType.END)
    {
        accum = r(accum, p.parseExpr());
    }
    
    if(p.consumeTok().type == terminator)
        return accum;
    else
        throw "Unmatched paren!";
}

function parseBackquotedSequence(p, terminator)
{
    var lst = null;

    while(p.peekTok().type != terminator && 
          p.peekTok().type != TokenType.END)
    {
    	if(p.peekTok().type === TokenType.UNQUOTE)
        {
        	p.consumeTok();
            lst = cons(list(new Symbol("list"), p.parseExpr()), lst);
        }
        
        else if(p.peekTok().type === TokenType.SPLICE)
        {
        	p.consumeTok();
            lst = cons(p.parseExpr(), lst);
        }
        
        else
        {
        	var quotedMember = p.parseBackquotedExpr(); //list(new Symbol("quote"), this.parseExpr());
        	lst = cons(list(new Symbol("list"), quotedMember), lst);
            
        }
    }
    
    if(p.consumeTok().type == terminator)
        return cons(new Symbol("concat"), reverse__BANG(lst));
    else
        throw "Unclosed list!";
};


Parser.prototype.parseList = function()
{
    return reverse__BANG(reduceExprSequence(this, TokenType.LIST_CLOSE, null, conj));
};

Parser.prototype.parseArrayLiteral = function()
{
    return reduceExprSequence(this, TokenType.ARR_CLOSE, [], conj);
}

Parser.prototype.parseBackquotedExpr = function()
{
	switch(this.peekTok().type)
    {
        case TokenType.LIST_OPEN:
    	    this.consumeTok();
            return parseBackquotedSequence(this, TokenType.LIST_CLOSE);
        case TokenType.ARR_OPEN:
            this.consumeTok();
            return list(new Symbol("listToArray"), parseBackquotedSequence(this, TokenType.ARR_CLOSE));
        default:
   	        return cons(new Symbol("quote"), cons(this.parseExpr(), null));
    }
};

function parse(toks)
{
    var p = new Parser(toks);
    var forms = [];

	while(p.peekTok().type !== TokenType.END)
	{
		forms.push(p.parseExpr());
	}
	
	/*
    while(1)
    {
        var res = p.parseExpr();
        if(res === null)
            break;
        else
            forms.push(res);
            //print(res);
    }*/
    
    return forms;
}