// Kakao AdFit ad management

var AD_CONFIG = {
  units: {
    start: { id: "DAN-XXXXXXXXXX", width: 320, height: 100 },
    result: { id: "DAN-YYYYYYYYYY", width: 300, height: 250 },
  },
};

function refreshAd(containerClass) {
  var container = document.querySelector("." + containerClass);
  if (!container) return;

  var config = null;
  if (containerClass === "ad-start") config = AD_CONFIG.units.start;
  if (containerClass === "ad-result") config = AD_CONFIG.units.result;
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
