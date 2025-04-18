import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {DownloadEvent, DownloadFile} from "../../src/file/download-file";
import QnapDownloadStationDownloader from "../../src/downloader/qnap-download-station-downloader";

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid'),
}));

// On typage librement pour éviter les erreurs "never"
const mockLogin = jest.fn();
const mockTaskAddUrl = jest.fn();
const mockGetTaskWithUrl = jest.fn();

const mockClient: any = {
    login: mockLogin,
    taskAddUrl: mockTaskAddUrl,
    getTaskWithUrl: mockGetTaskWithUrl,
};

const mockFile = {
    filename: 'testfile.zip',
    link: 'http://example.com/file.zip',
};

describe('QnapDownloadStationDownloader', () => {
    let downloader: QnapDownloadStationDownloader;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        downloader = new QnapDownloadStationDownloader('/tmp', '/downloads', mockClient);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should call client.login on initialize', () => {
        downloader.initialize();
        expect(mockLogin).toHaveBeenCalled();
    });

    it('should return a DownloadFile with correct properties', () => {
        const downloadFile = downloader.getDownloadFile(mockFile as any);
        expect(downloadFile).toBeInstanceOf(DownloadFile);
    });

    it('should emit START_DOWNLOAD and DONE when download is successful', async () => {
        mockTaskAddUrl.mockReturnValue(undefined);
        // @ts-ignore
        mockGetTaskWithUrl.mockResolvedValue({
            state: 5,
            error: 0,
            progress: 100,
        });

        const downloadFile = downloader.getDownloadFile(mockFile as any);
        const events: any[] = [];

        downloadFile.on(DownloadEvent.START_DOWNLOAD, () => events.push('START_DOWNLOAD'));
        downloadFile.on(DownloadEvent.DONE, () => events.push('DONE'));

        downloadFile.startDownload();

        expect(mockTaskAddUrl).toHaveBeenCalledWith(
            'http://example.com/file.zip?process=mocked-uuid',
            '/tmp',
            '/downloads'
        );

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(events).toContain('START_DOWNLOAD');
        expect(events).toContain('DONE');
    });

    it('should emit ERROR if task has error', async () => {
        mockTaskAddUrl.mockReturnValue(undefined);
        // @ts-ignore
        mockGetTaskWithUrl.mockResolvedValue({
            state: 1,
            error: 1,
            progress: 0,
        });

        const downloadFile = downloader.getDownloadFile(mockFile as any);
        const errorCallback = jest.fn();

        downloadFile.on(DownloadEvent.ERROR, errorCallback);
        downloadFile.startDownload();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(errorCallback).toHaveBeenCalledWith(
            downloadFile,
            expect.stringContaining('Error occured on testfile.zip downloading')
        );
    });

    it('should emit PROGRESS if download is in progress', async () => {
        mockTaskAddUrl.mockReturnValue(undefined);
        // @ts-ignore
        mockGetTaskWithUrl.mockResolvedValue({
            state: 1,
            error: 0,
            progress: 42,
        });

        const downloadFile = downloader.getDownloadFile(mockFile as any);
        const progressCallback = jest.fn();

        downloadFile.on(DownloadEvent.PROGRESS, progressCallback);
        downloadFile.startDownload();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(progressCallback).toHaveBeenCalledWith(downloadFile, 42);
    });

    it('should emit ERROR if an exception is thrown', () => {
        mockTaskAddUrl.mockImplementation(() => {
            throw new Error('boom');
        });

        const downloadFile = downloader.getDownloadFile(mockFile as any);
        const errorCallback = jest.fn();

        downloadFile.on(DownloadEvent.ERROR, errorCallback);
        downloadFile.startDownload();

        expect(errorCallback).toHaveBeenCalledWith(downloadFile, expect.any(Error));
    });
});

