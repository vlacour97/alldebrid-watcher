import WatcherInterface, {WatcherType} from "./watcher-interface";
import TorrentQueue from "../torrent/torrent-queue";
import watch from "node-watch";
import * as fs from "fs";
import Torrent from "../torrent/torrent";
import TorrentList from "../torrent/torrent-list";
import TorrentFile from "../torrent/torrent-file";
import Watcher from "./decorator/watcher";
import {FSWatcher} from "fs";
import {ServiceParamType} from "../dependency-injection/param-provider";

@Watcher(
    WatcherType.FILESYSTEM,
    [
        {
            id: 'TORRENT_FOLDER',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: '/torrents'
        }
    ]
)
export default class FilesystemWatcher implements WatcherInterface {
    private readonly torrentPath: string
    private watcher: FSWatcher

    constructor(torrentPath: string) {
        this.torrentPath = torrentPath;
    }

    initialize(): void {
        if (!fs.existsSync(this.torrentPath)){
            fs.mkdirSync(this.torrentPath);
        }
    }

    start(torrentQueue: TorrentQueue): void {
        this.watcher = watch(this.torrentPath, { recursive: true }, (event: any, name: string) => {
            if (event === 'update' && name.match(/.torrent$/)) {
                fs.readFile(name, (err, buffer) => {
                    if (err) {
                        throw err;
                    }

                    torrentQueue.push(new TorrentList([new Torrent(name, new TorrentFile(name, buffer))]))
                })
            }
        })
    }

    stop(): void {
        this.watcher.close();
    }

    close(): void {
        this.stop();
    }
}
