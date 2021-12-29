declare module applauncher.resource {
    export interface IPrefsChangeEventObserver {
        start();
        stop();
    }
    export interface IPrefsChangeEventEmitter {
        emitEvent(prefName: string);
    }
    export interface IPrefsChangeEventFactory {
        createPrefsChangeEventObserver(prefName: string, handler: () => void): IPrefsChangeEventObserver;
        getPrefsChangeEventEmitter(): IPrefsChangeEventEmitter;
    }
}
