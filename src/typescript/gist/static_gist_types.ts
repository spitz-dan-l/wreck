import { enforce_always_never } from "../lib/utils";

export interface StaticGistTypes {}

type ValidGistKeys = 'parameters' | 'children';

enforce_always_never( // Static check that when StaticGistTypes is extended, it is done correctly
    null as (
        { [K in keyof StaticGistTypes]:
            {} extends StaticGistTypes[K] ? never :
            StaticGistTypes[K] extends object ?
                | (StaticGistTypes[K] extends { children?: object } ?
                    undefined extends StaticGistTypes[K]['children'] ?
                        [K, 'children property itself cannot be optional/undefined'] :     
                    StaticGistTypes[K]['children'] extends {[C in string]?: keyof StaticGistTypes} ?
                        never :
                        [K, 'has invalid children:', StaticGistTypes[K]['children']] :
                    never
                )
                | (StaticGistTypes[K] extends { parameters?: object } ?
                    undefined extends StaticGistTypes[K]['parameters'] ?
                        [K, 'parameters property itself cannot be optional/undefined'] :
                    StaticGistTypes[K]['parameters'] extends {[C in string]?: unknown} ?
                        never :
                        [K, 'has invalid parameters:', StaticGistTypes[K]['parameters']] :
                    never
                )
                | (keyof StaticGistTypes[K] extends ValidGistKeys ?
                    never :
                    [K, 'has extra properties', Exclude<keyof StaticGistTypes[K], ValidGistKeys>]
                ) :
                [K, 'is not an object type. It is', StaticGistTypes[K]]
        }[keyof StaticGistTypes]
    )
);