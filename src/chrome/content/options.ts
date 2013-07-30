///<reference path=".\applauncher.ts" />
///<reference path="..\locale\options.d.ts" />
// coding: utf-8

interface ChromeWindow extends Window {
    openDialog(a,b,c,d);
}

module applauncher {

    interface XULListbox extends Element {
        selectedItem: applauncher.ElemForPrefsWindow;
        selectedItems: applauncher.ElemForPrefsWindow[];
    }

    class EventObserver {
        private _target: EventTarget;
        private _type: string;
        private _listener: (evt: Event) => void;
        private _useCapture: boolean;
        constructor(target: EventTarget, type: string, listener: (evt: Event) => void, useCapture: boolean) {
            this._type = type;
            this._target = target;
            this._useCapture = useCapture;
            target.addEventListener(type, listener, useCapture);
        }
        destroy() {
            this._target.removeEventListener(this._type, this._listener, this._useCapture);
            delete this._target;
            delete this._type;
            delete this._listener;
            delete this._useCapture;
        }
    }

    /** 設定を表示している listbox 要素の id */
    var PREFS_BOX_ID = "info.vividcode.ext.applauncher.prefwindow.listbox";

    export class OptionsControl {

        private _getListbox(): XULListbox {
            return <any>this._win.document.getElementById( PREFS_BOX_ID )
        }

