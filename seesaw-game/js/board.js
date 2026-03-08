// Board rendering (DOM-based tile grid)

function renderBoard(containerId, side, tiles, gridCols) {
  var container = document.getElementById(containerId);
  container.innerHTML = "";
  container.style.gridTemplateColumns = "repeat(" + gridCols + ", 1fr)";
  container.style.gap = gridCols >= 10 ? "3px" : gridCols >= 7 ? "4px" : "6px";

  for (var i = 0; i < tiles.length; i++) {
    var tile = tiles[i];
    var el = document.createElement("div");
    el.className = "tile";
    el.dataset.id = tile.id;
    el.dataset.side = side;
    el.dataset.value = tile.value;

    if (tile.removed) {
      el.classList.add("removed");
    }

    var span = document.createElement("span");
    span.className = "tile-value";
    span.textContent = tile.value;
    el.appendChild(span);

    container.appendChild(el);
  }
}

function updateTileStates(side) {
  var selected = side === "left" ? gameState.leftSelected : gameState.rightSelected;
  var containerId = side === "left" ? "left-board" : "right-board";
  var container = document.getElementById(containerId);
  var tileEls = container.querySelectorAll(".tile");

  for (var i = 0; i < tileEls.length; i++) {
    var el = tileEls[i];
    var id = parseInt(el.dataset.id);
    el.classList.toggle("selected", selected.indexOf(id) >= 0);
  }
}

function animateMatch(leftIds, rightIds, callback) {
  var leftBoard = document.getElementById("left-board");
  var rightBoard = document.getElementById("right-board");

  // Mark matched tiles
  leftIds.forEach(function (id) {
    var el = leftBoard.querySelector('[data-id="' + id + '"]');
    if (el) el.classList.add("matched");
  });
  rightIds.forEach(function (id) {
    var el = rightBoard.querySelector('[data-id="' + id + '"]');
    if (el) el.classList.add("matched");
  });

  // After animation, mark as removed
  setTimeout(function () {
    leftIds.forEach(function (id) {
      var el = leftBoard.querySelector('[data-id="' + id + '"]');
      if (el) {
        el.classList.remove("matched");
        el.classList.add("removed");
      }
    });
    rightIds.forEach(function (id) {
      var el = rightBoard.querySelector('[data-id="' + id + '"]');
      if (el) {
        el.classList.remove("matched");
        el.classList.add("removed");
      }
    });
    if (callback) callback();
  }, 400);
}

function animateFail() {
  var leftBoard = document.getElementById("left-board");
  var rightBoard = document.getElementById("right-board");

  [leftBoard, rightBoard].forEach(function (board) {
    var selected = board.querySelectorAll(".tile.selected");
    selected.forEach(function (el) {
      el.classList.add("shake");
      setTimeout(function () {
        el.classList.remove("shake");
        el.classList.remove("selected");
      }, 300);
    });
  });
}
