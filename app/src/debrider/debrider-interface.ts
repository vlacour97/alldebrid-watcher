import Torrent from "../torrent/torrent";
import FileList from "../file/file-list";

export enum DebriderType {
    ALL_DEBRID = 'alldebrid'
}

export default interface DebriderInterface {
    initialize(): void
    getDebridedFiles(torrent: Torrent): Promise<FileList>
    close(): void
}
