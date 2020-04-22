import { enforce_always_never } from "lib/utils";

export interface StaticGistTypes {
    // 'Sam': [];
    // 'consider': [{subject: ValidTags}];
    // 'abstract description': [{}, {subject: ValidTags}];
    // 'knowledge': [{parent?: ValidTags, child: ValidTags}];

    // 'knowledge1': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge2': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge3': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge4': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge5': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge6': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge7': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge8': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge9': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge0': [{parent?: ValidTags, child: ValidTags}];
    
    // 'knowledge11': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge22': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge33': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge44': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge55': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge66': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge77': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge88': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge99': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge00': [{parent?: ValidTags, child: ValidTags}];

    // 'knowledge111': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge222': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge333': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge444': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge555': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge666': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge777': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge888': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge999': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge000': [{parent?: ValidTags, child: ValidTags}];

    // 'knowledge1111': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge2222': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge3333': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge4444': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge5555': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge6666': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge7777': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge8888': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge9999': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge0000': [{parent?: ValidTags, child: ValidTags}];

    // 'knowledge11111': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge22222': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge33333': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge44444': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge55555': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge66666': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge77777': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge88888': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge99999': [{parent?: ValidTags, child: ValidTags}];
    // 'knowledge00000': [{parent?: ValidTags, child: ValidTags}];

    // 'buh': [{}, {}, {}];
    // 'buh2': string[];
    
}

export type Atom = number | string | symbol | undefined | null | boolean;

enforce_always_never( // Static check that when StaticGistTypes is extended, it is done correctly
    null as (
        { [K in keyof StaticGistTypes]:
            StaticGistTypes[K] extends [] ? never :
            StaticGistTypes[K] extends Array<unknown> ?
                | (StaticGistTypes[K] extends { 0?: object } ?
                    undefined extends StaticGistTypes[K][0] ?
                        [K, 'children property itself cannot be optional/undefined'] :     
                    StaticGistTypes[K][0] extends {[C in string]?: keyof StaticGistTypes} ?
                        never :
                        [K, 'has invalid children:', StaticGistTypes[K][0]] :
                    never
                )
                | (StaticGistTypes[K] extends { 1?: object } ?
                    undefined extends StaticGistTypes[K][1] ?
                        [K, 'parameters property itself cannot be optional/undefined'] :
                    StaticGistTypes[K][1] extends {[C in string]?: Atom} ?
                        never :
                        [K, 'has invalid parameters:', StaticGistTypes[K][1]] :
                    never
                )
                | (StaticGistTypes[K]['length'] extends 0 | 1 | 2 ?
                    never :
                    [K, 'is too long or not a tuple', StaticGistTypes[K]['length']]
                ) :
                [K, 'is not a tuple type. It is', StaticGistTypes[K]]
        }[keyof StaticGistTypes]
    )
);


export type ValidTags = keyof StaticGistTypes;
