import DownloaderInterface, {DownloaderType} from "./downloader-interface";
import {DownloadFile} from "../file/download-file";
import File from "../file/file";
import Service from "../dependency-injection/decorator/service";
import {ServiceParamType} from "../dependency-injection/param-provider";
import {ServiceLabel} from "../dependency-injection/app-container";
import Container from "../dependency-injection/container";

@Service(
    DownloaderStrategy.name,
    [
        {
            id: 'DOWNLOADER_SERVICE',
            type: ServiceParamType.ENVIRONMENT_VARIABLE,
            default: DownloaderType.FILESYSTEM
        },
        {
            id: ServiceLabel.DOWNLOADER,
            type: ServiceParamType.INJECTABLE_SERVICE
        }
    ]
)
export default class DownloaderStrategy implements DownloaderInterface {
    private downloaderType: string
    private downloaderContainer: Container

    constructor(downloaderType: string, downloaderContainer: Container) {
        this.downloaderType = downloaderType;
        this.downloaderContainer = downloaderContainer;
    }

    async initialize(): Promise<void> {
        await this.downloaderContainer.get(this.downloaderType).initialize()
    }

    getDownloadFile(file: File): DownloadFile {
        return this.downloaderContainer.get(this.downloaderType).getDownloadFile(file);
    }

    async close(): Promise<void> {
        await this.downloaderContainer.get(this.downloaderType).close()
    }
}
