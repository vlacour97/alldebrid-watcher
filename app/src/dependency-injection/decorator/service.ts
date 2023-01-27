import appContainer from "../../dependency-injection/app-container";
import ParamProvider, {ServiceParam} from "../../dependency-injection/param-provider";

const Service = (name: string, params: ServiceParam[] = []) => (target: any) => {
    ServiceDecorator(name, params, target);
}

export const ServiceDecorator = (name: string, params: ServiceParam[] = [], target: any, labels: string[] = []): void => {
    const paramProvider = new ParamProvider();

    appContainer.add(name, () => {
        return new (target)(...paramProvider.transformParams(params));
    }, labels)
}

export default Service;
