import FilesystemWatcher from "./watcher/filesystem-watcher";
import AllDebridDebrider from "./debrider/all-debrid-debrider";
import FilesystemDownloader from "./downloader/filesystem-downloader";
import PushoverNotifier from "./notifier/pushover-notifier";
import StdoutNotifier from "./notifier/stdout-notifier";
import QnapDownloadStationDownloader from "./downloader/qnap-download-station-downloader";

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
        StdoutNotifier
    },
    load: (): void => {

    }
}

export default services;
