import Container from "./container";

export enum ServiceLabel {
    WATCHER = 'watcher',
    DEBRIDER = 'debrider',
    DOWNLOADER = 'downloader',
    NOTIFIER = 'notifier'
}

const appContainer = new Container();

export default appContainer;
