import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import FilesystemWatcher from "../../src/watcher/filesystem-watcher";
import fs, {FSWatcher, NoParamCallback, PathLike} from "fs";
import watch from "node-watch";
import {mock} from "jest-mock-extended";
import {Buffer} from "buffer";
import TorrentQueue from "../../src/torrent/torrent-queue";
import TorrentList from "../../src/torrent/torrent-list";
import Torrent from "../../src/torrent/torrent";
import TorrentFile from "../../src/torrent/torrent-file";

jest.mock('fs');
jest.mock('node-watch');
describe(FilesystemWatcher.name, () => {
    let watcher: FilesystemWatcher;

    beforeEach(() => {
        watcher = new FilesystemWatcher('torrentPath', true);
    })

    test('initialize', () => {
        const mockedFs = fs as jest.Mocked<typeof fs>;
        const torrentQueue = new TorrentQueue();
        const torrent = new Torrent('name', new TorrentFile('filename', mock<Buffer>()));
        const torrents = new TorrentList([torrent]);

        mockedFs.existsSync.mockReturnValue(false);

        watcher.initialize(torrentQueue);

        torrentQueue.push(torrents);
        torrentQueue.pull();
        torrentQueue.evacuate(torrent);

        expect(mockedFs.existsSync).toHaveBeenCalledWith('torrentPath');
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith('torrentPath');
        expect(mockedFs.unlink).toHaveBeenCalledWith('filename', expect.any(Function));
    })

    test('delete torrent with error', () => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        const mockedFs = fs as jest.Mocked<typeof fs>;
        const torrentQueue = new TorrentQueue();
        const torrent = new Torrent('name', new TorrentFile('filename', mock<Buffer>()));
        const torrents = new TorrentList([torrent]);

        mockedFs.existsSync.mockReturnValue(false);

        //@ts-ignore
        mockedFs.unlink.mockImplementation((path: string, callback: Function): void => {
            return callback(new Error('error'));
        });

        watcher.initialize(torrentQueue);

        torrentQueue.push(torrents);
        torrentQueue.pull();
        torrentQueue.evacuate(torrent);

        expect(mockedFs.existsSync).toHaveBeenCalledWith('torrentPath');
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith('torrentPath');
        expect(mockedFs.unlink).toHaveBeenCalledWith('filename', expect.any(Function));
        expect(console.error).toHaveBeenCalledWith(new Error('error'));
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
