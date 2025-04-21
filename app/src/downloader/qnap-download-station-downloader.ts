import DownloaderInterface, {DownloaderType} from "./downloader-interface";
import {DownloadEvent, DownloadFile} from "../file/download-file";
import File from "../file/file";
import EventEmitter from "events";
import Downloader from "./decorator/downloader";
import {ServiceParamType} from "../dependency-injection/param-provider";
import QnapClient from "./qnap/qnap-client";
import { v4 as uuidv4 } from 'uuid';
import {clearInterval} from "node:timers";
import CachedQnapClient from "./qnap/cached-qnap-client";

@Downloader(
    DownloaderType.QNAP_DOWNLOAD_STATION,
    [
        {
            id: 'TEMPORARY_FOLDER',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
        },
        {
            id: 'DOWNLOAD_FOLDER',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
        },
        {
            id: 'QNAP_SESSION_TIMEOUT',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: 1200
        },
        {
            id: CachedQnapClient.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export default class QnapDownloadStationDownloader implements DownloaderInterface {
    constructor(
        private readonly temporaryFolder: string,
        private readonly downloadFolder: string,
        private readonly sessionTimeout: number,
        private readonly client: QnapClient,
    ) {

    }

    initialize(): void {
        this.client.login();

        setInterval(() => {
            this.client.login();
        }, this.sessionTimeout * 1000)
    }

    getDownloadFile(file: File): DownloadFile {
        const eventEmitter = new EventEmitter();
        return new DownloadFile(file, () => {
            this.onDownload(eventEmitter, file);
        }, eventEmitter);
    }

    private onDownload(eventEmitter: EventEmitter, file: File) {
        eventEmitter.emit(DownloadEvent.START_DOWNLOAD);

        const fileLink = file.link + '?process=' + uuidv4();

        try {
            this.client.taskAddUrl(fileLink, this.temporaryFolder, this.downloadFolder);

            const interval = setInterval(async () => {
                const task = await this.client.getTaskWithUrl(fileLink);

                if (null === task || 5 === task.state || 0 !== task.error) {
                    clearInterval(interval);
                }

                switch (true) {
                    case undefined === task:
                    case 0 !== task.error:
                        eventEmitter.emit(DownloadEvent.ERROR, 'Error occured on ' + file.filename + ' downloading');
                        break;
                    case 5 === task.state:
                        eventEmitter.emit(DownloadEvent.DONE);
                        break;
                    case task.progress < 100:
                        eventEmitter.emit(DownloadEvent.PROGRESS, task.progress);
                        break;
                }
            }, 1000)
        } catch (error) {
            eventEmitter.emit(DownloadEvent.ERROR, error);
        }
    }

    close(): void {
    }
}
