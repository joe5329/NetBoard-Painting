
function initTouchMoveCanvas() {

  document.addEventListener("touchmove", TouchMove, false);
  document.addEventListener("touchend", EndTouchMove, false);
  document.addEventListener("touchstart", BeginTouch, false);
}

initTouchMoveCanvas();