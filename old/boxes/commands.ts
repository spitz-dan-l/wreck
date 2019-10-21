import {Direction, EdgeOperation, EdgeDirection, Face, RelativePosition, RendOperation} from './datatypes';

import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from '../text_tools';

export type HorizPositionWord = 'left' | 'center' | 'right';
export let horiz_position_word_tokens: [HorizPositionWord][] = [['left'], ['center'], ['right']];

export type VertPositionWord = 'top' | 'middle' | 'bottom';
export let vert_position_word_tokens: [VertPositionWord][] = [['top'], ['middle'], ['bottom']];

export type PositionWord = HorizPositionWord | VertPositionWord;
export let word_2_relative_position = new Map<PositionWord, RelativePosition>([
    ['left', RelativePosition.left],
    ['center', RelativePosition.center],
    ['right', RelativePosition.right],
    ['top', RelativePosition.top],
    ['middle', RelativePosition.middle],
    ['bottom', RelativePosition.bottom]
]);
export let position_word_tokens: [PositionWord][] = (<[PositionWord][]>horiz_position_word_tokens).concat(vert_position_word_tokens);

export type FaceWord = 'back' | 'front' | 'right' | 'left' | 'top' | 'bottom';
export let word_2_face = new Map<FaceWord, Face>([
    ['back', Face.n],
    ['front', Face.s],
    ['right', Face.e],
    ['left', Face.w],
    ['top', Face.t],
    ['bottom', Face.b]
]);
export let face_word_tokens: [FaceWord][] = [['back'], ['front'], ['right'], ['left'], ['top'], ['bottom']];

export type RendOpWord = 'remove' | 'replace';
export let word_2_rend_op = new Map<RendOpWord, RendOperation>([
    ['remove', RendOperation.open],
    ['replace', RendOperation.close]
]);
export let rend_op_word_tokens: [RendOpWord][] = [['remove'], ['replace']];

export type DangleOpWord = 'open' | 'close';
export let word_2_dangle_op = new Map<DangleOpWord, RendOperation>([
    ['open', RendOperation.open],
    ['close', RendOperation.close]
]);
export let dangle_op_word_tokens: [DangleOpWord][] = [['open'], ['close']];


export type EdgeOpWord = 'cut' | 'tape';
export let word_2_edge_op = new Map<EdgeOpWord, EdgeOperation>([
    ['cut', EdgeOperation.cut],
    ['tape', EdgeOperation.tape]
]);
export let edge_op_word_tokens: [EdgeOpWord][] = [['cut'], ['tape']];

export type EdgeDirWord = 'horizontally' | 'vertically';
export let word_2_edge_dir = new Map<EdgeDirWord, EdgeDirection>([
    ['horizontally', EdgeDirection.horizontal],
    ['vertically', EdgeDirection.vertical]
]);
export let edge_dir_word_tokens: [EdgeDirWord][] = [['horizontally'], ['vertically']];

export type RotateYDirWord = "left" | "right";
export let word_2_degrees = new Map<RotateYDirWord, number>([
    ['left', 270],
    ['right', 90]
]);
export let rotate_y_word_tokens: [RotateYDirWord][] = [['left'], ['right']];

export type RollDirWord = "forward" | "backward" | "left" | "right";
export let word_2_dir = new Map<RollDirWord, Direction>([
    ['forward', Direction.n],
    ['backward', Direction.s],
    ['left', Direction.w],
    ['right', Direction.e]
]);
export let roll_dir_word_tokens: [RollDirWord][] = [['forward'], ['backward'], ['left'], ['right']];