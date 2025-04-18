import FilesystemWatcher from "./watcher/filesystem-watcher";
import AllDebridDebrider from "./debrider/all-debrid-debrider";
import FilesystemDownloader from "./downloader/filesystem-downloader";
import PushoverNotifier from "./notifier/pushover-notifier";
import StdoutNotifier from "./notifier/stdout-notifier";
import QnapDownloadStationDownloader from "./downloader/qnap-download-station-downloader";
import WebhookNotifier from "./notifier/webhook-notifier";

/**
 * Declaration of services
 */

const services = {
    watchers: {
        FilesystemWatcher
    },
    debrider: {
        AllDebridDebrider
    },
    downloader: {
        FilesystemDownloader,
        QnapDownloadStationDownloader
    },
    notifier: {
        PushoverNotifier,
        StdoutNotifier,
        WebhookNotifier
    },
    load: (): void => {

    }
}

export default services;
