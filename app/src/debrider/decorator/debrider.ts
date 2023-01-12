import {ServiceLabel} from "../../dependency-injection/app-container";
import {DebriderType} from "../debrider-interface";
import {ServiceParam} from "../../dependency-injection/param-provider";
import {ServiceDecorator} from "../../dependency-injection/decorator/service";

const Debrider = (name: DebriderType, params: ServiceParam[] = []) => (target: any) => {
    ServiceDecorator(name, params, target, [ServiceLabel.DEBRIDER]);
}

export default Debrider;
