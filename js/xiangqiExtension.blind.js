var xqExtend = function(obj, source) {
    // Extends obj by source.
    for (var prop in source)
        obj[prop] = source[prop];
    return obj;
};

/*
    Blind: 盲棋
*/

xqExtend(XiangqiController.prototype, {
    blind: function(ifDrawPiece) {
        // 初始化函数
        this.view.drawBoard();
        this.engine.init();
        if (typeof ifDrawPiece !== 'undefined' ? ifDrawPiece : true) {
          this.view.drawPieces(this.engine.getAllPieces());
        // TODO: Event listener
          this.view.d3MouseEvent();
        }
        this.showAllScripts();
    },
    
    scriptMove: function() {
      var script=document.getElementById('scriptInput').value;
      var move=this.engine.scriptToMove(script);
      move = this.engine.newMove(move.from,move.to,move.name,move.player);
      // 设定下一步
      // 下一步更换player, (注：此为游戏逻辑)
      this.nextTurn(move);
    },
    
    showBoard: function() {
      this.view.drawPieces(this.engine.getAllPieces());
      this.view.d3MouseEvent(); 
      // Very bad practice... May have memory leaks...
      this.showAllScripts();
    },
});

xqExtend(XiangqiEngine.prototype, {
  scriptToMove: function(script) {
    var Chscr = ["九","八","七","六","五","四","三","二","一"];
    var name = script[0];
    if (script[1] == parseInt(script[1])) {
      var player=1;
      var fx=parseInt(script[1])-1;
      var step=parseInt(script[3]);
    } else {
      var player=0;
      var fx=Chscr.indexOf(script[1]);
      var step=9-Chscr.indexOf(script[3]);
    }
    for (i=0;i<9;i++) {        
      var pos = this.data.board[fx+9*i];
      if (pos!=null && pos.name==script[0] && pos.player==player) {
        var from=[fx,i];
        if (script[2]=="进") 
          var to=player==0?[fx,i+step]:[fx,i-step];
        else if (script[2]=="退")
          var to=player==0?[fx,i-step]:[fx,i+step];
        else var to=player==1? [parseInt(script[3])-1,i]:[Chscr.indexOf(script[3]),i];
      }
    }
    var eaten = this.data.board[to[0]+to[1]*9];
    var move = {
      from:from,
      to:to,
      name:name,
      eaten:eaten,
      player:player,
    }
    return move;
  },
});