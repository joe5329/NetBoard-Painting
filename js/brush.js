// Creates a bristle composed of nPoints points what each represent an area of the bristle that holds colour.
var Bristle = function(nPoints) {
    this.nPoints = nPoints;
    this.points = generatePoints(nPoints, options.colour);
    
    /*function setColour(c){
        for (var i = 0; i<nPoints; i++) {
            this.points[i].col = c;
        }
    }
    
    function setInitDirection(point, n, nBristles){
        setPointsOnLine(point.x, point.y, firstTouchPos.x-Math.floor(nBristles/2)+n, firstTouchPos.y, this.nPoints, this.points);
    }
    
    function moveBristle(x, y){
        this.points[0].x = x;
        this.points[0].y = y;
        
        for(var i = 1; i<nPoints; i++){
            this.points[i].x = (this.points[i].x + this.points[i-1].x)/2;
            this.points[i].y = (this.points[i].y + this.points[i-1].y)/2;
        }
    }*/
}

Bristle.prototype = {
    
    setColour: function(c){
        for (var i = 0; i<nPoints; i++)
            this.points[i].col = c;
    },

    setInitDirection: function(point, n, nBristles){
        setPointsOnLine(point.x, point.y, firstTouchPos.x-Math.floor(nBristles/2)+n, firstTouchPos.y, this.nPoints, this.points);
    },
    
    moveBristle: function(x,y){
        this.points[0].x = x;
        this.points[0].y = y;
        
        for(var i = 1; i<nPoints; i++){
            this.points[i].x = (this.points[i].x + this.points[i-1].x)/2;
            this.points[i].y = (this.points[i].y + this.points[i-1].y)/2;
        }
    }
}

Bristle.setColour = function(c){
    
}

// Holds all the bristles together, each taking one pixel of brush width. Undecided on is the brush should rotate.
var Brush = function(nBristles, nPoints) {
    
    this.nBristles = nBristles;
    this.bristles = generateBristles(nBristles, nPoints);
    
    /*var mid = Math.floor(nBristles/2);
    for(var i = 0; i < nBristles; i++) {
        if (i == 0 || i==nBristles)
            this.bristles.push(new Bristle(nPoints-1, x-mid+i, y, ox-mid+i, oy));
        else if (i == mid + 1 || i == mid || i == mid-1)
            this.bristles.push(new Bristle(nPoints+1, x-mid+i, y, ox-mid+i, oy));
        else
            this.bristles.push(new Bristle(nPoints3, x-mid+i, y, ox-mid+i, oy));  
    }
    
    function setColour(c){
        for (var i = 0; i++; i<nBristles)
            this.bristles[i].setColour(c);
    }
    
    function setInitDirection(point){
        for (var i = 0; i++; i<nBristles)
            this.bristles[i].setInitDirection(point, i, nBristles);
    }
    
    function moveBrush(point){
        for (var i = 0; i++; i<nBristles)
            this.bristles[i].moveBristle(point.x-Math.floor(nBristles/2)+i, point.y);
    }*/
}

Brush.prototype = {
    
    setColour: function(c){
        for (var i = 0; i++; i<nBristles)
            this.bristles[i].setColour(c);
    },
    
    setInitDirection: function(point){
         for (var i = 0; i++; i<nBristles)
            this.bristles[i].setInitDirection(point, i, nBristles);       
    },
    
    moveBrush: function(point){
        for (var i = 0; i++; i<nBristles)
            this.bristles[i].moveBristle(point.x-Math.floor(nBristles/2)+i, point.y);        
    }
}