import WatcherInterface, {WatcherType} from "./watcher-interface";
import TorrentQueue, {TorrentQueueEvent} from "../torrent/torrent-queue";
import watch from "node-watch";
import * as fs from "fs";
import {FSWatcher} from "fs";
import Torrent from "../torrent/torrent";
import TorrentList from "../torrent/torrent-list";
import TorrentFile from "../torrent/torrent-file";
import Watcher from "./decorator/watcher";
import {ServiceParamFilters, ServiceParamType} from "../dependency-injection/param-provider";

@Watcher(
    WatcherType.FILESYSTEM,
    [
        {
            id: 'TORRENT_FOLDER',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: '/torrents'
        },
        {
            id: 'REMOVE_TORRENT_AFTER_DOWNLOAD',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            filter: ServiceParamFilters.BOOLEAN,
            default: false
        }
    ]
)
export default class FilesystemWatcher implements WatcherInterface {
    private watcher: FSWatcher

    constructor(
        private readonly torrentPath: string,
        private readonly removeAfterDownload: boolean
    ) {
    }

    initialize(torrentQueue: TorrentQueue): void {
        if (!fs.existsSync(this.torrentPath)){
            fs.mkdirSync(this.torrentPath);
        }

        if (this.removeAfterDownload) {
            torrentQueue.on(TorrentQueueEvent.EVACUATE, (torrent) => {
                fs.unlink(torrent.file.fileName, (err) => {
                    if (null !== err) {
                        console.error(err);
                    }
                });
            })
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
