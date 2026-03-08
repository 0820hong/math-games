// TSP Solver - Held-Karp Algorithm (Bitmask DP)

function distMatrix(nodes) {
  const n = nodes.length;
  const dist = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }
  return dist;
}

function solveTSP(nodes) {
  const n = nodes.length;
  const dist = distMatrix(nodes);
  const full = (1 << n) - 1;

  // dp[mask][i] = min distance visiting nodes in mask, ending at i
  const dp = Array.from({ length: 1 << n }, () => new Float64Array(n).fill(Infinity));
  const parent = Array.from({ length: 1 << n }, () => new Int8Array(n).fill(-1));

  dp[1][0] = 0; // start at node 0

  for (let mask = 1; mask <= full; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue;
      if (dp[mask][u] === Infinity) continue;

      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;
        const newMask = mask | (1 << v);
        const newDist = dp[mask][u] + dist[u][v];
        if (newDist < dp[newMask][v]) {
          dp[newMask][v] = newDist;
          parent[newMask][v] = u;
        }
      }
    }
  }

  // Find best last node (return to start)
  let bestDist = Infinity;
  let lastNode = -1;
  for (let i = 1; i < n; i++) {
    const total = dp[full][i] + dist[i][0];
    if (total < bestDist) {
      bestDist = total;
      lastNode = i;
    }
  }

  // Reconstruct path
  const path = [];
  let mask = full;
  let cur = lastNode;
  while (cur !== -1) {
    path.push(cur);
    const prev = parent[mask][cur];
    mask = mask ^ (1 << cur);
    cur = prev;
  }
  path.reverse();

  return { path: path, distance: bestDist };
}

function calcDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calcTotalDistance(path, nodes) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += calcDistance(nodes[path[i]], nodes[path[i + 1]]);
  }
  total += calcDistance(nodes[path[path.length - 1]], nodes[path[0]]);
  return total;
}
