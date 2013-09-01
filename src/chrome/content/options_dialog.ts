///<reference path=".\applauncher.ts" />

module moz {
    // In this script, `window` is a dialog
    // See: http://mdn.beonex.com/en/XUL/dialog.html
    export interface DialogWindow extends Window {
        arguments: any[];
        moveToAlertPosition(): void;
        // there are other properties and methods
    }

    export interface nsILocalFile extends nsIFile {}

    export interface nsIFilePicker extends nsISupports {
        init(parent, title: string, mode: number);
        /** Deprecated since Gecko 17.0 */
        show();
        file: moz.nsILocalFile;
        // TODO there are other methods and attributes
    }
    export interface nsIFilePickerInterfaceObject {
        // Mode constants
        modeOpen: number; // Load a file or directory.
        modeSave: number; // Save a file or directory.
        modeGetFolder: number; // Select a folder/directory.
        modeOpenMultiple: number; // Load multiple files.

        // Return value constants
        returnOK: number; // The file picker dialog was closed by the user hitting 'Ok'
        returnCancel: number; // The file picker dialog was closed by the user hitting 'Cancel'
        returnReplace: number; // The user chose an existing file and acknowledged that they want to overwrite the file

        // TODO there are othre constants
    }
}

module applauncher {

    export class OptionsDialogControl {

        private _win: moz.DialogWindow;

        constructor(win: moz.DialogWindow) {
            this._win = win;
            var onDialogaccept = (evt) => {
                this._onDialogaccept();
            };
            var onDialogcancel = (evt) => {
                this._onDialogcancel();
            };
            win.addEventListener("dialogaccept", onDialogaccept, false);
            win.addEventListener("dialogcancel", onDialogcancel, false);
            win.addEventListener("load", (evt) => { this.init() }, false);
        }

        private init() {
            var win = this._win;
            var doc = win.document;
            try {
                var al = applauncher;
                win.moveToAlertPosition();
                var prefIdPrefix = "info.vividcode.applauncher.prefwindow.";
                var appInfo = win.arguments[0].inn;
                (<any>doc.getElementById(prefIdPrefix + "edit.name")).value = appInfo.name;
                (<any>doc.getElementById(prefIdPrefix + "edit.path")).value = appInfo.path;
                var argsBox = doc.getElementById(prefIdPrefix + "edit.args");
                for (var i = 0; i < appInfo.args.length; i++) {
                    (<any>argsBox.appendChild( doc.createElementNS( al.XUL_NS, "textbox" ) )).value = appInfo.args[i];
                }
                // 最低でも 5 個のボックスは表示する. また, 空のボックスも 1 つおいておく
                var rc = 5 - appInfo.args.length;
                rc = ( rc > 1 ) ? rc : 1;
                for (var i = 0; i < rc; i++) {
                    argsBox.appendChild( doc.createElementNS( al.XUL_NS, "textbox" ) );
                }
                (<any>doc.getElementById(prefIdPrefix + "edit.opts.openInFx")).checked =
                            appInfo.opts.openInFx;

                doc.getElementById(prefIdPrefix + "edit.fileSelectButton").
                    addEventListener("command", (evt) => { this._showFileSelector() }, false);
                doc.getElementById(prefIdPrefix + "edit.argInputBoxCreateButton").
                    addEventListener("command", (evt) => { this._createArgInputBox() }, false);
            } catch (e) {
                win.alert(e);
            }
        }

        /**
         * ファイル選択用ダイアログ
         */
        private _showFileSelector() {
            var win = this._win;
            var doc = win.document;
            var nsIFilePicker = <moz.nsIFilePickerInterfaceObject>Components.interfaces.nsIFilePicker;
            var fp = <moz.nsIFilePicker>Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
            fp.init( win, "Select an executable file", nsIFilePicker.modeOpen );
            var res = fp.show();
            if (res == nsIFilePicker.returnOK) {
                var file = fp.file;
                (<any>doc.getElementById("info.vividcode.applauncher.prefwindow.edit.path")).value = file.path;
                // --- do something with the file here ---
            }
        }

        private _createArgInputBox() {
            var al = applauncher;
            var doc = this._win.document;
            var argsBox = doc.getElementById("info.vividcode.applauncher.prefwindow.edit.args");
            argsBox.appendChild( doc.createElementNS( al.XUL_NS, "textbox" ) );
        }

        private _onDialogaccept() {
            var win = this._win;
            var doc = win.document;
            var al = applauncher;
            var prefIdPrefix = "info.vividcode.applauncher.prefwindow.";
            var appInfo = win.arguments[0].inn;
            appInfo.setName( (<any>doc.getElementById(prefIdPrefix + "edit.name")).value );
            appInfo.setPath( (<any>doc.getElementById(prefIdPrefix + "edit.path")).value );
            var argsElem = doc.getElementById(prefIdPrefix + "edit.args").getElementsByTagNameNS( al.XUL_NS, "textbox" );
            var args: string[] = [];
            for (var i = 0; i < argsElem.length; i++) {
                if ( (<any>argsElem[i]).value ) {
                    args.push( (<any>argsElem[i]).value );
                }
            }
            appInfo.setArgs( args );
            appInfo.setOpenInFx( (<any>doc.getElementById(prefIdPrefix + "edit.opts.openInFx")).checked );
            win.arguments[0].out = true;
        }

        private _onDialogcancel() {
            var win = this._win;
            win.arguments[0].out = false;
        }

    }
}

new applauncher.OptionsDialogControl(<moz.DialogWindow>window);
