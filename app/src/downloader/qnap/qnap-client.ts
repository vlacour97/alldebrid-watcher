import Service from "../../dependency-injection/decorator/service";
import {ServiceParamType} from "../../dependency-injection/param-provider";
import axios from "axios";
import {XMLParser} from "fast-xml-parser";

export type TaskQuery = {
    data: Task[]
};

export type Task = {
    source: string,
    progress: number,
    state: number,
    error: number
}

@Service(
    QnapClient.name,
    [
        {
            id: 'QNAP_ENDPOINT',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        },
        {
            id: 'QNAP_USERNAME',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: 'admin'
        },
        {
            id: 'QNAP_PASSWORD',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: 'password'
        },
    ]
)
export default class QnapClient {
    private currentSid: string;

    constructor(
        private readonly endpoint: string,
        private readonly username: string,
        private readonly password: string
    ) {

    }

    private getUrl(path: string) {
        return this.endpoint.trim().replace(/\/$/, '') + path;
    }

    private getDownloadStationUrl(domain: string, action: string): string {
        return this.getUrl('/downloadstation/V4/' + domain.replace(/^./, domain[0].toUpperCase())) + '/' + action.replace(/^./, action[0].toUpperCase());
    }

    async login(): Promise<void> {
        const qs = require('qs');

        const response = await axios.post(
            this.getUrl('/cgi-bin/authLogin.cgi'),
            qs.stringify({
                'user': this.username,
                'plain_pwd': this.password
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (200 !== response.status) {
            throw new Error('Error on login to QNAP Server. Check your credentials');
        }

        const parser = new XMLParser();
        const loginDocument = parser.parse(response.data);

        if (undefined === loginDocument.QDocRoot || 1 !== loginDocument.QDocRoot.authPassed || undefined === loginDocument.QDocRoot.authSid) {
            throw new Error('Error on login to QNAP Server. Check your credentials');
        }

        this.currentSid = loginDocument.QDocRoot.authSid;
    }

    async taskAddUrl(url: string, temporaryFolder: string, downloadFolder: string): Promise<void> {
        if (undefined === this.currentSid) {
            await this.login();
        }

        const response = await axios.get(this.getDownloadStationUrl('task', 'addUrl'), {
            params: {
                sid: this.currentSid,
                url: url,
                temp: temporaryFolder,
                move: downloadFolder
            }
        });

        if (200 !== response.status || 0 !== response.data.error) {
            if (response.data && undefined !== response.data.reason) {
                throw new Error('Error on retrieving task list: ' + response.data.reason);
            }

            throw new Error('Error on retrieving task list');
        }
    }

    async tasksQuery(): Promise<TaskQuery> {
        if (undefined === this.currentSid) {
            await this.login();
        }

        const response = await axios.get(
            this.getDownloadStationUrl('task', 'query'),
            {
                params: {
                    sid: this.currentSid,
                    field: 'create_time',
                    direction: 'DESC'
                },
            }
        )

        if (200 !== response.status || !response.data) {
            throw new Error('Error on retrieving download tasks');
        }

        return response.data;
    }

    async getTaskWithUrl(url: string): Promise<Task|null> {
        const taskQuery = await this.tasksQuery();

        let task: Task|null = null;

        taskQuery.data.forEach((element) => {
            if (element.source === url) {
                task = element;
            }
        })

        return task;
    }
}
