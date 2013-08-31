///<reference path="..\..\_resource_interface\prefs_change_events.d.ts" />
///<reference path="..\locale\applauncher.d.ts" />
// coding: utf-8

declare var gBrowser;
declare var Components;
declare var content: Window;
declare var escape;
declare var unescape;

interface Document {
    popupNode: Node;
}

module moz {
    /**
     * See: https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsISupports
     */
    export interface nsISupports { // XXX incomplete
        // XXX Does `QueryInterface` method return value?
        QueryInterface(uuid): any;
    }

    /**
     * See: https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIFile
     */
    export interface nsIFile extends nsISupports { // XXX incomplete
        /** Requires Gecko 14 */
        initWithPath(filePath: string): void;
        /** Requires Gecko 14 */
        appendRelativePath(relativeFilePath: string): void;
        path: string;
        fileSize: number;
        exists(): boolean;
        clone(): nsIFile;
    }

    /**
     * See: https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsILocalFileMac
     */
    export interface nsILocalFileMac extends nsIFile { // XXX incomplete
        isPackage(): boolean;
    }

    /**
     * See: https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIProcess
     */
    export interface nsIProcess extends nsISupports {
        init(executable: nsIFile): void;
        run(blocking: boolean, args: string[], count: number): void;
    }
}

/** namespace object */
module applauncher {
    var Cc = Components.classes;
    var Ci = Components.interfaces;

    /** Namespace URI of XUL Elements */
    export var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

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
    export function getCurrentPageURL(popupNode?: Node): string {
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

    export function getImageURL(popupNode: Node): string {
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
            imageurl = (<HTMLImageElement>targetNode).src;
        } else {
            // when the img element is not found
            throw new Error( al.locale.errorMsg.IMG_ELEM_NOT_FOUND );
        }
        // imageurl には URI エンコードされた文字列が入っている
        imageurl = decodeURIComponent(imageurl)
        return imageurl;
    }

    export function getCurrentPageTURL(popupNode: Node): string {
        var al = applauncher;
        // turi の設定
        // turi は右クリックのリンク先 URI. 右クリックしたのがリンク要素じゃなければそのページの URI
        var turi: string;
        var targetNode = popupNode;
        while ( targetNode != null && targetNode.nodeName.toUpperCase() != "A" ) {
            targetNode = targetNode.parentNode;
        }
        if ( targetNode != null && targetNode.nodeName.toUpperCase() == "A" ) {
            turi = (<HTMLAnchorElement>targetNode).href;
        } else {
            turi = al.getCurrentPageURL();
        }
        return turi;
    }

    /**
     * get selected text
     */
    export function getSelectedText(): string {
        return (function getSelections(w: Window): string {
            var s: string, fs: Window, i: number, len: number, sel: Selection;
            sel = w.getSelection(); // w.getSelection() は null の可能性あり (?)
            s = ( sel === null ? "" : sel.toString() );
            fs = w.frames;
            for (i = 0, len = fs.length; i < len; ++i) {
                s += getSelections( fs[i] );
            }
            return s;
        }).call(this, content);
    }

