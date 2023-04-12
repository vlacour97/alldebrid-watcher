import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import SynologyDsClient from "../../../src/downloader/synology/synology-ds-client";
import axios from "axios";
import {throws} from "assert";
import {mock} from "jest-mock-extended";

jest.mock('axios');
describe(SynologyDsClient.name, () => {
    let client: SynologyDsClient;
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        mockedAxios.get.mockClear();
        client = new SynologyDsClient(
            'endpoint',
            'username',
            'password'
        )
    })

    test('initClient', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    'SYNO.API.Auth': {
                        maxVersion: 7,
                        minVersion: 1,
                        path: 'entry.cgi',
                        requestFormat: 'JSON'
                    }
                }
            }
        })
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    sid: 'sid'
                }
            }
        })

        await client.initClient();

        expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'endpoint/webapi/query.cgi?api=SYNO.API.Info&query=all&method=query&version=1')
        expect(mockedAxios.get).toHaveBeenNthCalledWith(2, 'endpoint/webapi/entry.cgi?method=login&format=sid&account=username&passwd=password&session=DownloadStation&version=7&api=SYNO.API.Auth')
    })

    test('initClient with error on discover api', async () => {
        const mockedError = mock<Error>();

        mockedAxios.get.mockRejectedValueOnce(mockedError);

        expect(new Promise((resolve => resolve(client.initClient())))).rejects.toThrow('An error was occured when connecting to Synology Server');
    })

    test('initClient with error on login', async () => {
        const mockedError = mock<Error>();

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    'SYNO.API.Auth': {
                        maxVersion: 7,
                        minVersion: 1,
                        path: 'entry.cgi',
                        requestFormat: 'JSON'
                    }
                }
            }
        })
        mockedAxios.get.mockRejectedValueOnce(mockedError);

        expect(new Promise((resolve => resolve(client.initClient())))).rejects.toThrow('An error was occured on logging to Synology Server (username: "username", password: "password")');

        expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'endpoint/webapi/query.cgi?api=SYNO.API.Info&query=all&method=query&version=1')
    })

    test('initClient with non exist login api', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    'SYNO.API.Auth.Key': {
                        maxVersion: 7,
                        minVersion: 1,
                        path: 'entry.cgi',
                        requestFormat: 'JSON'
                    }
                }
            }
        })

        expect(new Promise((resolve => resolve(client.initClient())))).rejects.toThrow('An error was occured on logging to Synology Server (username: "username", password: "password")');

        expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'endpoint/webapi/query.cgi?api=SYNO.API.Info&query=all&method=query&version=1')
    })

    test('launchDownload', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    'SYNO.API.Auth': {
                        maxVersion: 7,
                        minVersion: 1,
                        path: 'entry.cgi',
                        requestFormat: 'JSON'
                    },
                    'SYNO.DownloadStation.Task': {
                        maxVersion: 3,
                        minVersion: 1,
                        path: 'DownloadStation/task.cgi'
                    }
                }
            }
        })
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    sid: 'sid'
                }
            }
        })

        await client.launchDownload('link');

        expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'endpoint/webapi/query.cgi?api=SYNO.API.Info&query=all&method=query&version=1')
        expect(mockedAxios.get).toHaveBeenNthCalledWith(2, 'endpoint/webapi/entry.cgi?method=login&format=sid&account=username&passwd=password&session=DownloadStation&version=7&api=SYNO.API.Auth')
        expect(mockedAxios.get).toHaveBeenNthCalledWith(3, 'endpoint/webapi/DownloadStation/task.cgi?method=create&uri=link&_sid=sid&version=3&api=SYNO.DownloadStation.Task')
    })

    test('logout', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    'SYNO.API.Auth': {
                        maxVersion: 7,
                        minVersion: 1,
                        path: 'entry.cgi',
                        requestFormat: 'JSON'
                    }
                }
            }
        })

        await client.closeClient();

        expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'endpoint/webapi/query.cgi?api=SYNO.API.Info&query=all&method=query&version=1')
        expect(mockedAxios.get).toHaveBeenNthCalledWith(2, 'endpoint/webapi/entry.cgi?method=logout&session=DownloadStation&version=7&api=SYNO.API.Auth')
    })
})