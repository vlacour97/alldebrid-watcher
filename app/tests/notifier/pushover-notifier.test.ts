import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";
import File from "../../src/file/file";
import {DownloadFile} from "../../src/file/download-file";
import PushoverNotifier from "../../src/notifier/pushover-notifier";

jest.mock('pushover-notifications');
describe(PushoverNotifier.name, () => {
    let notifier: PushoverNotifier;
    let pushoverSendMethod;

    beforeEach(() => {
        pushoverSendMethod = jest.fn()
        notifier = new PushoverNotifier('userToken', 'appToken');

        // @ts-ignore
        notifier.pusher = {
            send: pushoverSendMethod
        }
    })

    test('initialize', () => {
        notifier.initialize();
    })

    test('notifyOnWatch', () => {
        const torrent: Torrent = mock<Torrent>();

        // @ts-ignore
        torrent.name = 'filename'

        notifier.notifyOnWatch(torrent);

        expect(pushoverSendMethod).toHaveBeenCalledWith({
            title: 'New file was watched',
            message: `The file "filename" has been watched on your server`
        })
    })

    test('notifyOnDebrid', () => {
        const file: File = mock<File>();

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDebrid(file);

        expect(pushoverSendMethod).toHaveBeenCalledWith({
            title: 'New file was debrided',
            message: `The file "filename" has been debrided on your server`
        })
    })

    test('notifyOnDownloadStart', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDownloadStart(downloadFile);

        expect(pushoverSendMethod).toHaveBeenCalledWith({
            title: 'Download started',
            message: `The download of file "filename" has been started on your server`
        })
    })

    test('notifyOnDownloadProgress (voluntarily unused for pushover)', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        // @ts-ignore
        notifier.notifyOnDownloadProgress(downloadFile, 50);

        expect(pushoverSendMethod).not.toHaveBeenCalled()
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

        expect(pushoverSendMethod).toHaveBeenCalledWith({
            title: 'Download error',
            message: `An error has occured of the downloading of the file "filename" => error_message`
        })
    })

    test('notifyOnDownloadDone', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDownloadDone(downloadFile);

        expect(pushoverSendMethod).toHaveBeenCalledWith({
            title: 'Download finish',
            message: `The file "filename" has been downloaded on your server`
        })
    })

    test('close', () => {
        notifier.close();
    })
})
