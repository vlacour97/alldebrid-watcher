import File from "./file";
import EventEmitter from "events";

export enum DownloadEvent {
    START_DOWNLOAD = 'start_download',
    PROGRESS = 'progress',
    DONE = 'done',
    ERROR = 'error',
}

export class DownloadFile {
    private _file: File
    private downloadCallback: () => void
    private eventEmitter: EventEmitter
    private _isStarted: boolean

    constructor(file: File, downloadCallback: () => void, eventEmitter: EventEmitter) {
        this._file = file;
        this.downloadCallback = downloadCallback;
        this.eventEmitter = eventEmitter;
        this._isStarted = false;

        this.eventEmitter.on(DownloadEvent.START_DOWNLOAD, () => this._isStarted = true);
    }

    get file(): File {
        return this._file;
    }

    get isStarted(): boolean {
        return this._isStarted;
    }

    startDownload(): void {
        this.downloadCallback.call(this);
    }

    on(event: DownloadEvent, callable: (DownloadFile, ...any) => void): void {
        this.eventEmitter.on(event, (...args) => callable.call(this, this,...args));
    }
}
