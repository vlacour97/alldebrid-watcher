import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import FilesystemDownloader from "../../src/downloader/filesystem-downloader";
import * as fs from "fs";
import File from "../../src/file/file";
import {mock} from "jest-mock-extended";
import {DownloadEvent} from "../../src/file/download-file";
import {WriteStream} from "fs";

jest.mock('fs');
jest.mock('request-progress');
jest.mock('request');
jest.mock('events');
describe(FilesystemDownloader.name, () => {
    let downloader: FilesystemDownloader;

    beforeEach(() => {
        downloader = new FilesystemDownloader('downloadFolder', 1)
    })

    test('initialize', () => {
        const mockedFs = fs as jest.Mocked<typeof fs>;

        mockedFs.existsSync.mockReturnValue(false);

        downloader.initialize();

        expect(mockedFs.existsSync).toHaveBeenCalledWith('downloadFolder');
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith('downloadFolder');
    })

    test('getDownloadFile', async () => {
        const mockedFs = fs as jest.Mocked<typeof fs>;
        const mockedWriteStream = mock<WriteStream>()
        const mockedError = mock<Error>()

        const progressResponse = {
            on: jest.fn(),
            pipe: jest.fn()
        };
        progressResponse.on.mockImplementation( (eventName, callable: (param?: any) => void) => {
            switch (eventName) {
                case 'progress':
                    callable({
                        percent: .5
                    });
                    break;
                case 'end':
                    setTimeout(callable, 500);
                    break;
                case 'error':
                    callable(mockedError);
                    break;
            }

            return progressResponse
        })
        mockedFs.createWriteStream.mockReturnValue(mockedWriteStream);

        const mockedProgress = require('request-progress');
        mockedProgress.mockImplementation(() => progressResponse)

        const file1: File = mock<File>();
        const file2: File = mock<File>();

        // @ts-ignore
        file1.filename = 'filename1'
        // @ts-ignore
        file2.filename = 'filename2'

        const downloadFile1 = downloader.getDownloadFile(file1)
        const downloadFile2 = downloader.getDownloadFile(file2)

        // @ts-ignore
        const mockedEventEmitter1 = downloadFile1.eventEmitter;
        // @ts-ignore
        const mockedEventEmitter2 = downloadFile2.eventEmitter;

        downloadFile1.startDownload();
        await new Promise((resolve) => setTimeout(resolve, 100))
        downloadFile2.startDownload();

        await new Promise((resolve) => setTimeout(resolve, 2000))

        expect(progressResponse.on).toHaveBeenNthCalledWith(1, 'progress', expect.any(Function))
        expect(progressResponse.on).toHaveBeenNthCalledWith(2, 'end', expect.any(Function))
        expect(progressResponse.on).toHaveBeenNthCalledWith(3, 'error', expect.any(Function))
        expect(progressResponse.on).toHaveBeenNthCalledWith(4, 'progress', expect.any(Function))
        expect(progressResponse.on).toHaveBeenNthCalledWith(5, 'end', expect.any(Function))
        expect(progressResponse.on).toHaveBeenNthCalledWith(6, 'error', expect.any(Function))
        expect(progressResponse.pipe).toHaveBeenCalledWith(mockedWriteStream);

        expect(mockedFs.createWriteStream).toHaveBeenNthCalledWith(1, 'downloadFolder/filename1')
        expect(mockedFs.createWriteStream).toHaveBeenNthCalledWith(2, 'downloadFolder/filename2')

        // @ts-ignore
        expect(mockedEventEmitter1.emit).toHaveBeenNthCalledWith(1, DownloadEvent.START_DOWNLOAD)
        // @ts-ignore
        expect(mockedEventEmitter1.emit).toHaveBeenNthCalledWith(2, DownloadEvent.PROGRESS, 50)
        // @ts-ignore
        expect(mockedEventEmitter1.emit).toHaveBeenNthCalledWith(3, DownloadEvent.ERROR, mockedError)
        // @ts-ignore
        expect(mockedEventEmitter1.emit).toHaveBeenNthCalledWith(4, DownloadEvent.DONE)
        // @ts-ignore
        expect(mockedEventEmitter2.emit).toHaveBeenNthCalledWith(1, DownloadEvent.START_DOWNLOAD)
        // @ts-ignore
        expect(mockedEventEmitter2.emit).toHaveBeenNthCalledWith(2, DownloadEvent.PROGRESS, 50)
        // @ts-ignore
        expect(mockedEventEmitter2.emit).toHaveBeenNthCalledWith(3, DownloadEvent.ERROR, mockedError)
        // @ts-ignore
        expect(mockedEventEmitter2.emit).toHaveBeenNthCalledWith(4, DownloadEvent.DONE)
    })

    test('close', () => {
        downloader.close();
    })
})
