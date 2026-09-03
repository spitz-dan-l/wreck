/*
    The classroom: every line the player character says and everything
    Katya says back (SPEC §9), as an ordered script over the beats of the
    lesson (world.ts BEAT), plus `look at the board` and `pick up the chalk`.
    Within a beat the lines come in order: the first unsaid one is offered
    (when its requirement holds); optional lines are offered whenever
    unsaid. A line the character cannot yet say is offered Locked (SPEC
    §0.11): l. 385 until both tinders have been read, each objection while
    the first solution is the lit one, `say that you see it` ever. The
    transcription and mapping of each board live in their own puffers; this
    one moves the lesson between them, opens and closes boards.
*/
import { ConsumeSpec, GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, ingest, StoryNode, story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { CAMPFIRE, FOREST, HOUSE, StorySpec, WISE_MAN } from '../data';
import { AUTHORED, QUOTED, QuotedKey } from '../data/katya';
import { placed } from '../judge';
import {
    classroom_gist, coda_ops, event_passage, finish_board_ops, open_board_ops, paragraphs, prose_told, reveal_notation_ops,
    show_lesson_board_ops, teach_voices_ops
} from '../board';
import {
    applied_mapping, BEAT, classroom_commands, FireWorld, has_said_applied, LESSON_VOICE, mappings_on, phase, phrase, role_history, voice_for
} from '../world';

// One line of the script: a command, when it is offered, what it prints, and what it changes.
interface Line {
    command: string | ((w: FireWorld) => string);   // the wording may depend on the board (the spark objection)
    beat: number | number[];
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
// l. 385 reports having tried both tinders (l. 140): both the rag and the thatch have been the tinder of an applied house mapping.
const both_tinders = (w: FireWorld) => {
    const read = role_history(w, 'tinder').filter(r => r.where === HOUSE.title).map(r => r.what);
    return read.includes('the oil-soaked rag') && read.includes('the thatch');
};

// Open a story's board (SPEC §6 `pick up the chalk`): the ¶s in the left
// column, the cursor on the first, no voice yet, the hole inside, and
// every event of the story known to the knowledge tree.
function open_board(story: StorySpec) {
    return (w: FireWorld): FireWorld => update(w, {
        board: story.id,
        cursor: 1,
        voice: () => undefined,
        sequences: { [story.id]: () => ({ events: [], finished: false }) },
        knowledge: k => story.events.reduce((acc, e) => ingest(acc, event_passage(story, e)), k),
        story_updates: story_updater(open_board_ops(story, voice_for(story), w.collapsed.includes('steps')))
    });
}

// Close the board (SPEC §6 `say all set`, `put down the chalk`): the sequence finished, a chip, the hole back at the root.
function close_board(story: StorySpec) {
    return (w: FireWorld): FireWorld => update(w, {
        board: () => undefined,
        voice: () => undefined,
        cursor: () => undefined,
        sequences: { [story.id]: { finished: true } },
        collapsed: c => [...c, `${story.id}:chip`],
        story_updates: story_updater(finish_board_ops(story, w.mappings.filter(m => m.sequence === story.id)))
    });
}

const told = (story: StorySpec, beat: number): Line =>
    ({ command: 'listen', beat, says: [], shows: () => [prose_told(story)], advances: true });
const pick_up = (story: StorySpec, beat: number, says: QuotedKey[] = []): Line =>
    ({ command: 'pick up the chalk', beat, says, advances: true, then: open_board(story) });

export const SCRIPT: Line[] = [
    { command: 'look at the board', beat: [BEAT.classroom, BEAT.chalk, BEAT.notation, BEAT.campfire_told, BEAT.campfire_ready], optional: true, says: [], also: AUTHORED.shelf },
    { command: 'listen', beat: BEAT.classroom, says: ['l162', 'l164'], board: w => show_lesson_board_ops(LESSON_VOICE, w.collapsed.includes('steps')), advances: true },
    { command: 'listen', beat: BEAT.chalk, says: ['l182'], board: () => reveal_notation_ops(), advances: true },
    { command: 'listen', beat: BEAT.notation, says: ['l218'], shows: () => [prose_told(CAMPFIRE)], advances: true },
    { command: 'say that the Voice of Fire is contained in this one', beat: BEAT.campfire_told, says: ['l244', 'l246'], advances: true },
    pick_up(CAMPFIRE, BEAT.campfire_ready, ['l248']),
    { command: 'say all set', beat: BEAT.campfire, requires: applied(CAMPFIRE), says: ['l313', 'l315'], advances: true, then: close_board(CAMPFIRE) },
    told(HOUSE, BEAT.campfire_done),
    { command: 'say that it is a sad story', beat: BEAT.house_told, says: ['l344', 'l346'], advances: true },
    pick_up(HOUSE, BEAT.house_ready),
    {
        // The pause at ¶9 (l. 348): in the family's voice, the children's line cannot be issued.
        command: 'ask what the right thing to do is', beat: BEAT.house,
        requires: w => phase(w, HOUSE) === 'transcribing' && w.cursor === 9 && !w.taught.includes('voice'),
        says: ['l348', 'l350'], also: [...AUTHORED.voice_switches, ...QUOTED.l350b],
        board: () => teach_voices_ops(),
        then: w => update(w, { taught: _ => [..._, 'voice'] })
    },
    { command: 'object that there is no clear tinder', beat: BEAT.house, requires: w => has_said_applied(w, HOUSE, 'first'), locked: w => !both_tinders(w), says: ['l385', 'l387'] },
    { command: 'say that it knows nothing of the morality of the burning either', beat: BEAT.house, requires: applied(HOUSE), says: ['l389', 'l391'] },
    { command: 'put down the chalk', beat: BEAT.house, requires: applied(HOUSE), says: ['l393'], advances: true, then: close_board(HOUSE) },
    told(FOREST, BEAT.house_done),
    pick_up(FOREST, BEAT.forest_ready),
    { command: 'put down the chalk', beat: BEAT.forest, requires: applied(FOREST), says: ['l421'], advances: true, then: close_board(FOREST) },
    told(WISE_MAN, BEAT.forest_done),
    pick_up(WISE_MAN, BEAT.wise_man_ready),
    {
        command: WISE_MAN.map_after!, beat: BEAT.wise_man,
        requires: w => phase(w, WISE_MAN) === 'lined', says: ['l451', 'l453']
    },
    {
        command: WISE_MAN.set_aside_after!, beat: BEAT.wise_man,
        requires: w => applied_mapping(w, WISE_MAN)?.pass === 'first', says: ['l467', 'l469']
    },
    // The objections (l. 473–477), in the .md's order; the spark's wording follows the second solution's placement.
    { ...objection, command: 'object that there is no fire', says: ['l473', 'l475', 'l477_fire'] },
    { ...objection, command: 'object that the fireplace is too abstract', says: ['l477_abstract'] },
    {
        ...objection,
        command: w => {
            const second = mappings_on(w, WISE_MAN).find(m => m.pass === 'second');
            return second !== undefined && placed(second, 4) === 8
                ? 'object that the spark is the death, not the myth'
                : 'object that the spark is the myth, not the death';
        },
        says: ['l477_spark']
    },
    { ...objection, command: 'object that the ash is still structured', says: ['l477_ash', 'l479'] },
    // After l. 479, whichever solution is lit (SPEC §6).
    { command: 'say that you see it', beat: BEAT.wise_man, optional: true, after: 'object that the ash is still structured', says: [], locked: true },
    { command: 'say Ok, I guess', beat: BEAT.wise_man, says: ['l481'], board: () => coda_ops(AUTHORED.coda), advances: true }
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
        const beats = line.beat instanceof Array ? line.beat : [line.beat];
        if (!beats.includes(w.lesson)) {
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
        gist: () => classroom_gist(command, w.lesson),
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
        const threads: ParserThread<FireWorld>[] = offered(world).map(({ line, command }) => p =>
            p.consume(line_spec(command, typeof line.locked === 'function' ? line.locked(world) : !!line.locked), () =>
            p.submit(() => say_line(world, line, command))));
        return parser.split(threads);
    }
};
