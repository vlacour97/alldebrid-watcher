import File from "../file/file";
import {DownloadFile} from "../file/download-file";

export enum DownloaderType {
    FILESYSTEM = 'filesystem',
    QNAP_DOWNLOAD_STATION = 'qnap_download_station'
}

export default interface DownloaderInterface {
    initialize(): void
    getDownloadFile(file: File): DownloadFile
    close(): void
}
