var canvas, context, lineWidth, options, pickup, pickupctx, brush;
var firstMove = true;
firstTouchPos = new Point(null, null);
var pR, pG, pB;
var container, gui = new dat.GUI();
var drawing = false;
var drawLine = true;

var lastDrawn = new Point(0,0);

// Creates a bristle composed of nPoints points what each represent an area of the bristle that holds colour.
var Bristle = function(nPoints) {
    
    this.nPoints = nPoints;
    this.points = generatePoints(nPoints, options.colour);
    
}

Bristle.prototype = {
    
    setColour: function(c){
        for (var i = 0; i<this.nPoints; i++)
            this.points[i].col = c;
    },

    setInitDirection: function(point, n, nBristles){
        setPointsOnLine(point.x-Math.floor(nBristles/2)+n, point.y, firstTouchPos.x-Math.floor(nBristles/2)+n, firstTouchPos.y, this.nPoints, this.points);
        //console.log(this.points[0]);
    },
    
    moveBristle: function(x,y){
        var tempPointA, changes = true;;
        var tempPointB = this.points[0];
        this.points[0].x = x;
        this.points[0].y = y;
        

        for (var i = 0; i < this.nPoints-1; i++){

            var diff = this.points[i].y - this.points[i+1].y ;
            if(diff > 1){
                this.points[i+1].y = this.points[i].y+1; 
            }
            else if (diff < -1){
                this.points[i+1].y = this.points[i].y-1;
            }                
        }
        
        for (var i = 0; i < this.nPoints-1; i++){

            var diff = this.points[i].x - this.points[i+1].x ;
            if(diff > 3){
                this.points[i+1].x = this.points[i].x+3; 
            }
            else if (diff < -3){
                this.points[i+1].x = this.points[i].x-3;
            }                
        }
                                
        for(var i = 1; i<this.nPoints; i++){
            tempPointA = this.points[i];
            this.points[i].x = Math.round((this.points[i].x + this.points[i-1].x + (2*tempPointB.x))/4);
            this.points[i].y = Math.round((this.points[i].y + this.points[i-1].y + (2*tempPointB.y))/4);
            tempPointB=tempPointA;
        }
    },
    
    paint: function(){
         for(var i = 1; i<this.nPoints; i++){
             context.fillStyle = this.points[i].col;
             context.fillRect(this.points[i].x, this.points[i].y, 1, 1);
         }
    }
}

// Holds all the bristles together, each taking one pixel of brush width. Undecided on is the brush should rotate.
var Brush = function(nBristles, nPoints) {
    
    this.nBristles = nBristles;
    this.bristles = generateBristles(nBristles, nPoints);
    
}

Brush.prototype = {
    
    setColour: function(c){
        for (var i = 0;i<this.nBristles; i++)
            this.bristles[i].setColour(c);
    },
    
    setInitDirection: function(point){
         for (var i = 0; i<this.nBristles; i++){
            this.bristles[i].setInitDirection(point, i, this.nBristles);
         }
    },
    
    moveBrush: function(x,y){
        for (var i = 0; i<this.nBristles; i++) {
            this.bristles[i].moveBristle(x-Math.floor(this.nBristles/2)+i, y);
        }
        
    },
    
    paint: function(){
        for (var i = 0; i<this.nBristles; i++)
            this.bristles[i].paint();
    }
}

// Sets up the scene.
function initialisePainting() {

    container = document.createElement('div');
    document.body.appendChild(container);
               
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    options = {
        nBristles:15,
        nPoints:20,
        colour:0xff0000,
        paintOnBrush:200

        /*cleanBrush=function(){
            setPickup();
        };*/
    }
    
    gui.addColor(options, 'colour').onChange(function(){
        setRGB();
        brush.setColour("rgb("+pR+","+pG+","+pB+")");
        setPickup();
    });
    gui.add(options, 'nBristles', 1, 50).onFinishChange(function(value){
        brush = new Brush(value, options.nPoints);
    });
    gui.add(options, 'nPoints', 1, 50).onFinishChange(function(value){
        brush = new Brush(options.nBristles, value);
    });
    //gui.add(options, "paintOnBrush", 0, 1000);
    //gui.add(options, "cleanBrush");

    pickup = document.createElement('canvas');  // Don't think I need this ?
    pickup.width = 200;
    pickup.height = 100;
    pickupctx = pickup.getContext('2d');
    
    brush = new Brush(options.nBristles, options.nPoints);

    setRGB();
    setPickup();
}

function BeginTouch(event) {
    event.preventDefault();
    drawing = true;
    var x,y,z;
    var v = alignPosition(event.touches[0].clientX, event.touches[0].clientY);

    firstTouchPos = new Point(v.x, v.y);
    firstMove = true;
    
    paintPoint(v.x,v.y);
}    

function TouchMove(event) {
    event.preventDefault();
    var x,y,z;
    var v = alignPosition(event.touches[0].clientX, event.touches[0].clientY);
        
    if (firstMove){
        brush.setInitDirection(new Point(v.x, v.y));
        firstMove = false;
    }
        
    paintPickup(v.x,v.y, false);
    
    //if (drawLine && lastDrawn.x != undefined && lastDrawn.y != undefined) {
    if (drawLine) {
        DrawLine(lastDrawn.x, lastDrawn.y, v.x, v.y);
        //console.log('DrawLine called', lastDrawn.x, lastDrawn.y, ' to ', px, py);
    }
    
    lastDrawn.x = v.x;
    lastDrawn.y = v.y;
}

