import Service from "./dependency-injection/decorator/service";
import WatcherStrategy from "./watcher/watcher-strategy";
import {ServiceParamType} from "./dependency-injection/param-provider";
import DebriderStrategy from "./debrider/debrider-strategy";
import DownloaderStrategy from "./downloader/downloader-strategy";
import {NotifierStrategy} from "./notifier/notifier-strategy";
import services from "./services";
import WatcherInterface from "./watcher/watcher-interface";
import DebriderInterface from "./debrider/debrider-interface";
import DownloaderInterface from "./downloader/downloader-interface";
import NotifierInterface from "./notifier/notifier-interface";
import File from "./file/file";
import {DownloadEvent, DownloadFile} from "./file/download-file";
import TorrentQueue from "./torrent/torrent-queue";

services.load()

@Service(
    Kernel.name,
    [
        {
            id: WatcherStrategy.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        },
        {
            id: DebriderStrategy.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        },
        {
            id: DownloaderStrategy.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        },
        {
            id: NotifierStrategy.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        },
        {
            id: 'LOOP_DURATION',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: 1000
        }
    ]
)
export default class Kernel {
    private watcher: WatcherInterface
    private debrider: DebriderInterface
    private downloader: DownloaderInterface
    private notifier: NotifierInterface
    private loopDuration: number
    private torrentQueue: TorrentQueue

    constructor(watcher: WatcherInterface, debrider: DebriderInterface, downloader: DownloaderInterface, notifier: NotifierInterface, loopDuration: number) {
        this.watcher = watcher;
        this.debrider = debrider;
        this.downloader = downloader;
        this.notifier = notifier;
        this.loopDuration = loopDuration;
        this.torrentQueue = new TorrentQueue();
    }

    async init() {
        this.watcher.initialize();
        this.debrider.initialize();
        await this.downloader.initialize();
        this.notifier.initialize();

        process.on('SIGINT', this.onExit.bind(this));
    }

    boot() {
        this.watcher.start(this.torrentQueue);

        setInterval(async () => {
            const torrent = this.torrentQueue.pull();

            if (null !== torrent) {
                this.notifier.notifyOnWatch(torrent)

                const files = await this.debrider.getDebridedFiles(torrent)

                files.forEach((file: File) => {
                    this.notifier.notifyOnDebrid(file)

                    const downloadFile = this.downloader.getDownloadFile(file);
                    downloadFile.on(
                        DownloadEvent.START_DOWNLOAD,
                        (downloadFile: DownloadFile) => this.notifier.notifyOnDownloadStart(downloadFile)
                    )
                    downloadFile.on(
                        DownloadEvent.PROGRESS,
                        (downloadFile: DownloadFile, progress: number) => this.notifier.notifyOnDownloadProgress(downloadFile, progress)
                    )
                    downloadFile.on(
                        DownloadEvent.ERROR,
                        (downloadFile: DownloadFile, error: Error) => this.notifier.notifyOnDownloadError(downloadFile, error)
                    )
                    downloadFile.on(
                        DownloadEvent.DONE,
                        (downloadFile: DownloadFile) => this.notifier.notifyOnDownloadDone(downloadFile)
                    )

                    downloadFile.startDownload();
                })
            }
        }, this.loopDuration)
    }

    async onExit() {
        this.watcher.close();
        this.debrider.close();
        await this.downloader.close();
        this.notifier.close();

        process.exit(0);
    }
}
