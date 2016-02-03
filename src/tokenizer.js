var TokenType = makeEnum("LIST_OPEN", "LIST_CLOSE", "ARR_OPEN", "ARR_CLOSE", "OBJ_OPEN", "OBJ_CLOSE",
                            "TRUE", "FALSE", "NULL", "UNDEF", "NUM", "SYM", 
                            "QUOTE", "BACKQUOTE", "UNQUOTE", "SPLICE", "END");

function tokenTypeStr(t)
{
    return Object.keys(TokenType).filter(function(key) {
    	return TokenType[key] === t;
    })[0];
}

function Token(src, type, start, len)
{
    this.src = src;
	this.type = type;
    this.start = start;
    this.len = len;
}

Token.prototype.toString = function()
{
	return tokenTypeStr(this.type) + " " + this.start;
};

Token.prototype.text = function()
{
	return this.src.substr(this.start, this.len);
};

function wordOrNum(tokType)
{
    return [TokenType.TRUE, TokenType.FALSE, TokenType.NULL, TokenType.UNDEF,
            TokenType.SYM, TokenType.NUM].indexOf(tokType) != -1;
}

function matchLiterally(str)
{
  return new RegExp("^" + str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

function tokenize(src)
{                 
    var spacePatt = /^\s+/;
    var numberPatt = /^[+\-]?\d+(\.\d*)?|^[+\-]?\.\d+/;
    var symPatt = /^[<>?+\-=!@#$%\^&*/a-zA-Z][<>?+\-=!@#$%\^&*/a-zA-Z0-9]*/;
    var lit = matchLiterally;
    
    var tokenTable = [{patt: spacePatt, type: -1},
                      {patt: lit("true"), type: TokenType.TRUE},
                      {patt: lit("false"), type: TokenType.FALSE},
                      {patt: lit("null"), type: TokenType.NULL},
                      {patt: lit("undefined"), type: TokenType.UNDEF},
                      {patt: numberPatt, type: TokenType.NUM},
                      {patt: lit("("), type: TokenType.LIST_OPEN},
                      {patt: lit(")"), type: TokenType.LIST_CLOSE},
                      {patt: lit("["), type: TokenType.ARR_OPEN},
                      {patt: lit("]"), type: TokenType.ARR_CLOSE},
                      {patt: lit("{"), type: TokenType.OBJ_OPEN},
                      {patt: lit("}"), type: TokenType.OBJ_CLOSE},
                      {patt: lit("'"), type: TokenType.QUOTE},
                      {patt: lit("`"), type: TokenType.BACKQUOTE},
                      {patt: lit("~@"), type: TokenType.SPLICE},
                      {patt: lit("~"), type: TokenType.UNQUOTE},
                      {patt: symPatt, type: TokenType.SYM}];
    var toks = [];
    var pos = 0;
    var str = src;
    var separated = true;

    while(str.length > 0)
    {
        var i = 0;
    
        for(i = 0; i < tokenTable.length; ++i)
        {
            var res = str.match(tokenTable[i].patt);
        
            if(res !== null)
            {
                str = str.substring(res[0].length);
            
                if(tokenTable[i].type !== -1)
                {
                    if(wordOrNum(tokenTable[i].type) && !separated)
                    {
                        if(toks[toks.length - 1].type === TokenType.NUM)
                            throw "Unrecognized token: " + str;
                        else
                        {
                            toks[toks.length - 1].type = TokenType.SYM;
                            toks[toks.length - 1].len += res[0].length;
                        }
                    }
                    
                    else
                        toks.push(new Token(src, tokenTable[i].type, pos, res[0].length));
                }
                
                separated = !wordOrNum(tokenTable[i].type);
            	pos += res[0].length;
            
                break;
            }
        }
    
        if(i == tokenTable.length)
        {
            throw "Unrecognized token: " + str;
        }
    }
    
    toks.push({type: TokenType.END});
    
    return toks;
}