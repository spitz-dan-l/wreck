import {
    Parser,
    Token,
    make_consumer,
    SUBMIT_TOKEN,
    TokenMatch,
    Parsed,
    consume,
    raw
} from '../typescript/parser2';

import { array_last } from '../typescript/datatypes';

import 'mocha';

import * as assert from 'assert';

describe('parser', () => {
    it('should do a thing', () => {
        function main_thread(p: Parser) {
            p.consume([{token: 'look', token_type: { kind: 'Keyword' }}]);

            let who = p.split([
                () => p.consume(['at', 'me'], 'me'),
                () => p.consume(['at', 'mewtwo'], 'mewtwo'),
                () => p.consume(['at', 'mewtwo', 'steve'], 'mewtwo steve'),
                () => p.consume(['at', 'steven'], () => 'steven'),
                () => p.consume(['at', 'martha'], 'martha'),
                () => p.eliminate() 
            ]);

            if (who === 'steven') {
                p.eliminate();
            }

            let how = p.split([
                () => p.consume([{ token: 'happily', typeahead_type: { kind: 'Locked' }}], 'happily'),
                () => p.consume(['sadly'], 'sadly'),
                () => 'neutrally'
            ]);

            p.submit();

            return `Looked at ${who} ${how}`;
        }

        let result = Parser.run_thread(raw('look at me'), main_thread);

        console.log(result);

        console.log(result.parsing.view);
        console.log(array_last(result.parsing.view.matches).type);

        let ta = result.parsing.view.typeahead_grid;
        console.log(ta);
        if (ta.length > 0) {
            console.log(array_last(ta[0]).type);
        }
        /*
            TODO: (Way Later) Write a tester that runs through every possible input for a given main_thread,
            to find runtime error states
                - ambiguous parses
                - any other exceptions thrown
        */
    });

    it('should do the dsl thing', () => {
        let main_thread = make_consumer("*daniel didn't &wash", (p) => p.submit('unclean'));

        let result = <Parsed<string>>Parser.run_thread(raw("daniel didn't wash"), main_thread);
        assert.equal(result.kind, 'Parsed');
        assert.equal(result.result, 'unclean', 'daniel was too clean');
        assert.equal(result.parsing.parses.length, 1);
        
        let view = result.parsing.view;
        let expected_matches: TokenMatch[] = [
            { kind: 'TokenMatch', token: 'daniel', type: { kind: 'Match', type: { kind: 'Keyword' } } },
            { kind: 'TokenMatch', token: "didn't", type: { kind: 'Match', type: { kind: 'Filler' } } },
            { kind: 'TokenMatch', token: 'wash', type: { kind: 'Match', type: { kind: 'Option' } } },
            { kind: 'TokenMatch', token: SUBMIT_TOKEN, type: { kind: 'Match', type: { kind: 'Filler' } } }
        ];
        assert.deepEqual(view.matches, expected_matches);
    });

    it('should string split() calls', () => {
        let main_thread = (p: Parser) => p.split([
            () => p.consume(['daniel'], 'daniel'),
            () => p.consume(['jason'], 'jason')
        ], (who) => p.submit(`it was ${who} all along`));

        let {result} = <Parsed<string>>Parser.run_thread(raw('jason'), main_thread);

        assert.equal(result, 'it was jason all along');
    });

    it('Lookahead works', () => {
        let things = [
            ['fluke', 'fish'],
            ['fluke', 'coincidence']
        ];

        let result = Parser.run_thread(raw('it was all a fluke'), make_consumer('it was all a', (p) => {
            let meaning = p.split(things.map(([noun, meaning]) => make_consumer(noun, meaning)));

            // We want to retroactively eliminate the "fish" sense of the word "fluke".
            if (meaning === 'fish') {
                p.eliminate();

                // (In practice, we might be better served filtering it out of the things passed
                //  to p.split() above, but the point is, if we haven't factored our parser fragments
                //  in that way, we don't have to refactor the whole thing.)
            }
            p.submit();
            return meaning;
        }));

        assert.equal(result.kind, 'Parsed');

        assert.equal((result as Parsed<string>).result, 'coincidence');
    });
});


