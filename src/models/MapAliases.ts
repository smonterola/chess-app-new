import { Board } from "./Board";
import { Piece } from "./Piece"
import { Position } from "./Position";

export type PieceMap = Map<string, Piece>;
export type PositionMap = Map<string, Position>;
export type BoardMap = Map<string, Board>;
export type PieceCount = Map<string, number>;
//export type Board = [PieceMap, boolean[]];

//export type MapBoard = Map<string, Board>;