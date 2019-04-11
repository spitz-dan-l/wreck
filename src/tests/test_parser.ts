import {
    Parser,
    Token,
    input_display,
    typeahead,
    make_consumer,
    SUBMIT_TOKEN,
    TokenMatch
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

        let input: Token[] = ['look', 'at', 'me'];

        let [result, parses] = Parser.run_thread(input, main_thread);

        console.log(result);

        let id = input_display(parses, input);
        console.log(id);
        console.log(array_last(id.matches).type);

        let ta = typeahead(parses, input);
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

        let input: Token[] = ["daniel",  "didn't",  "wash", SUBMIT_TOKEN];

        let [result, parses] = Parser.run_thread(input, main_thread);
        assert.equal(result, 'unclean', 'daniel was too clean');
        assert.equal(parses.length, 1);
        
        let display = input_display(parses, input);
        let expected_matches: TokenMatch[] = [
            { kind: 'TokenMatch', token: 'daniel', type: { kind: 'Match', type: { kind: 'Keyword' } } },
            { kind: 'TokenMatch', token: "didn't", type: { kind: 'Match', type: { kind: 'Filler' } } },
            { kind: 'TokenMatch', token: 'wash', type: { kind: 'Match', type: { kind: 'Option' } } },
            { kind: 'TokenMatch', token: SUBMIT_TOKEN, type: { kind: 'Match', type: { kind: 'Filler' } } }
        ];
        assert.deepEqual(display.matches, expected_matches);
    });

    it('should string split() calls', () => {
        let main_thread = (p: Parser) => p.split([
            () => p.consume(['daniel'], 'daniel'),
            () => p.consume(['jason'], 'jason')
        ], (who) => p.submit(`it was ${who} all along`));

        let [result, ] = Parser.run_thread(['jason', SUBMIT_TOKEN], main_thread);

        assert.equal(result, 'it was jason all along');
    });
});


