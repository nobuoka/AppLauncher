// coding: utf-8

/** namespace object */
var applauncher = applauncher || {};

(function() { // begin the scope of the variables in this file

applauncher.locale = {};

applauncher.locale.errorMsg = {};
applauncher.locale.errorMsg.ENCODING_NOT_SUPPORTED = "指定された文字コードはサポートされていません.\nアプリケーションに渡す引数の文字コード変換に失敗しました. 設定を見直してください.\n指定された文字コード : ";
applauncher.locale.errorMsg.FILE_NOT_EXISTS = "指定されたファイルは存在していません. 設定を見直してください.\n指定されたファイルのパス : "
applauncher.locale.errorMsg.IMG_ELEM_NOT_FOUND = "画像が見つかりません. \n引数に置換文字列 &imageurl; または &eimageurl; を使用する場合は, \n画像を右クリックしてコンテキストメニューを開いてください.";
applauncher.locale.errorMsg.IMG_FILE_ISNT_LOCAL_FILE = "指定の画像ファイルはローカルファイルではありません.\nローカルファイルを指定してください.";

applauncher.locale.contextMenu = {};
applauncher.locale.contextMenu.NON_PREF_MSG = "(外部アプリケーションが設定されていません...)";
applauncher.locale.contextMenu.PREFERENCES  = "設定";

})(); // end the scope of the variables in this file
