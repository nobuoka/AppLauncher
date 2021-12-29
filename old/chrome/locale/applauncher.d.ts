declare module applauncher.locale {
    export interface IErrorMsgLocale {
        ENCODING_NOT_SUPPORTED: string;
        FILE_NOT_EXISTS: string;
        IMG_ELEM_NOT_FOUND: string;
        IMG_FILE_ISNT_LOCAL_FILE: string;
    }

    export interface IContextMenuLocale {
        NON_PREF_MSG: string;
        PREFERENCES: string;
    }

    export var errorMsg: IErrorMsgLocale;
    export var contextMenu: IContextMenuLocale;
}
