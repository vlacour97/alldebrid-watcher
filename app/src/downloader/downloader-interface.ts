import File from "../file/file";
import {DownloadFile} from "../file/download-file";

export enum DownloaderType {
    FILESYSTEM = 'filesystem'
}

export default interface DownloaderInterface {
    initialize(): void
    getDownloadFile(file: File): DownloadFile
    close(): void
}
