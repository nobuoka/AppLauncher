interface Window {
    arguments: any[];
    moveToAlertPosition(): void;
}

// 初期化関数をロード時に実行する
(function () {
    //var manager = new info.vividcode.ext.applauncher.PrefsManager();
    var init = function () {
        try {
            var dialogArg = window.arguments[0];
            var dialogElem = document.documentElement;
            dialogElem.setAttribute("title", dialogArg.title);
            var labelElem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
            dialogElem.appendChild(labelElem);
            labelElem.setAttribute("value", dialogArg.message);
            window.moveToAlertPosition();
        } catch (e) {
            window.alert(e);
        }
    };
    window.addEventListener("dialogaccept", function () {
        window.arguments[0].returnValue = true;
    }, false);
    window.addEventListener("dialogcancel", function () {
        window.arguments[0].returnValue = false;
    }, false);
    window.addEventListener("load", function () { init(); }, false);
}).call(this);
