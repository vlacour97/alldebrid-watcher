import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import StdoutNotifier from "../../src/notifier/stdout-notifier";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";
import File from "../../src/file/file";
import {DownloadFile} from "../../src/file/download-file";
import FileList from "../../src/file/file-list";

describe(StdoutNotifier.name, () => {
    let notifier: StdoutNotifier;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        // @ts-ignore
        process.stdout.clearLine = jest.fn();

        // @ts-ignore
        process.stdout.cursorTo = jest.fn();

        // @ts-ignore
        process.stdout.write = jest.fn();

        notifier = new StdoutNotifier();
    })

    test('initialize', () => {
        notifier.initialize();

        expect(console.log).toHaveBeenCalledWith('Application started')
    })

    test('notifyOnWatch', () => {
        const torrent: Torrent = mock<Torrent>();

        // @ts-ignore
        torrent.name = 'filename'

        notifier.notifyOnWatch(torrent);

        expect(console.log).toHaveBeenCalledWith('The file "filename" has been watched on your server')
    })

    test('notifyOnDebrid', () => {
        const file: File = mock<File>();

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDebrid(file);

        expect(console.log).toHaveBeenCalledWith('The file "filename" has been debrided on your server')
    })

    test('notifyOnDownloadStart', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDownloadStart(downloadFile);

        expect(console.log).toHaveBeenCalledWith('The file "filename" is being downloaded on your server')
    })

    test('notifyOnDownloadProgress', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDownloadProgress(downloadFile, 50);

        expect(process.stdout.clearLine).toHaveBeenCalledWith(0)
        expect(process.stdout.cursorTo).toHaveBeenCalledWith(0)
        expect(process.stdout.write).toHaveBeenCalledWith(`Downloading of file "filename": 50%\r`)
    })

    test('notifyOnDownloadError', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();
        const error: Error = mock<Error>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        error.message = 'error_message'

        notifier.notifyOnDownloadError(downloadFile, error);

        expect(console.log).toHaveBeenCalledWith('An error has occured of the downloading of the file "filename" => error_message')
    })

    test('notifyOnTorrentError', () => {
        const torrent: Torrent = mock<Torrent>();
        const files: FileList = mock<FileList>();
        const error: Error = mock<Error>();

        // @ts-ignore
        torrent.name = 'foo'

        error.message = 'error_message'

        notifier.notifyOnTorrentError(torrent, files, error);

        expect(console.log).toHaveBeenCalledWith('An error has occured of the downloading of the torrent "foo" => error_message')
    })

    test('notifyOnDownloadDone', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDownloadDone(downloadFile);

        expect(console.log).toHaveBeenCalledWith('The file "filename" has been downloaded on your server')
    })

    test('notifyOnTorrentDone', () => {
        const torrent: Torrent = mock<Torrent>();

        // @ts-ignore
        torrent.name = 'foo';

        notifier.notifyOnTorrentDone(torrent);

        expect(console.log).toHaveBeenCalledWith('The torrent "foo" has been downloaded on your server')
    })

    test('close', () => {
        notifier.close();

        expect(console.log).toHaveBeenCalledWith('Application close')
    })
})
