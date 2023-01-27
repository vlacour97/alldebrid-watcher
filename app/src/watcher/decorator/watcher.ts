import {WatcherType} from "../watcher-interface";
import {ServiceLabel} from "../../dependency-injection/app-container";
import {ServiceParam} from "../../dependency-injection/param-provider";
import {ServiceDecorator} from "../../dependency-injection/decorator/service";

const Watcher = (name: WatcherType, params: ServiceParam[] = []) => (target: any) => {
    ServiceDecorator(name, params, target, [ServiceLabel.WATCHER]);
}

export default Watcher;
