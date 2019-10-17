export class Effects<T> {
    private _promise: Promise<T>;
    
    constructor(value: T | PromiseLike<T>, private parent?: Effects<any>) {
        this._promise = Promise.resolve(value);
    }

    get promise() {
        return this._promise
    }

    then<T2>(f: (value: T) => (T2 | PromiseLike<T2>)): Effects<T2> {
        const child_promise = this.promise.then(f)
        this.push(async (t) => {
            await child_promise;
            return t;
        });
        return new Effects(child_promise, this);
        
    }

    push(f: (value: T) => (T | PromiseLike<T> | void)): this {
        this._promise = this.promise.then(t => {
            const r = f(t);
            if (r === undefined || r === null) {
                return t;
            }
            return r;
        });
        if (this.parent) {
            this.parent.push(async t => {
                await this._promise;
                return t;
            });
        }
        return this;
    }
}

export const set_timeout = (ms: number=0) =>
    new Promise(resolve => setTimeout(resolve, ms));

export const request_animation_frame = () => new Promise(requestAnimationFrame);

    