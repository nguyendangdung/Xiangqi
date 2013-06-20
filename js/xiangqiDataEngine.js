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
		//	  name: null, // or Pieces.Ma
        //    eaten:  null, // or {Pieces.Ma, player}
        //    player: 0, // moved by player 0
        //}, ...
    ]; 
    this.cachedMoves= []; // 缓存的棋谱
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
        var INIT = "0919293949596979891777062646668600102030405060708012720323436383";
        this.data.board_init = this.loadMoves(INIT, '')[0];
        this.data.board = this.data.board_init.slice(0);
    },
    
    
    newMove: function(from, to, name, player, keepCache) {
        // 新一步
        // TODO: 此为临时代码
        var eaten = this.data.board[to[0]+to[1]*9];
        this.data.board[to[0]+to[1]*9] = this.data.board[from[0]+from[1]*9];
        this.data.board[from[0]+from[1]*9] = null;
        this.data.moves.push({
            from:   from,
            to:     to,
			name:	name,
            eaten:  eaten,
            player: player,
        });
        if (!keepCache) {
            this.data.cachedMoves.length = 0;
        }
    },
    undoMove: function() {
        // 撤销一步
        // 返回该步
		if (this.data.moves.length==0) {
            alert("Can not undo further.");
            return null;
        } else {
            var move = this.data.moves.pop();
			this.data.board[move.from[0]+move.from[1]*9] = {
                name: move.name,
                player: move.player
            };
			this.data.board[move.to[0]+move.to[1]*9] = move.eaten;
            
            this.data.cachedMoves.push(move);
            return move;
		}
    },
    redoMove: function() {
        // 恢复一步
        // 返回该步
		if (this.data.cachedMoves.length==0) {
            alert("Can not redo further.");
            return null;
        } else {
            var move = this.data.cachedMoves.pop();
			this.newMove(move.from, move.to, move.name, move.player, false);
            return move;
		}
    },
    
    canMove: function(from, player, board) {
        // 是否合法
		// return all the possible "to"s
		// 错误：null.player undefined
		var tos=[];
		var name = board[from[0]+from[1]*9].name;
		if (name==Pieces.JU) {
			//可行解：不被阻挡&在棋盘内&不吃自己的子
			for (var i=0;i<from[0];i++) {
				var tmpflag=true;
				for (var j=i+1;j<from[0];j++) {
					if (board[j+from[1]*9]!=null) tmpflag=false;
				}
				if (tmpflag && (board[i+from[1]*9]==null || board[i+from[1]*9].player!=player)) tos.push([i,from[1]]); 
			}
			for (var i=8;i>from[0];i--) {
				var tmpflag=true;
				for (var j=i-1;j>from[0];j--) {
					if (board[j+from[1]*9]!=null) tmpflag=false;
				}
				if (tmpflag && (board[i+from[1]*9]==null || board[i+from[1]*9].player!=player)) tos.push([i,from[1]]); 
			}			
			for (var i=0;i<from[1];i++) {
				var tmpflag=true;
				for (var j=i+1;j<from[1];j++) {
					if (board[from[0]+j*9]!=null) tmpflag=false;
				}
				if (tmpflag && (board[from[0]+i*9]==null || board[from[0]+i*9].player!=player)) tos.push([from[0],i]); 
			}			
			for (var i=9;i>from[1];i--) {
				var tmpflag=true;
				for (var j=i-1;j>from[1];j--) {
					if (board[from[0]+j*9]!=null) tmpflag=false;
				}
				if (tmpflag && (board[from[0]+i*9]==null || board[from[0]+i*9].player!=player)) tos.push([from[0],i]); 
			}			
			
		} else if (name==Pieces.MA) {
			//可行解：不别马脚&在棋盘内&不吃自己的子
			var majiao=[[from[0]-1,from[1]],[from[0]-1,from[1]],[from[0],from[1]+1],[from[0],from[1]+1],[from[0]+1,from[1]],[from[0]+1,from[1]],[from[0],from[1]-1],[from[0],from[1]-1]];
			var possibletos=[[from[0]-2,from[1]-1],[from[0]-2,from[1]+1],[from[0]-1,from[1]+2],[from[0]+1,from[1]+2],[from[0]+2,from[1]+1],[from[0]+2,from[1]-1],[from[0]+1,from[1]-2],[from[0]-1,from[1]-2]];
			for (var i=0; i<possibletos.length; i++) {
				if (board[majiao[i][0]+majiao[i][1]*9]==null && possibletos[i][0]>=0 && possibletos[i][0]<9 && possibletos[i][1]>=0 && possibletos[i][1]<10 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player==1-player)) tos.push(possibletos[i]);
			}
		} else if (name==Pieces.XIANG0) {
			//可行解：不别相脚&在棋盘内&不吃自己的子&在自己棋盘内
			var xiangjiao=[[from[0]-1,from[1]-1],[from[0]-1,from[1]+1],[from[0]+1,from[1]+1],[from[0]+1,from[1]-1]];
			var possibletos=[[from[0]-2,from[1]-2],[from[0]-2,from[1]+2],[from[0]+2,from[1]+2],[from[0]+2,from[1]-2]];
			for (var i=0; i<possibletos.length; i++) {
				if (board[xiangjiao[i][0]+xiangjiao[i][1]*9]==null && possibletos[i][0]>=0 && possibletos[i][0]<9 && possibletos[i][1]>=0 && possibletos[i][1]<5 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
			}
		} else if (name==Pieces.XIANG1) {
			//可行解：不别相脚&在棋盘内&不吃自己的子&在自己棋盘内
			var xiangjiao=[[from[0]-1,from[1]-1],[from[0]-1,from[1]+1],[from[0]+1,from[1]+1],[from[0]+1,from[1]-1]];
			var possibletos=[[from[0]-2,from[1]-2],[from[0]-2,from[1]+2],[from[0]+2,from[1]+2],[from[0]+2,from[1]-2]];
			for (var i=0; i<possibletos.length; i++) {
				if (board[xiangjiao[i][0]+xiangjiao[i][1]*9]==null && possibletos[i][0]>=0 && possibletos[i][0]<9 && possibletos[i][1]>=5 && possibletos[i][1]<10 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
			}
		} else if (name==Pieces.SHI0) {
			//可行解：在米字格内&不吃自己的子
			var possibletos=[[from[0]-1,from[1]-1],[from[0]-1,from[1]+1],[from[0]+1,from[1]+1],[from[0]+1,from[1]-1]];
			for (var i=0; i<possibletos.length; i++) {
				if (possibletos[i][0]>2 && possibletos[i][0]<6 && possibletos[i][1]>=0 && possibletos[i][1]<3 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
			}
		} else if (name==Pieces.SHI1) {
			//可行解：在米字格内&不吃自己的子
			var possibletos=[[from[0]-1,from[1]-1],[from[0]-1,from[1]+1],[from[0]+1,from[1]+1],[from[0]+1,from[1]-1]];
			for (var i=0; i<possibletos.length; i++) {
				if (possibletos[i][0]>2 && possibletos[i][0]<6 && possibletos[i][1]>6 && possibletos[i][1]<10 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
			}
		} else if (name==Pieces.SHUAI) {
			//可行解：在米字内&不吃自己的子
			var possibletos=[[from[0]-1,from[1]],[from[0],from[1]+1],[from[0]+1,from[1]],[from[0],from[1]-1]];
			for (var i=0; i<possibletos.length; i++) {
				if (possibletos[i][0]>2 && possibletos[i][0]<6 && possibletos[i][1]>=0 && possibletos[i][1]<3 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
			}
		} else if (name==Pieces.JIANG) {
			//可行解：在米字内&不吃自己的子
			var possibletos=[[from[0]-1,from[1]],[from[0],from[1]+1],[from[0]+1,from[1]],[from[0],from[1]-1]];
			for (var i=0; i<possibletos.length; i++) {
				if (possibletos[i][0]>2 && possibletos[i][0]<6 && possibletos[i][1]>6 && possibletos[i][1]<10 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
			}
		} else if (name==Pieces.PAO) {
			//可行解：不被阻挡&在棋盘内&不吃自己的子 || 跳一个子吃别人的子
			for (var i=0;i<from[0];i++) {
				var tmp=0;
				for (var j=i+1;j<from[0];j++) {
					if (board[j+from[1]*9]!=null) tmp++;
				}
				if (tmp==0 && board[i+from[1]*9]==null) tos.push([i,from[1]])
				else if (tmp==1 && board[i+from[1]*9]!=null && board[i+from[1]*9].player==1-player) tos.push([i,from[1]]);
			}
			for (var i=8;i>from[0];i--) {
				var tmp=0;
				for (var j=i-1;j>from[0];j--) {
					if (board[j+from[1]*9]!=null) tmp++;
				}
				if (tmp==0 && board[i+from[1]*9]==null) tos.push([i,from[1]])
				else if (tmp==1 && board[i+from[1]*9]!=null && board[i+from[1]*9].player==1-player) tos.push([i,from[1]]);
			}			
			for (var i=0;i<from[1];i++) {
				var tmp=0;
				for (var j=i+1;j<from[1];j++) {
					if (board[from[0]+j*9]!=null) tmp++;
				}
				if (tmp==0 && board[from[0]+i*9]==null) tos.push([from[0],i])
				else if (tmp==1 && board[from[0]+i*9]!=null && board[from[0]+i*9].player==1-player) tos.push([from[0],i]);
			}			
			for (var i=9;i>from[1];i--) {
				var tmp=0;
				for (var j=i-1;j>from[1];j--) {
					if (board[from[0]+j*9]!=null) tmp++;
				}
				if (tmp==0 && board[from[0]+i*9]==null) tos.push([from[0],i])
				else if (tmp==1 && board[from[0]+i*9]!=null && board[from[0]+i*9].player==1-player) tos.push([from[0],i]);
			}			
			
		} else if (name==Pieces.BING) {
			//可行解：过河否&在棋盘内&不吃自己的子
			if (from[1]<5 && (board[from[0]+(from[1]+1)*9]==null || board[from[0]+(from[1]+1)*9].player!=player)) tos.push([from[0],from[1]+1]);
			if (from[1]>4) {
				var possibletos=[[from[0]-1,from[1]],[from[0],from[1]+1],[from[0]+1,from[1]]];
				for (var i=0; i<possibletos.length; i++) {
					if (possibletos[i][0]>=0 && possibletos[i][0]<9 && possibletos[i][1]>=0 && possibletos[i][1]<10 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
				}				
			}
		} else {
			// 卒可行解：过河否&在棋盘内&不吃自己的子
			if (from[1]>4 && (board[from[0]+(from[1]-1)*9]==null || board[from[0]+(from[1]-1)*9].player!=player)) tos.push([from[0],from[1]-1]);
			if (from[1]<5) {
				var possibletos=[[from[0]-1,from[1]],[from[0],from[1]-1],[from[0]+1,from[1]]];
				for (var i=0; i<possibletos.length; i++) {
					if (possibletos[i][0]>=0 && possibletos[i][0]<9 && possibletos[i][1]>=0 && possibletos[i][1]<10 && (board[possibletos[i][0]+possibletos[i][1]*9]==null || board[possibletos[i][0]+possibletos[i][1]*9].player!=player)) tos.push(possibletos[i]);	
				}				
			}			
		}
		return tos;
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
                board_init[i] = null;
        
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
		var scriptNum1 = null, scriptNum2 = null,scriptDir = null;
		//Chscr用于棋谱显示
		var Chscr = ["九","八","七","六","五","四","三","二","一"];
		if (move.player == 0 && (move.name=="车" || move.name == "帅" || move.name == "炮" || move.name == "兵")) {
			scriptNum1 = Chscr[move.from[0]];
			if (move.from[1] > move.to[1]) {
				scriptNum2 = Chscr[9 - move.from[1] + move.to[1]];
				scriptDir = "退";
			} else if (move.from[1] < move.to[1]) {
				scriptNum2 = Chscr[9 - move.to[1] + move.from[1]];
				scriptDir = "进";
			} else {
				scriptNum2 = Chscr[move.to[0]];
				scriptDir = "平";
			}
		} else if (move.player == 0 && (move.name=="马" || move.name == "仕" || move.name == "相")) {
			scriptNum1 = Chscr[move.from[0]];
			scriptNum2 = Chscr[move.to[0]];
			if (move.from[1] > move.to[1]) {
				scriptDir = "退";
			} else {
				scriptDir = "进";
			}			
		}　else if (move.player == 1 && (move.name=="车" || move.name == "将" || move.name == "炮" || move.name == "卒")) {
			scriptNum1 = parseInt(move.from[0])+1;
			if (move.from[1] < move.to[1]) {
				scriptNum2 = move.to[1] - move.from[1];
				scriptDir = "退";
			} else if (move.from[1] > move.to[1]) {
				scriptNum2 = move.from[1] - move.to[1];
				scriptDir = "进";
			} else {
				scriptNum2 = parseInt(move.to[0])+1;
				scriptDir = "平";
			}					
		}　else {
			scriptNum1 = parseInt(move.from[0])+1;
			scriptNum2 = parseInt(move.to[0])+1;
			if (move.from[1] < move.to[1]) {
				scriptDir = "退";
			} else {
				scriptDir = "进";
			}					
		}
		return (move.name + scriptNum1 + scriptDir + scriptNum2);
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















