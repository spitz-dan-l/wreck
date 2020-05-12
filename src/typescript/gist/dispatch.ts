import { Gists, gist_to_string } from "./gist";

import { Stages, stages, stage_values } from "lib/stages";
import { Sealable, IsSealed, Seal, OnSealedCallback, OnSealed } from "lib/static_resources";
import { GistPattern, match, PositiveMatchResult } from "./pattern";
import { ValidTags } from "./static_gist_types";

/*
A dispatch system based on gist patterns
    Possible ways of selecting an impl:
        First match (arbitrarily ordered by the author)
        Most-specific match
    Ways of dispatching
        Select a single matching impl to execute
            This is useful for fallthrough-based logic
                The most generic impl might be an "error handler"
            Can't do cooperative dispatch, like multiple effects
            that all get triggered by the same gist
        Select all matches and execute each one
            Can't do fall-through logic because all matches will execute.
        
        ... I think I just have to allow both.

    Most-specific seems like a serious headache.
    Going to start by making it user-controlled.
    Can use Stages internally

    You can dispatch either:
        - single, earliest match
        - all matches, in order

*/

type GistDispatchImpl<V, Tags extends ValidTags=ValidTags> = (g: Gists[Tags]) => V;

type GistPatternDispatchRule<V, Tags extends ValidTags=ValidTags> = {
    pattern: GistPattern<Tags>,
    impl: GistDispatchImpl<V, Tags>
};

export class GistPatternDispatcher<V, Tags extends ValidTags=ValidTags> implements Sealable {
    constructor(public index: Stages<GistPatternDispatchRule<V, Tags>[]> = stages(), public is_sealed = false) {
    }

    callbacks: OnSealedCallback<this>[] = [];

    [IsSealed]() {
        return this.is_sealed;
    }
    [Seal]() {
        if (this[IsSealed]()) {
            throw new Error("Tried to reseal an already-sealed GistPatternDispatcher.");
        }
        this.is_sealed = true;

        this.callbacks.forEach(cb => cb(this));
    }
    [OnSealed](f: OnSealedCallback<this>) {
        this.callbacks.push(f);
    }


    // add_rule<Pat extends GistPattern<Tags>>(pattern: Pat, impl: (g: Gists[Tags & InferPatternTags<Pat>]) => V, stage?: number): this;
    add_rule<Pat extends GistPattern<Tags>>(pattern: Pat, impl: (g: PositiveMatchResult<Pat, Tags>) => V, stage?: number): this;
    add_rule(pattern: GistPattern<Tags>, impl: GistDispatchImpl<V, Tags>, stage=0): this {
        if (this[IsSealed]()) {
            throw new Error('Tried to add a rule to a sealed GistPatternDispatcher.');
        }

        if (!this.index.has(stage)) {
            this.index.set(stage, []);
        }

        // We use unshift so that more recently-added rules will be checked first.
        this.index.get(stage)!.unshift({
            pattern,
            impl
        });

        return this;
    }

    find(g: Gists[Tags]): GistDispatchImpl<V, Tags> | undefined {
        if (!this[IsSealed]()) {
            throw new Error('Tried to call find() on an unsealed GistPatternDispatcher.')
        }
        for (const rules of stage_values(this.index)) {
            for (const rule of rules) {
                if (match(g)(rule.pattern)) {
                    return rule.impl;
                }
            }
        }
        return undefined;
    }

    find_all(g: Gists[Tags], fallthrough_stage?: number): GistDispatchImpl<V, Tags>[] {
        function has_hit_fallthrough(stage: number) {
            return fallthrough_stage !== undefined && stage >= fallthrough_stage;
        }
        
        if (!this[IsSealed]()) {
            throw new Error('Tried to call find_all() on an unsealed GistPatternDispatcher.')
        }
        const result: GistDispatchImpl<V, Tags>[] = [];
        outer: for (const [stage, rules] of (this.index)) {
            if (has_hit_fallthrough(stage) && result.length > 0) {
                break;
            }
            for (const rule of rules) {
                if (match(g)(rule.pattern)) {
                    result.push(rule.impl);
                    if (has_hit_fallthrough(stage)) {
                        break outer;
                    }
                }
            }
        }
        if (result.length === 0) {
            console.log('WARNING: No handlers found during dispatch.');
        }
        return result;
    }

    dispatch(g: Gists[Tags]): V {
        if (!this[IsSealed]()) {
            throw new Error('Tried to call dispatch() on an unsealed GistPatternDispatcher.')
        }
        const impl = this.find(g);

        if (impl === undefined) {
            throw new Error('Could not find a matching rule for gist '+gist_to_string(g));
        }

        return impl(g);
    }
    
    dispatch_all(g: Gists[Tags], fallthrough_stage?: number): V[] {
        if (!this[IsSealed]()) {
            throw new Error('Tried to call dispatch_all() on an unsealed GistPatternDispatcher.')
        }
        return this.find_all(g, fallthrough_stage).map(impl => impl(g));
    }
}


type Updater<T> = (t: T) => T;

export class GistPatternUpdateDispatcher<T, Tags extends ValidTags=ValidTags> extends GistPatternDispatcher<Updater<T>, Tags> {
    apply(g: Gists[Tags], t: T): T {
        if (!this[IsSealed]()) {
            throw new Error('Tried to call apply() on an unsealed GistPatternDispatcher.')
        }
        return this.dispatch(g)(t);
    }

    apply_all(g: Gists[Tags], t: T, fallthrough_stage?: number): T {
        if (!this[IsSealed]()) {
            throw new Error('Tried to call apply_all() on an unsealed GistPatternDispatcher.')
        }
        return this.dispatch_all(g, fallthrough_stage).reduce((prev, impl) => impl(prev), t);
    }
}