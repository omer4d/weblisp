var TokenType = {
	ANY: 0,
  	OBR: 1,
  	CBR: 2,
  	NUM: 3,
  	SYM: 4,
  	QUOTE: 5,
  	BACKQUOTE: 6,
    UNQUOTE: 7,
    SPLICE: 8,
  	END: 9
};

function GenericTok(res)
{ 
	this.type = TokenType.ANY;
    this.val = res[0];
}

function ObrTok(res)
{
    this.type = TokenType.OBR;
    this.val = null;
}

function CbrTok(res)
{
    this.type = TokenType.CBR;
    this.val = null;
}

function QuoteTok(res)
{
    this.type = TokenType.QUOTE;
    this.val = null;
}

function BackQuoteTok(res)
{
    this.type = TokenType.BACKQUOTE;
    this.val = null;
}

function UnquoteTok(res)
{
    this.type = TokenType.UNQUOTE;
    this.val = null;
}

function SpliceTok(res)
{
    this.type = TokenType.SPLICE;
    this.val = null;
}

function NumberTok(res)
{
    this.type = TokenType.NUM;
    this.val = parseFloat(res[0]);
}

function SymbolTok(res)
{
    this.type = TokenType.SYM;
    this.val = res[0];
}

function tokenize(str)
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

    var tokenTable = [{patt: spacePatt, ctor: null},
                      {patt: numberPatt, ctor: NumberTok},
                      {patt: obrPatt, ctor: ObrTok},
                      {patt: cbrPatt, ctor: CbrTok},
                      {patt: quotePatt, ctor: QuoteTok},
                      {patt: backQuotePatt, ctor: BackQuoteTok},
                      {patt: splicePatt, ctor: SpliceTok},
                      {patt: unquotePatt, ctor: UnquoteTok},
                      {patt: symPatt, ctor: SymbolTok}];
    var toks = [];

    while(str.length > 0)
    {
        var i = 0;
    
        for(i = 0; i < tokenTable.length; ++i)
        {
            var res = str.match(tokenTable[i].patt);
        
            if(res !== null)
            {
                str = str.substring(res[0].length);
            
                if(tokenTable[i].ctor !== null)
                    toks.push(new tokenTable[i].ctor(res));
            
                break;
            }
        }
    
        if(i == tokenTable.length)
        {
            throw "Unrecognized token: " + str;
        }
    }
    
    toks.push({type: TokenType.END, val: null});
    
    return toks;
}