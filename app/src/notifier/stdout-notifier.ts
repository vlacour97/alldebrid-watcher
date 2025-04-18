import NotifierInterface, {NotifierType} from "./notifier-interface";
import File from "../file/file";
import {DownloadFile} from "../file/download-file";
import Notifier from "./decorator/notifier";
import Torrent from "../torrent/torrent";

@Notifier(NotifierType.STDOUT)
export default class StdoutNotifier implements NotifierInterface {
    initialize(): void {
        console.log('Application started')
    }

    notifyOnWatch(torrent: Torrent): void {
        console.log(`The file "${torrent.name}" has been watched on your server`)
    }

    notifyOnDebrid(file: File): void {
        console.log(`The file "${file.filename}" has been debrided on your server`)
    }

    notifyOnDownloadStart(downloadFile: DownloadFile): void {
        console.log(`The file "${downloadFile.file.filename}" is being downloaded on your server`)
    }

    notifyOnDownloadProgress(downloadFile: DownloadFile, progress: number): void {
        if (undefined !== process.stdout.clearLine && undefined !== process.stdout.cursorTo) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
        }
        process.stdout.write(`Downloading of file "${downloadFile.file.filename}": ${progress}%\r`);
    }

    notifyOnDownloadDone(downloadFile: DownloadFile): void {
        console.log(`The file "${downloadFile.file.filename}" has been downloaded on your server`)
    }

    notifyOnDownloadError(downloadFile: DownloadFile, error: Error): void {
        console.log(`An error has occured of the downloading of the file "${downloadFile.file.filename}" => ${error.message}`)
    }

    close(): void {
        console.log('Application close')
    }
}
