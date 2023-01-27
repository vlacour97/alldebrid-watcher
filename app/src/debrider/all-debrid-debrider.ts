import DebriderInterface, {DebriderType} from "./debrider-interface";
import Torrent from "../torrent/torrent";
import File from "../file/file";
import FileList from "../file/file-list";
import Debrider from "./decorator/debrider";
import {ServiceParamFilters, ServiceParamType} from "../dependency-injection/param-provider";
import AllDebridClient, {MagnetType, UnlockFile} from "./all-debrid/all-debrid-client";

@Debrider(
    DebriderType.ALL_DEBRID,
    [
        {
            id: 'ALLDEBRID_TOKEN',
            type: ServiceParamType.ENVIRONMENT_VARIABLE
        },
        {
            id: 'AUTHORIZED_EXTENSIONS',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            filter: ServiceParamFilters.SPLIT_COMMA_SEPARATOR,
            default: null
        },
        {
            id: AllDebridClient.name,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export default class AllDebridDebrider implements DebriderInterface {
    private readonly token: string
    private readonly authorizedExtensions: string[]|null
    private readonly client: AllDebridClient

    constructor(token: string, authorizedExtensions: string[]|null, client: AllDebridClient) {
        this.token = token;
        this.authorizedExtensions = authorizedExtensions;
        this.client = client;
    }

    initialize(): void {
        this.client.apiKey = this.token;
    }

    private async putTorrent(torrent: Torrent): Promise<null|number> {
        let torrentId: number

        if (null !== torrent.file) {
            torrentId = await this.client.putTorrentFile(torrent.file.buffer, torrent.file.fileName)
        } else {
            torrentId = await this.client.putMagnet(torrent.magnet)
        }

        return torrentId
    }

    private filterLinks (links: MagnetType[]): string[] {
        if (this.authorizedExtensions === null) {
            return links.map(data => data.link)
        } else {
            return links.filter(data => {
                return data.filename.match(new RegExp('\\.(' + this.authorizedExtensions.join('|') + ')$'))
            }).map(data => data.link)
        }
    }

    getDebridedFiles(torrent: Torrent): Promise<FileList> {
        return new Promise(async (resolve) => {
            const magnetId = await this.putTorrent(torrent);

            let torrentLinks: MagnetType[]|null = null;

            while (null === torrentLinks) {
                torrentLinks = await this.client.getTorrentLinks(magnetId);

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const links: string[] = this.filterLinks(torrentLinks);

            const files = new FileList();

            for (const link of links) {
                const unlockFile: UnlockFile = await this.client.getUnlockFile(link);

                files.add(new File(unlockFile.link, unlockFile.filename));
            }

            resolve(files);
        })
    }

    close(): void {
    }
}
