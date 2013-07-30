declare module applauncher.locale {
    export interface IPrefsLocale {
        errorMsg: IPrefsLocaleErrorMsg;
        confMsg: IPrefsLocaleConfMsg;
    }

    export interface IPrefsLocaleErrorMsg {
        NO_SELECTED_ITEM: string;
        TOO_MUCH_SELECTED_ITEM: string;
    }

    export interface IPrefsLocaleConfMsg {
        DEL_CONF_TITLE: string;
        DEL_CONF_MSG  : string;
        NOTSAVE_CONF_TITLE: string;
        NOTSAVE_CONF_MSG  : string;
    }

    export var prefs: IPrefsLocale;
}
