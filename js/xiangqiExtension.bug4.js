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
        // 初始化函数
        this.reserve = [
            // {name: Pieces.Ma, player: 0}
        ]; // 保存对家吃子
        
        return this;
    },
});


xqExtend(XiangqiEngine.prototype, {
    bug4: function() {
        // 初始化函数
        
        return this;
    },
    reserve: function(eaten) {
        // eaten: {name: Pieces.Ma, player: 0}
        eaten.player =  (eaten.player==0)? 1 : 0;
        this.data.reserve.push(eaten);
    },
});


xqExtend(XiangqiView.prototype, {
    bug4: function(reserveHeight) {
        // 初始化函数
        this.reserveHeight = reserveHeight || this.ra*2;
        
        // 用于显示保留棋子
        this.reserveBox = 
            this.container.append("div").classed("reserve-box", true)
                .style("height", (this.reserveHeight)+"px")
                .style("width",  (this.width+this.pad*2)+"px")
                .style("background", "#F0F0F0");
        
        return this;
    },
    refreshReserve: function(reserve) {
        // 更新保留框
    },
    reserveMouseEvent: function() {
        // 鼠标事件处理，参考 d3MouseEvent
        
    },
});

xqExtend(XiangqiController.prototype, {
    bug4: function(id, bug4Controller) {
        // 初始化函数
        this.bug4Controller = bug4Controller;
        this.id = id; // 棋盘id. bug4Controller方法中传入以识别棋盘
        
        return this;
    },
    
    jumpTo: function(moveNo) {
        // 跳至第moveNo步
        this.bug4Controller.jumpToBug4(this.id, moveNo);    
    },
    
    nextTurn: function(move) {
        // 控制游戏流程
        // 重写nextTurn，在此调用bug4Controller的方法
        this.currentPlayer =  (move.player==0)? 1 : 0;
        this.bug4Controller.nextTurnBug4(this.id, move);
    },
    
    moveStart: function(pos) {
        // 开始一步棋, 返回是否成功
        // 重写nextTurn，在此调用bug4Controller的方法
        var player = this.engine.data.board[pos[0]+pos[1]*9].player;
        // 判断是否为该棋手出棋
        if (this.id != this.bug4Controller.currentBoard ||
            player != this.currentPlayer)
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
});


function XiangqiBug4Controller() {
    // bug4
    // 负责控制view和data/engine，包含控制游戏流程。例如处理用户交互，处理多棋局间交互等等。
    //this.data = null;
    this.engines = [];
    this.views = [];
    this.controllers = [];
    this.currentBoard = 0; // 当前棋盘
}

XiangqiBug4Controller.prototype = {
    constructor: XiangqiBug4Controller,
    
    init: function() {
        // 初始化游戏
        for (var i=0; i<2; i++) {
            var controller = this.controllers[i] =
                new XiangqiController().bug4(i, this);
            this.views[i].controller = controller;
            controller.view = this.views[i];
            controller.engine = this.engines[i];
            controller.init();
        }
        
        this.controllers[1].currentPlayer = 1;
    },
    
    nextTurnBug4: function(boardId, move) {
        // 棋盘boardId请求下一步
        this.currentBoard = (this.currentBoard==0)? 1 : 0;
        if (move.eaten!=null) {
            this.engines[this.currentBoard].reserve(move.eaten);
            this.views[this.currentBoard].refreshReserve();
        }
        
    },
    
    jumpToBug4: function(boardId, moveNo) {
        // 跳至棋盘boardId的第moveNo步
    },
    
    undo: function() {
    
    },
    
    redo: function() {
    
    },
    
    
};








