import Torrent from "../torrent/torrent";
import FileList from "../file/file-list";
import TorrentQueue from "../torrent/torrent-queue";

export enum DebriderType {
    ALL_DEBRID = 'alldebrid'
}

export default interface DebriderInterface {
    initialize(torrentQueue: TorrentQueue): void
    getDebridedFiles(torrent: Torrent): Promise<FileList>
    close(): void
}
