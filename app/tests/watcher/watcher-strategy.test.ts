import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import Container from "../../src/dependency-injection/container";
import {mock} from "jest-mock-extended";
import WatcherStrategy from "../../src/watcher/watcher-strategy";
import WatcherInterface from "../../src/watcher/watcher-interface";
import TorrentQueue from "../../src/torrent/torrent-queue";

describe(WatcherStrategy.name, () => {
    let container: Container;
    let watcher: WatcherStrategy;

    beforeEach(() => {
        container = mock<Container>();
        watcher = new WatcherStrategy('toto', container)
    })

    test('initialize', () => {
        const subWatcher: WatcherInterface = mock<WatcherInterface>();
        const torrentQueue: TorrentQueue = mock<TorrentQueue>();

        jest.spyOn(container, 'get').mockReturnValue(subWatcher)

        watcher.initialize(torrentQueue);

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subWatcher.initialize).toHaveBeenCalledWith(torrentQueue);
    })

    test('getDebridedFiles', () => {
        const subWatcher: WatcherInterface = mock<WatcherInterface>();
        const torrentQueue: TorrentQueue = mock<TorrentQueue>();

        jest.spyOn(container, 'get').mockReturnValue(subWatcher)

        watcher.start(torrentQueue);

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subWatcher.start).toHaveBeenCalled()
    })

    test('stop', () => {
        const subWatcher: WatcherInterface = mock<WatcherInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subWatcher)

        watcher.stop();

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subWatcher.stop).toHaveBeenCalled()
    })

    test('close', () => {
        const subWatcher: WatcherInterface = mock<WatcherInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subWatcher)

        watcher.close();

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subWatcher.close).toHaveBeenCalled()
    })
})
