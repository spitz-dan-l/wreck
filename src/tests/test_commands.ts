import 'babel-polyfill'; // TODO put this somewhere that makes more sense

import 'mocha'
import * as assert from 'assert';

import { World2 } from '../typescript/commands3';

describe('world', () => {
    it('thingy', () => {
        type MyState = { a: number };
        class MyWorld extends World2<MyState> {

        }

        let w0 = new MyWorld({a:4});

        let w1 = w0.update_state({ a: _ => _ + 4 });

        assert.equal(w1.state.a, 8);

        assert.notEqual(w0, w1);
    });
});