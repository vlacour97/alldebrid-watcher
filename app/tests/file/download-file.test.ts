import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {DownloadEvent, DownloadFile} from "../../src/file/download-file";
import {mock} from "jest-mock-extended";
import EventEmitter from "events";
import File from "../../src/file/file";

describe(DownloadFile.name, () => {
    let eventEmitter;
    let downloadCallback;
    let file: File;
    let downloadFile: DownloadFile;
    let lastOnListener: () => void;

    beforeEach(() => {
        eventEmitter = mock<EventEmitter>();
        downloadCallback = jest.fn();
        file = mock<File>();

        eventEmitter.on.mockImplementation((event, callable: () => void) => {
            lastOnListener = callable
        })
        downloadFile = new DownloadFile(file, downloadCallback, eventEmitter)
    })

    test('getters', () => {
        expect(downloadFile.file).toStrictEqual(file);
        expect(downloadFile.isStarted).toEqual(false);
        lastOnListener()
        expect(downloadFile.isStarted).toEqual(true);
    })

    test('startDownload', () => {
        downloadFile.startDownload();

        expect(downloadCallback).toHaveBeenCalled();
    })

    test('on', () => {
        let callable = jest.fn();

        downloadFile.on(DownloadEvent.START_DOWNLOAD, callable);

        lastOnListener()

        expect(eventEmitter.on).toHaveBeenCalledWith(DownloadEvent.START_DOWNLOAD, expect.anything());
        expect(callable).toBeCalled();
    })
})
