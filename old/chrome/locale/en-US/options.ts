///<reference path="..\options.d.ts" />

module applauncher.locale {
    export var prefs: IPrefsLocale = {
        errorMsg: {
            NO_SELECTED_ITEM:
                "There is no selected item. Please select ONE item.",
            TOO_MUCH_SELECTED_ITEM:
                "There are two or more selected item. Please select JUST ONE item.",
        },
        confMsg: {
            DEL_CONF_TITLE:
                "Confirmation of deletion",
            DEL_CONF_MSG:
                "Do you agree to delete the selected item?",
            NOTSAVE_CONF_TITLE:
                "Confirmation of close without save",
            NOTSAVE_CONF_MSG:
                "Do you agree to close this window without saving preferences?",
        },
    };
}
