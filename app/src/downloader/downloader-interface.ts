import File from "../file/file";
import {DownloadFile} from "../file/download-file";

export enum DownloaderType {
    FILESYSTEM = 'filesystem',
    SYNOLOGY_DS = 'synology_ds',
}

export default interface DownloaderInterface {
    initialize(): Promise<void>
    getDownloadFile(file: File): DownloadFile
    close(): Promise<void>
}
