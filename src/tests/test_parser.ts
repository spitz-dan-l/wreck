import * as assert from 'assert';
import 'mocha';
import { Parsed, Parser, raw, SUBMIT_TOKEN, TokenMatch, ParserThread, traverse_thread } from '../typescript/parser';
import { array_last } from '../typescript/utils';




describe('parser', () => {
    it('should do a thing', () => {
        
        function main_thread(p: Parser) {
            p.consume('*look');

            let who = p.split([
                () => p.consume('at me', 'me'),
                () => p.consume('at mewtwo', 'mewtwo'),
                () => p.consume('at mewtwo steve', 'mewtwo steve'),
                () => p.consume('at steven', () => 'steven'),
                () => p.consume('at martha', 'martha'),
                () => p.eliminate()
            ]);

            if (who === 'steven') {
                p.eliminate();
            }

            let how = p.split([
                () => p.consume({ tokens: 'happily', used: true}, 'happily'),
                () => p.consume('sadly', 'sadly'),
                () => 'neutrally'
            ]);

            p.submit();

            return `Looked at ${who} ${how}`;
        }
        console.log(traverse_thread(main_thread));
        let result = Parser.run_thread(raw('look at me'), main_thread);

        console.log(result);

        console.log(result.parsing.view);
        console.log(array_last(result.parsing.view.matches)!.status);

        let ta = result.parsing.view.typeahead_grid;
        console.log(ta);
        if (ta.length > 0) {
            console.log(array_last(ta[0].option));
        }
    });

    it('should do the dsl thing', () => {
        let main_thread = (p) => p.consume([{tokens:"daniel", labels: {keyword: true}}, "didn't", {tokens:"wash", labels: {option: true}}], () => p.submit('unclean'));
        console.log(traverse_thread(main_thread));
        let result = <Parsed<string>>Parser.run_thread(raw("daniel didn't wash"), main_thread);
        assert.equal(result.kind, 'Parsed');
        assert.equal(result.result, 'unclean', 'daniel was too clean');
        assert.equal(result.parsing.parses.length, 1);
        
        let view = result.parsing.view;
        let expected_matches: TokenMatch[] = [
            {
                "actual": "daniel",
                "expected": {
                    "availability": "Available",
                    "kind": "RawConsumeSpec",
                    "labels": {
                        "keyword": true
                    },
                    "token": "daniel"
                },
                "kind": "TokenMatch",
                "status": "Match"
            },
            {
                "actual": "didn't",
                "expected": {
                    "availability": "Available",
                    "kind": "RawConsumeSpec",
                    "labels": {
                        "filler": true
                    },
                    "token": "didn't"
                },
                "kind": "TokenMatch",
                "status": "Match"
            },
            {
                "actual": "wash",
                "expected": {
                    "availability": "Available",
                    "kind": "RawConsumeSpec",
                    "labels": {
                        "option": true
                    },
                    "token": "wash"
                },
                "kind": "TokenMatch",
                "status": "Match"
            },
            {
                "actual": SUBMIT_TOKEN,
                "expected": {
                    "availability": "Available",
                    "kind": "RawConsumeSpec",
                    "labels": {
                        "filler": true
                    },
                    "token": SUBMIT_TOKEN
                },
                "kind": "TokenMatch",
                "status": "Match"
            }
        ];
        assert.deepEqual(view.matches, expected_matches);
    });

    it('should string split() calls', () => {
        let main_thread = (p: Parser) => p.split([
            () => p.consume('daniel', 'daniel'),
            () => p.consume('jason', 'jason')
        ], (who) => p.submit(`it was ${who} all along`));

        let {result} = <Parsed<string>>Parser.run_thread(raw('jason'), main_thread);

        assert.equal(result, 'it was jason all along');
    });

    it('Lookahead works', () => {
        let things = [
            ['fluke', 'fish'],
            ['fluke', 'coincidence']
        ];

        let result = Parser.run_thread(raw('it was all a fluke'), (p) =>
            p.consume('it was all a', () => {
                let meaning = p.split(things.map(([noun, meaning]) => () => p.consume(noun, meaning)));

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

    function parse_failed(x: any) { return undefined }

    it.only('Demo each form', () => {

        // This is what imperative style looks like when the parser is
        // implemented with exceptions for control flow
        function imperative_style_with_exceptions(p: Parser) {
            p.consume('look at'); // could throw NoMatch

            let who = p.split([ // could throw Split or NoMatch
                () => p.consume('me', 'me'),
                () => p.consume('mewtwo', 'mewtwo'),
                () => p.consume('steven', 'steven'),
                () => p.consume('martha', 'martha')
            ]);

            if (who === 'steven') {
                p.eliminate(); // throws NoMatch
            }

            let how = p.split([ // could throw Split or NoMatch
                () => p.consume('happily', 'happily'),
                () => p.consume('sadly', 'sadly'),
                () => 'neutrally'
            ]);

            p.submit(); // could throw NoMatch

            return `You looked at ${who} ${how}`;
        }

        function imperative_style_with_explicit_early_returns(p: Parser) {
            let _ = p.consume('look at'); // could return NoMatch
            if (parse_failed(_)) {
                return _
            }

            let who = p.split([ // could return Split or NoMatch
                () => p.consume('me', 'me'),
                () => p.consume('mewtwo', 'mewtwo'),
                () => p.consume('steven', 'steven'),
                () => p.consume('martha', 'martha')
            ]);
            if (parse_failed(who)) {
                return who;
            }

            if (who === 'steven') {
                return p.eliminate(); // returns NoMatch
            }

            let how = p.split([ // could returns Split or NoMatch
                () => p.consume('happily', 'happily'),
                () => p.consume('sadly', 'sadly'),
                () => 'neutrally'
            ]);
            if (parse_failed(how)) {
                return how;
            }

            _ = p.submit(); // could return NoMatch
            if (parse_failed(_)) {
                return _;
            }

            return `You looked at ${who} ${how}`;
        }


        // This is what functional style looks like regardless of the implementation
        const functional_style = ((p: Parser) =>
            p.consume('look at', () =>
            
            p.split([
                () => p.consume('me', 'me'),
                () => p.consume('mewtwo', 'mewtwo'),
                () => p.consume('steven', 'steven'),
                () => p.consume('martha', 'martha')
            ], (who) => 

            who === 'steven'
                ? p.eliminate() :

            p.split([
                () => p.consume('happily', 'happily'),
                () => p.consume('sadly', 'sadly'),
                () => 'neutrally'
            ], (how) =>

            p.submit(() =>

            `You looked at ${who} ${how}`
        )))));

        let command = raw('look at me');

        // Run them using
        Parser.run_thread(command, imperative_style_with_exceptions);
        Parser.run_thread(command, imperative_style_with_explicit_early_returns);
        Parser.run_thread(command, functional_style);
    })

});


