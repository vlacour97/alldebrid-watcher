import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import SynologyDsDownloader from "../../src/downloader/synology-ds-downloader";
import SynologyDsClient from "../../src/downloader/synology/synology-ds-client";
import {mock} from "jest-mock-extended";
import File from "../../src/file/file";
import {DownloadEvent} from "../../src/file/download-file";

jest.mock('events');
describe(SynologyDsDownloader.name, () => {
    let downloader: SynologyDsDownloader;
    let client: SynologyDsClient;

    beforeEach(() => {
        client = mock<SynologyDsClient>();
        downloader = new SynologyDsDownloader(client);
    })

    test('initialize', async () => {
        await downloader.initialize();

        expect(client.initClient).toHaveBeenCalled();
    })

    test('getDownloadFile', async () => {
        const mockedError = mock<Error>()

        const file1: File = mock<File>();
        const file2: File = mock<File>();

        // @ts-ignore
        file1.link = 'link1'
        // @ts-ignore
        file2.link = 'link2'

        const downloadFile1 = downloader.getDownloadFile(file1)
        const downloadFile2 = downloader.getDownloadFile(file2)

        // @ts-ignore
        const mockedEventEmitter1 = downloadFile1.eventEmitter;
        // @ts-ignore
        const mockedEventEmitter2 = downloadFile2.eventEmitter;

        downloadFile1.startDownload();
        await new Promise((resolve) => setTimeout(resolve, 100))
        downloadFile2.startDownload();

        jest.spyOn(client, 'getStatus').mockResolvedValueOnce('finished');
        jest.spyOn(client, 'getStatus').mockRejectedValue(mockedError);

        await new Promise((resolve) => setTimeout(resolve, 4000))

        expect(client.launchDownload).toHaveBeenNthCalledWith(1, 'link1')
        expect(client.launchDownload).toHaveBeenNthCalledWith(2, 'link2')

        expect(client.getStatus).toHaveBeenNthCalledWith(1, 'link1')
        expect(client.getStatus).toHaveBeenNthCalledWith(2, 'link2')

        // @ts-ignore
        expect(mockedEventEmitter1.emit).toHaveBeenNthCalledWith(1, DownloadEvent.START_DOWNLOAD)
        // @ts-ignore
        expect(mockedEventEmitter1.emit).toHaveBeenNthCalledWith(2, DownloadEvent.DONE)
        // @ts-ignore
        expect(mockedEventEmitter2.emit).toHaveBeenNthCalledWith(1, DownloadEvent.START_DOWNLOAD)
        // @ts-ignore
        expect(mockedEventEmitter2.emit).toHaveBeenNthCalledWith(2, DownloadEvent.ERROR, mockedError)
    })

    test('close', async () => {
        await downloader.close();

        expect(client.closeClient).toHaveBeenCalled();
    })
})