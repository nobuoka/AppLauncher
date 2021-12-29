///<reference path="..\applauncher.d.ts" />

module applauncher.locale {
    export var errorMsg: IErrorMsgLocale = {
        ENCODING_NOT_SUPPORTED:
            "The specified encoding is not supported.\n" +
            "The encoding conversion was failed. Please change your preferences.\n" +
            "Specified encoding : ",
        FILE_NOT_EXISTS:
            "The specified file DOESN'T exsist. Please change your preferences.\n" +
            "Specified file path : ",
        IMG_ELEM_NOT_FOUND:
            "No image is found. Please open the context menu with right-clicking a image.",
        IMG_FILE_ISNT_LOCAL_FILE:
            "The image file is not a local file.\nPlease select a local file.",
    };

    export var contextMenu: IContextMenuLocale = {
        NON_PREF_MSG: "(There is no preference of outer applications...)",
        PREFERENCES : "Preferences",
    };
}
