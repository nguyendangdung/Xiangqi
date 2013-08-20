
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
            
            this.playSoundReady();
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

            // var tmp=[Math.ceil(xqData.moves.length/2), xqData.moves.length% 2];
            // tmp[1]=tmp[1]==0? 2:1;
            this.playSoundReady();
            
            
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
    
    
    switchTo: function(branch) {
        // 换至branchNo分支
        this.undo();
        this.engine.data.branchHistory.length = this.engine.data.historypoint+1;
        if (this.engine.data.branchHistory[this.engine.data.historypoint]!=branch) {
           this.engine.data.branchHistory.push(branch);
        }
        this.redo();    
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
        var currentBranch = this.engine.data.branchHistory[this.engine.data.historypoint];

        var scripts = [];
        for (var i=0; i<this.engine.data.branchHistory.length-1; i++) {
            scripts = scripts.concat(
                this.engine.data.branchHistory[i].moves.slice(0,
                    this.engine.data.branchHistory[i+1].start
                    - this.engine.data.branchHistory[i].start));
        }
        scripts = scripts.concat(
            this.engine.data.branchHistory[this.engine.data.branchHistory.length-1].moves.slice()).map(this.engine.moveToScript);
        
        // 得到所有分支点
        var branchpoints = [];
        branchpoints.length = scripts.length;
        for (var i=0; i<this.engine.data.branches.length; i++) {
            var branch = this.engine.data.branches[i]
            var h = this.engine.data.branchHistory.indexOf(branch.parent);
            if ((h >= 0) &&
                ((h == this.engine.data.branchHistory.length-1) ||
                 (branch.start <= this.engine.data.branchHistory[h+1].start))) {
                // 如果branch的父分支出现在当前分支里
                branchpoints[branch.start] = true;
            }
            
        }
        
        this.view.showAllScripts(
                scripts,
                this.engine.data.moves.length-1,
                this.jumpTo,
                this.engine.data.soundtracks,
                branchpoints
            );
            

        // 得到当前步的所有分叉：
        if (this.engine.data.moves.length==0)
            return; // 初始状态无分叉
            
        var forks = []; // 位于当前步的所有分叉
        var selected = 0;
        var forkStart; // 分叉起点，从该分支开始分叉
        if (this.engine.data.moves.length-1 == currentBranch.start && currentBranch.start!=-1 && currentBranch.parent!=null) {
            // 当前步位于分支开始
            forkStart = currentBranch.parent;
        } else {
            forkStart = currentBranch;
            // selected = 0;
        }
        
        forks.push([
            this.engine.moveToScript(forkStart.moves[this.engine.data.moves.length - forkStart.start -1]),
            forkStart
        ]); // 加入分叉起点
        
        for (var i=0; i<this.engine.data.branches.length; i++) {
            // 遍历所有分支
            var branch = this.engine.data.branches[i];
            if (branch.parent==forkStart && branch.start==this.engine.data.moves.length-1) {
                // 如果branch的父分支为分叉起点，且branch始于当前步
                forks.push([
                    this.engine.moveToScript(branch.moves[0]),
                    branch
                ]);
                
                if (branch==currentBranch)
                    selected = forks.length - 1;
            }
        }
        
        this.view.showAllBranches(
                forks,
                selected,
                this.switchTo
        );
    },
    
    boardRotate: function() {
        this.view.gridToY.domain([9,0]);
        this.view.gridToX.domain([8,0]);
        this.view.drawPieces(this.engine.getAllPieces());
        // TODO: Event listener
        this.view.d3MouseEvent();
    },
    
    playSoundReady: function() {
        var soundtrack = this.engine.data.soundtracks[this.engine.data.moves.length-1];
    
        if (soundtrack) {
            var path='/resource/test/'+soundtrack;
            var mySound = soundManager.createSound({
                url: path
            });
            d3.select("button#soundclick")[0][0].disabled=false;
            d3.select("button#soundclick")
            .on("click", function() {mySound.play();});

        } else 
            d3.select("button#soundclick")[0][0].disabled=true;
            
    },
    
    toggleMode: function() {
        var self = this;
        var button=d3.select("button#mode");
        if (button[0][0].value==0) {
            $.getJSON('/resource/test/soundlist.json')
             .done(function(soundlist) {
                button[0][0].value=1;
                button.html("对弈");
                var testqipu = self.engine.loadMoves("0919293949596979891777062646668600102030405060708012720323436383","69471232666510221927232409190010796770626755101617186042775750418979807055632234186816192719727819273222686641503948304186850304666870736866628166682223686778687973817363514152513240413213736557566546274634464839232667662656664656064616060513344344342241311614682822340535594831411413282613434260437341407376204276862636342244458683358522340405838085823453453580700515536542647075242529073616654452417565604247253525485782870729161965854030443625263655151655344152858650413422304022341909341309041325042439484030495924215949413249598767866621816686676525446545446345438676812129074353594932416384212376862343483953568666648284725654668642648676161776771727725327287774545574782838537426367466364666453839");
                self.engine.loadAudios(soundlist);
                xqData.board=testqipu[0];
                xqData.board_init=testqipu[0];
                xqData.moves=[];
                xqData.branches[0].moves = testqipu[1].slice();
                self.view.drawBoard();
                self.showAllScripts();
                self.view.drawPieces(self.engine.getAllPieces());
                // TODO: Event listener
                self.view.d3MouseEvent();
                self.playSoundReady("intro");
             })
             .fail(function(_,_,error){console.log(error);});
            
        } else {
            button[0][0].value=0;
            button.html("名局赏析");
            //xqData= new XiangqiData();
            //xqEngine = new XiangqiEngine(xqData);
            this.init();
        }
    },
    
};