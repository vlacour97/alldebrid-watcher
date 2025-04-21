import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import AllDebridClient from "../../../src/debrider/all-debrid/all-debrid-client";
import * as Buffer from "buffer";
import {mock} from "jest-mock-extended";
import axios from "axios";

jest.mock('axios');
describe(AllDebridClient.name, () => {
    let client: AllDebridClient;
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        client = new AllDebridClient(
            'http://allDebridHost.com',
            '/uploadTorrentFileURI',
            '/uploadMagnetURI',
            '/removeMagnetURI',
            '/magnetStatusURI',
            '/linkUnlockURI',
            'userAgent'
        )
        client.apiKey = 'apiKey'
        mockedAxios.mockReset();
    })

    test('putTorrentFile', async () => {
        const buffer: Buffer = mock<Buffer>();

        // @ts-ignore
        mockedAxios.post.mockResolvedValue({
            data: {
                data: {
                    files: [
                        {
                            id: 123
                        }
                    ]
                }
            }
        })

        let response = await client.putTorrentFile(buffer, 'filename');

        expect(response).toEqual(123);
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://allDebridHost.com/uploadTorrentFileURI?agent=userAgent&apikey=apiKey',
            expect.anything(),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "content-type": expect.stringContaining("multipart/form-data;")
                })
            })
        )
    })

    test('putMagnet', async () => {

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            data: {
                data: {
                    magnets: [
                        {
                            id: 123
                        }
                    ]
                }
            }
        })

        let response = await client.putMagnet('magnet');

        expect(response).toEqual(123);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://allDebridHost.com/uploadMagnetURI?agent=userAgent&apikey=apiKey&magnets[]=magnet'
        )
    })

    test('getTorrentLinks', async () => {

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            data: {
                data: {
                    magnets: {
                        statusCode: 4,
                        links: [
                            'http://link.com'
                        ]
                    }
                }
            }
        })

        let response = await client.getTorrentLinks(12);

        expect(response).toEqual(['http://link.com']);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://allDebridHost.com/magnetStatusURI?agent=userAgent&apikey=apiKey&id=12'
        )
    })

    test('getTorrentLinks (not ready)', async () => {

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            data: {
                data: {
                    magnets: {
                        statusCode: 3
                    }
                }
            }
        })

        let response = await client.getTorrentLinks(12);

        expect(response).toEqual(null);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://allDebridHost.com/magnetStatusURI?agent=userAgent&apikey=apiKey&id=12'
        )
    })

    test('removeMagnet', async () => {

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            data: {
                status: 'success',
                data: {
                    message: 'Magnet was successfully deleted'
                }
            }
        })

        await client.removeMagnet(1234);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://allDebridHost.com/removeMagnetURI?agent=userAgent&apikey=apiKey&id=1234'
        )
    })

    test('getUnlockFile', async () => {

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            data: {
                data: {
                    link: 'http://link.com',
                    filename: 'filename'
                }
            }
        })

        let response = await client.getUnlockFile('link');

        expect(response).toEqual({
            link: 'http://link.com',
            filename: 'filename'
        });
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://allDebridHost.com/linkUnlockURI?agent=userAgent&apikey=apiKey&link=link'
        )
    })

})
