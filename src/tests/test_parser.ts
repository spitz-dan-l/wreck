import {
    Parser,
    Token,
    input_display,
    typeahead
} from '../typescript/parser2';

import { array_last } from '../typescript/datatypes';

function test() {
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

    let input: Token[] = ['look', 'at', 'steven'];

    let [result, parses] = Parser.run_thread(main_thread, input);

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
        TODO
        Get rid of auto-option, it needs to be explicit
        Change types of typeahead to support different typeahead styles
            (new, old, locked)
       
        (Way Later) Write a tester that runs through every possible input for a given main_thread,
        to find runtime error states
            - ambiguous parses
            - any other exceptions thrown
    */

}

test()


