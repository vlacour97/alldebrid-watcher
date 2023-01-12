import {beforeEach, describe, expect, test} from "@jest/globals";
import TorrentFile from "../../src/torrent/torrent-file";
import * as Buffer from "buffer";
import {mock} from "jest-mock-extended";

describe(TorrentFile.name, () => {
    let buffer: Buffer;
    let file: TorrentFile;

    beforeEach(() => {
        buffer = mock<Buffer>()
        file = new TorrentFile('filename', buffer)
    })

    test('getters', () => {
        expect(file.fileName).toEqual('filename');
        expect(file.buffer).toEqual(buffer);
    })
})
