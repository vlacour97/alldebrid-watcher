import TorrentFile from "./torrent-file";
import { v4 as uuidv4 } from 'uuid';

export default class Torrent {
    private readonly _uuid: string;
    private readonly _name: string
    private readonly _file: TorrentFile|null = null
    private readonly _magnet: string|null = null

    constructor(name: string, magnetOrFile: TorrentFile|string) {
        this._uuid = uuidv4()
        this._name = name;
        if ('string' === typeof magnetOrFile) {
            this._magnet = magnetOrFile
        } else {
            this._file = magnetOrFile
        }
    }

    get uuid(): string|null {
        return this._uuid;
    }

    get name(): string {
        return this._name;
    }

    get file(): TorrentFile|null {
        return this._file;
    }

    get magnet(): string|null {
        return this._magnet;
    }
}
