import {beforeEach, describe, expect, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import TorrentList from "../../src/torrent/torrent-list";
import Torrent from "../../src/torrent/torrent";

describe(TorrentList.name, () => {
    let torrentList: TorrentList;

    beforeEach(() => {
        torrentList = new TorrentList();
    })

    test('add/get/length', () => {
        const torrent1 = mock<Torrent>();
        const torrent2 = mock<Torrent>();

        torrentList.add(torrent1);
        torrentList.add(torrent2);

        expect(torrentList.length).toStrictEqual(2);
        expect(torrentList.get(0)).toStrictEqual(torrent1);
        expect(torrentList.get(1)).toStrictEqual(torrent2);
    })

    test('forEach', () => {
        const torrent1 = mock<Torrent>();
        const torrent2 = mock<Torrent>();

        torrentList.add(torrent1);
        torrentList.add(torrent2);

        let torrents: Torrent[] = [];

        torrentList.forEach((torrent) => {
            torrents.push(torrent);
        })

        expect(torrents.length).toStrictEqual(2);
        expect(torrents[0]).toStrictEqual(torrent1);
        expect(torrents[1]).toStrictEqual(torrent2);
    })

    test('removeByTorrent', () => {
        const torrent1 = mock<Torrent>();
        const torrent2 = mock<Torrent>();

        torrentList.add(torrent1);
        torrentList.add(torrent2);

        torrentList.removeByTorrent(torrent1);

        expect(torrentList.length).toStrictEqual(1);
        expect(torrentList.get(0)).toStrictEqual(torrent2);
    })
})
