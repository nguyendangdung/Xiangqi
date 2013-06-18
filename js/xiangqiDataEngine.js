// Constants
var Pieces = {
    // Red
    JU: "车",
    MA: "马",
    PAO: "炮",
    XIANG0: "相",
    SHI0: "仕",
    SHUAI: "帅",
    BING: "兵",
    
    // Black
    XIANG1: "象",
    SHI1: "士",
    JIANG: "将",
    ZU: "卒",
}

// Data model
function XiangqiData() {
    this.board= [
        //{ name: Pieces.JU, player: 0 }, ...
    ];
    this.board_init= [
        //{ name: Pieces.JU, player: 0 }, ...
    ];
    this.moves= [
        //{
        //    from:   [1,1],
        //    to:     [1,2],
        //    eaten:  null, // or Pieces.Ma
        //    player: 0, // moved by player 0
        //}, ...
    ]; 
    this.cachedMoves= []; // 缓存的棋谱？
}
//XiangqiData.prototype = {
//    // 这里添加各种data相关的函数
//    constructor: XiangqiData,
//};


// Engine
function XiangqiEngine(data) {
    this.data = data; // reference to xiangqiData
}
XiangqiEngine.prototype = {
    // 这里添加对象棋数据this.data的各种操作
    constructor: XiangqiEngine,
    
    init: function() {
        // 初始化棋局
        this.data.board = [
             // Row 1
            { name: Pieces.JU, player: 0},
            { name: Pieces.MA, player: 0},
            { name: Pieces.XIANG0, player: 0},
            { name: Pieces.SHI0, player: 0},
            { name: Pieces.SHUAI, player: 0},
            { name: Pieces.SHI0, player: 0},
            { name: Pieces.XIANG0, player: 0},
            { name: Pieces.MA, player: 0},
            { name: Pieces.JU, player: 0},
            // Row 2
            null, null, null, null, null, null, null, null, null,
            // Row 3
            null, 
            { name: Pieces.PAO, player: 0},
            null, null, null, null, null, 
            { name: Pieces.PAO, player: 0},
            null,
            // Row 4
            { name: Pieces.BING, player: 0},
            null,
            { name: Pieces.BING, player: 0},
            null,
            { name: Pieces.BING, player: 0},
            null,
            { name: Pieces.BING, player: 0},
            null,
            { name: Pieces.BING, player: 0},
            // Row 5
            null, null, null, null, null, null, null, null, null, 
            // Row 6
            null, null, null, null, null, null, null, null, null, 
            // Row 7
            { name: Pieces.ZU, player: 1},
            null,
            { name: Pieces.ZU, player: 1},
            null,
            { name: Pieces.ZU, player: 1},
            null,
            { name: Pieces.ZU, player: 1},
            null,
            { name: Pieces.ZU, player: 1},
            // Row 8
            null,
            { name: Pieces.PAO, player: 1},
            null, null, null, null, null, 
            { name: Pieces.PAO, player: 1},
            null,
            // Row 9
            null, null, null, null, null, null, null, null, null, 
            { name: Pieces.JU, player: 1},
            { name: Pieces.MA, player: 1},
            { name: Pieces.XIANG1, player: 1},
            { name: Pieces.SHI1, player: 1},
            { name: Pieces.JIANG, player: 1},
            { name: Pieces.SHI1, player: 1},
            { name: Pieces.XIANG1, player: 1},
            { name: Pieces.MA, player: 1},
            { name: Pieces.JU, player: 1}
        ];
    },
    
    
    newMove: function(from, to, player) {
        // 新一步
        // TODO: 此为临时代码
        var eaten = this.data.board[to[0]+to[1]*9];
        this.data.board[to[0]+to[1]*9] = this.data.board[from[0]+from[1]*9];
        this.data.board[from[0]+from[1]*9] = null;
        this.data.moves.push({
            from:   from,
            to:     to,
            eaten:  eaten,
            player: player,
        });
    },
    undoMove: function() {
        // 撤销一步
    },
    canMove: function(from, to, player) {
        // 是否合法
    },
    
    
    loadMoves: function(binit, movelist) {
        // 读取字符串棋谱, 返回初始局面和棋子移动
        var board_init = [],
            board = [],
            moves = [];
        var init_pieces = [
            Pieces.JU, Pieces.MA, Pieces.XIANG0, Pieces.SHI0,
            Pieces.SHUAI,
            Pieces.SHI0, Pieces.XIANG0, Pieces.MA, Pieces.JU,
            Pieces.PAO, Pieces.PAO,
            Pieces.BING, Pieces.BING, Pieces.BING, Pieces.BING, Pieces.BING, 
            
            Pieces.JU, Pieces.MA, Pieces.XIANG1, Pieces.SHI1,
            Pieces.JIANG,
            Pieces.SHI1, Pieces.XIANG1, Pieces.MA, Pieces.JU,
            Pieces.PAO, Pieces.PAO,
            Pieces.ZU, Pieces.ZU, Pieces.ZU, Pieces.ZU, Pieces.ZU,
        ];
        for (var i = 0; i < binit.length; i+=2) {
            var x = parseInt(binit[i]),
                y = 9-parseInt(binit[i+1]);
            if (x != 9) {
                // 99: 不存在
                board[x+y*9] = board_init[x+y*9] = {
                    name: init_pieces[i/2],
                    player: (i<16*2)? 0 : 1
                };
            }
        }
        
        for (var i = 0; i < movelist.length; i+=4) {
            var from = [parseInt(movelist[i]), 9-parseInt(movelist[i+1])],
                to   = [parseInt(movelist[i+2]), 9-parseInt(movelist[i+3])];
            var eaten = board[to[0]+to[1]*9];
            board[to[0]+to[1]*9] = board[from[0]+from[1]*9];
            board[from[0]+from[1]*9] = null;
            moves.push({
                from:   from,
                to:     to,
                name:   board[to[0]+to[1]*9].name,
                eaten:  eaten,
                player: board[to[0]+to[1]*9].player,
            });
        }
        
        for (var i = 0; i < board_init.length; i++)
            if (board_init[i] === undefined)
                board_init = null;
        
        return [board_init, moves];
    },  
    dumpMoves: function() {
        // 导出字符串棋谱
        // return moves_string
        var binit = "",
            movelist = "";
        var init_pieces = [
            Pieces.JU, Pieces.MA, Pieces.XIANG0, Pieces.SHI0,
            Pieces.SHUAI,
            Pieces.SHI0, Pieces.XIANG0, Pieces.MA, Pieces.JU,
            Pieces.PAO, Pieces.PAO,
            Pieces.BING, Pieces.BING, Pieces.BING, Pieces.BING, Pieces.BING, 
            
            Pieces.JU, Pieces.MA, Pieces.XIANG1, Pieces.SHI1,
            Pieces.JIANG,
            Pieces.SHI1, Pieces.XIANG1, Pieces.MA, Pieces.JU,
            Pieces.PAO, Pieces.PAO,
            Pieces.ZU, Pieces.ZU, Pieces.ZU, Pieces.ZU, Pieces.ZU,
        ];
        
        var tmpbinit = {};
        for (var i=0; i<9; i++)
            for (var j=0; j<10; j++) {
                if (this.data.board_init[j*9+i] && this.data.board_init[j*9+i] !== null)
                    tmpbinit[this.data.board_init[j*9+i].name + this.data.board[j*9+i].player] = i+""+(9-j);
        }
        for (var i=0; i<init_pieces.length; i++) {
            binit += tmpbinit[init_pieces[i] + ((i<16*2)? 0 : 1)];
        }
        
        for (var i=0; i<this.data.moves.length; i++) {
            var from = this.data.moves[i].from,
                to   = this.data.moves[i].to;
            movelist += ""+from[0]+(9-from[1])+to[0]+(9-to[1]);
        }
        
        return { binit: binit, movelist: movelist };
    },
    
    
    moveToScript: function(move) {
        // 转换某一步为标准棋谱
    },
    
    getAllPieces: function() {
        // 返回所有棋子及其位置
        // 格式：
        //      {name: Pieces.JU, pos: [1,1], player: 0}
        var result = [];
        for (var i=0; i<9; i++)
            for (var j=0; j<10; j++) {
                if (this.data.board[j*9+i] && this.data.board[j*9+i] !== null)
                    result.push({
                        name: this.data.board[j*9+i].name,
                        pos: [i, j],
                        player: this.data.board[j*9+i].player,
                    });
        }
        return result;
    },
};