    /**
     * 現在表示中のページのタイトルを返す関数.
     */
    export function getCurrentPageTitle(popupNode: Node): string {
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
    export function decodeEntityReference(str: string, popupNode: Node): string {
        var al = applauncher;
        var uri: string   = al.getCurrentPageURL( popupNode );
        var turi: string  = al.getCurrentPageTURL( popupNode );
        var title: string = al.getCurrentPageTitle( popupNode );
        var text: string  = al.getSelectedText();
        var imageurl = null;
        return str.replace( /&[^&;]+;/g, function (substr: string) {
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
                if (!imageurl) { imageurl = al.getImageURL(popupNode) };
                return imageurl;
            } else if (substr === "&eimageurl;") {
                if (!imageurl) { imageurl = al.getImageURL(popupNode) };
                return encodeURIComponent(imageurl);
            } else if ( substr == "&ImgFilePathWin;" ) {
                if (!imageurl) { imageurl = al.getImageURL(popupNode) };
                if (imageurl.match(/^file:\/\/\//)) {
                    return imageurl.replace(/^file:\/\/\//, "").replace(/\//g, "\\");
                } else {
                    throw new Error( al.locale.errorMsg.IMG_FILE_ISNT_LOCAL_FILE );
                }
            } else if ( substr == "&title;" ) { return title; }
            else if ( substr == "&etitle;" ) { return encodeURIComponent(title); }
            else if ( substr == "&text;" ) { return text; }
            else if ( substr == "&etext;" ) { return encodeURIComponent(text); }
        } );
    }

    function __runExecutableFile(file: moz.nsIFile, args: string[]): void {
        var al = applauncher;
        // if the user uses Mac OS and the target application is a bundle application,
        // get the execution file
        if ( navigator.platform.indexOf("Mac") != -1 ) {
            file.QueryInterface( Ci.nsILocalFileMac );
            var macFile = <moz.nsILocalFileMac>file;
            if ( macFile.isPackage ) { // `isPackage` is property? (not method?)
                file = al.getExecuteFileFromMacPackage( macFile );
            }
        }
        // create a nsIProcess object, and run the process
        var process = <moz.nsIProcess>Cc["@mozilla.org/process/util;1"].createInstance( Ci.nsIProcess );
        process.init(file);
        process.run(false, args, args.length);
                // if the first arg is true, wait for the process ending
    }

    interface XULMenupopupElement extends Element {
        triggerNode: Node;
    }

    /**
     * Launch an outer application.
     * 外部アプリケーションを起動する関数
     */
    function launchOuterApplication(targetElem: XULMenuitemElementWithAppInfo) {
        var al = applauncher;
        var appInfo = targetElem.appInfo;
        // popupNode の取得: 前者は Fx3.6 以前用, 後者は Fx4.0 以降用 (Fx4.0 以降でも前者で OK の模様)
        var popupNode = document.popupNode || (<XULMenupopupElement>targetElem.parentNode.parentNode.parentNode).triggerNode;
        try {
            var path = appInfo.path;
            var argsSource = appInfo.args;
            // 設定値の取得
            var argsList = "";
            var args: string[] = [];
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

            var file: moz.nsIFile;
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
            if (!file.exists()) {
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
    export function getExecuteFileFromMacPackage(aFile: moz.nsILocalFileMac): moz.nsIFile {
        var infoPlistFile = <moz.nsIFile>aFile.clone().QueryInterface( Ci.nsIFile );
        infoPlistFile.appendRelativePath( "Contents/Info.plist" );
        var ifstream  = Cc["@mozilla.org/network/file-input-stream;1"].createInstance( Ci.nsIFileInputStream );
        var domparser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance( Ci.nsIDOMParser );
        ifstream.init( infoPlistFile, -1, 0, 0 );
        var doc = domparser.parseFromStream( ifstream, "UTF-8", infoPlistFile.fileSize, "application/xml" );
        ifstream.close();
        var keys = doc.getElementsByTagName( "key" );
        var exeFileName = "";
        for (var i = 0, key; key = keys[i]; ++i) {
            if (key.textContent == "CFBundleExecutable") {
                exeFileName = key.nextElementSibling.textContent;
                break;
            }
        }
        var exeFile = <moz.nsIFile>aFile.clone().QueryInterface(Ci.nsIFile);
        exeFile.appendRelativePath("Contents/MacOS/" + exeFileName);
        return exeFile;
    }

    interface XULMenuitemElementWithAppInfo extends Element {
        appInfo: AppInfo;
    }
    function onCmdToLaunchApp(evt: Event): void {
        try {
            var targetElem = <XULMenuitemElementWithAppInfo>evt.currentTarget;
            launchOuterApplication(targetElem);
        } catch (e) {
            window.alert(e);
        }
    }
    function createContextMenuItem(appInfo: AppInfo): Element {
        var al = applauncher;
        // "menuitem" 要素の作成
        var item = <XULMenuitemElementWithAppInfo>document.createElementNS( al.XUL_NS, "menuitem" );
        item.setAttribute("label", appInfo.name);
        // イベントリスナの追加
        item.appInfo = appInfo;
        item.addEventListener("command", onCmdToLaunchApp, false);
        return item;
    }
    function destroyContextMenuItem(item: Element): void {
        var al = applauncher;
        if ((<any>item).appInfo) delete (<any>item).appInfo;
        item.removeEventListener("command", onCmdToLaunchApp, false);
    }
    export function onCmdToOpenPrefWindow( evt ) {
        // 設定ウィンドウを表示
        window.open( "chrome://applauncher/content/options.xul", "applauncherprefs", "chrome,dialog,resizable=yes" );
    }

    /**
     * Initialize an AppLauncher item in the context menu.
     * コンテキストメニューの初期化を行う関数
     */
    export function initializeContextMenu(): void {
        try {
            var al = applauncher;
            // 設定の読み込み
            var appInfoList: AppInfo[] = al.prefs.loadAppInfoList();
            // コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
            var menupopup = document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
            if ( menupopup ) {
                // もともとある要素を削除
                while ( menupopup.hasChildNodes() ) {
                    menupopup.removeChild( menupopup.firstChild );
                }
                // 要素を追加
                if ( appInfoList != null && appInfoList.length != 0 ) {
                    for (var i = 0; i < appInfoList.length; ++i) {
                        menupopup.appendChild( createContextMenuItem(appInfoList[i]) );
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

    export function cleanupContextMenu(): void {
        try {
            var al = applauncher;
            // コンテキストメニュー内の、AppLauncher に関する "menupopup" 要素 (id で指定) を取得
            var menupopup = document.getElementById( "info.vividcode.applauncher.contextmenu.items" );
            if ( menupopup ) {
                var items = <NodeListOf<Element>>menupopup.getElementsByTagNameNS(al.XUL_NS, "menuitem");
                for (var i = 0; i < items.length - 1; ++i) {
                    destroyContextMenuItem( items.item(i) );
                }
            }
        } catch (e) {
            window.alert(e);
        }
    }
}

module applauncher.prefs {
    var BRANCH_STRING = "extensions.applauncher.";

    /** AppLauncher の設定保存用 XML が使用する名前空間 */
    var PREFS_NS = "http://www.vividcode.info/firefox_addon/myextensions/applauncher/";

    var m: {
        prefsChangeEventFactory: applauncher.resource.IPrefsChangeEventFactory;
    } = {
        prefsChangeEventFactory: null,
    };
    Components.utils.import("resource://applauncher/prefs_change_events.js", m);

    export function loadAppInfoList(): AppInfo[] {
        var al = applauncher;
        // 以前の設定を DOM として取得
        var parser  = new DOMParser();
        var prefStr = getPref("appList");
        // 初めて起動する場合, prefStr は undefined になっている
        if (!prefStr) {
            prefStr = "<appList ver=\"2\" xmlns=\"http://www.vividcode.info/firefox_addon/myextensions/applauncher/\" />";
        }
        var appList = parser.parseFromString( prefStr, "text/xml" );
        var version = appList.documentElement.getAttribute("ver");
        if (version == null) {
            return _loadAppPrefsVer1( appList );
        } else if (version == "2") {
            return _loadAppPrefsVer2( appList );
        }
    }

    function _loadAppPrefsVer1(aPrefElem: Document): AppInfo[] {
        var al = applauncher;
        var items: NodeListOf<Element> = <any>aPrefElem.getElementsByTagNameNS(PREFS_NS, "app");
        var appInfoList: applauncher.AppInfo[] = [];
        for (var i = 0; i < items.length; i++) {
            var name = items[i].getAttribute("name");
            var path = items[i].getAttribute("path");
            var args = items[i].getAttribute("args").split("<>");
            appInfoList.push( new al.AppInfo( name, path, args ) );
        }
        return appInfoList;
    }

    function convertToArrayFromArrayLikeObj(arrayLikeObj): any[] {
        return Array.prototype.slice.call(arrayLikeObj);
    }
    function _loadAppPrefsVer2(aPrefElem: Document) {
        var al = applauncher;
        var itemList = aPrefElem.getElementsByTagNameNS(PREFS_NS, "app");
        var items = convertToArrayFromArrayLikeObj(itemList);
        var appInfoList = items.map((item) => {
            var name = item.getElementsByTagNameNS(PREFS_NS, "name").item(0).textContent;
            var path = item.getElementsByTagNameNS(PREFS_NS, "path").item(0).textContent;
            var args = (function () {
                var argElems = item.getElementsByTagNameNS(PREFS_NS, "arg");
                argElems = convertToArrayFromArrayLikeObj(argElems);
                return argElems.map((argElem) => { return argElem.textContent });
            }).call(this);
            var optsElem = item.getElementsByTagNameNS(PREFS_NS, "opts-json").item(0);
            var opts = optsElem ? JSON.parse(optsElem.textContent) : {};

            return new al.AppInfo(name, path, args, opts);
        });
        return appInfoList;
    }

    export function saveAppInfoList(aAppInfoList: applauncher.AppInfo[]): void {
        var al = applauncher;
        // 保存用の XML Document を新たに生成
        var prefNode = document.implementation.createDocument(PREFS_NS, "appList", null);
        prefNode.documentElement.setAttribute( "ver", "2" );
        // 保存用 XML に値を追加していく
        aAppInfoList.forEach((appInfo) => {
            var e: Element;
            var app = document.createElementNS(PREFS_NS, "app");
            e = document.createElementNS(PREFS_NS, "name");
            app.appendChild(e).textContent = appInfo.name;
            e = document.createElementNS(PREFS_NS, "path");
            app.appendChild(e).textContent = appInfo.path;
            var args = app.appendChild( document.createElementNS(PREFS_NS, "args") );
            appInfo.args.forEach((arg) => {
                e = document.createElementNS(PREFS_NS, "arg");
                args.appendChild(e).textContent = arg;
            });
            if (appInfo.opts) {
                e = document.createElementNS(PREFS_NS, "opts-json");
                app.appendChild(e).textContent = JSON.stringify(appInfo.opts);
            }
            prefNode.documentElement.appendChild(app);
        });
        // DOM を XML 文にして保存
        // cf. https://developer.mozilla.org/ja/XMLSerializer
        var prefStr = new XMLSerializer().serializeToString(prefNode);
        setCharPref("appList", prefStr);

        m.prefsChangeEventFactory.getPrefsChangeEventEmitter().emitEvent("AppInfo");
    }

    /**
     * Preference 情報を取得する関数 (設定の情報)
     * @param prefString 取得するキー
     * @see : https://developer.mozilla.org/ja/docs/Code_snippets/Preferences
     */
    function getPref(prefName: string): any {
        var al = applauncher;
        // 設定の情報を取得する XPCOM オブジェクトの生成
        var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var prefBranch = prefSvc.getBranch( BRANCH_STRING );
        // タイプ別に取得する関数を分ける
        switch ( prefBranch.getPrefType(prefName) ) {
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
    }

    /**
     * Preference 情報を取得する関数 (設定の情報)
     * @param prefString 取得するキー
     * @see : https://developer.mozilla.org/ja/docs/Code_snippets/Preferences
     */
    function setCharPref(prefName: string, prefValue: string): void {
        var al = applauncher;
        // 設定の情報を取得する XPCOM オブジェクトの生成
        var prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var prefBranch = prefSvc.getBranch( BRANCH_STRING );
        prefBranch.setCharPref( prefName, unescape(encodeURIComponent(prefValue)) );
    }
}
