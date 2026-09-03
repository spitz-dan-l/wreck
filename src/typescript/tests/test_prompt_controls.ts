import * as assert from 'assert';
import { without_last_token } from 'UI/components/prompt_controls';

describe('prompt controls', () => {
    it('backspaces one token at a time', () => {
        assert.strictEqual(without_last_token('map the laying'), 'map the');
        assert.strictEqual(without_last_token('map the laying '), 'map the');
        assert.strictEqual(without_last_token('map'), '');
        assert.strictEqual(without_last_token(''), '');
        assert.strictEqual(without_last_token('  say Ok, I'), '  say Ok,');
    });
});
