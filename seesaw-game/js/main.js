// Main - Screen management and event binding

document.addEventListener("DOMContentLoaded", function () {
  var screens = {
    start: document.getElementById("screen-start"),
    play: document.getElementById("screen-play"),
    result: document.getElementById("screen-result"),
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("active", key === name);
    });
    refreshScreenAds(name);
  }

  function updateHUD() {
    document.getElementById("hud-score").textContent = gameState.score.toLocaleString();
    document.getElementById("hud-combo").textContent = "x" + gameState.combo;
    document.getElementById("hud-time").textContent = formatTime(gameState.timeLeft);

    var timeEl = document.getElementById("hud-time");
    timeEl.classList.toggle("time-warning", gameState.timeLeft <= 10);

    // Timer bar
    var config = DIFFICULTY[gameState.difficulty];
    var pct = (gameState.timeLeft / config.timeLimit) * 100;
    document.getElementById("timer-bar-fill").style.width = pct + "%";
    if (gameState.timeLeft <= 10) {
      document.getElementById("timer-bar-fill").classList.add("warning");
    }
  }

  function updateSums() {
    var leftSum = getSelectedSum("left");
    var rightSum = getSelectedSum("right");
    document.getElementById("left-sum").textContent = leftSum;
    document.getElementById("right-sum").textContent = rightSum;
    updateSeesaw(leftSum, rightSum);

    // Enable/disable confirm button
    var btn = document.getElementById("btn-confirm");
    btn.disabled = gameState.leftSelected.length === 0 || gameState.rightSelected.length === 0;
  }

  function showComboText(combo) {
    var text = getComboText(combo);
    if (!text) return;
    var el = document.getElementById("combo-popup");
    el.textContent = text;
    el.classList.remove("show");
    void el.offsetWidth; // force reflow
    el.classList.add("show");
  }

  function startGame(difficulty) {
    // 기존 게임 정리
    stopTimer();
    stopBGM();
    clearSelection();

    initGame(difficulty);
    showScreen("play");

    var config = DIFFICULTY[difficulty];
    renderBoard("left-board", "left", gameState.leftTiles, config.gridCols);
    renderBoard("right-board", "right", gameState.rightTiles, config.gridCols);

    document.getElementById("timer-bar-fill").classList.remove("warning");
    updateHUD();
    updateSums();

    startTimer(config.timeLimit, function () {
      updateHUD();
    }, function () {
      endGame();
    });

    startBGM();
  }

  function endGame() {
    stopTimer();
    stopBGM();
    var result = getResult();
    showScreen("result");

    document.getElementById("result-score").textContent = result.score.toLocaleString();
    document.getElementById("result-clear-rate").textContent =
      result.removedCount + "/" + result.totalTiles + " (" + result.clearRate.toFixed(0) + "%)";
    document.getElementById("result-max-combo").textContent = "x" + result.maxCombo;
    document.getElementById("result-match-count").textContent = result.matchCount + "회";
    document.getElementById("result-miss-count").textContent = result.missCount + "회";

    var gradeEl = document.getElementById("result-grade");
    gradeEl.textContent = result.grade;
    gradeEl.style.color = result.gradeInfo.color;

    document.getElementById("result-message").textContent = result.gradeInfo.message;
  }

  // Tile click delegation
  document.getElementById("left-board").addEventListener("click", function (e) {
    var tile = e.target.closest(".tile");
    if (!tile || tile.classList.contains("removed")) return;
    handleTileClick("left", parseInt(tile.dataset.id));
    updateTileStates("left");
    updateSums();
  });

  document.getElementById("right-board").addEventListener("click", function (e) {
    var tile = e.target.closest(".tile");
    if (!tile || tile.classList.contains("removed")) return;
    handleTileClick("right", parseInt(tile.dataset.id));
    updateTileStates("right");
    updateSums();
  });

  // Confirm match
  document.getElementById("btn-confirm").addEventListener("click", function () {
    var result = checkMatch();
    if (result.matched) {
      var leftIds = gameState.leftSelected.slice();
      var rightIds = gameState.rightSelected.slice();
      var matchSum = result.sum;

      animateBalance();

      animateMatch(leftIds, rightIds, function () {
        var tilesRemoved = removeTiles();
        updateCombo(true);
        updateScore(matchSum, tilesRemoved);
        clearSelection();
        updateHUD();
        updateSums();
        showComboText(gameState.combo);

        if (checkAllCleared() || checkOneSideEmpty()) {
          setTimeout(endGame, 300);
        }
      });
    } else {
      updateCombo(false);
      animateFail();
      animateSeesawShake();
      setTimeout(function () {
        clearSelection();
        updateTileStates("left");
        updateTileStates("right");
        updateSums();
        updateHUD();
      }, 350);
    }
  });

  // Clear selection
  document.getElementById("btn-clear").addEventListener("click", function () {
    clearSelection();
    updateTileStates("left");
    updateTileStates("right");
    updateSums();
  });

  // Difficulty buttons
  document.querySelectorAll("[data-difficulty]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      startGame(btn.dataset.difficulty);
    });
  });

  // Result buttons
  document.getElementById("btn-retry").addEventListener("click", function () {
    startGame(gameState.difficulty);
  });

  document.getElementById("btn-bgm").addEventListener("click", toggleBGM);

  document.getElementById("volume-slider").addEventListener("input", function () {
    var val = parseInt(this.value) / 100;
    setBGMVolume(val);
  });

  // In-game retry
  document.getElementById("btn-ingame-retry").addEventListener("click", function () {
    if (!confirm("현재 게임을 초기화하고 다시 시작하시겠습니까?")) return;
    startGame(gameState.difficulty);
  });

  // In-game quit
  document.getElementById("btn-ingame-quit").addEventListener("click", function () {
    if (!confirm("진행 중인 게임을 종료하시겠습니까?")) return;
    stopTimer();
    stopBGM();
    clearSelection();
    gameState.screen = "start";
    showScreen("start");
  });

  document.getElementById("btn-change").addEventListener("click", function () {
    stopTimer();
    stopBGM();
    gameState.screen = "start";
    showScreen("start");
  });

  document.getElementById("btn-share").addEventListener("click", shareResult);
  document.getElementById("btn-share-x").addEventListener("click", shareToX);
  document.getElementById("btn-share-fb").addEventListener("click", shareToFacebook);
  document.getElementById("btn-share-kakao").addEventListener("click", shareToKakao);
  document.getElementById("btn-share-copy").addEventListener("click", shareCopyLink);

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (gameState.screen !== "play") return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("btn-confirm").click();
    }
    if (e.key === "Escape") {
      document.getElementById("btn-clear").click();
    }
  });

  // Initial
  showScreen("start");
});
