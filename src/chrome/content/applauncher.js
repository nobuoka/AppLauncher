if( ! window.info ) { var info = {}; }
if( ! info.vividcode ) { info.vividcode = {}; }
if( ! info.vividcode.applauncher ) { info.vividcode.applauncher = {}; }

info.vividcode.applauncher.AppInfo = function( name, path, args ) {
	var al = info.vividcode.applauncher;
	this.name = name;
	this.path = path;
	this.args = args;
	// 設定画面用の要素
	this.elemForPrefsWindow = document.createElementNS( al.XUL_NS, "listitem" );
	this.elemForPrefsWindow.elName = document.createElementNS(al.XUL_NS, "listcell");
	this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elName ).setAttribute( "label", this.name );
	this.elemForPrefsWindow.elPath = document.createElementNS(al.XUL_NS, "listcell");
	this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elPath ).setAttribute( "label", this.path );
	this.elemForPrefsWindow.elArgs = document.createElementNS(al.XUL_NS, "listcell");
	this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elArgs ).setAttribute( "label", this.args.join(", ") );
	this.elemForPrefsWindow.appInfo = this;
};
info.vividcode.applauncher.AppInfo.prototype.setName = function( name ) {
	this.name = name;
	this.elemForPrefsWindow.elName.setAttribute( "label", this.name );
};
info.vividcode.applauncher.AppInfo.prototype.setPath = function( path ) {
	this.path = path;
	this.elemForPrefsWindow.elPath.setAttribute( "label", this.path );
};
info.vividcode.applauncher.AppInfo.prototype.setArgs = function( args ) {
	this.args = args;
	this.elemForPrefsWindow.elArgs.setAttribute( "label", this.args.join(", ") );
};


info.vividcode.applauncher.XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";


/**
 * 現在表示中のページの URL を返す関数.
 */
info.vividcode.applauncher.getCurrentPageURL = function( popupNode ) {
	// アクティブなウィンドウの取得
	// cf. https://developer.mozilla.org/Ja/Code_snippets/Tabbed_browser
	/*
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
	var recentWindow = wm.getMostRecentWindow("navigator:browser");
	return (recentWindow ? recentWindow.content.document.location.href : null);
	*/
	// ブラウザウィンドウ領域からなら以下で OK.
	return content.location.href;
};
info.vividcode.applauncher.getImageURL = function( popupNode ) {
	var al = info.vividcode.applauncher;
	// turi の設定
	// turi は右クリックのリンク先 URI. 右クリックしたのがリンク要素じゃなければそのページの URI
	var imageurl = null;
	var targetNode = popupNode;
	// 追加
	while ( targetNode != null && targetNode.nodeName.toUpperCase() != "IMG" ) {
		targetNode = targetNode.parentNode;
	}
	if( targetNode != null && targetNode.nodeName.toUpperCase() == "IMG" ) {
		imageurl = targetNode.src;
	} else {
		// when the img element is not found
		throw new Error( al.locale.errorMsg.IMG_ELEM_NOT_FOUND );
	}
	// imageurl には URI エンコードされた文字列が入っている
	imageurl = decodeURIComponent(imageurl)
	return imageurl;
};
info.vividcode.applauncher.getCurrentPageTURL = function( popupNode ) {
	var al = info.vividcode.applauncher;
	// turi の設定
	// turi は右クリックのリンク先 URI. 右クリックしたのがリンク要素じゃなければそのページの URI
	var turi = null;
	var targetNode = popupNode;
	while ( targetNode != null && targetNode.nodeName.toUpperCase() != "A" ) {
		targetNode = targetNode.parentNode;
	}
	if ( targetNode != null && targetNode.nodeName.toUpperCase() == "A" ) {
		turi = targetNode.href;
	} else {
		turi = al.getCurrentPageURL();
	}
	return turi;
};
/**
 * 現在表示中のページのタイトルを返す関数.
 */
info.vividcode.applauncher.getCurrentPageTitle = function( popupNode ) {
	// アクティブなウィンドウの取得
	// cf. https://developer.mozilla.org/Ja/Code_snippets/Tabbed_browser
	/*
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
	var recentWindow = wm.getMostRecentWindow("navigator:browser");
	return (recentWindow ? recentWindow.content.document.location.href : null);
	*/
	// ブラウザウィンドウ領域からなら以下で OK.
	return content.document.title;
};

