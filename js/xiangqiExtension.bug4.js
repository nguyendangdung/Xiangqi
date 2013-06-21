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
        this.reserve = []; // 保存对家吃子
        
        return this;
    },
});


xqExtend(XiangqiEngine.prototype, {
    bug4: function() {
        // 初始化函数
        
        return this;
    },
    reserve: function(name) {
        this.data.reserve.push(name);
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
    
    nextTurn: function() {
        // 控制游戏流程
        // 重写nextTurn，在此调用bug4Controller的方法
    },
    
    moveStart: function(pos) {
        // 开始一步棋, 返回是否成功
        // 重写nextTurn，在此调用bug4Controller的方法
    },
});


function XiangqiBug4Controller() {
    // bug4
    // 负责控制view和data/engine，包含控制游戏流程。例如处理用户交互，处理多棋局间交互等等。
    //this.data = null;
    this.engines = [];
    this.views = [];
    this.controllers = [];
    this.currentBoard = 0;
    this.currentPlayer = 0; // 当前玩家
}

XiangqiBug4Controller.prototype = {
    constructor: XiangqiBug4Controller,
    
    init: function() {
        // 初始化游戏
        for (var i=0; i<2; i++) {
            var controller = this.controllers[i] = new XiangqiController().bug4();
            this.views[i].controller = controller;
            controller.view = this.views[i];
            controller.engine = this.engines[i];
            controller.init();
        }
    },
    
    nextTurnBug4: function(id) {
        // 棋盘id请求下一步
    },
    
};








