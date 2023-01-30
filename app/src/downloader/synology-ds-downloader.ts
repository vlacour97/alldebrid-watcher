import Downloader from "./decorator/downloader";
import DownloaderInterface, {DownloaderType} from "./downloader-interface";
import {ServiceParamType} from "../dependency-injection/param-provider";
import {DownloadEvent, DownloadFile} from "../file/download-file";
import SynologyDsClient from "./synology/synology-ds-client";
import EventEmitter from "events";
import File from "../file/file";

@Downloader(
    DownloaderType.SYNOLOGY_DS,
    [
        {
            id: SynologyDsClient.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export default class SynologyDsDownloader implements DownloaderInterface {
    private readonly client: SynologyDsClient;

    constructor(client: SynologyDsClient) {
        this.client = client;
    }

    async initialize(): Promise<void> {
        await this.client.initClient();
    }

    getDownloadFile(file: File): DownloadFile {
        const eventEmitter = new EventEmitter();
        return new DownloadFile(file, () => {
            this.onDownload(eventEmitter, file);
        }, eventEmitter);
    }

    private async onDownload(eventEmitter: EventEmitter, file: File) {
        await this.client.launchDownload(file.link);
        eventEmitter.emit(DownloadEvent.START_DOWNLOAD);

        const interval = setInterval(async () => {
            try {
                if ('finished' === await this.client.getStatus(file.link)) {
                    eventEmitter.emit(DownloadEvent.DONE);
                    clearInterval(interval);
                } // TODO manage progress
            } catch (error) {
                eventEmitter.emit(DownloadEvent.ERROR, error);
                clearInterval(interval);
            }
        }, 3000);
    }

    async close(): Promise<void> {
        await this.client.closeClient();
    }
}