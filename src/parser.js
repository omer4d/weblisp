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
        case TokenType.OBR:
            return this.parseList();
        case TokenType.NUM:
            return parseFloat(tok.text());
        case TokenType.QUOTE:
            return cons(new Symbol("quote"), cons(this.parseExpr(), null));
        case TokenType.BACKQUOTE:
        	return this.parseBackquote();
        case TokenType.SYM:
            return new Symbol(tok.text());
        //case TokenType.END:
            //return null;
        default:
            throw "Unexpected token: " + this.peekTok().type;
    }
};

Parser.prototype.parseList = function()
{
    var lst = null;

    while(this.peekTok().type != TokenType.CBR && 
          this.peekTok().type != TokenType.END)
    {
        lst = cons(this.parseExpr(), lst);
    }
    
    if(this.consumeTok().type == TokenType.CBR)
        return reverse__BANG(lst);
    else
        throw "Unclosed list!";
};

Parser.prototype.parseBackquote = function()
{
	if(this.peekTok().type != TokenType.OBR)
    	return cons(new Symbol("quote"), cons(this.parseExpr(), null));
	else
   	{
    	var tok = this.consumeTok();
        return this.parseBackquotedList();
    }
};

Parser.prototype.parseBackquotedList = function()
{
    var lst = null;

    while(this.peekTok().type != TokenType.CBR && 
          this.peekTok().type != TokenType.END)
    {
    	if(this.peekTok().type === TokenType.UNQUOTE)
        {
        	this.consumeTok();
            lst = cons(list(new Symbol("list"), this.parseExpr()), lst);
        }
        
        else if(this.peekTok().type === TokenType.SPLICE)
        {
        	this.consumeTok();
            lst = cons(this.parseExpr(), lst);
        }
        
        else
        {
        	var quotedMember = this.parseBackquote(); //list(new Symbol("quote"), this.parseExpr());
        	lst = cons(list(new Symbol("list"), quotedMember), lst);
            
        }
    }
    
    if(this.consumeTok().type == TokenType.CBR)
        return cons(new Symbol("concat"), reverse__BANG(lst));
    else
        throw "Unclosed list!";
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