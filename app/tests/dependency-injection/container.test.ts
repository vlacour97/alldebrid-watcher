import {beforeEach, describe, expect, test} from "@jest/globals";
import Container from "../../src/dependency-injection/container";

describe(Container.name, () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    })

    test('with callable', () => {
        container.add('toto', () => {
            return 'value'
        }, ['label1', 'label2']);

        expect(container.get('toto')).toEqual('value');
        expect(container.has('toto')).toEqual(true);
        expect(container.has('toto2')).toEqual(false);
        expect(container.get('toto2')).toEqual(null);
        expect(container.get('label1')).toBeInstanceOf(Container);
        expect(container.get('label2')).toBeInstanceOf(Container);
        expect(container.get('label1').get('toto')).toEqual('value');
        expect(container.get('label2').get('toto')).toEqual('value');
    })

    test('with value', () => {
        container.add('toto', 'value', ['label1', 'label2']);

        expect(container.get('toto')).toEqual('value');
        expect(container.has('toto')).toEqual(true);
        expect(container.has('toto2')).toEqual(false);
        expect(container.get('toto2')).toEqual(null);
        expect(container.get('label1')).toBeInstanceOf(Container);
        expect(container.get('label2')).toBeInstanceOf(Container);
        expect(container.get('label1').get('toto')).toEqual('value');
        expect(container.get('label2').get('toto')).toEqual('value');
    })
})
