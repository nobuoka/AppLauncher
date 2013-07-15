///<reference path=".\applauncher.ts" />
// coding: utf-8

interface Window {
    openDialog(a,b,c,d);
}

module applauncher.prefs {
    interface XULListbox extends Element {
        selectedItem: applauncher.ElemForPrefsWindow;
        selectedItems: applauncher.ElemForPrefsWindow[];
    }

    function _getListbox(): XULListbox {
        var al = applauncher;
        return <any>document.getElementById( al.prefs.PREFS_BOX_ID )
    }

    /**
     * 選択されている項目を取得する
     */
    export function getSelectedAppInfo(): applauncher.AppInfo {
        var al = applauncher;
        var listbox = _getListbox();
        var items = listbox.selectedItems;
        // 選択項目が無い
        if ( items.length === 0 ) {
            //throw new Error("選択されている項目がありません. 項目を選択してください.");
            throw new Error( al.locale.prefs.errorMsg.NO_SELECTED_ITEM );
        }
        // 2 つ以上選択されている
        else if ( items.length > 1 ) {
            //throw new Error("2 つ以上のアイテムが選択されています. 1 つだけ選択するようにしてください.");
            throw new Error( al.locale.prefs.errorMsg.TOO_MUCH_SELECTED_ITEM );
        }
        return items[0].appInfo;
    }

