import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";
import File from "../../src/file/file";
import {DownloadFile} from "../../src/file/download-file";
import WebhookNotifier from "../../src/notifier/webhook-notifier";
import axios from "axios";

jest.mock('axios');
describe(WebhookNotifier.name, () => {
    let notifier: WebhookNotifier;
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        jest.clearAllMocks();
        notifier = new WebhookNotifier(
            'webhook_endpoint'
        );
    })

    test('initialize', () => {
        notifier.initialize();
        expect(mockedAxios.post).not.toBeCalled();
    })

    test('notifyOnWatch', () => {
        const torrent: Torrent = mock<Torrent>();

        // @ts-ignore
        torrent.name = 'filename'

        notifier.notifyOnWatch(torrent);

        expect(mockedAxios.post).toBeCalledWith('webhook_endpoint', {
            action: 'watch',
            file: 'filename'
        });
    })

    test('notifyOnDebrid', () => {
        const file: File = mock<File>();

        // @ts-ignore
        file.filename = 'filename'
        // @ts-ignore
        file.link = 'file_url'

        notifier.notifyOnDebrid(file);

        expect(mockedAxios.post).toBeCalledWith('webhook_endpoint', {
            action: 'debrid',
            file: 'filename',
            url: 'file_url',
        });
    })

    test('notifyOnDownloadStart', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'
        // @ts-ignore
        file.link = 'file_url'

        notifier.notifyOnDownloadStart(downloadFile);

        expect(mockedAxios.post).toBeCalledWith('webhook_endpoint', {
            action: 'download_start',
            file: 'filename',
            url: 'file_url',
        });
    })

    test('notifyOnDownloadProgress', () => {
        notifier.notifyOnDownloadProgress();

        expect(mockedAxios.post).not.toBeCalled();
    })

    test('notifyOnDownloadError', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();
        const error: Error = mock<Error>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'
        // @ts-ignore
        file.link = 'file_url'

        error.message = 'error_message'

        notifier.notifyOnDownloadError(downloadFile, error);

        expect(mockedAxios.post).toBeCalledWith('webhook_endpoint', {
            action: 'download_error',
            file: 'filename',
            url: 'file_url',
            message: 'error_message'
        });
    })

    test('notifyOnDownloadDone', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'
        // @ts-ignore
        file.link = 'file_url'

        notifier.notifyOnDownloadDone(downloadFile);

        expect(mockedAxios.post).toBeCalledWith('webhook_endpoint', {
            action: 'download_done',
            file: 'filename',
            url: 'file_url',
        });
    })

    test('close', () => {
        notifier.close();

        expect(mockedAxios.post).not.toBeCalled();
    })
})
