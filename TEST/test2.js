<!DOCTYPE html>
<html> 
  <head> 
    <title>Basic Drawing App</title> 
    <script type=text/javascript> 
                
        var drawing = false;
        var pt = null;
        var ctx;

        function init() {
            var touchzone = document.getElementById("myCanvas");
            touchzone.addEventListener("touchstart", handletouchstart, false);
            touchzone.addEventListener("touchmove", handletouchmove, false);
            touchzone.addEventListener("touchend", handletouchend, false);
            ctx = touchzone.getContext("2d");
        }

        function handletouchstart(event) {
            event.preventDefault();
            drawing = true;
            pt = {x:event.touches[0].pageX, y:event.touches[0].pageY};
        }

        function handletouchmove(event) {
            event.preventDefault();
            //if (drawing !== false && pt !== null){
            if (pt !== null){
                var c = document.getElementById("myCanvas");
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(event.touches[0].pageX, event.touches[0].pageY);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.stroke();
            }           
            pt = {x:event.touches[0].pageX, y:event.touches[0].pageY};

        }
        
        function handletouchend(event) {
            event.preventDefault();
            drawing = false;
            pt = null;
        }
        
    </script>
  </head> 
  <body onload="init()">
    <canvas id="myCanvas" width="700" height="700" style="border:1px solid #fff">
Your browser does not support the HTML5 canvas tag.</canvas>
  </body> 
</html>