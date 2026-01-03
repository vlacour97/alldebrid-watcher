import Service from "../../dependency-injection/decorator/service";
import {ServiceParamType} from "../../dependency-injection/param-provider";
import FormData from "form-data";
import axios from "axios";
import * as Buffer from "buffer";

const urlencode = require('urlencode')

type MagnetResponse = {
    data: {
        data: {
            magnets: {
                statusCode: number,
                links: MagnetType[]
            }
        }
    }
}

export type MagnetType = {
    link: string,
    filename: string,
    size: number
}

type UnlockResponse = {
    data: {
        data: UnlockFile
    }
}

export type UnlockFile = {
    link: string,
    filename: string
}

@Service(
    AllDebridClient.name,
    [
        {
            id: 'https://api.alldebrid.com',
            type: ServiceParamType.VALUE
        },
        {
            id: '/v4/magnet/upload/file',
            type: ServiceParamType.VALUE
        },
        {
            id: '/v4/magnet/upload',
            type: ServiceParamType.VALUE
        },
        {
            id: '/v4/magnet/delete',
            type: ServiceParamType.VALUE
        },
        {
            id: '/v4.1/magnet/status',
            type: ServiceParamType.VALUE
        },
        {
            id: '/v4/link/unlock',
            type: ServiceParamType.VALUE
        },
        {
            id: 'allDebridWatcher',
            type: ServiceParamType.VALUE
        }
    ]
)
export default class AllDebridClient {
    private _apiKey: string

    constructor(
        private readonly allDebridHost: string,
        private readonly uploadTorrentFileURI: string,
        private readonly uploadMagnetURI: string,
        private readonly removeMagnetURI: string,
        private readonly magnetStatusURI: string,
        private readonly linkUnlockURI: string,
        private readonly userAgent: string
    ) {

    }

    set apiKey(value: string) {
        this._apiKey = value;
    }

    private getUrlParams (params) {
        return '?' + Object
            .keys(params)
            .map(key => `${key}=${urlencode(params[key])}`)
            .join('&')
    }

    private getUrl (uri: string, params: object = {}) {
        const defaultParams = { agent: this.userAgent, apikey: this._apiKey }
        const host = this.allDebridHost;

        return host + uri + this.getUrlParams({ ...defaultParams, ...params })
    }

    async putTorrentFile(buffer: Buffer, fileName: string): Promise<number> {
        const form = new FormData()
        form.append('files[]', buffer, {
            filepath: fileName,
            contentType: 'application/x-bittorrent'
        })
        const response = await axios.post(this.getUrl(this.uploadTorrentFileURI), form, {
            headers: form.getHeaders()
        });

        return response.data.data.files[0].id;
    }

    async putMagnet(magnet: string): Promise<number> {
        const response = await axios.get(this.getUrl(this.uploadMagnetURI, {'magnets[]': magnet}));

        return response.data.data.magnets[0].id;
    }

    async getTorrentLinks (magnetId: number): Promise<MagnetType[]|null> {
        const response: MagnetResponse = await axios.get(this.getUrl(this.magnetStatusURI, { id: magnetId }))

        const magnets = response.data.data.magnets

        if (magnets.statusCode === 4) {
            return magnets.links
        }

        return null
    }

    async removeMagnet(magnetId: number): Promise<void> {
        await axios.get(this.getUrl(this.removeMagnetURI, {'id': magnetId}));
    }

    async getUnlockFile (link: string): Promise<UnlockFile> {
        const response: UnlockResponse = await axios.get(this.getUrl(this.linkUnlockURI, { link: link }))

        return response.data.data;
    }
}
