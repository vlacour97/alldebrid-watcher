import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import FilesystemWatcher from "../../src/watcher/filesystem-watcher";
import fs, {FSWatcher} from "fs";
import watch from "node-watch";
import {mock} from "jest-mock-extended";
import {Buffer} from "buffer";
import TorrentQueue from "../../src/torrent/torrent-queue";
import TorrentList from "../../src/torrent/torrent-list";

jest.mock('fs');
jest.mock('node-watch');
describe(FilesystemWatcher.name, () => {
    let watcher: FilesystemWatcher;

    beforeEach(() => {
        watcher = new FilesystemWatcher('torrentPath');
    })

    test('initialize', () => {
        const mockedFs = fs as jest.Mocked<typeof fs>;

        mockedFs.existsSync.mockReturnValue(false);

        watcher.initialize();

        expect(mockedFs.existsSync).toHaveBeenCalledWith('torrentPath');
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith('torrentPath');
    })

    test('start', () => {
        const mockedWatch = watch as jest.Mocked<typeof watch>;
        const mockedFs = fs as jest.Mocked<typeof fs>;
        const buffer = mock<Buffer>()
        const torrentQueue = mock<TorrentQueue>();
        let lastTorrentList: TorrentList;

        // @ts-ignore
        mockedWatch.mockImplementation((pathName, options, callback) => {
            callback('update', 'name.torrent')
        })
        // @ts-ignore
        mockedFs.readFile.mockImplementation((filename, callback) => {
            // @ts-ignore
            callback(null, buffer)
        })

        // @ts-ignore
        torrentQueue.push.mockImplementation((torrentList: TorrentList) => {
            lastTorrentList = torrentList
        })

        watcher.start(torrentQueue);

        expect(lastTorrentList.length).toEqual(1);
        expect(lastTorrentList.get(0).name).toEqual('name.torrent')
        expect(lastTorrentList.get(0).file.fileName).toEqual('name.torrent')
        expect(lastTorrentList.get(0).file.buffer).toEqual(buffer);
    })

    test('start with file error', () => {
        const mockedWatch = watch as jest.Mocked<typeof watch>;
        const mockedFs = fs as jest.Mocked<typeof fs>;
        const buffer = mock<Buffer>()
        const torrentQueue = mock<TorrentQueue>();

        // @ts-ignore
        mockedWatch.mockImplementation((pathName, options, callback) => {
            callback('update', 'name.torrent')
        })
        // @ts-ignore
        mockedFs.readFile.mockImplementation((filename, callback) => {
            // @ts-ignore
            callback(mock<ErrnoException>(), buffer)
        })

        expect(() => {watcher.start(torrentQueue)}).toThrow();
    })

    test('stop', () => {
        const mockedWatch = watch as jest.Mocked<typeof watch>;
        const fswatcher = mock<FSWatcher>();
        const torrentQueue = mock<TorrentQueue>();

        // @ts-ignore
        mockedWatch.mockReturnValue(fswatcher)

        watcher.start(torrentQueue);
        watcher.stop();

        // @ts-ignore
        expect(fswatcher.close).toHaveBeenCalled();
    })

    test('close', () => {
        const mockedWatch = watch as jest.Mocked<typeof watch>;
        const fswatcher = mock<FSWatcher>();
        const torrentQueue = mock<TorrentQueue>();

        // @ts-ignore
        mockedWatch.mockReturnValue(fswatcher)

        watcher.start(torrentQueue);
        watcher.close();

        // @ts-ignore
        expect(fswatcher.close).toHaveBeenCalled();
    })
})
