/*
    The classroom: every line the player character says and everything
    Katya says back (SPEC §9), as an ordered script over the beats of the
    lesson (world.ts BEAT), plus `look at the board` and `pick up the chalk`.
    Within a beat the lines come in order: the first unsaid one is offered
    (when its requirement holds); optional lines are offered whenever
    unsaid. A line the character cannot yet say is offered Locked (SPEC
    §0.11): l. 385 until both tinders have been read, each objection while
    the first solution is the lit one, `say that you see it` ever. Nothing
    is offered while a chip is expanded with no board open (world.ts
    expanded_chip). The transcription and mapping of each board live in
    their own puffers; this one moves the lesson between them, opens and
    closes boards.
*/
import { ConsumeSpec, GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, ingest, StoryNode, story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { CAMPFIRE, FOREST, HOUSE, STORIES, StorySpec, WISE_MAN } from '../data';
import { AUTHORED, QUOTED, QuotedKey } from '../data/katya';
import { placed } from '../judge';
import {
    chip_ops, classroom_gist, coda_ops, event_passage, finish_board_ops, open_board_ops, paragraphs, prose_told, reveal_notation_ops,
    show_lesson_board_ops, teach_voices_ops
} from '../board';
import {
    applied_mapping, BEAT, classroom_commands, expanded_chip, FireWorld, has_said_applied, LESSON_VOICE, mappings_on, pattern_for, phase, phrase,
    role_history
} from '../world';

// One line of the script: a command, its name for `remember` and its feeling
// (SPEC §10), when it is offered, what it prints, and what it changes.
export interface Line {
    command: string | ((w: FireWorld) => string);   // the wording may depend on the board (the spark objection)
    name: string;                                   // "the saying of all set"
    feeling?: string;                               // "It felt like nothing in particular." unless authored
    beat: number;
    through?: number;                               // offered from `beat` through this beat (`look at the board`)
    optional?: true;                                // offered whenever unsaid; does not hold up the beat's other lines
    after?: string;                                 // (optional lines) offered only once this line has been said
    requires?: (w: FireWorld) => boolean;
    says: QuotedKey[];                              // paragraphs printed as the frame's consequence, verbatim
    also?: string[];                                // authored paragraphs printed after them
    shows?: (w: FireWorld) => StoryNode[];          // printed as the frame's description
    board?: (w: FireWorld) => StoryUpdaterSpec[];   // ops on the board
    advances?: true;                                // moves the lesson to the next beat
    then?: (w: FireWorld) => FireWorld;
    locked?: boolean | ((w: FireWorld) => boolean);   // offered, but not yet sayable
}

const applied = (story: StorySpec) => (w: FireWorld) => applied_mapping(w, story) !== undefined;
const second_lit = (w: FireWorld) => applied_mapping(w, WISE_MAN)?.pass === 'second';
// The objections are offered once the second solution has been applied, and are sayable only while it is the lit one.
const objection = { beat: BEAT.wise_man, requires: (w: FireWorld) => has_said_applied(w, WISE_MAN, 'second'), locked: (w: FireWorld) => !second_lit(w) };
// l. 385 reports having tried both tinders (l. 140): every candidate tinder of the house has been the tinder of an applied house mapping.
const both_tinders = (w: FireWorld) => {
    const pattern = pattern_for(HOUSE);
    const tinders = HOUSE.candidates[pattern.voice.id]!.first![pattern.steps[0].index].map(c => c.derives);
    const read = role_history(w, pattern.steps[0].role).filter(r => r.where === HOUSE.title).map(r => r.what);
    return tinders.every(t => read.includes(t));
};

// Open a story's board (SPEC §6 `pick up the chalk`): the ¶s in the left
// column, the cursor on the first, no voice yet, the hole inside, and
// every event of the story known to the knowledge tree.
function open_board(story: StorySpec) {
    return (w: FireWorld): FireWorld => update(w, {
        board: story.id,
        cursor: 1,
        voice: () => undefined,
        knowledge: k => story.events.reduce((acc, e) => ingest(acc, event_passage(story, e)), k),
        story_updates: story_updater(open_board_ops(story, pattern_for(story), w.collapsed.includes('steps')))
    });
}

// Close the board (SPEC §6 `say all set`, `put down the chalk`): the sequence
// finished, a chip that shows this closing frame (Katya's reply), the hole
// back at the root; every other chip folded, so that with no board open at
// most one is ever expanded.
function close_board(story: StorySpec) {
    return (w: FireWorld): FireWorld => {
        const open_chips = STORIES.filter(s => s !== story && w.finished.includes(s.id) && !w.collapsed.includes(`${s.id}:chip`));
        return update(w, {
            board: () => undefined,
            voice: () => undefined,
            cursor: () => undefined,
            finished: _ => [..._, story.id],
            collapsed: c => [...c, `${story.id}:chip`, ...open_chips.map(s => `${s.id}:chip`)],
            story_updates: story_updater(
                S.frame().css({ closing: true }),
                finish_board_ops(story, mappings_on(w, story)),
                open_chips.map(s => chip_ops(s, true, false))
            )
        });
    };
}

const told = (story: StorySpec, beat: number): Line =>
    ({ command: 'listen', name: 'the listening', beat, says: [], shows: () => [prose_told(story)], advances: true });
const pick_up = (story: StorySpec, beat: number, says: QuotedKey[] = []): Line =>
    ({ command: 'pick up the chalk', name: 'the picking up of the chalk', feeling: 'It felt a bit ordinary, because it was chalk.', beat, says, advances: true, then: open_board(story) });
const put_down = (story: StorySpec, beat: number, says: QuotedKey[]): Line =>
    ({ command: 'put down the chalk', name: 'the putting down of the chalk', beat, requires: applied(story), says, advances: true, then: close_board(story) });

export const SCRIPT: Line[] = [
    { command: 'look at the board', name: 'the looking at the board', beat: BEAT.classroom, through: BEAT.campfire_ready, optional: true, says: [], also: AUTHORED.shelf },
    { command: 'listen', name: 'the listening', beat: BEAT.classroom, says: ['l162', 'l164'], board: () => show_lesson_board_ops(LESSON_VOICE), advances: true },
    { command: 'listen', name: 'the listening', beat: BEAT.chalk, says: ['l182'], board: w => reveal_notation_ops(w.collapsed.includes('steps')), advances: true },
    { command: 'listen', name: 'the listening', beat: BEAT.notation, says: ['l218'], shows: () => [prose_told(CAMPFIRE)], advances: true },
    { command: 'say that the Voice of Fire is contained in this one', name: 'the saying that the Voice of Fire is contained in this one', beat: BEAT.campfire_told, says: ['l244', 'l246'], advances: true },
    pick_up(CAMPFIRE, BEAT.campfire_ready, ['l248']),
    { command: 'say all set', name: 'the saying of all set', beat: BEAT.campfire, requires: applied(CAMPFIRE), says: ['l313', 'l315'], advances: true, then: close_board(CAMPFIRE) },
    told(HOUSE, BEAT.campfire_done),
    { command: 'say that it is a sad story', name: 'the saying that it is a sad story', beat: BEAT.house_told, says: ['l344', 'l346'], advances: true },
    pick_up(HOUSE, BEAT.house_ready),
    {
        // The pause at ¶9 (l. 348): in the family's voice, the children's line cannot be issued.
        command: 'ask what the right thing to do is', name: 'the asking what the right thing to do is', beat: BEAT.house,
        requires: w => phase(w, HOUSE) === 'transcribing' && w.cursor === 9 && !w.taught.includes('voice'),
        says: ['l348', 'l350'], also: [...AUTHORED.voice_switches, ...QUOTED.l350b],
        board: () => teach_voices_ops(),
        then: w => update(w, { taught: _ => [..._, 'voice'] })
    },
    {
        command: 'object that there is no clear tinder', name: 'the objecting that there is no clear tinder', beat: BEAT.house,
        requires: w => has_said_applied(w, HOUSE, 'first'), locked: w => !both_tinders(w), says: ['l385', 'l387']
    },
    {
        command: 'say that it knows nothing of the morality of the burning either', name: 'the saying that it knows nothing of the morality of the burning either',
        beat: BEAT.house, requires: applied(HOUSE), says: ['l389', 'l391']
    },
    put_down(HOUSE, BEAT.house, ['l393']),
    told(FOREST, BEAT.house_done),
    pick_up(FOREST, BEAT.forest_ready),
    put_down(FOREST, BEAT.forest, ['l421']),
    told(WISE_MAN, BEAT.forest_done),
    pick_up(WISE_MAN, BEAT.wise_man_ready),
    {
        command: WISE_MAN.map_after!, name: 'the saying that the Voice of Fire is contained in just two lines', beat: BEAT.wise_man,
        requires: w => phase(w, WISE_MAN) === 'lined', says: ['l451', 'l453']
    },
    {
        command: WISE_MAN.set_aside_after!, name: 'the asking what she means', beat: BEAT.wise_man,
        requires: w => applied_mapping(w, WISE_MAN)?.pass === 'first', says: ['l467', 'l469']
    },
    // The objections (l. 473–477), in the .md's order; the spark's wording follows the second solution's placement.
    { ...objection, command: 'object that there is no fire', name: 'the objecting that there is no fire', says: ['l473', 'l475', 'l477_fire'] },
    { ...objection, command: 'object that the fireplace is too abstract', name: 'the objecting that the fireplace is too abstract', says: ['l477_abstract'] },
    {
        ...objection,
        command: w => {
            const second = mappings_on(w, WISE_MAN).find(m => m.pass === 'second');
            return second !== undefined && placed(second, 4) === 8
                ? 'object that the spark is the death, not the myth'
                : 'object that the spark is the myth, not the death';
        },
        name: 'the objecting about the spark',
        says: ['l477_spark']
    },
    { ...objection, command: 'object that the ash is still structured', name: 'the objecting that the ash is still structured', says: ['l477_ash', 'l479'] },
    // After l. 479, whichever solution is lit (SPEC §6).
    { command: 'say that you see it', name: 'the saying that you see it', beat: BEAT.wise_man, optional: true, after: 'object that the ash is still structured', says: [], locked: true },
    {
        command: 'say Ok, I guess', name: 'the saying of Ok, I guess', feeling: 'It felt a bit untrue, because it was.', beat: BEAT.wise_man,
        says: ['l481'], board: () => coda_ops(AUTHORED.coda), advances: true
    }
];

function command_of(line: Line, w: FireWorld): string {
    return typeof line.command === 'string' ? line.command : line.command(w);
}

// The lines offered now: the beat's first unsaid line, and its unsaid optional lines.
function offered(w: FireWorld): { line: Line, command: string }[] {
    const said = classroom_commands(w);
    const result: { line: Line, command: string }[] = [];
    let blocked = false;
    for (const line of SCRIPT) {
        if (w.lesson < line.beat || w.lesson > (line.through ?? line.beat)) {
            continue;
        }
        const command = command_of(line, w);
        // An optional line is said once for good; "listen" is said once per beat.
        if (said.some(c => c.command === command && (line.optional || c.beat === w.lesson))) {
            continue;
        }
        const ok = line.requires === undefined || line.requires(w);
        if (line.optional) {
            if (ok && (line.after === undefined || said.some(c => c.command === line.after))) {
                result.push({ line, command });
            }
        } else if (!blocked) {
            blocked = true;
            if (ok) {
                result.push({ line, command });
            }
        }
    }
    return result;
}

// "say that it is a sad story" -> ['say', GAP, 'that_it_is_a_sad_story']: the verb is its own chunk.
// A Locked line keeps its verb Available, so that it shows up (dimmed) once the verb is typed.
function line_spec(command: string, locked: boolean): ConsumeSpec {
    const [verb, ...rest] = command.split(' ');
    if (rest.length === 0 || ['look', 'listen', 'pick', 'put', 'draw'].includes(verb)) {
        return { tokens: phrase(command), locked };
    }
    return [verb, GAP, { tokens: phrase(rest.join(' ')), locked }];
}

function say_line(w: FireWorld, line: Line, command: string): FireWorld {
    const consequence = [...line.says.flatMap(k => QUOTED[k]), ...(line.also ?? [])];
    let result = update(w, {
        gist: () => classroom_gist(command, w.lesson, line.name, line.feeling ?? ''),
        lesson: line.advances ? w.lesson + 1 : w.lesson,
        story_updates: story_updater(
            consequence.length > 0 ? S.consequence(paragraphs(consequence)) : [],
            line.shows === undefined ? [] : S.description(line.shows(w)),
            line.board === undefined ? [] : line.board(w)
        )
    });
    if (line.then !== undefined) {
        result = line.then(result);
    }
    return result;
}

export const classroom_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        if (expanded_chip(world) !== undefined) {
            return parser.eliminate();
        }
        const threads: ParserThread<FireWorld>[] = offered(world).map(({ line, command }) => p =>
            p.consume(line_spec(command, typeof line.locked === 'function' ? line.locked(world) : !!line.locked), () =>
            p.submit(() => say_line(world, line, command))));
        return parser.split(threads);
    }
};
