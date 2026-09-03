/*
    The classroom: every line the player character says and everything
    Katya says back (SPEC §9), as a script of commands gated by the scene
    the lesson is in, plus `look at the board` and `pick up the chalk`.
    The transcription and mapping of each board live in their own puffers;
    this one moves the lesson between them, opens and closes the boards.
*/
import { ConsumeSpec, GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, ingest, StoryNode, story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { CAMPFIRE, FOREST, HOUSE, STORIES, StorySpec, VOICE_OF_FIRE, WISE_MAN } from '../data';
import { AUTHORED, QUOTED, QuotedKey } from '../data/katya';
import { placed } from '../judge';
import {
    classroom_gist, coda_ops, event_passage, finish_board_ops, open_board_ops, paragraphs, prose_told, reveal_notation_ops,
    show_lesson_board_ops, teach_voices_ops
} from '../board';
import { applied_mapping, board_story, FireWorld, has_said, phrase, SceneId, scene_of } from '../world';

// One line of the script: a command, when it is offered, what it prints, and what it changes.
interface Line {
    command: string;
    scene: SceneId | SceneId[];
    requires?: (w: FireWorld) => boolean;
    says: QuotedKey[];                              // paragraphs printed as the frame's consequence, verbatim
    also?: string[];                                // authored paragraphs printed after them
    shows?: (w: FireWorld) => StoryNode[];          // printed as the frame's description
    board?: (w: FireWorld) => StoryUpdaterSpec[];   // ops on the board
    next?: SceneId;
    then?: (w: FireWorld) => FireWorld;
    locked?: boolean;
}

const in_beat_0: SceneId[] = ['classroom', 'chalk', 'notation', scene_of(CAMPFIRE, 'told'), scene_of(CAMPFIRE, 'ready')];

function applied(story: StorySpec) {
    return (w: FireWorld) => applied_mapping(w, story) !== undefined;
}

// Open a story's board (SPEC §6 `pick up the chalk`): the ¶s in the left
// column, the cursor on the first, no voice yet, the hole inside, and
// every event of the story known to the knowledge tree.
function open_board(story: StorySpec) {
    return (w: FireWorld): FireWorld => update(w, {
        board: story.id,
        cursor: 1,
        remainder: () => undefined,
        voice: () => undefined,
        scene: scene_of(story, 'transcribing'),
        sequences: { [story.id]: () => ({ events: [], finished: false }) },
        knowledge: k => story.events.reduce((acc, e) => ingest(acc, event_passage(story, e)), k),
        story_updates: story_updater(open_board_ops(story, VOICE_OF_FIRE))
    });
}

// Finish the board's sequence (SPEC §6 `say all set`): titled, a chip, the hole back at the root.
function finish_board(story: StorySpec) {
    return (w: FireWorld): FireWorld => update(w, {
        board: () => undefined,
        voice: () => undefined,
        cursor: () => undefined,
        sequences: { [story.id]: { finished: true } },
        collapsed: c => [...c, `${story.id}:chip`],
        story_updates: story_updater(finish_board_ops(story, w.mappings.filter(m => m.sequence === story.id)))
    });
}

const spark_is = (event: number) => (w: FireWorld) => {
    const m = applied_mapping(w, WISE_MAN);
    return m !== undefined && m.pass === 'second' && placed(m, 4) === event;
};

const objections_open = (w: FireWorld) => {
    const m = applied_mapping(w, WISE_MAN);
    return m !== undefined && m.pass === 'second';
};

export const SCRIPT: Line[] = [
    {
        command: 'look at the board', scene: in_beat_0,
        requires: w => !has_said(w, 'look at the board'),
        says: [], also: AUTHORED.shelf
    },
    {
        command: 'listen', scene: 'classroom', says: ['l162', 'l164'],
        board: () => show_lesson_board_ops(VOICE_OF_FIRE), next: 'chalk'
    },
    {
        command: 'listen', scene: 'chalk', says: ['l182'],
        board: () => reveal_notation_ops(), next: 'notation'
    },
    {
        command: 'listen', scene: 'notation', says: ['l218'],
        shows: () => [prose_told(CAMPFIRE)], next: scene_of(CAMPFIRE, 'told')
    },
    {
        command: 'say that the Voice of Fire is contained in this one', scene: scene_of(CAMPFIRE, 'told'),
        says: ['l244', 'l246'], next: scene_of(CAMPFIRE, 'ready')
    },
    { command: 'pick up the chalk', scene: scene_of(CAMPFIRE, 'ready'), says: ['l248'], then: open_board(CAMPFIRE) },
    {
        command: 'say all set', scene: scene_of(CAMPFIRE, 'mapping'), requires: applied(CAMPFIRE),
        says: ['l313', 'l315'], next: scene_of(CAMPFIRE, 'done'), then: finish_board(CAMPFIRE)
    },
    { command: 'listen', scene: scene_of(CAMPFIRE, 'done'), says: [], shows: () => [prose_told(HOUSE)], next: scene_of(HOUSE, 'told') },
    { command: 'say that it is a sad story', scene: scene_of(HOUSE, 'told'), says: ['l344', 'l346'], next: scene_of(HOUSE, 'ready') },
    { command: 'pick up the chalk', scene: scene_of(HOUSE, 'ready'), says: [], then: open_board(HOUSE) },
    {
        // The pause at ¶9 (l. 348): in the family's voice, the children's line cannot be issued.
        command: 'ask what the right thing to do is', scene: scene_of(HOUSE, 'transcribing'),
        requires: w => w.cursor === 9 && !w.taught.includes('voice'),
        says: ['l348', 'l350'], also: [...AUTHORED.voice_switches, ...QUOTED.l350b],
        board: () => teach_voices_ops(),
        then: w => update(w, { taught: _ => [..._, 'voice'] })
    },
    {
        command: 'object that there is no clear tinder', scene: scene_of(HOUSE, 'mapping'),
        requires: w => applied(HOUSE)(w) && !has_said(w, 'object that there is no clear tinder'),
        says: ['l385', 'l387']
    },
    {
        command: 'say that it knows nothing of the morality of the burning either', scene: scene_of(HOUSE, 'mapping'),
        requires: w => applied(HOUSE)(w) && has_said(w, 'object that there is no clear tinder')
            && !has_said(w, 'say that it knows nothing of the morality of the burning either'),
        says: ['l389', 'l391']
    },
    {
        command: 'put down the chalk', scene: scene_of(HOUSE, 'mapping'),
        requires: w => applied(HOUSE)(w) && has_said(w, 'say that it knows nothing of the morality of the burning either'),
        says: ['l393'], next: scene_of(HOUSE, 'done'), then: finish_board(HOUSE)
    },
    { command: 'listen', scene: scene_of(HOUSE, 'done'), says: [], shows: () => [prose_told(FOREST)], next: scene_of(FOREST, 'ready') },
    { command: 'pick up the chalk', scene: scene_of(FOREST, 'ready'), says: [], then: open_board(FOREST) },
    {
        command: 'put down the chalk', scene: scene_of(FOREST, 'mapping'), requires: applied(FOREST),
        says: ['l421'], next: scene_of(FOREST, 'done'), then: finish_board(FOREST)
    },
    { command: 'listen', scene: scene_of(FOREST, 'done'), says: [], shows: () => [prose_told(WISE_MAN)], next: scene_of(WISE_MAN, 'ready') },
    { command: 'pick up the chalk', scene: scene_of(WISE_MAN, 'ready'), says: [], then: open_board(WISE_MAN) },
    {
        command: 'say that the Voice of Fire is contained in just two lines', scene: scene_of(WISE_MAN, 'lined'),
        says: ['l451', 'l453'], next: scene_of(WISE_MAN, 'mapping')
    },
    {
        command: 'ask what she means', scene: scene_of(WISE_MAN, 'mapping'),
        requires: w => applied_mapping(w, WISE_MAN)?.pass === 'first',
        says: ['l467', 'l469'], next: scene_of(WISE_MAN, 'second')
    },
    {
        command: 'object that there is no fire', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && !has_said(w, 'object that there is no fire'),
        says: ['l473', 'l475', 'l477_fire']
    },
    {
        command: 'object that the fireplace is too abstract', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && has_said(w, 'object that there is no fire') && !has_said(w, 'object that the fireplace is too abstract'),
        says: ['l477_abstract']
    },
    {
        command: 'object that the spark is the myth, not the death', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && has_said(w, 'object that the fireplace is too abstract') && spark_is(12)(w) && !spark_said(w),
        says: ['l477_spark']
    },
    {
        command: 'object that the spark is the death, not the myth', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && has_said(w, 'object that the fireplace is too abstract') && spark_is(8)(w) && !spark_said(w),
        says: ['l477_spark']
    },
    {
        command: 'object that the ash is still structured', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && spark_said(w) && !has_said(w, 'object that the ash is still structured'),
        says: ['l477_ash', 'l479']
    },
    {
        command: 'say that you see it', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && has_said(w, 'object that the ash is still structured'),
        says: [], locked: true
    },
    {
        command: 'say Ok, I guess', scene: scene_of(WISE_MAN, 'second'),
        requires: w => objections_open(w) && has_said(w, 'object that the ash is still structured'),
        says: ['l481'], board: () => coda_ops(AUTHORED.coda), next: 'end',
        then: w => update(w, { ended: true })
    }
];

function spark_said(w: FireWorld): boolean {
    return has_said(w, 'object that the spark is the myth, not the death') || has_said(w, 'object that the spark is the death, not the myth');
}

function is_offered(line: Line, w: FireWorld): boolean {
    const scenes = line.scene instanceof Array ? line.scene : [line.scene];
    return scenes.includes(w.scene) && (line.requires === undefined || line.requires(w));
}

// "say that it is a sad story" -> ['say', GAP, 'that_it_is_a_sad_story']: the verb is its own chunk.
// A Locked line keeps its verb Available, so that it shows up (dimmed) once the verb is typed.
function line_spec(command: string, locked: boolean): ConsumeSpec {
    const [verb, ...rest] = command.split(' ');
    if (verb === 'look' || verb === 'listen' || verb === 'pick' || verb === 'put' || verb === 'draw') {
        return { tokens: phrase(command), locked };
    }
    return [verb, GAP, { tokens: phrase(rest.join(' ')), locked }];
}

function say_line(w: FireWorld, line: Line): FireWorld {
    const consequence = [...line.says.flatMap(k => QUOTED[k]), ...(line.also ?? [])];
    let result = update(w, {
        gist: () => classroom_gist(line.command),
        said: _ => [..._, line.command],
        story_updates: story_updater(
            consequence.length > 0 ? S.consequence(paragraphs(consequence)) : [],
            line.shows === undefined ? [] : S.description(line.shows(w)),
            line.board === undefined ? [] : line.board(w)
        )
    });
    if (line.next !== undefined) {
        result = update(result, { scene: line.next });
    }
    if (line.then !== undefined) {
        result = line.then(result);
    }
    return result;
}

export const classroom_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const threads: ParserThread<FireWorld>[] = [];
        for (const line of SCRIPT) {
            if (!is_offered(line, world)) {
                continue;
            }
            threads.push(p =>
                p.consume(line_spec(line.command, !!line.locked), () =>
                p.submit(() => say_line(world, line))));
        }
        return parser.split(threads);
    }
};

// Every story the classroom has told so far is rememberable as a chip once finished; exported for `remember`.
export function finished_stories(w: FireWorld): StorySpec[] {
    return STORIES.filter(s => w.sequences[s.id]?.finished);
}

export { board_story };
