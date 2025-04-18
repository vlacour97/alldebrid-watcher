import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import StdoutNotifier from "../../src/notifier/stdout-notifier";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";
import File from "../../src/file/file";
import {DownloadFile} from "../../src/file/download-file";
import FileList from "../../src/file/file-list";
import WebhookNotifier from "../../src/notifier/webhook-notifier";
import axios from "axios";

jest.mock('axios');
describe(WebhookNotifier.name, () => {
    let notifier: WebhookNotifier;
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        notifier = new WebhookNotifier('endpoint');
        mockedAxios.post.mockReset();
    })

    test('notifyOnWatch', () => {
        const torrent: Torrent = mock<Torrent>();

        // @ts-ignore
        torrent.name = 'filename'

        notifier.notifyOnWatch(torrent);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'watch',
                torrent_name: 'filename'
            }
        )
    })

    test('notifyOnDebrid', () => {
        const file: File = mock<File>();

        // @ts-ignore
        file.filename = 'filename'
        // @ts-ignore
        file.link = 'link'

        notifier.notifyOnDebrid(file);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'debrid',
                filename: 'filename',
                link: 'link'
            }
        )
    })

    test('notifyOnDownloadStart', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file
        // @ts-ignore
        file.link = 'link'

        // @ts-ignore
        file.filename = 'filename'

        notifier.notifyOnDownloadStart(downloadFile);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'download_start',
                filename: 'filename',
                link: 'link'
            }
        )
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
        file.link = 'link'

        error.message = 'error_message'

        notifier.notifyOnDownloadError(downloadFile, error);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'download_error',
                filename: 'filename',
                link: 'link',
                error: error
            }
        );
    })

    test('notifyOnTorrentError', () => {
        const torrent: Torrent = mock<Torrent>();
        const files: FileList = new FileList();
        const error: Error = mock<Error>();
        const file1: File = mock<File>();
        const file2: File = mock<File>();

        files.add(file1);
        files.add(file2);

        // @ts-ignore
        file1.filename = 'filename1';
        // @ts-ignore
        file2.filename = 'filename2';
        // @ts-ignore
        torrent.name = 'foo'

        error.message = 'error_message'

        notifier.notifyOnTorrentError(torrent, files, error);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'torrent_error',
                torrent_name: 'foo',
                files: ['filename1', 'filename2'],
                error: error
            }
        );
    })

    test('notifyOnDownloadDone', () => {
        const downloadFile: DownloadFile = mock<DownloadFile>();
        const file: File = mock<File>();

        // @ts-ignore
        downloadFile.file = file

        // @ts-ignore
        file.filename = 'filename'
        // @ts-ignore
        file.link = 'link'

        notifier.notifyOnDownloadDone(downloadFile);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'download_done',
                filename: 'filename',
                link: 'link',
            }
        );
    })

    test('notifyOnTorrentDone', () => {
        const torrent: Torrent = mock<Torrent>();
        const files: FileList = new FileList();
        const file1: File = mock<File>();
        const file2: File = mock<File>();

        files.add(file1);
        files.add(file2);

        // @ts-ignore
        file1.filename = 'filename1';
        // @ts-ignore
        file2.filename = 'filename2';

        // @ts-ignore
        torrent.name = 'foo';

        notifier.notifyOnTorrentDone(torrent, files);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'endpoint',
            {
                type: 'torrent_done',
                torrent_name: 'foo',
                files: ['filename1', 'filename2'],
            }
        );
    })
})
