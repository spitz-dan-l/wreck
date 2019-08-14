import * as assert from 'assert';
import 'mocha';

import {render_message} from '../typescript/message';
import Handlebars from 'handlebars';

describe('render', () => {
    it('should correctly assign @world', () => {
        const template = `{{@world}} is the world`;

        const compiled = Handlebars.compile(template);

        const result = compiled({}, {data: { 'world': 'my butt' }});
        assert.equal(result, 'my butt is the world');
    });
});
