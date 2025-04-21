import DebriderInterface, {DebriderType} from "./debrider-interface";
import Service from "../dependency-injection/decorator/service";
import {ServiceParamType} from "../dependency-injection/param-provider";
import {ServiceLabel} from "../dependency-injection/app-container";
import Torrent from "../torrent/torrent";
import Container from "../dependency-injection/container";
import FileList from "../file/file-list";
import TorrentQueue from "../torrent/torrent-queue";

@Service(
    DebriderStrategy.name,
    [
        {
            id: 'DEBRIDER_SERVICE',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: DebriderType.ALL_DEBRID
        },
        {
            id: ServiceLabel.DEBRIDER,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export default class DebriderStrategy implements DebriderInterface {
    private debriderType: string
    private debriderContainer: Container

    constructor(debriderType: string, debriderContainer: Container) {
        this.debriderType = debriderType;
        this.debriderContainer = debriderContainer;
    }

    initialize(torrentQueue: TorrentQueue): void {
        this.debriderContainer.get(this.debriderType).initialize(torrentQueue);
    }

    getDebridedFiles(torrent: Torrent): Promise<FileList> {
        return this.debriderContainer.get(this.debriderType).getDebridedFiles(torrent);
    }

    close(): void {
        this.debriderContainer.get(this.debriderType).close();
    }
}
