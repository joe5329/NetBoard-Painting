var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var BPoint = function(x, y, col) {
    this.x = x;
    this.y = y;
    this.col = col;
}

/*var Colour = function(r,b,g) {
    if (arguments.length == 3){
        this.r = r;
        this.g = g;
        this.b = b;
        this.hex = "rgb("+r+","+g+","+b+")";
    }
    else if (arguments.length == 1){
        this.hex
    }
}*/

function createArray3(d1,d2,d3) {
  var data = [d1*d2*d3];
  function get(x,y,z) { return data[x*d1*d2 + y*d1 + z];}
  function set(x,y,z,v) { data[x*d1*d2 + y*d1 + z] = v;}
  return {'get':get, 'set':set};
}

function createArray2(d1,d2) {
  var data = [d1*d2];
  function get(x,y) { return data[x*d1 + y];}
  function set(x,y,v) { data[x*d1 + y] = v;}
  return {'get':get, 'set':set};
}

function alignPosition(x,y) {
    var point = new THREE.Vector2(x,y);
    point.floor();
    return point;
}

function RoundToUnit(n) { //floor ?
    var r = n%1;
    return n - r;

}

function inCircle(x,y,r) { //Need to fix
    var i = Math.abs(x-r);
    var j = Math.abs(y-r);
    if (Math.sqrt((i*i)+(j*j)) < r) {
        return true;
    }
    else {
        return false;
    }
}

function setPointsOnLine(ax, ay, bx, by, nPoints, points) {
    var i, m, x, y, rounded, reversed = false;
    if (bx < ax) {
        var temp = bx;
        bx = ax;
        ax = temp;
        temp = by;
        by = ay;
        ay = temp;
        reversed = true;
    }
    x = ax;
    y = ay;
    mx = 1*(bx - ax)/(by -  ay);
    my = 1*(by - ay)/(bx - ax);
    if (ay <= by && Math.abs(bx-ax)>=Math.abs(by-ay)) { //1st Quadrant
        for (i = 0; i < nPoints; i++) {
            x+=1;
            y+=my;
            rounded = Math.round(y);
            if (!reversed) {
                points[i].x = x;
                points[i].y = rounded;
            }
            else {
                if (points[(nPoints-i)-1] == undefined)
                    console.log('undefined',i,nPoints,(nPoints-i)-1);
                points[(nPoints-i)-1].x = x;
                points[(nPoints-i)-1].y = rounded;
            }
        }
    }
    else if (ay <= by && Math.abs(bx-ax)< Math.abs(by-ay)) { //2nd Quadrant
        for (i = 0; i < nPoints; i++) {
            x+=mx;
            y+=1;
            rounded = Math.round(x);
            if (!reversed) {
                points[i].x = rounded;
                points[i].y = y;
            }
            else {
                points[(nPoints-i)-1].x = rounded;
                points[(nPoints-i)-1].y = y;
            }
        }
    }        
    else if (ay > by && Math.abs(bx-ax)<= Math.abs(ay-by)) { //7th Quadrant
        for (i = 0; i < nPoints; i++) {
            x-=mx;
            y-=1;
            rounded = Math.round(x);
            if (!reversed) {
                points[i].x = rounded;
                points[i].y = y;
            }
            else {
                points[(nPoints-i)-1].x = rounded;
                points[(nPoints-i)-1].y = y;
            }
        }
    } 
    else if (ay > by && Math.abs(bx-ax)>=Math.abs(ay-by)) { //8th Quadrant
        for (i = 0; i < nPoints; i++) {
            x+=1;
            y+=my;
            rounded = Math.round(y);
            if (!reversed) {
                points[i].x = x;
                points[i].y = rounded;
            }
            else {
                points[(nPoints-i)-1].x = x;
                points[(nPoints-i)-1].y = rounded;
            }
        }
    }
}