import {Map} from 'immutable';
import {Direction, EdgeOperation, EdgeDirection, Face, RelativePosition, RendOperation} from './datatypes';

export type Token = string;

export type HorizPositionWord = 'left' | 'center' | 'right';
export type VertPositionWord = 'top' | 'middle' | 'bottom';

export type PositionWord = HorizPositionWord | VertPositionWord;
export let word_2_relative_position = Map<PositionWord, RelativePosition>([
    ['left', RelativePosition.left],
    ['center', RelativePosition.center],
    ['right', RelativePosition.right],
    ['top', RelativePosition.top],
    ['middle', RelativePosition.middle],
    ['bottom', RelativePosition.bottom]
]);

export type FaceWord = 'back' | 'front' | 'right' | 'left' | 'top' | 'bottom';
export let word_2_face = Map<FaceWord, Face>([
    ['back', Face.n],
    ['front', Face.s],
    ['right', Face.e],
    ['left', Face.w],
    ['top', Face.t],
    ['bottom', Face.b]
]);

export type RendOpWord = 'open' | 'close';
export let word_2_rend_op = Map<RendOpWord, RendOperation>([
    ['open', RendOperation.open],
    ['close', RendOperation.close]
]);

export type EdgeOpWord = 'cut' | 'tape';
export let word_2_edge_op = Map<EdgeOpWord, EdgeOperation>([
    ['cut', EdgeOperation.cut],
    ['tape', EdgeOperation.tape]
]);

export type EdgeDirWord = 'horizontally' | 'vertically';
export let word_2_edge_dir = Map<EdgeDirWord, EdgeDirection>([
    ['horizontally', EdgeDirection.horizontal],
    ['vertically', EdgeDirection.vertical]
]);

export type RotateYDirWord = "left" | "right";
export let word_2_degrees = Map<RotateYDirWord, number>([
    ['left', 270],
    ['right', 90]
]);

export type RollDirWord = "forward" | "backward" | "left" | "right";
export let word_2_dir = Map<RollDirWord, Direction>([
    ['forward', Direction.n],
    ['backward', Direction.s],
    ['left', Direction.w],
    ['right', Direction.e]
]);