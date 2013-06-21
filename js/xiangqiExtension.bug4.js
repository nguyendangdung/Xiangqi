var xqExtend = function(obj, source) {
    // Extends obj by source.
    for (var prop in source)
        obj[prop] = source[prop];
    return obj;
};

/*
    Bug4: 四人象棋
*/


xqExtend(XiangqiData.prototype, {
    bug4: function() {
        this.reserved = []; // 保存对家吃子
        
        return this;
    },
});


xqExtend(XiangqiEngine.prototype, {
    bug4: function() {
        
        return this;
    },
    reserve: function(name) {
        this.data.reserved.push(name);
    },
});


xqExtend(XiangqiView.prototype, {
    bug4: function(reservedContainer) {
        this.reservedContainer = d3.select(reservedContainer);
        
        return this;
    },
});


function XiangqiBug4Controller() {
    // bug4
    // 负责控制view和data/engine，包含控制游戏流程。例如处理用户交互，处理多棋局间交互等等。
    //this.data = null;
    this.engines = [];
    this.views = [];
    this.currentBoard = 0;
    this.currentPlayer = 0; // 当前玩家
}

XiangqiBug4Controller.prototype = {
    constructor: XiangqiBug4Controller,
    
    init: function(){
        // 初始化游戏
        for (var i=0; i<2; i++) {
            this.views[i].drawBoard();
            this.engines[i].init();
            this.views[i].drawPieces(this.engines[i].getAllPieces());
            // TODO: Event listener
            this.views[i].d3MouseEvent();
            this.showAllScripts(i);
        }
    },
    // TODO: 还没想好= =
    /*
    // Just copy & paste...
    init: function() {
        // 初始化游戏
        for (var i=0; i<2; i++) {
            this.views[i].drawBoard();
            this.engines[i].init();
            this.views[i].drawPieces(this.engines[i].getAllPieces());
            // TODO: Event listener
            this.views[i].d3MouseEvent();
            this.showAllScripts(i);
        }
    },
    
    nextTurn: function() {
        // TODO: 粘贴代码，需要更新
        this.currentPlayer = (this.currentPlayer==0)? 1 : 0;
    },
    
    undo: function() {
        // 处理撤销
        // TODO: 粘贴代码，需要更新
        var move = this.engines[this.currentBoard].undoMove();
        if (move) {
            this.currentPlayer = move.player;
            this.views[this.currentBoard].drawPieces(this.engine.getAllPieces());
            this.views[this.currentBoard].d3MouseEvent();
            this.showAllScripts(this.currentBoard);
        }
    },
    redo: function() {
        // 处理恢复
        // TODO: 粘贴代码，需要更新
        var move = this.engine.redoMove();
        if (move) {
            this.view.drawPieces(this.engine.getAllPieces());
            this.view.d3MouseEvent();
            this.showAllScripts();
            
            this.currentPlayer = move.player;
            this.nextTurn();
        }
    },
    jumpTo: function(moveNo) {
        // 跳至第moveNo步
        // 使用redo和undo来保留transition （TODO: 未完成）
        // TODO: 粘贴代码，需要更新
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
    
    moveStart: function(pos) {
        // 开始一步棋, 返回是否成功
        //highlight possible places
        // TODO: 粘贴代码，需要更新
        var player = this.engine.data.board[pos[0]+pos[1]*9].player;
        if (player != this.currentPlayer)
            return false;
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
    
    moveEnd: function(from, to) {
        // 一步棋落定, 返回是否成功
        // TODO: 粘贴代码，需要更新
        var tos=this.engine.canMove(from, this.currentPlayer, this.engine.data.board);
        for (var i=0; i<tos.length; i++) {
            if (tos[i][0]==to[0] && tos[i][1]==to[1]) {
                // Available
                this.engine.newMove(from, to, this.engine.data.board[from[0]+from[1]*9].name, this.currentPlayer);
                this.view.drawPieces(this.engine.getAllPieces());
                this.view.d3MouseEvent(); // Very bad practice... May have memory leaks...
                this.view.clearEatingPosition();
                this.view.clearPossiblePosition();
                this.showAllScripts();
                
                // 下一步更换player, (注：此为游戏逻辑)
                this.nextTurn()
                
                return true;
            }
        }
        this.view.clearEatingPosition();
        this.view.clearPossiblePosition();
    },*/
    
    showAllScripts: function(board) {
        if (board==undefined)
            board = this.currentBoard;
        var scripts = Array.concat(
                this.engines[board].data.moves,
                this.engines[board].data.cachedMoves.slice().reverse()
            ).map(this.engines[board].moveToScript);
        this.views[board].showAllScripts(
                scripts,
                this.engines[board].data.moves.length-1,
                this.jumpTo
            );
    },
};








