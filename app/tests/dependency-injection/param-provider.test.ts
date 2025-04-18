import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import ParamProvider, {ServiceParamFilters, ServiceParamType} from "../../src/dependency-injection/param-provider";
import appContainer from "../../src/dependency-injection/app-container";

jest.mock('../../src/dependency-injection/app-container');
describe(ParamProvider.name, () => {
    let provider: ParamProvider;
    const mockedContainer = appContainer as jest.Mocked<typeof appContainer>;

    beforeEach(() => {
        provider = new ParamProvider();
    })

    test('transformParams (type variable)', () => {
        process.env.ENV_VARIABLE_FOO = 'toto';
        process.env.ENV_VARIABLE_FOO_LIST = 'foo,foo1';
        process.env.ENV_VARIABLE_FOO_JSON = '{"toto": "foo"}';
        process.env.ENV_VARIABLE_FOO_BOOL_TRUE = 'true';
        process.env.ENV_VARIABLE_FOO_BOOL_FALSE = 'false';

        let params = provider.transformParams([
            {
                id: 'ENV_VARIABLE_FOO',
                type: ServiceParamType.ENVIRONMENT_VARIABLE
            },
            {
                id: 'UNDEFINED_VARIABLE',
                type: ServiceParamType.ENVIRONMENT_VARIABLE,
                default: 'variable'
            },
            {
                id: 'ENV_VARIABLE_FOO_LIST',
                type: ServiceParamType.ENVIRONMENT_VARIABLE,
                filter: ServiceParamFilters.SPLIT_COMMA_SEPARATOR
            },
            {
                id: 'ENV_VARIABLE_FOO_JSON',
                type: ServiceParamType.ENVIRONMENT_VARIABLE,
                filter: ServiceParamFilters.JSON
            },
            {
                id: 'ENV_VARIABLE_FOO_BOOL_TRUE',
                type: ServiceParamType.ENVIRONMENT_VARIABLE,
                filter: ServiceParamFilters.BOOLEAN
            },
            {
                id: 'ENV_VARIABLE_FOO_BOOL_FALSE',
                type: ServiceParamType.ENVIRONMENT_VARIABLE,
                filter: ServiceParamFilters.BOOLEAN
            }
        ])

        expect(params).toHaveLength(6);
        expect(params[0]).toEqual('toto');
        expect(params[1]).toEqual('variable');
        expect(params[2]).toEqual(['foo', 'foo1']);
        expect(params[3]).toEqual({toto: 'foo'});
        expect(params[4]).toEqual(true);
        expect(params[5]).toEqual(false);
    })

    test('transformParams (type variable)', () => {


        expect(
            () => provider.transformParams([
                {
                    id: 'UNDEFINED_VARIABLE',
                    type: ServiceParamType.ENVIRONMENT_VARIABLE
                }
            ])
        )
            .toThrow(
                'The environnement variable "UNDEFINED_VARIABLE" is mandatory on application runtime'
            )
    })

    test('transformParams (type service)', () => {
        mockedContainer.has.mockReturnValueOnce( true);
        mockedContainer.has.mockReturnValueOnce( true);
        mockedContainer.has.mockReturnValueOnce( true);
        mockedContainer.has.mockReturnValueOnce( true);
        mockedContainer.has.mockReturnValueOnce( false);

        mockedContainer.get.mockReturnValueOnce('foo');
        mockedContainer.get.mockReturnValueOnce({foo: 'test'});

        let params = provider.transformParams([
            {
                id: 'service1',
                type: ServiceParamType.INJECTABLE_SERVICE
            },
            {
                id: 'service2',
                type: ServiceParamType.INJECTABLE_SERVICE
            },
            {
                id: 'service3',
                type: ServiceParamType.INJECTABLE_SERVICE,
                default: 'variable'
            }
        ])

        expect(params).toHaveLength(3);
        expect(params[0]).toEqual('foo');
        expect(params[1]).toEqual({foo: 'test'});
        expect(params[2]).toEqual('variable');
    })

    test('transformParams (type service)', () => {
        const mockedContainer = appContainer as jest.Mocked<typeof appContainer>;

        mockedContainer.has.mockReturnValue(false);

        expect(
            () => provider.transformParams([
                {
                    id: 'undefinedService',
                    type: ServiceParamType.INJECTABLE_SERVICE
                }
            ])
        )
            .toThrow(
                'The service "undefinedService" is mandatory on application runtime'
            )
    })

    test('transformParams (type value)', () => {
        let params = provider.transformParams([
            {
                id: 'value',
                type: ServiceParamType.VALUE
            }
        ])

        expect(params).toHaveLength(1);
        expect(params[0]).toEqual('value');
    })
})
