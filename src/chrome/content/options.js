//info.vividcode.applauncher.prefs = {};

/**
 * 選択されている項目を取得する
 */
info.vividcode.applauncher.prefs.getSelectedAppInfo = function() {
	var al = info.vividcode.applauncher;
	var listbox = document.getElementById( al.prefs.PREFS_BOX_ID );
	var items = listbox.selectedItems;
	// 選択項目が無い
	if( items.length == 0 ) {
		//throw new Error("選択されている項目がありません. 項目を選択してください.");
		throw new Error( al.locale.prefs.errorMsg.NO_SELECTED_ITEM );
	}
	// 2 つ以上選択されている
	else if( items.length > 1 ) {
		//throw new Error("2 つ以上のアイテムが選択されています. 1 つだけ選択するようにしてください.");
		throw new Error( al.locale.prefs.errorMsg.TOO_MUCH_SELECTED_ITEM );
	}
	return items[0].appInfo;
};

info.vividcode.applauncher.prefs.onCmdAdd = function( evt ) {
	try {
		var al = info.vividcode.applauncher;
		// inn は項目. out は正常に終了したか否か
		var appInfo = new al.AppInfo( "", "", new Array() );
		var params = { inn: appInfo, out: null };
		window.openDialog( "chrome://applauncher/content/options_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
		if( params.out ) {
			// 設定画面に追加
			document.getElementById( al.prefs.PREFS_BOX_ID ).appendChild( appInfo.elemForPrefsWindow );
		}
	} catch(e) {
		window.alert(e);
	}
};
info.vividcode.applauncher.prefs.onCmdDel = function( evt ) {
	try {
		var al = info.vividcode.applauncher;
		var item = al.prefs.getSelectedAppInfo().elemForPrefsWindow;
		// 削除していいですか？ というメッセージ
		var params = { title: al.locale.prefs.confMsg.DEL_CONF_TITLE, message: al.locale.prefs.confMsg.DEL_CONF_MSG, returnValue: null };
		window.openDialog( "chrome://applauncher/content/custom_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
		if( params.returnValue ) {
			item.parentNode.removeChild( item );
		}
	} catch(e) {
		window.alert(e);
	}
};
info.vividcode.applauncher.prefs.onCmdMvu = function( evt ) {
	try {
		var al = info.vividcode.applauncher;
		var item = al.prefs.getSelectedAppInfo().elemForPrefsWindow;
		if( item.previousSibling != null && item.previousSibling.nodeName == "listitem" ) {
			item.parentNode.insertBefore(item, item.previousSibling);
			item.parentNode.selectedItem = item;
		}
	} catch(e) {
		window.alert(e);
	}
};
info.vividcode.applauncher.prefs.onCmdMvd = function( evt ) {
	try {
		var al = info.vividcode.applauncher;
		var item = al.prefs.getSelectedAppInfo().elemForPrefsWindow;
		if( item.nextSibling != null && item.nextSibling.nodeName == "listitem" ) {
			item.parentNode.insertBefore(item.nextSibling, item);
		}
	} catch(e) {
		window.alert(e);
	}
};
info.vividcode.applauncher.prefs.onCmdEdt = function( evt ) {
	try {
		var al = info.vividcode.applauncher;
		var item = al.prefs.getSelectedAppInfo();
		var params = { inn: item, out: null };
		window.openDialog( "chrome://applauncher/content/options_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
	} catch(e) {
		window.alert(e);
	}
};


info.vividcode.applauncher.prefs.onCmdSaveAndExit = function(evt) {
	try {
		var al = info.vividcode.applauncher;
		al.prefs.saveFromPrefsWindow();
	} catch(e) {
		window.alert(e);
	}
};
info.vividcode.applauncher.prefs.onCmdNonSaveAndExit = function(evt) {
	try {
		var al = info.vividcode.applauncher;
		var params = {title: al.locale.prefs.confMsg.NOTSAVE_CONF_TITLE, message: al.locale.prefs.confMsg.NOTSAVE_CONF_MSG, returnValue: null};
		window.openDialog("chrome://applauncher/content/custom_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params).focus();
		if( ! params.returnValue ) {
			evt.preventDefault();
		}
	} catch(e) {
		window.alert(e);
	}
};

/**
 * 初期化を行う
 */
info.vividcode.applauncher.prefs.initializePrefsWindow = function() {
	try {
		var al = info.vividcode.applauncher;
		al.prefs.loadToPrefsWindow();
		// Event Listener の追加
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.edt").addEventListener("command", al.prefs.onCmdEdt, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.del").addEventListener("command", al.prefs.onCmdDel, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvu").addEventListener("command", al.prefs.onCmdMvu, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvd").addEventListener("command", al.prefs.onCmdMvd, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.add").addEventListener("command", al.prefs.onCmdAdd, false);
		window.addEventListener( "dialogaccept", al.prefs.onCmdSaveAndExit,    false );
		window.addEventListener( "dialogcancel", al.prefs.onCmdNonSaveAndExit, false );
	} catch(e) {
		window.alert(e);
	}
};
/**
 * 終了処理を行う
 */
info.vividcode.applauncher.prefs.cleanupPrefsWindow = function() {
	try {
		var al = info.vividcode.applauncher;
		// Event Listener の追加
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.edt").removeEventListener("command", al.prefs.onCmdEdt, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.del").removeEventListener("command", al.prefs.onCmdDel, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvu").removeEventListener("command", al.prefs.onCmdMvu, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvd").removeEventListener("command", al.prefs.onCmdMvd, false);
		document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.add").removeEventListener("command", al.prefs.onCmdAdd, false);
		window.removeEventListener( "dialogaccept", al.prefs.onCmdSaveAndExit, false );
		window.removeEventListener( "dialogcancel", al.prefs.onCmdNonSaveAndExit, false );
	} catch(e) {
		window.alert(e);
	}
};

/**
 * 設定を取得し, 保存する
 */
info.vividcode.applauncher.prefs.saveFromPrefsWindow = function() {
	try {
		var al = info.vividcode.applauncher;
		var appInfoList = new Array();
		// 設定画面の要素を取得
		var elems = document.getElementById( al.prefs.PREFS_BOX_ID ).getElementsByTagNameNS( al.XUL_NS, "listitem" );
		for( var i = 0; i < elems.length; i++ ) {
			appInfoList.push( elems.item(i).appInfo );
		}
		al.prefs.saveAppInfoList( appInfoList );
		// コンテキストメニューを初期化する
		al.initializeContextMenuInAllWindow();
	} catch(e) {
		window.alert(e);
	}
};

/**
 * ユーザの設定画面に以前の設定を読み出す.
 */
info.vividcode.applauncher.prefs.loadToPrefsWindow = function() {
	try {
		var al = info.vividcode.applauncher;
		var appInfoList = al.prefs.loadAppInfoList();
		// 設定画面の要素を取得
		var listbox = document.getElementById( al.prefs.PREFS_BOX_ID );
		// 設定画面に要素を追加していく
		for( var i = 0; i < appInfoList.length; i++ ) {
			listbox.appendChild( appInfoList[i].elemForPrefsWindow );
		}
	} catch(e) {
		window.alert(e);
	}
};

info.vividcode.applauncher.prefs.onLoad   = function(evt) {
	info.vividcode.applauncher.prefs.initializePrefsWindow();
};
info.vividcode.applauncher.prefs.onUnload = function(evt) {
	info.vividcode.applauncher.prefs.cleanupPrefsWindow();
	window.removeEventListener( "load",   info.vividcode.applauncher.prefs.onLoad,   false );
	window.removeEventListener( "unload", info.vividcode.applauncher.prefs.onUnload, false );
};
window.addEventListener( "load",   info.vividcode.applauncher.prefs.onLoad,   false );
window.addEventListener( "unload", info.vividcode.applauncher.prefs.onUnload, false );
