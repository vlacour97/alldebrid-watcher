import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import Container from "../../src/dependency-injection/container";
import {mock} from "jest-mock-extended";
import {NotifierStrategy} from "../../src/notifier/notifier-strategy";
import Torrent from "../../src/torrent/torrent";
import NotifierInterface from "../../src/notifier/notifier-interface";
import File from "../../src/file/file";
import {DownloadFile} from "../../src/file/download-file";
import FileList from "../../src/file/file-list";

describe(NotifierStrategy.name, () => {
    let container: Container;
    let notifier: NotifierStrategy;

    beforeEach(() => {
        container = mock<Container>();
        notifier = new NotifierStrategy(
            ['foo', 'foo1', 'foo2'],
            {
                foo: "all",
                foo1: ["watch", "download_start", "torrent_error", "torrent_done"],
                foo2: ["debrid", "download_progress", "download_done", "download_error"]
            },
            container
        )
    })

    test('initialize', () => {
        const subNotifier: NotifierInterface = mock<NotifierInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subNotifier)

        notifier.initialize();

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo1');
        expect(container.get).toHaveBeenNthCalledWith(3, 'foo2');
        expect(subNotifier.initialize).toHaveBeenCalledTimes(3)
    })

    test('notifyOnWatch', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const torrent: Torrent = mock<Torrent>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnWatch(torrent);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo1');
        expect(subNotifier1.notifyOnWatch).toHaveBeenCalledWith(torrent)
        expect(subNotifier2.notifyOnWatch).toHaveBeenCalledWith(torrent)
    })

    test('notifyOnDebrid', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const file: File = mock<File>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnDebrid(file);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo2');
        expect(subNotifier1.notifyOnDebrid).toHaveBeenCalledWith(file)
        expect(subNotifier2.notifyOnDebrid).toHaveBeenCalledWith(file)
    })

    test('notifyOnDownloadStart', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const downloadFile: DownloadFile = mock<DownloadFile>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnDownloadStart(downloadFile);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo1');
        expect(subNotifier1.notifyOnDownloadStart).toHaveBeenCalledWith(downloadFile)
        expect(subNotifier2.notifyOnDownloadStart).toHaveBeenCalledWith(downloadFile)
    })

    test('notifyOnDownloadProgress', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const downloadFile: DownloadFile = mock<DownloadFile>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnDownloadProgress(downloadFile, 50);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo2');
        expect(subNotifier1.notifyOnDownloadProgress).toHaveBeenCalledWith(downloadFile, 50)
        expect(subNotifier2.notifyOnDownloadProgress).toHaveBeenCalledWith(downloadFile, 50)
    })

    test('notifyOnDownloadError', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const error: Error = mock<Error>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnDownloadError(downloadFile, error);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo2');
        expect(subNotifier1.notifyOnDownloadError).toHaveBeenCalledWith(downloadFile, error)
        expect(subNotifier2.notifyOnDownloadError).toHaveBeenCalledWith(downloadFile, error)
    })

    test('notifyOnTorrentError', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const torrent: Torrent = mock<Torrent>();
        const files: FileList = mock<FileList>();
        const error: Error = mock<Error>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnTorrentError(torrent, files, error);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo1');
        expect(subNotifier1.notifyOnTorrentError).toHaveBeenCalledWith(torrent, files, error)
        expect(subNotifier2.notifyOnTorrentError).toHaveBeenCalledWith(torrent, files, error)
    })

    test('notifyOnDownloadDone', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const downloadFile: DownloadFile = mock<DownloadFile>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnDownloadDone(downloadFile);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo2');
        expect(subNotifier1.notifyOnDownloadDone).toHaveBeenCalledWith(downloadFile)
        expect(subNotifier2.notifyOnDownloadDone).toHaveBeenCalledWith(downloadFile)
    })

    test('notifyOnTorrentDone', () => {
        const subNotifier1: NotifierInterface = mock<NotifierInterface>();
        const subNotifier2: NotifierInterface = mock<NotifierInterface>();
        const torrent: Torrent = mock<Torrent>();
        const files: FileList = mock<FileList>();

        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier1)
        jest.spyOn(container, 'get').mockReturnValueOnce(subNotifier2)

        notifier.notifyOnTorrentDone(torrent, files);

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo1');
        expect(subNotifier1.notifyOnTorrentDone).toHaveBeenCalledWith(torrent, files)
        expect(subNotifier2.notifyOnTorrentDone).toHaveBeenCalledWith(torrent, files)
    })

    test('close', () => {
        const subNotifier: NotifierInterface = mock<NotifierInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subNotifier)

        notifier.close();

        expect(container.get).toHaveBeenNthCalledWith(1, 'foo');
        expect(container.get).toHaveBeenNthCalledWith(2, 'foo1');
        expect(container.get).toHaveBeenNthCalledWith(3, 'foo2');
        expect(subNotifier.close).toHaveBeenCalledTimes(3)
    })
})