function EndTouchMove(event){

    if (drawLine)
    {
        lastDrawn.x = null;
        lastDrawn.y = null;
    }
    drawing = false; // Unused ?
}

// Bresenham's algorithm, modified to use the brush footprint     
function DrawLine(ax, ay, bx, by) {
    if (ax == bx && ay == by){
        console.log('useless drawLine');
        return;
    }
    console.log('drawLine called',ax,ay,bx,by);
    var i, m, x, y, rounded;
   /* if (bx < ax) {
        var temp = bx;
        bx = ax;
        ax = temp;
        temp = by;
        by = ay;
        ay = temp;
    }*/
    x = ax;
    y = ay;
    if (bx != ax){
        mx = Math.abs((bx - ax)/(by -  ay));
        my = Math.abs((by - ay)/(bx - ax));
    }
    else {
        mx = 0;
        my = null;
    }
    
    if (ax <= bx && ay <= by && Math.abs(bx-ax)>=Math.abs(by-ay)) { //1st Quadrant
        for (i = 1; i < Math.abs(bx-ax); i++) {
            x++;
            y+=my;
            rounded = RoundToUnit(y);
            paintPickup(x,rounded, false);
        }
        console.log('1st q', bx-ax);
    }
    else if (ax <= bx && ay <= by && Math.abs(bx-ax)< Math.abs(by-ay)) { //2nd Quadrant
        for (i = 1; i < Math.abs(by-ay); i++) {
            x+=mx;
            y++;
            rounded = RoundToUnit(x);
            paintPickup(rounded,y, false);
        }
        console.log('2nd q', by-ay);
    }        
    else if (ax > bx && ay < by && Math.abs(bx-ax)<= Math.abs(ay-by)) { //3rd Quadrant
        for (i = 1; i < Math.abs(ay-by); i++) {
            x-=mx;
            y++;
            rounded = RoundToUnit(x);
            paintPickup(rounded,y, false);
        }
        console.log('3rd q', by-ay);
    } 
    else if (ax > bx && ay < by && Math.abs(bx-ax)>Math.abs(ay-by)) { //4th Quadrant
        for (i = 1; i < Math.abs(bx-ax); i++) {
            x--;
            y+=my;
            rounded = RoundToUnit(y);
            paintPickup(x,rounded, false);
        }
        console.log('4th q', bx-ax);
    }
    else if (ax > bx && ay >= by && Math.abs(bx-ax)>=Math.abs(by-ay)) { //5th Quadrant
        for (i = 1; i < Math.abs(bx-ax); i++) {
            x--;
            y-=my;
            rounded = RoundToUnit(y);
            paintPickup(x,rounded, false);
        }
        console.log('5th q', bx-ax);
    }
    else if (ax > bx && ay >= by && Math.abs(bx-ax)<= Math.abs(by-ay)) { //6th Quadrant
        for (i = 1; i < Math.abs(by-ay); i++) {
            x-=mx;
            y--;
            rounded = RoundToUnit(x);
            paintPickup(rounded,y, false);
        }
        console.log('6th q', by-ay);
    } 
    else if (ax <= bx && ay > by && Math.abs(bx-ax)< Math.abs(ay-by)) { //7th Quadrant
        for (i = 1; i < Math.abs(ay-by); i++) {
            x+=mx;
            y--;
            rounded = RoundToUnit(x);
            paintPickup(rounded,y, false);
        }
        console.log('7th', by-ay);
    } 
    else if (ax <= bx && ay > by && Math.abs(bx-ax)>=Math.abs(ay-by)) { //8th Quadrant
        for (i = 1; i < Math.abs(bx-ax); i++) {
            x++;
            y-=my;
            rounded = RoundToUnit(y);
            paintPickup(x,rounded, false);
        }
        console.log('8th q', bx-ax);
    }       
}

function setPickup() {
    pickupctx.fillStyle = "rgb("+pR+","+pG+","+pB+")";
    context.fillStyle = "rgb("+pR+","+pG+","+pB+")";
    pickupctx.clearRect(0, 0, pickup.width, pickup.height);
    pickupctx.fillRect(0, 0, pickup.width, pickup.height);
}

function setRGB() {
    pR = Math.floor(options.colour/65536);
    pG = Math.floor((options.colour-(pR*65536)) / 256);
    pB = (options.colour - (pR*65536) - (pG*256));
}

function paintPoint(x,y) {

    context.fillStyle = "rgb("+pR+","+pG+","+pB+")";
    context.fillRect(x - (options.nBristles/2), y - (options.nBristles/2), options.nBristles/4, options.nBristles/4);

    lastDrawn.x = x;
    lastDrawn.y = y;
}
    
function paintPickup(x,y, setLastDrawn) {
    brush.paint();
    brush.moveBrush(x,y);
    
    if (setLastDrawn){
        lastDrawn.x = x;
        lastDrawn.y = y;
    }
}
    
function generatePoints(n, c) {
    var points = [];
    for (var i = 0; i<n ; i++){
        points.push(new BPoint(0,0,c));
    }
    return points;
}

function generateBristles(nBristles, nPoints) {
    var bristles = [];
    var mid = Math.floor((nBristles-1)/2);
    for (var i = 0; i<nBristles ; i++){
        if (i == 0 || i==nBristles-1)
            bristles.push(new Bristle(nPoints-1));
        else if (i == mid + 1 || i == mid || i == mid-1)
            bristles.push(new Bristle(nPoints+1));
        else
            bristles.push(new Bristle(nPoints)); 
    }
    return bristles;
}

