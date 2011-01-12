// coding: utf-8 (これは UTF-8 の文書です)

// global variable [applauncher] is a namespace object of this package

(function() { // begin the scope of the variables in this file

/**
 * Load Event Listener.
 */
var onLoad = function( evt ) {
	applauncher.initializeContextMenu();
}

/**
 * Unload Event Listener.
 */
var onUnload = function( evt ) {
	applauncher.cleanupContextMenu();
	window.removeEventListener( "load",   onLoad,   false );
	window.removeEventListener( "unload", onUnload, false );
}

// add event listener
window.addEventListener( "load",   onLoad,   false );
window.addEventListener( "unload", onUnload, false );

})(); // end the scope of the variables in this file
