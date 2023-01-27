import {describe, expect, jest, test} from "@jest/globals";
import appContainer, {ServiceLabel} from "../../../src/dependency-injection/app-container";
import {ServiceParamType} from "../../../src/dependency-injection/param-provider";
import Watcher from "../../../src/watcher/decorator/watcher";
import {WatcherType} from "../../../src/watcher/watcher-interface";

class Foo {
    public foo1
    public foo2

    constructor(foo1, foo2) {
        this.foo1 = foo1
        this.foo2 = foo2
    }
}

jest.mock('../../../src/dependency-injection/app-container');
describe('Watcher', () => {
    const mockedContainer = appContainer as jest.Mocked<typeof appContainer>;
    let fooImplementation;

    test('Watcher', () => {

        mockedContainer.add.mockImplementation((name, callback, labels) => {
            fooImplementation = callback();

            return mockedContainer;
        })

        Watcher(
            WatcherType.FILESYSTEM,
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

        expect(mockedContainer.add).toHaveBeenCalledWith(WatcherType.FILESYSTEM, expect.any(Function), [ServiceLabel.WATCHER])
        expect(fooImplementation).toBeInstanceOf(Foo);
        expect(fooImplementation.foo1).toEqual('foo1_value');
        expect(fooImplementation.foo2).toEqual('foo2_value');
    })
})
