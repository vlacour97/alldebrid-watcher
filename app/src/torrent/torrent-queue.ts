import TorrentList from "./torrent-list";
import Torrent from "./torrent";
import EventEmitter from "events";

export enum TorrentQueueEvent {
    PUSH = 'push',
    PULL = 'pull',
    EVACUATE = 'evacuate'
}

export default class TorrentQueue {
    private readonly outputSize: number;
    private torrentReady: TorrentList = new TorrentList();
    private torrentProcess: TorrentList = new TorrentList();
    private eventEmitter: EventEmitter

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    push (torrents: TorrentList) {
        torrents.forEach((torrent) => {
            this.torrentReady.add(torrent);
            this.eventEmitter.emit(TorrentQueueEvent.PUSH, torrent);
        });
    }

    pull () {
        const torrent = this.torrentReady.get(0)

        this.torrentReady.removeByTorrent(torrent)
        this.torrentProcess.add(torrent)
        this.eventEmitter.emit(TorrentQueueEvent.PULL, torrent);

        return torrent;
    }

    evacuate (torrent: Torrent) {
        this.torrentReady.removeByTorrent(torrent);
        this.torrentProcess.removeByTorrent(torrent);
        this.eventEmitter.emit(TorrentQueueEvent.EVACUATE, torrent);
    }

    on (event: TorrentQueueEvent, callback: (torrent: Torrent) => void): void {
        this.eventEmitter.on(event, callback);
    }
}
