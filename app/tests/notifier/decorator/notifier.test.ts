import {describe, expect, jest, test} from "@jest/globals";
import appContainer, {ServiceLabel} from "../../../src/dependency-injection/app-container";
import {ServiceParamType} from "../../../src/dependency-injection/param-provider";
import Notifier from "../../../src/notifier/decorator/notifier";
import {NotifierType} from "../../../src/notifier/notifier-interface";

class Foo {
    public foo1
    public foo2

    constructor(foo1, foo2) {
        this.foo1 = foo1
        this.foo2 = foo2
    }
}

jest.mock('../../../src/dependency-injection/app-container');
describe('Notifier', () => {
    const mockedContainer = appContainer as jest.Mocked<typeof appContainer>;
    let fooImplementation;

    test('Notifier', () => {

        mockedContainer.add.mockImplementation((name, callback, labels) => {
            fooImplementation = callback();

            return mockedContainer;
        })

        Notifier(
            NotifierType.STDOUT,
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

        expect(mockedContainer.add).toHaveBeenCalledWith(NotifierType.STDOUT, expect.any(Function), [ServiceLabel.NOTIFIER])
        expect(fooImplementation).toBeInstanceOf(Foo);
        expect(fooImplementation.foo1).toEqual('foo1_value');
        expect(fooImplementation.foo2).toEqual('foo2_value');
    })
})
