import NotifierInterface, {NotifierType} from "./notifier-interface";
import File from "../file/file";
import {DownloadFile} from "../file/download-file";
import Torrent from "../torrent/torrent";
import Notifier from "./decorator/notifier";
import {ServiceParamType} from "../dependency-injection/param-provider";
import axios from "axios";
import {NotificationType} from "./notifier-strategy";
import FileList from "../file/file-list";

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
    constructor(private readonly endpoint: string) {
    }

    close(): void {
    }

    initialize(): void {
    }

    private notify(type: NotificationType, payload: object) {
        axios.post(this.endpoint, {
            type: type,
            ...payload
        })
    }

    notifyOnDebrid(file: File): void {
        this.notify('debrid', {
            filename: file.filename,
            link: file.link
        });
    }

    notifyOnDownloadDone(file: DownloadFile): void {
        this.notify('download_done', {
            filename: file.file.filename,
            link: file.file.link
        });
    }

    notifyOnDownloadError(file: DownloadFile, error: Error): void {
        this.notify('download_error', {
            filename: file.file.filename,
            link: file.file.link,
            error: error
        });
    }

    notifyOnDownloadProgress(): void {
        // Feature unavailable to avoid overquota
    }

    notifyOnDownloadStart(file: DownloadFile): void {
        this.notify('download_start', {
            filename: file.file.filename,
            link: file.file.link
        });
    }

    notifyOnTorrentDone(file: Torrent, files: FileList): void {
        this.notify('torrent_done', {
            torrent_name: file.name,
            files: files.map((element) => element.filename)
        });
    }

    notifyOnTorrentError(file: Torrent, files: FileList, error: Error): void {
        this.notify('torrent_error', {
            torrent_name: file.name,
            files: files.map((element) => element.filename),
            error: error
        });
    }

    notifyOnWatch(file: Torrent): void {
        this.notify('watch', {
            torrent_name: file.name,
        });
    }
}
