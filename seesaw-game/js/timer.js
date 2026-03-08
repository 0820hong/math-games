// Timer management

let timerInterval = null;
let onTickCallback = null;
let onEndCallback = null;

function startTimer(seconds, onTick, onEnd) {
  stopTimer();
  onTickCallback = onTick;
  onEndCallback = onEnd;
  gameState.timeLeft = seconds;
  gameState.timerRunning = true;

  timerInterval = setInterval(function () {
    gameState.timeLeft--;
    if (onTickCallback) onTickCallback(gameState.timeLeft);
    if (gameState.timeLeft <= 0) {
      stopTimer();
      if (onEndCallback) onEndCallback();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  gameState.timerRunning = false;
}

function formatTime(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}
