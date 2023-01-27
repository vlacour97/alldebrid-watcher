import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import Container from "../../src/dependency-injection/container";
import {mock} from "jest-mock-extended";
import DownloaderStrategy from "../../src/downloader/downloader-strategy";
import DownloaderInterface from "../../src/downloader/downloader-interface";
import File from "../../src/file/file";
import {DownloadFile} from "../../src/file/download-file";

describe(DownloaderStrategy.name, () => {
    let container: Container;
    let downloader: DownloaderStrategy;

    beforeEach(() => {
        container = mock<Container>();
        downloader = new DownloaderStrategy('toto', container)
    })

    test('initialize', () => {
        const subDownloader: DownloaderInterface = mock<DownloaderInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subDownloader)

        downloader.initialize();

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subDownloader.initialize).toHaveBeenCalled()
    })

    test('getDebridedFiles', () => {
        const subDownloader: DownloaderInterface = mock<DownloaderInterface>();
        const file: File = mock<File>();
        const expectedDownloadFile: DownloadFile = mock<DownloadFile>();

        jest.spyOn(container, 'get').mockReturnValue(subDownloader)
        jest.spyOn(subDownloader, 'getDownloadFile').mockReturnValue(expectedDownloadFile)

        const downloadFile = downloader.getDownloadFile(file);

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subDownloader.getDownloadFile).toHaveBeenCalledWith(file)
        expect(downloadFile).toEqual(expectedDownloadFile)
    })

    test('close', () => {
        const subDownloader: DownloaderInterface = mock<DownloaderInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subDownloader)

        downloader.close();

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subDownloader.close).toHaveBeenCalled()
    })
})