info.vividcode.applauncher.decodeEntityReference = function( str, popupNode ) {
	var al = info.vividcode.applauncher;
	var uri   = al.getCurrentPageURL( popupNode );
	var turi  = al.getCurrentPageTURL( popupNode );
	var title = al.getCurrentPageTitle( popupNode );
	var imageurl = null;
	return str.replace( /&[^&;]+;/g, function(substr) {
		if ( substr == "&amp;" ) { return "&"; }
		else if ( substr == "&lt;" ) { return "<"; }
		else if ( substr == "&gt;" ) { return ">"; }
		else if ( substr == "&quot;" ) { return "\""; }
		else if ( substr == "&apos;" ) { return "'"; }
		else if ( substr == "&url;" )  { return uri; }
		else if ( substr == "&eurl;" ) { return encodeURIComponent(uri); }
		else if ( substr == "&turl;" ) { return turi; }
		else if ( substr == "&eturl;" ) { return encodeURIComponent(turi); }
		else if ( substr == "&imageurl;" ) {
			if(! imageurl) { imageurl = al.getImageURL(popupNode) };
			return imageurl;
		} else if ( substr == "&eimageurl;" ) {
			if(! imageurl) { imageurl = al.getImageURL(popupNode) };
			return encodeURIComponent(imageurl);
		} else if ( substr == "&ImgFilePathWin;" ) {
			if(! imageurl) { imageurl = al.getImageURL(popupNode) };
			if( imageurl.match(/^file:\/\/\//) ) {
				return imageurl.replace( /^file:\/\/\//, "" ).replace( /\//g, "\\" );
			} else {
				throw new Error( al.locale.errorMsg.IMG_FILE_ISNT_LOCAL_FILE );
			}
		} else if ( substr == "&title;" ) { return title; }
		else if ( substr == "&etitle;" ) { return encodeURIComponent(title); }
	} );
};

/**
 * 外部アプリケーションを起動する関数
 */
info.vividcode.applauncher.launchOuterApplication = function( targetElem ) {
	var al = info.vividcode.applauncher;
	var appInfo = targetElem.appInfo;
	// popupNode の取得: 前者は Fx3.6 以前用, 後者は Fx4.0 以降用 (Fx4.0 以降でも前者で OK の模様)
	//window.alert( "popupNode: " + document.popupNode + ", triggerNode: " + targetElem.parentNode.parentNode.parentNode.triggerNode );
	var popupNode = document.popupNode || targetElem.parentNode.parentNode.parentNode.triggerNode;
	try {
		var path = appInfo.path;
		var argsSource = appInfo.args;
		// 設定値の取得
		//var path = AppLauncher.getPref("path");
		var argsList = "";
		var args = new Array();
		for( var i = 0; i < argsSource.length; i++ ) {
			// 文字コード変換とエンティティリファレンスのデコード
			var uc = Components.classes['@mozilla.org/intl/scriptableunicodeconverter']
						.getService( Components.interfaces.nsIScriptableUnicodeConverter );
			// <<shift_jis|てあててあた>>
			var str = argsSource[i];
			var match = null;
			var array = [];
			while( match = /^(.+)?<<((?:(?!\|).(?!>>|<<))+)\|((?:(?!>>).)+)>>(.+)?$/.exec( str ) ) {
				//window.alert( "charset: " + match[2] + ", body: " + match[3] + "\npre: " + match[1] + "\npost: " + match[2] );
				// match[1] はマッチしたところより前の部分. 最長マッチにより "<<charset|body>>" が含まれる
				// match[2] は charset
				// match[3] は body
				// match[4] はマッチしたところより後ろの部分.
				array.unshift( al.decodeEntityReference( match[4] || '', popupNode ) );
				// 文字コード変換
				try {
					uc.charset = match[2];
				} catch( err ) {
					throw new Error( al.locale.errorMsg.ENCODING_NOT_SUPPORTED + match[2] );
				}
				var tmp = al.decodeEntityReference( match[3], popupNode );
				array.unshift( uc.ConvertFromUnicode(tmp) + uc.Finish() );
				str = match[1] || '';
			}
			array.unshift( al.decodeEntityReference( str, popupNode ) );
			args.push( array.join('') );
		}
		
		// cf.https://developer.mozilla.org/ja/Code_snippets/Running_applications
		// 実行可能ファイルに対する nsILocalFile を作成する
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance( Components.interfaces.nsILocalFile );
		file.initWithPath( path );
		if( ! file.exists() ) {
			throw new Error( al.locale.errorMsg.FILE_NOT_EXISTS + path );
		}
		// nsIProcess を作成してプロセスを起動する
		var process = Components.classes["@mozilla.org/process/util;1"].createInstance( Components.interfaces.nsIProcess );
		process.init( file );
		process.run( false, args, args.length ); // プロセスの起動 (最初のパラメータが true なら、スレッドはプロセスが終わるまでブロックされる)
	} catch(e) {
		window.alert( "[AppLauncher error message]\n" + e.message );
	}
};

info.vividcode.applauncher.onCmdToLaunchApp = function( evt ) {
	try {
		info.vividcode.applauncher.launchOuterApplication( evt.currentTarget );
	} catch(e) {
		window.alert(e);
	}
};
info.vividcode.applauncher.createContextMenuItem = function( appInfo ) {
	var al = info.vividcode.applauncher;
	// "menuitem" 要素の作成
	var item = document.createElementNS( al.XUL_NS, "menuitem" );
	item.setAttribute( "label", appInfo.name );
	// イベントリスナの追加
	item.appInfo  = appInfo;
	item.addEventListener( "command", al.onCmdToLaunchApp, false );
	return item;
};
info.vividcode.applauncher.destroyContextMenuItem = function( item ) {
	var al = info.vividcode.applauncher;
	item.appInfo  = null;
	item.removeEventListener( "command", al.onCmdToLaunchApp, false );
};
info.vividcode.applauncher.onCmdToOpenPrefWindow = function( evt ) {
	// 設定ウィンドウを表示
	window.open( "chrome://applauncher/content/options.xul", "applauncherprefs", "chrome,dialog,resizable=yes" ); 
}
/**
 * コンテキストメニューの初期化を行う関数
 */
info.vividcode.applauncher.initializeContextMenu = function() {
	try {
		var al = info.vividcode.applauncher;
		// 設定の読み込み
		var appInfoList = al.prefs.loadAppInfoList();
		// コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
		var menupopup = document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
		if( menupopup ) {
			// もともとある要素を削除
			while( menupopup.hasChildNodes() ) {
				menupopup.removeChild( menupopup.firstChild );
			}
			// 要素を追加
			if( appInfoList != null && appInfoList.length != 0 ) {
				for( var i = 0; i < appInfoList.length; i++ ) {
					menupopup.appendChild( al.createContextMenuItem(appInfoList[i]) );
				}
			} else {
				// 設定項目が存在しないときのメッセージを追加
				var item = document.createElementNS( al.XUL_NS, "menuitem" );
				item.setAttribute( "label", al.locale.contextMenu.NON_PREF_MSG );
				menupopup.appendChild(item);
			}
			// "menuseparator" 要素を追加
			menupopup.appendChild( document.createElementNS( al.XUL_NS, "menuseparator" ) );
			// 設定画面を起動する要素を追加
			// "menuitem" 要素の作成
			var item = document.createElementNS( al.XUL_NS, "menuitem" );
			item.setAttribute( "label", al.locale.contextMenu.PREFERENCES );
			item.addEventListener( "command", al.onCmdToOpenPrefWindow, false );
			// "menupopup" 要素の子ノードに追加
			menupopup.appendChild(item);
		}
	} catch(e) {
		window.alert(e);
	}
};

/**
 * 全ての ChromeWindow のコンテキストメニュー内にある AppLauncher に関する項目を初期化する
 */
info.vividcode.applauncher.initializeContextMenuInAllWindow = function() {
	try {
		// 全ての ChromeWindow に対して処理を行う
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var type = null;
		var enumerator = wm.getEnumerator(type);
		while( enumerator.hasMoreElements() ) {
			var win = enumerator.getNext();
			// |win| は [Object ChromeWindow] である(|window| と同等)。これに何かをする
			// コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
			var menupopup = win.document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
			if( menupopup ) {
				win.info.vividcode.applauncher.initializeContextMenu();
			}
		}
	} catch(e) {
		window.alert(e);
	}
}

info.vividcode.applauncher.cleanupContextMenu = function() {
	try {
		var al = info.vividcode.applauncher;
		// コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
		var menupopup = document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
		if( menupopup ) {
			var items = menupopup.getElementsByTagNameNS( al.XUL_NS, "menuitem" );
			for( var i = 0; i < items.length - 1; i++ ) {
				al.destroyContextMenuItem( items.item(i) );
			}
		}
	} catch(e) {
		window.alert(e);
	}
};

// 設定関係
info.vividcode.applauncher.prefs = {};

/** 設定を表示している listbox 要素の id */
info.vividcode.applauncher.prefs.BRANCH_STRING = "extensions.applauncher."
info.vividcode.applauncher.prefs.PREFS_BOX_ID  = "info.vividcode.ext.applauncher.prefwindow.listbox";
/** AppLauncher の設定保存用 XML が使用する名前空間 */
info.vividcode.applauncher.prefs.PREFS_NS      = "http://www.vividcode.info/firefox_addon/myextensions/applauncher/";

info.vividcode.applauncher.prefs.loadAppInfoList = function() {
	var al = info.vividcode.applauncher;
	// 以前の設定を DOM として取得
	var parser  = new DOMParser();
	var prefStr = al.prefs.getPref("appList");
	// 初めて起動する場合, prefStr は undefined になっている
	if( ! prefStr ) {
		prefStr = "<appList ver=\"2\" xmlns=\"http://www.vividcode.info/firefox_addon/myextensions/applauncher/\" />";
	}
	var appList = parser.parseFromString( prefStr, "text/xml" );
	var version = appList.documentElement.getAttribute("ver");
	if( version == null ) {
		return al.prefs._loadAppPrefsVer1( appList );
	} else if( version == "2" ) {
		return al.prefs._loadAppPrefsVer2( appList );
	}
};

info.vividcode.applauncher.prefs._loadAppPrefsVer1 = function( aPrefElem ) {
	var al = info.vividcode.applauncher;
	var items = aPrefElem.getElementsByTagNameNS( al.prefs.PREFS_NS, "app" );
	var appInfoList = new Array();
	for( var i = 0; i < items.length; i++ ) {
		var name = items[i].getAttribute("name");
		var path = items[i].getAttribute("path");
		var args = items[i].getAttribute("args").split("<>");
		appInfoList.push( new al.AppInfo( name, path, args ) );
	}
	return appInfoList;
};
info.vividcode.applauncher.prefs._loadAppPrefsVer2 = function( aPrefElem ) {
	var al = info.vividcode.applauncher;
	var items = aPrefElem.getElementsByTagNameNS( al.prefs.PREFS_NS, "app" );
	var appInfoList = new Array();
	for( var i = 0; i < items.length; i++ ) {
		var name = items[i].getElementsByTagNameNS( al.prefs.PREFS_NS, "name" ).item(0).textContent;
		var path = items[i].getElementsByTagNameNS( al.prefs.PREFS_NS, "path" ).item(0).textContent;
		var args = new Array();
		var elems = items[i].getElementsByTagNameNS( al.prefs.PREFS_NS, "arg" );
		for( var j = 0; j < elems.length; j++ ) {
			args.push( elems[j].textContent );
		}
		appInfoList.push( new al.AppInfo( name, path, args ) );
	}
	return appInfoList;
};

info.vividcode.applauncher.prefs.saveAppInfoList = function( aAppInfoList ) {
	var al = info.vividcode.applauncher;
	// 保存用の XML Document を新たに生成
	var prefNode  = document.implementation.createDocument( al.prefs.PREFS_NS, "appList", null );
	prefNode.documentElement.setAttribute( "ver", "2" );
	// 保存用 XML に値を追加していく
	for( var i = 0; i < aAppInfoList.length; i++ ) {
		var app = document.createElementNS( al.prefs.PREFS_NS, "app" );
		app.appendChild( document.createElementNS(al.prefs.PREFS_NS, "name") ).textContent = aAppInfoList[i].name;
		app.appendChild( document.createElementNS(al.prefs.PREFS_NS, "path") ).textContent = aAppInfoList[i].path;
		var args = app.appendChild( document.createElementNS(al.prefs.PREFS_NS, "args") );
		for( var j = 0; j < aAppInfoList[i].args.length; j++ ) {
			args.appendChild( document.createElementNS(al.prefs.PREFS_NS, "arg") ).textContent = aAppInfoList[i].args[j];
		}
		prefNode.documentElement.appendChild(app);
	}
	// DOM を XML 文にして保存
	// cf. https://developer.mozilla.org/ja/XMLSerializer
	var prefStr = new XMLSerializer().serializeToString(prefNode);
	al.prefs.setCharPref("appList", prefStr);
};

/**
 * Preference 情報を取得する関数 (設定の情報)
 * @param prefString 取得するキー
 */
// cf.https://developer.mozilla.org/Ja/Code_snippets/Preferences
info.vividcode.applauncher.prefs.getPref = function( prefName ) {
	var al = info.vividcode.applauncher;
	// 設定の情報を取得する XPCOM オブジェクトの生成
	var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefBranch = prefSvc.getBranch( al.prefs.BRANCH_STRING );
	// タイプ別に取得する関数を分ける
	switch( prefBranch.getPrefType(prefName) ) {
		// 設定値が文字の場合
		case Components.interfaces.nsIPrefBranch.PREF_STRING:
			return decodeURIComponent(escape( prefBranch.getCharPref(prefName) ));
			break;
		// 設定値が数値の場合
		case Components.interfaces.nsIPrefBranch.PREF_INT:
			return prefBranch.getIntPref(prefName);
			break;
		// 設定値が真偽値の場合
		case Components.interfaces.nsIPrefBranch.PREF_BOOL:
			return prefBranch.getBoolPref(prefName);
			break;
	}
};
/**
 * Preference 情報を取得する関数 (設定の情報)
 * @param prefString 取得するキー
 */
// cf.https://developer.mozilla.org/Ja/Code_snippets/Preferences
info.vividcode.applauncher.prefs.setCharPref = function( prefName, prefValue ) {
	var al = info.vividcode.applauncher;
	// 設定の情報を取得する XPCOM オブジェクトの生成
	var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefBranch = prefSvc.getBranch( al.prefs.BRANCH_STRING );
	prefBranch.setCharPref( prefName, unescape(encodeURIComponent(prefValue)) );
};
