///<reference path="..\..\_resource_interface\prefs_change_events.d.ts" />
///<reference path=".\applauncher.ts" />

declare var Components;

(function () {
var m: {
    prefsChangeEventFactory: applauncher.resource.IPrefsChangeEventFactory;
} = {
    prefsChangeEventFactory: null,
};
Components.utils.import("resource://applauncher/prefs_change_events.js", m);

var prefsChangeEventObserver = m.prefsChangeEventFactory.createPrefsChangeEventObserver("AppInfo", () => {
    applauncher.initializeContextMenu();
});

window.addEventListener("load", function el(evt) {
    if (document !== evt.target) return;
    window.removeEventListener("load", el, false);

    applauncher.initializeContextMenu();
    prefsChangeEventObserver.start();
}, false );

window.addEventListener("unload", function el(evt) {
    if (document !== evt.target) return;
    window.removeEventListener("unload", el, false);

    applauncher.cleanupContextMenu();
    prefsChangeEventObserver.stop();
}, false );

}).call(this);
