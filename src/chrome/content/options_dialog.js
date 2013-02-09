try {
    // 初期化関数をロード時に実行する
    (function() {

        // global variable [applauncher] is a namespace object of this package

        /**
         * ファイル選択用ダイアログ
         */
        var fileSelect = function() {
            var nsIFilePicker = Components.interfaces.nsIFilePicker;
            var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
            fp.init( window, "Select an executable file", nsIFilePicker.modeOpen );
            var res = fp.show();
            if( res == nsIFilePicker.returnOK ) {
                var file = fp.file;
                document.getElementById("info.vividcode.applauncher.prefwindow.edit.path").value = file.path;
                // --- do something with the file here ---
            }
        };

        var onClickArgInputBoxCreateButton = function(evt) {
            var al = applauncher;
            var argsBox = document.getElementById("info.vividcode.applauncher.prefwindow.edit.args");
            argsBox.appendChild( document.createElementNS( al.XUL_NS, "textbox" ) );
        };

        var init = function() {
            try {
                var al = applauncher;
                window.moveToAlertPosition();
                document.getElementById("info.vividcode.applauncher.prefwindow.edit.name").value = window.arguments[0].inn.name;
                document.getElementById("info.vividcode.applauncher.prefwindow.edit.path").value = window.arguments[0].inn.path;
                var argsBox = document.getElementById("info.vividcode.applauncher.prefwindow.edit.args");
                for( var i = 0; i < window.arguments[0].inn.args.length; i++ ) {
                    argsBox.appendChild( document.createElementNS( al.XUL_NS, "textbox" ) ).value = window.arguments[0].inn.args[i];
                }
                // 最低でも 5 個のボックスは表示する. また, 空のボックスも 1 つおいておく
                var rc = 5 - window.arguments[0].inn.args.length;
                rc = ( rc > 1 ) ? rc : 1;
                for( i = 0; i < rc; i++ ) {
                    argsBox.appendChild( document.createElementNS( al.XUL_NS, "textbox" ) );
                }
                document.getElementById("info.vividcode.applauncher.prefwindow.edit.fileSelectButton").
                    addEventListener("command", function() { fileSelect(); }, false);
                document.getElementById("info.vividcode.applauncher.prefwindow.edit.argInputBoxCreateButton").
                    addEventListener("command", onClickArgInputBoxCreateButton, false);
            } catch(e) {
                window.alert(e);
            }
        };

        window.addEventListener("dialogaccept", function() {
            var al = applauncher;
            var prefIdPrefix = "info.vividcode.applauncher.prefwindow.";
            window.arguments[0].inn.setName( document.getElementById(prefIdPrefix + "edit.name").value );
            window.arguments[0].inn.setPath( document.getElementById(prefIdPrefix + "edit.path").value );
            var argsElem = document.getElementById(prefIdPrefix + "edit.args").getElementsByTagNameNS( al.XUL_NS, "textbox" );
            var args = new Array();
            for( var i = 0; i < argsElem.length; i++ ) {
                if( argsElem[i].value ) {
                    args.push( argsElem[i].value );
                }
            }
            window.arguments[0].inn.setArgs( args );
            window.arguments[0].out = true;
        }, false);
        window.addEventListener("dialogcancel", function() {
            window.arguments[0].out = false;
        }, false);
        window.addEventListener("load", function() { init(); }, false);
    }).call(this);
} catch(e) {
    window.alert(e);
}
