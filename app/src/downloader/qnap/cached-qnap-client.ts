import QnapClient, {TaskQuery} from "./qnap-client";
import NodeCache from "node-cache";
import Service from "../../dependency-injection/decorator/service";
import {ServiceParamType} from "../../dependency-injection/param-provider";

@Service(
    CachedQnapClient.name,
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
export default class CachedQnapClient extends QnapClient {
    private cache: NodeCache;

    constructor(endpoint: string, username: string, password: string) {
        super(endpoint, username, password);
        this.cache = new NodeCache();
    }

    async tasksQuery(): Promise<TaskQuery> {
        if (!this.cache.has('task_query')) {
            this.cache.set('task_query', super.tasksQuery(), 1);
        }

        return this.cache.get('task_query');

    }
}
