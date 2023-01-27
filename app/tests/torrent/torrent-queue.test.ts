import {beforeEach, describe, expect, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import TorrentList from "../../src/torrent/torrent-list";
import Torrent from "../../src/torrent/torrent";
import TorrentQueue from "../../src/torrent/torrent-queue";

describe(TorrentQueue.name, () => {
    let torrentQueue: TorrentQueue;

    beforeEach(() => {
        torrentQueue = new TorrentQueue();
    })

    test('push/pull', () => {
        const torrentList1 = mock<TorrentList>();
        const torrentList2 = mock<TorrentList>();

        const torrent1 = mock<Torrent>();
        const torrent2 = mock<Torrent>();
        const torrent3 = mock<Torrent>();

        // @ts-ignore
        torrentList1.forEach.mockImplementation((addCallback) => {
            addCallback(torrent1);
            addCallback(torrent2);
        })

        // @ts-ignore
        torrentList2.forEach.mockImplementation((addCallback) => {
            addCallback(torrent3);
        })

        torrentQueue.push(torrentList1);
        torrentQueue.push(torrentList2);

        expect(torrentQueue.pull()).toStrictEqual(torrent1);
        expect(torrentQueue.pull()).toStrictEqual(torrent2);
        expect(torrentQueue.pull()).toStrictEqual(torrent3);
    })

    test('evacuate', () => {
        const torrentList1 = mock<TorrentList>();
        const torrentList2 = mock<TorrentList>();

        const torrent1 = mock<Torrent>();
        const torrent2 = mock<Torrent>();
        const torrent3 = mock<Torrent>();

        // @ts-ignore
        torrentList1.forEach.mockImplementation((addCallback) => {
            addCallback(torrent1);
            addCallback(torrent2);
        })

        // @ts-ignore
        torrentList2.forEach.mockImplementation((addCallback) => {
            addCallback(torrent3);
        })

        torrentQueue.push(torrentList1);
        torrentQueue.push(torrentList2);

        torrentQueue.evacuate(torrent2)

        expect(torrentQueue.pull()).toStrictEqual(torrent1);
        expect(torrentQueue.pull()).toStrictEqual(torrent3);
    })
})
