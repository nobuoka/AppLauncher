// coding : utf-8 (これは UTF-8 の文書です)
info.vividcode.applauncher.onLoad = function( evt ) {
	info.vividcode.applauncher.initializeContextMenu();
}
info.vividcode.applauncher.onUnload = function( evt ) {
	info.vividcode.applauncher.cleanupContextMenu();
	window.removeEventListener( "load",   info.vividcode.applauncher.onLoad,   false );
	window.removeEventListener( "unload", info.vividcode.applauncher.onUnload, false );
}
window.addEventListener( "load",   info.vividcode.applauncher.onLoad,   false );
window.addEventListener( "unload", info.vividcode.applauncher.onUnload, false );
