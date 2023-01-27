import TorrentQueue from "../torrent/torrent-queue";

export enum WatcherType {
    FILESYSTEM = 'filesystem'
}

export default interface WatcherInterface {
    initialize(): void
    start(torrentQueue: TorrentQueue): void
    stop(): void
    close(): void
}
