var canvas, context, lineWidth, options, pickup, pickupctx, brush;
var firstMove = true;
var secondMove = false;
firstTouchPos = new Point(null, null);
var pR, pG, pB;
var container, gui = new dat.GUI();
var drawing = false;
var drawLine = true;

var lastDrawn = new Point(0,0);

// Creates a bristle composed of nPoints points what each represent an area of the bristle that holds colour.
var Bristle = function(nPoints, number, nB) {
    
    this.nPoints = nPoints;
    this.points = generatePoints(nPoints, options.brushRGB);
    this.paintFactor = 4*Math.pow((number/nB)-0.5,2) + 0.6;
    
}

Bristle.prototype = {
    
    setColour: function(c){
        for (var i = 0; i<this.nPoints; i++){
             this.points[i].col = c;
       }
    },

    setInitDirection: function(point, n, nBristles){
        setPointsOnLine(point.x+n-Math.floor(nBristles/2), point.y, firstTouchPos.x+n-Math.floor(nBristles/2), firstTouchPos.y, this.nPoints, this.points);
        //console.log(this.points[0]);
    },
    
    moveBristle: function(x,y){
        var tempPointA, changes = true;;
        var tempPointB = this.points[0];
        this.points[0].x = x;
        this.points[0].y = y;
                                
        for(var i = 1; i<this.nPoints; i++){
            
            tempPointA = this.points[i];
            this.points[i].x = Math.round((this.points[i].x + this.points[i-1].x + (2*tempPointB.x))/4);
            var dist =this.points[i].x - this.points[i-1].x;
            /*if (dist > 2)
                this.points[i].x += Math.round(Math.sqrt(dist));
            else if (dist < -2)
                this.points[i].x -= Math.round(Math.sqrt(Math.abs(dist)));
            
            this.points[i].y = Math.round((this.points[i].y + this.points[i-1].y + (2*tempPointB.y))/4);
            dist =this.points[i].y - this.points[i-1].y;
            if (dist > 1)
                this.points[i].y += Math.round(Math.sqrt(dist));
            else if (dist < -1)
                this.points[i].y -= Math.round(Math.sqrt(Math.abs(dist)));*/
            if (dist > 2)
                this.points[i].x += Math.round(dist/4);
            else if (dist < -2)
                this.points[i].x -= Math.round(-dist/4);
            
            this.points[i].y = Math.round((this.points[i].y + this.points[i-1].y + (2*tempPointB.y))/4);
            dist =this.points[i].y - this.points[i-1].y;
            if (dist > 3)
                this.points[i].y += Math.round(dist/4);
            else if (dist < -3)
                this.points[i].y -= Math.round(-dist/4);
            tempPointB=tempPointA;
        }
    },

    paint: function(doPickup){
        for(var i = 0; i<this.nPoints-1; i++){
            if(doPickup){
                var pickup = context.getImageData(this.points[i].x, this.points[i].y,1,1);

                 this.points[i].col = mixColours(this.points[i].col, pickup.data, this.paintFactor);
                 //console.log(this.points[i].col);
             }
             //context.fillStyle = this.points[i].col;
             //context.fillRect(this.points[i].x, this.points[i].y, 1, 1);
            context.strokeStyle = this.points[i].col;
            context.beginPath();
            context.moveTo(this.points[i].x, this.points[i].y);
            context.moveTo(this.points[i+1].x, this.points[i+1].y);
            context.stroke();

         }
    }
}

// Holds all the bristles together, each taking one pixel of brush width. Undecided on is the brush should rotate.
var Brush = function(nBristles, nPoints) {
    
    this.nBristles = nBristles;
    this.bristles = generateBristles(nBristles, nPoints);
    this.excluded = null;
    this.count = 0;
    
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
        if (Math.random() >= 0.5){
            this.excluded = Math.round(this.nBristles * (1-(Math.pow(Math.random(), 4))));
        }
        else {
            this.excluded = Math.round(this.nBristles * Math.pow(Math.random(), 4));                                   
        }
    },
    
    moveBrush: function(x,y){
        for (var i = 0; i<this.nBristles; i++) {
            this.bristles[i].moveBristle(x-Math.floor(this.nBristles/2)+i, y);
        }
        
    },
    
    paint: function(){
        var excluded = Math.random();
        for (var i = 0; i<this.nBristles; i++){
            if (i != this.excluded)
                this.bristles[i].paint(this.count == 2);
            //if (this.count == 3)
                //console.log('=3 should be picking up');
        }
        if(this.count > 2)
            this.count = 0;
        else
            this.count++;
    }
}

