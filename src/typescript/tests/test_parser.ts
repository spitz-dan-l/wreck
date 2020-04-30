// import './setup';
import * as assert from 'assert';
import 'mocha';
import { Parsed, Parser, raw, SUBMIT, TokenMatch, ParserThread, traverse_thread, failed } from 'parser';

describe('parser', () => {
    it('should do a thing', () => {
        
        function main_thread(p: Parser) {
            p.consume('look');
            if (p.failure) {
                return p.failure;
            }

            let who = p.split([
                () => p.consume('at me', 'me'),
                () => p.consume('at mewtwo', 'mewtwo'),
                () => p.consume('at mewtwo steve', 'mewtwo steve'),
                () => p.consume('at steven', () => 'steven'),
                () => p.consume('at martha', 'martha'),
                () => p.eliminate()
            ]);

            if (failed(who)) {
                return who;
            }

            if (who === 'steven') {
                return p.eliminate();
            }

            let how = p.split<string>([
                () => p.consume({ tokens: 'happily', used: true}, 'happily'),
                () => p.consume('sadly', 'sadly'),
                () => 'neutrally'
            ]);

            if (failed(how)) {
                return how;
            }

            p.submit();
            if (p.failure) {
                return p.failure;
            }

            return `Looked at ${who} ${how}`;
        }
        // console.log(traverse_thread(main_thread));
        let result = Parser.run_thread(raw('look at me'), main_thread);

        // console.log(result);

        // console.log(result.parsing.view);
        // console.log(array_last(result.parsing.view.matches)!.status);

        let ta = result.parsing.view.typeahead_grid;
        // console.log(ta);
        if (ta.length > 0) {
            // console.log(array_last(ta[0].option));
        }
    });

    it('should do the dsl thing', () => {
        let main_thread: ParserThread<string> = (p) => p.consume([{tokens:"daniel", labels: {keyword: true}}, "didn't", {tokens:"wash", labels: {option: true}}], () => p.submit('unclean'));
        // console.log(traverse_thread(main_thread));
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
                "actual": SUBMIT,
                "expected": {
                    "availability": "Available",
                    "kind": "RawConsumeSpec",
                    "labels": {
                    },
                    "token": SUBMIT
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

                if (failed(meaning)) {
                    return meaning;
                }
                // We want to retroactively eliminate the "fish" sense of the word "fluke".
                if (meaning === 'fish') {
                    return p.eliminate();

                    // (In practice, we might be better served filtering it out of the things passed
                    //  to p.split() above, but the point is, if we haven't factored our parser fragments
                    //  in that way, we don't have to refactor the whole thing.)
                }
                p.submit();
                if (p.failure) {
                    return p.failure;
                }
                return meaning;
            }));

        assert.equal(result.kind, 'Parsed');

        assert.equal((result as Parsed<string>).result, 'coincidence');
    });
});


