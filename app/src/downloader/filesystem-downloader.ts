import DownloaderInterface, {DownloaderType} from "./downloader-interface";
import {DownloadEvent, DownloadFile} from "../file/download-file";
import File from "../file/file";
import EventEmitter from "events";
import Downloader from "./decorator/downloader";
import {ServiceParamType} from "../dependency-injection/param-provider";
import * as fs from "fs";
import { v4 as uuidv4 } from 'uuid';

const progress = require('request-progress')
const request = require('request')

@Downloader(
    DownloaderType.FILESYSTEM,
    [
        {
            id: 'DOWNLOAD_FOLDER',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: '/downloads'
        },
        {
            id: 'MAX_PARALLELS_DOWNLOADS',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: 5
        }
    ]
)
export default class FilesystemDownloader implements DownloaderInterface {
    private readonly downloadFolder: string
    private readonly maxParallelsDownloads: number
    private readonly downloadProcess: {[key: string]: Promise<any>}

    constructor(downloadFolder: string, maxParallelsDownloads: number) {
        this.downloadFolder = downloadFolder;
        this.maxParallelsDownloads = maxParallelsDownloads;
        this.downloadProcess = {};
    }

    async initialize(): Promise<void> {
        if (!fs.existsSync(this.downloadFolder)){
            fs.mkdirSync(this.downloadFolder);
        }
    }

    getDownloadFile(file: File): DownloadFile {
        const eventEmitter = new EventEmitter();
        return new DownloadFile(file, () => {
            this.onDownload(eventEmitter, file);
        }, eventEmitter);
    }

    private onDownload(eventEmitter: EventEmitter, file: File) {
        if (Object.keys(this.downloadProcess).length >= this.maxParallelsDownloads) {
            setTimeout(() => {
                this.onDownload(eventEmitter, file)
            }, 1000);
            return;
        }

        const processId = uuidv4();

        eventEmitter.emit(DownloadEvent.START_DOWNLOAD);

        const downloadProcess = progress(request(file.link))
            .on('progress', (progress: {percent: number}) => {
                eventEmitter.emit(DownloadEvent.PROGRESS, Math.round(progress.percent * 10000) / 100)
            })
            .on('end', () => {
                delete this.downloadProcess[processId]
                eventEmitter.emit(DownloadEvent.DONE)
            })
            .on('error', (error: Error) => {
                eventEmitter.emit(DownloadEvent.ERROR, error)
            })
            .pipe(fs.createWriteStream(this.downloadFolder + '/' + file.filename))

        this.downloadProcess[processId] = downloadProcess;
    }

    async close(): Promise<void> {
    }
}
