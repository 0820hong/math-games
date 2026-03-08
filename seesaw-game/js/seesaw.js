// Seesaw visualization

function updateSeesaw(leftSum, rightSum) {
  var bar = document.getElementById("seesaw-bar");
  var indicator = document.getElementById("seesaw-indicator");

  var diff = leftSum - rightSum;
  // Max tilt: 15 degrees
  var maxTilt = 15;
  var tilt = Math.max(-maxTilt, Math.min(maxTilt, diff * 2));

  bar.style.transform = "rotate(" + tilt + "deg)";

  if (leftSum > 0 && rightSum > 0 && leftSum === rightSum) {
    bar.classList.add("balanced");
    if (indicator) indicator.textContent = "= 균형!";
    if (indicator) indicator.className = "seesaw-indicator balanced";
  } else {
    bar.classList.remove("balanced");
    if (leftSum === 0 && rightSum === 0) {
      if (indicator) indicator.textContent = "숫자를 선택하세요";
      if (indicator) indicator.className = "seesaw-indicator";
    } else {
      var diffVal = Math.abs(diff);
      if (indicator) indicator.textContent = "차이: " + diffVal;
      if (indicator) indicator.className = "seesaw-indicator";
    }
  }
}

function animateBalance() {
  var bar = document.getElementById("seesaw-bar");
  bar.classList.add("balanced-flash");
  setTimeout(function () {
    bar.classList.remove("balanced-flash");
  }, 500);
}

function animateSeesawShake() {
  var bar = document.getElementById("seesaw-bar");
  bar.classList.add("seesaw-shake");
  setTimeout(function () {
    bar.classList.remove("seesaw-shake");
  }, 400);
}
