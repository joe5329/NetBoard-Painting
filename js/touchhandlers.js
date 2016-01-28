
function initTouchMoveCanvas() {

  document.addEventListener("touchmove", TouchMove, false);
  document.addEventListener("touchend", EndTouchMove, false);
  document.addEventListener("touchstart", BeginTouch, false);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;   // Have to change bwidth and bheight ?
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}