// Sets up the scene.
function initialisePainting() {

    container = document.createElement('div');
    document.body.appendChild(container);
               
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    
   // context.fillStyle = "blue";
   //3 context.fillRect(100, 200, 50, 500);

    options = {
        nBristles:20,
        nPoints:5,
        colour:"#ff0000",
        paintOnBrush:200,
        brushRGB:"rgb(255,00,00)",

        cleanBrush: function(){
            setRGB();
            brush.setColour(options.colour);
            //context.fillStyle = value;
        },
        
        dryPaint: function(){
            dry();
            setRGB();
            brush.setColour(options.colour);
        }
    }
    
    gui.addColor(options, 'colour').onChange(function(value){
        setRGB();
        brush.setColour(options.brushRGB);
        context.fillStyle = value;
        //brush.setColour(value);
    });
    gui.add(options, 'nBristles', 1, 50).step(1).onFinishChange(function(value){
        brush = new Brush(value, value);
    });
    gui.add(options, 'nPoints', 1, 50).step(1).onFinishChange(function(value){
        brush = new Brush(value, value);
    });
    //gui.add(options, "paintOnBrush", 0, 1000);
    gui.add(options, "cleanBrush");

    pickup = document.createElement('canvas');  // Don't think I need this ?
    pickup.width = 200;
    pickup.height = 100;
    pickupctx = pickup.getContext('2d');
        
    setRGB();

    brush = new Brush(options.nBristles, options.nPoints);
    
    context.lineWidth = 1;
    
}

function BeginTouch(event) {
    event.preventDefault();
    drawing = true;
    var x,y,z;
    var v = alignPosition(event.touches[0].clientX, event.touches[0].clientY);

    firstTouchPos = new Point(v.x, v.y);
    firstMove = true;
    secondMove = false;
    
    //paintPoint(v.x,v.y);
}    

function TouchMove(event) {
    event.preventDefault();
    var x,y,z;
    var v = alignPosition(event.touches[0].clientX, event.touches[0].clientY);
    
    if (secondMove){
        brush.setInitDirection(new Point(v.x, v.y));
        secondMove = false;
    }
    else if (firstMove){
        secondMove = true;
        firstMove = false;
    }
    else
        paintPickup(v.x,v.y, false);
    
    //if (drawLine && lastDrawn.x != undefined && lastDrawn.y != undefined) {
    if (drawLine && lastDrawn.x != 0 && lastDrawn.y != 0 && (! firstMove || ! secondMove)) {
        DrawLine(lastDrawn.x, lastDrawn.y, v.x, v.y);
        //console.log('DrawLine called', lastDrawn.x, lastDrawn.y, ' to ', px, py);
    }
    
    lastDrawn.x = v.x;
    lastDrawn.y = v.y;
}

function EndTouchMove(event){

    if (drawLine)
    {
        lastDrawn.x = 0;
        lastDrawn.y = 0;
    }
    drawing = false; // Unused ?
}

