import 'babel-polyfill'; // TODO put this somewhere that makes more sense

import 'mocha'
import * as assert from 'assert';

import { update, Updater } from '../typescript/datatypes';

describe('update', () => {
    it('works, idk', () => {
        let obj = { a: 1, b: { c: [2,3], d: 5 } };
        // TODO: This does not correctly infer types of updater-function arguments, unless you assert the return type or generic type of the call.
        // have not figured out why/how to get it to work without the assertion.
        let updated = update(obj, { a: 0, b: { c: (_) => [..._, 4] }} );

        let expected = { a: 0, b: { c: [2, 3, 4], d: 5 } };
        assert.deepEqual(updated, expected);
    });
});
