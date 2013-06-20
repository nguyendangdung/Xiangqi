
function XiangqiController() {
    // 负责控制view和data/engine，包含控制游戏流程。例如处理用户交互，处理多棋局间交互等等。
    //this.data = null;
    this.engine = null;
    this.view = null;
    this.currentPlayer = 0; // 当前玩家
}

XiangqiController.prototype = {
    // 负责协调view和data/engine。例如处理用户交互，处理多棋局间交互等等。
    constructor: XiangqiController,
    
    init: function() {
        // 初始化游戏
        this.view.drawBoard();
        this.engine.init();
        this.view.drawPieces();
        // TODO: Event listener
        this.view.d3MouseEvent();
    },
	
	undo: function() {
        // 处理撤销
		this.engine.undoMove();
		this.view.drawPieces();
		this.view.d3MouseEvent();
	},
	
    moveStart: function(pos) {
        // 开始一步棋, 返回是否成功
        //highlight possible places
        var player = this.engine.data.board[pos[0]+pos[1]*9].player;
        if (player != this.currentPlayer)
            return false;
        var tos=this.engine.canMove(pos, player, this.engine.data.board);
        if (tos.length) {
            for (var i=0; i<tos.length; i++) {
                if (this.data.board[tos[i][0]+tos[i][1]*9]==null) {
                    this.view.drawPossiblePosition(tos[i]);
                } else {
                    this.view.drawEatingPosition(tos[i]);
                }
            }
        } else {
            return false;
            // alert("The piece have no legal move");
        }
        return true;
    },
    
    moveEnd: function(from, to) {
        // 一步棋落定, 返回是否成功
        var tos=this.engine.canMove(from, this.currentPlayer, this.engine.data.board);
        for (var i=0; i<tos.length; i++) {
            if (tos[i][0]==to[0] && tos[i][1]==to[1]) {
                // Available
                this.engine.newMove(from, to, this.data.board[from[0]+from[1]*9].name, this.currentPlayer);
                this.view.drawPieces();
                this.view.d3MouseEvent(); // Very bad practice... May have memory leaks...
                
                // 下一步更换player, (注：此为游戏逻辑)
                this.currentPlayer = (this.currentPlayer==0)? 1 : 0;
                
                return true;
            }
        }
        this.view.clearEatingPosition();
        this.view.clearPossiblePosition();
        
    }
};