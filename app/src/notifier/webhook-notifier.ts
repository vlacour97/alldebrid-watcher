import Notifier from "./decorator/notifier";
import NotifierInterface, {NotifierType} from "./notifier-interface";
import {ServiceParamType} from "../dependency-injection/param-provider";
import Torrent from "../torrent/torrent";
import {DownloadFile} from "../file/download-file";
import File from "../file/file";
import {NotificationType} from "./notifier-strategy";
import axios from "axios";

@Notifier(
    NotifierType.WEBHOOK,
    [
        {
            id: 'WEBHOOK_ENDPOINT',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        }
    ]
)
export default class WebhookNotifier implements NotifierInterface {
    constructor(private endpoint: string) {}

    private notify(action: NotificationType, data: object) {
        axios.post(this.endpoint, {action, ...data});
    }

    initialize(): void {
    }

    notifyOnWatch(file: Torrent): void {
        this.notify('watch', {
            file: file.name
        })
    }

    notifyOnDebrid(file: File): void {
        this.notify('debrid', {
            file: file.filename,
            url: file.link
        })
    }

    notifyOnDownloadStart(file: DownloadFile): void {
        this.notify('download_start', {
            file: file.file.filename,
            url: file.file.link
        })
    }

    notifyOnDownloadProgress(): void {
        // Feature unavailable to avoid overquota
    }

    notifyOnDownloadDone(file: DownloadFile): void {
        this.notify('download_done', {
            file: file.file.filename,
            url: file.file.link
        })
    }

    notifyOnDownloadError(file: DownloadFile, error: Error): void {
        this.notify('download_error', {
            file: file.file.filename,
            url: file.file.link,
            message: error.message
        })
    }

    close(): void {
    }

}