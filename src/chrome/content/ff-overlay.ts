///<reference path="..\..\_resource_interface\prefs_change_events.d.ts" />
///<reference path=".\applauncher.ts" />

(function () {
var alContextMenu: applauncher.control.AppLauncherContextMenu;

window.addEventListener("load", function el(evt) {
    if (document !== evt.target) return;
    window.removeEventListener("load", el, false);

    var menuElem = document.getElementById("info.vividcode.applauncher.contextmenu");
    alContextMenu = new applauncher.control.AppLauncherContextMenu(menuElem);
}, false );

window.addEventListener("unload", function el(evt) {
    if (document !== evt.target) return;
    window.removeEventListener("unload", el, false);

    alContextMenu.destroy();
}, false );

}).call(this);