        /**
         * 選択されている項目を取得する
         */
        private _getSelectedAppInfo(): applauncher.AppInfo {
            var al = applauncher;
            var listbox = this._getListbox();
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

        private _onCmdAdd() {
            try {
                var al = applauncher;
                // inn は項目. out は正常に終了したか否か
                var appInfo = new al.AppInfo("", "", []);
                var params = { inn: appInfo, out: null };
                this._win.openDialog( "chrome://applauncher/content/options_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
                if ( params.out ) {
                    // 設定画面に追加
                    document.getElementById( PREFS_BOX_ID ).appendChild( appInfo.elemForPrefsWindow );
                }
            } catch (e) {
                this._win.alert(e);
            }
        }

        private _onCmdDel() {
            try {
                var al = applauncher;
                var item = this._getSelectedAppInfo().elemForPrefsWindow;
                // 削除していいですか？ というメッセージ
                var params = { title: al.locale.prefs.confMsg.DEL_CONF_TITLE, message: al.locale.prefs.confMsg.DEL_CONF_MSG, returnValue: null };
                this._win.openDialog( "chrome://applauncher/content/custom_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
                if ( params.returnValue ) {
                    item.parentNode.removeChild( item );
                }
            } catch (e) {
                this._win.alert(e);
            }
        }

        private _onCmdMvu() {
            try {
                var item = this._getSelectedAppInfo().elemForPrefsWindow;
                if ( item.previousSibling != null && item.previousSibling.nodeName == "listitem" ) {
                    item.parentNode.insertBefore(item, item.previousSibling);
                    (<XULListbox>item.parentNode).selectedItem = item;
                }
            } catch (e) {
                this._win.alert(e);
            }
        }
        private _onCmdMvd() {
            try {
                var item = this._getSelectedAppInfo().elemForPrefsWindow;
                if ( item.nextSibling != null && item.nextSibling.nodeName == "listitem" ) {
                    item.parentNode.insertBefore(item.nextSibling, item);
                }
            } catch (e) {
                this._win.alert(e);
            }
        }
        private _onCmdEdt() {
            try {
                var item = this._getSelectedAppInfo();
                var params = { inn: item, out: null };
                this._win.openDialog( "chrome://applauncher/content/options_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params ).focus();
            } catch (e) {
                this._win.alert(e);
            }
        }

        private _onCmdSaveAndExit() {
            try {
                this._saveFromPrefsWindow();
            } catch (e) {
                this._win.alert(e);
            }
        }
        private _onCmdNonSaveAndExit(evt: Event) {
            try {
                var al = applauncher;
                var params = {title: al.locale.prefs.confMsg.NOTSAVE_CONF_TITLE, message: al.locale.prefs.confMsg.NOTSAVE_CONF_MSG, returnValue: null};
                this._win.openDialog("chrome://applauncher/content/custom_dialog.xul", "", "chrome,dialog,modal,resizable=yes", params).focus();
                if ( ! params.returnValue ) {
                    evt.preventDefault();
                }
            } catch (e) {
                this._win.alert(e);
            }
        }

        private _getEdtButton(): Element {
            return this._win.document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.edt");
        }
        private _getDelButton(): Element {
            return this._win.document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.del");
        }
        private _getMvuButton(): Element {
            return this._win.document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvu");
        }
        private _getMvdButton(): Element {
            return this._win.document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.mvd");
        }
        private _getAddButton(): Element {
            return this._win.document.getElementById("info.vividcode.ext.applauncher.prefwindow.button.add");
        }

        private _win: ChromeWindow;
        private _permanentEventObservers: EventObserver[];

        /**
         * 初期化を行う
         */
        constructor(win: ChromeWindow) {
            this._win = win;
            this._loadToPrefsWindow();
            this._permanentEventObservers = [
                new EventObserver(this._getEdtButton(), "command", (evt: Event) => { this._onCmdEdt() }, false),
                new EventObserver(this._getDelButton(), "command", (evt: Event) => { this._onCmdDel() }, false),
                new EventObserver(this._getMvuButton(), "command", (evt: Event) => { this._onCmdMvu() }, false),
                new EventObserver(this._getMvdButton(), "command", (evt: Event) => { this._onCmdMvd() }, false),
                new EventObserver(this._getAddButton(), "command", (evt: Event) => { this._onCmdAdd() }, false),
                new EventObserver(win, "dialogaccept", (evt: Event) => { this._onCmdSaveAndExit() },       false),
                new EventObserver(win, "dialogcancel", (evt: Event) => { this._onCmdNonSaveAndExit(evt) }, false),
            ];
        }

        /**
         * 終了処理を行う
         */
        destroy() {
            this._permanentEventObservers.forEach((eventObserver: EventObserver) => {
                eventObserver.destroy();
            });
        }

        /**
         * 設定を取得し, 保存する
         */
        private _saveFromPrefsWindow() {
            try {
                var al = applauncher;
                var appInfoList: applauncher.AppInfo[] = [];
                // 設定画面の要素を取得
                var elems = <NodeListOf<applauncher.ElemForPrefsWindow>>
                    this._win.document.getElementById(PREFS_BOX_ID).getElementsByTagNameNS(al.XUL_NS, "listitem");
                for (var i = 0; i < elems.length; i++) {
                    appInfoList.push( elems.item(i).appInfo );
                }
                al.prefs.saveAppInfoList( appInfoList );
                // コンテキストメニューを初期化する
                al.initializeContextMenuInAllWindow();
            } catch (e) {
                this._win.alert(e);
            }
        }

        /**
         * ユーザの設定画面に以前の設定を読み出す.
         */
        private _loadToPrefsWindow() {
            try {
                var al = applauncher;
                var appInfoList = al.prefs.loadAppInfoList();
                // 設定画面の要素を取得
                var listbox = this._win.document.getElementById( PREFS_BOX_ID );
                // 設定画面に要素を追加していく
                for (var i = 0; i < appInfoList.length; i++) {
                    listbox.appendChild( appInfoList[i].elemForPrefsWindow );
                }
            } catch (e) {
                this._win.alert(e);
            }
        }
    }

}

(function () {
    var optionsControl;

    window.addEventListener("load", function el(evt) {
        window.removeEventListener("load", el, false);

        optionsControl = new applauncher.OptionsControl(<ChromeWindow>window);
    }, false );

    window.addEventListener("unload", function el(evt) {
        window.removeEventListener("unload", el, false);

        optionsControl.destroy();
    }, false );
}).call(this);
