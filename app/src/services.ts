import FilesystemWatcher from "./watcher/filesystem-watcher";
import AllDebridDebrider from "./debrider/all-debrid-debrider";
import FilesystemDownloader from "./downloader/filesystem-downloader";
import PushoverNotifier from "./notifier/pushover-notifier";
import StdoutNotifier from "./notifier/stdout-notifier";

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
        FilesystemDownloader
    },
    notifier: {
        PushoverNotifier,
        StdoutNotifier
    },
    load: (): void => {

    }
}

export default services;
