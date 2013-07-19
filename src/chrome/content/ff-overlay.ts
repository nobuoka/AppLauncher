///<reference path=".\applauncher.ts" />

window.addEventListener("load", function el(evt) {
    if (document !== evt.target) return;
    window.removeEventListener("load", el, false);

    applauncher.initializeContextMenu();
}, false );

window.addEventListener("unload", function el(evt) {
    if (document !== evt.target) return;
    window.removeEventListener("unload", el, false);

    applauncher.cleanupContextMenu();
}, false );
