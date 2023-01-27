import * as Buffer from "buffer";

export default class TorrentFile {
    private readonly _fileName: string;
    private readonly _buffer: Buffer;

    constructor(fileName: string, buffer: Buffer) {
        this._fileName = fileName
        this._buffer = buffer
    }

    get fileName(): string {
        return this._fileName;
    }

    get buffer(): Buffer {
        return this._buffer;
    }
}
