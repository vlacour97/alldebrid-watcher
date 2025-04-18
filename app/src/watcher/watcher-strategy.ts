import WatcherInterface, {WatcherType} from "./watcher-interface";
import Service from "../dependency-injection/decorator/service";
import {ServiceParamType} from "../dependency-injection/param-provider";
import {ServiceLabel} from "../dependency-injection/app-container";
import TorrentQueue from "../torrent/torrent-queue";
import Container from "../dependency-injection/container";

@Service(
    WatcherStrategy.name,
    [
        {
            id: 'WATCHER_SERVICE',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: WatcherType.FILESYSTEM
        },
        {
            id: ServiceLabel.WATCHER,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export default class WatcherStrategy implements WatcherInterface {
    private watcherType: string
    private watcherContainer: Container

    constructor(watcherType: string, watcherContainer: Container) {
        this.watcherType = watcherType;
        this.watcherContainer = watcherContainer;
    }

    initialize(torrentQueue: TorrentQueue): void {
        this.watcherContainer.get(this.watcherType).initialize(torrentQueue);
    }

    start(torrentQueue: TorrentQueue): void {
        this.watcherContainer.get(this.watcherType).start(torrentQueue);
    }

    stop(): void {
        this.watcherContainer.get(this.watcherType).stop();
    }

    close(): void {
        this.watcherContainer.get(this.watcherType).close();
    }
}
