// Game Logic

var DIFFICULTY = {
  easy: {
    label: "Easy",
    numRange: [1, 20],
    gridCols: 5,
    gridRows: 5,
    guaranteedPairs: 10,
    timeLimit: 90,
  },
  normal: {
    label: "Normal",
    numRange: [1, 20],
    gridCols: 7,
    gridRows: 7,
    guaranteedPairs: 18,
    timeLimit: 120,
  },
  hard: {
    label: "Hard",
    numRange: [1, 20],
    gridCols: 10,
    gridRows: 10,
    guaranteedPairs: 35,
    timeLimit: 180,
  },
};

function getGrade(clearRate) {
  if (clearRate >= 100) return { grade: "S", message: "완벽한 균형 마스터!", color: "#FFD700" };
  if (clearRate >= 80) return { grade: "A", message: "거의 완벽한 균형 감각!", color: "#40C057" };
  if (clearRate >= 60) return { grade: "B", message: "균형 잡힌 실력!", color: "#228BE6" };
  if (clearRate >= 40) return { grade: "C", message: "조금 더 연습해봐요", color: "#FD7E14" };
  return { grade: "D", message: "균형 감각을 키워봐요...", color: "#FA5252" };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a subset of 1~3 numbers that sum to target within numRange
function generateSubset(target, numRange) {
  var min = numRange[0];
  var max = numRange[1];

  // Try single number
  if (target >= min && target <= max) {
    if (Math.random() < 0.3) return [target];
  }

  // Try two numbers
  for (var attempt = 0; attempt < 20; attempt++) {
    var a = randInt(min, Math.min(max, target - min));
    var b = target - a;
    if (b >= min && b <= max && a !== b) {
      return [a, b];
    }
  }

  // Try three numbers
  for (var attempt2 = 0; attempt2 < 30; attempt2++) {
    var x = randInt(min, Math.min(max, target - 2 * min));
    var y = randInt(min, Math.min(max, target - x - min));
    var z = target - x - y;
    if (z >= min && z <= max && x !== y && y !== z && x !== z) {
      return [x, y, z];
    }
  }

  // Fallback: single number if in range
  if (target >= min && target <= max) return [target];
  // Last resort: two equal numbers
  if (target % 2 === 0 && target / 2 >= min && target / 2 <= max) {
    return [target / 2, target / 2];
  }
  return [Math.min(target, max)];
}

function generateTiles(config) {
  var min = config.numRange[0];
  var max = config.numRange[1];
  var totalPerSide = config.gridCols * config.gridRows;
  var leftValues = [];
  var rightValues = [];

  // Generate guaranteed matching pairs
  for (var i = 0; i < config.guaranteedPairs; i++) {
    var target = randInt(min * 2, max * 2);
    var leftSub = generateSubset(target, config.numRange);
    var rightSub = generateSubset(target, config.numRange);
    leftValues = leftValues.concat(leftSub);
    rightValues = rightValues.concat(rightSub);
  }

  // Trim if exceeded
  if (leftValues.length > totalPerSide) leftValues = leftValues.slice(0, totalPerSide);
  if (rightValues.length > totalPerSide) rightValues = rightValues.slice(0, totalPerSide);

  // Fill remaining with random
  while (leftValues.length < totalPerSide) {
    leftValues.push(randInt(min, max));
  }
  while (rightValues.length < totalPerSide) {
    rightValues.push(randInt(min, max));
  }

  // Shuffle
  shuffle(leftValues);
  shuffle(rightValues);

  // Create tile objects
  var leftTiles = leftValues.map(function (val, idx) {
    return {
      id: idx,
      value: val,
      removed: false,
      row: Math.floor(idx / config.gridCols),
      col: idx % config.gridCols,
    };
  });

  var rightTiles = rightValues.map(function (val, idx) {
    return {
      id: idx,
      value: val,
      removed: false,
      row: Math.floor(idx / config.gridCols),
      col: idx % config.gridCols,
    };
  });

  return { left: leftTiles, right: rightTiles };
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

var gameState = {
  screen: "start",
  difficulty: "normal",
  leftTiles: [],
  rightTiles: [],
  leftSelected: [],
  rightSelected: [],
  score: 0,
  combo: 0,
  maxCombo: 0,
  matchCount: 0,
  missCount: 0,
  removedCount: 0,
  totalTiles: 0,
  timeLeft: 90,
  timerRunning: false,
  grade: "",
  gradeInfo: null,
};

function initGame(difficulty) {
  var config = DIFFICULTY[difficulty];
  var tiles = generateTiles(config);
  var totalPerSide = config.gridCols * config.gridRows;

  gameState.screen = "play";
  gameState.difficulty = difficulty;
  gameState.leftTiles = tiles.left;
  gameState.rightTiles = tiles.right;
  gameState.leftSelected = [];
  gameState.rightSelected = [];
  gameState.score = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.matchCount = 0;
  gameState.missCount = 0;
  gameState.removedCount = 0;
  gameState.totalTiles = totalPerSide * 2;
  gameState.timeLeft = config.timeLimit;
  gameState.timerRunning = false;
  gameState.grade = "";
  gameState.gradeInfo = null;
}

function handleTileClick(side, tileId) {
  if (gameState.screen !== "play") return;

  var selected = side === "left" ? gameState.leftSelected : gameState.rightSelected;
  var tiles = side === "left" ? gameState.leftTiles : gameState.rightTiles;
  var tile = tiles[tileId];

  if (!tile || tile.removed) return;

  var idx = selected.indexOf(tileId);
  if (idx >= 0) {
    selected.splice(idx, 1);
  } else {
    selected.push(tileId);
  }
}

function getSelectedSum(side) {
  var selected = side === "left" ? gameState.leftSelected : gameState.rightSelected;
  var tiles = side === "left" ? gameState.leftTiles : gameState.rightTiles;
  var sum = 0;
  for (var i = 0; i < selected.length; i++) {
    sum += tiles[selected[i]].value;
  }
  return sum;
}

function checkMatch() {
  if (gameState.leftSelected.length === 0 || gameState.rightSelected.length === 0) {
    return { matched: false, reason: "empty" };
  }

  var leftSum = getSelectedSum("left");
  var rightSum = getSelectedSum("right");

  if (leftSum === rightSum) {
    return { matched: true, sum: leftSum };
  }
  return { matched: false, leftSum: leftSum, rightSum: rightSum };
}

function removeTiles() {
  var tilesRemoved = gameState.leftSelected.length + gameState.rightSelected.length;

  for (var i = 0; i < gameState.leftSelected.length; i++) {
    gameState.leftTiles[gameState.leftSelected[i]].removed = true;
  }
  for (var i = 0; i < gameState.rightSelected.length; i++) {
    gameState.rightTiles[gameState.rightSelected[i]].removed = true;
  }

  gameState.removedCount += tilesRemoved;
  return tilesRemoved;
}

function updateScore(matchSum, tilesRemoved) {
  var config = DIFFICULTY[gameState.difficulty];
  var totalPerSide = config.gridCols * config.gridRows;
  // 난이도에 따라 기본 점수 낮춤 (타일이 많으므로 매칭 기회도 많음)
  var diffScale = totalPerSide <= 25 ? 1.0 : totalPerSide <= 49 ? 0.7 : 0.5;
  var base = Math.round(matchSum * 10 * diffScale);
  var tileBonus = Math.round(tilesRemoved * 20 * diffScale);
  var comboBonus = gameState.combo * 50;
  var total = base + tileBonus + comboBonus;
  gameState.score += total;
  return total;
}

function updateCombo(success) {
  if (success) {
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) {
      gameState.maxCombo = gameState.combo;
    }
    gameState.matchCount++;
  } else {
    gameState.combo = 0;
    gameState.missCount++;
  }
}

function clearSelection() {
  gameState.leftSelected = [];
  gameState.rightSelected = [];
}

function checkAllCleared() {
  for (var i = 0; i < gameState.leftTiles.length; i++) {
    if (!gameState.leftTiles[i].removed) return false;
  }
  for (var i = 0; i < gameState.rightTiles.length; i++) {
    if (!gameState.rightTiles[i].removed) return false;
  }
  return true;
}

function checkOneSideEmpty() {
  var leftHas = false;
  var rightHas = false;
  for (var i = 0; i < gameState.leftTiles.length; i++) {
    if (!gameState.leftTiles[i].removed) { leftHas = true; break; }
  }
  for (var i = 0; i < gameState.rightTiles.length; i++) {
    if (!gameState.rightTiles[i].removed) { rightHas = true; break; }
  }
  return !leftHas || !rightHas;
}

function getResult() {
  var clearRate = (gameState.removedCount / gameState.totalTiles) * 100;
  var config = DIFFICULTY[gameState.difficulty];
  var totalPerSide = config.gridCols * config.gridRows;

  if (checkAllCleared()) {
    // 올클리어 보너스: 격자 크기에 비례
    gameState.score += totalPerSide * 10;
    gameState.score += gameState.timeLeft * 5;
  } else if (checkOneSideEmpty()) {
    // 한쪽 소진 보너스: 올클리어의 절반
    gameState.score += totalPerSide * 5;
    gameState.score += gameState.timeLeft * 2;
  }

  gameState.gradeInfo = getGrade(clearRate);
  gameState.grade = gameState.gradeInfo.grade;
  gameState.screen = "result";

  return {
    score: gameState.score,
    clearRate: clearRate,
    maxCombo: gameState.maxCombo,
    matchCount: gameState.matchCount,
    missCount: gameState.missCount,
    removedCount: gameState.removedCount,
    totalTiles: gameState.totalTiles,
    grade: gameState.grade,
    gradeInfo: gameState.gradeInfo,
  };
}

function getComboText(combo) {
  if (combo >= 7) return "UNSTOPPABLE!";
  if (combo >= 5) return "AMAZING!";
  if (combo >= 3) return "Great!";
  if (combo >= 2) return "Nice!";
  return "";
}
