import NotifierInterface, {NotifierType} from "./notifier-interface";
import File from "../file/file";
import {DownloadFile} from "../file/download-file";
import Notifier from "./decorator/notifier";
import {ServiceParamType} from "../dependency-injection/param-provider";
import Torrent from "../torrent/torrent";

type Pusher = {
    constructor: (options: object) => object,
    send: (options: {
        title: string,
        message: string
    }) => void
}

@Notifier(
    NotifierType.PUSHOVER,
    [
        {
            id: 'PUSHOVER_USER_TOKEN',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        },
        {
            id: 'PUSHOVER_APP_TOKEN',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        }
    ]
)
export default class PushoverNotifier implements NotifierInterface {
    private pusher: Pusher

    constructor(userToken: string, appToken: string) {
        const Push = require('pushover-notifications')
        this.pusher = new Push({
            user: userToken,
            token: appToken
        })
    }

    initialize(): void {

    }

    notifyOnWatch(torrent: Torrent): void {
        this.pusher.send({
            title: 'New watched file',
            message: `The file "${torrent.name}" has been watched on your server`
        })
    }

    notifyOnDebrid(file: File): void {
        this.pusher.send({
            title: 'New debrided file',
            message: `The file "${file.filename}" has been debrided on your server`
        })
    }

    notifyOnDownloadStart(downloadFile: DownloadFile): void {
        this.pusher.send({
            title: 'Download started !',
            message: `The file "${downloadFile.file.filename}" is being downloaded on your server`
        })
    }

    notifyOnDownloadProgress(): void {
        // Feature unavailable to avoid overquota
    }

    notifyOnDownloadDone(downloadFile: DownloadFile): void {
        this.pusher.send({
            title: 'File downloaded !',
            message: `The file "${downloadFile.file.filename}" has been downloaded on your server`
        })
    }

    notifyOnDownloadError(downloadFile: DownloadFile, error: Error): void {
        this.pusher.send({
            title: 'Download error',
            message: `An error has occured of the downloading of the file "${downloadFile.file.filename}" => ${error.message}`
        })
    }

    close(): void {

    }
}
