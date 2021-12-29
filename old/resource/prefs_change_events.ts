///<reference path="..\_resource_interface\prefs_change_events.d.ts" />

var EXPORTED_SYMBOLS = ["prefsChangeEventFactory"];

declare var Components;
Components.utils.import("resource://gre/modules/Services.jsm");
declare var Services;

var prefsChangeEventFactory = {
    createPrefsChangeEventObserver: function (prefName: string, handler: () => void) {
        return new PrefsChangeEventObserver(prefName, handler);
    },
    getPrefsChangeEventEmitter: function () {
        return PrefsChangeEventEmitter.getInstance();
    },
};

import IPrefsChangeEventObserver = applauncher.resource.IPrefsChangeEventObserver;
import IPrefsChangeEventEmitter = applauncher.resource.IPrefsChangeEventEmitter;

interface IPrefsChangeEventListener {
    handleEvent(): void;
}

class PrefsChangeEventObserver
implements IPrefsChangeEventObserver, IPrefsChangeEventListener {
    public prefName: string;
    private handler: () => void;
    constructor(prefName: string, handler: () => void) {
        this.prefName = prefName;
        this.handler = handler;
    }

    public handleEvent(): void {
        this.handler();
    }

    public start() {
        PrefsChangeEventEmitter.getInstance().addListener(this.prefName, this);
    }
    public stop() {
        PrefsChangeEventEmitter.getInstance().removeListener(this.prefName, this);
    }
}

class PrefsChangeEventEmitter implements IPrefsChangeEventEmitter {
    private static _instance: PrefsChangeEventEmitter;
    private _listeners: {
        [prefName: string]: IPrefsChangeEventListener[];
    };

    public static getInstance(): PrefsChangeEventEmitter {
        if (!PrefsChangeEventEmitter._instance)
            PrefsChangeEventEmitter._instance = new PrefsChangeEventEmitter();
        return PrefsChangeEventEmitter._instance;
    }
    constructor() {
        this._listeners = {};
    }

    public emitEvent(prefName: string) {
        if (!this._listeners[prefName]) return;
        this._listeners[prefName].forEach(listener => {
            try {
                listener.handleEvent();
            } catch (err) {
                Components.utils.reportError(err);
                if (err && err.stack) Components.utils.reportError(err.stack);
            }
        });
    }

    public addListener(prefName: string, listener: IPrefsChangeEventListener): void {
        if (!this._listeners[prefName]) this._listeners[prefName] = [];
        // if listener is already registered, do nothing
        if (this._listeners[prefName].indexOf(listener) >= 0) return;
        this._listeners[prefName].push(listener);
    }
    public removeListener(prefName: string, listener: IPrefsChangeEventListener): void {
        if (!this._listeners[prefName]) return;
        var targetIdx = this._listeners[prefName].indexOf(listener);
        if (targetIdx < 0) return;
        this._listeners[prefName].splice(targetIdx, 1);
        if (this._listeners[prefName].length === 0) delete this._listeners[prefName];
    }
}
