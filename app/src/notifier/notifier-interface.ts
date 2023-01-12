import File from "../file/file";
import {DownloadFile} from "../file/download-file";
import Torrent from "../torrent/torrent";

export enum NotifierType {
    PUSHOVER = 'pushover',
    STDOUT = 'stdout'
}

export default interface NotifierInterface {
    initialize(): void
    notifyOnWatch(file: Torrent): void
    notifyOnDebrid(file: File): void
    notifyOnDownloadStart(file: DownloadFile): void
    notifyOnDownloadProgress(file: DownloadFile, progress: number): void
    notifyOnDownloadDone(file: DownloadFile): void
    notifyOnDownloadError(file: DownloadFile, error: Error): void
    close(): void
}
