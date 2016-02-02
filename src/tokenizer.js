var TokenType = makeEnum("OBR", "CBR", "TRUE", "FALSE", "NULL", "UNDEF", "NUM", "SYM", 
                            "QUOTE", "BACKQUOTE", "UNQUOTE", "SPLICE", "END");

function Token(src, type, start, len)
{
    this.src = src;
	this.type = type;
    this.start = start;
    this.len = len;
}

Token.prototype.toString = function()
{
    var t = this.type;

	return Object.keys(TokenType).filter(function(key) {
    	return TokenType[key] === t;
    })[0] + " " + this.start;
};

Token.prototype.text = function()
{
	return this.src.substr(this.start, this.len);
};

function tokenize(src)
{                 
    var spacePatt = /^\s+/;
    var numberPatt = /^[+\-]?\d+(\.\d*)?|^[+\-]?\.\d+/;
    var obrPatt = /^\(/;
    var cbrPatt = /^\)/;
    var quotePatt = /^\'/;
    var backQuotePatt = /^\`/;
    var unquotePatt = /^\~/;
    var splicePatt = /^\~@/;
    var symPatt = /^[<>?+\-=!@#$%\^&*/a-zA-Z][<>?+\-=!@#$%\^&*/a-zA-Z0-9]*/;
    
    var tokenTable = [{patt: spacePatt, type: -1},
                      {patt: /^true$/, type: TokenType.TRUE},
                      {patt: /^false$/, type: TokenType.FALSE},
                      {patt: /^null$/, type: TokenType.NULL},
                      {patt: /^undefined$/, type: TokenType.UNDEF},
                      {patt: numberPatt, type: TokenType.NUM},
                      {patt: obrPatt, type: TokenType.OBR},
                      {patt: cbrPatt, type: TokenType.CBR},
                      {patt: quotePatt, type: TokenType.QUOTE},
                      {patt: backQuotePatt, type: TokenType.BACKQUOTE},
                      {patt: splicePatt, type: TokenType.SPLICE},
                      {patt: unquotePatt, type: TokenType.UNQUOTE},
                      {patt: symPatt, type: TokenType.SYM}];
    var toks = [];
    var pos = 0;
    var str = src;

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
                    toks.push(new Token(src, tokenTable[i].type, pos, res[0].length));
            
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