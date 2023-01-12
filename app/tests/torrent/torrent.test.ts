import {beforeEach, describe, expect, test} from "@jest/globals";
import TorrentFile from "../../src/torrent/torrent-file";
import * as Buffer from "buffer";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";

describe(Torrent.name, () => {
    test('magnet torrent', () => {
        const torrent: Torrent = new Torrent('name', 'magnet');

        expect(torrent.name).toEqual('name');
        expect(torrent.magnet).toEqual('magnet');
        expect(torrent.file).toEqual(null);
    })

    test('file torrent', () => {
        const torrentFile = mock<TorrentFile>();
        const torrent: Torrent = new Torrent('name', torrentFile);

        expect(torrent.name).toEqual('name');
        expect(torrent.magnet).toEqual(null);
        expect(torrent.file).toEqual(torrentFile);
    })
})
