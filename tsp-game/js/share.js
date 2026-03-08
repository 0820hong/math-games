// Share functionality

function generateResultImage(state) {
  const shareCanvas = document.createElement("canvas");
  shareCanvas.width = 600;
  shareCanvas.height = 700;
  const ctx = shareCanvas.getContext("2d");

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 600, 700);

  // Header
  ctx.fillStyle = "#212529";
  ctx.font = "bold 24px 'Noto Sans KR', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("배달의 신: 최단경로 챌린지", 300, 40);

  // Mini map area
  ctx.save();
  ctx.translate(50, 60);
  ctx.scale(500 / state.canvasWidth, 400 / state.canvasHeight);

  // Draw paths on mini map
  const nodes = state.nodes;
  // Optimal
  if (state.optimalPath.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.optimalPath;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.moveTo(nodes[state.optimalPath[0]].x, nodes[state.optimalPath[0]].y);
    for (let i = 1; i < state.optimalPath.length; i++) {
      ctx.lineTo(nodes[state.optimalPath[i]].x, nodes[state.optimalPath[i]].y);
    }
    ctx.lineTo(nodes[state.optimalPath[0]].x, nodes[state.optimalPath[0]].y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // User
  if (state.userPath.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.userPath;
    ctx.lineWidth = 3;
    ctx.moveTo(nodes[state.userPath[0]].x, nodes[state.userPath[0]].y);
    for (let i = 1; i < state.userPath.length; i++) {
      ctx.lineTo(nodes[state.userPath[i]].x, nodes[state.userPath[i]].y);
    }
    ctx.lineTo(nodes[state.userPath[0]].x, nodes[state.userPath[0]].y);
    ctx.stroke();
  }
  // Nodes
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = node.isStart ? COLORS.start : COLORS.visited;
    ctx.fill();
  }
  ctx.restore();

  // Result info
  const gradeInfo = state.gradeInfo;
  const y = 490;

  ctx.fillStyle = "#495057";
  ctx.font = "16px 'Noto Sans KR', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`내 거리: ${state.userDistance.toFixed(1)}  |  최적 거리: ${state.optimalDistance.toFixed(1)}`, 300, y);

  ctx.fillStyle = gradeInfo.color;
  ctx.font = "bold 60px 'Noto Sans KR', sans-serif";
  ctx.fillText(gradeInfo.grade, 300, y + 75);

  ctx.fillStyle = "#212529";
  ctx.font = "bold 28px 'Noto Sans KR', sans-serif";
  ctx.fillText(`최적 대비 ${state.ratio.toFixed(1)}%`, 300, y + 115);

  ctx.fillStyle = "#868E96";
  ctx.font = "18px 'Noto Sans KR', sans-serif";
  ctx.fillText(gradeInfo.message, 300, y + 150);

  ctx.fillStyle = "#ADB5BD";
  ctx.font = "14px 'Noto Sans KR', sans-serif";
  ctx.fillText("배달의 신: 최단경로 챌린지 | TSP Mini Game", 300, y + 190);

  return shareCanvas;
}

function shareResult() {
  const shareCanvas = generateResultImage({
    ...gameState,
    canvasWidth: document.getElementById("game-canvas").width,
    canvasHeight: document.getElementById("game-canvas").height,
  });

  shareCanvas.toBlob(function(blob) {
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "tsp-result.png", { type: "image/png" });
      const shareData = { files: [file], title: "배달의 신: 최단경로 챌린지", text: `나는 최적 경로의 ${gameState.ratio.toFixed(1)}%! 등급: ${gameState.grade}` };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData).catch(function() {
          downloadImage(blob);
        });
        return;
      }
    }
    downloadImage(blob);
  }, "image/png");
}

function downloadImage(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tsp-result.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyResultText() {
  const text = `배달의 신: 최단경로 챌린지\n최적 대비: ${gameState.ratio.toFixed(1)}%\n등급: ${gameState.grade} - ${gameState.gradeInfo.message}`;
  navigator.clipboard.writeText(text).then(function() {
    const btn = document.getElementById("btn-copy");
    const original = btn.textContent;
    btn.textContent = "복사 완료!";
    setTimeout(function() { btn.textContent = original; }, 1500);
  });
}
