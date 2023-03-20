import Service from "../dependency-injection/decorator/service";
import {ServiceParamFilters, ServiceParamType} from "../dependency-injection/param-provider";
import NotifierInterface, {NotifierType} from "./notifier-interface";
import Torrent from "../torrent/torrent";
import File from "../file/file";
import {DownloadFile} from "../file/download-file";
import {ServiceLabel} from "../dependency-injection/app-container";
import Container from "../dependency-injection/container";

export type NotificationType = "watch"|"debrid"|"download_start"|"download_progress"|"download_done"|"download_error"

type NotifierServiceConfig = {
    [key: string]: "all"|NotificationType[]
}

@Service(
    NotifierStrategy.name,
    [
        {
            id: 'NOTIFIER_SERVICES',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            filter: ServiceParamFilters.SPLIT_COMMA_SEPARATOR,
            default: NotifierType.STDOUT
        },
        {
            id: 'NOTIFIER_SERVICES_CONFIG',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            filter: ServiceParamFilters.JSON,
            default: {}
        },
        {
            id: ServiceLabel.NOTIFIER,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export class NotifierStrategy implements NotifierInterface {
    private notifierList: string[]
    private notifierConfig: NotifierServiceConfig
    private notifierContainer: Container

    constructor(notifierList: string[], notifierConfig: NotifierServiceConfig, notifierContainer: Container) {
        this.notifierList = notifierList;
        this.notifierConfig = notifierConfig;
        this.notifierContainer = notifierContainer;
    }

    initialize(): void {
        for (const notifierName of this.notifierList) {
            this.notifierContainer.get(notifierName).initialize()
        }
    }

    notifyOnWatch(torrent: Torrent): void {
        for (const notifierName of this.notifierList) {
            if (this.notifyService(notifierName, 'watch')) {
                this.notifierContainer.get(notifierName).notifyOnWatch(torrent)
            }
        }
    }

    notifyOnDebrid(file: File): void {
        for (const notifierName of this.notifierList) {
            if (this.notifyService(notifierName, 'debrid')) {
                this.notifierContainer.get(notifierName).notifyOnDebrid(file)
            }
        }
    }

    notifyOnDownloadStart(downloadFile: DownloadFile): void {
        for (const notifierName of this.notifierList) {
            if (this.notifyService(notifierName, 'download_start')) {
                this.notifierContainer.get(notifierName).notifyOnDownloadStart(downloadFile)
            }
        }
    }

    notifyOnDownloadProgress(downloadFile: DownloadFile, progress: number): void {
        for (const notifierName of this.notifierList) {
            if (this.notifyService(notifierName, 'download_progress')) {
                this.notifierContainer.get(notifierName).notifyOnDownloadProgress(downloadFile, progress)
            }
        }
    }

    notifyOnDownloadDone(downloadFile: DownloadFile): void {
        for (const notifierName of this.notifierList) {
            if (this.notifyService(notifierName, 'download_done')) {
                this.notifierContainer.get(notifierName).notifyOnDownloadDone(downloadFile)
            }
        }
    }

    notifyOnDownloadError(downloadFile: DownloadFile, error: Error): void {
        for (const notifierName of this.notifierList) {
            if (this.notifyService(notifierName, 'download_error')) {
                this.notifierContainer.get(notifierName).notifyOnDownloadError(downloadFile, error)
            }
        }
    }

    close(): void {
        for (const notifierName of this.notifierList) {
            this.notifierContainer.get(notifierName).close()
        }
    }

    private notifyService(notifierName: string, type: NotificationType): boolean {
        return undefined === this.notifierConfig[notifierName]
            || 'all' === this.notifierConfig[notifierName]
            || this.notifierConfig[notifierName].includes(type);
    }
}
