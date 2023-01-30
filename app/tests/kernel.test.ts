import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import Kernel from "../src/kernel";
import DebriderInterface from "../src/debrider/debrider-interface";
import DownloaderInterface from "../src/downloader/downloader-interface";
import WatcherInterface from "../src/watcher/watcher-interface";
import NotifierInterface from "../src/notifier/notifier-interface";
import {mock} from "jest-mock-extended";
import TorrentQueue from "../src/torrent/torrent-queue";
import Torrent from "../src/torrent/torrent";
import TorrentList from "../src/torrent/torrent-list";
import File from "../src/file/file";
import FileList from "../src/file/file-list";
import {DownloadEvent, DownloadFile} from "../src/file/download-file";

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe(Kernel.name, () => {
    let kernel: Kernel
    let debrider: DebriderInterface;
    let downloader: DownloaderInterface;
    let watcher: WatcherInterface;
    let notifier: NotifierInterface;

    beforeEach(() => {
        debrider = mock<DebriderInterface>()
        downloader = mock<DownloaderInterface>()
        watcher = mock<WatcherInterface>()
        notifier = mock<NotifierInterface>()
        kernel = new Kernel(watcher, debrider, downloader, notifier, 1000);
    })


    test('init', async () => {
        jest.spyOn(process, 'on')

        await kernel.init();

        expect(debrider.initialize).toBeCalled();
        expect(downloader.initialize).toBeCalled();
        expect(watcher.initialize).toBeCalled();
        expect(notifier.initialize).toBeCalled();
        expect(process.on).toBeCalledWith('SIGINT', expect.anything());
    })

    test('boot', async () => {
        const torrent: Torrent = mock<Torrent>();
        const file: File = mock<File>();
        const downloadFile: DownloadFile = mock<DownloadFile>()
        const downloadError: Error = mock<Error>()

        watcher.start = (torrentQueue: TorrentQueue) => {
            torrentQueue.push(new TorrentList([torrent]))
        }
        debrider.getDebridedFiles = (t: Torrent) => {
            expect(t).toStrictEqual(torrent);

            return new Promise((resolve) => resolve(new FileList([file])));
        }
        downloader.getDownloadFile = (f: File) => {
            expect(f).toStrictEqual(file);

            return downloadFile
        }
        downloadFile.on = jest.fn((eventName: DownloadEvent, callable: (DownloadFile, ...any) => void) => {
            switch (eventName) {
                case DownloadEvent.START_DOWNLOAD:
                case DownloadEvent.DONE:
                    callable(downloadFile);
                    break;
                case DownloadEvent.ERROR:
                    callable(downloadFile, downloadError)
                    break;
                case DownloadEvent.PROGRESS:
                    callable(downloadFile, 50);
            }
        })

        kernel.boot();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(notifier.notifyOnWatch).toBeCalledWith(torrent)
        expect(notifier.notifyOnDebrid).toBeCalledWith(file)
        expect(notifier.notifyOnDownloadStart).toBeCalledWith(downloadFile)
        expect(notifier.notifyOnDownloadProgress).toBeCalledWith(downloadFile, 50)
        expect(notifier.notifyOnDownloadError).toBeCalledWith(downloadFile, downloadError)
        expect(notifier.notifyOnDownloadDone).toBeCalledWith(downloadFile)
        expect(downloadFile.startDownload).toBeCalled()
        expect(downloadFile.on).toHaveBeenNthCalledWith(1, DownloadEvent.START_DOWNLOAD, expect.anything())
        expect(downloadFile.on).toHaveBeenNthCalledWith(2, DownloadEvent.PROGRESS, expect.anything())
        expect(downloadFile.on).toHaveBeenNthCalledWith(3, DownloadEvent.ERROR, expect.anything())
        expect(downloadFile.on).toHaveBeenNthCalledWith(4, DownloadEvent.DONE, expect.anything())
    })

    test('exit', async () => {
        jest.spyOn(process, 'exit').mockImplementation((code?: number): never => {throw new Error()})

        try {
            await kernel.onExit();
        } catch (error) {

        }

        expect(debrider.close).toBeCalled();
        expect(downloader.close).toBeCalled();
        expect(watcher.close).toBeCalled();
        expect(notifier.close).toBeCalled();
        expect(process.exit).toBeCalled();
    })
})
