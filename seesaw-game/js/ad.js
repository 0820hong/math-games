// Kakao AdFit ad management

var AD_CONFIG = {
  adfit: {
    start: { id: "DAN-jZkGd28zSj11ylZ7", width: 320, height: 250 },
    result: { id: "DAN-K0fBYcdIjmGCOzU5", width: 300, height: 250 },
    pcVertical: { id: "DAN-tXRGw9UH5gdCKD9G", width: 160, height: 600 },
    mobileStrip: { id: "DAN-TBmlamJAGPcLtFlO", width: 320, height: 50 },
  },
};

function refreshAd(containerClass) {
  var container = document.querySelector("." + containerClass);
  if (!container) return;

  var config = null;
  if (containerClass === "ad-start") config = AD_CONFIG.adfit.start;
  if (containerClass === "ad-result") config = AD_CONFIG.adfit.result;
  if (containerClass === "ad-pc-vertical") config = AD_CONFIG.adfit.pcVertical;
  if (containerClass === "ad-mobile-strip") config = AD_CONFIG.adfit.mobileStrip;
  if (!config) return;

  container.innerHTML = "";
  var ins = document.createElement("ins");
  ins.className = "kakao_ad_area";
  ins.style.display = "none";
  ins.setAttribute("data-ad-unit", config.id);
  ins.setAttribute("data-ad-width", config.width);
  ins.setAttribute("data-ad-height", config.height);
  container.appendChild(ins);

  if (window.adfit) {
    window.adfit(ins);
  }
}

function refreshScreenAds(screenName) {
  if (screenName === "start") refreshAd("ad-start");
  if (screenName === "result") refreshAd("ad-result");
}

// PC 세로 / 모바일 띠 광고는 화면 전환과 무관하게 1회 초기화
function initPersistentAds() {
  refreshAd("ad-pc-vertical");
  refreshAd("ad-mobile-strip");
}

// 페이지 로드 시 상시 광고 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPersistentAds);
} else {
  initPersistentAds();
}
