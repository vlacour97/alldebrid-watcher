import {ServiceLabel} from "../../dependency-injection/app-container";
import {ServiceParam} from "../../dependency-injection/param-provider";
import {ServiceDecorator} from "../../dependency-injection/decorator/service";
import {DownloaderType} from "../downloader-interface";

const Downloader = (name: DownloaderType, params: ServiceParam[] = []) => (target: any) => {
    ServiceDecorator(name, params, target, [ServiceLabel.DOWNLOADER]);
}

export default Downloader;
