import File from "../file/file";
import {DownloadFile} from "../file/download-file";
import Torrent from "../torrent/torrent";
import FileList from "../file/file-list";

export enum NotifierType {
    PUSHOVER = 'pushover',
    STDOUT = 'stdout',
    WEBHOOK = 'webhook'
}

export default interface NotifierInterface {
    initialize(): void
    notifyOnWatch(file: Torrent): void
    notifyOnDebrid(file: File): void
    notifyOnDownloadStart(file: DownloadFile): void
    notifyOnDownloadProgress(file: DownloadFile, progress: number): void
    notifyOnDownloadDone(file: DownloadFile): void
    notifyOnTorrentDone(file: Torrent, files: FileList): void
    notifyOnDownloadError(file: DownloadFile, error: Error): void
    notifyOnTorrentError(file: Torrent, files: FileList, error: Error): void
    close(): void
}
