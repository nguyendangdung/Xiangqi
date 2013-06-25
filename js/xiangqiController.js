
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
        this.view.drawPieces(this.engine.getAllPieces());
        // TODO: Event listener
        this.view.d3MouseEvent();
        this.showAllScripts();
    },
    
    nextTurn: function(move) {
        // 控制游戏流程
        this.currentPlayer = (move.player==0)? 1 : 0;
    },
    
    undo: function() {
        // 处理撤销
        var move = this.engine.undoMove();
        if (move) {
            this.currentPlayer = move.player;
            this.view.drawPieces(this.engine.getAllPieces());
            this.view.d3MouseEvent();
            this.showAllScripts();
        }
    },
    redo: function() {
        // 处理恢复
        var move = this.engine.redoMove();
        if (move) {
            this.view.drawPieces(this.engine.getAllPieces());
            this.view.d3MouseEvent();
            this.showAllScripts();
            
            this.currentPlayer = move.player;
            this.nextTurn(move);
        }
    },
    jumpTo: function(moveNo) {
        // 跳至第moveNo步
        // 使用redo和undo来保留transition （TODO: 未完成）
        if (moveNo > this.engine.data.moves.length-1) {
            // redos
            while (moveNo>this.engine.data.moves.length-1)
                this.redo();
        } else {
            // undos
            while (moveNo<this.engine.data.moves.length-1)
                this.undo();
        }
    
    },
    
    moveStart: function(pos,name,player) {
        // 开始一步棋, 返回是否成功
        // 判断能否出棋
        //highlight possible places

        // 判断是否为该棋手出棋
        if (player != this.currentPlayer)
            return false;
        
        // 判断有无可移动位置
        var tos=this.engine.canMove(pos, player, this.engine.data.board);
        if (tos.length) {
            for (var i=0; i<tos.length; i++) {
                if (this.engine.data.board[tos[i][0]+tos[i][1]*9]==null) {
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
    
    moveEnd: function(from, to, name, player) {
        // 一步棋落定, 返回是否成功
        // 若成功, 更改棋盘, 设定下一步; 若不成功, 清理moveStart作出的修改
        var tos=this.engine.canMove(from, this.currentPlayer, this.engine.data.board);
        for (var i=0; i<tos.length; i++) {
            if (tos[i][0]==to[0] && tos[i][1]==to[1]) {
                // Available
                // 更改棋盘
                var move = this.engine.newMove(from, to, this.engine.data.board[from[0]+from[1]*9].name, this.currentPlayer);
                this.view.drawPieces(this.engine.getAllPieces());
                this.view.d3MouseEvent(); // Very bad practice... May have memory leaks...
                this.view.clearEatingPosition();
                this.view.clearPossiblePosition();
                this.showAllScripts();
                
                // 设定下一步
                // 下一步更换player, (注：此为游戏逻辑)
                this.nextTurn(move)
                
                return true;
            }
        }
        // 清理
        this.view.clearEatingPosition();
        this.view.clearPossiblePosition();
    },
    
    showAllScripts: function() {
        var scripts = Array().concat(
                this.engine.data.moves,
                this.engine.data.cachedMoves.slice().reverse()
            ).map(this.engine.moveToScript);
        this.view.showAllScripts(
                scripts,
                this.engine.data.moves.length-1,
                this.jumpTo
            );
    },
    
    boardRotate: function() {
        this.view.gridToY.domain([9,0]);
        this.view.gridToX.domain([8,0]);
        this.view.drawPieces(this.engine.getAllPieces());
        // TODO: Event listener
        this.view.d3MouseEvent();
    },
};