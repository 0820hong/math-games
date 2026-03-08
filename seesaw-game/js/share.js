// Share functionality

var GAME_URL = window.location.href;

function getShareText() {
  var clearRate = (gameState.removedCount / gameState.totalTiles * 100).toFixed(0);
  return "[" + gameState.grade + "] " +
    gameState.score.toLocaleString() + " | " +
    "x" + gameState.maxCombo + " | " +
    clearRate + "%\n" +
    gameState.gradeInfo.message + "\n";
}

function generateResultImage() {
  var canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 500;
  var ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 600, 500);

  // Header
  ctx.fillStyle = "#212529";
  ctx.font = "bold 24px 'Noto Sans KR', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("시소 밸런스: 균형을 맞춰라!", 300, 45);

  // Score
  ctx.fillStyle = gameState.gradeInfo.color;
  ctx.font = "bold 64px 'Noto Sans KR', sans-serif";
  ctx.fillText(gameState.grade, 300, 130);

  ctx.fillStyle = "#212529";
  ctx.font = "bold 28px 'Noto Sans KR', sans-serif";
  ctx.fillText("점수: " + gameState.score.toLocaleString(), 300, 180);

  // Stats
  ctx.fillStyle = "#495057";
  ctx.font = "18px 'Noto Sans KR', sans-serif";

  var clearRate = (gameState.removedCount / gameState.totalTiles * 100).toFixed(0);
  var stats = [
    "제거율: " + clearRate + "% (" + gameState.removedCount + "/" + gameState.totalTiles + ")",
    "최대 콤보: x" + gameState.maxCombo,
    "매칭 성공: " + gameState.matchCount + "회 / 실패: " + gameState.missCount + "회",
  ];

  for (var i = 0; i < stats.length; i++) {
    ctx.fillText(stats[i], 300, 230 + i * 35);
  }

  // Grade message
  ctx.fillStyle = gameState.gradeInfo.color;
  ctx.font = "bold 20px 'Noto Sans KR', sans-serif";
  ctx.fillText(gameState.gradeInfo.message, 300, 370);

  // Footer
  ctx.fillStyle = "#ADB5BD";
  ctx.font = "14px 'Noto Sans KR', sans-serif";
  ctx.fillText("시소 밸런스 | Balance Puzzle", 300, 460);

  return canvas;
}

function shareResult() {
  var shareCanvas = generateResultImage();

  shareCanvas.toBlob(function (blob) {
    if (navigator.share && navigator.canShare) {
      var file = new File([blob], "seesaw-result.png", { type: "image/png" });
      var shareData = {
        files: [file],
        title: "시소 밸런스",
        text: getShareText() + GAME_URL,
      };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData).catch(function () {
          downloadImage(blob);
        });
        return;
      }
    }
    downloadImage(blob);
  }, "image/png");
}

function downloadImage(blob) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "seesaw-result.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// SNS Share Functions

function shareToX() {
  var text = encodeURIComponent(getShareText() + GAME_URL);
  window.open("https://x.com/intent/tweet?text=" + text, "_blank", "width=550,height=420");
  showShareToast("X에 공유 창이 열렸습니다");
}

function shareToFacebook() {
  var url = encodeURIComponent(GAME_URL);
  window.open("https://www.facebook.com/sharer/sharer.php?u=" + url, "_blank", "width=550,height=420");
  showShareToast("Facebook 공유 창이 열렸습니다");
}

function shareToKakao() {
  // Kakao SDK가 없으므로 카카오톡 공유 URL scheme 또는 클립보드 복사 후 안내
  var text = getShareText() + GAME_URL;
  copyToClipboard(text);
  showShareToast("결과가 복사되었습니다! 카카오톡에 붙여넣기 하세요");
}

function shareCopyLink() {
  var text = getShareText() + GAME_URL;
  copyToClipboard(text);
  showShareToast("결과가 클립보드에 복사되었습니다!");
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

function showShareToast(msg) {
  var el = document.getElementById("share-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(function () {
    el.classList.remove("show");
  }, 2500);
}
