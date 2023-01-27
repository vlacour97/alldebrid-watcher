import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import AllDebridDebrider from "../../src/debrider/all-debrid-debrider";
import AllDebridClient, {MagnetType, UnlockFile} from "../../src/debrider/all-debrid/all-debrid-client";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";
import TorrentFile from "../../src/torrent/torrent-file";
import * as Buffer from "buffer";
import FileList from "../../src/file/file-list";

describe(AllDebridDebrider, () => {
    let debrider: AllDebridDebrider;
    let client: AllDebridClient;

    beforeEach(() => {
        client = mock<AllDebridClient>();
        debrider = new AllDebridDebrider('token', ['mkv', 'avi'], client)
    })

    test('initialize', () => {
        debrider.initialize()

        expect(client).toHaveProperty('apiKey', 'token')
    })

    test('getDebridedFiles (torrent file matched)', async () => {
        const torrent: Torrent = mock<Torrent>()
        const torrentFile: TorrentFile = mock<TorrentFile>()
        const torrentBuffer: Buffer = mock<Buffer>()

        // @ts-ignore
        torrent.file = torrentFile;
        // @ts-ignore
        torrentFile.fileName = 'filename';
        // @ts-ignore
        torrentFile.buffer = torrentBuffer;

        jest.spyOn(client, 'putTorrentFile').mockReturnValue(
            new Promise((resolve) => resolve(12))
        )

        jest.spyOn(client, 'getTorrentLinks').mockReturnValue(
            new Promise<MagnetType[] | null>((resolve) => resolve([
                {
                    link: 'http://example.com/brided/file.mkv',
                    filename: 'file.mkv',
                    size: 1324
                },
                {
                    link: 'http://example.com/brided/file.png',
                    filename: 'file.png',
                    size: 14
                }
            ]))
        )

        jest.spyOn(client, 'getUnlockFile').mockReturnValue(
            new Promise<UnlockFile>((resolve) => resolve({
                link: 'http://example.com/debrided/file.mkv',
                filename: 'debrided-file.mkv',
            },))
        )

        const files: FileList = await debrider.getDebridedFiles(torrent);

        expect(files).toHaveLength(1);
        expect(files.get(0).link).toEqual('http://example.com/debrided/file.mkv')
        expect(files.get(0).filename).toEqual('debrided-file.mkv')
        expect(client.putTorrentFile).toHaveBeenCalledWith(torrentBuffer, 'filename')
        expect(client.getTorrentLinks).toHaveBeenCalledWith(12)
        expect(client.getUnlockFile).toHaveBeenCalledWith('http://example.com/brided/file.mkv')
    })

    test('getDebridedFiles (torrent file without match)', async () => {
        debrider = new AllDebridDebrider('token', null, client)

        const torrent: Torrent = mock<Torrent>()
        const torrentFile: TorrentFile = mock<TorrentFile>()
        const torrentBuffer: Buffer = mock<Buffer>()

        // @ts-ignore
        torrent.file = torrentFile;
        // @ts-ignore
        torrentFile.fileName = 'filename';
        // @ts-ignore
        torrentFile.buffer = torrentBuffer;

        jest.spyOn(client, 'putTorrentFile').mockReturnValue(
            new Promise((resolve) => resolve(12))
        )

        jest.spyOn(client, 'getTorrentLinks').mockReturnValue(
            new Promise<MagnetType[] | null>((resolve) => resolve([
                {
                    link: 'http://example.com/brided/file.mkv',
                    filename: 'file.mkv',
                    size: 1324
                },
                {
                    link: 'http://example.com/brided/file.png',
                    filename: 'file.png',
                    size: 14
                }
            ]))
        )

        jest.spyOn(client, 'getUnlockFile')
            .mockReturnValueOnce(
                new Promise<UnlockFile>((resolve) => resolve({
                    link: 'http://example.com/debrided/file.mkv',
                    filename: 'debrided-file.mkv',
                }))
            )
            .mockReturnValueOnce(
                new Promise<UnlockFile>((resolve) => resolve({
                    link: 'http://example.com/debrided/file.png',
                    filename: 'debrided-file.png',
                }))
            )

        const files: FileList = await debrider.getDebridedFiles(torrent);

        expect(files).toHaveLength(2);
        expect(files.get(0).link).toEqual('http://example.com/debrided/file.mkv')
        expect(files.get(0).filename).toEqual('debrided-file.mkv')
        expect(files.get(1).link).toEqual('http://example.com/debrided/file.png')
        expect(files.get(1).filename).toEqual('debrided-file.png')
        expect(client.putTorrentFile).toHaveBeenCalledWith(torrentBuffer, 'filename')
        expect(client.getTorrentLinks).toHaveBeenCalledWith(12)
        expect(client.getUnlockFile).toHaveBeenCalledWith('http://example.com/brided/file.mkv')
    })

    test('getDebridedFiles (magnet matched)', async () => {
        const torrent: Torrent = mock<Torrent>()

        // @ts-ignore
        torrent.magnet = 'magnet';
        // @ts-ignore
        torrent.file = null;

        jest.spyOn(client, 'putMagnet').mockReturnValue(
            new Promise((resolve) => resolve(12))
        )

        jest.spyOn(client, 'getTorrentLinks').mockReturnValue(
            new Promise<MagnetType[] | null>((resolve) => resolve([
                {
                    link: 'http://example.com/brided/file.mkv',
                    filename: 'file.mkv',
                    size: 1324
                },
                {
                    link: 'http://example.com/brided/file.png',
                    filename: 'file.png',
                    size: 14
                }
            ]))
        )

        jest.spyOn(client, 'getUnlockFile').mockReturnValue(
            new Promise<UnlockFile>((resolve) => resolve({
                link: 'http://example.com/debrided/file.mkv',
                filename: 'debrided-file.mkv',
            },))
        )

        const files: FileList = await debrider.getDebridedFiles(torrent);

        expect(files).toHaveLength(1);
        expect(files.get(0).link).toEqual('http://example.com/debrided/file.mkv')
        expect(files.get(0).filename).toEqual('debrided-file.mkv')
        expect(client.putMagnet).toHaveBeenCalledWith('magnet')
        expect(client.getTorrentLinks).toHaveBeenCalledWith(12)
        expect(client.getUnlockFile).toHaveBeenCalledWith('http://example.com/brided/file.mkv')
    })

    test('getDebridedFiles (torrent file without match)', async () => {
        debrider = new AllDebridDebrider('token', null, client)

        const torrent: Torrent = mock<Torrent>()

        // @ts-ignore
        torrent.magnet = 'magnet';
        // @ts-ignore
        torrent.file = null;

        jest.spyOn(client, 'putMagnet').mockReturnValue(
            new Promise((resolve) => resolve(12))
        )

        jest.spyOn(client, 'getTorrentLinks').mockReturnValue(
            new Promise<MagnetType[] | null>((resolve) => resolve([
                {
                    link: 'http://example.com/brided/file.mkv',
                    filename: 'file.mkv',
                    size: 1324
                },
                {
                    link: 'http://example.com/brided/file.png',
                    filename: 'file.png',
                    size: 14
                }
            ]))
        )

        jest.spyOn(client, 'getUnlockFile')
            .mockReturnValueOnce(
                new Promise<UnlockFile>((resolve) => resolve({
                    link: 'http://example.com/debrided/file.mkv',
                    filename: 'debrided-file.mkv',
                }))
            )
            .mockReturnValueOnce(
                new Promise<UnlockFile>((resolve) => resolve({
                    link: 'http://example.com/debrided/file.png',
                    filename: 'debrided-file.png',
                }))
            )

        const files: FileList = await debrider.getDebridedFiles(torrent);

        expect(files).toHaveLength(2);
        expect(files.get(0).link).toEqual('http://example.com/debrided/file.mkv')
        expect(files.get(0).filename).toEqual('debrided-file.mkv')
        expect(files.get(1).link).toEqual('http://example.com/debrided/file.png')
        expect(files.get(1).filename).toEqual('debrided-file.png')
        expect(client.putMagnet).toHaveBeenCalledWith('magnet')
        expect(client.getTorrentLinks).toHaveBeenCalledWith(12)
        expect(client.getUnlockFile).toHaveBeenCalledWith('http://example.com/brided/file.mkv')
    })

    test('close', () => {
        debrider.close()
    })
})
