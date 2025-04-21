import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import AllDebridDebrider from "../../src/debrider/all-debrid-debrider";
import AllDebridClient, {MagnetType, UnlockFile} from "../../src/debrider/all-debrid/all-debrid-client";
import {mock} from "jest-mock-extended";
import Torrent from "../../src/torrent/torrent";
import TorrentFile from "../../src/torrent/torrent-file";
import * as Buffer from "buffer";
import FileList from "../../src/file/file-list";
import TorrentQueue from "../../src/torrent/torrent-queue";
import TorrentList from "../../src/torrent/torrent-list";

describe(AllDebridDebrider, () => {
    let debrider: AllDebridDebrider;
    let client: AllDebridClient;
    let torrentQueue: TorrentQueue;

    beforeEach(() => {
        client = mock<AllDebridClient>();
        torrentQueue = new TorrentQueue();
        debrider = new AllDebridDebrider('token', ['mkv', 'avi'], true, client)
    })

    test('initialize', () => {
        debrider.initialize(torrentQueue)

        expect(client).toHaveProperty('apiKey', 'token')
    })

    test('initialize with finish torrent', async () => {
        const torrent: Torrent = mock<Torrent>()
        const torrentFile: TorrentFile = mock<TorrentFile>()
        const torrentBuffer: Buffer = mock<Buffer>()

        // @ts-ignore
        torrent.file = torrentFile;
        // @ts-ignore
        torrent.uuid = 'b0b98593-7f1e-4aa3-884e-b230f94cf199';
        // @ts-ignore
        torrentFile.fileName = 'filename';
        // @ts-ignore
        torrentFile.buffer = torrentBuffer;

        jest.spyOn(client, 'putTorrentFile').mockReturnValue(
            new Promise((resolve) => resolve(1234))
        )

        jest.spyOn(client, 'getTorrentLinks').mockReturnValue(
            new Promise<MagnetType[] | null>((resolve) => resolve([
                {
                    link: 'http://example.com/brided/file.mkv',
                    filename: 'file.mkv',
                    size: 1324
                }
            ]))
        )

        jest.spyOn(client, 'getUnlockFile').mockReturnValue(
            new Promise<UnlockFile>((resolve) => resolve({
                link: 'http://example.com/debrided/file.mkv',
                filename: 'debrided-file.mkv',
            },))
        )

        debrider.initialize(torrentQueue)
        torrentQueue.push(new TorrentList([torrent]));
        torrentQueue.pull();
        await debrider.getDebridedFiles(torrent);
        torrentQueue.evacuate(torrent);

        expect(client).toHaveProperty('apiKey', 'token')
        expect(client.removeMagnet).toHaveBeenCalledWith(1234)
    })

    test('initialize with finish torrent when magnet cleaning is disabled', async () => {
        debrider =  new AllDebridDebrider('token', ['mkv', 'avi'], false, client);

        const torrent: Torrent = mock<Torrent>()
        const torrentFile: TorrentFile = mock<TorrentFile>()
        const torrentBuffer: Buffer = mock<Buffer>()

        // @ts-ignore
        torrent.file = torrentFile;
        // @ts-ignore
        torrent.uuid = 'b0b98593-7f1e-4aa3-884e-b230f94cf199';
        // @ts-ignore
        torrentFile.fileName = 'filename';
        // @ts-ignore
        torrentFile.buffer = torrentBuffer;

        jest.spyOn(client, 'putTorrentFile').mockReturnValue(
            new Promise((resolve) => resolve(1234))
        )

        jest.spyOn(client, 'getTorrentLinks').mockReturnValue(
            new Promise<MagnetType[] | null>((resolve) => resolve([
                {
                    link: 'http://example.com/brided/file.mkv',
                    filename: 'file.mkv',
                    size: 1324
                }
            ]))
        )

        jest.spyOn(client, 'getUnlockFile').mockReturnValue(
            new Promise<UnlockFile>((resolve) => resolve({
                link: 'http://example.com/debrided/file.mkv',
                filename: 'debrided-file.mkv',
            },))
        )

        debrider.initialize(torrentQueue)
        torrentQueue.push(new TorrentList([torrent]));
        torrentQueue.pull();
        await debrider.getDebridedFiles(torrent);
        torrentQueue.evacuate(torrent);

        expect(client).toHaveProperty('apiKey', 'token')
        expect(client.removeMagnet).not.toBeCalled()
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
        debrider = new AllDebridDebrider('token', null, false, client)

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
        debrider = new AllDebridDebrider('token', null, false, client)

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
