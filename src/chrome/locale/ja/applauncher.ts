///<reference path="..\applauncher.d.ts" />

module applauncher.locale {
    export var errorMsg: IErrorMsgLocale = {
        ENCODING_NOT_SUPPORTED:
            "指定された文字コードはサポートされていません。\n" +
            "アプリケーションに渡す引数の文字コード変換に失敗しました。 設定を見直してください。\n" +
            "指定された文字コード : ",
        FILE_NOT_EXISTS:
            "指定されたファイルは存在していません。 設定を見直してください。\n" +
            "指定されたファイルのパス : ",
        IMG_ELEM_NOT_FOUND:
            "画像が見つかりません。\n" +
            "引数に置換文字列 &imageurl; または &eimageurl; を使用する場合は、\n" +
            "画像を右クリックしてコンテキストメニューを開いてください。",
        IMG_FILE_ISNT_LOCAL_FILE:
            "指定の画像ファイルはローカルファイルではありません。\n" +
            "ローカルファイルを指定してください。",
    };

    export var contextMenu: IContextMenuLocale = {
        NON_PREF_MSG: "(外部アプリケーションが設定されていません...)",
        PREFERENCES : "設定",
    };
}
