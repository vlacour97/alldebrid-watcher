export default class Container {
    private factories: any = {};
    private instances: any = {};

    public add(name: string, callable: ((container: Container) => any)|any, labels: string[] = []): this
    {
        this.factories[name] = callable;

        if (labels.length !== 0) {
            for (const label of labels) {
                if (!this.has(label)) {
                    this.add(label, () => new Container())
                }

                this.get(label).add(name, callable);
            }
        }

        return this;
    }

    public has(name: string): boolean
    {
        return this.factories[name] !== undefined;
    }

    public get(name: string): any
    {
        if (!this.has(name)) {
            return null;
        }

        const service = this.factories[name];

        if (typeof service === 'function') {
            if (this.instances[name] === undefined) {
                this.instances[name] = service(this);
            }

            return this.instances[name];
        }

        return service;
    }
}
