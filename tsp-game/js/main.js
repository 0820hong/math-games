// Main - Screen management and event binding

document.addEventListener("DOMContentLoaded", function () {
  const screens = {
    start: document.getElementById("screen-start"),
    play: document.getElementById("screen-play"),
    result: document.getElementById("screen-result"),
  };
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const container = canvas.parentElement;
    const containerW = container ? container.clientWidth : 600;
    const maxW = Math.min(600, Math.max(containerW, 300));
    const ratio = 500 / 600;
    canvas.width = maxW;
    canvas.height = Math.floor(maxW * ratio);
    if (gameState.screen === "play") {
      renderGame(canvas, gameState);
    } else if (gameState.screen === "result") {
      renderResult(canvas, gameState);
    }
  }

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("active", key === name);
    });
    // Move canvas to appropriate container
    if (name === "result") {
      document.getElementById("canvas-container-result").appendChild(canvas);
    } else if (name === "play") {
      document.getElementById("canvas-container").appendChild(canvas);
    }
  }

  function updateHUD() {
    const config = DIFFICULTY[gameState.difficulty];
    document.getElementById("hud-difficulty").textContent = config.label;
    const visited = gameState.userPath.length - 1; // exclude start
    const total = config.nodeCount - 1;
    document.getElementById("hud-visited").textContent = visited + "/" + total;
    document.getElementById("hud-distance").textContent = getCurrentDistance().toFixed(1);
  }

  function showResult() {
    showScreen("result");
    renderResult(canvas, gameState);

    document.getElementById("result-user-dist").textContent = gameState.userDistance.toFixed(1);
    document.getElementById("result-optimal-dist").textContent = gameState.optimalDistance.toFixed(1);
    document.getElementById("result-ratio").textContent = gameState.ratio.toFixed(1) + "%";

    const gradeEl = document.getElementById("result-grade");
    gradeEl.textContent = gameState.grade;
    gradeEl.style.color = gameState.gradeInfo.color;

    document.getElementById("result-message").textContent = gameState.gradeInfo.message;
  }

  // Difficulty buttons
  document.querySelectorAll("[data-difficulty]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const diff = btn.dataset.difficulty;
      resizeCanvas();
      initGame(diff);
      showScreen("play");
      renderGame(canvas, gameState);
      updateHUD();
    });
  });

  // Canvas click
  canvas.addEventListener("click", function (e) {
    if (gameState.screen !== "play") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const nodeId = findClickedNode(x, y, gameState.nodes, gameState.userPath);
    if (nodeId === -1) return;

    const complete = handleNodeClick(nodeId);
    if (complete) {
      // Brief delay before showing result
      renderGame(canvas, gameState);
      updateHUD();
      setTimeout(showResult, 600);
    } else {
      renderGame(canvas, gameState);
      updateHUD();
    }
  });

  // Undo
  document.getElementById("btn-undo").addEventListener("click", function () {
    undoLastNode();
    renderGame(canvas, gameState);
    updateHUD();
  });

  // Reset
  document.getElementById("btn-reset").addEventListener("click", function () {
    resetPath();
    renderGame(canvas, gameState);
    updateHUD();
  });

  // Result buttons
  document.getElementById("btn-retry").addEventListener("click", function () {
    resizeCanvas();
    initGame(gameState.difficulty);
    showScreen("play");
    renderGame(canvas, gameState);
    updateHUD();
  });

  document.getElementById("btn-change").addEventListener("click", function () {
    gameState.screen = "start";
    showScreen("start");
  });

  document.getElementById("btn-share").addEventListener("click", shareResult);
  document.getElementById("btn-copy").addEventListener("click", copyResultText);

  // Responsive
  window.addEventListener("resize", resizeCanvas);

  // Initial
  showScreen("start");
});
