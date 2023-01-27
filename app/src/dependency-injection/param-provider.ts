import appContainer from "./app-container";

export enum ServiceParamType {
    ENVIRONMENT_VARIABLE,
    INJECTABLE_SERVICE,
    VALUE
}

export enum ServiceParamFilters {
    SPLIT_COMMA_SEPARATOR,
    JSON
}

export type ServiceParam = {
    id: string,
    type: ServiceParamType,
    filter?: ServiceParamFilters
    default?: any
}

export default class ParamProvider {
    transformParams(serviceParams: ServiceParam[]): any[] {
        const classParams: any[] = [];

        for (const param of serviceParams) {
            let classParam = null;

            switch (param.type) {
                case ServiceParamType.ENVIRONMENT_VARIABLE:
                    if (undefined === param.default && undefined === process.env[param.id]) {
                        throw new Error(`The environnement variable "${param.id}" is mandatory on application runtime`)
                    }
                    classParam = process.env[param.id] ?? param.default
                    break;
                case ServiceParamType.INJECTABLE_SERVICE:
                    if (undefined === param.default && !appContainer.has(param.id)) {
                        throw new Error(`The service "${param.id}" is mandatory on application runtime`)
                    }
                    classParam = appContainer.has(param.id) ? appContainer.get(param.id) : param.default
                    break;
                case ServiceParamType.VALUE:
                    classParam = param.id
                    break;
            }

            switch (param.filter) {
                case ServiceParamFilters.SPLIT_COMMA_SEPARATOR:
                    if ('string' === typeof classParam) {
                        classParam = classParam.split(',')
                    }
                    break;
                case ServiceParamFilters.JSON:
                    if ('string' === typeof classParam) {
                        classParam = JSON.parse(classParam)
                    }
                    break;
            }

            classParams.push(classParam);
        }

        return classParams
    }
}
