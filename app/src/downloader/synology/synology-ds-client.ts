import Service from "../../dependency-injection/decorator/service";
import {ServiceParamType} from "../../dependency-injection/param-provider";
import axios from "axios";

const urlencode = require('urlencode')

type ApiInfoResponse = {
    data: ApiInfo
}

type ApiInfo = {
    [apiName: string] :ApiInfoResponseItem
}

type ApiInfoResponseItem = {
    maxVersion: number,
    minVersion: number,
    path: string,
    requestFormat: string
}

type APIAuthResponse = {
    data: {
        sid: string
    }
}

type DownloadStationTaskListResponse = {
    data: {
        tasks: {
            id: string,
            status: string
            additional: {
                detail: {
                    uri: string
                }
            }
        }[]
    }
}

@Service(
    SynologyDsClient.name,
    [
        {
            id: 'SYNOLOGY_ENDPOINT',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        },
        {
            id: 'SYNOLOGY_USERNAME',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        },
        {
            id: 'SYNOLOGY_PASSWORD',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        },
    ]
)
export default class SynologyDsClient {
    private readonly endpoint: string;
    private readonly username: string;
    private readonly password: string;
    private apiList: ApiInfo|null = null;
    private sid: string|null = null;
    private session = 'DownloadStation';

    constructor(endpoint: string, username: string, password: string) {
        this.endpoint = endpoint;
        this.username = username;
        this.password = password;
    }

    private getUrlParams (params): string {
        return '?' + Object
            .keys(params)
            .map(key => `${key}=${urlencode(params[key])}`)
            .join('&')
    }

    private getUrl (uri: string, params: object = {}): string {
        const host = this.endpoint.replace(/\/$/, '');

        return host + uri + this.getUrlParams(params)
    }

    private async getApiUrl(api: string, params: object = {}): Promise<string> {
        await this.discoverApis();

        if (undefined === this.apiList[api]) {
            throw new Error(`Api ${api} doesn't exist on Synology Server`);
        }

        return this.getUrl(
            '/webapi/' + this.apiList[api]['path'],
            {...params, version: this.apiList[api]['maxVersion'], api}
        )
    }

    private async discoverApis(): Promise<void> {
        if (null !== this.apiList) {
            return;
        }

        try {
            const response = await axios.get(
                this.getUrl(
                    '/webapi/query.cgi',
                    {
                        api: 'SYNO.API.Info',
                        query: 'all',
                        method: 'query',
                        version: 1
                    }
                )
            )

            const apiResponse: ApiInfoResponse = response.data;

            this.apiList = apiResponse.data;
        } catch (error) {
            throw new Error('An error was occured when connecting to Synology Server');
        }
    }

    private async login(): Promise<void> {
        if (null !== this.sid) {
            return;
        }

        await this.discoverApis();

        try {
            const response = await axios.get(
                await this.getApiUrl(
                    'SYNO.API.Auth',
                    {
                        method: 'login',
                        format: 'sid',
                        account: this.username,
                        passwd: this.password,
                        session: this.session
                    }
                )
            )

            const responseBody: APIAuthResponse = response.data;

            this.sid = responseBody.data.sid;
        } catch (error) {
            throw new Error(
                `An error was occured on logging to Synology Server (username: "${this.username}", password: "${this.password}")`
            );
        }
    }

    private async logout(): Promise<void> {
        await axios.get(
            await this.getApiUrl(
                'SYNO.API.Auth',
                {
                    method: 'logout',
                    session: this.session
                }
            )
        )

        this.sid = null;
    }

    async launchDownload(fileUrl: string): Promise<void> {
        await this.initClient();
        await axios.get(
            await this.getApiUrl(
                'SYNO.DownloadStation.Task',
                {
                    method: 'create',
                    uri: fileUrl,
                    _sid: this.sid
                }
            )
        )
    }

    async initClient(): Promise<void> {
        await this.login();
    }

    async closeClient(): Promise<void> {
        await this.logout();
    }

    async getStatus(fileUrl: string): Promise<string> {
        await this.initClient();
        const response = await axios.get(
            await this.getApiUrl(
                'SYNO.DownloadStation.Task',
                {
                    method: 'list',
                    additional: 'detail',
                    _sid: this.sid
                }
            )
        )

        const apiResponse: DownloadStationTaskListResponse = response.data;

        const tasks = apiResponse.data.tasks ?? [];

        for (const task of tasks) {
            if (fileUrl === task.additional.detail.uri) {
                return task.status;
            }
        }

        return 'unknow'
    }
}