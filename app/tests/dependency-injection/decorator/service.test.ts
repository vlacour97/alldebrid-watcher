import {describe, expect, jest, test} from "@jest/globals";
import appContainer from "../../../src/dependency-injection/app-container";
import Service, {ServiceDecorator} from "../../../src/dependency-injection/decorator/service";
import {ServiceParamType} from "../../../src/dependency-injection/param-provider";

class Foo {
    public foo1
    public foo2

    constructor(foo1, foo2) {
        this.foo1 = foo1
        this.foo2 = foo2
    }
}

jest.mock('../../../src/dependency-injection/app-container');
describe('Service', () => {
    const mockedContainer = appContainer as jest.Mocked<typeof appContainer>;
    let fooImplementation;

    test('ServiceDecorator', () => {

        mockedContainer.add.mockImplementation((name, callback, labels) => {
            fooImplementation = callback();

            return mockedContainer;
        })

        ServiceDecorator(
            'name',
            [
                {
                    id: 'foo1_value',
                    type: ServiceParamType.VALUE
                },
                {
                    id: 'foo2_value',
                    type: ServiceParamType.VALUE
                }
            ],
            Foo,
            ['label1', 'label2']
        )

        expect(mockedContainer.add).toHaveBeenCalledWith('name', expect.any(Function), ['label1', 'label2'])
        expect(fooImplementation).toBeInstanceOf(Foo);
        expect(fooImplementation.foo1).toEqual('foo1_value');
        expect(fooImplementation.foo2).toEqual('foo2_value');
    })

    test('Service', () => {

        mockedContainer.add.mockImplementation((name, callback, labels) => {
            fooImplementation = callback();

            return mockedContainer;
        })

        Service(
            'name',
            [
                {
                    id: 'foo1_value',
                    type: ServiceParamType.VALUE
                },
                {
                    id: 'foo2_value',
                    type: ServiceParamType.VALUE
                }
            ]
        )(Foo)

        expect(mockedContainer.add).toHaveBeenCalledWith('name', expect.any(Function), [])
        expect(fooImplementation).toBeInstanceOf(Foo);
        expect(fooImplementation.foo1).toEqual('foo1_value');
        expect(fooImplementation.foo2).toEqual('foo2_value');
    })
})
