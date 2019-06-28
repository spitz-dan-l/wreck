import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
/*

    TODO:
    Two "build modes"
    - In the first, Parser uses exceptions for control flow
        still type-safe and results in much cleaner, more readable code
        but slow
    - In the second, Parser uses optional type "ConsumeResult".
        Use ts-morph to transform *all calls* to parser.consume, parser.submit, parser.split, parser.eliminate
        to move the call above the statement where it appears,
        assign it to a const,
        check the value for the error values, and return early on them
        substitute the call for for the const identifier in the expression where it appeared.

        Must also bubble this up to containing functions which call a function that we know
        calls parser.*().

        Also use ts-morph to swap out the parser definitions that have changed.


        If done correctly, this should work seamlessly, allowing me to continue writing
        my more concise code while still getting the ~2x speedup after applything the transformation

*/


// project.addSourceFilesFromTsConfig();
// console.log(project.getCompilerOptions());

// console.log(project.getDirectories());

project.emit();