import {ServiceLabel} from "../../dependency-injection/app-container";
import {ServiceParam} from "../../dependency-injection/param-provider";
import {ServiceDecorator} from "../../dependency-injection/decorator/service";
import {NotifierType} from "../notifier-interface";

const Notifier = (name: NotifierType, params: ServiceParam[] = []) => (target: any) => {
    ServiceDecorator(name, params, target, [ServiceLabel.NOTIFIER]);
}

export default Notifier;
