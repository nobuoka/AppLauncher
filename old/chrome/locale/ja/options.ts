///<reference path="..\options.d.ts" />

module applauncher.locale {
    export var prefs: IPrefsLocale = {
        errorMsg: {
            NO_SELECTED_ITEM:
                "選択されている項目がありません。 項目を選択してください。",
            TOO_MUCH_SELECTED_ITEM:
                "2 つ以上のアイテムが選択されています。 " +
                "1 つだけ選択するようにしてください。",
        },
        confMsg: {
            DEL_CONF_TITLE:
                "設定を削除してよろしいですか？",
            DEL_CONF_MSG:
                "選択されているアプリケーションの設定を削除してよろしいですか？",
            NOTSAVE_CONF_TITLE:
                "設定を保存せずに終了しますか？",
            NOTSAVE_CONF_MSG:
                "設定の変更を保存せずに終了しますが、よろしいですか？",
        },
    };
}
