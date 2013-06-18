

// View
function XiangqiView(container) {
    this.container = d3.select(container);
    //width,height,pad,ra分别为棋盘长、宽、边距、棋子大小 
    this.width = 500;
    this.height = 500;
    this.pad = 80;
    this.ra = 25;
    this.engine = null; // reference to XiangqiEngine;
    this.data = null; // reference to XiangqiData;
    
    this.gridToX = d3.scale.linear().domain([0, 8]).range([0,this.width]);
    this.gridToY = d3.scale.linear().domain([0, 9]).range([this.height,0]);
}

XiangqiView.prototype = {
    constructor: XiangqiView,
    
    
    drawBoard: function() {
        // 画棋盘网格
        var gridToX = this.gridToX,
            gridToY = this.gridToY;
        
        var rules = this.svg.append("svg:g")
            .attr("transform", "translate(40,40)")
            .append("svg:g").classed("rules", true);
        
        function make_x_axis() {
          return d3.svg.axis()
              .scale(gridToX)
              .orient("bottom")
              .ticks(9)
        }
        
        function make_y_axis() {
          return d3.svg.axis()
              .scale(gridToY)
              .orient("left")
        }
        
        rules.append("svg:g").classed("grid y_grid", true)
            .call(make_y_axis()
              .tickSize(-this.width,0,0)
              .tickFormat("")
            );
        
        var line = d3.svg.line()
            .x(function(d, i) { return gridToX(d.x); })
            .y(function(d, i) { return gridToY(d.y); });
            
        var dataInitlines = [
             [{x:3, y:2}, {x:5, y:0}],
             [{x:3, y:0}, {x:5, y:2}],
             [{x:3, y:9}, {x:5, y:7}],
             [{x:3, y:7}, {x:5, y:9}],
             [{x:0, y:0}, {x:0, y:9}],
             [{x:8, y:0}, {x:8, y:9}],	
             [{x:1, y:0}, {x:1, y:4}],	
             [{x:1, y:5}, {x:1, y:9}],	
             [{x:2, y:0}, {x:2, y:4}],	
             [{x:2, y:5}, {x:2, y:9}],
             [{x:3, y:0}, {x:3, y:4}],	
             [{x:3, y:5}, {x:3, y:9}],
             [{x:4, y:0}, {x:4, y:4}],	
             [{x:4, y:5}, {x:4, y:9}],
             [{x:5, y:0}, {x:5, y:4}],	
             [{x:5, y:5}, {x:5, y:9}],
             [{x:6, y:0}, {x:6, y:4}],	
             [{x:6, y:5}, {x:6, y:9}],
             [{x:7, y:0}, {x:7, y:4}],	
             [{x:7, y:5}, {x:7, y:9}]					 
        ];
        var datatext = [{name:"楚河", x:2, y:4.5},
                        {name:"汉界", x:6, y:4.5}];
        
        var initlines = rules.append("svg:g")
                        .selectAll("path")
                        .data(dataInitlines);
        initlines.enter().append("path")
                 .attr("d", line);
                 
        var text = rules.append("svg:g").selectAll("text")
                .data(datatext);

        text.enter().append("text")
            .attr("x", function(d) {return gridToX(d.x);})
            .attr("y", function(d) {return gridToY(d.y);})
            .attr("transform", "translate(" + "-40" + "," + 15 + ")")
            .text(function(d) { return d.name; })
            .style("font-size", "40px");
        
        //return {con : con, svg : svg, 
        //        data : data, x : x, y : y};
    },
    
    
    drawPieces: function() {
        // 画棋子，会清空原有棋子
        var self = this; // 内部函数中的this用self代替
        
        this.svg.selectAll("circle").remove();
        this.svg.selectAll(".QiNames").remove();
        
        var allPieces = this.engine.getAllPieces();
        
        // TODO: 临时代码
        //add attribute x,y to function the "drag"
        for (var ii = 0; ii < allPieces.length; ii++) {
            allPieces[ii].x = self.gridToX(allPieces[ii].pos[0]);
            allPieces[ii].y = self.gridToY(allPieces[ii].pos[1]);
        }
        
        var cir = this.svg.selectAll("circle")
                    .data(allPieces);
        
        
        cir.enter()
            .append("circle")
            .attr("class", "QiZi")
            //.attr("id", function(d) {return "c" + d.id.toString();})
            .attr("cx", function(d) {return self.gridToX(d.pos[0]);})
            .attr("cy", function(d) {return self.gridToY(d.pos[1]);})
            .attr("r", this.ra)
            .style("fill", function(d) {return (d.player==0)?"red":"grey";})
            .style("opacity", 0.5)
            .attr("transform", "translate(" + 40 + "," + 40 + ")")
            //.call(drag);
        
        var text = this.svg.append("svg:g").selectAll("g")
            .data(allPieces)
            .enter().append("svg:g");
        text.append("svg:text")
            .attr("class", "QiNames")
            //.attr("id", function(d) {return "t" + d.id.toString();})
            .attr("x", function(d) {return self.gridToX(d.pos[0]);})
            .attr("y", function(d) {return self.gridToY(d.pos[1]);})
            .attr("transform", "translate(" + 25 + "," + 50 + ")")
            .text(function(d) { return d.name; })
            //.call(drag);
    },
    
    
    //mouseEventHandler: function(event) {
    //    // 处理鼠标事件，拖放等
    //},
    d3MouseEvent: function() {
        // TODO: 此为临时代码
        var self = this;
        
        //棋子拖动
        var drag = d3.behavior.drag()
            .origin(Object)
            //.on("dragstart", dragstart)
            .on("drag", dragmove)
            .on("dragend", dragend);
            
        function dragmove(d, i) {
            // TODO: 此为临时代码
            //javascript的复杂数据对象如数组，object传值时复址，所以会同时改变
            // Shallow copy
            //var newObject = jQuery.extend({}, oldObject);
            // Deep copy
            //var newObject = jQuery.extend(true, {}, oldObject);
            console.log(d3.event);
            d.dragx = d3.round(self.gridToX.invert(d3.event.x));
            d.dragy = d3.round(self.gridToY.invert(d3.event.y));
            d.x = self.gridToX(d.dragx);
            d.y = self.gridToY(d.dragy);
            return 0;
        }

        function dragend(d) {
            // TODO: 此为临时代码
            self.engine.newMove(d.pos, [d.dragx, d.dragy], d.player);
            self.drawPieces();
            self.d3MouseEvent(); // Very bad practice... May have memory leaks...
        }
        
        this.svg.selectAll("circle.QiZi").call(drag);
        this.svg.selectAll("text.QiNames").call(drag);
    },
    
    
    init: function() {
        // 初始化
        this.svg = this.container.append("svg")
            .attr("height", this.height + this.pad)
            .attr("width",  this.width + this.pad);
        this.drawBoard();
        this.engine.init();
        this.drawPieces();
        // TODO: Event listener
        this.d3MouseEvent();
    },
	
};
