// Game Logic

const DIFFICULTY = {
  easy:   { nodeCount: 5,  label: "Easy",   description: "5" },
  normal: { nodeCount: 7,  label: "Normal", description: "7" },
  hard:   { nodeCount: 10, label: "Hard",   description: "10" },
};

function getGrade(ratio) {
  if (ratio <= 100) return { grade: "S", message: "배달의 신!", color: "#FFD700" };
  if (ratio <= 110) return { grade: "A", message: "거의 완벽한 경로!", color: "#40C057" };
  if (ratio <= 125) return { grade: "B", message: "꽤 효율적이에요!", color: "#228BE6" };
  if (ratio <= 150) return { grade: "C", message: "조금 더 노력해봐요", color: "#FD7E14" };
  return { grade: "D", message: "길치 배달원...", color: "#FA5252" };
}

function generateNodes(count, width, height) {
  const padding = 50;
  const minDist = 60;
  const nodes = [];

  // Node 0: start point at bottom center
  nodes.push({ id: 0, x: width / 2, y: height - padding, isStart: true });

  let attempts = 0;
  while (nodes.length < count && attempts < 1000) {
    const x = padding + Math.random() * (width - 2 * padding);
    const y = padding + Math.random() * (height - 2 * padding - 30);
    let tooClose = false;
    for (const node of nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDist) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      nodes.push({ id: nodes.length, x: x, y: y, isStart: false });
    }
    attempts++;
  }

  return nodes;
}

const gameState = {
  screen: "start",
  difficulty: "normal",
  nodes: [],
  userPath: [],
  optimalPath: [],
  userDistance: 0,
  optimalDistance: 0,
  ratio: 0,
  grade: "",
  gradeInfo: null,
};

function initGame(difficulty) {
  const canvas = document.getElementById("game-canvas");
  const w = canvas.width;
  const h = canvas.height;
  const config = DIFFICULTY[difficulty];

  gameState.screen = "play";
  gameState.difficulty = difficulty;
  gameState.nodes = generateNodes(config.nodeCount, w, h);
  gameState.userPath = [0]; // start from node 0
  gameState.optimalPath = [];
  gameState.userDistance = 0;
  gameState.optimalDistance = 0;
  gameState.ratio = 0;
  gameState.grade = "";
  gameState.gradeInfo = null;

  // Pre-compute optimal solution
  const result = solveTSP(gameState.nodes);
  gameState.optimalPath = result.path;
  gameState.optimalDistance = result.distance;
}

function handleNodeClick(nodeId) {
  if (gameState.screen !== "play") return false;
  if (nodeId === 0) return false; // can't click start
  if (gameState.userPath.includes(nodeId)) return false; // already visited

  gameState.userPath.push(nodeId);

  // Check if all nodes visited
  if (gameState.userPath.length === gameState.nodes.length) {
    calculateResult();
    return true; // game complete
  }
  return false;
}

function undoLastNode() {
  if (gameState.userPath.length <= 1) return; // keep start node
  gameState.userPath.pop();
}

function resetPath() {
  gameState.userPath = [0];
}

function calculateResult() {
  gameState.userDistance = calcTotalDistance(gameState.userPath, gameState.nodes);
  gameState.ratio = (gameState.userDistance / gameState.optimalDistance) * 100;
  gameState.gradeInfo = getGrade(gameState.ratio);
  gameState.grade = gameState.gradeInfo.grade;
  gameState.screen = "result";
}

function getCurrentDistance() {
  if (gameState.userPath.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < gameState.userPath.length - 1; i++) {
    total += calcDistance(
      gameState.nodes[gameState.userPath[i]],
      gameState.nodes[gameState.userPath[i + 1]]
    );
  }
  return total;
}
