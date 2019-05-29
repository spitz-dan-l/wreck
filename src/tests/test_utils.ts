import * as assert from 'assert';
import 'babel-polyfill'; // TODO put this somewhere that makes more sense
import 'mocha';
import { begin, chain, deep_equal, lens , tuple } from '../typescript/utils';
import { update, Updater } from '../typescript/update';



describe('update', () => {
    it('typechecks', () => {
        interface T1 {
            a: number,
            b: this,
            c: boolean,
            d: string[],
            e: 'a' | 'b' | 'c'
            f: true
        }

        let x: Updater<boolean> 

        type T2<T extends T1=T1> = {
            a: number,
            b: T
            c: { d: number, e: { f: number }},
            g: () => number
        } & (
            // This is left in as a reminder of weirdness when there are unions
            { h: 'a' | 'b', i: 'a' | 'b' } |
            { h: 'c' | 'd', i: 'c' | 'd' }
        );

        class T3 {
            a: number;
            b: T1;
        }

        function f(t2: T2, x: boolean) {
            if (x) {
                let result = update(t2, {
                    a: 3,
                    b: {
                        a: 3,
                        b: {
                            a: _ => _ +8,
                            c: _ => !_,
                            d: _ => [..._, 'erg'],
                            e: 'b',
                            b: new T3
                        }
                    },
                    g: (old_g) => () => old_g() + 4,
                    h: (x) => 'c' as const, // this works even though it shouldn't?
                    
                })

                let r2 = update(t2, { a: (x) => x  })
            }

            let r3 = update(new T3, {a:7});
        }

       
    });

    it('embedded functions', () => {
        type T = { f: () => number };
        let obj: T = { f: () => 4 };
        let obj2 = update(obj, { f: () => () => 5});
    });


    it('works, idk', () => {
        type T = { a: number, b: { c: number[], d: number }};
        let obj: T  = { a: 1, b: { c: [2,3], d: 5 } };
        // TODO: This does not correctly infer types of updater-function arguments, unless you assert the return type or generic type of the call.
        // have not figured out why/how to get it to work without the assertion.
        let updated = update(obj, { a: 0, b: { c: (_) => [..._, 4] }});

        let expected = { a: 0, b: { c: [2, 3, 4], d: 5 } };
        assert.deepEqual(updated, expected);
    });

    it('tuples', () => {
        type T = { a: [number, number], b: number[] };
        let obj: T = {a: [0,0], b: [1,2,3]};

        let new_b = [2,3,4];
        
        let obj2 = update(obj, {
            // you have to assert tuples, attempted to make inference work and
            // couldn't find a way to do so without breaking function inference 
            a: _ => tuple(3, _[1]), //as [number, number],
            b: new_b
        })
    });

    it('lens version', () => {
        let obj = { a: 1, b: { c: [2,3], d: 5, e: 6 } };

        let objL = lens<typeof obj>();

        let updater = begin<typeof obj>()
            .z(objL.a.set(0))
            .z(objL.b.c.set(_ => [..._, 4]))

        let updated = updater(obj);

        let expected = { a: 0, b: { c: [2, 3, 4], d: 5, e: 6 } };
        assert.deepEqual(updated, expected);

        let updater2 = begin<typeof obj>()
            .z(objL.a.set(0))
            .z(function (o) {
                let bL = objL.b;
                return begin(o)
                    .z(bL.c.set(_ => [..._, 4]))
                    .z(bL.e.set(7))()
            });

        let updated2 = updater2(obj);

        let expected2 = { a: 0, b: { c: [2, 3, 4], d: 5, e: 7 } };

        assert.deepEqual(updated2, expected2);
    });
});

describe('chain', () => {
    it('works', () => {
        let f1 = (a: string) => a + 'horse';
        let f2 = (a: string) => a + 'goat';

        let r1 = chain(f1).z(f2).z(f1).z(f2)('dan');
        assert.equal(r1, 'danhorsegoathorsegoat');

        let f3 = () => 'horse';

        let r2 = chain(f3).z(x => x + 'bleeb')
            ()
        assert.equal(r2, 'horsebleeb');



    });
});

describe('deep_equal', () => {
    it('works', () => {
        deep_equal(
            {a: 4, b: [1,2,3]},
            {a: 4, b: [1,2,3]}
        )
    });
});


