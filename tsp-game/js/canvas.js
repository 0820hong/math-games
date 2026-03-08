// Canvas Rendering

const COLORS = {
  bg: "#F8F9FA",
  unvisited: "#DEE2E6",
  unvisitedBorder: "#868E96",
  visited: "#228BE6",
  start: "#FA5252",
  userPath: "#228BE6",
  optimalPath: "#40C057",
  text: "#212529",
  textLight: "#868E96",
};

function getNodeRadius() {
  return window.innerWidth <= 768 ? 22 : 15;
}

function getHitRadius() {
  const r = getNodeRadius();
  return window.innerWidth <= 768 ? r * 1.5 : r;
}

function drawNode(ctx, node, visitedIndex, isStart) {
  const r = getNodeRadius();
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

  if (isStart) {
    ctx.fillStyle = COLORS.start;
    ctx.fill();
    ctx.strokeStyle = "#C92A2A";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Star label
    ctx.fillStyle = "#FFF";
    ctx.font = `bold ${r}px 'Noto Sans KR', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", node.x, node.y);
  } else if (visitedIndex >= 0) {
    ctx.fillStyle = COLORS.visited;
    ctx.fill();
    ctx.strokeStyle = "#1971C2";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Visit order label
    ctx.fillStyle = "#FFF";
    ctx.font = `bold ${r - 2}px 'Noto Sans KR', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(visitedIndex), node.x, node.y);
  } else {
    ctx.fillStyle = COLORS.unvisited;
    ctx.fill();
    ctx.strokeStyle = COLORS.unvisitedBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawPath(ctx, path, nodes, color, lineWidth, dashed) {
  if (path.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dashed ? [8, 6] : []);
  ctx.moveTo(nodes[path[0]].x, nodes[path[0]].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(nodes[path[i]].x, nodes[path[i]].y);
  }
  // Return to start
  ctx.lineTo(nodes[path[0]].x, nodes[path[0]].y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPartialPath(ctx, path, nodes, color, lineWidth) {
  if (path.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([]);
  ctx.moveTo(nodes[path[0]].x, nodes[path[0]].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(nodes[path[i]].x, nodes[path[i]].y);
  }
  ctx.stroke();
}

function renderGame(canvas, state) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid dots
  ctx.fillStyle = "#E9ECEF";
  for (let x = 25; x < canvas.width; x += 25) {
    for (let y = 25; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw user path (partial, no return)
  drawPartialPath(ctx, state.userPath, state.nodes, COLORS.userPath, 3);

  // Draw nodes
  for (const node of state.nodes) {
    const visitedIdx = state.userPath.indexOf(node.id);
    drawNode(ctx, node, visitedIdx > 0 ? visitedIdx : -1, node.isStart);
  }
}

function renderResult(canvas, state) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid dots
  ctx.fillStyle = "#E9ECEF";
  for (let x = 25; x < canvas.width; x += 25) {
    for (let y = 25; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw optimal path (green dashed)
  drawPath(ctx, state.optimalPath, state.nodes, COLORS.optimalPath, 2, true);

  // Draw user path (blue solid)
  drawPath(ctx, state.userPath, state.nodes, COLORS.userPath, 3, false);

  // Draw nodes
  for (const node of state.nodes) {
    const visitedIdx = state.userPath.indexOf(node.id);
    drawNode(ctx, node, visitedIdx > 0 ? visitedIdx : -1, node.isStart);
  }

  // Legend
  const legendY = canvas.height - 20;
  ctx.font = "12px 'Noto Sans KR', sans-serif";

  ctx.strokeStyle = COLORS.userPath;
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(20, legendY);
  ctx.lineTo(50, legendY);
  ctx.stroke();
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "left";
  ctx.fillText("내 경로", 55, legendY + 4);

  ctx.strokeStyle = COLORS.optimalPath;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(130, legendY);
  ctx.lineTo(160, legendY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText("최적 경로", 165, legendY + 4);
}

function findClickedNode(x, y, nodes, userPath) {
  const hitR = getHitRadius();
  for (const node of nodes) {
    if (node.isStart) continue;
    if (userPath.includes(node.id)) continue;
    const dx = node.x - x;
    const dy = node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) <= hitR) {
      return node.id;
    }
  }
  return -1;
}
