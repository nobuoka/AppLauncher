/*
applauncher.onFirefoxLoad = function(event) {
	document.getElementById("contentAreaContextMenu")
	        .addEventListener("popupshowing", function (e){ applauncher.showFirefoxContextMenu(e); }, false);
};

applauncher.showFirefoxContextMenu = function(event) {
	// show or hide the menuitem based on what the context menu is on
	document.getElementById("context-applauncher").hidden = gContextMenu.onImage;
};

window.addEventListener("load", applauncher.onFirefoxLoad, false);
*/
window.addEventListener( "load", function() { info.vividcode.applauncher.initializeContextMenu(); }, false );
