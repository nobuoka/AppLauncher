// coding: utf-8

declare var gBrowser;
declare var Components;
declare var content;
declare var escape;
declare var unescape;

interface Document {
    popupNode: any;
}

declare var DOMParser;
declare var XMLSerializer;

/** namespace object */
module applauncher {
    var Cc = Components.classes;
    var Ci = Components.interfaces;

    /** Namespace URI of XUL Elements */
    export var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    export var prefs: any;
    export declare var locale: any;

    export interface ElemForPrefsWindow extends Element {
        appInfo: AppInfo;
        elName: Element;
        elPath: Element;
        elArgs: Element;
        elOpenInFx: Element;
    }

    export interface IAppInfoOptions {
        openInFx: boolean;
    }

    export class AppInfo {
        public name: string;
        public path: string;
        public args: string[];
        public opts: IAppInfoOptions;
        public elemForPrefsWindow: ElemForPrefsWindow;

        /**
         * Constructor of an Object that store the data of an external application
         */
        constructor(name: string, path: string, args: string[], opts?: IAppInfoOptions) {
            var al = applauncher;
            this.name = name;
            this.path = path;
            this.args = args;
            if (!opts) opts = { openInFx: false };
            this.opts = opts;

            function createListcellElemWithLabel(labelValue: string): Element {
                var e = document.createElementNS(al.XUL_NS, "listcell");
                e.setAttribute("label", labelValue);
                return e;
            }

            // 設定画面用の要素 (I'd like to isolate these DOM operation from AppInfo class)
            this.elemForPrefsWindow = <ElemForPrefsWindow>document.createElementNS( al.XUL_NS, "listitem" );
            this.elemForPrefsWindow.elName = createListcellElemWithLabel(this.name);
            this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elName );
            this.elemForPrefsWindow.elPath = createListcellElemWithLabel(this.path);
            this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elPath );
            this.elemForPrefsWindow.elArgs = createListcellElemWithLabel(this.args.join(", "));
            this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elArgs );
            this.elemForPrefsWindow.elOpenInFx = createListcellElemWithLabel(opts.openInFx ? "enabled" : "disabled");
            this.elemForPrefsWindow.appendChild( this.elemForPrefsWindow.elOpenInFx );

            this.elemForPrefsWindow.appInfo = this;
        }

        /**
         * Set the name of the external application.
         */
        public setName(name: string) {
            this.name = name;
            this.elemForPrefsWindow.elName.setAttribute("label", this.name);
        }

        /**
         * Set the path to the external application.
         */
        public setPath(path: string) {
            this.path = path;
            this.elemForPrefsWindow.elPath.setAttribute("label", this.path);
        }

        /**
         * Set the arguments provided to the external application.
         */
        public setArgs(args: string[]) {
            this.args = args;
            this.elemForPrefsWindow.elArgs.setAttribute("label", this.args.join(", "));
        }

        public setOpenInFx(openInFx: boolean) {
            this.opts.openInFx = openInFx;
            this.elemForPrefsWindow.elOpenInFx.setAttribute("label", openInFx ? "enabled" : "disabled");
        }
    }

    /**
     * 現在表示中のページの URL を返す関数.
     */
    export function getCurrentPageURL( popupNode? ) {
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
    }

    export function getImageURL( popupNode ) {
        var al = applauncher;
        // turi の設定
        // turi は右クリックのリンク先 URI. 右クリックしたのがリンク要素じゃなければそのページの URI
        var imageurl = null;
        var targetNode = popupNode;
        // 追加
        while ( targetNode != null && targetNode.nodeName.toUpperCase() != "IMG" ) {
            targetNode = targetNode.parentNode;
        }
        if ( targetNode != null && targetNode.nodeName.toUpperCase() == "IMG" ) {
            imageurl = targetNode.src;
        } else {
            // when the img element is not found
            throw new Error( al.locale.errorMsg.IMG_ELEM_NOT_FOUND );
        }
        // imageurl には URI エンコードされた文字列が入っている
        imageurl = decodeURIComponent(imageurl)
        return imageurl;
    }

    export function getCurrentPageTURL( popupNode ) {
        var al = applauncher;
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
    }

    /**
     * get selected text
     */
    export function getSelectedText() {
        return (function getSelections( w ) {
            var s, fs, i, len, sel;
            sel = w.getSelection(); // w.getSelection() は null の可能性あり (?)
            s = ( sel === null ? "" : sel.toString() );
            fs = w.frames;
            for( i = 0, len = fs.length; i < len; i++ ) {
                s += getSelections( fs[i] );
            }
            return s;
        })( content );
    }

    /**
     * 現在表示中のページのタイトルを返す関数.
     */
    export function getCurrentPageTitle( popupNode ) {
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
    }

    /**
     * Decode the entity references in XML string.
     */
    export function decodeEntityReference( str, popupNode ) {
        var al = applauncher;
        var uri   = al.getCurrentPageURL( popupNode );
        var turi  = al.getCurrentPageTURL( popupNode );
        var title = al.getCurrentPageTitle( popupNode );
        var text  = al.getSelectedText();
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
            else if ( substr == "&text;" ) { return text; }
            else if ( substr == "&etext;" ) { return encodeURIComponent(text); }
        } );
    }

    function __runExecutableFile(file, args) {
        var al = applauncher;
        // if the user uses Mac OS and the target application is a bundle application,
        // get the execution file
        if ( navigator.platform.indexOf("Mac") != -1 ) {
            file.QueryInterface( Ci.nsILocalFileMac );
            if ( file.isPackage ) {
                file = al.getExecuteFileFromMacPackage( file );
            }
        }
        // create a nsIProcess object, and run the process
        var process = Cc["@mozilla.org/process/util;1"].createInstance( Ci.nsIProcess );
        process.init( file );
        process.run( false, args, args.length );
                // if the first arg is true, wait for the process ending
    }

    /**
     * Launch an outer application.
     * 外部アプリケーションを起動する関数
     */
    export function launchOuterApplication( targetElem ) {
        var al = applauncher;
        var appInfo = targetElem.appInfo;
        // popupNode の取得: 前者は Fx3.6 以前用, 後者は Fx4.0 以降用 (Fx4.0 以降でも前者で OK の模様)
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

            var file;
            if (path.substring(0,1) === ".") {
                // if path starts with ".", it is treated as relative uri from
                // current working directory
                var directoryService = Cc["@mozilla.org/file/directory_service;1"].
                                       getService(Ci.nsIProperties);
                var curWorkDir = directoryService.get("CurWorkD", Ci.nsIFile);
                // conversion from file path to uri
                // cf. http://piro.sakura.ne.jp/xul/tips/x0011.html
                var ioService = Cc['@mozilla.org/network/io-service;1'].
                                getService(Ci.nsIIOService);
                var curWorkDirUri = ioService.newFileURI(curWorkDir);
                var pathUri = ioService.newURI(path, "UTF-8", curWorkDirUri);

                var fileHandler = ioService.getProtocolHandler("file").
                                  QueryInterface(Ci.nsIFileProtocolHandler);
                file = fileHandler.getFileFromURLSpec(pathUri.asciiSpec);
            } else {
                // create nsIFile object which represents file to be launched
                // cf. https://developer.mozilla.org/ja/Code_snippets/Running_applications
                file = Cc["@mozilla.org/file/local;1"].createInstance( Ci.nsIFile );
                file.initWithPath( path );
            }
            if( ! file.exists() ) {
                throw new Error( al.locale.errorMsg.FILE_NOT_EXISTS + file.path );
            }

            if (appInfo.opts && appInfo.opts.openInFx) {
                var ioService = Cc['@mozilla.org/network/io-service;1'].
                                getService(Ci.nsIIOService);
                var fileUri = ioService.newFileURI(file);
                var newTab = gBrowser.addTab(fileUri.asciiSpec);
                gBrowser.selectedTab = newTab;
            } else {
                __runExecutableFile(file, args);
            }
        } catch (e) {
            window.alert( "[AppLauncher error message]\n" + e.message );
        }
    }

    /**
     * Get the execution file path from a bundle application file. (for MacOS)
     * @see http://d.hatena.ne.jp/teramako/20110111/p1 (japanese)
     */
    export function getExecuteFileFromMacPackage( aFile ) {
        var infoPlistFile = aFile.clone().QueryInterface( Ci.nsIFile );
        infoPlistFile.appendRelativePath( "Contents/Info.plist" );
        var ifstream  = Cc["@mozilla.org/network/file-input-stream;1"].createInstance( Ci.nsIFileInputStream );
        var domparser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance( Ci.nsIDOMParser );
        ifstream.init( infoPlistFile, -1, 0, 0 );
        var doc = domparser.parseFromStream( ifstream, "UTF-8", infoPlistFile.fileSize, "application/xml" );
        ifstream.close();
        var keys = doc.getElementsByTagName( "key" );
        var exeFileName = "";
        for( var i = 0, key; key = keys[i]; i++ ){
            if( key.textContent == "CFBundleExecutable" ) {
                exeFileName = key.nextElementSibling.textContent;
                break;
            }
        }
        var exeFile = aFile.clone().QueryInterface( Ci.nsIFile );
        exeFile.appendRelativePath( "Contents/MacOS/" + exeFileName );
        return exeFile;
    }

    export function onCmdToLaunchApp( evt ) {
        try {
            applauncher.launchOuterApplication( evt.currentTarget );
        } catch (e) {
            window.alert(e);
        }
    }
    export function createContextMenuItem( appInfo ) {
        var al = applauncher;
        // "menuitem" 要素の作成
        var item = document.createElementNS( al.XUL_NS, "menuitem" );
        item.setAttribute( "label", appInfo.name );
        // イベントリスナの追加
        (<any>item).appInfo = appInfo;
        item.addEventListener( "command", al.onCmdToLaunchApp, false );
        return item;
    }
    export function destroyContextMenuItem( item ) {
        var al = applauncher;
        item.appInfo  = null;
        item.removeEventListener( "command", al.onCmdToLaunchApp, false );
    }
    export function onCmdToOpenPrefWindow( evt ) {
        // 設定ウィンドウを表示
        window.open( "chrome://applauncher/content/options.xul", "applauncherprefs", "chrome,dialog,resizable=yes" );
    }

    /**
     * Initialize an AppLauncher item in the context menu.
     * コンテキストメニューの初期化を行う関数
     */
    export function initializeContextMenu() {
        try {
            var al = applauncher;
            // 設定の読み込み
            var appInfoList = al.prefs.loadAppInfoList();
            // コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
            var menupopup = document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
            if ( menupopup ) {
                // もともとある要素を削除
                while ( menupopup.hasChildNodes() ) {
                    menupopup.removeChild( menupopup.firstChild );
                }
                // 要素を追加
                if ( appInfoList != null && appInfoList.length != 0 ) {
                    for (var i = 0; i < appInfoList.length; i++) {
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
        } catch (e) {
            window.alert(e);
        }
    }

    /**
     * Initialize AppLauncher items in context menus on all ChromeWindows.
     * 全ての ChromeWindow のコンテキストメニュー内にある AppLauncher に関する項目を初期化する
     */
    export function initializeContextMenuInAllWindow() {
        try {
            // 全ての ChromeWindow に対して処理を行う
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
            var type = null;
            var enumerator = wm.getEnumerator(type);
            while ( enumerator.hasMoreElements() ) {
                var win = enumerator.getNext();
                // |win| は [Object ChromeWindow] である(|window| と同等)。これに何かをする
                // コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
                var menupopup = win.document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
                if ( menupopup ) {
                    win.applauncher.initializeContextMenu();
                }
            }
        } catch (e) {
            window.alert(e);
        }
    }

    export function cleanupContextMenu() {
        try {
            var al = applauncher;
            // コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
            var menupopup = document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
            if ( menupopup ) {
                var items = menupopup.getElementsByTagNameNS( al.XUL_NS, "menuitem" );
                for (var i = 0; i < items.length - 1; i++) {
                    al.destroyContextMenuItem( items.item(i) );
                }
            }
        } catch (e) {
            window.alert(e);
        }
    }
}

(function() { // begin the scope of the variables in this file

// 設定関係
applauncher.prefs = {};

/** 設定を表示している listbox 要素の id */
applauncher.prefs.BRANCH_STRING = "extensions.applauncher."
applauncher.prefs.PREFS_BOX_ID  = "info.vividcode.ext.applauncher.prefwindow.listbox";
/** AppLauncher の設定保存用 XML が使用する名前空間 */
applauncher.prefs.PREFS_NS      = "http://www.vividcode.info/firefox_addon/myextensions/applauncher/";

applauncher.prefs.loadAppInfoList = function() {
    var al = applauncher;
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

applauncher.prefs._loadAppPrefsVer1 = function( aPrefElem ) {
    var al = applauncher;
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

function convertToArrayFromArrayLikeObj(arrayLikeObj) {
    return Array.prototype.slice.call(arrayLikeObj);
}
applauncher.prefs._loadAppPrefsVer2 = function ( aPrefElem ) {
    var al = applauncher;
    var items = aPrefElem.getElementsByTagNameNS(al.prefs.PREFS_NS, "app");
    items = convertToArrayFromArrayLikeObj(items);
    var appInfoList = items.map(function (item) {
        var name = item.getElementsByTagNameNS(al.prefs.PREFS_NS, "name").item(0).textContent;
        var path = item.getElementsByTagNameNS(al.prefs.PREFS_NS, "path").item(0).textContent;
        var args = (function () {
            var argElems = item.getElementsByTagNameNS(al.prefs.PREFS_NS, "arg");
            argElems = convertToArrayFromArrayLikeObj(argElems);
            return argElems.map(function (argElem) { return argElem.textContent });
        }).call(this);
        var optsElem = item.getElementsByTagNameNS(al.prefs.PREFS_NS, "opts-json").item(0);
        var opts = optsElem ? JSON.parse(optsElem.textContent) : {};

        return new al.AppInfo(name, path, args, opts);
    });
    return appInfoList;
};

applauncher.prefs.saveAppInfoList = function( aAppInfoList ) {
    var al = applauncher;
    // 保存用の XML Document を新たに生成
    var prefNode  = document.implementation.createDocument( al.prefs.PREFS_NS, "appList", null );
    prefNode.documentElement.setAttribute( "ver", "2" );
    // 保存用 XML に値を追加していく
    aAppInfoList.forEach(function (appInfo) {
        var e;
        var app = document.createElementNS( al.prefs.PREFS_NS, "app" );
        e = document.createElementNS(al.prefs.PREFS_NS, "name");
        app.appendChild(e).textContent = appInfo.name;
        e = document.createElementNS(al.prefs.PREFS_NS, "path");
        app.appendChild(e).textContent = appInfo.path;
        var args = app.appendChild( document.createElementNS(al.prefs.PREFS_NS, "args") );
        for( var j = 0; j < appInfo.args.length; j++ ) {
            args.appendChild( document.createElementNS(al.prefs.PREFS_NS, "arg") ).textContent = appInfo.args[j];
        }
        if (appInfo.opts) {
            e = document.createElementNS(al.prefs.PREFS_NS, "opts-json");
            app.appendChild(e).textContent = JSON.stringify(appInfo.opts);
        }
        prefNode.documentElement.appendChild(app);
    });
    // DOM を XML 文にして保存
    // cf. https://developer.mozilla.org/ja/XMLSerializer
    var prefStr = new XMLSerializer().serializeToString(prefNode);
    al.prefs.setCharPref("appList", prefStr);
};

/**
 * Preference 情報を取得する関数 (設定の情報)
 * @param prefString 取得するキー
 * @see : https://developer.mozilla.org/Ja/Code_snippets/Preferences
 */
applauncher.prefs.getPref = function( prefName ) {
    var al = applauncher;
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
 * @see : https://developer.mozilla.org/Ja/Code_snippets/Preferences
 */
applauncher.prefs.setCharPref = function( prefName, prefValue ) {
    var al = applauncher;
    // 設定の情報を取得する XPCOM オブジェクトの生成
    var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefBranch = prefSvc.getBranch( al.prefs.BRANCH_STRING );
    prefBranch.setCharPref( prefName, unescape(encodeURIComponent(prefValue)) );
};

}).call(this); // end the scope of the variables in this file