// Bresenham's algorithm, modified to use the brush footprint     
function DrawLine(ax, ay, bx, by) {
    if (ax == bx && ay == by){
        return;
    }
    var i, m, x, y, rounded;
    var absX = Math.abs(bx-ax);
    var absY = Math.abs(by-ay);
    
    if (absX <= 1 && absY <=1){
        return;
    }
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
    
    if (ax <= bx && ay <= by && absX>=absY) { //1st Quadrant
        for (i = 0; i < absX; i++) {
            x++;
            y+=my;
            rounded = Math.round(y);
            paintPickup(x,rounded, false);
        }
        //console.log('1st q', bx-ax);
    }
    else if (ax <= bx && ay <= by && absX< absY) { //2nd Quadrant
        for (i = 0; i < absY; i++) {
            x+=mx;
            y++;
            rounded = Math.round(x);
            paintPickup(rounded,y, false);
        }
        //console.log('2nd q', by-ay);
    }        
    else if (ax > bx && ay < by && absX <= absY) { //3rd Quadrant
        for (i = 0; i < absY; i++) {
            x-=mx;
            y++;
            rounded = Math.round(x);
            paintPickup(rounded,y, false);
        }
        //console.log('3rd q', by-ay);
    } 
    else if (ax > bx && ay < by && absX > absY) { //4th Quadrant
        for (i = 0; i < absX; i++) {
            x--;
            y+=my;
            rounded = Math.round(y);
            paintPickup(x,rounded, false);
        }
        //console.log('4th q', bx-ax);
    }
    else if (ax > bx && ay >= by && absX >= absY) { //5th Quadrant
        for (i = 0; i < absX; i++) {
            x--;
            y-=my;
            rounded = Math.round(y);
            paintPickup(x,rounded, false);
        }
        //console.log('5th q', bx-ax);
    }
    else if (ax > bx && ay >= by && absX <= absY) { //6th Quadrant
        for (i = 0; i < Math.abs(by-ay); i++) {
            x-=mx;
            y--;
            rounded = Math.round(x);
            paintPickup(rounded,y, false);
        }
        //console.log('6th q', by-ay);
    } 
    else if (ax <= bx && ay > by && absX < absY) { //7th Quadrant
        for (i = 0; i < absY; i++) {
            x+=mx;
            y--;
            rounded = Math.round(x);
            paintPickup(rounded,y, false);
        }
        //console.log('7th', by-ay);
    } 
    else if (ax <= bx && ay > by && absX >=absY) { //8th Quadrant
        for (i = 0; i < absX; i++) {
            x++;
            y-=my;
            rounded = Math.round(y);
            paintPickup(x,rounded, false);
        }
        //console.log('8th q', bx-ax);
    } 
    else {
        console.log('no quadrant valid');
    }
}

function setRGB() {
   /* pR = Math.floor(options.colour/65536);
    pG = Math.floor((options.colour-(pR*65536)) / 256);
    pB = (options.colour - (pR*65536) - (pG*256));
    console.log(options.colour);
    options.brushRGB = "rgb("+pR+","+pG+","+pB+")";*/
    options.brushRGB = options.colour;
}

function paintPoint(x,y) {

    context.fillStyle = options.brushRGB;
    context.fillRect(x - (options.nBristles/2), y - (options.nBristles/2), options.nBristles/4, options.nBristles/4);

    lastDrawn.x = x;
    lastDrawn.y = y;
}
    
function paintPickup(x,y, setLastDrawn) {
    brush.moveBrush(x,y);
    brush.paint();
    
    if (setLastDrawn){
        lastDrawn.x = x;
        lastDrawn.y = y;
    }
}

function dry(){
    
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
        bristles.push(new Bristle(nPoints + Math.round(nPoints/4) - Math.abs(Math.round((nBristles/4 - i/2))), i, nBristles));

    }
    return bristles;
}

function mixColours(col, imgData, factor)
{
    if (imgData[3] == 0 || (imgData[0] == 255 && imgData[1] == 255 && imgData[2] == 255)){
        return col;
    }
    var colInt = parseInt(col.substring(1,7), 16);
    var r = Math.floor(colInt/65536);
    var g = Math.floor((colInt-(r*65536)) / 256);
    var b = (colInt - (r*65536) - (g*256));
    
    if (imgData[0] == r && imgData[1] == g && imgData[2] == b)
        return col;
    
    var factp1 = factor+1;

    r = Math.round((r + factor*imgData[0])/factp1);
    g = Math.round((g + factor*imgData[1])/factp1);
    b = Math.round((b + factor*imgData[2])/factp1);

    var colour = 65536*r + 256*g + b;
    return '#' + ('00000' + (colour | 0).toString(16)).substr(-6); 
}