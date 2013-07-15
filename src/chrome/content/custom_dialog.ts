interface Window {
    arguments: any[];
    moveToAlertPosition();
}

try {
  // 初期化関数をロード時に実行する
  (function() {
      //var manager = new info.vividcode.ext.applauncher.PrefsManager();
      var init = function() {
          try {
              document.documentElement.setAttribute("title", window.arguments[0].title);
              (<any>document.documentElement.appendChild(
                  document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label") )).
                      setAttribute("value", window.arguments[0].message);
              window.moveToAlertPosition();
          } catch(e) {
              window.alert(e);
          }
      };
      window.addEventListener("dialogaccept", function() {
          window.arguments[0].returnValue = true;
      }, false);
      window.addEventListener("dialogcancel", function() {
          window.arguments[0].returnValue = false;
      }, false);
      window.addEventListener("load", function() { init(); }, false);
  }).call(this);
} catch(e) {
  window.alert(e);
}