    export function onCmdAdd(evt) {
        try {
            var al = applauncher;
            // inn は項目. out は正常に終了したか否か
            var appInfo = new al.AppInfo("", "", []);
            var params = { inn: appInfo, out: null };
            window.openDialog( "chrome://applauncher/content/options_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
            if ( params.out ) {
                // 設定画面に追加
                document.getElementById( al.prefs.PREFS_BOX_ID ).appendChild( appInfo.elemForPrefsWindow );
            }
        } catch (e) {
            window.alert(e);
        }
    }

    export function onCmdDel(evt) {
        try {
            var al = applauncher;
            var item = al.prefs.getSelectedAppInfo().elemForPrefsWindow;
            // 削除していいですか？ というメッセージ
            var params = { title: al.locale.prefs.confMsg.DEL_CONF_TITLE, message: al.locale.prefs.confMsg.DEL_CONF_MSG, returnValue: null };
            window.openDialog( "chrome://applauncher/content/custom_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
            if ( params.returnValue ) {
                item.parentNode.removeChild( item );
            }
        } catch (e) {
            window.alert(e);
        }
    }

    export function onCmdMvu(evt) {
        try {
            var al = applauncher;
            var item = al.prefs.getSelectedAppInfo().elemForPrefsWindow;
            if ( item.previousSibling != null && item.previousSibling.nodeName == "listitem" ) {
                item.parentNode.insertBefore(item, item.previousSibling);
                (<XULListbox>item.parentNode).selectedItem = item;
            }
        } catch (e) {
            window.alert(e);
        }
    }
    export function onCmdMvd(evt) {
        try {
            var al = applauncher;
            var item = al.prefs.getSelectedAppInfo().elemForPrefsWindow;
            if ( item.nextSibling != null && item.nextSibling.nodeName == "listitem" ) {
                item.parentNode.insertBefore(item.nextSibling, item);
            }
        } catch (e) {
            window.alert(e);
        }
    }
    export function onCmdEdt(evt) {
        try {
            var al = applauncher;
            var item = al.prefs.getSelectedAppInfo();
            var params = { inn: item, out: null };
            window.openDialog( "chrome://applauncher/content/options_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
        } catch (e) {
            window.alert(e);
        }
    }


    export function onCmdSaveAndExit(evt) {
        try {
            var al = applauncher;
            al.prefs.saveFromPrefsWindow();
        } catch (e) {
            window.alert(e);
        }
    }
    export function onCmdNonSaveAndExit(evt) {
        try {
            var al = applauncher;
            var params = {title: al.locale.prefs.confMsg.NOTSAVE_CONF_TITLE, message: al.locale.prefs.confMsg.NOTSAVE_CONF_MSG, returnValue: null};
            window.openDialog("chrome://applauncher/content/custom_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params).focus();
            if ( ! params.returnValue ) {
                evt.preventDefault();
            }
        } catch (e) {
            window.alert(e);
        }
    }

    function _getEdtButton(): Element {
        return document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.edt");
    }
    function _getDelButton(): Element {
        return document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.del");
    }
    function _getMvuButton(): Element {
        return document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvu");
    }
    function _getMvdButton(): Element {
        return document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvd");
    }
    function _getAddButton(): Element {
        return document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.add");
    }

    /**
     * 初期化を行う
     */
    export function initializePrefsWindow() {
        try {
            var al = applauncher;
            al.prefs.loadToPrefsWindow();
            _getEdtButton().addEventListener("command", al.prefs.onCmdEdt, false);
            _getDelButton().addEventListener("command", al.prefs.onCmdDel, false);
            _getMvuButton().addEventListener("command", al.prefs.onCmdMvu, false);
            _getMvdButton().addEventListener("command", al.prefs.onCmdMvd, false);
            _getAddButton().addEventListener("command", al.prefs.onCmdAdd, false);
            window.addEventListener( "dialogaccept", al.prefs.onCmdSaveAndExit,    false );
            window.addEventListener( "dialogcancel", al.prefs.onCmdNonSaveAndExit, false );
        } catch (e) {
            window.alert(e);
        }
    }
    /**
     * 終了処理を行う
     */
    export function cleanupPrefsWindow() {
        try {
            var al = applauncher;
            _getEdtButton().removeEventListener("command", al.prefs.onCmdEdt, false);
            _getDelButton().removeEventListener("command", al.prefs.onCmdDel, false);
            _getMvuButton().removeEventListener("command", al.prefs.onCmdMvu, false);
            _getMvdButton().removeEventListener("command", al.prefs.onCmdMvd, false);
            _getAddButton().removeEventListener("command", al.prefs.onCmdAdd, false);
            window.removeEventListener( "dialogaccept", al.prefs.onCmdSaveAndExit, false );
            window.removeEventListener( "dialogcancel", al.prefs.onCmdNonSaveAndExit, false );
        } catch (e) {
            window.alert(e);
        }
    }

    /**
     * 設定を取得し, 保存する
     */
    export function saveFromPrefsWindow() {
        try {
            var al = applauncher;
            var appInfoList: applauncher.AppInfo[] = [];
            // 設定画面の要素を取得
            var elems = <NodeListOf<applauncher.ElemForPrefsWindow>>
                document.getElementById(al.prefs.PREFS_BOX_ID).getElementsByTagNameNS(al.XUL_NS, "listitem");
            for (var i = 0; i < elems.length; i++) {
                appInfoList.push( elems.item(i).appInfo );
            }
            al.prefs.saveAppInfoList( appInfoList );
            // コンテキストメニューを初期化する
            al.initializeContextMenuInAllWindow();
        } catch (e) {
            window.alert(e);
        }
    }

    /**
     * ユーザの設定画面に以前の設定を読み出す.
     */
    export function loadToPrefsWindow() {
        try {
            var al = applauncher;
            var appInfoList = al.prefs.loadAppInfoList();
            // 設定画面の要素を取得
            var listbox = document.getElementById( al.prefs.PREFS_BOX_ID );
            // 設定画面に要素を追加していく
            for (var i = 0; i < appInfoList.length; i++) {
                listbox.appendChild( appInfoList[i].elemForPrefsWindow );
            }
        } catch (e) {
            window.alert(e);
        }
    }
}

window.addEventListener("load", function el(evt) {
    window.removeEventListener("load", el, false);

    applauncher.prefs.initializePrefsWindow();
}, false );

window.addEventListener("unload", function el(evt) {
    window.removeEventListener("unload", el, false);

    applauncher.prefs.cleanupPrefsWindow();
}, false );
